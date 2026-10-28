# Script para ensamblar bundle.js autónomo
$prod = Get-Content 'd:\Escritorio\miHuerta\js\products-data.js' -Raw
$prod = $prod -replace 'export const ', 'const '

$store = Get-Content 'd:\Escritorio\miHuerta\js\store.js' -Raw
$store = $store -replace 'import \{ INITIAL_PRODUCTS \} from "\./products-data\.js";', ''
$store = $store -replace 'export const store = new Store\(\);', 'const store = new Store();'
$store = $store -replace 'export \{ STORAGE_KEYS, safeGet, safeSet, safeRemove \};', ''

$client = Get-Content 'd:\Escritorio\miHuerta\js\views\client.js' -Raw
$client = $client -replace 'import \{ store \} from "\.\./store\.js";', ''
$client = $client -replace 'import \{ CATEGORIAS \} from "\.\./products-data\.js";', ''
$client = $client -replace 'export function renderClientView', 'function renderClientView'

$operator = Get-Content 'd:\Escritorio\miHuerta\js\views\operator.js' -Raw
$operator = $operator -replace 'import \{ store \} from "\.\./store\.js";', ''
$operator = $operator -replace 'export function renderOperatorView', 'function renderOperatorView'

$admin = Get-Content 'd:\Escritorio\miHuerta\js\views\admin.js' -Raw
$admin = $admin -replace 'import \{ store \} from "\.\./store\.js";', ''
$admin = $admin -replace 'import \{ CATEGORIAS \} from "\.\./products-data\.js";', ''
$admin = $admin -replace 'export function renderAdminView', 'function renderAdminView'

$app = @'
  // ==========================================
  // 6. ENRUTADOR Y CONTROLADOR PRINCIPAL
  // ==========================================
  class App {
    constructor() {
      this.container = document.getElementById("app-content");
      this.navButtons = document.querySelectorAll(".nav-switch");
      this.currentViewCleanup = null;
      this.currentView = "client";

      this.init();
    }

    init() {
      this.navButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const view = btn.dataset.view;
          this.navigate(view);
        });
      });

      const urlParams = new URLSearchParams(window.location.search);
      const initialView = urlParams.get("view") || window.location.hash.replace("#", "") || "client";
      this.navigate(initialView);
    }

    navigate(viewName) {
      if (this.currentViewCleanup) {
        this.currentViewCleanup();
        this.currentViewCleanup = null;
      }

      this.currentView = viewName;
      window.location.hash = viewName;

      this.navButtons.forEach((btn) => {
        const isActive = btn.dataset.view === viewName;
        if (isActive) {
          btn.classList.add("bg-white", "text-slate-900", "shadow-sm");
          btn.classList.remove("text-slate-400");
        } else {
          btn.classList.remove("bg-white", "text-slate-900", "shadow-sm");
          btn.classList.add("text-slate-400");
        }
      });

      switch (viewName) {
        case "operator":
        case "operario":
          this.currentViewCleanup = renderOperatorView(this.container);
          break;
        case "admin":
        case "dueno":
          this.currentViewCleanup = renderAdminView(this.container);
          break;
        case "client":
        case "cliente":
        default:
          this.currentViewCleanup = renderClientView(this.container);
          break;
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // Auto-inicializar cuando el documento esté listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => new App());
  } else {
    new App();
  }
'@

$parts = @(
  "(function () {`n  `"use strict`";`n",
  "  // ==========================================",
  "  // 1. CATALOGO DE PRODUCTOS",
  "  // ==========================================",
  $prod,
  "  // ==========================================",
  "  // 2. STORE Y PERSISTENCIA LOCAL",
  "  // ==========================================",
  $store,
  "  // ==========================================",
  "  // 3. VISTA CLIENTE",
  "  // ==========================================",
  $client,
  "  // ==========================================",
  "  // 4. VISTA OPERARIO (BALANZA Y MOSTRADOR)",
  "  // ==========================================",
  $operator,
  "  // ==========================================",
  "  // 5. VISTA ADMIN / DUENO",
  "  // ==========================================",
  $admin,
  $app,
  "})();`n"
)

$bundleContent = $parts -join "`n`n"
[System.IO.File]::WriteAllText('d:\Escritorio\miHuerta\js\bundle.js', $bundleContent, [System.Text.Encoding]::UTF8)
Write-Output "Bundle generado con exito. Caracteres: $($bundleContent.Length)"
