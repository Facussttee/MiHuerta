import { store } from "../store.js";

export function renderOperatorView(container) {
  let activeTab = "PENDIENTE"; // PENDIENTE | EN_PREPARACION | LISTO | ENTREGADO
  let selectedOrderId = null; // Pedido abierto en pantalla de pesaje completo

  function update() {
    container.innerHTML = "";
    const orders = store.getOrders();

    const counts = {
      PENDIENTE: orders.filter((o) => o.estado === "PENDIENTE").length,
      EN_PREPARACION: orders.filter((o) => o.estado === "EN_PREPARACION").length,
      LISTO: orders.filter((o) => o.estado === "LISTO").length,
      ENTREGADO: orders.filter((o) => o.estado === "ENTREGADO").length
    };

    container.innerHTML = `
      <div class="max-w-2xl mx-auto pb-24">
        <!-- Header del Mostrador -->
        <header class="sticky top-0 z-20 bg-slate-900 text-white px-4 py-3 shadow-md">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-lg">
                ⚖️
              </span>
              <div>
                <h1 class="font-extrabold text-base leading-tight">Mostrador & Pesaje</h1>
                <p class="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Recepción en tiempo real activa
                </p>
              </div>
            </div>

            <!-- Botón para probar sonido de alerta -->
            <button 
              id="btn-test-sound" 
              title="Probar sonido de pedido" 
              class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
            >
              <span>🔔</span> Probar timbre
            </button>
          </div>

          <!-- Pestañas del Kanban (Mobile-First) -->
          <div class="grid grid-cols-4 gap-1.5 mt-3 bg-slate-800/80 p-1 rounded-xl text-center">
            <button 
              data-tab="PENDIENTE" 
              class="tab-btn py-2 px-1 rounded-lg text-xs font-bold transition flex flex-col items-center gap-0.5 ${
                activeTab === "PENDIENTE" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
              }"
            >
              <span>Entrantes</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === "PENDIENTE" ? "bg-amber-700/30 text-slate-950" : "bg-slate-700 text-slate-300"
              }">${counts.PENDIENTE}</span>
            </button>

            <button 
              data-tab="EN_PREPARACION" 
              class="tab-btn py-2 px-1 rounded-lg text-xs font-bold transition flex flex-col items-center gap-0.5 ${
                activeTab === "EN_PREPARACION" ? "bg-blue-500 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }"
            >
              <span>Pesando</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === "EN_PREPARACION" ? "bg-blue-700 text-white" : "bg-slate-700 text-slate-300"
              }">${counts.EN_PREPARACION}</span>
            </button>

            <button 
              data-tab="LISTO" 
              class="tab-btn py-2 px-1 rounded-lg text-xs font-bold transition flex flex-col items-center gap-0.5 ${
                activeTab === "LISTO" ? "bg-emerald-500 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
              }"
            >
              <span>Listos</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === "LISTO" ? "bg-emerald-700/30 text-slate-950" : "bg-slate-700 text-slate-300"
              }">${counts.LISTO}</span>
            </button>

            <button 
              data-tab="ENTREGADO" 
              class="tab-btn py-2 px-1 rounded-lg text-xs font-bold transition flex flex-col items-center gap-0.5 ${
                activeTab === "ENTREGADO" ? "bg-slate-600 text-white" : "text-slate-400 hover:text-white"
              }"
            >
              <span>Cobrados</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-slate-300">${counts.ENTREGADO}</span>
            </button>
          </div>
        </header>

        <!-- Contenido según la pestaña activa -->
        <main class="p-4">
          ${renderTabContent(orders)}
        </main>
      </div>
    `;

    // Listeners del header
    container.querySelector("#btn-test-sound").addEventListener("click", () => {
      store.playAudioAlert();
    });

    container.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeTab = btn.dataset.tab;
        selectedOrderId = null;
        update();
      });
    });

    attachActions(orders);
  }

  // --- Render según Pestaña ---
  function renderTabContent(orders) {
    const tabOrders = orders.filter((o) => o.estado === activeTab);

    if (tabOrders.length === 0) {
      return `
        <div class="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
          <span class="text-4xl block mb-2">🌿</span>
          <h3 class="font-bold text-gray-700 text-base">No hay pedidos en esta columna</h3>
          <p class="text-xs text-gray-400 mt-1">Los nuevos pedidos que hagan los clientes aparecerán acá solos.</p>
        </div>
      `;
    }

    // 1. Pestaña PENDIENTES
    if (activeTab === "PENDIENTE") {
      return `
        <div class="space-y-3">
          ${tabOrders
            .map((order) => {
              const itemsList = order.items
                .map((i) => `${i.icono} ${i.cantidad_solicitada}${i.unidad_medida === "KG" ? "kg" : "u"} ${i.nombre}`)
                .join(", ");

              return `
              <div class="bg-white rounded-2xl p-4 border-2 border-amber-200 shadow-sm hover:shadow-md transition">
                <div class="flex items-start justify-between">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-lg font-black text-slate-900">#${order.id}</span>
                      <span class="px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        order.tipo_entrega === "DELIVERY"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-emerald-100 text-emerald-800"
                      }">
                        ${order.tipo_entrega === "DELIVERY" ? "🛵 Delivery" : "🏪 Retiro"}
                      </span>
                    </div>
                    <h3 class="font-bold text-gray-900 text-base mt-1">${order.cliente.nombre}</h3>
                    <p class="text-xs text-gray-400">${order.cliente.telefono} • ${timeAgo(order.fecha)}</p>
                  </div>
                  <div class="text-right">
                    <span class="text-xs text-gray-400 block font-medium">Estimado</span>
                    <span class="font-black text-lg text-slate-800">$${order.total_estimado.toLocaleString("es-AR")}</span>
                  </div>
                </div>

                <!-- Resumen de productos -->
                <div class="mt-3 p-2.5 bg-gray-50 rounded-xl text-xs text-gray-600 line-clamp-2">
                  <strong>Productos:</strong> ${itemsList}
                </div>

                <!-- Botón de Acción -->
                <button 
                  data-start-id="${order.id}" 
                  class="btn-start-prep w-full mt-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-black py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <span>Tomar y Pesar en Balanza</span>
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </button>
              </div>
            `;
            })
            .join("")}
        </div>
      `;
    }

    // 2. Pestaña EN PREPARACIÓN (Módulo de Pesaje en Balanza)
    if (activeTab === "EN_PREPARACION") {
      return `
        <div class="space-y-6">
          ${tabOrders
            .map((order) => {
              const currentTotal = order.items
                .filter((i) => !i.sin_stock)
                .reduce((sum, i) => sum + (i.peso_real !== null ? i.subtotal : i.cantidad_solicitada * i.precio_unitario), 0);

              return `
              <div class="bg-white rounded-3xl p-4 sm:p-5 border-2 border-blue-200 shadow-md">
                <!-- Header de la tarjeta -->
                <div class="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <span class="text-xs font-black text-blue-600 tracking-wider uppercase">En Balanza</span>
                    <h2 class="text-xl font-black text-gray-900">Pedido #${order.id} • ${order.cliente.nombre}</h2>
                    <p class="text-xs text-gray-400">
                      ${order.tipo_entrega === "DELIVERY" ? `🛵 ${order.direccion_entrega}` : "🏪 Retira en mostrador"}
                    </p>
                  </div>
                  <div class="text-right">
                    <span class="text-[11px] text-gray-400 uppercase font-bold block">Total Actual</span>
                    <span class="text-2xl font-black text-emerald-700">$${Math.round(currentTotal).toLocaleString("es-AR")}</span>
                  </div>
                </div>

                <!-- Lista de Pesaje Ítem por Ítem -->
                <div class="mt-4 space-y-3">
                  ${order.items
                    .map((item, idx) => {
                      const isWeight = item.unidad_medida === "KG";
                      const currentVal = item.peso_real !== null ? item.peso_real : "";
                      const subtotalItem = item.peso_real !== null ? item.subtotal : Math.round(item.cantidad_solicitada * item.precio_unitario);

                      return `
                      <div class="p-3.5 rounded-2xl border transition ${
                        item.sin_stock
                          ? "bg-red-50 border-red-200 opacity-60"
                          : item.peso_real !== null
                          ? "bg-emerald-50/60 border-emerald-300"
                          : "bg-gray-50 border-gray-200"
                      }">
                        <div class="flex items-start justify-between gap-2">
                          <div class="flex items-center gap-2.5">
                            <span class="text-3xl">${item.icono}</span>
                            <div>
                              <h4 class="font-extrabold text-gray-900 text-sm ${item.sin_stock ? "line-through text-red-500" : ""}">${item.nombre}</h4>
                              <p class="text-xs text-gray-500">
                                Pidió: <strong class="text-gray-800">${item.cantidad_solicitada} ${isWeight ? "kg" : "unid."}</strong> 
                                • ($${item.precio_unitario}/${isWeight ? "kg" : "u"})
                              </p>
                            </div>
                          </div>

                          <!-- Botón Sin Stock -->
                          <button 
                            data-toggle-stock-order="${order.id}"
                            data-item-index="${idx}"
                            class="btn-toggle-stock text-[11px] font-bold px-2 py-1 rounded-lg border transition ${
                              item.sin_stock
                                ? "bg-red-600 text-white border-red-600"
                                : "bg-white text-gray-500 border-gray-300 hover:text-red-600"
                            }"
                          >
                            ${item.sin_stock ? "Anulado" : "Sin Stock"}
                          </button>
                        </div>

                        ${
                          !item.sin_stock
                            ? `
                          <!-- Controles de Pesaje -->
                          <div class="mt-3 pt-2.5 border-t border-gray-200/60 flex items-center justify-between gap-3">
                            <div class="flex items-center gap-1.5 flex-1">
                              <label class="text-xs font-bold text-gray-600 shrink-0">
                                ${isWeight ? "Peso Balanza:" : "Cantidad Real:"}
                              </label>
                              <div class="relative flex-1 max-w-[140px]">
                                <input 
                                  type="number" 
                                  step="${isWeight ? "0.01" : "1"}"
                                  min="0"
                                  data-order-id="${order.id}"
                                  data-item-idx="${idx}"
                                  value="${currentVal}"
                                  placeholder="${item.cantidad_solicitada}"
                                  class="input-weight w-full text-center py-1.5 px-2 bg-white border-2 rounded-xl font-black text-base text-gray-900 outline-none focus:border-blue-500 ${
                                    item.peso_real !== null ? "border-emerald-500 text-emerald-800 bg-emerald-50/30" : "border-gray-300"
                                  }"
                                />
                                <span class="absolute right-2 top-2 text-xs font-bold text-gray-400">
                                  ${isWeight ? "kg" : "u."}
                                </span>
                              </div>
                            </div>

                            <!-- Subtotal de este producto -->
                            <div class="text-right shrink-0">
                              <span class="text-[10px] text-gray-400 block">Subtotal</span>
                              <span class="font-black text-sm text-gray-800">$${subtotalItem.toLocaleString("es-AR")}</span>
                            </div>
                          </div>
                        `
                            : ""
                        }
                      </div>
                    `;
                    })
                    .join("")}
                </div>

                <!-- Botón de Cierre de Pesaje -->
                <div class="mt-5 pt-3 border-t border-gray-100 flex gap-2">
                  <button 
                    data-finish-order-id="${order.id}"
                    class="btn-finish-weighing flex-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-700/20 text-sm flex items-center justify-center gap-2 transition"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                    <span>Finalizar Pesaje y Avisar al Cliente</span>
                  </button>
                </div>
              </div>
            `;
            })
            .join("")}
        </div>
      `;
    }

    // 3. Pestaña LISTOS (Esperando retiro o envío + WhatsApp simulado)
    if (activeTab === "LISTO") {
      return `
        <div class="space-y-4">
          ${tabOrders
            .map((order) => {
              const waMessage = encodeURIComponent(generateWhatsAppSummary(order));
              const waLink = `https://wa.me/549${order.cliente.telefono}?text=${waMessage}`;

              return `
              <div class="bg-white rounded-3xl p-4 sm:p-5 border-2 border-emerald-200 shadow-sm">
                <div class="flex items-start justify-between">
                  <div>
                    <span class="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      Pesaje Completo ✓
                    </span>
                    <h3 class="text-lg font-black text-gray-900 mt-1">#${order.id} - ${order.cliente.nombre}</h3>
                    <p class="text-xs text-gray-500">${order.cliente.telefono} • ${order.tipo_entrega}</p>
                  </div>
                  <div class="text-right">
                    <span class="text-xs text-gray-400 block font-medium">Total Exacto</span>
                    <span class="font-black text-2xl text-emerald-700">$${(order.total_real || order.total_estimado).toLocaleString("es-AR")}</span>
                  </div>
                </div>

                <!-- Vista previa del mensaje de WhatsApp -->
                <div class="mt-3 p-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-xs text-gray-700 font-mono whitespace-pre-line">
                  ${generateWhatsAppSummary(order)}
                </div>

                <div class="grid grid-cols-2 gap-2 mt-4">
                  <a 
                    href="${waLink}" 
                    target="_blank"
                    class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition text-center"
                  >
                    <span>📲</span> Abrir WhatsApp
                  </a>
                  <button 
                    data-deliver-order-id="${order.id}"
                    class="btn-deliver-order bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition"
                  >
                    Marcar Entregado / Cobrado
                  </button>
                </div>
              </div>
            `;
            })
            .join("")}
        </div>
      `;
    }

    // 4. Pestaña ENTREGADOS
    if (activeTab === "ENTREGADO") {
      return `
        <div class="space-y-3">
          ${tabOrders
            .map(
              (order) => `
            <div class="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm opacity-80 flex items-center justify-between">
              <div>
                <h4 class="font-bold text-gray-900 text-sm">#${order.id} - ${order.cliente.nombre}</h4>
                <p class="text-xs text-gray-400">${order.tipo_entrega} • ${timeAgo(order.fecha)}</p>
              </div>
              <div class="text-right">
                <span class="font-black text-base text-gray-800">$${(order.total_real || order.total_estimado).toLocaleString("es-AR")}</span>
                <span class="block text-[10px] text-emerald-600 font-bold uppercase">Cobrado</span>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      `;
    }
  }

  // Generador del texto que el robot o el verdulero manda por WhatsApp
  function generateWhatsAppSummary(order) {
    const itemsLines = order.items
      .filter((i) => !i.sin_stock)
      .map((i) => `• ${i.nombre} (${i.peso_real} ${i.unidad_medida === "KG" ? "kg" : "u"}): $${i.subtotal}`)
      .join("\n");

    const total = order.total_real || order.total_estimado;

    return `¡Hola ${order.cliente.nombre}! 🍎 Tu pedido #${order.id} ya está listo y pesado:

${itemsLines}

👉 Total exacto a abonar: $${total.toLocaleString("es-AR")}
${order.tipo_entrega === "DELIVERY" ? "🛵 El cadete ya está en camino a tu dirección." : "🏪 Te esperamos por el local para retirar."}

Alias para transferir: mihuerta.verduras
(O podés pagar en efectivo al recibir)`;
  }

  // --- Attach Event Listeners ---
  function attachActions(orders) {
    // Pasar a preparación
    container.querySelectorAll(".btn-start-prep").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.startId);
        store.updateOrderStatus(id, "EN_PREPARACION");
        activeTab = "EN_PREPARACION";
        update();
      });
    });

    // Inputs de peso en balanza
    container.querySelectorAll(".input-weight").forEach((input) => {
      input.addEventListener("change", (e) => {
        const orderId = Number(e.target.dataset.orderId);
        const itemIdx = Number(e.target.dataset.itemIdx);
        const val = e.target.value.trim();
        if (val !== "") {
          store.updateItemWeight(orderId, itemIdx, Number(val));
        }
      });
    });

    // Toggle Sin Stock
    container.querySelectorAll(".btn-toggle-stock").forEach((btn) => {
      btn.addEventListener("click", () => {
        const orderId = Number(btn.dataset.toggleStockOrder);
        const itemIdx = Number(btn.dataset.itemIndex);
        store.toggleItemOutOfStock(orderId, itemIdx);
      });
    });

    // Finalizar pesaje
    container.querySelectorAll(".btn-finish-weighing").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.finishOrderId);
        store.finalizeOrderWeighing(id);
        activeTab = "LISTO";
        update();
      });
    });

    // Entregar / Cobrar
    container.querySelectorAll(".btn-deliver-order").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.deliverOrderId);
        store.updateOrderStatus(id, "ENTREGADO");
        update();
      });
    });
  }

  function timeAgo(dateString) {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
    if (diff < 1) return "Hace instantes";
    if (diff === 1) return "Hace 1 min";
    if (diff < 60) return `Hace ${diff} min`;
    return `Hace ${Math.floor(diff / 60)} hs`;
  }

  // Suscripción al store
  const unsubscribe = store.subscribe((event) => {
    if (event === "orders_changed" || event === "order_created" || event === "storage_sync") {
      update();
    }
  });

  update();

  return () => unsubscribe();
}
