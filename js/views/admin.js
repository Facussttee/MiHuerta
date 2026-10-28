import { store } from "../store.js";
import { CATEGORIAS } from "../products-data.js";

export function renderAdminView(container) {
  let selectedCategory = "Todos";

  function update() {
    container.innerHTML = "";
    const products = store.getProducts();

    const filtered = products.filter(
      (p) => selectedCategory === "Todos" || p.categoria === selectedCategory
    );

    container.innerHTML = `
      <div class="max-w-xl mx-auto p-4 pb-28">
        <!-- Header Dueño / Admin -->
        <div class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm mb-4">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-0.5">
                Panel de Administración
              </span>
              <h1 class="font-black text-slate-900 text-lg tracking-tight">Precios y Disponibilidad</h1>
              <p class="text-xs text-slate-500 mt-0.5">Editá los valores del día en tiempo real.</p>
            </div>
            <span class="text-xs font-black px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full border border-slate-200">
              ${products.length} productos
            </span>
          </div>

          <!-- Filtro de Categorías -->
          <div class="mt-4 flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            ${CATEGORIAS.map(
              (cat) => `
              <button 
                data-admin-cat="${cat}"
                class="admin-cat-pill whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition ${
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

        <!-- Lista de Productos y Precios -->
        <div class="space-y-2">
          ${filtered
            .map((p) => {
              const unit = p.unidad_medida === "KG" ? "kg" : "unidad";

              return `
              <div class="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm flex items-center justify-between gap-3 transition">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1.5">
                    <span class="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      ${p.categoria}
                    </span>
                    <span class="text-[10px] text-slate-400">·</span>
                    <span class="text-[10px] text-slate-400">Por ${unit}</span>
                  </div>
                  <h3 class="font-extrabold text-slate-900 text-sm truncate mt-0.5">${p.nombre}</h3>
                  <p class="text-[11px] text-slate-400 truncate">${p.detalle || ""}</p>
                </div>

                <!-- Campo de Precio Editable y Switch de Stock -->
                <div class="flex items-center gap-2 shrink-0">
                  <div class="relative w-24">
                    <span class="absolute left-2.5 top-2 text-xs font-bold text-slate-400">$</span>
                    <input 
                      type="number" 
                      inputmode="numeric"
                      step="50"
                      min="0"
                      data-product-id="${p.id}"
                      value="${p.precio}"
                      class="input-price w-full pl-6 pr-2 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-black text-sm text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition"
                    />
                  </div>

                  <!-- Botón Switch Disponible / Pausado -->
                  <button 
                    data-toggle-stock="${p.id}"
                    class="btn-stock-toggle px-3 py-1.5 rounded-xl text-xs font-bold transition tap-feedback ${
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
    if (event === "products_changed" || event === "storage_sync") {
      update();
    }
  });

  update();
  return () => unsubscribe();
}
