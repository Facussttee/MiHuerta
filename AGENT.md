# AGENT.md - Contexto Operativo y Guía para Modelos de Inteligencia Artificial

> **Propósito:** Este archivo define el contexto completo, las reglas de arquitectura, los modelos de datos y las convenciones del proyecto **Mi Huerta**. Cualquier agente de IA, modelo de lenguaje (LLM) o nuevo desarrollador que trabaje en este repositorio debe leer este documento antes de generar código o proponer cambios.

---

## 1. Misión del Proyecto

**Mi Huerta** es un sistema digital open-source y de costo cero (\$0/mes) diseñado específicamente para **verdulerías y fruterías de barrio**. 

### El Problema Principal a Resolver
En los comercios de frutas y verduras, la captura y preparación de pedidos vía WhatsApp consume la mayor parte del tiempo del dueño. A diferencia de un almacén tradicional:
1. **Los precios y el stock son volátiles:** Cambian a diario según la oferta del mercado mayorista y el estado de la mercadería.
2. **La mayoría de los productos son pesables:** El total a pagar no se conoce de antemano; se calcula recién cuando el empleado pesa físicamente el producto en la balanza del local.
3. **El dueño es un cuello de botella:** Si el dueño no está en el local, debe llamar a los empleados para averiguar precios o stock, interrumpiendo el despacho continuo.

---

## 2. Los Tres Pilares de la Solución

```mermaid
flowchart LR
    A["1. Catálogo Asistido (Cliente)"] -->|Pedido Estimado| B["2. Mostrador & Balanza (Operario)"]
    B -->|Pesaje Real y Total Exacto| C["3. Notificación & Cobro (WhatsApp)"]
    D["Panel de Precios (Dueño)"] -.->|Actualiza Catálogo| A
```

1. **Catálogo Web Asistido (Cliente):** El cliente entra a través de un link generado por un bot de WhatsApp. Selecciona productos por peso estimado ($500\text{ g}$, $1\text{ kg}$) o unidades/atados. Ve un total estimado transparente y confirma con retiro o delivery.
2. **Pantalla de Mostrador / Balanza (Operario):** Tablero Kanban móvil (`Entrantes`, `Pesando`, `Listos`, `Cobrados`) optimizado para celulares de mostrador. El empleado ingresa el peso real de la balanza en números grandes y el sistema recalcula los subtotales automáticamente. Incluye botón "Sin Stock" para imprevistos.
3. **Cierre de Pedido & WhatsApp:** Al finalizar el pesaje, se calcula el precio final exacto y se emite la notificación al cliente con el desglose del pesaje y datos de pago.

---

## 3. Glosario de Dominio (Conceptos Clave de Verdulería)

* **Pesable (`unidad_medida: "KG"`):** Producto vendido por peso (Papa, Tomate, Banana, Manzana). Requiere ingreso de peso en balanza durante la preparación.
* **Unitario (`unidad_medida: "UNIDAD"`):** Producto vendido por pieza o por atado (Acelga, Espinaca, Sandía entera, Maple de huevos). No requiere pesaje obligatorio, toma la cantidad solicitada directamente.
* **Precio Estimado:** La suma calculada en el carrito del cliente considerando pesos ideales (ej. si pidió $1\text{ kg}$ de tomate a \$2.600, estimado = \$2.600).
* **Precio Real / Final:** La suma matemática exacta tras medir en balanza física (ej. pesó $1.150\text{ kg}$ $\rightarrow$ \$2.990).
* **Merma / Sin Stock:** Fruta o verdura que se agotó en el cajón o no tiene calidad suficiente para la venta. El operario debe poder anularla del pedido con un toque sin cancelar el resto.

---

## 4. Estructura de Archivos del Proyecto

```
d:\Escritorio\miHuerta\
├── AGENT.md                 # [ESTE ARCHIVO] Contexto operativo para IAs
├── README.md                # Presentación general e instrucciones de uso
├── index.html               # Punto de entrada único con simulador de roles
├── css/
│   └── style.css            # Tipografía, animaciones y touch optimization
├── js/
│   ├── bundle.js            # Script unificado y autónomo (funciona vía file:/// y web)
│   ├── app.js               # Enrutador de vistas (SPA)
│   ├── store.js             # Estado reactivo, localStorage, Web Audio API y eventos
│   ├── products-data.js     # Catálogo base y categorías
│   └── views/
│       ├── client.js        # Vista Catálogo Cliente y Seguimiento en vivo
│       ├── operator.js      # Vista Kanban mostrador y módulo de balanza
│       └── admin.js         # Vista Administrador de precios del dueño
└── docs/
    ├── 01_VISION_Y_ALCANCE.md      # Visión de negocio, métricas y roadmap
    ├── 02_PITCH_Y_COMERCIO.md      # Guion para hablar con el dueño del local
    ├── 03_ARQUITECTURA_Y_DATOS.md  # Especificación técnica, ERD y stack $0
    └── 04_FLUJOS_Y_CASOS_BORDE.md  # Casos de uso detallados y contingencias
```

---

## 5. Modelo de Datos Canónico

Todo desarrollo futuro debe apegarse a estas cuatro entidades principales:

### `clientes`
```typescript
interface Cliente {
  id: string;               // UUID o identificador único
  telefono: string;         // WhatsApp del cliente (clave primaria funcional, ej: "1123456789")
  nombre: string;           // Nombre para saludarlo y etiquetar la bolsa
  direccion?: string;       // Dirección habitual para agilizar envíos
}
```

### `productos`
```typescript
interface Producto {
  id: string;               // ej: "prod-9"
  nombre: string;           // ej: "Tomate Redondo Premium"
  categoria: string;        // "Frutas" | "Verduras" | "Hojas Verdes" | "Almacén"
  unidad_medida: "KG" | "UNIDAD";
  precio: number;           // Precio por kg o por unidad
  disponible: boolean;      // Switch para prender/apagar stock en 1 toque
  paso?: number;            // Incremento en carrito (0.25, 0.5, 1.0)
  icono?: string;           // Emoji identificador
}
```

### `pedidos`
```typescript
interface Pedido {
  id: number;               // Número correlativo visible (ej: 101, 102)
  cliente: Cliente;
  tipo_entrega: "RETIRO" | "DELIVERY";
  direccion_entrega: string;
  estado: "PENDIENTE" | "EN_PREPARACION" | "LISTO" | "ENTREGADO";
  fecha: string;            // ISO 8601
  total_estimado: number;   // Calculado en carrito
  total_real: number | null;// Calculado post-pesaje
  items: PedidoItem[];
}
```

### `pedido_items`
```typescript
interface PedidoItem {
  producto_id: string;
  nombre: string;
  icono: string;
  unidad_medida: "KG" | "UNIDAD";
  precio_unitario: number;       // Precio al momento de pedir (congelado)
  cantidad_solicitada: number;   // Lo que pidió el cliente (kg o unidades)
  peso_real: number | null;      // Lo que pesó la balanza física
  subtotal: number;              // Calculado dinámicamente
  sin_stock: boolean;            // Marcado por el operario si no hay
}
```

---

## 6. Reglas de Diseño y Principios Obligatorios

Cualquier IA o desarrollador que modifique el código debe respetar estrictamente:

1. **Touch-friendly y Mobile-First:** El empleado de la verdulería opera con el teléfono en el mostrador. Los botones deben tener al menos $44\times 44\text{ px}$, inputs numéricos grandes y contrastes altos.
2. **Compatibilidad Local Directa:** El prototipo debe poder ejecutarse haciendo doble clic en `index.html` (protocolo `file:///`) sin requerir un build step previo obligatorio ni servidores externos para demostraciones. Por esta razón se mantiene `js/bundle.js` actualizado junto a los módulos.
3. **Resiliencia de Pesaje:** El sistema **nunca** debe asumir que el cliente pagará el total estimado. Toda la arquitectura está pensada alrededor del evento de pesaje en mostrador.
4. **Costo Cero (\$0/mes):** No introducir dependencias comerciales pagas (como Twilio o WhatsApp Cloud API de pago). Las integraciones cloud deben mantenerse dentro de las capas gratuitas de **Supabase** y **Vercel**, y la integración con WhatsApp mediante librerías de conexión Web QR (**Baileys**).
5. **Flexibilidad Operativa de Pedidos:** El operario en mostrador debe poder cancelar o eliminar pedidos cancelados, quitar ítems individuales que el cliente se arrepienta de llevar, sumar productos de último momento y corregir la dirección o modalidad de entrega.

---

## 7. Instrucciones para Agentes al Realizar Tareas

* **Al agregar productos:** Verificar que pertenezcan a una categoría existente y que especifiquen si se venden por `KG` o por `UNIDAD`.
* **Al modificar la pantalla del operario:** Priorizar la rapidez de carga de datos sobre la complejidad visual. Menos clics = más eficiencia en el mostrador.
* **Al actualizar la lógica de estado:** Asegurarse de que el paso a `LISTO` recalcule el `total_real` sumando únicamente los ítems que **no** estén marcados como `sin_stock`.
