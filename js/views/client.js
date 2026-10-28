import { store } from "../store.js";
import { CATEGORIAS } from "../products-data.js";

export function renderClientView(container) {
  let selectedCategory = "Todos";
  let searchQuery = "";
  let isCartOpen = false;
  let activeOrder = null; // si acaba de hacer un pedido

  function update() {
    container.innerHTML = "";
    const user = store.getCurrentUser();

    // Si no está identificado, mostramos la pantalla de bienvenida / login por teléfono
    if (!user) {
      renderPhoneGate();
      return;
    }

    // Si tiene un pedido reciente activo, mostramos el seguimiento
    if (activeOrder) {
      renderOrderTracking();
      return;
    }

    // Pantalla principal del catálogo
    renderCatalog();
  }

  // --- 1. Puerta de Ingreso por Teléfono ---
  function renderPhoneGate() {
    container.innerHTML = `
      <div class="max-w-md mx-auto p-4 pt-10">
        <div class="bg-white rounded-3xl p-6 shadow-xl border border-emerald-100 text-center">
          <div class="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
            🥕
          </div>
          <h2 class="text-2xl font-bold text-gray-800">Verdulería Mi Huerta</h2>
          <p class="text-sm text-gray-500 mt-1 mb-6">Pedí fresco directo del cajón a tu casa</p>

          <form id="phone-form" class="space-y-4 text-left">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                Tu número de WhatsApp
              </label>
              <div class="relative">
                <span class="absolute left-3 top-3 text-gray-400 font-medium">+54 9</span>
                <input 
                  type="tel" 
                  id="phone-input" 
                  required 
                  placeholder="11 2345 6789" 
                  value="1123456789"
                  class="w-full pl-20 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-gray-800 font-semibold text-lg outline-none transition"
                />
              </div>
              <p class="text-xs text-gray-400 mt-1">Con tu número reconocemos tu cuenta y te avisamos cuando el pedido esté pesado.</p>
            </div>

            <div id="new-user-fields" class="space-y-3 pt-2">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Tu Nombre
                </label>
                <input 
                  type="text" 
                  id="name-input" 
                  placeholder="Ej: Facundo" 
                  class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-gray-800 outline-none"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Dirección habitual (opcional)
                </label>
                <input 
                  type="text" 
                  id="address-input" 
                  placeholder="Ej: Av. Rivadavia 4520" 
                  class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-gray-800 outline-none"
                />
              </div>
            </div>

            <button 
              type="submit" 
              class="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-600/30 transition transform active:scale-98 flex items-center justify-center gap-2 mt-4"
            >
              <span>Entrar al Catálogo</span>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </button>
          </form>

          <div class="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400">
            <span class="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Precios del día actualizados
          </div>
        </div>
      </div>
    `;

    const phoneForm = container.querySelector("#phone-form");
    const phoneInput = container.querySelector("#phone-input");
    const nameInput = container.querySelector("#name-input");
    const addressInput = container.querySelector("#address-input");

    // Autodetectar cliente si el teléfono ya existe
    phoneInput.addEventListener("input", (e) => {
      const existing = store.getCustomer(e.target.value);
      if (existing) {
        nameInput.value = existing.nombre;
        addressInput.value = existing.direccion || "";
      }
    });

    // Simular que el teléfono de prueba precargado ya existe
    const initialMatch = store.getCustomer(phoneInput.value);
    if (initialMatch) {
      nameInput.value = initialMatch.nombre;
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

    // Filtrar productos
    const filteredProducts = products.filter((p) => {
      const matchesCategory = selectedCategory === "Todos" || p.categoria === selectedCategory;
      const matchesSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    container.innerHTML = `
      <div class="max-w-md mx-auto pb-28">
        <!-- Header del Cliente -->
        <header class="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl shadow-inner">
                🥬
              </div>
              <div>
                <h1 class="font-extrabold text-gray-900 leading-tight">Mi Huerta</h1>
                <p class="text-xs text-gray-500 flex items-center gap-1">
                  <span>Hola, <strong class="text-emerald-700">${user.nombre}</strong></span>
                  <button id="btn-change-user" class="text-xs text-gray-400 underline hover:text-gray-600">(Cambiar)</button>
                </p>
              </div>
            </div>
            <div class="text-right">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Abierto
              </span>
            </div>
          </div>

          <!-- Buscador -->
          <div class="mt-3 relative">
            <svg class="w-4 h-4 text-gray-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input 
              type="text" 
              id="search-input" 
              placeholder="Buscar papa, manzana, acelga..." 
              value="${searchQuery}"
              class="w-full pl-10 pr-4 py-2 bg-gray-100 hover:bg-gray-150 focus:bg-white border border-transparent focus:border-emerald-300 rounded-xl text-sm outline-none transition"
            />
          </div>

          <!-- Píldoras de Categorías -->
          <div class="mt-2.5 flex gap-1.5 overflow-x-auto no-scrollbar py-1">
            ${CATEGORIAS.map(
              (cat) => `
              <button 
                data-category="${cat}"
                class="category-pill whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }"
              >
                ${cat}
              </button>
            `
            ).join("")}
          </div>
        </header>

        <!-- Lista de Productos -->
        <main class="p-4 space-y-3">
          ${
            filteredProducts.length === 0
              ? `
            <div class="text-center py-12 text-gray-400">
              <span class="text-4xl block mb-2">🔍</span>
              <p class="font-medium">No encontramos productos con ese nombre</p>
            </div>
          `
              : filteredProducts
                  .map((product) => {
                    const cartItem = cart[product.id];
                    const currentQty = cartItem ? cartItem.cantidad : 0;
                    const step = product.paso || 0.5;
                    const unitLabel = product.unidad_medida === "KG" ? "kg" : "u.";

                    return `
              <div class="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm flex items-center justify-between gap-3 ${
                !product.disponible ? "opacity-50 grayscale" : ""
              }">
                <!-- Info Producto -->
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <div class="w-14 h-14 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-3xl shrink-0">
                    ${product.icono || "🍎"}
                  </div>
                  <div class="min-w-0">
                    <h3 class="font-bold text-gray-900 text-sm truncate">${product.nombre}</h3>
                    <p class="text-xs text-gray-500">
                      $${product.precio.toLocaleString("es-AR")} 
                      <span class="text-gray-400">/ ${unitLabel}</span>
                    </p>
                    ${
                      !product.disponible
                        ? `<span class="inline-block text-[10px] font-bold text-red-500 uppercase tracking-wider mt-0.5">Agotado por hoy</span>`
                        : ""
                    }
                  </div>
                </div>

                <!-- Selector de Cantidad -->
                ${
                  product.disponible
                    ? currentQty === 0
                      ? `
                      <button 
                        data-add-id="${product.id}"
                        data-step="${step}"
                        class="btn-add-initial shrink-0 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 active:scale-95 px-3 py-2 rounded-xl text-xs font-bold border border-emerald-200 flex items-center gap-1 transition"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
                        <span>Pedir</span>
                      </button>
                    `
                      : `
                      <div class="shrink-0 flex items-center bg-emerald-600 rounded-xl p-1 text-white shadow-sm">
                        <button 
                          data-dec-id="${product.id}"
                          data-step="${step}"
                          class="btn-qty-dec w-7 h-7 flex items-center justify-center rounded-lg hover:bg-emerald-700 active:scale-90 font-bold transition"
                        >
                          -
                        </button>
                        <span class="px-2 text-xs font-extrabold min-w-[42px] text-center">
                          ${currentQty} ${unitLabel}
                        </span>
                        <button 
                          data-inc-id="${product.id}"
                          data-step="${step}"
                          class="btn-qty-inc w-7 h-7 flex items-center justify-center rounded-lg hover:bg-emerald-700 active:scale-90 font-bold transition"
                        >
                          +
                        </button>
                      </div>
                    `
                    : ""
                }
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
          <div class="fixed bottom-0 left-0 right-0 p-3 z-30 pointer-events-none">
            <div class="max-w-md mx-auto pointer-events-auto">
              <button 
                id="btn-open-cart"
                class="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white p-3.5 rounded-2xl shadow-xl shadow-emerald-900/30 flex items-center justify-between transition transform active:scale-98 border border-emerald-500"
              >
                <div class="flex items-center gap-2.5">
                  <span class="bg-emerald-800 text-white font-extrabold text-xs px-2.5 py-1 rounded-full">
                    ${totalItems}
                  </span>
                  <div class="text-left">
                    <span class="text-xs text-emerald-200 block uppercase font-bold tracking-wide">Total Estimado</span>
                    <span class="font-extrabold text-base">$${totalEstimado.toLocaleString("es-AR")}</span>
                  </div>
                </div>
                <div class="flex items-center gap-1 font-bold text-sm bg-white/20 px-3 py-1.5 rounded-xl">
                  <span>Ver Pedido</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
                </div>
              </button>
            </div>
          </div>
        `
            : ""
        }

        <!-- Modal Drawer del Carrito / Checkout -->
        ${isCartOpen ? renderCartDrawer(user, cartItems, totalEstimado) : ""}
      </div>
    `;

    // Listeners del catálogo
    container.querySelector("#btn-change-user").addEventListener("click", () => {
      store.logoutUser();
      update();
    });

    const searchInput = container.querySelector("#search-input");
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderCatalog();
      // restaurar foco
      const newSearch = container.querySelector("#search-input");
      newSearch.focus();
      newSearch.setSelectionRange(searchQuery.length, searchQuery.length);
    });

    container.querySelectorAll(".category-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedCategory = btn.dataset.category;
        renderCatalog();
      });
    });

    // Botones de agregar / restar
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

    const btnOpenCart = container.querySelector("#btn-open-cart");
    if (btnOpenCart) {
      btnOpenCart.addEventListener("click", () => {
        isCartOpen = true;
        renderCatalog();
      });
    }

    if (isCartOpen) {
      attachCartDrawerListeners(user);
    }
  }

  // --- 3. Drawer del Carrito y Confirmación ---
  function renderCartDrawer(user, items, totalEstimado) {
    return `
      <div class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-end justify-center">
        <div class="bg-white w-full max-w-md rounded-t-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
          <!-- Header Carrito -->
          <div class="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 class="font-extrabold text-gray-900 text-lg flex items-center gap-2">
              <span>🧺</span> Tu Pedido Fresco
            </h2>
            <button id="btn-close-cart" class="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center font-bold">
              ✕
            </button>
          </div>

          <!-- Lista de Ítems en Carrito -->
          <div class="p-4 overflow-y-auto space-y-3 flex-1">
            ${items
              .map(
                (item) => `
              <div class="flex items-center justify-between text-sm py-2 border-b border-gray-50">
                <div class="flex items-center gap-2.5">
                  <span class="text-2xl">${item.icono}</span>
                  <div>
                    <h4 class="font-bold text-gray-800">${item.nombre}</h4>
                    <p class="text-xs text-gray-400">
                      ${item.cantidad} ${item.unidad_medida === "KG" ? "kg" : "u."} × $${item.precio_unitario}
                    </p>
                  </div>
                </div>
                <div class="font-extrabold text-gray-900">
                  $${item.subtotal_estimado.toLocaleString("es-AR")}
                </div>
              </div>
            `
              )
              .join("")}

            <!-- Opciones de Entrega -->
            <div class="pt-3">
              <label class="block text-xs font-bold uppercase text-gray-600 mb-2">Forma de Entrega</label>
              <div class="grid grid-cols-2 gap-2">
                <label class="flex items-center gap-2 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50/50">
                  <input type="radio" name="delivery-mode" value="RETIRO" checked class="text-emerald-600" />
                  <span class="text-xs font-bold text-gray-800">Retiro en Local</span>
                </label>
                <label class="flex items-center gap-2 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50/50">
                  <input type="radio" name="delivery-mode" value="DELIVERY" class="text-emerald-600" />
                  <span class="text-xs font-bold text-gray-800">Envío a Domicilio</span>
                </label>
              </div>
            </div>

            <!-- Campo Dirección de Envío -->
            <div id="delivery-address-container" class="hidden pt-2">
              <label class="block text-xs font-semibold text-gray-600 mb-1">Dirección de entrega</label>
              <input 
                type="text" 
                id="delivery-address-input" 
                value="${user.direccion || ""}" 
                placeholder="Calle, número, piso/depto"
                class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <!-- Disclaimer de Pesaje Real -->
            <div class="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-800 mt-2 flex items-start gap-2">
              <span class="text-base">⚖️</span>
              <p>
                <strong>Nota sobre el pesaje:</strong> Este es un precio aproximado. En la verdulería pesarán tus productos y te mandaremos el total exacto.
              </p>
            </div>
          </div>

          <!-- Footer con Confirmación -->
          <div class="p-4 border-t border-gray-100 bg-gray-50 rounded-b-3xl space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-bold text-gray-600">Total Estimado:</span>
              <span class="font-extrabold text-2xl text-emerald-700">$${totalEstimado.toLocaleString("es-AR")}</span>
            </div>

            <button 
              id="btn-confirm-order"
              class="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-700/20 text-base transition flex items-center justify-center gap-2"
            >
              <span>Confirmar Pedido</span>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function attachCartDrawerListeners(user) {
    const btnClose = container.querySelector("#btn-close-cart");
    if (btnClose) {
      btnClose.addEventListener("click", () => {
        isCartOpen = false;
        renderCatalog();
      });
    }

    const radios = container.querySelectorAll('input[name="delivery-mode"]');
    const addressContainer = container.querySelector("#delivery-address-container");
    radios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        if (e.target.value === "DELIVERY") {
          addressContainer.classList.remove("hidden");
        } else {
          addressContainer.classList.add("hidden");
        }
      });
    });

    const btnConfirm = container.querySelector("#btn-confirm-order");
    if (btnConfirm) {
      btnConfirm.addEventListener("click", () => {
        const mode = container.querySelector('input[name="delivery-mode"]:checked').value;
        const addressInput = container.querySelector("#delivery-address-input");
        const address = mode === "DELIVERY" ? addressInput.value.trim() : "Retiro en local";

        if (mode === "DELIVERY" && !address) {
          alert("Por favor ingresá tu dirección para el envío.");
          addressInput.focus();
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
  }

  // --- 4. Pantalla de Seguimiento del Pedido ---
  function renderOrderTracking() {
    // Buscar el estado más actualizado de este pedido en el store
    const currentOrder = store.getOrders().find((o) => o.id === activeOrder.id) || activeOrder;
    const isReady = currentOrder.estado === "LISTO" || currentOrder.estado === "ENTREGADO";

    container.innerHTML = `
      <div class="max-w-md mx-auto p-4 pt-8">
        <div class="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 text-center">
          
          <!-- Icono de Estado Dinámico -->
          <div class="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-4xl mb-4 shadow-sm ${
            isReady ? "bg-emerald-100 text-emerald-600 animate-bounce" : "bg-amber-100 text-amber-600"
          }">
            ${isReady ? "🎉" : "⚖️"}
          </div>

          <span class="text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full ${
            isReady ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
          }">
            Pedido #${currentOrder.id} • ${currentOrder.estado}
          </span>

          <h2 class="text-2xl font-black text-gray-900 mt-3">
            ${isReady ? "¡Tu pedido está listo!" : "Estamos pesando tu pedido"}
          </h2>

          <p class="text-sm text-gray-500 mt-2">
            ${
              isReady
                ? "Ya podés pasar a retirarlo o esperar al cadete."
                : "Te mandaremos un WhatsApp apenas esté listo."
            }
          </p>

          <!-- Resumen de Costos -->
          <div class="bg-gray-50 rounded-2xl p-4 my-6 text-left border border-gray-100 space-y-2">
            <div class="flex justify-between text-xs text-gray-500">
              <span>Tipo de Entrega:</span>
              <strong class="text-gray-800">${currentOrder.tipo_entrega === "DELIVERY" ? "Envío a Domicilio" : "Retiro en Local"}</strong>
            </div>
            
            ${
              isReady && currentOrder.total_real !== null
                ? `
                <div class="pt-2 border-t border-gray-200">
                  <div class="flex justify-between items-center text-sm">
                    <span class="text-gray-500">Total Estimado original:</span>
                    <span class="line-through text-gray-400">$${currentOrder.total_estimado.toLocaleString("es-AR")}</span>
                  </div>
                  <div class="flex justify-between items-center mt-1">
                    <span class="font-extrabold text-gray-800 text-base">Total Final Pesado:</span>
                    <span class="font-black text-2xl text-emerald-700">$${currentOrder.total_real.toLocaleString("es-AR")}</span>
                  </div>
                </div>
              `
                : `
                <div class="flex justify-between items-center text-sm pt-2 border-t border-gray-200">
                  <span class="text-gray-600">Total Estimado:</span>
                  <span class="font-bold text-gray-800 text-lg">$${currentOrder.total_estimado.toLocaleString("es-AR")}</span>
                </div>
              `
            }
          </div>

          <!-- Desglose de Ítems -->
          <div class="text-left mb-6">
            <h4 class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Detalle de productos:</h4>
            <div class="space-y-1.5 text-xs text-gray-600 max-h-40 overflow-y-auto pr-1">
              ${currentOrder.items
                .map((item) => {
                  const pesoTexto = item.peso_real !== null
                    ? `${item.peso_real} ${item.unidad_medida === "KG" ? "kg" : "u."} (pesado)`
                    : `${item.cantidad_solicitada} ${item.unidad_medida === "KG" ? "kg" : "u."} (aprox)`;
                  return `
                    <div class="flex justify-between py-1 border-b border-gray-100 ${item.sin_stock ? "line-through text-red-400" : ""}">
                      <span>${item.icono} ${item.nombre} <small class="text-gray-400">(${pesoTexto})</small></span>
                      <strong class="text-gray-800">$${(item.subtotal || 0).toLocaleString("es-AR")}</strong>
                    </div>
                  `;
                })
                .join("")}
            </div>
          </div>

          <button 
            id="btn-new-order" 
            class="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition"
          >
            Hacer un nuevo pedido
          </button>
        </div>
      </div>
    `;

    container.querySelector("#btn-new-order").addEventListener("click", () => {
      activeOrder = null;
      update();
    });
  }

  // Suscribirse al store para actualizar en vivo si el operario cambia el estado
  const unsubscribe = store.subscribe((event) => {
    if (event === "cart_changed" || event === "products_changed" || event === "orders_changed" || event === "storage_sync") {
      update();
    }
  });

  // Render inicial
  update();

  return () => unsubscribe();
}
