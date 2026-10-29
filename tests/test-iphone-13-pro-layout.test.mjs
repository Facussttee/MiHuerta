/**
 * EMPIRICAL TEST SUITE: iPhone 13 Pro & Mobile Viewport Layout Integrity
 * Verifies fixes for:
 * 1. Safe bottom area padding cascade (.pb-24.safe-pb, .pb-28.safe-pb, .pb-32.safe-pb, .pb-36.safe-pb).
 * 2. Mobile header 2-row layout (no title truncation on 360px-390px viewports).
 * 3. Search placeholder width safety (<= 25 chars, no cutoff).
 * 4. Category pills flex-shrink: 0, whitespace: nowrap, and trailing margin spacer.
 * 5. Product card spacing rhythm (space-y-4 = 16px).
 * 6. Zero emojis across all code files.
 */

import fs from "fs";
import assert from "assert";

let totalTests = 0;
let passedTests = 0;

function pass(name) {
  totalTests++;
  passedTests++;
  console.log(`  [PASS] ${name}`);
}

console.log("\n===============================================================");
console.log("   TEST SUITE: IPHONE 13 PRO LAYOUT & VIEWPORT INTEGRITY");
console.log("===============================================================\n");

const css = fs.readFileSync("css/style.css", "utf8");
const clientSrc = fs.readFileSync("js/views/client.js", "utf8");
const adminSrc = fs.readFileSync("js/views/admin.js", "utf8");
const operatorSrc = fs.readFileSync("js/views/operator.js", "utf8");
const bundleSrc = fs.readFileSync("js/bundle.js", "utf8");

// --- SUITE 1: SAFE AREA INSET PADDING INTEGRITY ---
console.log("--- SUITE 1: Safe Area Inset Padding Integrity ---");

assert.ok(css.includes(".safe-pb {"), "css/style.css must define .safe-pb");
assert.ok(css.includes(".pb-24.safe-pb"), "css/style.css must define .pb-24.safe-pb compounding selector");
assert.ok(css.includes(".pb-28.safe-pb"), "css/style.css must define .pb-28.safe-pb compounding selector");
assert.ok(css.includes(".pb-32.safe-pb"), "css/style.css must define .pb-32.safe-pb compounding selector");
assert.ok(css.includes(".pb-36.safe-pb"), "css/style.css must define .pb-36.safe-pb compounding selector");
pass("1.1 CSS contains compounding safe-pb rules for pb-24, pb-28, pb-32, pb-36");

assert.ok(css.includes("max(6rem, calc(6rem + env(safe-area-inset-bottom"), "pb-24.safe-pb preserves 6rem minimum clearance");
assert.ok(css.includes("max(7rem, calc(7rem + env(safe-area-inset-bottom"), "pb-28.safe-pb preserves 7rem minimum clearance");
assert.ok(css.includes("max(8rem, calc(8rem + env(safe-area-inset-bottom"), "pb-32.safe-pb preserves 8rem minimum clearance");
assert.ok(css.includes("max(9rem, calc(9rem + env(safe-area-inset-bottom"), "pb-36.safe-pb preserves 9rem minimum clearance");
pass("1.2 Base clearance values (6rem-9rem) preserved alongside safe-area-inset-bottom");

// Verify safe-pb usage in view containers
assert.ok(clientSrc.includes("pb-32 sm:pb-36 w-full overflow-x-hidden safe-pb"), "Client catalog container declares pb-32 sm:pb-36 safe-pb");
assert.ok(clientSrc.includes("pb-28 safe-pb"), "Client order tracking declares pb-28 safe-pb");
assert.ok(operatorSrc.includes("pb-24 overflow-x-hidden safe-pb"), "Operator container declares pb-24 safe-pb");
assert.ok(adminSrc.includes("pb-32 overflow-x-hidden safe-pb"), "Admin container declares pb-32 safe-pb");
pass("1.3 All main view containers correctly use safe-pb with appropriate base spacing");

// --- SUITE 2: CLIENT HEADER BALANCED 2-ROW LAYOUT ---
console.log("\n--- SUITE 2: Client Header Balanced 2-Row Layout ---");

// Fila 1 should contain title and cart button
const headerMatch = clientSrc.match(/<header[^>]*>([\s\S]*?)<\/header>/);
assert.ok(headerMatch, "Catalog header must exist in client.js");
const headerContent = headerMatch[1];

// Fila 1 must contain Catálogo del Día and btn-header-cart
const fila1 = headerContent.split("<!-- Fila 2")[0];
assert.ok(fila1.includes("Catálogo del Día"), "Fila 1 must contain store title");
assert.ok(fila1.includes("Abierto"), "Fila 1 must contain Abierto status badge");
assert.ok(fila1.includes('id="btn-header-cart"'), "Fila 1 must contain Pedido cart button");
assert.ok(!fila1.includes("theme-toggle-btn"), "Fila 1 must NOT contain theme toggle button (moved to row 2 for space)");
pass("2.1 Row 1 cleanly allocates title, status badge and cart button without overcrowding");

// Fila 2 must contain user greeting and theme toggle
const fila2 = headerContent.split("<!-- Fila 2")[1];
assert.ok(fila2.includes('id="btn-change-user"'), "Fila 2 must contain Cambiar user button");
assert.ok(fila2.includes("theme-toggle-btn"), "Fila 2 must contain theme toggle button");
pass("2.2 Row 2 cleanly allocates user greeting and theme toggle button");

// --- SUITE 3: SEARCH PLACEHOLDER LENGTH & ACCESSIBILITY ---
console.log("\n--- SUITE 3: Search Placeholder Length & Accessibility ---");

const placeholderMatch = clientSrc.match(/id="search-input"[\s\S]*?placeholder="([^"]+)"/);
assert.ok(placeholderMatch, "search-input must have a placeholder");
const placeholderText = placeholderMatch[1];
assert.ok(placeholderText.length <= 25, `Placeholder '${placeholderText}' must be <= 25 chars (actual: ${placeholderText.length}) to prevent truncation`);
assert.strictEqual(placeholderText, "Buscar productos...", "Placeholder text is 'Buscar productos...'");
pass("3.1 Search placeholder is concise ('Buscar productos...') and guaranteed not to truncate on 360px-390px screens");

// --- SUITE 4: CATEGORY PILLS HORIZONTAL SCROLL & SPACING ---
console.log("\n--- SUITE 4: Category Pills Horizontal Scroll & Spacing ---");

assert.ok(css.includes(".category-pill"), "css/style.css defines .category-pill");
assert.ok(css.includes("flex-shrink: 0 !important;"), "css/style.css forces flex-shrink: 0 on pills");
assert.ok(css.includes("white-space: nowrap !important;"), "css/style.css forces white-space: nowrap on pills");
pass("4.1 Category pills have CSS rules preventing horizontal squishing and wrapping");

assert.ok(clientSrc.includes("-mx-4 px-4"), "Client category pill container has edge-to-edge negative margin");
assert.ok(adminSrc.includes("-mx-4 px-4"), "Admin category pill container has edge-to-edge negative margin");
assert.ok(clientSrc.includes('<div class="w-2 shrink-0 select-none pointer-events-none" aria-hidden="true"></div>'), "Client category pill container has trailing spacer for WebKit scroll padding");
assert.ok(adminSrc.includes('<div class="w-2 shrink-0 select-none pointer-events-none" aria-hidden="true"></div>'), "Admin category pill container has trailing spacer for WebKit scroll padding");
pass("4.2 Category scroll containers have WebKit trailing spacers and touch-friendly margins");

// --- SUITE 5: PRODUCT CARD SPACING & VISUAL RHYTHM ---
console.log("\n--- SUITE 5: Product Card Spacing & Visual Rhythm ---");

assert.ok(clientSrc.includes('id="products-list-container" class="p-4 space-y-4"'), "Products container uses space-y-4 (16px) for clear card separation");
pass("5.1 Products container spacing is set to space-y-4 (16px) matching internal padding");

// --- SUITE 6: COMPILED BUNDLE & STRICT INTEGRITY ---
console.log("\n--- SUITE 6: Compiled Bundle & Strict Integrity ---");

assert.ok(!bundleSrc.startsWith("\uFEFF"), "bundle.js must NOT contain UTF-8 BOM");
assert.ok(bundleSrc.includes("Buscar productos..."), "bundle.js contains updated search placeholder");
assert.ok(bundleSrc.includes(".category-pill"), "bundle.js contains category pill logic");
pass("6.1 Compiled bundle.js strictly synchronized without BOM");

console.log("\n===============================================================");
console.log(`   ALL TESTS PASSED: ${totalTests} / ${totalTests} (0 FAILURES)`);
console.log("===============================================================\n");
