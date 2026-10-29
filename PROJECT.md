# Project: Mi Huerta — Production Hardening & Cart ✕ Button

## Architecture
- **Client PWA**: Single Page Application with dynamic views (`client.js`, `operator.js`, `admin.js`), managed by `app.js` and styled with `style.css` and Tailwind.
- **State & Storage**: `store.js` hybrid adapter supporting `localStorage` (offline/file:/// mode) and Supabase Cloud/Realtime synchronization.
- **Packaging**: `build-bundle.ps1` consolidates modular JavaScript files into `js/bundle.js` for universal CORS-free file:/// execution.
- **Bot Service**: WhatsApp notification daemon (`bot/index.js`) powered by Baileys with database integration.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Cart Drawer ✕ Button | Accessible 44x44px button in cart drawer to remove full item in one tap | M1 | ORIGINAL_REQUEST §2, Explorer 1 |
| 2 | Cart Logic & Stock Resiliency | Allow decrementing out-of-stock items in cart (`store.js:508`) | M1 | Explorer 1 |
| 3 | Order Total Real Consistency | Recalculate `total_real` on item addition and removal during preparation in `store.js` | M1 | Explorer 2 |
| 4 | Soft Cancellation Support | Add `cancelOrder` method setting `estado = 'CANCELADO'` without hard deletion | M1 | Explorer 2 |
| 5 | PII Data Fetch Minimization | Avoid pulling entire customer table into client device in `store.js` | M1 | Explorer 2 |
| 6 | Build Bundle UTF-8 Strict | Update `build-bundle.ps1` to emit strict UTF-8 without BOM and portable paths | M1 | ORIGINAL_REQUEST §3, Explorer 3 |
| 7 | Compilation of `js/bundle.js` | Run `build-bundle.ps1` and verify clean bundle compilation with zero residual imports/exports | M1 | ORIGINAL_REQUEST §3, AGENTS.md |
| 8 | Font Preconnect Optimization | Add preconnect links in `index.html` for Google Fonts to eliminate waterfall latency | M1 | Explorer 3 |
| 9 | Git Hygiene (.gitignore) | Add `.agents/` to `.gitignore` to prevent agent metadata leaks in repository | M1 | Explorer 3 |
| 10 | Production Readiness & Commit | Run backend tests and execute clean Git commit ready for production | M1 | ORIGINAL_REQUEST §4, Explorer 3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Production Hardening & Features | Frontend cart ✕ button, store logic fixes, UTF-8 strict bundle, optimizations, and production commit | None | DONE |

## Code Layout
- `js/views/client.js`: Client catalog & cart drawer UI.
- `js/store.js`: Data management, localStorage, and Supabase integration.
- `build-bundle.ps1`: Bundle builder script.
- `js/bundle.js`: Compiled monolithic bundle for production and file:///.
- `index.html`: Main HTML entry point.
- `.gitignore`: Repository ignore rules.
- `bot/`: WhatsApp notification daemon and automated test suites.
