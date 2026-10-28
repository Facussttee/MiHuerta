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
      <div class="max-w-2xl mx-auto p-4 pb-24">
        <!-- Header Dueño -->
        <div class="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mb-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-3xl">⚙️</span>
              <div>
                <h1 class="font-extrabold text-gray-900 text-lg">Administrador de Precios</h1>
                <p class="text-xs text-gray-500">Actualizá los precios del día y el stock en 2 minutos</p>
              </div>
            </div>
            <span class="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              ${products.length} productos
            </span>
          </div>

          <!-- Filtro de Categorías -->
          <div class="mt-4 flex gap-1.5 overflow-x-auto no-scrollbar py-1">
            ${CATEGORIAS.map(
              (cat) => `
              <button 
                data-admin-cat="${cat}"
                class="admin-cat-pill whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }"
              >
                ${cat}
              </button>
            `
            ).join("")}
          </div>
        </div>

        <!-- Lista de Productos y Precios -->
        <div class="space-y-2.5">
          ${filtered
            .map((p) => {
              const unit = p.unidad_medida === "KG" ? "kg" : "unidad/atado";

              return `
              <div class="bg-white rounded-2xl p-3.5 border border-gray-200 shadow-sm flex items-center justify-between gap-3">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <span class="text-3xl shrink-0">${p.icono}</span>
                  <div class="min-w-0">
                    <h3 class="font-extrabold text-gray-900 text-sm truncate">${p.nombre}</h3>
                    <span class="text-[11px] text-gray-400 font-medium block">
                      ${p.categoria} • Venta por ${unit}
                    </span>
                  </div>
                </div>

                <!-- Campo de Precio Editable -->
                <div class="flex items-center gap-2 shrink-0">
                  <div class="relative w-28">
                    <span class="absolute left-2.5 top-2 text-xs font-bold text-gray-400">$</span>
                    <input 
                      type="number" 
                      step="50"
                      min="0"
                      data-product-id="${p.id}"
                      value="${p.precio}"
                      class="input-price w-full pl-6 pr-2 py-1.5 bg-gray-50 border border-gray-300 rounded-xl font-black text-sm text-gray-900 outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>

                  <!-- Switch Disponible / Agotado -->
                  <button 
                    data-toggle-stock="${p.id}"
                    class="btn-stock-toggle px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      p.disponible
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    }"
                  >
                    ${p.disponible ? "Disponible" : "Agotado"}
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
