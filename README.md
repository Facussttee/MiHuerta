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
| **[AGENTS.md](file:///d:/Escritorio/miHuerta/AGENTS.md)** | **Modelos de IA & Devs** | Reglas arquitectónicas, glosario del dominio, invariantes de empaquetado (`build-bundle.ps1`) y convenciones para agentes autónomos. |
| **[01 - Visión y Alcance](file:///d:/Escritorio/miHuerta/docs/01_VISION_Y_ALCANCE.md)** | **General / Negocio** | El problema de las verdulerías, por qué falla el e-commerce tradicional, propuesta de valor, alcance del MVP vs Roadmap V2 y métricas (KPIs). |
| **[02 - Pitch y Comercio](file:///d:/Escritorio/miHuerta/docs/02_PITCH_Y_COMERCIO.md)** | **Comercial / Dueño** | Guion coloquial ("del mate") para explicarle la solución al verdulero en 3 minutos, respuestas a objeciones típicas y acuerdo de prueba piloto. |
| **[03 - Arquitectura y Datos](file:///d:/Escritorio/miHuerta/docs/03_ARQUITECTURA_Y_DATOS.md)** | **Técnica / Arquitectura** | Diagramas de arquitectura en Mermaid, modelo Entidad-Relación (ERD), máquina de estados del pedido y estrategia \$0/mes. |
| **[04 - Flujos y Casos Borde](file:///d:/Escritorio/miHuerta/docs/04_FLUJOS_Y_CASOS_BORDE.md)** | **Funcional / QA** | El "Caminito Feliz" paso a paso, manejo de mercadería sin stock, disparidad de peso en calabazas/sandías, cortes de Wi-Fi y checklist de pruebas. |
| **[05 - Plan de Desarrollo MVP](file:///d:/Escritorio/miHuerta/docs/05_PLAN_DE_DESARROLLO_MVP.md)** | **Hoja de Ruta / Ejecución** | Auditoría de lo que ya está construido hoy vs. lo que falta configurar, guía paso a paso de Supabase, deploy web y puesta en marcha del Bot de WhatsApp. |

---

## Cómo Probar el Sistema Ahora Mismo

No requiere instalar paquetes ni levantar servidores locales para probar el circuito completo. Podés abrir directamente **[index.html](file:///d:/Escritorio/miHuerta/index.html)** con doble clic en cualquier navegador moderno (Brave, Chrome, Edge, Firefox):

1. **Barra Superior del Simulador:** Permite conmutar con 1 clic entre los 3 roles:
   * **Cliente:** Catálogo interactivo con filtros, búsqueda, selección por peso/unidad, estimación transparente, reconocimiento por link `?tel=` y pedido con retiro o delivery.
   * **Operario (Balanza):** Tablero Kanban para mostrador (`Entrantes`, `En Balanza`, `Listos`, `Cobrados`), pantalla de pesaje táctil con cálculo instantáneo, botón de "Sin stock", adición/quita de ítems y cancelación de pedidos.
   * **Precios (Dueño):** Panel ultra-ágil para cambiar precios del día, pausar o activar productos y configurar el **PIN de 4 dígitos** o las credenciales de **Supabase Cloud**.
   * **Botón "Probar PIN":** Bloquea las vistas de Operario y Dueño pidiendo el PIN numérico de 4 dígitos (por defecto `1234`), simulando la seguridad en producción.

### La Prueba del "Tiempo Real":
1. Abrí dos ventanas en tu pantalla (una al lado de la otra).
2. En la ventana izquierda poné la vista **Cliente**.
3. En la ventana derecha poné la vista **Operario**.
4. Confirmá un pedido como cliente: **escucharás el timbre sonoro en el mostrador y verás caer la tarjeta en vivo en la pantalla del operario sin recargar la página.**

---

## Estructura de Archivos del Repositorio

```
d:\Escritorio\miHuerta\
├── AGENTS.md                # Reglas y contexto canónico para modelos de IA
├── README.md                # Portal de bienvenida e índice general
├── index.html               # Punto de entrada único (Local + Supabase Cloud)
├── build-bundle.ps1         # Script empaquetador de módulos hacia js/bundle.js
├── css/
│   └── style.css            # Tipografía Plus Jakarta Sans, animaciones y touch optimization
├── js/
│   ├── bundle.js            # Paquete unificado autónomo (ejecutable vía file:/// y web)
│   ├── app.js               # Enrutador de vistas (SPA) y protección por PIN de 4 dígitos
│   ├── store.js             # Estado reactivo híbrido (localStorage + Supabase Cloud/Realtime)
│   ├── products-data.js     # Catálogo base estructurado de productos y precios
│   └── views/
│       ├── client.js        # Vista Catálogo Cliente, carrito drawer y tracking
│       ├── operator.js      # Vista Mostrador, Kanban táctil, edición y pesaje en balanza
│       └── admin.js         # Vista Actualización de precios, stock y configuración Cloud/PIN
├── supabase/
│   └── schema.sql           # Script SQL listo para ejecutar en Supabase (Tablas, RLS, Realtime, Semilla)
├── bot/
│   ├── package.json         # Dependencias Node.js (@whiskeysockets/baileys + @supabase/supabase-js)
│   ├── .env.example         # Plantilla de configuración del bot
│   └── index.js             # Bot de WhatsApp con QR, Cooldown de 3 hs y aviso de pedidos LISTO
└── docs/
    ├── 01_VISION_Y_ALCANCE.md        # Visión de negocio, problemática y roadmap
    ├── 02_PITCH_Y_COMERCIO.md        # Guion para hablar con el verdulero y FAQs
    ├── 03_ARQUITECTURA_Y_DATOS.md    # Arquitectura técnica, ERD y base de datos SQL
    ├── 04_FLUJOS_Y_CASOS_BORDE.md    # Especificación funcional y casos excepcionales
    └── 05_PLAN_DE_DESARROLLO_MVP.md  # Plan de desarrollo paso a paso hacia el MVP en vivo
```

---

## Estado Actual de la Hoja de Ruta (MVP)

- [x] **Etapa 1:** Interfaces mobile-first (Cliente, Operario Kanban/Balanza, Dueño) y edición/cancelación de pedidos.
- [x] **Etapa 2:** Reconocimiento automático por parámetro `?tel=` y protección por PIN de 4 dígitos (`1234`).
- [x] **Etapa 3:** Script SQL de Supabase ([`supabase/schema.sql`](file:///d:/Escritorio/miHuerta/supabase/schema.sql)) y adaptador híbrido Cloud/Realtime en [`js/store.js`](file:///d:/Escritorio/miHuerta/js/store.js).
- [x] **Etapa 5 (Código):** Microservicio del Bot de WhatsApp con Baileys, *cooldown* y escucha Realtime ([`bot/index.js`](file:///d:/Escritorio/miHuerta/bot/index.js)).
- [ ] **Puesta en Marcha (Configuración):** Ejecutar `supabase/schema.sql` en tu cuenta de Supabase, publicar en GitHub Pages/Vercel y escanear el QR con `npm start` en `bot/`.
