# Mi Huerta - Sistema Digital de Pedidos y Pesaje para Verdulerías

> **Plataforma web mobile-first de costo cero (\$0/mes) diseñada para resolver la captura, pesaje y despacho de pedidos en verdulerías y fruterías de barrio.**

[![Open Source](https://img.shields.io/badge/Open%20Source-100%25-emerald.svg)](#)
[![Stack](https://img.shields.io/badge/Costo%20de%20Hosting-$0%2Fmes-brightgreen.svg)](#)
[![Mobile-First](https://img.shields.io/badge/Diseño-Mobile--First%20PWA-blue.svg)](#)
[![Realtime](https://img.shields.io/badge/Tiempo%20Real-WebSockets-orange.svg)](#)

---

## Índice de Documentación Completa

Para conocer todos los aspectos del proyecto, consultá los documentos específicos según tu rol o interés:

| Documento | Audiencia | Descripción |
| :--- | :--- | :--- |
| **[AGENT.md](file:///d:/Escritorio/miHuerta/AGENT.md)** | **Modelos de IA & Devs** | Reglas arquitectónicas, modelos de datos TypeScript, glosario del dominio y convenciones para que cualquier IA o programador trabaje sin perder contexto. |
| **[01 - Visión y Alcance](file:///d:/Escritorio/miHuerta/docs/01_VISION_Y_ALCANCE.md)** | **General / Negocio** | El problema de las verdulerías, por qué falla el e-commerce tradicional, propuesta de valor, alcance del MVP vs Roadmap V2 y métricas de éxito (KPIs). |
| **[02 - Pitch y Comercio](file:///d:/Escritorio/miHuerta/docs/02_PITCH_Y_COMERCIO.md)** | **Comercial / Dueño** | Guion coloquial ("del mate") para explicarle la solución al verdulero en 3 minutos, respuestas a objeciones típicas y acuerdo de prueba piloto. |
| **[03 - Arquitectura y Datos](file:///d:/Escritorio/miHuerta/docs/03_ARQUITECTURA_Y_DATOS.md)** | **Técnica / Arquitectura** | Diagramas de flujo C4/Mermaid, modelo Entidad-Relación (ERD), sentencias SQL completas, máquina de estados del pedido y estrategia \$0/mes. |
| **[04 - Flujos y Casos Borde](file:///d:/Escritorio/miHuerta/docs/04_FLUJOS_Y_CASOS_BORDE.md)** | **Funcional / QA** | El "Caminito Feliz" paso a paso, manejo de mercadería sin stock, disparidad de peso en calabazas/sandías, cortes de Wi-Fi y checklist de pruebas. |

---

## Cómo Probar el Simulador Interactivo

No requiere instalar Node.js, compilar paquetes ni levantar servidores locales. Podés abrirlo directamente haciendo **doble clic en [index.html](file:///d:/Escritorio/miHuerta/index.html)** en cualquier navegador moderno (Brave, Chrome, Edge, Firefox):

1. **Barra Superior del Simulador:** Permite conmutar con 1 clic entre los 3 roles:
   * **Cliente:** Catálogo interactivo con filtros, búsqueda, selección por peso/unidad, estimación transparente y pedido con retiro o delivery.
   * **Operario (Balanza):** Tablero Kanban para mostrador (`Entrantes`, `En Balanza`, `Listos`, `Cobrados`), pantalla de pesaje táctil con cálculo instantáneo y botón de "Sin stock".
   * **Dueño:** Panel ultra-ágil para cambiar precios y prender/apagar disponibilidad de productos al instante.

### La Prueba del "Tiempo Real" (Recomendada):
1. Abrí dos ventanas en tu pantalla (una al lado de la otra).
2. En la ventana izquierda poné la vista **Cliente**.
3. En la ventana derecha poné la vista **Operario**.
4. Confirmá un pedido como cliente: **escucharás el timbre sonoro en el mostrador y verás caer la tarjeta en vivo en la pantalla del operario sin recargar la página.**

---

## Estructura de Archivos del Repositorio

```
d:\Escritorio\miHuerta\
├── AGENT.md                 # Contexto canónico para modelos de IA y agentes autónomos
├── README.md                # Portal de bienvenida e índice general
├── index.html               # Punto de entrada único y barra de simulación
├── css/
│   └── style.css            # Tipografía Plus Jakarta Sans, animaciones y touch optimization
├── js/
│   ├── bundle.js            # Paquete unificado autónomo (ejecutable vía file:/// y web)
│   ├── app.js               # Enrutador de vistas (SPA)
│   ├── store.js             # Estado centralizado reactivo, Web Audio y localStorage
│   ├── products-data.js     # Catálogo base estructurado de productos y precios
│   └── views/
│       ├── client.js        # Vista Catálogo Cliente, carrito drawer y tracking
│       ├── operator.js      # Vista Mostrador, Kanban táctil y pesaje en balanza
│       └── admin.js         # Vista Actualización de precios y stock del dueño
└── docs/
    ├── 01_VISION_Y_ALCANCE.md      # Visión de negocio, problemática y roadmap
    ├── 02_PITCH_Y_COMERCIO.md      # Guion para hablar con el verdulero y FAQs
    ├── 03_ARQUITECTURA_Y_DATOS.md  # Arquitectura técnica, ERD y base de datos SQL
    └── 04_FLUJOS_Y_CASOS_BORDE.md  # Especificación funcional y casos excepcionales
```

---

## Hoja de Ruta Tecnológica (Próximos Pasos)

1. [x] Prototipo interactivo funcional y validación de pantallas mobile-first.
2. [x] Suite completa de documentación técnica, comercial y para IAs.
3. [ ] Presentación y prueba piloto de 2 semanas en la verdulería local.
4. [ ] Creación del proyecto en **Supabase** y migración de las tablas SQL.
5. [ ] Microservicio conector de **WhatsApp** usando `@whiskeysockets/baileys` para envío automático de links y notificaciones finales.
