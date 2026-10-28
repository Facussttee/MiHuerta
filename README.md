# 🥕 Mi Huerta - Sistema Digital de Pedidos y Pesaje para Verdulerías

Prototipo funcional para la gestión y pesaje de pedidos en tiempo real para verdulerías de barrio.

---

## 🌟 ¿Cómo probar el sistema ahora mismo?

No necesitás instalar nada. Podés abrir directamente el archivo `index.html` en tu navegador (Google Chrome, Edge, Brave o Firefox):

1. Hacé doble clic en `index.html` dentro de la carpeta `d:\Escritorio\miHuerta`.
2. En la barra superior negra podés alternar al instante entre las 3 vistas:
   * **🛒 Cliente:** El catálogo interactivo con búsqueda, categorías, selección por peso/unidad, estimación de precios y confirmación con dirección o retiro.
   * **⚖️ Operario (Balanza):** El tablero de mostrador con Kanban móvil (*Entrantes*, *Pesando*, *Listos*, *Cobrados*), pantalla de carga de pesos reales de balanza y cálculo automático del importe final.
   * **⚙️ Dueño:** Panel ultra-rápido para cambiar precios y apagar/prender disponibilidad de productos al instante.

### 💡 El truco del "Tiempo Real":
Abrí dos pestañas o dos ventanas en tu navegador:
* En una ventana poné la **Vista Cliente**.
* En la otra ventana poné la **Vista Operario (Balanza)**.
* Hacé un pedido como cliente: **vas a escuchar el timbre de alerta sonoro y verás cómo el pedido cae en la pantalla del operario en vivo**, ¡incluso sin servidor externo gracias a la sincronización de almacenamiento!

---

## 🏗️ Estructura del Proyecto

```
d:\Escritorio\miHuerta\
├── index.html              # Punto de entrada y barra de simulación
├── css\
│   └── style.css          # Tipografía, animaciones y soporte táctil
├── js\
│   ├── app.js             # Enrutador y controlador de vistas
│   ├── store.js           # Estado centralizado reactivo + Alerta sonora
│   ├── products-data.js   # Catálogo inicial con frutas, verduras y precios
│   └── views\
│       ├── client.js      # Catálogo, carrito y seguimiento de pesaje
│       ├── operator.js    # Tablero Kanban y módulo de balanza
│       └── admin.js       # Actualización de precios y stock
└── README.md
```

---

## 🚀 Próximos pasos
1. Probar la comodidad de la carga de pesos en celulares o computadoras del local.
2. Afinar detalles según el feedback de la verdulería.
3. Conectar la base de datos cloud (Supabase) y el conector de WhatsApp (Baileys).
