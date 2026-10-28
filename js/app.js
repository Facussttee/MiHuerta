import { renderClientView } from "./views/client.js";
import { renderOperatorView } from "./views/operator.js";
import { renderAdminView } from "./views/admin.js";

// Router simple basado en hash o query params
class App {
  constructor() {
    this.container = document.getElementById("app-content");
    this.navButtons = document.querySelectorAll(".nav-switch");
    this.currentViewCleanup = null;
    this.currentView = "client";

    this.init();
  }

  init() {
    // Escuchar clics en los botones de cambio de rol/vista
    this.navButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const view = btn.dataset.view;
        this.navigate(view);
      });
    });

    // Detectar parámetro en URL (?view=operario o #operario)
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

    // Actualizar estilos activos de los botones
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

    // Renderizar vista seleccionada
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

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  new App();
});
