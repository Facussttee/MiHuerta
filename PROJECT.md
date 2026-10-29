# Project: Mi Huerta — Mobile-First Redesign & UX/UI Overhaul

## Architecture
- **Client PWA**: Single Page Application with dynamic views (`client.js`, `operator.js`, `admin.js`), managed by `app.js` and styled with `css/style.css` and Tailwind.
- **Design System & Tokens**: Centralized CSS custom properties for Light, Dark (`[data-theme="dark"]`), and system preference (`prefers-color-scheme: dark`) with Verdulería status tokens (Entrantes, En Balanza, Listos, Cobrados, Cancelado/Sin Stock).
- **Typography & Ergonomics**: Plus Jakarta Sans hierarchy, zero emojis/superfluous icons, min 44x44px touch targets on all interactive controls, min 16px font on inputs to prevent iOS auto-zoom, and 0 horizontal overflow (`overflow-x: hidden`) across 360px-430px viewports.
- **State & Theme**: `store.js` hybrid adapter supporting `localStorage` (offline/file:/// mode) with dual theme keys (`theme` & `mihuerta_theme_v3`), `data-theme` attribute synchronization, and Supabase Cloud/Realtime integration.
- **Packaging**: `build-bundle.ps1` consolidates modular JavaScript files into `js/bundle.js` for universal CORS-free file:/// execution and web server compatibility ($0/mes).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | CSS Design Tokens (Light/Dark) | Custom properties for canvas, surface, text, border, and Verdulería Kanban statuses | M1 | R1, R2, Explorer 1 |
| 2 | Typography Hierarchy & Loading | Plus Jakarta Sans font loading with `<link rel="preconnect">`, clean typography scale, zero emojis | M1 | R1, Explorer 1 |
| 3 | Root Viewport Overflow Guard | `overflow-x: hidden` and `max-width: 100vw` on root elements preventing horizontal scrolling | M1 | R1, Explorer 1 |
| 4 | Dual-Key Theme Persistence | Check and persist both `theme` and `mihuerta_theme_v3` in `localStorage` with `prefers-color-scheme` fallback | M1 | R2, Explorer 3 |
| 5 | Theme Synchronization & Meta Color | Sync `dark` class, `data-theme` attribute, and `<meta name="theme-color">` dynamically | M1 | R2, Explorer 1, Explorer 3 |
| 6 | Global Typographic Theme Toggle | Clean typographic toggle component (min 44x44px) accessible across all views and headers | M1 | R2, Explorer 1 |
| 7 | Quick Discard Button (×) on Product Card | Direct cancellation cross (min 44x44px) visible when `quantity > 0`, resetting to 0 immediately | M2 | R3, Explorer 2 |
| 8 | Product Card Mobile Layout & Space Recovery | Absolute placement (`top-2.5 right-2.5`) freeing 50px for title/description and preventing mis-taps with stepper | M2 | R1, R3, Explorer 2 |
| 9 | Client View Emoji & SVG Purge | Remove inline SVGs in product cards and cart drawer in favor of Plus Jakarta Sans typography | M2 | R1, Explorer 2 |
| 10 | Client View Touch Ergonomics | Upgrade category pills, quantity stepper buttons, and quick weight shortcuts to >= 44x44px | M2 | R1, Explorer 1, Explorer 2 |
| 11 | Operator Kanban Tab Bar Refinement | Fixed 48px height tabs with flex centering preventing asymmetric text wrapping on 360px phones | M3 | R1, Explorer 3 |
| 12 | Operator Weighing Controls (44x44px) | Upgrade weight adjustment steppers (`btn-adjust-weight`) to 44x44px, and 44px action buttons | M3 | R1, Explorer 3 |
| 13 | Admin Product Card 2-Tier Stack | 2-row layout separating info/stock from price steppers, eliminating 265px wrapping squeeze on 360px | M3 | R1, Explorer 3 |
| 14 | Admin View Touch Targets | Upgrade price steppers, category pills, search clear, and header buttons to >= 44x44px | M3 | R1, Explorer 3 |
| 15 | Bundle Compilation & UTF-8 Sync | Execute `build-bundle.ps1` to compile `js/bundle.js` with zero syntax errors (`node --check`) | M4 | R4, Explorer 3 |
| 16 | Universal Compatibility Verification | Verify flawless execution via `file:///` and web server with zero console errors | M4 | R4, Explorer 3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | CSS Foundation, Tokens, Dark Mode & Global Controls | `css/style.css`, `index.html`, `js/store.js`, `js/app.js` | None | DONE |
| 2 | Client View Mobile Redesign & Quick Discard Cross | `js/views/client.js` | M1 | DONE |
| 3 | Operator & Admin Views Mobile-First Redesign | `js/views/operator.js`, `js/views/admin.js` | M1 | DONE |
| 4 | Bundle Sync, Build Verification & Quality Gate | `build-bundle.ps1`, `js/bundle.js`, Reviewers, Challengers, Auditor | M1, M2, M3 | DONE |

## Code Layout
- `css/style.css`: Design tokens, dark mode variables, touch target helpers, overflow guards, typography rules.
- `index.html`: Preconnect font tags, meta tags, anti-flicker theme script, simulator layout.
- `js/store.js`: State management, theme getter/setter/listener, dual-key localStorage persistence.
- `js/app.js`: View router, global header theme toggle listeners, PIN gate.
- `js/views/client.js`: Client catalog, product cards with quick discard (×), cart drawer, tracking.
- `js/views/operator.js`: Operator Kanban board, weighing modal, live scale steppers, order actions.
- `js/views/admin.js`: Price and stock admin table/cards, category filter pills, cloud config.
- `build-bundle.ps1`: Monolithic bundle builder for file:/// and web.
- `js/bundle.js`: Consolidated application script.
- `tests/`: Automated test suites (`test-adversarial-r1.cjs`, `adversarial-r2-r3-r4.test.mjs`).
- `bot/`: WhatsApp notification daemon and automated test suites (`test-store-state.js`, `test-mock.js`, `test-order-flow.js`).
