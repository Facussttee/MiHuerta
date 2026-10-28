# Script para ensamblar bundle.js autónomo con codificación UTF-8 estricta
$prod = Get-Content 'd:\Escritorio\miHuerta\js\products-data.js' -Raw -Encoding UTF8
$prod = $prod -replace 'export const ', 'const '

$store = Get-Content 'd:\Escritorio\miHuerta\js\store.js' -Raw -Encoding UTF8
$store = $store -replace 'import \{ INITIAL_PRODUCTS \} from "\./products-data\.js";', ''
$store = $store -replace 'export const store = new Store\(\);', 'const store = new Store();'
$store = $store -replace 'export \{ STORAGE_KEYS, safeGet, safeSet, safeRemove \};', ''

$client = Get-Content 'd:\Escritorio\miHuerta\js\views\client.js' -Raw -Encoding UTF8
$client = $client -replace 'import \{ store \} from "\.\./store\.js";', ''
$client = $client -replace 'import \{ CATEGORIAS \} from "\.\./products-data\.js";', ''
$client = $client -replace 'export function renderClientView', 'function renderClientView'

$operator = Get-Content 'd:\Escritorio\miHuerta\js\views\operator.js' -Raw -Encoding UTF8
$operator = $operator -replace 'import \{ store \} from "\.\./store\.js";', ''
$operator = $operator -replace 'export function renderOperatorView', 'function renderOperatorView'

$admin = Get-Content 'd:\Escritorio\miHuerta\js\views\admin.js' -Raw -Encoding UTF8
$admin = $admin -replace 'import \{ store \} from "\.\./store\.js";', ''
$admin = $admin -replace 'import \{ CATEGORIAS \} from "\.\./products-data\.js";', ''
$admin = $admin -replace 'export function renderAdminView', 'function renderAdminView'

$app = Get-Content 'd:\Escritorio\miHuerta\js\app.js' -Raw -Encoding UTF8
$app = $app -replace 'import .*?;(\r?\n)?', ''
$app = $app -replace 'document\.addEventListener\("DOMContentLoaded", \(\) => \{\s*new App\(\);\s*\}\);', @'
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
  "  // 2. STORE Y PERSISTENCIA LOCAL + SUPABASE",
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
  "  // ==========================================",
  "  // 6. ENRUTADOR Y CONTROL DE ACCESO POR PIN",
  "  // ==========================================",
  $app,
  "})();`n"
)

$bundleContent = $parts -join "`n`n"
[System.IO.File]::WriteAllText('d:\Escritorio\miHuerta\js\bundle.js', $bundleContent, [System.Text.Encoding]::UTF8)
Write-Output "Bundle generado con exito. Caracteres: $($bundleContent.Length)"
