import { store } from "../store.js";

export function renderOperatorView(container) {
  let activeTab = "PENDIENTE"; // PENDIENTE | EN_PREPARACION | LISTO | ENTREGADO

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
      <div class="max-w-xl mx-auto pb-28">
        <!-- Header del Mostrador -->
        <header class="sticky top-0 z-20 bg-slate-950 text-white px-4 py-3 border-b border-slate-800 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2">
                <h1 class="font-black text-sm tracking-widest uppercase">Mostrador & Balanza</h1>
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <p class="text-[11px] text-slate-400">Recepción y control de pedidos en tiempo real</p>
            </div>

            <!-- Botón para probar timbre -->
            <button 
              id="btn-test-sound" 
              class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-300 text-xs font-semibold border border-slate-700 transition tap-feedback"
            >
              Timbre de prueba
            </button>
          </div>

          <!-- Pestañas del Kanban (Mobile-First) -->
          <div class="grid grid-cols-4 gap-1 mt-3 bg-slate-900 p-1 rounded-xl text-center border border-slate-800">
            <button 
              data-tab="PENDIENTE" 
              class="tab-btn py-2 px-1 rounded-lg text-xs font-bold transition flex flex-col items-center gap-0.5 ${
                activeTab === "PENDIENTE" ? "bg-amber-400 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
              }"
            >
              <span>Entrantes</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === "PENDIENTE" ? "bg-amber-600/30 text-slate-950" : "bg-slate-800 text-slate-400"
              }">${counts.PENDIENTE}</span>
            </button>

            <button 
              data-tab="EN_PREPARACION" 
              class="tab-btn py-2 px-1 rounded-lg text-xs font-bold transition flex flex-col items-center gap-0.5 ${
                activeTab === "EN_PREPARACION" ? "bg-blue-500 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }"
            >
              <span>En Balanza</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === "EN_PREPARACION" ? "bg-blue-700 text-white" : "bg-slate-800 text-slate-400"
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
                activeTab === "LISTO" ? "bg-emerald-700/30 text-slate-950" : "bg-slate-800 text-slate-400"
              }">${counts.LISTO}</span>
            </button>

            <button 
              data-tab="ENTREGADO" 
              class="tab-btn py-2 px-1 rounded-lg text-xs font-bold transition flex flex-col items-center gap-0.5 ${
                activeTab === "ENTREGADO" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
              }"
            >
              <span>Cobrados</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400">${counts.ENTREGADO}</span>
            </button>
          </div>
        </header>

        <!-- Contenido de la columna activa -->
        <main class="p-4">
          ${renderTabContent(orders)}
        </main>
      </div>
    `;

    // Listeners del header
    container.querySelector("#btn-test-sound")?.addEventListener("click", () => {
      store.playAudioAlert();
    });

    container.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeTab = btn.dataset.tab;
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
        <div class="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-6">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Sin órdenes</span>
          <h3 class="font-bold text-slate-700 text-sm">No hay pedidos en esta columna</h3>
          <p class="text-xs text-slate-400 mt-1">Los nuevos pedidos ingresarán automáticamente aquí en tiempo real.</p>
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
                .map((i) => `${i.cantidad_solicitada}${i.unidad_medida === "KG" ? "kg" : "u"} ${i.nombre}`)
                .join(" · ");

              return `
              <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm transition">
                <div class="flex items-start justify-between">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-base font-black text-slate-900">#${order.id}</span>
                      <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        order.tipo_entrega === "DELIVERY"
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-700"
                      }">
                        ${order.tipo_entrega === "DELIVERY" ? "Envío a Domicilio" : "Retiro en Local"}
                      </span>
                    </div>
                    <h3 class="font-extrabold text-slate-900 text-sm mt-1.5">${order.cliente.nombre}</h3>
                    <p class="text-xs text-slate-400">${order.cliente.telefono} · ${timeAgo(order.fecha)}</p>
                  </div>
                  <div class="text-right">
                    <span class="text-[10px] text-slate-400 block font-bold uppercase">Estimado</span>
                    <span class="font-black text-base text-slate-900">$${order.total_estimado.toLocaleString("es-AR")}</span>
                  </div>
                </div>

                <!-- Resumen de productos -->
                <div class="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                  <span class="font-bold text-slate-700 block mb-0.5 text-[11px] uppercase tracking-wider">Productos solicitados:</span>
                  <p class="leading-relaxed">${itemsList}</p>
                </div>

                <!-- Botón de Acción -->
                <button 
                  data-start-id="${order.id}" 
                  class="btn-start-prep w-full mt-3 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider shadow-sm transition tap-feedback flex items-center justify-center gap-2"
                >
                  <span>Tomar y Pesar en Balanza</span>
                  <span>›</span>
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
        <div class="space-y-4">
          ${tabOrders
            .map((order) => {
              const currentTotal = order.items
                .filter((i) => !i.sin_stock)
                .reduce((sum, i) => sum + (i.peso_real !== null ? i.subtotal : i.cantidad_solicitada * i.precio_unitario), 0);

              return `
              <div class="bg-white rounded-3xl p-4 sm:p-5 border-2 border-blue-200/80 shadow-md">
                <!-- Header de la tarjeta -->
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span class="text-[10px] font-black text-blue-600 tracking-widest uppercase">Pesaje Activo</span>
                    <h2 class="text-lg font-black text-slate-900">Pedido #${order.id} · ${order.cliente.nombre}</h2>
                    <p class="text-xs text-slate-400">
                      ${order.tipo_entrega === "DELIVERY" ? order.direccion_entrega : "Retira en mostrador"}
                    </p>
                  </div>
                  <div class="text-right">
                    <span class="text-[10px] text-slate-400 uppercase font-bold block">Total en Balanza</span>
                    <span class="text-xl font-black text-emerald-700">$${Math.round(currentTotal).toLocaleString("es-AR")}</span>
                  </div>
                </div>

                <!-- Lista de Pesaje Ítem por Ítem -->
                <div class="mt-4 space-y-2.5">
                  ${order.items
                    .map((item, idx) => {
                      const isWeight = item.unidad_medida === "KG";
                      const currentVal = item.peso_real !== null ? item.peso_real : "";
                      const subtotalItem = item.peso_real !== null ? item.subtotal : Math.round(item.cantidad_solicitada * item.precio_unitario);

                      return `
                      <div class="p-3 rounded-2xl border transition ${
                        item.sin_stock
                          ? "bg-rose-50 border-rose-200 opacity-60"
                          : item.peso_real !== null
                          ? "bg-emerald-50/50 border-emerald-300"
                          : "bg-slate-50 border-slate-200"
                      }">
                        <div class="flex items-start justify-between gap-2">
                          <div class="flex-1 min-w-0">
                            <span class="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200">
                              ${item.categoria || (isWeight ? "Por Kilo" : "Por Unidad")}
                            </span>
                            <h4 class="font-extrabold text-slate-900 text-sm mt-1 truncate ${item.sin_stock ? "line-through text-rose-600" : ""}">
                              ${item.nombre}
                            </h4>
                            <p class="text-xs text-slate-500 mt-0.5">
                              Solicitó: <strong class="text-slate-800">${item.cantidad_solicitada} ${isWeight ? "kg" : "u."}</strong>
                              · ($${item.precio_unitario}/${isWeight ? "kg" : "u"})
                            </p>
                          </div>

                          <!-- Botón Sin Stock -->
                          <button 
                            data-toggle-stock-order="${order.id}"
                            data-item-index="${idx}"
                            class="btn-toggle-stock text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border transition tap-feedback ${
                              item.sin_stock
                                ? "bg-rose-600 text-white border-rose-600"
                                : "bg-white text-slate-600 border-slate-300 hover:text-rose-600"
                            }"
                          >
                            ${item.sin_stock ? "Anulado" : "Sin Stock"}
                          </button>
                        </div>

                        ${
                          !item.sin_stock
                            ? `
                          <div class="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between gap-3">
                            <div class="flex items-center gap-2 flex-1">
                              <label class="text-xs font-bold text-slate-700 shrink-0">
                                ${isWeight ? "Peso Balanza:" : "Cantidad Real:"}
                              </label>
                              <div class="relative flex-1 max-w-[150px]">
                                <input 
                                  type="number" 
                                  inputmode="decimal"
                                  step="${isWeight ? "0.01" : "1"}"
                                  min="0"
                                  data-order-id="${order.id}"
                                  data-item-idx="${idx}"
                                  value="${currentVal}"
                                  placeholder="${item.cantidad_solicitada}"
                                  class="input-weight w-full text-center py-2 px-2 bg-white border-2 rounded-xl font-black text-sm text-slate-900 outline-none focus:border-blue-600 ${
                                    item.peso_real !== null ? "border-emerald-500 text-emerald-800 bg-emerald-50/20" : "border-slate-300"
                                  }"
                                />
                                <span class="absolute right-2.5 top-2.5 text-xs font-bold text-slate-400 pointer-events-none">
                                  ${isWeight ? "kg" : "u."}
                                </span>
                              </div>
                            </div>

                            <div class="text-right shrink-0">
                              <span class="text-[9px] text-slate-400 block font-bold uppercase">Subtotal</span>
                              <span class="font-black text-sm text-slate-900">$${subtotalItem.toLocaleString("es-AR")}</span>
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

                <!-- Cierre de Pesaje -->
                <div class="mt-4 pt-3 border-t border-slate-100">
                  <button 
                    data-finish-order-id="${order.id}"
                    class="btn-finish-weighing w-full bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-black py-3.5 px-4 rounded-xl shadow-lg shadow-slate-900/10 text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition tap-feedback"
                  >
                    <span>Finalizar Pesaje y Notificar al Cliente</span>
                    <span>›</span>
                  </button>
                </div>
              </div>
            `;
            })
            .join("")}
        </div>
      `;
    }

    // 3. Pestaña LISTOS
    if (activeTab === "LISTO") {
      return `
        <div class="space-y-4">
          ${tabOrders
            .map((order) => {
              const waMessage = encodeURIComponent(generateWhatsAppSummary(order));
              const waLink = `https://wa.me/549${order.cliente.telefono}?text=${waMessage}`;

              return `
              <div class="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm">
                <div class="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span class="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Pesaje Completo
                    </span>
                    <h3 class="text-base font-black text-slate-900 mt-1">#${order.id} · ${order.cliente.nombre}</h3>
                    <p class="text-xs text-slate-500">${order.cliente.telefono} · ${order.tipo_entrega}</p>
                  </div>
                  <div class="text-right">
                    <span class="text-[10px] text-slate-400 block font-bold uppercase">Total Exacto</span>
                    <span class="font-black text-2xl text-emerald-700">$${(order.total_real || order.total_estimado).toLocaleString("es-AR")}</span>
                  </div>
                </div>

                <!-- Vista previa del mensaje de WhatsApp -->
                <div class="mt-3 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-700 font-mono whitespace-pre-line leading-relaxed">
                  ${generateWhatsAppSummary(order)}
                </div>

                <div class="grid grid-cols-2 gap-2 mt-4">
                  <a 
                    href="${waLink}" 
                    target="_blank"
                    class="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition text-center tap-feedback"
                  >
                    <span>Enviar WhatsApp</span>
                    <span>›</span>
                  </a>
                  <button 
                    data-deliver-order-id="${order.id}"
                    class="btn-deliver-order bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-bold py-3 px-3 rounded-xl text-xs transition tap-feedback"
                  >
                    Marcar Cobrado
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
        <div class="space-y-2.5">
          ${tabOrders
            .map(
              (order) => `
            <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">#${order.id}</span>
                <h4 class="font-extrabold text-slate-900 text-sm">${order.cliente.nombre}</h4>
                <p class="text-xs text-slate-400">${order.tipo_entrega} · ${timeAgo(order.fecha)}</p>
              </div>
              <div class="text-right">
                <span class="font-black text-base text-slate-900">$${(order.total_real || order.total_estimado).toLocaleString("es-AR")}</span>
                <span class="block text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Cobrado</span>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      `;
    }
  }

  // Generador de mensaje de WhatsApp (sin emojis, profesional y directo)
  function generateWhatsAppSummary(order) {
    const itemsLines = order.items
      .filter((i) => !i.sin_stock)
      .map((i) => `* ${i.nombre} (${i.peso_real} ${i.unidad_medida === "KG" ? "kg" : "u"}): $${i.subtotal}`)
      .join("\n");

    const total = order.total_real || order.total_estimado;

    return `Hola ${order.cliente.nombre}. Tu pedido #${order.id} en Mi Huerta ya fue pesado y está listo:

${itemsLines}

Total exacto en balanza: $${total.toLocaleString("es-AR")}
${order.tipo_entrega === "DELIVERY" ? "El cadete está coordinado con tu dirección de entrega." : "Ya podés pasar a retirarlo por el mostrador."}

Alias para transferir: mihuerta.verduras
(O podés abonar en efectivo al recibir).`;
  }

  // --- Attach Event Listeners ---
  function attachActions(orders) {
    container.querySelectorAll(".btn-start-prep").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.startId);
        store.updateOrderStatus(id, "EN_PREPARACION");
        activeTab = "EN_PREPARACION";
        update();
      });
    });

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

    container.querySelectorAll(".btn-toggle-stock").forEach((btn) => {
      btn.addEventListener("click", () => {
        const orderId = Number(btn.dataset.toggleStockOrder);
        const itemIdx = Number(btn.dataset.itemIndex);
        store.toggleItemOutOfStock(orderId, itemIdx);
      });
    });

    container.querySelectorAll(".btn-finish-weighing").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.finishOrderId);
        store.finalizeOrderWeighing(id);
        activeTab = "LISTO";
        update();
      });
    });

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

  const unsubscribe = store.subscribe((event) => {
    if (event === "orders_changed" || event === "order_created" || event === "storage_sync") {
      update();
    }
  });

  update();
  return () => unsubscribe();
}
