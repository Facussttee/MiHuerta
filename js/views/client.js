import { store } from "../store.js";
import { CATEGORIAS } from "../products-data.js";

export function renderClientView(container) {
  let selectedCategory = "Todos";
  let searchQuery = "";
  let isCartOpen = false;
  let viewingActiveOrder = false;
  let deliveryMode = "RETIRO"; // RETIRO | DELIVERY
  let deliveryAddress = "";

  // Determinar si debemos mostrar el seguimiento de pedido automáticamente al iniciar
  const initialActive = store.getActiveOrder();
  if (initialActive && initialActive.estado !== "ENTREGADO") {
    viewingActiveOrder = true;
  }

  function update() {
    const user = store.getCurrentUser();
    if (!user) {
      renderPhoneGate();
      return;
    }

    if (viewingActiveOrder) {
      const activeOrder = store.getActiveOrder();
      if (activeOrder) {
        renderOrderTracking(activeOrder);
        return;
      } else {
        viewingActiveOrder = false;
      }
    }

    renderCatalog();
  }

  // ========================================================
  // 1. PANTALLA DE ACCESO / TELEFONO (Mobile First)
  // ========================================================
  function renderPhoneGate() {
    container.innerHTML = `
      <div class="max-w-md mx-auto p-4 pt-8 pb-16 min-h-[85vh] flex flex-col justify-center">
        <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-200/80 text-left">
          
          <div class="mb-6">
            <span class="inline-block text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 mb-3">
              Verdulería Digital
            </span>
            <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Mi Huerta</h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              Catálogo fresco del día, pedidos directos desde tu celular y pesaje transparente en balanza.
            </p>
          </div>

          <form id="phone-form" class="space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Número de WhatsApp
              </label>
              <div class="relative flex items-center">
                <span class="absolute left-4 text-slate-400 font-semibold text-base select-none pointer-events-none">
                  +54 9
                </span>
                <input 
                  type="tel" 
                  id="phone-input" 
                  required 
                  inputmode="numeric"
                  placeholder="11 2345 6789" 
                  value="${store.prefilledPhone || "1123456789"}"
                  class="w-full pl-20 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 font-bold text-base outline-none transition"
                />
              </div>
              <p class="text-[11px] text-slate-400 mt-1.5">
                Usamos tu teléfono para enviarte el comprobante de pesaje real por WhatsApp.
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
                  class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 text-base font-medium outline-none transition"
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
                  class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 text-base font-medium outline-none transition"
                />
              </div>
            </div>

            <button 
              type="submit" 
              class="w-full mt-2 min-h-[48px] bg-slate-950 hover:bg-slate-900 active:bg-black text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-slate-950/15 transition tap-feedback text-sm flex items-center justify-center gap-2"
            >
              <span>Ingresar al Catálogo</span>
              <span class="text-xs text-slate-400">›</span>
            </button>
          </form>

          <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              Precios del día
            </span>
            <span>Pesaje transparente</span>
          </div>
        </div>
      </div>
    `;

    const phoneForm = container.querySelector("#phone-form");
    const phoneInput = container.querySelector("#phone-input");
    const nameInput = container.querySelector("#name-input");
    const addressInput = container.querySelector("#address-input");

    function syncUserFields(phoneVal) {
      const match = store.getCustomer(phoneVal);
      if (match) {
        nameInput.value = match.nombre || "";
        addressInput.value = match.direccion || "";
      }
    }

    phoneInput.addEventListener("input", (e) => {
      syncUserFields(e.target.value);
    });

    syncUserFields(phoneInput.value);

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
      deliveryAddress = user.direccion || "";
      update();
    });
  }

  // ========================================================
  // 2. CATALOGO PRINCIPAL
  // ========================================================
  function renderCatalog() {
    const user = store.getCurrentUser();
    const products = store.getProducts();
    const cart = store.getCart();
    const { items: cartItems, totalEstimado, totalItems } = store.getCartSummary();
    const activeOrder = store.getActiveOrder();

    if (!deliveryAddress && user.direccion) {
      deliveryAddress = user.direccion;
    }

    const filteredProducts = products.filter((p) => {
      const matchesCategory = selectedCategory === "Todos" || p.categoria === selectedCategory;
      const matchesSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesCategory && matchesSearch;
    });

    container.innerHTML = `
      <div class="max-w-md mx-auto pb-36">
        
        <!-- Banner de Pedido Activo en Curso (si existe) -->
        ${
          activeOrder && activeOrder.estado !== "ENTREGADO"
            ? `
          <div class="px-4 pt-3">
            <button 
              id="btn-banner-active-order"
              class="w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-950 p-3 rounded-2xl text-left flex items-center justify-between transition tap-feedback shadow-sm"
            >
              <div>
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span class="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                    Pedido #${activeOrder.id} en curso
                  </span>
                  <span class="text-[10px] px-2 py-0.2 rounded-full font-bold bg-white text-emerald-800 border border-emerald-200">
                    ${activeOrder.estado}
                  </span>
                </div>
                <p class="text-xs text-emerald-900 font-semibold mt-0.5">
                  Tocá aquí para ver el pesaje en balanza en tiempo real
                </p>
              </div>
              <span class="text-sm font-bold text-emerald-700 ml-2">›</span>
            </button>
          </div>
        `
            : ""
        }

        <!-- Header Móvil del Catálogo (Coordinado debajo de la barra demo: top-[49px]) -->
        <header class="sticky top-[49px] z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 pt-3 pb-2.5 shadow-sm">
          <div class="flex items-center justify-between gap-2">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-black text-slate-900 tracking-tight uppercase">Catálogo de Huerta</span>
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
              class="relative min-h-[44px] px-3.5 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-2 tap-feedback"
            >
              <span>Pedido</span>
              <span class="px-2 py-0.5 rounded-full ${totalItems > 0 ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-700"} text-xs font-black">
                ${totalItems}
              </span>
            </button>
          </div>

          <!-- Buscador con tamaño de fuente accesible para evitar zoom iOS -->
          <div class="mt-2.5 relative">
            <input 
              type="text" 
              id="search-input" 
              placeholder="Buscar productos (papa, tomate, acelga)..." 
              value="${searchQuery}"
              class="w-full pl-3.5 pr-10 py-2.5 bg-slate-100 focus:bg-white border border-transparent focus:border-slate-300 rounded-xl text-base font-medium outline-none transition"
            />
            ${
              searchQuery
                ? `<button id="btn-clear-search" class="absolute right-1 top-1 w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-700 text-sm font-bold tap-feedback">X</button>`
                : ""
            }
          </div>

          <!-- Píldoras de Categorías (Horizontal Scroll Táctil) -->
          <div class="mt-2.5 flex gap-2 overflow-x-auto no-scrollbar py-1">
            ${CATEGORIAS.map(
              (cat) => `
              <button 
                data-category="${cat}"
                class="category-pill whitespace-nowrap min-h-[38px] px-4 py-1.5 rounded-full text-xs font-bold transition tap-feedback ${
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

        <!-- Contenedor de Productos -->
        <main id="products-list-container" class="p-4 space-y-2.5">
          ${renderProductCardsHTML(filteredProducts, cart)}
        </main>

        <!-- Barra Flotante Inferior de Pedido (Safe Area Adaptable) -->
        ${
          totalItems > 0
            ? `
          <div class="fixed left-4 right-4 z-30 max-w-md mx-auto pointer-events-auto safe-floating-bottom">
            <button 
              id="btn-open-cart"
              class="w-full min-h-[52px] bg-slate-950 hover:bg-slate-900 active:bg-black text-white p-3.5 px-4 rounded-2xl shadow-xl shadow-slate-950/30 flex items-center justify-between transition tap-feedback border border-slate-800"
            >
              <div class="flex items-center gap-3">
                <span class="bg-emerald-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-full">
                  ${totalItems}
                </span>
                <div class="text-left">
                  <span class="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Total Estimado</span>
                  <span class="font-black text-base leading-none text-white">$${totalEstimado.toLocaleString("es-AR")}</span>
                </div>
              </div>
              <div class="flex items-center gap-1.5 font-bold text-xs bg-slate-800 hover:bg-slate-700 px-3.5 py-2.5 rounded-xl text-emerald-400 transition">
                <span>Ver Pedido</span>
                <span class="text-xs">›</span>
              </div>
            </button>
          </div>
        `
            : ""
        }

        <!-- Bottom Sheet Drawer de Carrito -->
        ${isCartOpen ? renderCartDrawer(user, cartItems, totalEstimado) : ""}
      </div>
    `;

    attachCatalogListeners(user);
    if (isCartOpen) {
      attachCartDrawerListeners(user);
    }
  }

  // Generador de tarjetas de productos
  function renderProductCardsHTML(products, cart) {
    if (products.length === 0) {
      return `
        <div class="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-6">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Sin coincidencias</span>
          <p class="text-sm font-semibold text-slate-700">No encontramos productos con ese nombre</p>
          <button id="btn-reset-filter" class="mt-3 min-h-[44px] px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 tap-feedback">
            Limpiar búsqueda
          </button>
        </div>
      `;
    }

    return products
      .map((product) => {
        const cartItem = cart[product.id];
        const currentQty = cartItem ? cartItem.cantidad : 0;
        const step = product.paso || 0.5;
        const unitLabel = product.unidad_medida === "KG" ? "kg" : "u.";
        const unitSubtitle = product.unidad_medida === "KG" ? "Por kilo" : "Por unidad";

        return `
          <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between gap-3 transition ${
            !product.disponible ? "opacity-40 grayscale pointer-events-none" : ""
          }">
            <!-- Info Producto -->
            <div class="flex-1 min-w-0 pr-1">
              <div class="flex items-center gap-1.5 mb-1">
                <span class="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  ${product.categoria}
                </span>
                <span class="text-[10px] text-slate-300">·</span>
                <span class="text-[10px] font-semibold text-slate-400">
                  ${unitSubtitle}
                </span>
              </div>

              <h3 class="font-extrabold text-slate-900 text-sm leading-tight truncate">
                ${product.nombre}
              </h3>

              <p class="text-[11px] text-slate-400 truncate mt-0.5">
                ${product.detalle || ""}
              </p>

              <div class="mt-1.5 flex items-baseline gap-1">
                <span class="text-base font-black text-emerald-700">
                  $${product.precio.toLocaleString("es-AR")}
                </span>
                <span class="text-xs text-slate-400 font-medium">/ ${unitLabel}</span>
              </div>

              ${
                !product.disponible
                  ? `<span class="inline-block text-[10px] font-bold text-rose-600 uppercase tracking-wider mt-1">Sin Stock</span>`
                  : ""
              }
            </div>

            <!-- Selector de Cantidad / Botón Táctil -->
            <div class="shrink-0">
              ${
                product.disponible
                  ? currentQty === 0
                    ? `
                    <button 
                      data-add-id="${product.id}"
                      data-step="${step}"
                      class="btn-add-initial min-h-[44px] bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition tap-feedback flex items-center gap-1.5 shadow-sm"
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
                        class="btn-qty-dec w-10 h-10 flex items-center justify-center rounded-lg hover:bg-emerald-700 active:scale-90 text-base font-black transition tap-feedback"
                        title="Restar"
                      >
                        −
                      </button>
                      <span class="px-2 text-xs font-black min-w-[50px] text-center tracking-tight select-none">
                        ${currentQty} ${unitLabel}
                      </span>
                      <button 
                        data-inc-id="${product.id}"
                        data-step="${step}"
                        class="btn-qty-inc w-10 h-10 flex items-center justify-center rounded-lg hover:bg-emerald-700 active:scale-90 text-base font-black transition tap-feedback"
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
      .join("");
  }

  function attachCatalogListeners(user) {
    container.querySelector("#btn-banner-active-order")?.addEventListener("click", () => {
      viewingActiveOrder = true;
      update();
    });

    container.querySelector("#btn-change-user")?.addEventListener("click", () => {
      store.logoutUser();
      update();
    });

    container.querySelector("#btn-header-cart")?.addEventListener("click", () => {
      const { totalItems } = store.getCartSummary();
      if (totalItems > 0) {
        isCartOpen = true;
        renderCatalog();
      }
    });

    // Búsqueda en tiempo real sin recargar todo el header
    const searchInput = container.querySelector("#search-input");
    searchInput?.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      const products = store.getProducts();
      const cart = store.getCart();
      const filtered = products.filter((p) => {
        const matchesCategory = selectedCategory === "Todos" || p.categoria === selectedCategory;
        const matchesSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase().trim());
        return matchesCategory && matchesSearch;
      });

      const listContainer = container.querySelector("#products-list-container");
      if (listContainer) {
        listContainer.innerHTML = renderProductCardsHTML(filtered, cart);
        attachProductItemListeners();
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

    container.querySelector("#btn-open-cart")?.addEventListener("click", () => {
      isCartOpen = true;
      renderCatalog();
    });

    attachProductItemListeners();
  }

  function attachProductItemListeners() {
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
  }

  // ========================================================
  // 3. BOTTOM SHEET / DRAWER DE CARRITO & CHECKOUT
  // ========================================================
  function renderCartDrawer(user, items, totalEstimado) {
    const isDelivery = deliveryMode === "DELIVERY";

    return `
      <!-- Backdrop con cierre al tocar fondo -->
      <div id="cart-drawer-backdrop" class="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm flex items-end justify-center animate-fade-in">
        <div id="cart-drawer-sheet" class="bg-white w-full max-w-md rounded-t-3xl max-h-[90vh] flex flex-col shadow-2xl animate-slide-up border-t border-slate-200">
          
          <!-- Handle bar táctil -->
          <div class="w-12 h-1 bg-slate-300 rounded-full mx-auto mt-3"></div>

          <!-- Header Carrito con botón de cierre accesible (44x44px) -->
          <div class="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 class="font-black text-slate-900 text-lg tracking-tight">Tu Pedido</h2>
              <p class="text-[11px] text-slate-400 font-medium">Revisá las cantidades antes de confirmar</p>
            </div>
            <button 
              id="btn-close-cart" 
              class="w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center font-bold text-sm tap-feedback touch-target"
              title="Cerrar pedido"
            >
              X
            </button>
          </div>

          <!-- Lista de Ítems en Carrito con Controles Directos -->
          <div class="p-5 overflow-y-auto space-y-3 flex-1 overscroll-contain">
            ${
              items.length === 0
                ? `<p class="text-xs text-slate-400 text-center py-8">Tu pedido está vacío</p>`
                : items
                    .map(
                      (item) => `
                <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center justify-between gap-3">
                  <div class="flex-1 min-w-0">
                    <span class="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-200/80 text-slate-600">
                      ${item.categoria || "Producto"}
                    </span>
                    <h4 class="font-extrabold text-slate-900 text-sm truncate mt-0.5">${item.nombre}</h4>
                    <p class="text-xs text-slate-400 mt-0.5">
                      $${item.precio_unitario.toLocaleString("es-AR")} / ${item.unidad_medida === "KG" ? "kg" : "u."}
                    </p>
                  </div>

                  <!-- Stepper en Carrito con botones cómodos (38px) -->
                  <div class="flex items-center gap-2">
                    <div class="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-sm">
                      <button 
                        data-drawer-dec="${item.producto_id}" 
                        class="w-8 h-8 flex items-center justify-center text-slate-800 hover:bg-slate-100 active:scale-95 rounded-lg font-black text-sm tap-feedback"
                        title="Restar"
                      >
                        −
                      </button>
                      <span class="px-2 text-xs font-black min-w-[38px] text-center text-slate-900 select-none">
                        ${item.cantidad}
                      </span>
                      <button 
                        data-drawer-inc="${item.producto_id}" 
                        class="w-8 h-8 flex items-center justify-center text-slate-800 hover:bg-slate-100 active:scale-95 rounded-lg font-black text-sm tap-feedback"
                        title="Sumar"
                      >
                        +
                      </button>
                    </div>

                    <div class="text-right min-w-[70px]">
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

            <!-- Selector de Forma de Entrega Segmentado -->
            <div class="pt-3">
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Método de Entrega
              </label>
              <div class="grid grid-cols-2 gap-2">
                <label class="flex flex-col p-3.5 border rounded-2xl cursor-pointer transition tap-feedback ${
                  !isDelivery ? "border-slate-900 bg-slate-900 text-white shadow-sm" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-black">Retiro en Local</span>
                    <input type="radio" name="delivery-mode" value="RETIRO" ${!isDelivery ? "checked" : ""} class="accent-emerald-500" />
                  </div>
                  <span class="text-[10px] opacity-75 mt-1">Listo en 20-30 min · Sin costo</span>
                </label>

                <label class="flex flex-col p-3.5 border rounded-2xl cursor-pointer transition tap-feedback ${
                  isDelivery ? "border-slate-900 bg-slate-900 text-white shadow-sm" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-black">Envío a Domicilio</span>
                    <input type="radio" name="delivery-mode" value="DELIVERY" ${isDelivery ? "checked" : ""} class="accent-emerald-500" />
                  </div>
                  <span class="text-[10px] opacity-75 mt-1">Cadete a tu puerta</span>
                </label>
              </div>
            </div>

            <!-- Campo Dirección de Envío -->
            <div id="delivery-address-container" class="${isDelivery ? "" : "hidden"} pt-1">
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Dirección exacta de entrega
              </label>
              <input 
                type="text" 
                id="delivery-address-input" 
                value="${deliveryAddress}" 
                placeholder="Calle, número, piso y departamento"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-medium outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 transition"
              />
            </div>

            <!-- Explicación de Pesaje Real Transparente -->
            <div class="bg-amber-50/90 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-950 mt-2">
              <div class="flex items-center gap-1.5 mb-1">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                <span class="font-bold text-[11px] uppercase tracking-wider text-amber-900">Pesaje en Balanza</span>
              </div>
              <p class="text-[11px] leading-relaxed opacity-90">
                El total indicado es una estimación. En el mostrador se pesan las unidades reales y te notificaremos el comprobante con los gramos exactos y el importe final.
              </p>
            </div>
          </div>

          <!-- Footer con Confirmación y Safe Area Pad -->
          <div class="p-5 border-t border-slate-100 bg-slate-50 rounded-b-3xl space-y-3 safe-pb">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Total Estimado</span>
                <span class="text-xs text-slate-500 font-medium">Sujeto a balanza</span>
              </div>
              <span class="font-black text-2xl text-slate-900">$${totalEstimado.toLocaleString("es-AR")}</span>
            </div>

            <button 
              id="btn-confirm-order"
              class="w-full min-h-[50px] bg-slate-950 hover:bg-slate-900 active:bg-black text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-950/20 text-sm transition tap-feedback flex items-center justify-center gap-2"
            >
              <span>Confirmar Pedido</span>
              <span class="text-xs text-slate-400">›</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function attachCartDrawerListeners(user) {
    // Cerrar al hacer clic en el backdrop
    const backdrop = container.querySelector("#cart-drawer-backdrop");
    backdrop?.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        isCartOpen = false;
        renderCatalog();
      }
    });

    container.querySelector("#btn-close-cart")?.addEventListener("click", () => {
      isCartOpen = false;
      renderCatalog();
    });

    const addressInput = container.querySelector("#delivery-address-input");
    addressInput?.addEventListener("input", (e) => {
      deliveryAddress = e.target.value;
    });

    const radios = container.querySelectorAll('input[name="delivery-mode"]');
    radios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        deliveryMode = e.target.value;
        renderCatalog();
      });
    });

    // Controles directos de cantidad en drawer (preservando estado de envío)
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
      const mode = deliveryMode;
      const finalAddress = mode === "DELIVERY" ? deliveryAddress.trim() : "Retiro en Mostrador";

      if (mode === "DELIVERY" && !finalAddress) {
        alert("Por favor ingresá tu dirección para coordinar el envío a domicilio.");
        addressInput?.focus();
        return;
      }

      const newOrder = store.createOrder({
        cliente: user,
        tipo_entrega: mode,
        direccion_entrega: finalAddress
      });

      isCartOpen = false;
      viewingActiveOrder = true;
      update();
    });
  }

  // ========================================================
  // 4. PANTALLA DE SEGUIMIENTO DEL PEDIDO (Timeline y Balanza)
  // ========================================================
  function renderOrderTracking(currentOrder) {
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
    } else if (isReady && !isDelivered) {
      stepNumber = 3;
      stepTitle = "Listo para Entrega";
      stepDesc = currentOrder.tipo_entrega === "DELIVERY"
        ? "El pedido fue pesado y el cadete está listo para despachar."
        : "El pedido fue pesado y podés pasar a retirarlo por el local.";
    } else if (isDelivered) {
      stepNumber = 4;
      stepTitle = "Entregado y Cobrado";
      stepDesc = "Pedido finalizado exitosamente. ¡Muchas gracias por tu compra!";
    }

    container.innerHTML = `
      <div class="max-w-md mx-auto p-4 pt-4 pb-28">
        
        <!-- Botón para volver a ver catálogo sin perder el pedido -->
        <div class="mb-3">
          <button 
            id="btn-back-to-catalog" 
            class="min-h-[44px] px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl shadow-sm transition tap-feedback flex items-center gap-1.5"
          >
            <span>‹</span>
            <span>Volver al Catálogo</span>
          </button>
        </div>

        <div class="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-200/80 text-left">
          
          <!-- Encabezado de la Orden -->
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Comprobante Digital</span>
              <h2 class="text-xl font-black text-slate-900 tracking-tight">Pedido #${currentOrder.id}</h2>
            </div>
            <span class="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${
              isDelivered
                ? "bg-slate-100 text-slate-800 border border-slate-300"
                : isReady
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse"
                : isWeighing
                ? "bg-blue-100 text-blue-800 border border-blue-300 animate-pulse"
                : "bg-amber-100 text-amber-800 border border-amber-300"
            }">
              ${currentOrder.estado}
            </span>
          </div>

          <!-- Línea de Progreso (Timeline Minimalista de 4 Pasos) -->
          <div class="my-5">
            <div class="grid grid-cols-4 gap-1.5 text-center">
              <div class="h-1.5 rounded-full ${stepNumber >= 1 ? "bg-slate-900" : "bg-slate-200"}"></div>
              <div class="h-1.5 rounded-full ${stepNumber >= 2 ? (stepNumber > 2 ? "bg-slate-900" : "bg-blue-600") : "bg-slate-200"}"></div>
              <div class="h-1.5 rounded-full ${stepNumber >= 3 ? (stepNumber > 3 ? "bg-slate-900" : "bg-emerald-600") : "bg-slate-200"}"></div>
              <div class="h-1.5 rounded-full ${stepNumber >= 4 ? "bg-slate-900" : "bg-slate-200"}"></div>
            </div>
            <div class="mt-3">
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-extrabold text-slate-900">${stepTitle}</h3>
                ${
                  isWeighing || (isReady && !isDelivered)
                    ? `<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>`
                    : ""
                }
              </div>
              <p class="text-xs text-slate-500 mt-0.5 leading-relaxed">${stepDesc}</p>
            </div>
          </div>

          <!-- Resumen Financiero -->
          <div class="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
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
                  const pesoTexto =
                    item.peso_real !== null
                      ? `${item.peso_real} ${item.unidad_medida === "KG" ? "kg" : "u."} (pesado)`
                      : `${item.cantidad_solicitada} ${item.unidad_medida === "KG" ? "kg" : "u."} (aprox)`;
                  return `
                  <div class="py-2.5 flex items-center justify-between gap-2 ${item.sin_stock ? "opacity-40 line-through" : ""}">
                    <div>
                      <span class="font-bold text-slate-800 text-xs">${item.nombre}</span>
                      <span class="text-[11px] text-slate-400 block">${pesoTexto}</span>
                    </div>
                    <strong class="text-slate-900 font-bold text-xs">
                      $${(item.subtotal || 0).toLocaleString("es-AR")}
                    </strong>
                  </div>
                `;
                })
                .join("")}
            </div>
          </div>

          <!-- Acciones de Seguimiento -->
          <div class="mt-6 pt-4 border-t border-slate-100 space-y-2">
            <button 
              id="btn-new-order" 
              class="w-full min-h-[46px] py-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition tap-feedback"
            >
              Realizar Otro Pedido
            </button>
          </div>
        </div>
      </div>
    `;

    container.querySelector("#btn-back-to-catalog")?.addEventListener("click", () => {
      viewingActiveOrder = false;
      update();
    });

    container.querySelector("#btn-new-order")?.addEventListener("click", () => {
      store.setActiveOrderId(null);
      viewingActiveOrder = false;
      update();
    });
  }

  // Suscripción reactiva al store
  const unsubscribe = store.subscribe((event) => {
    if (
      event === "cart_changed" ||
      event === "products_changed" ||
      event === "orders_changed" ||
      event === "active_order_changed" ||
      event === "storage_sync" ||
      event === "user_changed"
    ) {
      update();
    }
  });

  update();
  return () => unsubscribe();
}
