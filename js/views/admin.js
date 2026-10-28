import { store } from "../store.js";
import { CATEGORIAS } from "../products-data.js";

export function renderAdminView(container) {
  let selectedCategory = "Todos";
  let searchQuery = "";
  let showCloudSettings = false;
  let configSavedToast = false;

  function update() {
    container.innerHTML = "";
    const products = store.getProducts();
    const cloudConfig = store.getCloudConfig();
    const isConnected = store.isCloudConnected();

    const filtered = products.filter((p) => {
      const matchCat = selectedCategory === "Todos" || p.categoria === selectedCategory;
      const matchSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchCat && matchSearch;
    });

    const categoryCounts = {};
    CATEGORIAS.forEach((cat) => {
      categoryCounts[cat] =
        cat === "Todos"
          ? products.length
          : products.filter((p) => p.categoria === cat).length;
    });

    container.innerHTML = `
      <div class="max-w-xl mx-auto p-4 pb-32">
        <!-- Header del Panel -->
        <header class="sticky sticky-header-offset z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/90 pt-3 pb-3 mb-4 -mx-4 px-4 shadow-xs">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-0.5">
                Panel de Administración
              </span>
              <h1 class="font-black text-slate-900 text-lg tracking-tight">Precios y Catálogo</h1>
              <p class="text-xs text-slate-500 mt-0.5">Ajustá los valores del día en tiempo real.</p>
            </div>
            <div class="flex flex-col items-end gap-1.5">
              <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isConnected ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
              }">
                ${isConnected ? "Cloud Online" : "Modo Local"}
              </span>
              <button 
                id="btn-toggle-cloud"
                class="text-[11px] font-bold px-2.5 py-1 rounded-lg border transition tap-feedback ${
                  isConnected
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }"
              >
                ${showCloudSettings ? "Cerrar Config" : "Config Cloud"}
              </button>
            </div>
          </div>

          <!-- Buscador rápido para celular -->
          <div class="mt-3.5 relative">
            <input 
              type="text" 
              id="admin-search-input" 
              placeholder="Buscar producto por nombre..." 
              value="${searchQuery}"
              class="w-full pl-3.5 pr-16 py-2.5 bg-slate-100 focus:bg-white border border-transparent focus:border-slate-300 rounded-xl text-base font-medium outline-none transition"
            />
            ${
              searchQuery
                ? `<button id="btn-admin-clear-search" class="absolute right-1 top-1 h-9 px-3 flex items-center justify-center text-slate-400 hover:text-slate-700 text-xs font-bold tap-feedback">Borrar</button>`
                : ""
            }
          </div>

          ${
            showCloudSettings
              ? `
            <div class="mt-3 p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 animate-fade-in text-xs space-y-3">
              <div class="flex items-center justify-between pb-2 border-b border-slate-800">
                <span class="font-black text-slate-200 uppercase tracking-wider text-[11px]">Sincronización Cloud & PIN</span>
                ${
                  configSavedToast
                    ? `<span class="text-[10px] font-bold text-emerald-400 uppercase bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">Guardado</span>`
                    : ""
                }
              </div>

              <form id="cloud-config-form" class="space-y-2.5">
                <div>
                  <label class="block text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">PIN del Negocio (Staff)</label>
                  <input 
                    type="password" 
                    id="cfg-pin" 
                    maxlength="6"
                    value="${cloudConfig.staffPin || "1234"}" 
                    class="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-base font-bold outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label class="block text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Supabase URL</label>
                  <input 
                    type="url" 
                    id="cfg-url" 
                    value="${cloudConfig.supabaseUrl || ""}" 
                    placeholder="https://xyz.supabase.co"
                    class="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-base outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label class="block text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Supabase Anon Key</label>
                  <input 
                    type="password" 
                    id="cfg-key" 
                    value="${cloudConfig.supabaseAnonKey || ""}" 
                    placeholder="eyJhbG..."
                    class="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-base outline-none focus:border-emerald-500"
                  />
                </div>

                <div class="pt-1 flex gap-2">
                  <button 
                    type="submit" 
                    class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition"
                  >
                    Guardar y Conectar
                  </button>
                </div>
              </form>
            </div>
          `
              : ""
          }

          <!-- Filtro de Categorías Táctil con conteo -->
          <div class="mt-3.5 flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            ${CATEGORIAS.map(
              (cat) => `
              <button 
                data-admin-cat="${cat}"
                class="admin-cat-pill whitespace-nowrap min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-bold transition tap-feedback flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }"
              >
                <span>${cat}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded-full ${
                  selectedCategory === cat ? "bg-slate-800 text-slate-200 font-black" : "bg-slate-200 text-slate-600"
                }">
                  ${categoryCounts[cat] || 0}
                </span>
              </button>
            `
            ).join("")}
          </div>
        </header>

        <!-- Lista de Productos y Precios -->
        <div id="admin-products-list" class="space-y-2.5">
          ${renderAdminProductsListHTML(filtered)}
        </div>
      </div>
    `;

    attachAdminListeners();
  }

  function renderAdminProductsListHTML(filtered) {
    if (filtered.length === 0) {
      return `
        <div class="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 p-6">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Sin resultados</span>
          <p class="text-sm font-semibold text-slate-700">No encontramos productos con ese nombre</p>
        </div>
      `;
    }

    return filtered
      .map((p) => {
        const unit = p.unidad_medida === "KG" ? "kg" : "u.";

        return `
          <div id="product-card-${p.id}" class="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 transition">
            <div class="flex-1 min-w-[160px]">
              <div class="flex items-center gap-1.5 mb-0.5">
                <span class="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  ${p.categoria}
                </span>
                <span class="text-[10px] text-slate-400 font-medium">${p.unidad_medida === "KG" ? "Por kilo" : "Por unidad"}</span>
              </div>
              <h3 class="font-extrabold text-slate-900 text-sm leading-tight">${p.nombre}</h3>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <!-- Stepper rápido -100 / +100 -->
              <button 
                type="button"
                data-step-price="${p.id}"
                data-delta="-100"
                class="btn-step-price w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs transition tap-feedback"
                title="Bajar $100"
              >
                −
              </button>

              <div class="relative w-28">
                <span class="absolute left-2.5 top-2.5 text-xs font-bold text-slate-400 select-none pointer-events-none">$</span>
                <input 
                  type="number" 
                  data-product-id="${p.id}"
                  value="${p.precio}" 
                  step="50"
                  min="0"
                  inputmode="numeric"
                  class="input-price w-full pl-6 pr-6 py-2 bg-slate-50 border border-slate-300 rounded-xl text-center font-black text-base text-slate-900 outline-none focus:bg-white focus:border-slate-900 transition"
                />
                <span class="absolute right-2 top-2.5 text-[11px] font-semibold text-slate-400 select-none pointer-events-none">${unit}</span>
              </div>

              <button 
                type="button"
                data-step-price="${p.id}"
                data-delta="100"
                class="btn-step-price w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs transition tap-feedback"
                title="Subir $100"
              >
                +
              </button>

              <!-- Botón Switch Activo / Pausado (44px min) -->
              <button 
                data-toggle-stock="${p.id}"
                class="btn-stock-toggle min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold transition tap-feedback ${
                  p.disponible
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100"
                    : "bg-slate-100 text-slate-500 border border-slate-300 hover:bg-slate-200"
                }"
              >
                ${p.disponible ? "Activo" : "Pausado"}
              </button>
            </div>
          </div>
        `;
      })
      .join("");
  }

  function attachAdminListeners() {
    // Búsqueda en vivo sin recrear el DOM del input
    const searchInput = container.querySelector("#admin-search-input");
    searchInput?.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      const products = store.getProducts();
      const filtered = products.filter((p) => {
        const matchCat = selectedCategory === "Todos" || p.categoria === selectedCategory;
        const matchSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase().trim());
        return matchCat && matchSearch;
      });

      const listContainer = container.querySelector("#admin-products-list");
      if (listContainer) {
        listContainer.innerHTML = renderAdminProductsListHTML(filtered);
        attachProductItemAdminListeners();
      }
    });

    container.querySelector("#btn-admin-clear-search")?.addEventListener("click", () => {
      searchQuery = "";
      update();
    });

    const btnToggleCloud = container.querySelector("#btn-toggle-cloud");
    if (btnToggleCloud) {
      btnToggleCloud.addEventListener("click", () => {
        showCloudSettings = !showCloudSettings;
        configSavedToast = false;
        update();
      });
    }

    const cloudForm = container.querySelector("#cloud-config-form");
    if (cloudForm) {
      cloudForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const pin = container.querySelector("#cfg-pin")?.value || "";
        const url = container.querySelector("#cfg-url")?.value || "";
        const key = container.querySelector("#cfg-key")?.value || "";
        store.saveCloudConfig({
          staffPin: pin,
          supabaseUrl: url,
          supabaseAnonKey: key
        });
        configSavedToast = true;
        update();
      });
    }

    container.querySelectorAll(".admin-cat-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedCategory = btn.dataset.adminCat;
        update();
      });
    });

    attachProductItemAdminListeners();
  }

  function attachProductItemAdminListeners() {
    // Inputs de precio directo
    container.querySelectorAll(".input-price").forEach((input) => {
      input.addEventListener("change", (e) => {
        const id = e.target.dataset.productId;
        const val = Math.max(0, Number(e.target.value) || 0);
        store.updateProductPrice(id, val);
        if (navigator.vibrate) { try { navigator.vibrate(15); } catch {} }

        const card = container.querySelector(`#product-card-${id}`);
        if (card) {
          card.classList.add("flash-saved");
          setTimeout(() => card.classList.remove("flash-saved"), 1200);
        }
      });
    });

    // Ajuste rápido con botones +/- 100
    container.querySelectorAll(".btn-step-price").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (navigator.vibrate) { try { navigator.vibrate(10); } catch {} }
        const id = btn.dataset.stepPrice;
        const delta = Number(btn.dataset.delta);
        const input = container.querySelector(`.input-price[data-product-id="${id}"]`);
        if (input) {
          const current = Number(input.value) || 0;
          const next = Math.max(0, current + delta);
          input.value = next;
          store.updateProductPrice(id, next);

          const card = container.querySelector(`#product-card-${id}`);
          if (card) {
            card.classList.add("flash-saved");
            setTimeout(() => card.classList.remove("flash-saved"), 1200);
          }
        }
      });
    });

    // Toggle de disponibilidad
    container.querySelectorAll(".btn-stock-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (navigator.vibrate) { try { navigator.vibrate(15); } catch {} }
        const id = btn.dataset.toggleStock;
        store.toggleProductStock(id);
      });
    });
  }

  const unsubscribe = store.subscribe((event) => {
    const isTyping = document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "SELECT");
    if ((event === "products_changed" || event === "storage_sync" || event === "cloud_connected") && !isTyping) {
      update();
    }
  });

  update();
  return () => unsubscribe();
}
