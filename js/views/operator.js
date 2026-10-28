import { store } from "../store.js";

export function renderOperatorView(container) {
  let activeTab = "PENDIENTE"; // PENDIENTE | EN_PREPARACION | LISTO | ENTREGADO
  let editingOrderId = null; // ID del pedido que se está editando en modal
  let addingProductOrderId = null; // ID del pedido que tiene abierto el desplegable de agregar ítem

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
        <!-- Header del Mostrador con sticky-header-offset -->
        <header class="sticky sticky-header-offset z-20 bg-slate-900 text-white px-4 py-3 shadow-md">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Puesto de Balanza</span>
              <h1 class="font-extrabold text-sm leading-tight text-white">Mostrador & Balanza</h1>
              <p class="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Recepción en vivo activa
              </p>
            </div>

            <!-- Botón para probar sonido de alerta -->
            <button 
              id="btn-test-sound" 
              title="Probar timbre de pedido" 
              class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition tap-feedback"
            >
              <span>Probar timbre</span>
            </button>
          </div>

          <!-- Pestañas del Kanban (Mobile-First) -->
          <div class="grid grid-cols-4 gap-1.5 mt-3 bg-slate-800/80 p-1 rounded-xl text-center">
            <button 
              data-tab="PENDIENTE" 
              class="tab-btn py-2 px-1 rounded-lg text-xs font-bold transition flex flex-col items-center gap-0.5 tap-feedback ${
                activeTab === "PENDIENTE" ? "bg-amber-400 text-slate-950 shadow-xs" : "text-slate-400 hover:text-white"
              }"
            >
              <span>Entrantes</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === "PENDIENTE" ? "bg-amber-600/30 text-slate-950 font-black" : "bg-slate-700 text-slate-300"
              }">${counts.PENDIENTE}</span>
            </button>

            <button 
              data-tab="EN_PREPARACION" 
              class="tab-btn py-2 px-1 rounded-lg text-xs font-bold transition flex flex-col items-center gap-0.5 tap-feedback ${
                activeTab === "EN_PREPARACION" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
              }"
            >
              <span>En Balanza</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === "EN_PREPARACION" ? "bg-blue-800 text-white font-black" : "bg-slate-700 text-slate-300"
              }">${counts.EN_PREPARACION}</span>
            </button>

            <button 
              data-tab="LISTO" 
              class="tab-btn py-2 px-1 rounded-lg text-xs font-bold transition flex flex-col items-center gap-0.5 tap-feedback ${
                activeTab === "LISTO" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
              }"
            >
              <span>Listos</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === "LISTO" ? "bg-emerald-800 text-white font-black" : "bg-slate-700 text-slate-300"
              }">${counts.LISTO}</span>
            </button>

            <button 
              data-tab="ENTREGADO" 
              class="tab-btn py-2 px-1 rounded-lg text-xs font-bold transition flex flex-col items-center gap-0.5 tap-feedback ${
                activeTab === "ENTREGADO" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
              }"
            >
              <span>Cobrados</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-300">${counts.ENTREGADO}</span>
            </button>
          </div>
        </header>

        <!-- Contenido según la pestaña activa -->
        <main class="p-4">
          ${renderTabContent(orders)}
        </main>

        <!-- Modal de Edición de Pedido -->
        ${editingOrderId ? renderEditModal(orders.find((o) => o.id === editingOrderId)) : ""}
      </div>
    `;

    // Listeners del header
    container.querySelector("#btn-test-sound")?.addEventListener("click", () => {
      store.playAudioAlert();
    });

    container.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (navigator.vibrate) { try { navigator.vibrate(10); } catch {} }
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
              <div class="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs transition">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-base font-black text-slate-900">#${order.id}</span>
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
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
                    <span class="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Estimado</span>
                    <span class="font-black text-base text-slate-900">$${order.total_estimado.toLocaleString("es-AR")}</span>
                  </div>
                </div>

                <!-- Resumen de productos solicitados -->
                <div class="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                  <span class="font-bold text-slate-700 block mb-0.5 text-[11px] uppercase tracking-wider">Productos solicitados (${order.items.length}):</span>
                  <p class="leading-relaxed">${itemsList || "Sin productos"}</p>
                </div>

                <!-- Acciones Principales y de Gestión -->
                <div class="mt-3 space-y-2">
                  <button 
                    data-start-id="${order.id}" 
                    class="btn-start-prep w-full min-h-[46px] bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-950 font-black py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-xs transition tap-feedback flex items-center justify-center gap-2"
                  >
                    <span>Tomar y Pesar en Balanza</span>
                  </button>

                  <div class="grid grid-cols-2 gap-2">
                    <button 
                      data-edit-order-id="${order.id}"
                      class="btn-open-edit min-h-[40px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition tap-feedback"
                    >
                      <span>Editar datos</span>
                    </button>
                    <button 
                      data-delete-order-id="${order.id}"
                      class="btn-cancel-order min-h-[40px] bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition tap-feedback"
                    >
                      <span>Cancelar pedido</span>
                    </button>
                  </div>
                </div>
              </div>
            `;
            })
            .join("")}
        </div>
      `;
    }

    // 2. Pestaña EN PREPARACIÓN (Módulo de Pesaje en Balanza)
    if (activeTab === "EN_PREPARACION") {
      const activeProducts = store.getProducts().filter((p) => p.disponible);

      return `
        <div class="space-y-4">
          ${tabOrders
            .map((order) => {
              const currentTotal = order.items
                .filter((i) => !i.sin_stock)
                .reduce((sum, i) => sum + (i.peso_real !== null ? i.subtotal : Math.round(i.cantidad_solicitada * i.precio_unitario)), 0);

              const isAddingProduct = addingProductOrderId === order.id;

              return `
              <div class="bg-white rounded-3xl p-4 sm:p-5 border-2 border-blue-200/80 shadow-md">
                
                <!-- Header de la tarjeta -->
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span class="text-[10px] font-black text-blue-600 tracking-widest uppercase">Pesaje Activo</span>
                    <h2 class="text-lg font-black text-slate-900">Pedido #${order.id} · ${order.cliente.nombre}</h2>
                    <p class="text-xs text-slate-400">
                      ${order.tipo_entrega === "DELIVERY" ? order.direccion_entrega : "Retiro por mostrador"}
                    </p>
                  </div>
                  <div class="text-right">
                    <span class="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Total en Balanza</span>
                    <span id="order-balanza-total-${order.id}" class="text-2xl font-black text-emerald-700">$${Math.round(currentTotal).toLocaleString("es-AR")}</span>
                  </div>
                </div>

                <!-- Lista de Pesaje Ítem por Ítem -->
                <div class="mt-4 space-y-2.5">
                  ${
                    order.items.length === 0
                      ? `
                    <div class="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      No hay productos en este pedido. Podés agregar uno abajo.
                    </div>
                  `
                      : order.items
                          .map((item, idx) => {
                            const isWeight = item.unidad_medida === "KG";
                            const currentVal = item.peso_real !== null ? item.peso_real : "";
                            const subtotalItem = item.peso_real !== null ? item.subtotal : Math.round(item.cantidad_solicitada * item.precio_unitario);
                            const stepFine = isWeight ? 0.1 : 1;

                            return `
                      <div class="item-weigh-card p-3 rounded-2xl border transition ${
                        item.sin_stock
                          ? "bg-rose-50 border-rose-200 opacity-60"
                          : item.peso_real !== null
                          ? "bg-emerald-50/50 border-emerald-300"
                          : "bg-slate-50 border-slate-200"
                      }">
                        <div class="flex items-start justify-between gap-2">
                          <div class="flex-1 min-w-0">
                            <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                              ${item.categoria || (isWeight ? "Por Kilo" : "Por Unidad")}
                            </span>
                            <h4 class="font-extrabold text-slate-900 text-sm mt-1 truncate ${item.sin_stock ? "line-through text-rose-600" : ""}">
                              ${item.nombre}
                            </h4>
                            <p class="text-xs text-slate-500 mt-0.5">
                              Solicitó: <strong class="text-slate-800 font-bold">${item.cantidad_solicitada} ${isWeight ? "kg" : "u."}</strong>
                              · ($${item.precio_unitario.toLocaleString("es-AR")} / ${isWeight ? "kg" : "u"})
                            </p>
                          </div>

                          <!-- Acciones por ítem: Sin Stock y Quitar -->
                          <div class="flex items-center gap-1.5 shrink-0">
                            <button 
                              data-toggle-stock-order="${order.id}"
                              data-item-index="${idx}"
                              class="btn-toggle-stock min-h-[36px] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border transition tap-feedback ${
                                item.sin_stock
                                  ? "bg-rose-600 text-white border-rose-600"
                                  : "bg-white text-slate-600 border-slate-300 hover:text-rose-600"
                              }"
                              title="Marcar sin disponibilidad en el cajón"
                            >
                              ${item.sin_stock ? "Anulado" : "Sin Stock"}
                            </button>

                            <button 
                              data-remove-item-order="${order.id}"
                              data-item-index="${idx}"
                              class="btn-remove-item min-h-[36px] px-2.5 py-1 text-slate-400 hover:text-rose-600 text-xs font-bold rounded-lg hover:bg-rose-50 transition tap-feedback"
                              title="Eliminar este ítem del pedido"
                            >
                              Quitar
                            </button>
                          </div>
                        </div>

                        ${
                          !item.sin_stock
                            ? `
                          <div class="mt-3 pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
                            <div class="flex items-center gap-1.5 flex-1 min-w-[200px]">
                              <label class="text-xs font-bold text-slate-700 shrink-0">
                                ${isWeight ? "Peso:" : "Cant:"}
                              </label>

                              <!-- Controles de ajuste fino (-0.1 / +0.1) -->
                              <button
                                type="button"
                                data-adjust-order="${order.id}"
                                data-item-idx="${idx}"
                                data-delta="${-stepFine}"
                                class="btn-adjust-weight w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 rounded-lg text-sm font-black transition tap-feedback shrink-0"
                                title="Restar ${stepFine}"
                              >
                                −
                              </button>

                              <div class="relative flex-1 max-w-[110px]">
                                <input 
                                  type="number" 
                                  inputmode="decimal"
                                  step="${isWeight ? "0.01" : "1"}"
                                  min="0"
                                  data-order-id="${order.id}"
                                  data-item-idx="${idx}"
                                  data-price-unit="${item.precio_unitario}"
                                  value="${currentVal}"
                                  placeholder="${item.cantidad_solicitada}"
                                  class="input-weight w-full text-center py-2 px-2 bg-white border-2 rounded-xl font-black text-base text-slate-900 outline-none focus:border-blue-600 transition ${
                                    item.peso_real !== null ? "border-emerald-500 text-emerald-800 bg-emerald-50/20" : "border-slate-300"
                                  }"
                                />
                                <span class="absolute right-2 top-2 text-xs font-bold text-slate-400 pointer-events-none select-none">
                                  ${isWeight ? "kg" : "u."}
                                </span>
                              </div>

                              <button
                                type="button"
                                data-adjust-order="${order.id}"
                                data-item-idx="${idx}"
                                data-delta="${stepFine}"
                                class="btn-adjust-weight w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 rounded-lg text-sm font-black transition tap-feedback shrink-0"
                                title="Sumar ${stepFine}"
                              >
                                +
                              </button>

                              <!-- Botón rápido para copiar lo solicitado -->
                              <button 
                                type="button"
                                data-copy-requested-order="${order.id}"
                                data-item-idx="${idx}"
                                data-requested-val="${item.cantidad_solicitada}"
                                class="btn-copy-requested text-[10px] font-bold px-2 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-lg transition tap-feedback shrink-0"
                                title="Copiar cantidad solicitada"
                              >
                                = ${item.cantidad_solicitada}
                              </button>
                            </div>

                            <div class="text-right shrink-0">
                              <span class="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Subtotal</span>
                              <span id="item-subtotal-${order.id}-${idx}" class="font-black text-sm text-slate-900">$${subtotalItem.toLocaleString("es-AR")}</span>
                            </div>
                          </div>
                        `
                            : ""
                        }
                      </div>
                    `;
                          })
                          .join("")
                  }
                </div>

                <!-- Módulo para Agregar Producto al Pedido -->
                <div class="mt-3">
                  ${
                    isAddingProduct
                      ? `
                    <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-800 uppercase tracking-wide">Sumar producto al pedido</span>
                        <button id="btn-close-add-product" class="text-xs text-slate-400 hover:text-slate-700 font-bold px-2 py-1">Cerrar</button>
                      </div>

                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label class="block text-[11px] font-bold text-slate-600 mb-1">Producto</label>
                          <select id="select-new-product" class="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-base font-semibold outline-none focus:border-blue-600">
                            ${activeProducts
                              .map(
                                (p) => `
                              <option value="${p.id}" data-unit="${p.unidad_medida}" data-price="${p.precio}">
                                ${p.nombre} ($${p.precio.toLocaleString("es-AR")}/${p.unidad_medida === "KG" ? "kg" : "u"})
                              </option>
                            `
                              )
                              .join("")}
                          </select>
                        </div>

                        <div>
                          <label class="block text-[11px] font-bold text-slate-600 mb-1">Cantidad / Peso inicial</label>
                          <div class="flex gap-2">
                            <input 
                              type="number" 
                              id="input-new-quantity" 
                              value="1.0" 
                              step="0.5" 
                              min="0.1" 
                              class="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-base font-black text-center outline-none focus:border-blue-600"
                            />
                            <button 
                              data-confirm-add-order="${order.id}"
                              class="btn-confirm-add-item bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 rounded-xl text-xs transition tap-feedback shrink-0"
                            >
                              Agregar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  `
                      : `
                    <button 
                      data-toggle-add-order="${order.id}"
                      class="btn-open-add-product w-full py-2.5 px-3 border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 tap-feedback"
                    >
                      <span>Agregar producto que olvidó el cliente</span>
                    </button>
                  `
                  }
                </div>

                <!-- Cierre de Pesaje y Acciones Secundarias -->
                <div class="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <button 
                    data-finish-order-id="${order.id}"
                    class="btn-finish-weighing w-full min-h-[48px] bg-slate-950 hover:bg-slate-900 active:bg-black text-white font-black py-3 px-4 rounded-xl shadow-lg shadow-slate-950/15 text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition tap-feedback"
                  >
                    <span>Finalizar Pesaje y Notificar al Cliente</span>
                  </button>

                  <div class="grid grid-cols-2 gap-2">
                    <button 
                      data-edit-order-id="${order.id}"
                      class="btn-open-edit min-h-[40px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition tap-feedback"
                    >
                      <span>Cambiar entrega/datos</span>
                    </button>

                    <button 
                      data-delete-order-id="${order.id}"
                      class="btn-cancel-order min-h-[40px] bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition tap-feedback"
                    >
                      <span>Cancelar pedido</span>
                    </button>
                  </div>
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
              const waSummary = generateWhatsAppSummary(order);
              const waMessage = encodeURIComponent(waSummary);
              const waLink = `https://wa.me/549${order.cliente.telefono}?text=${waMessage}`;

              return `
              <div class="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
                <div class="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Pesaje Completo
                    </span>
                    <h3 class="text-base font-black text-slate-900 mt-1">#${order.id} · ${order.cliente.nombre}</h3>
                    <p class="text-xs text-slate-500">${order.cliente.telefono} · ${order.tipo_entrega === "DELIVERY" ? "Envío" : "Retiro"}</p>
                  </div>
                  <div class="text-right">
                    <span class="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Total Exacto</span>
                    <span class="font-black text-2xl text-emerald-700">$${(order.total_real || order.total_estimado).toLocaleString("es-AR")}</span>
                  </div>
                </div>

                <!-- Vista previa del mensaje de WhatsApp -->
                <div class="mt-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-700 font-mono whitespace-pre-line leading-relaxed">
                  ${waSummary}
                </div>

                <div class="grid grid-cols-2 gap-2 mt-4">
                  <a 
                    href="${waLink}" 
                    target="_blank"
                    class="min-h-[46px] bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition text-center tap-feedback"
                  >
                    <span>Enviar WhatsApp</span>
                  </a>
                  <button 
                    data-deliver-order-id="${order.id}"
                    class="btn-deliver-order min-h-[46px] bg-slate-950 hover:bg-slate-900 active:bg-black text-white font-bold py-3 px-3 rounded-xl text-xs transition tap-feedback"
                  >
                    Marcar Cobrado
                  </button>
                </div>

                <!-- Opción de Cancelar / Eliminar Pedido Listo -->
                <div class="mt-2 text-right">
                  <button 
                    data-delete-order-id="${order.id}"
                    class="btn-cancel-order text-[11px] font-bold text-rose-600 hover:text-rose-800 p-1 transition"
                  >
                    Cancelar / Anular pedido
                  </button>
                </div>
              </div>
            `;
            })
            .join("")}
        </div>
      `;
    }

    // 4. Pestaña ENTREGADOS / COBRADOS
    if (activeTab === "ENTREGADO") {
      return `
        <div class="space-y-2.5">
          ${tabOrders
            .map(
              (order) => `
            <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">#${order.id}</span>
                <h4 class="font-extrabold text-slate-900 text-sm">${order.cliente.nombre}</h4>
                <p class="text-xs text-slate-400">${order.tipo_entrega === "DELIVERY" ? "Envío" : "Retiro"} · ${timeAgo(order.fecha)}</p>
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

  // --- Modal de Edición de Pedido ---
  function renderEditModal(order) {
    if (!order) return "";

    return `
      <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span class="text-[10px] font-black uppercase tracking-wider text-slate-400">Modificar</span>
              <h3 class="font-black text-base text-slate-900">Pedido #${order.id}</h3>
            </div>
            <button id="btn-close-edit-modal" class="min-h-[36px] px-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center font-bold text-xs tap-feedback">
              Cerrar
            </button>
          </div>

          <form id="edit-order-form" class="space-y-3 text-left">
            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Nombre del cliente</label>
              <input 
                type="text" 
                id="edit-name" 
                value="${order.cliente.nombre}" 
                class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-semibold outline-none focus:bg-white focus:border-slate-800"
                required
              />
            </div>

            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Teléfono / WhatsApp</label>
              <input 
                type="tel" 
                id="edit-phone" 
                value="${order.cliente.telefono}" 
                class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-semibold outline-none focus:bg-white focus:border-slate-800"
                required
              />
            </div>

            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Forma de entrega</label>
              <div class="grid grid-cols-2 gap-2">
                <label class="flex items-center gap-2 p-2.5 border rounded-xl cursor-pointer has-[:checked]:border-slate-900 has-[:checked]:bg-slate-50">
                  <input type="radio" name="edit-delivery-mode" value="RETIRO" ${order.tipo_entrega === "RETIRO" ? "checked" : ""} />
                  <span class="text-xs font-bold text-slate-800">Retiro Local</span>
                </label>
                <label class="flex items-center gap-2 p-2.5 border rounded-xl cursor-pointer has-[:checked]:border-slate-900 has-[:checked]:bg-slate-50">
                  <input type="radio" name="edit-delivery-mode" value="DELIVERY" ${order.tipo_entrega === "DELIVERY" ? "checked" : ""} />
                  <span class="text-xs font-bold text-slate-800">Envío Domicilio</span>
                </label>
              </div>
            </div>

            <div id="edit-address-container" class="${order.tipo_entrega === "DELIVERY" ? "" : "hidden"}">
              <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Dirección de entrega</label>
              <input 
                type="text" 
                id="edit-address" 
                value="${order.direccion_entrega || ""}" 
                placeholder="Calle, altura, depto..."
                class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-semibold outline-none focus:bg-white focus:border-slate-800"
              />
            </div>

            <div class="pt-2 flex gap-2">
              <button 
                type="button" 
                id="btn-cancel-edit-modal"
                class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Volver
              </button>
              <button 
                type="submit" 
                class="flex-1 py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs transition shadow-md"
              >
                Guardar cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  // Generador de mensaje de WhatsApp
  function generateWhatsAppSummary(order) {
    const itemsLines = order.items
      .filter((i) => !i.sin_stock)
      .map((i) => `- ${i.nombre} (${i.peso_real} ${i.unidad_medida === "KG" ? "kg" : "u"}): $${i.subtotal.toLocaleString("es-AR")}`)
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
    // Tomar y pesar
    container.querySelectorAll(".btn-start-prep").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (navigator.vibrate) { try { navigator.vibrate(20); } catch {} }
        const id = Number(btn.dataset.startId);
        store.updateOrderStatus(id, "EN_PREPARACION");
        activeTab = "EN_PREPARACION";
        update();
      });
    });

    // Cancelar / Eliminar Pedido
    container.querySelectorAll(".btn-cancel-order").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.deleteOrderId);
        const order = orders.find((o) => o.id === id);
        const clientName = order ? order.cliente.nombre : "este cliente";
        const confirmCancel = confirm(`¿Estás seguro de que querés cancelar y eliminar el pedido #${id} de ${clientName}?`);
        if (confirmCancel) {
          if (navigator.vibrate) { try { navigator.vibrate(25); } catch {} }
          store.deleteOrder(id);
        }
      });
    });

    // Abrir Modal de Edición
    container.querySelectorAll(".btn-open-edit").forEach((btn) => {
      btn.addEventListener("click", () => {
        editingOrderId = Number(btn.dataset.editOrderId);
        update();
      });
    });

    // Desplegable para Agregar Producto
    container.querySelectorAll(".btn-open-add-product").forEach((btn) => {
      btn.addEventListener("click", () => {
        addingProductOrderId = Number(btn.dataset.toggleAddOrder);
        update();
      });
    });

    const btnCloseAddProduct = container.querySelector("#btn-close-add-product");
    if (btnCloseAddProduct) {
      btnCloseAddProduct.addEventListener("click", () => {
        addingProductOrderId = null;
        update();
      });
    }

    // Confirmar agregar nuevo ítem a la orden
    const btnConfirmAddItem = container.querySelector(".btn-confirm-add-item");
    if (btnConfirmAddItem) {
      btnConfirmAddItem.addEventListener("click", () => {
        const orderId = Number(btnConfirmAddItem.dataset.confirmAddOrder);
        const select = container.querySelector("#select-new-product");
        const inputQty = container.querySelector("#input-new-quantity");
        if (select && inputQty) {
          const productId = select.value;
          const qty = Number(inputQty.value) || 1.0;
          store.addProductToOrder(orderId, productId, qty);
          addingProductOrderId = null;
        }
      });
    }

    // Quitar un ítem específico del pedido
    container.querySelectorAll(".btn-remove-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const orderId = Number(btn.dataset.removeItemOrder);
        const itemIdx = Number(btn.dataset.itemIndex);
        const confirmRemove = confirm("¿Eliminar este producto de la lista?");
        if (confirmRemove) {
          store.removeItemFromOrder(orderId, itemIdx);
        }
      });
    });

    // Ajuste fino con botones + y -
    container.querySelectorAll(".btn-adjust-weight").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (navigator.vibrate) { try { navigator.vibrate(10); } catch {} }
        const orderId = Number(btn.dataset.adjustOrder);
        const itemIdx = Number(btn.dataset.itemIdx);
        const delta = Number(btn.dataset.delta);

        const input = container.querySelector(`.input-weight[data-order-id="${orderId}"][data-item-idx="${itemIdx}"]`);
        if (input) {
          const current = Number(input.value) || Number(input.placeholder) || 0;
          const next = Math.max(0, Number((current + delta).toFixed(2)));
          input.value = next;
          input.dispatchEvent(new Event("input", { bubbles: true }));
          store.updateItemWeight(orderId, itemIdx, next, { notify: false });
        }
      });
    });

    // Botón copiar solicitado (= X.X)
    container.querySelectorAll(".btn-copy-requested").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (navigator.vibrate) { try { navigator.vibrate(15); } catch {} }
        const orderId = Number(btn.dataset.copyRequestedOrder);
        const itemIdx = Number(btn.dataset.itemIdx);
        const requestedVal = Number(btn.dataset.requestedVal);

        const input = container.querySelector(`.input-weight[data-order-id="${orderId}"][data-item-idx="${itemIdx}"]`);
        if (input) {
          input.value = requestedVal;
          input.dispatchEvent(new Event("input", { bubbles: true }));
          store.updateItemWeight(orderId, itemIdx, requestedVal, { notify: false });
        }
      });
    });

    // Modal de edición - Listeners
    if (editingOrderId) {
      const btnCloseEdit = container.querySelector("#btn-close-edit-modal");
      const btnCancelEdit = container.querySelector("#btn-cancel-edit-modal");
      const editForm = container.querySelector("#edit-order-form");
      const editRadios = container.querySelectorAll('input[name="edit-delivery-mode"]');
      const addressContainer = container.querySelector("#edit-address-container");

      const closeModal = () => {
        editingOrderId = null;
        update();
      };

      if (btnCloseEdit) btnCloseEdit.addEventListener("click", closeModal);
      if (btnCancelEdit) btnCancelEdit.addEventListener("click", closeModal);

      editRadios.forEach((radio) => {
        radio.addEventListener("change", (e) => {
          if (e.target.value === "DELIVERY") {
            addressContainer?.classList.remove("hidden");
          } else {
            addressContainer?.classList.add("hidden");
          }
        });
      });

      if (editForm) {
        editForm.addEventListener("submit", (e) => {
          e.preventDefault();
          const name = container.querySelector("#edit-name")?.value.trim() || "";
          const phone = container.querySelector("#edit-phone")?.value.trim() || "";
          const modeRadio = container.querySelector('input[name="edit-delivery-mode"]:checked');
          const mode = modeRadio ? modeRadio.value : "RETIRO";
          const address = mode === "DELIVERY" ? container.querySelector("#edit-address")?.value.trim() || "" : "Retiro por mostrador";

          store.updateOrderDetails(editingOrderId, {
            nombre: name,
            telefono: phone,
            tipo_entrega: mode,
            direccion_entrega: address
          });

          editingOrderId = null;
        });
      }
    }

    // Inputs de pesaje
    container.querySelectorAll(".input-weight").forEach((input) => {
      input.addEventListener("input", (e) => {
        const orderId = Number(e.target.dataset.orderId);
        const itemIdx = Number(e.target.dataset.itemIdx);
        const priceUnit = Number(e.target.dataset.priceUnit) || 0;
        const val = e.target.value.trim();

        const numVal = val !== "" ? Math.max(0, Number(val)) : 0;
        const subtotal = Math.round(numVal * priceUnit);

        const subtotalEl = container.querySelector(`#item-subtotal-${orderId}-${itemIdx}`);
        if (subtotalEl) {
          subtotalEl.textContent = `$${subtotal.toLocaleString("es-AR")}`;
        }

        const orderInputs = container.querySelectorAll(`.input-weight[data-order-id="${orderId}"]`);
        let runningTotal = 0;
        orderInputs.forEach((inp) => {
          const p = Number(inp.dataset.priceUnit) || 0;
          const v = inp.value.trim() !== "" ? Number(inp.value) : Number(inp.placeholder || 0);
          runningTotal += Math.round(v * p);
        });

        const totalEl = container.querySelector(`#order-balanza-total-${orderId}`);
        if (totalEl) {
          totalEl.textContent = `$${Math.round(runningTotal).toLocaleString("es-AR")}`;
        }
      });

      input.addEventListener("change", (e) => {
        const orderId = Number(e.target.dataset.orderId);
        const itemIdx = Number(e.target.dataset.itemIdx);
        const val = e.target.value.trim();
        if (val !== "") {
          store.updateItemWeight(orderId, itemIdx, Number(val), { notify: false });
        }
      });
    });

    container.querySelectorAll(".btn-toggle-stock").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (navigator.vibrate) { try { navigator.vibrate(15); } catch {} }
        const orderId = Number(btn.dataset.toggleStockOrder);
        const itemIdx = Number(btn.dataset.itemIndex);
        store.toggleItemOutOfStock(orderId, itemIdx);
      });
    });

    container.querySelectorAll(".btn-finish-weighing").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (navigator.vibrate) { try { navigator.vibrate(30); } catch {} }
        const id = Number(btn.dataset.finishOrderId);

        const weightsMap = {};
        const currentInputs = container.querySelectorAll(`.input-weight[data-order-id="${id}"]`);
        currentInputs.forEach((input) => {
          const itemIdx = Number(input.dataset.itemIdx);
          const val = input.value.trim();
          if (val !== "") {
            weightsMap[itemIdx] = Number(val);
          }
        });

        store.finalizeOrderWeighing(id, weightsMap);
        activeTab = "LISTO";
        update();
      });
    });

    container.querySelectorAll(".btn-deliver-order").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (navigator.vibrate) { try { navigator.vibrate(20); } catch {} }
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
    // Si el usuario está interactuando activamente con un input, evitar destruir el DOM
    const isTyping = document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "SELECT");
    if ((event === "orders_changed" || event === "order_created" || event === "storage_sync") && !isTyping) {
      update();
    }
  });

  update();
  return () => unsubscribe();
}
