/**
 * ============================================================================
 * MI HUERTA - SERVICIO CONECTOR DE WHATSAPP (BAILEYS + SUPABASE REALTIME)
 * ============================================================================
 * Responsabilidades:
 * 1. Conectar al WhatsApp de la verdulería mediante código QR local.
 * 2. Responder al primer mensaje del cliente con su link personalizado (?tel=...)
 *    y aplicar una ventana de silencio (Cooldown) de 3 horas para no molestar
 *    si el cliente sigue conversando con el dueño.
 * 3. Escuchar en tiempo real la tabla "pedidos" de Supabase: cuando el operario
 *    en la balanza pasa un pedido a estado "LISTO", enviar automáticamente
 *    el detalle pesado ítem por ítem, el total exacto y el Alias de pago.
 */

import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";
import { createClient } from "@supabase/supabase-js";
import qrcode from "qrcode-terminal";
import pino from "pino";
import dotenv from "dotenv";

dotenv.config();

// Configuración desde variables de entorno (.env)
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";
const CATALOG_WEB_URL = (process.env.CATALOG_WEB_URL || "http://localhost:3000").replace(/\/$/, "");
const COOLDOWN_MINUTES = Number(process.env.COOLDOWN_MINUTES || 180);
const PAYMENT_ALIAS = process.env.PAYMENT_ALIAS || "mihuerta.verduras";

// Mapa en memoria para controlar la ventana de silencio (Cooldown) por número
// Estructura: Map<phoneNumber, timestampLastSent>
const customerCooldowns = new Map();

// Inicializar cliente Supabase si las credenciales están presentes
const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

if (!supabase) {
  console.warn(
    "[AVISO] No se detectaron SUPABASE_URL o SUPABASE_ANON_KEY en el archivo .env.\n" +
      "El bot responderá con el link del catálogo, pero no podrá escuchar pedidos 'LISTO' en tiempo real hasta configurar Supabase."
  );
}

// Formatear número de WhatsApp (ej: "5491123456789@s.whatsapp.net" -> "1123456789")
function extractLocalPhone(jid) {
  const digits = jid.split("@")[0].replace(/\D/g, "");
  if (digits.startsWith("549") && digits.length >= 12) {
    return digits.slice(3);
  }
  if (digits.startsWith("54") && digits.length >= 11) {
    return digits.slice(2);
  }
  return digits;
}

// Formatear teléfono local a JID de WhatsApp Argentina
function toWhatsAppJid(phone) {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.startsWith("549")) {
    return `${digits}@s.whatsapp.net`;
  }
  return `549${digits}@s.whatsapp.net`;
}

// Construir el mensaje final con el pesaje real de balanza
function buildOrderReadyMessage(order) {
  const items = Array.isArray(order.items) ? order.items : [];
  const activeItems = items.filter((i) => !i.sin_stock);
  const outOfStockItems = items.filter((i) => i.sin_stock);

  const lines = activeItems.map((i) => {
    const unit = i.unidad_medida === "KG" ? "kg" : "u";
    const peso = i.peso_real !== null && i.peso_real !== undefined ? i.peso_real : i.cantidad_solicitada;
    const sub = Number(i.subtotal || 0).toLocaleString("es-AR");
    return `- ${i.nombre} (${peso} ${unit}): $${sub}`;
  });

  if (outOfStockItems.length > 0) {
    outOfStockItems.forEach((i) => {
      lines.push(`- ${i.nombre}: Sin stock disponible hoy ($0)`);
    });
  }

  const totalExacto = Number(order.total_real || order.total_estimado || 0).toLocaleString("es-AR");
  const entregaInfo =
    order.tipo_entrega === "DELIVERY"
      ? `Modalidad: Envío a domicilio (${order.direccion_entrega})`
      : "Modalidad: Ya podés pasar a retirarlo por el mostrador del local.";

  return (
    `¡Hola ${order.cliente_nombre || ""}! Tu pedido #${order.id} en *Mi Huerta* ya fue pesado y está listo:\n\n` +
    `${lines.join("\n")}\n\n` +
    `*Total exacto en balanza: $${totalExacto}*\n` +
    `${entregaInfo}\n\n` +
    `Alias para transferir: *${PAYMENT_ALIAS}*\n` +
    `_(O podés abonar en efectivo al recibir)_`
  );
}

async function startWhatsAppBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth_info_baileys");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: "silent" })
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("\n========================================================");
      console.log(" ESCANEÁ ESTE CÓDIGO QR DESDE EL WHATSAPP DE LA VERDULERÍA");
      console.log(" (Menú -> Dispositivos vinculados -> Vincular dispositivo)");
      console.log("========================================================\n");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`[CONEXIÓN CERRADA] Código: ${statusCode}. Reconectando: ${shouldReconnect}`);
      if (shouldReconnect) {
        setTimeout(startWhatsAppBot, 3000);
      } else {
        console.log("Sesión cerrada desde el teléfono. Borrá la carpeta auth_info_baileys para volver a escanear.");
      }
    } else if (connection === "open") {
      console.log("\n[OK] Bot de WhatsApp Mi Huerta conectado y activo.");
      setupSupabaseRealtimeListener(sock);
    }
  });

  // 1. Escuchar mensajes entrantes de clientes
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const remoteJid = msg.key.remoteJid || "";
      // Ignorar grupos y estados de difusión
      if (remoteJid.endsWith("@g.us") || remoteJid === "status@broadcast") continue;

      const localPhone = extractLocalPhone(remoteJid);
      const now = Date.now();
      const lastSent = customerCooldowns.get(localPhone) || 0;
      const cooldownMs = COOLDOWN_MINUTES * 60 * 1000;

      // Si ya le enviamos el link hace menos de COOLDOWN_MINUTES, guardamos silencio
      // para permitir que hable con el dueño sin que el bot interrumpa
      if (now - lastSent < cooldownMs) {
        console.log(`[COOLDOWN ACTIVO] Mensaje de ${localPhone} ignorado por el bot (ventana de silencio activa).`);
        continue;
      }

      customerCooldowns.set(localPhone, now);
      const personalCatalogLink = `${CATALOG_WEB_URL}/?tel=${localPhone}`;

      const welcomeText =
        `¡Hola! Bienvenido a *Verdulería Mi Huerta*.\n\n` +
        `Armá tu pedido del día con los precios actualizados entrando directamente a tu catálogo acá:\n` +
        `👉 ${personalCatalogLink}\n\n` +
        `_Elegí lo que necesites y apenas lo pesemos en la balanza del local te avisamos por acá con el importe exacto._`;

      try {
        await sock.sendMessage(remoteJid, { text: welcomeText });
        console.log(`[LINK ENVIADO] Catálogo enviado a ${localPhone}: ${personalCatalogLink}`);
      } catch (err) {
        console.error(`[ERROR] No se pudo enviar mensaje a ${localPhone}:`, err.message);
      }
    }
  });
}

// 2. Suscribirse en tiempo real a los pedidos que pasan a estado "LISTO" en Supabase
let realtimeChannel = null;

function setupSupabaseRealtimeListener(sock) {
  if (!supabase) return;

  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
  }

  console.log("[REALTIME] Escuchando pedidos listos en Supabase...");

  realtimeChannel = supabase
    .channel("bot-pedidos-listos")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "pedidos"
      },
      async (payload) => {
        const nuevo = payload.new;
        const anterior = payload.old;

        // Disparar mensaje cuando cambia a LISTO y aún no fue notificado
        if (nuevo && nuevo.estado === "LISTO" && (!anterior || anterior.estado !== "LISTO") && !nuevo.notificado_whatsapp) {
          const phone = nuevo.cliente_telefono;
          if (!phone) return;

          const jid = toWhatsAppJid(phone);
          const summaryText = buildOrderReadyMessage(nuevo);

          try {
            await sock.sendMessage(jid, { text: summaryText });
            console.log(`[PEDIDO #${nuevo.id} NOTIFICADO] Resumen de balanza enviado por WhatsApp a ${phone}`);

            // Marcar como notificado en Supabase para evitar envíos duplicados
            await supabase
              .from("pedidos")
              .update({ notificado_whatsapp: true })
              .eq("id", nuevo.id);
          } catch (err) {
            console.error(`[ERROR] Falló el envío del resumen del pedido #${nuevo.id}:`, err.message);
          }
        }
      }
    )
    .subscribe();
}

startWhatsAppBot();
