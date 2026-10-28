import { store } from "../store.js";
import { CATEGORIAS } from "../products-data.js";

export function renderClientView(container) {
  let selectedCategory = "Todos";
  let searchQuery = "";
  let isCartOpen = false;
  let activeOrder = null;

  function update() {
    container.innerHTML = "";
    const user = store.getCurrentUser();

    if (!user) {
      renderPhoneGate();
      return;
    }

    if (activeOrder) {
      renderOrderTracking();
      return;
    }

    renderCatalog();
  }

  // --- 1. Pantalla de Ingreso / Teléfono ---
  function renderPhoneGate() {
    container.innerHTML = `
      <div class="max-w-md mx-auto p-4 pt-10 min-h-[85vh] flex flex-col justify-center">
        <div class="bg-white rounded-3xl p-7 shadow-xl shadow-slate-200/50 border border-slate-200/80 text-left">
          <div class="mb-6">
            <span class="inline-block text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/60 mb-2">
              Verdulería Digital
            </span>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">Mi Huerta</h1>
            <p class="text-xs text-slate-500 mt-1">
              Catálogo de estación, pedidos directos y pesaje transparente en balanza.
            </p>
          </div>

          <form id="phone-form" class="space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Número de WhatsApp
              </label>
              <div class="relative flex items-center">
                <span class="absolute left-3.5 text-slate-400 font-semibold text-sm select-none">
                  +54 9
                </span>
                <input 
                  type="tel" 
                  id="phone-input" 
                  required 
                  inputmode="numeric"
                  placeholder="11 2345 6789" 
                  value="1123456789"
                  class="w-full pl-20 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 font-bold text-base outline-none transition"
                />
              </div>
              <p class="text-[11px] text-slate-400 mt-1.5">
                Tu número nos permite sincronizar tu pedido y avisarte cuando esté pesado.
              </p>
            </div>

            <div id="new-user-fields" class="space-y-3 pt-1">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nombre completo
                </label>
                <input 
                  type="text" 
                  id="name-input" 
                  placeholder="Ej: Facundo Gómez" 
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 text-sm font-medium outline-none transition"
                />
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Dirección de entrega (opcional)
                </label>
                <input 
                  type="text" 
                  id="address-input" 
                  placeholder="Ej: Av. Rivadavia 4520, Piso 3 B" 
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 text-sm font-medium outline-none transition"
                />
              </div>
            </div>

            <button 
              type="submit" 
              class="w-full mt-2 bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-slate-900/10 transition tap-feedback text-sm flex items-center justify-center gap-2"
            >
              <span>Ingresar al Catálogo</span>
              <span class="text-xs text-slate-400 font-normal">›</span>
            </button>
          </form>

          <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              Precios del día actualizados
            </span>
            <span>Balanza de precisión</span>
          </div>
        </div>
      </div>
    `;

    const phoneForm = container.querySelector("#phone-form");
    const phoneInput = container.querySelector("#phone-input");
    const nameInput = container.querySelector("#name-input");
    const addressInput = container.querySelector("#address-input");

    phoneInput.addEventListener("input", (e) => {
      const existing = store.getCustomer(e.target.value);
      if (existing) {
        nameInput.value = existing.nombre || "";
        addressInput.value = existing.direccion || "";
      }
    });

    const initialMatch = store.getCustomer(phoneInput.value);
    if (initialMatch) {
      nameInput.value = initialMatch.nombre || "";
      addressInput.value = initialMatch.direccion || "";
    }

    phoneForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const phone = phoneInput.value.trim();
      const name = nameInput.value.trim() || "Cliente";
      const address = addressInput.value.trim();

      const user = store.saveCustomer({
        telefono: phone,
        nombre: name,
        direccion: address
      });

      store.setCurrentUser(user);
      update();
    });
  }

  // --- 2. Catálogo Principal ---
  function renderCatalog() {
    const user = store.getCurrentUser();
    const products = store.getProducts();
    const cart = store.getCart();
    const { items: cartItems, totalEstimado, totalItems } = store.getCartSummary();

    const filteredProducts = products.filter((p) => {
      const matchesCategory = selectedCategory === "Todos" || p.categoria === selectedCategory;
      const matchesSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    container.innerHTML = `
      <div class="max-w-md mx-auto pb-32">
        
        <!-- Header Móvil del Cliente -->
        <header class="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 pt-3 pb-2.5">
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-base font-black text-slate-900 tracking-tight uppercase">Mi Huerta</h1>
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span class="text-[11px] font-bold text-emerald-700">Abierto</span>
              </div>
              <p class="text-xs text-slate-500">
                <span>Hola, <strong class="text-slate-800 font-semibold">${user.nombre}</strong></span>
                <button id="btn-change-user" class="text-slate-400 underline ml-1 hover:text-slate-600">Cambiar</button>
              </p>
            </div>
            
            <button 
              id="btn-header-cart" 
              class="relative px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 tap-feedback"
            >
              <span>Pedido</span>
              <span class="px-1.5 py-0.2 rounded-full ${totalItems > 0 ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'} text-[10px] font-extrabold">
                ${totalItems}
              </span>
            </button>
          </div>

          <!-- Buscador -->
          <div class="mt-2.5 relative">
            <input 
              type="text" 
              id="search-input" 
              placeholder="Buscar por nombre (ej: papa, tomate, acelga)..." 
              value="${searchQuery}"
              class="w-full pl-3 pr-8 py-2 bg-slate-100 hover:bg-slate-150 focus:bg-white border border-transparent focus:border-slate-300 rounded-xl text-xs font-medium outline-none transition"
            />
            ${
              searchQuery
                ? `<button id="btn-clear-search" class="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 text-xs font-bold">X</button>`
                : ""
            }
          </div>

          <!-- Píldoras de Categorías (Horizontal Scroll) -->
          <div class="mt-2.5 flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            ${CATEGORIAS.map(
              (cat) => `
              <button 
                data-category="${cat}"
                class="category-pill whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }"
              >
                ${cat}
              </button>
            `
            ).join("")}
          </div>
        </header>

        <!-- Lista de Productos -->
        <main class="p-4 space-y-2.5">
          ${
            filteredProducts.length === 0
              ? `
            <div class="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-6">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Sin coincidencias</span>
              <p class="text-sm font-semibold text-slate-700">No encontramos productos con ese nombre</p>
              <button id="btn-reset-filter" class="mt-3 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200">
                Limpiar búsqueda
              </button>
            </div>
          `
              : filteredProducts
                  .map((product) => {
                    const cartItem = cart[product.id];
                    const currentQty = cartItem ? cartItem.cantidad : 0;
                    const step = product.paso || 0.5;
                    const unitLabel = product.unidad_medida === "KG" ? "kg" : "u.";
                    const unitSubtitle = product.unidad_medida === "KG" ? "Venta por kilo" : "Venta por unidad";

                    return `
              <div class="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm flex items-center justify-between gap-3 transition ${
                !product.disponible ? "opacity-40 grayscale pointer-events-none" : ""
              }">
                <!-- Info Producto -->
                <div class="flex-1 min-w-0 pr-1">
                  <div class="flex items-center gap-1.5 mb-0.5">
                    <span class="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      ${product.categoria}
                    </span>
                    <span class="text-[10px] text-slate-400">·</span>
                    <span class="text-[10px] font-medium text-slate-400">
                      ${unitSubtitle}
                    </span>
                  </div>

                  <h3 class="font-extrabold text-slate-900 text-sm leading-tight truncate">
                    ${product.nombre}
                  </h3>

                  <p class="text-[11px] text-slate-400 truncate mt-0.5">
                    ${product.detalle || ""}
                  </p>

                  <div class="mt-1 flex items-baseline gap-1">
                    <span class="text-sm font-black text-emerald-700">
                      $${product.precio.toLocaleString("es-AR")}
                    </span>
                    <span class="text-[11px] text-slate-400 font-medium">/ ${unitLabel}</span>
                  </div>

                  ${
                    !product.disponible
                      ? `<span class="inline-block text-[10px] font-bold text-rose-600 uppercase tracking-wider mt-1">Agotado</span>`
                      : ""
                  }
                </div>

                <!-- Selector de Cantidad / Botón Agregar -->
                <div class="shrink-0">
                  ${
                    product.disponible
                      ? currentQty === 0
                        ? `
                        <button 
                          data-add-id="${product.id}"
                          data-step="${step}"
                          class="btn-add-initial bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition tap-feedback flex items-center gap-1 shadow-sm"
                        >
                          <span>Agregar</span>
                          <span class="text-xs font-normal">+</span>
                        </button>
                      `
                        : `
                        <div class="flex items-center bg-emerald-600 text-white rounded-xl p-1 shadow-sm">
                          <button 
                            data-dec-id="${product.id}"
                            data-step="${step}"
                            class="btn-qty-dec w-8 h-8 flex items-center justify-center rounded-lg hover:bg-emerald-700 active:scale-95 text-sm font-extrabold transition"
                            title="Restar"
                          >
                            −
                          </button>
                          <span class="px-2 text-xs font-black min-w-[48px] text-center tracking-tight">
                            ${currentQty} ${unitLabel}
                          </span>
                          <button 
                            data-inc-id="${product.id}"
                            data-step="${step}"
                            class="btn-qty-inc w-8 h-8 flex items-center justify-center rounded-lg hover:bg-emerald-700 active:scale-95 text-sm font-extrabold transition"
                            title="Sumar"
                          >
                            +
                          </button>
                        </div>
                      `
                      : ""
                  }
                </div>
              </div>
            `;
                  })
                  .join("")
          }
        </main>

        <!-- Barra Flotante Inferior de Carrito -->
        ${
          totalItems > 0
            ? `
          <div class="fixed bottom-4 left-4 right-4 z-30 max-w-md mx-auto pointer-events-auto">
            <button 
              id="btn-open-cart"
              class="w-full bg-slate-950 hover:bg-slate-900 text-white p-3.5 px-4 rounded-2xl shadow-xl shadow-slate-950/25 flex items-center justify-between transition tap-feedback border border-slate-800"
            >
              <div class="flex items-center gap-3">
                <span class="bg-emerald-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-full">
                  ${totalItems}
                </span>
                <div class="text-left">
                  <span class="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Total Estimado</span>
                  <span class="font-black text-base leading-none">$${totalEstimado.toLocaleString("es-AR")}</span>
                </div>
              </div>
              <div class="flex items-center gap-1.5 font-bold text-xs bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl text-emerald-400 transition">
                <span>Ver Pedido</span>
                <span>›</span>
              </div>
            </button>
          </div>
        `
            : ""
        }

        <!-- Drawer de Carrito y Checkout -->
        ${isCartOpen ? renderCartDrawer(user, cartItems, totalEstimado) : ""}
      </div>
    `;

    // Listeners del catálogo
    container.querySelector("#btn-change-user")?.addEventListener("click", () => {
      store.logoutUser();
      update();
    });

    container.querySelector("#btn-header-cart")?.addEventListener("click", () => {
      if (totalItems > 0) {
        isCartOpen = true;
        renderCatalog();
      }
    });

    const searchInput = container.querySelector("#search-input");
    searchInput?.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderCatalog();
      const nextInput = container.querySelector("#search-input");
      if (nextInput) {
        nextInput.focus();
        nextInput.setSelectionRange(searchQuery.length, searchQuery.length);
      }
    });

    container.querySelector("#btn-clear-search")?.addEventListener("click", () => {
      searchQuery = "";
      renderCatalog();
    });

    container.querySelector("#btn-reset-filter")?.addEventListener("click", () => {
      searchQuery = "";
      selectedCategory = "Todos";
      renderCatalog();
    });

    container.querySelectorAll(".category-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedCategory = btn.dataset.category;
        renderCatalog();
      });
    });

    container.querySelectorAll(".btn-add-initial, .btn-qty-inc").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.addId || btn.dataset.incId;
        const step = Number(btn.dataset.step) || 0.5;
        store.addToCart(id, step);
      });
    });

    container.querySelectorAll(".btn-qty-dec").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.decId;
        const step = Number(btn.dataset.step) || 0.5;
        store.addToCart(id, -step);
      });
    });

    container.querySelector("#btn-open-cart")?.addEventListener("click", () => {
      isCartOpen = true;
      renderCatalog();
    });

    if (isCartOpen) {
      attachCartDrawerListeners(user);
    }
  }

  // --- 3. Bottom Sheet / Drawer de Carrito ---
  function renderCartDrawer(user, items, totalEstimado) {
    return `
      <div class="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm flex items-end justify-center animate-fade-in">
        <div class="bg-white w-full max-w-md rounded-t-3xl max-h-[92vh] flex flex-col shadow-2xl animate-slide-up border-t border-slate-200">
          
          <!-- Barra superior de arrastre / Handle bar -->
          <div class="w-10 h-1 bg-slate-300 rounded-full mx-auto mt-3"></div>

          <!-- Header Carrito -->
          <div class="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 class="font-black text-slate-900 text-lg tracking-tight">Tu Pedido</h2>
              <p class="text-[11px] text-slate-400">Revisá cantidades antes de confirmar</p>
            </div>
            <button 
              id="btn-close-cart" 
              class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-xs tap-feedback"
            >
              X
            </button>
          </div>

          <!-- Lista de Ítems en Carrito con Controles Directos -->
          <div class="p-5 overflow-y-auto space-y-3 flex-1">
            ${
              items.length === 0
                ? `<p class="text-xs text-slate-400 text-center py-8">Tu carrito está vacío</p>`
                : items
                    .map(
                      (item) => `
                <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between gap-3">
                  <div class="flex-1 min-w-0">
                    <span class="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.2 rounded bg-slate-200/80 text-slate-600">
                      ${item.categoria || "Producto"}
                    </span>
                    <h4 class="font-extrabold text-slate-900 text-sm truncate mt-0.5">${item.nombre}</h4>
                    <p class="text-xs text-slate-400 mt-0.5">
                      $${item.precio_unitario.toLocaleString("es-AR")} / ${item.unidad_medida === "KG" ? "kg" : "u."}
                    </p>
                  </div>

                  <!-- Stepper en Carrito -->
                  <div class="flex items-center gap-1.5">
                    <div class="flex items-center bg-white border border-slate-200 rounded-xl p-0.5">
                      <button 
                        data-drawer-dec="${item.producto_id}" 
                        class="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-lg font-bold text-xs"
                      >
                        −
                      </button>
                      <span class="px-2 text-xs font-black min-w-[36px] text-center text-slate-900">
                        ${item.cantidad}
                      </span>
                      <button 
                        data-drawer-inc="${item.producto_id}" 
                        class="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-lg font-bold text-xs"
                      >
                        +
                      </button>
                    </div>

                    <div class="text-right min-w-[65px]">
                      <span class="font-black text-sm text-slate-900 block">
                        $${item.subtotal_estimado.toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>
                </div>
              `
                    )
                    .join("")
            }

            <!-- Selector de Forma de Entrega -->
            <div class="pt-3">
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Método de Entrega
              </label>
              <div class="grid grid-cols-2 gap-2">
                <label class="flex flex-col p-3 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 has-[:checked]:border-slate-900 has-[:checked]:bg-slate-900 has-[:checked]:text-white transition">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-black">Retiro en Local</span>
                    <input type="radio" name="delivery-mode" value="RETIRO" checked class="accent-emerald-500" />
                  </div>
                  <span class="text-[10px] opacity-70 mt-1">Listo en 20-30 min · Sin costo</span>
                </label>

                <label class="flex flex-col p-3 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 has-[:checked]:border-slate-900 has-[:checked]:bg-slate-900 has-[:checked]:text-white transition">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-black">Envío a Domicilio</span>
                    <input type="radio" name="delivery-mode" value="DELIVERY" class="accent-emerald-500" />
                  </div>
                  <span class="text-[10px] opacity-70 mt-1">Cadete a tu puerta</span>
                </label>
              </div>
            </div>

            <!-- Campo Dirección de Envío -->
            <div id="delivery-address-container" class="hidden pt-1">
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Dirección exacta de entrega
              </label>
              <input 
                type="text" 
                id="delivery-address-input" 
                value="${user.direccion || ""}" 
                placeholder="Calle, número, piso y departamento"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 transition"
              />
            </div>

            <!-- Explicación de Pesaje Real Transparente -->
            <div class="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 text-xs text-amber-900 mt-2">
              <p class="font-bold text-[11px] uppercase tracking-wider text-amber-800 mb-0.5">Pesaje en Balanza</p>
              <p class="text-[11px] leading-relaxed opacity-90">
                El total indicado es una estimación. En el mostrador se pesan las unidades reales y te notificaremos el comprobante con los gramos exactos y el importe final.
              </p>
            </div>
          </div>

          <!-- Footer con Confirmación -->
          <div class="p-5 border-t border-slate-100 bg-slate-50 rounded-b-3xl space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Total Estimado</span>
                <span class="text-xs text-slate-500">Sujeto a balanza</span>
              </div>
              <span class="font-black text-2xl text-slate-900">$${totalEstimado.toLocaleString("es-AR")}</span>
            </div>

            <button 
              id="btn-confirm-order"
              class="w-full bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-black py-4 rounded-xl shadow-lg shadow-slate-900/10 text-sm transition tap-feedback flex items-center justify-center gap-2"
            >
              <span>Confirmar Pedido</span>
              <span class="text-xs font-normal">›</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function attachCartDrawerListeners(user) {
    container.querySelector("#btn-close-cart")?.addEventListener("click", () => {
      isCartOpen = false;
      renderCatalog();
    });

    const radios = container.querySelectorAll('input[name="delivery-mode"]');
    const addressContainer = container.querySelector("#delivery-address-container");
    radios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        if (e.target.value === "DELIVERY") {
          addressContainer?.classList.remove("hidden");
        } else {
          addressContainer?.classList.add("hidden");
        }
      });
    });

    // Controles directos de cantidad en drawer
    container.querySelectorAll("[data-drawer-inc]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.drawerInc;
        const product = store.getProducts().find((p) => p.id === id);
        const step = product?.paso || 0.5;
        store.addToCart(id, step);
      });
    });

    container.querySelectorAll("[data-drawer-dec]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.drawerDec;
        const product = store.getProducts().find((p) => p.id === id);
        const step = product?.paso || 0.5;
        store.addToCart(id, -step);
      });
    });

    const btnConfirm = container.querySelector("#btn-confirm-order");
    btnConfirm?.addEventListener("click", () => {
      const mode = container.querySelector('input[name="delivery-mode"]:checked')?.value || "RETIRO";
      const addressInput = container.querySelector("#delivery-address-input");
      const address = mode === "DELIVERY" ? addressInput?.value.trim() : "Retiro en local";

      if (mode === "DELIVERY" && !address) {
        alert("Por favor ingresá tu dirección para coordinar el envío.");
        addressInput?.focus();
        return;
      }

      const newOrder = store.createOrder({
        cliente: user,
        tipo_entrega: mode,
        direccion_entrega: address
      });

      isCartOpen = false;
      activeOrder = newOrder;
      update();
    });
  }

  // --- 4. Pantalla de Seguimiento del Pedido ---
  function renderOrderTracking() {
    const currentOrder = store.getOrders().find((o) => o.id === activeOrder.id) || activeOrder;
    const isWeighing = currentOrder.estado === "EN_PREPARACION";
    const isReady = currentOrder.estado === "LISTO" || currentOrder.estado === "ENTREGADO";
    const isDelivered = currentOrder.estado === "ENTREGADO";

    let stepNumber = 1;
    let stepTitle = "Pedido Recibido";
    let stepDesc = "El pedido ingresó en la cola del mostrador.";

    if (isWeighing) {
      stepNumber = 2;
      stepTitle = "En Balanza";
      stepDesc = "El operario está pesando cada uno de tus productos.";
    } else if (isReady) {
      stepNumber = 3;
      stepTitle = "Listo para Entrega";
      stepDesc = currentOrder.tipo_entrega === "DELIVERY"
        ? "El pedido fue pesado y el cadete está listo para despachar."
        : "El pedido fue pesado y podés pasar a retirarlo por el local.";
    }
    if (isDelivered) {
      stepNumber = 4;
      stepTitle = "Entregado y Cobrado";
      stepDesc = "Pedido finalizado exitosamente. ¡Muchas gracias!";
    }

    container.innerHTML = `
      <div class="max-w-md mx-auto p-4 pt-6 pb-24">
        <div class="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-200/80 text-left">
          
          <!-- Estado y Referencia -->
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Comprobante Digital</span>
              <h2 class="text-xl font-black text-slate-900 tracking-tight">Pedido #${currentOrder.id}</h2>
            </div>
            <span class="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${
              isReady
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : isWeighing
                ? "bg-blue-100 text-blue-800 border border-blue-300"
                : "bg-amber-100 text-amber-800 border border-amber-300"
            }">
              ${currentOrder.estado}
            </span>
          </div>

          <!-- Línea de Progreso (Timeline Minimalista) -->
          <div class="my-5">
            <div class="grid grid-cols-3 gap-1.5 text-center">
              <div class="h-1.5 rounded-full ${stepNumber >= 1 ? 'bg-slate-900' : 'bg-slate-200'}"></div>
              <div class="h-1.5 rounded-full ${stepNumber >= 2 ? (isReady ? 'bg-slate-900' : 'bg-blue-600') : 'bg-slate-200'}"></div>
              <div class="h-1.5 rounded-full ${stepNumber >= 3 ? 'bg-emerald-600' : 'bg-slate-200'}"></div>
            </div>
            <div class="mt-3">
              <h3 class="text-sm font-extrabold text-slate-900">${stepTitle}</h3>
              <p class="text-xs text-slate-500 mt-0.5">${stepDesc}</p>
            </div>
          </div>

          <!-- Resumen Financiero -->
          <div class="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
            <div class="flex justify-between text-xs text-slate-500">
              <span>Entrega:</span>
              <strong class="text-slate-800 font-semibold">
                ${currentOrder.tipo_entrega === "DELIVERY" ? "Envío a Domicilio" : "Retiro en Mostrador"}
              </strong>
            </div>

            ${
              currentOrder.tipo_entrega === "DELIVERY"
                ? `
              <div class="flex justify-between text-xs text-slate-500">
                <span>Destino:</span>
                <span class="text-slate-800 font-medium text-right">${currentOrder.direccion_entrega}</span>
              </div>
            `
                : ""
            }

            ${
              isReady && currentOrder.total_real !== null
                ? `
              <div class="pt-2.5 border-t border-slate-200">
                <div class="flex justify-between items-center text-xs text-slate-400">
                  <span>Estimado inicial:</span>
                  <span class="line-through">$${currentOrder.total_estimado.toLocaleString("es-AR")}</span>
                </div>
                <div class="flex justify-between items-center mt-1">
                  <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">Total Final en Balanza:</span>
                  <span class="font-black text-2xl text-emerald-700">$${currentOrder.total_real.toLocaleString("es-AR")}</span>
                </div>
              </div>
            `
                : `
              <div class="pt-2.5 border-t border-slate-200 flex justify-between items-center">
                <span class="text-xs font-semibold text-slate-600">Total Estimado:</span>
                <span class="font-black text-xl text-slate-900">$${currentOrder.total_estimado.toLocaleString("es-AR")}</span>
              </div>
            `
            }
          </div>

          <!-- Desglose Ítems Pesados -->
          <div class="mt-5">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Detalle de Productos</h4>
            <div class="divide-y divide-slate-100 text-xs">
              ${currentOrder.items
                .map((item) => {
                  const pesoTexto = item.peso_real !== null
                    ? `${item.peso_real} ${item.unidad_medida === "KG" ? "kg" : "u."} (pesado)`
                    : `${item.cantidad_solicitada} ${item.unidad_medida === "KG" ? "kg" : "u."} (aprox)`;
                  return `
                  <div class="py-2 flex items-center justify-between gap-2 ${item.sin_stock ? "opacity-40 line-through" : ""}">
                    <div>
                      <span class="font-bold text-slate-800">${item.nombre}</span>
                      <span class="text-[11px] text-slate-400 block">${pesoTexto}</span>
                    </div>
                    <strong class="text-slate-900 font-bold">
                      $${(item.subtotal || 0).toLocaleString("es-AR")}
                    </strong>
                  </div>
                `;
                })
                .join("")}
            </div>
          </div>

          <!-- Acciones -->
          <div class="mt-6 pt-4 border-t border-slate-100 space-y-2">
            <button 
              id="btn-new-order" 
              class="w-full py-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition tap-feedback"
            >
              Realizar Otro Pedido
            </button>
          </div>
        </div>
      </div>
    `;

    container.querySelector("#btn-new-order")?.addEventListener("click", () => {
      activeOrder = null;
      update();
    });
  }

  // Suscripción al store
  const unsubscribe = store.subscribe((event) => {
    if (
      event === "cart_changed" ||
      event === "products_changed" ||
      event === "orders_changed" ||
      event === "storage_sync" ||
      event === "user_changed"
    ) {
      update();
    }
  });

  update();
  return () => unsubscribe();
}
