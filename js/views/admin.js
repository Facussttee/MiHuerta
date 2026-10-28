import { store } from "../store.js";
import { CATEGORIAS } from "../products-data.js";

export function renderAdminView(container) {
  let selectedCategory = "Todos";
  let showCloudSettings = false;
  let configSavedToast = false;

  function update() {
    container.innerHTML = "";
    const products = store.getProducts();
    const cloudConfig = store.getCloudConfig();
    const isConnected = store.isCloudConnected();

    const filtered = products.filter(
      (p) => selectedCategory === "Todos" || p.categoria === selectedCategory
    );

    container.innerHTML = `
      <div class="max-w-xl mx-auto p-4 pb-32">
        <!-- Header Dueño / Admin -->
        <div class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm mb-4">
          <div class="flex items-center justify-between gap-2">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-0.5">
                Panel de Administración
              </span>
              <h1 class="font-black text-slate-900 text-lg tracking-tight">Precios y Disponibilidad</h1>
              <p class="text-xs text-slate-500 mt-0.5">Ajustá los valores del día en tiempo real.</p>
            </div>
            <div class="flex flex-col items-end gap-1.5">
              <span class="text-xs font-black px-3 py-1 bg-slate-100 text-slate-800 rounded-full border border-slate-200">
                ${products.length} productos
              </span>
              <button 
                id="btn-toggle-cloud"
                class="text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                  isConnected
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }"
              >
                ${isConnected ? "Cloud Conectado" : "Configurar PIN / Cloud"}
              </button>
            </div>
          </div>

          ${
            showCloudSettings
              ? `
            <form id="cloud-config-form" class="mt-4 pt-4 border-t border-slate-100 space-y-3 text-left">
              <div class="flex items-center justify-between">
                <h2 class="text-xs font-black uppercase tracking-wider text-slate-800">Seguridad y Base de Datos Cloud</h2>
                ${
                  configSavedToast
                    ? `<span class="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Guardado</span>`
                    : ""
                }
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1">PIN de acceso para Operario y Dueño (4 dígitos)</label>
                <input 
                  type="text" 
                  id="cfg-pin" 
                  maxlength="8"
                  inputmode="numeric"
                  value="${cloudConfig.staffPin || "1234"}"
                  class="w-36 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-black text-sm text-slate-900 outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1">Supabase Project URL (opcional para modo Cloud)</label>
                <input 
                  type="url" 
                  id="cfg-url" 
                  placeholder="https://xyzcompany.supabase.co"
                  value="${cloudConfig.supabaseUrl || ""}"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1">Supabase Anon Public Key</label>
                <input 
                  type="password" 
                  id="cfg-key" 
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                  value="${cloudConfig.supabaseAnonKey || ""}"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div class="flex justify-end gap-2 pt-1">
                <button 
                  type="submit"
                  class="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs transition tap-feedback"
                >
                  Guardar configuración
                </button>
              </div>
            </form>
          `
              : ""
          }

          <!-- Filtro de Categorías Táctil -->
          <div class="mt-4 flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            ${CATEGORIAS.map(
              (cat) => `
              <button 
                data-admin-cat="${cat}"
                class="admin-cat-pill whitespace-nowrap min-h-[38px] px-4 py-1.5 rounded-full text-xs font-bold transition tap-feedback ${
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
        </div>

        <!-- Lista de Productos y Precios con Inputs de 16px -->
        <div class="space-y-2.5">
          ${filtered
            .map((p) => {
              const unit = p.unidad_medida === "KG" ? "kg" : "unidad";

              return `
              <div class="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex items-center justify-between gap-3 transition">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1.5 mb-0.5">
                    <span class="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      ${p.categoria}
                    </span>
                    <span class="text-[10px] text-slate-300">·</span>
                    <span class="text-[10px] text-slate-400 font-medium">Por ${unit}</span>
                  </div>
                  <h3 class="font-extrabold text-slate-900 text-sm truncate mt-0.5">${p.nombre}</h3>
                  <p class="text-[11px] text-slate-400 truncate">${p.detalle || ""}</p>
                </div>

                <!-- Campo de Precio Editable y Switch de Stock -->
                <div class="flex items-center gap-2 shrink-0">
                  <div class="relative w-28">
                    <span class="absolute left-3 top-2.5 text-sm font-bold text-slate-400 select-none">$</span>
                    <input 
                      type="number" 
                      inputmode="numeric"
                      step="50"
                      min="0"
                      data-product-id="${p.id}"
                      value="${p.precio}"
                      class="input-price w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-black text-base text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition"
                    />
                  </div>

                  <!-- Botón Switch Disponible / Pausado (44px min) -->
                  <button 
                    data-toggle-stock="${p.id}"
                    class="btn-stock-toggle min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition tap-feedback ${
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
            .join("")}
        </div>
      </div>
    `;

    // Listeners
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
        const pin = container.querySelector("#cfg-pin").value;
        const url = container.querySelector("#cfg-url").value;
        const key = container.querySelector("#cfg-key").value;
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

    container.querySelectorAll(".input-price").forEach((input) => {
      input.addEventListener("change", (e) => {
        const id = e.target.dataset.productId;
        const val = Number(e.target.value);
        store.updateProductPrice(id, val);
      });
    });

    container.querySelectorAll(".btn-stock-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.toggleStock;
        store.toggleProductStock(id);
      });
    });
  }

  const unsubscribe = store.subscribe((event) => {
    if (event === "products_changed" || event === "storage_sync" || event === "cloud_connected") {
      update();
    }
  });

  update();
  return () => unsubscribe();
}
