import { store } from "./store.js";
import { renderClientView } from "./views/client.js";
import { renderOperatorView } from "./views/operator.js";
import { renderAdminView } from "./views/admin.js";

class App {
  constructor() {
    this.container = document.getElementById("app-content");
    this.simulatorBar = document.getElementById("simulator-bar");
    this.navButtons = document.querySelectorAll(".nav-switch");
    this.btnLockPin = document.getElementById("btn-lock-pin");
    this.currentViewCleanup = null;
    this.currentView = "client";
    this.requirePinInDemo = false;

    this.init();
  }

  init() {
    const urlParams = new URLSearchParams(window.location.search);
    const hasClientPhoneLink = urlParams.has("tel");
    const isRealMode = urlParams.get("modo") === "real" || hasClientPhoneLink;

    const updateSimBarHeight = () => {
      if (this.simulatorBar && !this.simulatorBar.classList.contains("hidden")) {
        const h = this.simulatorBar.offsetHeight || 46;
        document.documentElement.style.setProperty("--sim-bar-h", `${h}px`);
      } else {
        document.documentElement.style.setProperty("--sim-bar-h", "0px");
      }
    };

    const isDemoMode = urlParams.get("demo") === "1" || urlParams.get("sim") === "1";

    // La barra del simulador SOLO se muestra si explícitamente se agrega ?demo=1 en la URL
    if (isDemoMode && this.simulatorBar) {
      this.simulatorBar.classList.remove("hidden");
      document.body.classList.add("has-sim-bar");
    } else if (this.simulatorBar) {
      this.simulatorBar.classList.add("hidden");
      document.body.classList.remove("has-sim-bar");
    }
    updateSimBarHeight();
    window.addEventListener("resize", updateSimBarHeight);

    if (this.btnLockPin) {
      this.btnLockPin.addEventListener("click", () => {
        store.lockStaff();
        this.navigate("client");
      });
    }

    this.navButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (navigator.vibrate) { try { navigator.vibrate(15); } catch {} }
        const view = btn.dataset.view;
        this.navigate(view);
      });
    });

    // Delegación global para botones de cambio de tema en cualquier vista
    document.addEventListener("click", (e) => {
      const toggleBtn = e.target.closest(".theme-toggle-btn");
      if (toggleBtn) {
        e.preventDefault();
        if (navigator.vibrate) { try { navigator.vibrate(10); } catch {} }
        store.toggleTheme();
      }
    });

    // Atajo de teclado 'T' para alternar tema rápidamente en escritorio (sin interferir con Ctrl+T o Alt+T)
    window.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (
        (e.key === "t" || e.key === "T") &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName) &&
        !document.activeElement?.isContentEditable
      ) {
        store.toggleTheme();
      }
    });

    // Actualización reactiva de etiquetas de tema
    store.subscribe((event) => {
      if (event === "theme_changed") {
        const isDark = store.getTheme() === "dark";
        document.querySelectorAll(".theme-label").forEach((el) => {
          el.textContent = isDark ? "Oscuro" : "Claro";
        });
      }
    });

    const initialView = urlParams.get("view") || window.location.hash.replace("#", "") || "client";
    this.navigate(initialView);

    window.addEventListener("hashchange", () => {
      const hashView = window.location.hash.replace("#", "");
      if (hashView && hashView !== this.currentView) {
        this.navigate(hashView);
      }
    });
  }

  renderPinGate(targetView) {
    const isOperario = targetView === "operator" || targetView === "operario";
    const roleLabel = isOperario ? "Puesto de Balanza (Operario)" : "Panel de Precios (Dueño)";
    this.container.innerHTML = `
      <div class="max-w-sm mx-auto p-4 pt-16">
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl text-center">
          <div class="flex items-center justify-between mb-3">
            <span class="inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Acceso Personal del Local
            </span>
            <button 
              type="button"
              class="theme-toggle-btn min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition tap-feedback touch-target inline-flex items-center justify-center gap-1.5"
              title="${store.getTheme() === 'dark' ? 'Cambiar a tema claro (atajo: T)' : 'Cambiar a tema oscuro (atajo: T)'}"
              aria-label="${store.getTheme() === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}"
            >
              <span class="text-slate-400 dark:text-slate-500">Tema:</span>
              <span class="theme-label font-black">${store.getTheme() === "dark" ? "Oscuro" : "Claro"}</span>
            </button>
          </div>
          <h2 class="text-xl font-black text-slate-900 dark:text-white">${roleLabel}</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">Ingresá el PIN numérico de 4 dígitos del comercio (Por defecto: <strong>1234</strong>)</p>

          <form id="pin-gate-form" class="space-y-4">
            <input 
              type="password" 
              id="pin-input" 
              inputmode="numeric" 
              maxlength="8" 
              placeholder="••••" 
              required
              class="w-40 mx-auto block text-center tracking-[0.5em] py-3 px-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 rounded-2xl font-black text-2xl text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition"
            />
            <p id="pin-error" class="hidden text-xs font-bold text-rose-600 dark:text-rose-400">PIN incorrecto. Intentá nuevamente.</p>
            <div class="flex gap-2 pt-1">
              <button 
                type="button" 
                id="btn-pin-back"
                class="flex-1 min-h-[48px] py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition touch-target"
              >
                Volver al Catálogo
              </button>
              <button 
                type="submit" 
                class="flex-1 min-h-[48px] py-3 bg-slate-950 hover:bg-slate-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-black rounded-xl text-xs uppercase tracking-wider transition shadow-md touch-target"
              >
                Ingresar
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    const input = this.container.querySelector("#pin-input");
    const form = this.container.querySelector("#pin-gate-form");
    const errorEl = this.container.querySelector("#pin-error");
    const btnBack = this.container.querySelector("#btn-pin-back");

    if (input) input.focus();

    if (btnBack) {
      btnBack.addEventListener("click", () => this.navigate("client"));
    }

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (store.verifyStaffPin(input.value)) {
          this.navigate(targetView);
        } else {
          errorEl.classList.remove("hidden");
          input.value = "";
          input.focus();
        }
      });
    }
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

    // Control estricto de acceso por PIN: si no está desbloqueado, exige PIN
    const isStaffView = ["operator", "operario", "admin", "dueno"].includes(viewName);
    if (isStaffView && !store.isStaffUnlocked()) {
      this.renderPinGate(viewName);
      return;
    }

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

document.addEventListener("DOMContentLoaded", () => {
  new App();
});
