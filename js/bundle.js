(function () {
  "use strict";


  // ==========================================

  // 1. CATALOGO DE PRODUCTOS

  // ==========================================

// CatÃ¡logo inicial de productos para la verdulerÃ­a (sin emojis, enfocado en tipografÃ­a moderna)
const INITIAL_PRODUCTS = [
  // Frutas
  {
    id: "prod-1",
    nombre: "Banana Cavendish",
    categoria: "Frutas",
    unidad_medida: "KG",
    precio: 1800,
    disponible: true,
    paso: 0.5,
    detalle: "Ecuador Seleccionada"
  },
  {
    id: "prod-2",
    nombre: "Manzana Roja Elegida",
    categoria: "Frutas",
    unidad_medida: "KG",
    precio: 2200,
    disponible: true,
    paso: 0.5,
    detalle: "Alto Valle, RÃ­o Negro"
  },
  {
    id: "prod-3",
    nombre: "Naranja de Jugo",
    categoria: "Frutas",
    unidad_medida: "KG",
    precio: 1400,
    disponible: true,
    paso: 0.5,
    detalle: "San Pedro dulce y jugosa"
  },
  {
    id: "prod-4",
    nombre: "LimÃ³n Comercial",
    categoria: "Frutas",
    unidad_medida: "KG",
    precio: 1600,
    disponible: true,
    paso: 0.25,
    detalle: "Tucumano cuatro estaciones"
  },
  {
    id: "prod-5",
    nombre: "Frutilla Seleccionada",
    categoria: "Frutas",
    unidad_medida: "KG",
    precio: 4500,
    disponible: true,
    paso: 0.25,
    detalle: "Coronda madura y fresca"
  },
  {
    id: "prod-6",
    nombre: "Palta Hass Madura",
    categoria: "Frutas",
    unidad_medida: "UNIDAD",
    precio: 1200,
    disponible: true,
    paso: 1,
    detalle: "Punto justo para consumir"
  },

  // Verduras
  {
    id: "prod-7",
    nombre: "Papa Negra Cepillada",
    categoria: "Verduras",
    unidad_medida: "KG",
    precio: 950,
    disponible: true,
    paso: 1.0,
    detalle: "Balcarce lavada y firme"
  },
  {
    id: "prod-8",
    nombre: "Cebolla SelecciÃ³n",
    categoria: "Verduras",
    unidad_medida: "KG",
    precio: 1100,
    disponible: true,
    paso: 0.5,
    detalle: "Seca de primera calidad"
  },
  {
    id: "prod-9",
    nombre: "Tomate Redondo Premium",
    categoria: "Verduras",
    unidad_medida: "KG",
    precio: 2600,
    disponible: true,
    paso: 0.5,
    detalle: "Platense maduro en planta"
  },
  {
    id: "prod-10",
    nombre: "Zanahoria Fresca",
    categoria: "Verduras",
    unidad_medida: "KG",
    precio: 1300,
    disponible: true,
    paso: 0.5,
    detalle: "Dulce y crujiente"
  },
  {
    id: "prod-11",
    nombre: "Zapallito Verde Tronco",
    categoria: "Verduras",
    unidad_medida: "KG",
    precio: 1700,
    disponible: true,
    paso: 0.5,
    detalle: "Chico y tierno"
  },
  {
    id: "prod-12",
    nombre: "Calabaza Anco Butternut",
    categoria: "Verduras",
    unidad_medida: "KG",
    precio: 1100,
    disponible: true,
    paso: 1.0,
    detalle: "Cremosa y dulce"
  },

  // Hojas Verdes
  {
    id: "prod-13",
    nombre: "Acelga de Huerta",
    categoria: "Hojas Verdes",
    unidad_medida: "UNIDAD",
    precio: 900,
    disponible: true,
    paso: 1,
    detalle: "Atado fresco del dÃ­a"
  },
  {
    id: "prod-14",
    nombre: "Lechuga Mantecosa",
    categoria: "Hojas Verdes",
    unidad_medida: "KG",
    precio: 2800,
    disponible: true,
    paso: 0.25,
    detalle: "Hojas tiernas y limpias"
  },
  {
    id: "prod-15",
    nombre: "Espinaca Fresca",
    categoria: "Hojas Verdes",
    unidad_medida: "UNIDAD",
    precio: 1100,
    disponible: true,
    paso: 1,
    detalle: "Atado grande seleccionado"
  },

  // AlmacÃ©n / Granja
  {
    id: "prod-16",
    nombre: "Huevos de Campo (Maple x 30)",
    categoria: "AlmacÃ©n",
    unidad_medida: "UNIDAD",
    precio: 5200,
    disponible: true,
    paso: 1,
    detalle: "CastaÃ±os de gallinas libres"
  },
  {
    id: "prod-17",
    nombre: "Huevos de Campo (Docena)",
    categoria: "AlmacÃ©n",
    unidad_medida: "UNIDAD",
    precio: 2300,
    disponible: true,
    paso: 1,
    detalle: "Caja seleccionada x 12 u."
  }
];

const CATEGORIAS = ["Todos", "Frutas", "Verduras", "Hojas Verdes", "AlmacÃ©n"];


  // ==========================================

  // 2. STORE Y PERSISTENCIA LOCAL

  // ==========================================



// Claves de almacenamiento local (versiÃ³n 3 sin emojis)
const STORAGE_KEYS = {
  PRODUCTS: "mihuerta_products_v3",
  ORDERS: "mihuerta_orders_v3",
  CUSTOMERS: "mihuerta_customers_v3",
  CURRENT_USER: "mihuerta_current_user_v3",
  CART: "mihuerta_cart_v3",
  ACTIVE_ORDER: "mihuerta_active_order_v3"
};

// Fallback en memoria en caso de bloqueo de localStorage en file:///
const memoryFallback = {};
function safeGet(key, def) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : (memoryFallback[key] || def);
  } catch {
    return memoryFallback[key] || def;
  }
}
function safeSet(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    memoryFallback[key] = val;
  }
}
function safeRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    delete memoryFallback[key];
  }
}

class Store {
  constructor() {
    this.listeners = new Set();
    this.init();

    // SincronizaciÃ³n en tiempo real entre pestaÃ±as
    window.addEventListener("storage", (e) => {
      if (Object.values(STORAGE_KEYS).includes(e.key)) {
        this.notify("storage_sync");
      }
    });
  }

  init() {
    // 1. Cargar o inicializar productos
    if (!safeGet(STORAGE_KEYS.PRODUCTS, null)) {
      safeSet(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    }

    // 2. Clientes registrados iniciales
    if (!safeGet(STORAGE_KEYS.CUSTOMERS, null)) {
      const defaultCustomers = {
        "1123456789": {
          telefono: "1123456789",
          nombre: "Facundo GÃ³mez",
          direccion: "Av. Rivadavia 4520, Piso 3 B"
        },
        "1198765432": {
          telefono: "1198765432",
          nombre: "MarÃ­a Elena",
          direccion: "San MartÃ­n 1230"
        }
      };
      safeSet(STORAGE_KEYS.CUSTOMERS, defaultCustomers);
    }

    // 3. Pedidos iniciales de demostraciÃ³n
    if (!safeGet(STORAGE_KEYS.ORDERS, null)) {
      const sampleOrders = [
        {
          id: 101,
          cliente: {
            nombre: "Facundo GÃ³mez",
            telefono: "1123456789",
            direccion: "Av. Rivadavia 4520, Piso 3 B"
          },
          tipo_entrega: "DELIVERY",
          direccion_entrega: "Av. Rivadavia 4520, Piso 3 B",
          estado: "PENDIENTE",
          fecha: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          total_estimado: 6400,
          total_real: null,
          items: [
            {
              producto_id: "prod-9",
              nombre: "Tomate Redondo Premium",
              unidad_medida: "KG",
              precio_unitario: 2600,
              cantidad_solicitada: 1.0,
              peso_real: null,
              subtotal: 2600,
              sin_stock: false
            },
            {
              producto_id: "prod-1",
              nombre: "Banana Cavendish",
              unidad_medida: "KG",
              precio_unitario: 1800,
              cantidad_solicitada: 1.0,
              peso_real: null,
              subtotal: 1800,
              sin_stock: false
            },
            {
              producto_id: "prod-2",
              nombre: "Manzana Roja Elegida",
              unidad_medida: "KG",
              precio_unitario: 2200,
              cantidad_solicitada: 0.5,
              peso_real: null,
              subtotal: 1100,
              sin_stock: false
            },
            {
              producto_id: "prod-13",
              nombre: "Acelga de Huerta",
              unidad_medida: "UNIDAD",
              precio_unitario: 900,
              cantidad_solicitada: 1,
              peso_real: 1,
              subtotal: 900,
              sin_stock: false
            }
          ]
        },
        {
          id: 102,
          cliente: {
            nombre: "MarÃ­a Elena",
            telefono: "1198765432",
            direccion: "Retiro en Local"
          },
          tipo_entrega: "RETIRO",
          direccion_entrega: "Retiro por Mostrador",
          estado: "EN_PREPARACION",
          fecha: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
          total_estimado: 4700,
          total_real: null,
          items: [
            {
              producto_id: "prod-7",
              nombre: "Papa Negra Cepillada",
              unidad_medida: "KG",
              precio_unitario: 950,
              cantidad_solicitada: 2.0,
              peso_real: 2.15,
              subtotal: 2043,
              sin_stock: false
            },
            {
              producto_id: "prod-10",
              nombre: "Zanahoria Fresca",
              unidad_medida: "KG",
              precio_unitario: 1300,
              cantidad_solicitada: 1.0,
              peso_real: null,
              subtotal: 1300,
              sin_stock: false
            },
            {
              producto_id: "prod-3",
              nombre: "Naranja de Jugo",
              unidad_medida: "KG",
              precio_unitario: 1400,
              cantidad_solicitada: 1.0,
              peso_real: null,
              subtotal: 1400,
              sin_stock: false
            }
          ]
        }
      ];
      safeSet(STORAGE_KEYS.ORDERS, sampleOrders);
    }
  }

  // --- Reactividad ---
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(event, data) {
    this.listeners.forEach((cb) => cb(event, data));
  }

  // --- Productos ---
  getProducts() {
    return safeGet(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }

  updateProductPrice(productId, newPrice) {
    const products = this.getProducts().map((p) => {
      if (p.id === productId) {
        return { ...p, precio: Math.max(0, Number(newPrice)) };
      }
      return p;
    });
    safeSet(STORAGE_KEYS.PRODUCTS, products);
    this.notify("products_changed");
  }

  toggleProductStock(productId) {
    const products = this.getProducts().map((p) => {
      if (p.id === productId) {
        return { ...p, disponible: !p.disponible };
      }
      return p;
    });
    safeSet(STORAGE_KEYS.PRODUCTS, products);
    this.notify("products_changed");
  }

  // --- Clientes ---
  getCustomers() {
    return safeGet(STORAGE_KEYS.CUSTOMERS, {});
  }

  getCustomer(phone) {
    const cleanPhone = String(phone).replace(/\D/g, "");
    const customers = this.getCustomers();
    return customers[cleanPhone] || null;
  }

  saveCustomer(customer) {
    const cleanPhone = String(customer.telefono).replace(/\D/g, "");
    const customers = this.getCustomers();
    customers[cleanPhone] = { ...customer, telefono: cleanPhone };
    safeSet(STORAGE_KEYS.CUSTOMERS, customers);
    this.setCurrentUser(customers[cleanPhone]);
    this.notify("customers_changed");
    return customers[cleanPhone];
  }

  getCurrentUser() {
    return safeGet(STORAGE_KEYS.CURRENT_USER, null);
  }

  setCurrentUser(user) {
    safeSet(STORAGE_KEYS.CURRENT_USER, user);
    this.notify("user_changed", user);
  }

  logoutUser() {
    safeRemove(STORAGE_KEYS.CURRENT_USER);
    this.clearCart();
    this.notify("user_changed", null);
  }

  // --- Carrito ---
  getCart() {
    return safeGet(STORAGE_KEYS.CART, {});
  }

  addToCart(productId, quantityDelta) {
    const cart = this.getCart();
    const product = this.getProducts().find((p) => p.id === productId);
    if (!product || !product.disponible) return;

    const currentQty = cart[productId]?.cantidad || 0;
    const newQty = Math.max(0, Number((currentQty + quantityDelta).toFixed(2)));

    if (newQty <= 0) {
      delete cart[productId];
    } else {
      cart[productId] = {
        producto_id: productId,
        nombre: product.nombre,
        categoria: product.categoria,
        unidad_medida: product.unidad_medida,
        precio_unitario: product.precio,
        cantidad: newQty,
        subtotal_estimado: Math.round(newQty * product.precio)
      };
    }

    safeSet(STORAGE_KEYS.CART, cart);
    this.notify("cart_changed");
  }

  removeFromCart(productId) {
    const cart = this.getCart();
    delete cart[productId];
    safeSet(STORAGE_KEYS.CART, cart);
    this.notify("cart_changed");
  }

  clearCart() {
    safeRemove(STORAGE_KEYS.CART);
    this.notify("cart_changed");
  }

  getCartSummary() {
    const cart = this.getCart();
    const items = Object.values(cart);
    const totalEstimado = items.reduce((sum, item) => sum + item.subtotal_estimado, 0);
    const totalItems = items.length;
    return { items, totalEstimado, totalItems };
  }

  // --- Pedidos ---
  getOrders() {
    return safeGet(STORAGE_KEYS.ORDERS, []);
  }

  getActiveOrderId() {
    return safeGet(STORAGE_KEYS.ACTIVE_ORDER, null);
  }

  setActiveOrderId(orderId) {
    if (orderId) {
      safeSet(STORAGE_KEYS.ACTIVE_ORDER, Number(orderId));
    } else {
      safeRemove(STORAGE_KEYS.ACTIVE_ORDER);
    }
    this.notify("active_order_changed", orderId);
  }

  getActiveOrder() {
    const activeId = this.getActiveOrderId();
    if (!activeId) return null;
    const orders = this.getOrders();
    return orders.find((o) => o.id === activeId) || null;
  }

  createOrder({ cliente, tipo_entrega, direccion_entrega }) {
    const { items, totalEstimado } = this.getCartSummary();
    if (items.length === 0) return null;

    const orders = this.getOrders();
    const newId = orders.length > 0 ? Math.max(...orders.map((o) => o.id)) + 1 : 101;

    const newOrder = {
      id: newId,
      cliente,
      tipo_entrega,
      direccion_entrega: tipo_entrega === "DELIVERY" ? direccion_entrega : "Retiro en Mostrador",
      estado: "PENDIENTE",
      fecha: new Date().toISOString(),
      total_estimado: totalEstimado,
      total_real: null,
      items: items.map((item) => ({
        producto_id: item.producto_id,
        nombre: item.nombre,
        categoria: item.categoria,
        unidad_medida: item.unidad_medida,
        precio_unitario: item.precio_unitario,
        cantidad_solicitada: item.cantidad,
        peso_real: item.unidad_medida === "UNIDAD" ? item.cantidad : null,
        subtotal: item.subtotal_estimado,
        sin_stock: false
      }))
    };

    orders.unshift(newOrder);
    safeSet(STORAGE_KEYS.ORDERS, orders);
    this.setActiveOrderId(newOrder.id);
    this.clearCart();
    this.playAudioAlert();
    this.notify("order_created", newOrder);
    return newOrder;
  }

  updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders().map((order) => {
      if (order.id === orderId) {
        return { ...order, estado: newStatus, updated_at: new Date().toISOString() };
      }
      return order;
    });
    safeSet(STORAGE_KEYS.ORDERS, orders);
    this.notify("orders_changed");
  }

  updateItemWeight(orderId, itemIndex, pesoReal) {
    const orders = this.getOrders().map((order) => {
      if (order.id === orderId) {
        const items = [...order.items];
        const item = { ...items[itemIndex] };
        
        const peso = Math.max(0, Number(pesoReal));
        item.peso_real = peso;
        item.subtotal = Math.round(peso * item.precio_unitario);
        items[itemIndex] = item;

        const todosPesados = items.every((i) => i.sin_stock || i.peso_real !== null);
        let totalReal = null;
        if (todosPesados) {
          totalReal = items
            .filter((i) => !i.sin_stock)
            .reduce((sum, i) => sum + (i.subtotal || 0), 0);
        }

        return { ...order, items, total_real: totalReal };
      }
      return order;
    });
    safeSet(STORAGE_KEYS.ORDERS, orders);
    this.notify("orders_changed");
  }

  toggleItemOutOfStock(orderId, itemIndex) {
    const orders = this.getOrders().map((order) => {
      if (order.id === orderId) {
        const items = [...order.items];
        const item = { ...items[itemIndex] };
        item.sin_stock = !item.sin_stock;
        if (item.sin_stock) {
          item.subtotal = 0;
        } else {
          const qty = item.peso_real !== null ? item.peso_real : item.cantidad_solicitada;
          item.subtotal = Math.round(qty * item.precio_unitario);
        }
        items[itemIndex] = item;

        const totalReal = items
          .filter((i) => !i.sin_stock && i.peso_real !== null)
          .reduce((sum, i) => sum + (i.subtotal || 0), 0);

        return { ...order, items, total_real: totalReal };
      }
      return order;
    });
    safeSet(STORAGE_KEYS.ORDERS, orders);
    this.notify("orders_changed");
  }

  finalizeOrderWeighing(orderId) {
    const orders = this.getOrders().map((order) => {
      if (order.id === orderId) {
        const items = order.items.map((i) => {
          if (i.sin_stock) return i;
          const pesoFinal = i.peso_real !== null ? i.peso_real : i.cantidad_solicitada;
          return {
            ...i,
            peso_real: pesoFinal,
            subtotal: Math.round(pesoFinal * i.precio_unitario)
          };
        });

        const totalFinal = items
          .filter((i) => !i.sin_stock)
          .reduce((sum, i) => sum + i.subtotal, 0);

        return {
          ...order,
          items,
          total_real: totalFinal,
          estado: "LISTO",
          finalizado_at: new Date().toISOString()
        };
      }
      return order;
    });

    safeSet(STORAGE_KEYS.ORDERS, orders);
    this.notify("orders_changed");
    this.notify("order_ready", orderId);
  }

  // Eliminar o cancelar completamente un pedido
  deleteOrder(orderId) {
    const orders = this.getOrders().filter((o) => o.id !== orderId);
    safeSet(STORAGE_KEYS.ORDERS, orders);
    if (this.getActiveOrderId() === orderId) {
      this.setActiveOrderId(null);
    }
    this.notify("orders_changed");
  }

  // Quitar un producto especÃ­fico del pedido
  removeItemFromOrder(orderId, itemIndex) {
    const orders = this.getOrders().map((order) => {
      if (order.id === orderId) {
        const items = order.items.filter((_, idx) => idx !== itemIndex);
        const totalEstimado = items.reduce((sum, i) => sum + (i.subtotal || Math.round(i.cantidad_solicitada * i.precio_unitario)), 0);
        return { ...order, items, total_estimado: totalEstimado };
      }
      return order;
    });
    safeSet(STORAGE_KEYS.ORDERS, orders);
    this.notify("orders_changed");
  }

  // Agregar un producto al pedido en preparaciÃ³n
  addProductToOrder(orderId, productId, cantidad) {
    const product = this.getProducts().find((p) => p.id === productId);
    if (!product) return;
    const qty = Math.max(0.1, Number(cantidad));
    const subtotal = Math.round(qty * product.precio);

    const orders = this.getOrders().map((order) => {
      if (order.id === orderId) {
        const newItem = {
          producto_id: product.id,
          nombre: product.nombre,
          categoria: product.categoria,
          unidad_medida: product.unidad_medida,
          precio_unitario: product.precio,
          cantidad_solicitada: qty,
          peso_real: product.unidad_medida === "UNIDAD" ? qty : null,
          subtotal: subtotal,
          sin_stock: false
        };
        const items = [...order.items, newItem];
        const totalEstimado = items.reduce((sum, i) => sum + (i.subtotal || Math.round(i.cantidad_solicitada * i.precio_unitario)), 0);
        return { ...order, items, total_estimado: totalEstimado };
      }
      return order;
    });
    safeSet(STORAGE_KEYS.ORDERS, orders);
    this.notify("orders_changed");
  }

  // Modificar datos de entrega y contacto del pedido
  updateOrderDetails(orderId, details) {
    const orders = this.getOrders().map((order) => {
      if (order.id === orderId) {
        return {
          ...order,
          cliente: {
            ...order.cliente,
            nombre: details.nombre !== undefined ? details.nombre : order.cliente.nombre,
            telefono: details.telefono !== undefined ? details.telefono : order.cliente.telefono
          },
          tipo_entrega: details.tipo_entrega || order.tipo_entrega,
          direccion_entrega: details.direccion_entrega || order.direccion_entrega
        };
      }
      return order;
    });
    safeSet(STORAGE_KEYS.ORDERS, orders);
    this.notify("orders_changed");
  }

  playAudioAlert() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  }
}

const store = new Store();



  // ==========================================

  // 3. VISTA CLIENTE

  // ==========================================




function renderClientView(container) {
  let selectedCategory = "Todos";
  let searchQuery = "";
  let isCartOpen = false;
  let viewingActiveOrder = false;
  let deliveryMode = "RETIRO"; // RETIRO | DELIVERY
  let deliveryAddress = "";

  // Determinar si debemos mostrar el seguimiento de pedido automÃ¡ticamente al iniciar
  const initialActive = store.getActiveOrder();
  if (initialActive && initialActive.estado !== "ENTREGADO") {
    viewingActiveOrder = true;
  }

  function update() {
    const user = store.getCurrentUser();
    if (!user) {
      renderPhoneGate();
      return;
    }

    if (viewingActiveOrder) {
      const activeOrder = store.getActiveOrder();
      if (activeOrder) {
        renderOrderTracking(activeOrder);
        return;
      } else {
        viewingActiveOrder = false;
      }
    }

    renderCatalog();
  }

  // ========================================================
  // 1. PANTALLA DE ACCESO / TELEFONO (Mobile First)
  // ========================================================
  function renderPhoneGate() {
    container.innerHTML = `
      <div class="max-w-md mx-auto p-4 pt-8 pb-16 min-h-[85vh] flex flex-col justify-center">
        <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-200/80 text-left">
          
          <div class="mb-6">
            <span class="inline-block text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 mb-3">
              VerdulerÃ­a Digital
            </span>
            <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Mi Huerta</h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              CatÃ¡logo fresco del dÃ­a, pedidos directos desde tu celular y pesaje transparente en balanza.
            </p>
          </div>

          <form id="phone-form" class="space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                NÃºmero de WhatsApp
              </label>
              <div class="relative flex items-center">
                <span class="absolute left-4 text-slate-400 font-semibold text-base select-none pointer-events-none">
                  +54 9
                </span>
                <input 
                  type="tel" 
                  id="phone-input" 
                  required 
                  inputmode="numeric"
                  placeholder="11 2345 6789" 
                  value="1123456789"
                  class="w-full pl-20 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 font-bold text-base outline-none transition"
                />
              </div>
              <p class="text-[11px] text-slate-400 mt-1.5">
                Usamos tu telÃ©fono para enviarte el comprobante de pesaje real por WhatsApp.
              </p>
            </div>

            <div id="new-user-fields" class="space-y-3 pt-1">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nombre completo
                </label>
                <input 
                  type="text" 
                  id="name-input" 
                  placeholder="Ej: Facundo GÃ³mez" 
                  class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 text-base font-medium outline-none transition"
                />
              </div>

              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  DirecciÃ³n de entrega (opcional)
                </label>
                <input 
                  type="text" 
                  id="address-input" 
                  placeholder="Ej: Av. Rivadavia 4520, Piso 3 B" 
                  class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 text-base font-medium outline-none transition"
                />
              </div>
            </div>

            <button 
              type="submit" 
              class="w-full mt-2 min-h-[48px] bg-slate-950 hover:bg-slate-900 active:bg-black text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-slate-950/15 transition tap-feedback text-sm flex items-center justify-center gap-2"
            >
              <span>Ingresar al CatÃ¡logo</span>
              <span class="text-xs text-slate-400">â€º</span>
            </button>
          </form>

          <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              Precios del dÃ­a
            </span>
            <span>Pesaje transparente</span>
          </div>
        </div>
      </div>
    `;

    const phoneForm = container.querySelector("#phone-form");
    const phoneInput = container.querySelector("#phone-input");
    const nameInput = container.querySelector("#name-input");
    const addressInput = container.querySelector("#address-input");

    function syncUserFields(phoneVal) {
      const match = store.getCustomer(phoneVal);
      if (match) {
        nameInput.value = match.nombre || "";
        addressInput.value = match.direccion || "";
      }
    }

    phoneInput.addEventListener("input", (e) => {
      syncUserFields(e.target.value);
    });

    syncUserFields(phoneInput.value);

    phoneForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const phone = phoneInput.value.trim();
      const name = nameInput.value.trim() || "Cliente";
      const address = addressInput.value.trim();

      const user = store.saveCustomer({
        telefono: phone,
        nombre: name,
        direccion: address
      });

      store.setCurrentUser(user);
      deliveryAddress = user.direccion || "";
      update();
    });
  }

  // ========================================================
  // 2. CATALOGO PRINCIPAL
  // ========================================================
  function renderCatalog() {
    const user = store.getCurrentUser();
    const products = store.getProducts();
    const cart = store.getCart();
    const { items: cartItems, totalEstimado, totalItems } = store.getCartSummary();
    const activeOrder = store.getActiveOrder();

    if (!deliveryAddress && user.direccion) {
      deliveryAddress = user.direccion;
    }

    const filteredProducts = products.filter((p) => {
      const matchesCategory = selectedCategory === "Todos" || p.categoria === selectedCategory;
      const matchesSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesCategory && matchesSearch;
    });

    container.innerHTML = `
      <div class="max-w-md mx-auto pb-36">
        
        <!-- Banner de Pedido Activo en Curso (si existe) -->
        ${
          activeOrder && activeOrder.estado !== "ENTREGADO"
            ? `
          <div class="px-4 pt-3">
            <button 
              id="btn-banner-active-order"
              class="w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-950 p-3 rounded-2xl text-left flex items-center justify-between transition tap-feedback shadow-sm"
            >
              <div>
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span class="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                    Pedido #${activeOrder.id} en curso
                  </span>
                  <span class="text-[10px] px-2 py-0.2 rounded-full font-bold bg-white text-emerald-800 border border-emerald-200">
                    ${activeOrder.estado}
                  </span>
                </div>
                <p class="text-xs text-emerald-900 font-semibold mt-0.5">
                  TocÃ¡ aquÃ­ para ver el pesaje en balanza en tiempo real
                </p>
              </div>
              <span class="text-sm font-bold text-emerald-700 ml-2">â€º</span>
            </button>
          </div>
        `
            : ""
        }

        <!-- Header MÃ³vil del CatÃ¡logo (Coordinado debajo de la barra demo: top-[49px]) -->
        <header class="sticky top-[49px] z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 pt-3 pb-2.5 shadow-sm">
          <div class="flex items-center justify-between gap-2">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-black text-slate-900 tracking-tight uppercase">CatÃ¡logo de Huerta</span>
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span class="text-[11px] font-bold text-emerald-700">Abierto</span>
              </div>
              <p class="text-xs text-slate-500">
                <span>Hola, <strong class="text-slate-800 font-semibold">${user.nombre}</strong></span>
                <button id="btn-change-user" class="text-slate-400 underline ml-1 hover:text-slate-600">Cambiar</button>
              </p>
            </div>
            
            <button 
              id="btn-header-cart" 
              class="relative min-h-[44px] px-3.5 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-2 tap-feedback"
            >
              <span>Pedido</span>
              <span class="px-2 py-0.5 rounded-full ${totalItems > 0 ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-700"} text-xs font-black">
                ${totalItems}
              </span>
            </button>
          </div>

          <!-- Buscador con tamaÃ±o de fuente accesible para evitar zoom iOS -->
          <div class="mt-2.5 relative">
            <input 
              type="text" 
              id="search-input" 
              placeholder="Buscar productos (papa, tomate, acelga)..." 
              value="${searchQuery}"
              class="w-full pl-3.5 pr-10 py-2.5 bg-slate-100 focus:bg-white border border-transparent focus:border-slate-300 rounded-xl text-base font-medium outline-none transition"
            />
            ${
              searchQuery
                ? `<button id="btn-clear-search" class="absolute right-1 top-1 w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-700 text-sm font-bold tap-feedback">X</button>`
                : ""
            }
          </div>

          <!-- PÃ­ldoras de CategorÃ­as (Horizontal Scroll TÃ¡ctil) -->
          <div class="mt-2.5 flex gap-2 overflow-x-auto no-scrollbar py-1">
            ${CATEGORIAS.map(
              (cat) => `
              <button 
                data-category="${cat}"
                class="category-pill whitespace-nowrap min-h-[38px] px-4 py-1.5 rounded-full text-xs font-bold transition tap-feedback ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }"
              >
                ${cat}
              </button>
            `
            ).join("")}
          </div>
        </header>

        <!-- Contenedor de Productos -->
        <main id="products-list-container" class="p-4 space-y-2.5">
          ${renderProductCardsHTML(filteredProducts, cart)}
        </main>

        <!-- Barra Flotante Inferior de Pedido (Safe Area Adaptable) -->
        ${
          totalItems > 0
            ? `
          <div class="fixed left-4 right-4 z-30 max-w-md mx-auto pointer-events-auto safe-floating-bottom">
            <button 
              id="btn-open-cart"
              class="w-full min-h-[52px] bg-slate-950 hover:bg-slate-900 active:bg-black text-white p-3.5 px-4 rounded-2xl shadow-xl shadow-slate-950/30 flex items-center justify-between transition tap-feedback border border-slate-800"
            >
              <div class="flex items-center gap-3">
                <span class="bg-emerald-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-full">
                  ${totalItems}
                </span>
                <div class="text-left">
                  <span class="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Total Estimado</span>
                  <span class="font-black text-base leading-none text-white">$${totalEstimado.toLocaleString("es-AR")}</span>
                </div>
              </div>
              <div class="flex items-center gap-1.5 font-bold text-xs bg-slate-800 hover:bg-slate-700 px-3.5 py-2.5 rounded-xl text-emerald-400 transition">
                <span>Ver Pedido</span>
                <span class="text-xs">â€º</span>
              </div>
            </button>
          </div>
        `
            : ""
        }

        <!-- Bottom Sheet Drawer de Carrito -->
        ${isCartOpen ? renderCartDrawer(user, cartItems, totalEstimado) : ""}
      </div>
    `;

    attachCatalogListeners(user);
    if (isCartOpen) {
      attachCartDrawerListeners(user);
    }
  }

  // Generador de tarjetas de productos
  function renderProductCardsHTML(products, cart) {
    if (products.length === 0) {
      return `
        <div class="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-6">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Sin coincidencias</span>
          <p class="text-sm font-semibold text-slate-700">No encontramos productos con ese nombre</p>
          <button id="btn-reset-filter" class="mt-3 min-h-[44px] px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 tap-feedback">
            Limpiar bÃºsqueda
          </button>
        </div>
      `;
    }

    return products
      .map((product) => {
        const cartItem = cart[product.id];
        const currentQty = cartItem ? cartItem.cantidad : 0;
        const step = product.paso || 0.5;
        const unitLabel = product.unidad_medida === "KG" ? "kg" : "u.";
        const unitSubtitle = product.unidad_medida === "KG" ? "Por kilo" : "Por unidad";

        return `
          <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between gap-3 transition ${
            !product.disponible ? "opacity-40 grayscale pointer-events-none" : ""
          }">
            <!-- Info Producto -->
            <div class="flex-1 min-w-0 pr-1">
              <div class="flex items-center gap-1.5 mb-1">
                <span class="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  ${product.categoria}
                </span>
                <span class="text-[10px] text-slate-300">Â·</span>
                <span class="text-[10px] font-semibold text-slate-400">
                  ${unitSubtitle}
                </span>
              </div>

              <h3 class="font-extrabold text-slate-900 text-sm leading-tight truncate">
                ${product.nombre}
              </h3>

              <p class="text-[11px] text-slate-400 truncate mt-0.5">
                ${product.detalle || ""}
              </p>

              <div class="mt-1.5 flex items-baseline gap-1">
                <span class="text-base font-black text-emerald-700">
                  $${product.precio.toLocaleString("es-AR")}
                </span>
                <span class="text-xs text-slate-400 font-medium">/ ${unitLabel}</span>
              </div>

              ${
                !product.disponible
                  ? `<span class="inline-block text-[10px] font-bold text-rose-600 uppercase tracking-wider mt-1">Sin Stock</span>`
                  : ""
              }
            </div>

            <!-- Selector de Cantidad / BotÃ³n TÃ¡ctil -->
            <div class="shrink-0">
              ${
                product.disponible
                  ? currentQty === 0
                    ? `
                    <button 
                      data-add-id="${product.id}"
                      data-step="${step}"
                      class="btn-add-initial min-h-[44px] bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition tap-feedback flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Agregar</span>
                      <span class="text-xs font-normal">+</span>
                    </button>
                  `
                    : `
                    <div class="flex items-center bg-emerald-600 text-white rounded-xl p-1 shadow-sm">
                      <button 
                        data-dec-id="${product.id}"
                        data-step="${step}"
                        class="btn-qty-dec w-10 h-10 flex items-center justify-center rounded-lg hover:bg-emerald-700 active:scale-90 text-base font-black transition tap-feedback"
                        title="Restar"
                      >
                        âˆ’
                      </button>
                      <span class="px-2 text-xs font-black min-w-[50px] text-center tracking-tight select-none">
                        ${currentQty} ${unitLabel}
                      </span>
                      <button 
                        data-inc-id="${product.id}"
                        data-step="${step}"
                        class="btn-qty-inc w-10 h-10 flex items-center justify-center rounded-lg hover:bg-emerald-700 active:scale-90 text-base font-black transition tap-feedback"
                        title="Sumar"
                      >
                        +
                      </button>
                    </div>
                  `
                  : ""
              }
            </div>
          </div>
        `;
      })
      .join("");
  }

  function attachCatalogListeners(user) {
    container.querySelector("#btn-banner-active-order")?.addEventListener("click", () => {
      viewingActiveOrder = true;
      update();
    });

    container.querySelector("#btn-change-user")?.addEventListener("click", () => {
      store.logoutUser();
      update();
    });

    container.querySelector("#btn-header-cart")?.addEventListener("click", () => {
      const { totalItems } = store.getCartSummary();
      if (totalItems > 0) {
        isCartOpen = true;
        renderCatalog();
      }
    });

    // BÃºsqueda en tiempo real sin recargar todo el header
    const searchInput = container.querySelector("#search-input");
    searchInput?.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      const products = store.getProducts();
      const cart = store.getCart();
      const filtered = products.filter((p) => {
        const matchesCategory = selectedCategory === "Todos" || p.categoria === selectedCategory;
        const matchesSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase().trim());
        return matchesCategory && matchesSearch;
      });

      const listContainer = container.querySelector("#products-list-container");
      if (listContainer) {
        listContainer.innerHTML = renderProductCardsHTML(filtered, cart);
        attachProductItemListeners();
      }
    });

    container.querySelector("#btn-clear-search")?.addEventListener("click", () => {
      searchQuery = "";
      renderCatalog();
    });

    container.querySelector("#btn-reset-filter")?.addEventListener("click", () => {
      searchQuery = "";
      selectedCategory = "Todos";
      renderCatalog();
    });

    container.querySelectorAll(".category-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedCategory = btn.dataset.category;
        renderCatalog();
      });
    });

    container.querySelector("#btn-open-cart")?.addEventListener("click", () => {
      isCartOpen = true;
      renderCatalog();
    });

    attachProductItemListeners();
  }

  function attachProductItemListeners() {
    container.querySelectorAll(".btn-add-initial, .btn-qty-inc").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.addId || btn.dataset.incId;
        const step = Number(btn.dataset.step) || 0.5;
        store.addToCart(id, step);
      });
    });

    container.querySelectorAll(".btn-qty-dec").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.decId;
        const step = Number(btn.dataset.step) || 0.5;
        store.addToCart(id, -step);
      });
    });
  }

  // ========================================================
  // 3. BOTTOM SHEET / DRAWER DE CARRITO & CHECKOUT
  // ========================================================
  function renderCartDrawer(user, items, totalEstimado) {
    const isDelivery = deliveryMode === "DELIVERY";

    return `
      <!-- Backdrop con cierre al tocar fondo -->
      <div id="cart-drawer-backdrop" class="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm flex items-end justify-center animate-fade-in">
        <div id="cart-drawer-sheet" class="bg-white w-full max-w-md rounded-t-3xl max-h-[90vh] flex flex-col shadow-2xl animate-slide-up border-t border-slate-200">
          
          <!-- Handle bar tÃ¡ctil -->
          <div class="w-12 h-1 bg-slate-300 rounded-full mx-auto mt-3"></div>

          <!-- Header Carrito con botÃ³n de cierre accesible (44x44px) -->
          <div class="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 class="font-black text-slate-900 text-lg tracking-tight">Tu Pedido</h2>
              <p class="text-[11px] text-slate-400 font-medium">RevisÃ¡ las cantidades antes de confirmar</p>
            </div>
            <button 
              id="btn-close-cart" 
              class="w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center font-bold text-sm tap-feedback touch-target"
              title="Cerrar pedido"
            >
              X
            </button>
          </div>

          <!-- Lista de Ãtems en Carrito con Controles Directos -->
          <div class="p-5 overflow-y-auto space-y-3 flex-1 overscroll-contain">
            ${
              items.length === 0
                ? `<p class="text-xs text-slate-400 text-center py-8">Tu pedido estÃ¡ vacÃ­o</p>`
                : items
                    .map(
                      (item) => `
                <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center justify-between gap-3">
                  <div class="flex-1 min-w-0">
                    <span class="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-200/80 text-slate-600">
                      ${item.categoria || "Producto"}
                    </span>
                    <h4 class="font-extrabold text-slate-900 text-sm truncate mt-0.5">${item.nombre}</h4>
                    <p class="text-xs text-slate-400 mt-0.5">
                      $${item.precio_unitario.toLocaleString("es-AR")} / ${item.unidad_medida === "KG" ? "kg" : "u."}
                    </p>
                  </div>

                  <!-- Stepper en Carrito con botones cÃ³modos (38px) -->
                  <div class="flex items-center gap-2">
                    <div class="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-sm">
                      <button 
                        data-drawer-dec="${item.producto_id}" 
                        class="w-8 h-8 flex items-center justify-center text-slate-800 hover:bg-slate-100 active:scale-95 rounded-lg font-black text-sm tap-feedback"
                        title="Restar"
                      >
                        âˆ’
                      </button>
                      <span class="px-2 text-xs font-black min-w-[38px] text-center text-slate-900 select-none">
                        ${item.cantidad}
                      </span>
                      <button 
                        data-drawer-inc="${item.producto_id}" 
                        class="w-8 h-8 flex items-center justify-center text-slate-800 hover:bg-slate-100 active:scale-95 rounded-lg font-black text-sm tap-feedback"
                        title="Sumar"
                      >
                        +
                      </button>
                    </div>

                    <div class="text-right min-w-[70px]">
                      <span class="font-black text-sm text-slate-900 block">
                        $${item.subtotal_estimado.toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>
                </div>
              `
                    )
                    .join("")
            }

            <!-- Selector de Forma de Entrega Segmentado -->
            <div class="pt-3">
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                MÃ©todo de Entrega
              </label>
              <div class="grid grid-cols-2 gap-2">
                <label class="flex flex-col p-3.5 border rounded-2xl cursor-pointer transition tap-feedback ${
                  !isDelivery ? "border-slate-900 bg-slate-900 text-white shadow-sm" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-black">Retiro en Local</span>
                    <input type="radio" name="delivery-mode" value="RETIRO" ${!isDelivery ? "checked" : ""} class="accent-emerald-500" />
                  </div>
                  <span class="text-[10px] opacity-75 mt-1">Listo en 20-30 min Â· Sin costo</span>
                </label>

                <label class="flex flex-col p-3.5 border rounded-2xl cursor-pointer transition tap-feedback ${
                  isDelivery ? "border-slate-900 bg-slate-900 text-white shadow-sm" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-black">EnvÃ­o a Domicilio</span>
                    <input type="radio" name="delivery-mode" value="DELIVERY" ${isDelivery ? "checked" : ""} class="accent-emerald-500" />
                  </div>
                  <span class="text-[10px] opacity-75 mt-1">Cadete a tu puerta</span>
                </label>
              </div>
            </div>

            <!-- Campo DirecciÃ³n de EnvÃ­o -->
            <div id="delivery-address-container" class="${isDelivery ? "" : "hidden"} pt-1">
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                DirecciÃ³n exacta de entrega
              </label>
              <input 
                type="text" 
                id="delivery-address-input" 
                value="${deliveryAddress}" 
                placeholder="Calle, nÃºmero, piso y departamento"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-medium outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 transition"
              />
            </div>

            <!-- ExplicaciÃ³n de Pesaje Real Transparente -->
            <div class="bg-amber-50/90 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-950 mt-2">
              <div class="flex items-center gap-1.5 mb-1">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                <span class="font-bold text-[11px] uppercase tracking-wider text-amber-900">Pesaje en Balanza</span>
              </div>
              <p class="text-[11px] leading-relaxed opacity-90">
                El total indicado es una estimaciÃ³n. En el mostrador se pesan las unidades reales y te notificaremos el comprobante con los gramos exactos y el importe final.
              </p>
            </div>
          </div>

          <!-- Footer con ConfirmaciÃ³n y Safe Area Pad -->
          <div class="p-5 border-t border-slate-100 bg-slate-50 rounded-b-3xl space-y-3 safe-pb">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Total Estimado</span>
                <span class="text-xs text-slate-500 font-medium">Sujeto a balanza</span>
              </div>
              <span class="font-black text-2xl text-slate-900">$${totalEstimado.toLocaleString("es-AR")}</span>
            </div>

            <button 
              id="btn-confirm-order"
              class="w-full min-h-[50px] bg-slate-950 hover:bg-slate-900 active:bg-black text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-950/20 text-sm transition tap-feedback flex items-center justify-center gap-2"
            >
              <span>Confirmar Pedido</span>
              <span class="text-xs text-slate-400">â€º</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function attachCartDrawerListeners(user) {
    // Cerrar al hacer clic en el backdrop
    const backdrop = container.querySelector("#cart-drawer-backdrop");
    backdrop?.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        isCartOpen = false;
        renderCatalog();
      }
    });

    container.querySelector("#btn-close-cart")?.addEventListener("click", () => {
      isCartOpen = false;
      renderCatalog();
    });

    const addressInput = container.querySelector("#delivery-address-input");
    addressInput?.addEventListener("input", (e) => {
      deliveryAddress = e.target.value;
    });

    const radios = container.querySelectorAll('input[name="delivery-mode"]');
    radios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        deliveryMode = e.target.value;
        renderCatalog();
      });
    });

    // Controles directos de cantidad en drawer (preservando estado de envÃ­o)
    container.querySelectorAll("[data-drawer-inc]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.drawerInc;
        const product = store.getProducts().find((p) => p.id === id);
        const step = product?.paso || 0.5;
        store.addToCart(id, step);
      });
    });

    container.querySelectorAll("[data-drawer-dec]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.drawerDec;
        const product = store.getProducts().find((p) => p.id === id);
        const step = product?.paso || 0.5;
        store.addToCart(id, -step);
      });
    });

    const btnConfirm = container.querySelector("#btn-confirm-order");
    btnConfirm?.addEventListener("click", () => {
      const mode = deliveryMode;
      const finalAddress = mode === "DELIVERY" ? deliveryAddress.trim() : "Retiro en Mostrador";

      if (mode === "DELIVERY" && !finalAddress) {
        alert("Por favor ingresÃ¡ tu direcciÃ³n para coordinar el envÃ­o a domicilio.");
        addressInput?.focus();
        return;
      }

      const newOrder = store.createOrder({
        cliente: user,
        tipo_entrega: mode,
        direccion_entrega: finalAddress
      });

      isCartOpen = false;
      viewingActiveOrder = true;
      update();
    });
  }

  // ========================================================
  // 4. PANTALLA DE SEGUIMIENTO DEL PEDIDO (Timeline y Balanza)
  // ========================================================
  function renderOrderTracking(currentOrder) {
    const isWeighing = currentOrder.estado === "EN_PREPARACION";
    const isReady = currentOrder.estado === "LISTO" || currentOrder.estado === "ENTREGADO";
    const isDelivered = currentOrder.estado === "ENTREGADO";

    let stepNumber = 1;
    let stepTitle = "Pedido Recibido";
    let stepDesc = "El pedido ingresÃ³ en la cola del mostrador.";

    if (isWeighing) {
      stepNumber = 2;
      stepTitle = "En Balanza";
      stepDesc = "El operario estÃ¡ pesando cada uno de tus productos.";
    } else if (isReady && !isDelivered) {
      stepNumber = 3;
      stepTitle = "Listo para Entrega";
      stepDesc = currentOrder.tipo_entrega === "DELIVERY"
        ? "El pedido fue pesado y el cadete estÃ¡ listo para despachar."
        : "El pedido fue pesado y podÃ©s pasar a retirarlo por el local.";
    } else if (isDelivered) {
      stepNumber = 4;
      stepTitle = "Entregado y Cobrado";
      stepDesc = "Pedido finalizado exitosamente. Â¡Muchas gracias por tu compra!";
    }

    container.innerHTML = `
      <div class="max-w-md mx-auto p-4 pt-4 pb-28">
        
        <!-- BotÃ³n para volver a ver catÃ¡logo sin perder el pedido -->
        <div class="mb-3">
          <button 
            id="btn-back-to-catalog" 
            class="min-h-[44px] px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl shadow-sm transition tap-feedback flex items-center gap-1.5"
          >
            <span>â€¹</span>
            <span>Volver al CatÃ¡logo</span>
          </button>
        </div>

        <div class="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-200/80 text-left">
          
          <!-- Encabezado de la Orden -->
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Comprobante Digital</span>
              <h2 class="text-xl font-black text-slate-900 tracking-tight">Pedido #${currentOrder.id}</h2>
            </div>
            <span class="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${
              isDelivered
                ? "bg-slate-100 text-slate-800 border border-slate-300"
                : isReady
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse"
                : isWeighing
                ? "bg-blue-100 text-blue-800 border border-blue-300 animate-pulse"
                : "bg-amber-100 text-amber-800 border border-amber-300"
            }">
              ${currentOrder.estado}
            </span>
          </div>

          <!-- LÃ­nea de Progreso (Timeline Minimalista de 4 Pasos) -->
          <div class="my-5">
            <div class="grid grid-cols-4 gap-1.5 text-center">
              <div class="h-1.5 rounded-full ${stepNumber >= 1 ? "bg-slate-900" : "bg-slate-200"}"></div>
              <div class="h-1.5 rounded-full ${stepNumber >= 2 ? (stepNumber > 2 ? "bg-slate-900" : "bg-blue-600") : "bg-slate-200"}"></div>
              <div class="h-1.5 rounded-full ${stepNumber >= 3 ? (stepNumber > 3 ? "bg-slate-900" : "bg-emerald-600") : "bg-slate-200"}"></div>
              <div class="h-1.5 rounded-full ${stepNumber >= 4 ? "bg-slate-900" : "bg-slate-200"}"></div>
            </div>
            <div class="mt-3">
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-extrabold text-slate-900">${stepTitle}</h3>
                ${
                  isWeighing || (isReady && !isDelivered)
                    ? `<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>`
                    : ""
                }
              </div>
              <p class="text-xs text-slate-500 mt-0.5 leading-relaxed">${stepDesc}</p>
            </div>
          </div>

          <!-- Resumen Financiero -->
          <div class="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
            <div class="flex justify-between text-xs text-slate-500">
              <span>Entrega:</span>
              <strong class="text-slate-800 font-semibold">
                ${currentOrder.tipo_entrega === "DELIVERY" ? "EnvÃ­o a Domicilio" : "Retiro en Mostrador"}
              </strong>
            </div>

            ${
              currentOrder.tipo_entrega === "DELIVERY"
                ? `
              <div class="flex justify-between text-xs text-slate-500">
                <span>Destino:</span>
                <span class="text-slate-800 font-medium text-right">${currentOrder.direccion_entrega}</span>
              </div>
            `
                : ""
            }

            ${
              isReady && currentOrder.total_real !== null
                ? `
              <div class="pt-2.5 border-t border-slate-200">
                <div class="flex justify-between items-center text-xs text-slate-400">
                  <span>Estimado inicial:</span>
                  <span class="line-through">$${currentOrder.total_estimado.toLocaleString("es-AR")}</span>
                </div>
                <div class="flex justify-between items-center mt-1">
                  <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">Total Final en Balanza:</span>
                  <span class="font-black text-2xl text-emerald-700">$${currentOrder.total_real.toLocaleString("es-AR")}</span>
                </div>
              </div>
            `
                : `
              <div class="pt-2.5 border-t border-slate-200 flex justify-between items-center">
                <span class="text-xs font-semibold text-slate-600">Total Estimado:</span>
                <span class="font-black text-xl text-slate-900">$${currentOrder.total_estimado.toLocaleString("es-AR")}</span>
              </div>
            `
            }
          </div>

          <!-- Desglose Ãtems Pesados -->
          <div class="mt-5">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Detalle de Productos</h4>
            <div class="divide-y divide-slate-100 text-xs">
              ${currentOrder.items
                .map((item) => {
                  const pesoTexto =
                    item.peso_real !== null
                      ? `${item.peso_real} ${item.unidad_medida === "KG" ? "kg" : "u."} (pesado)`
                      : `${item.cantidad_solicitada} ${item.unidad_medida === "KG" ? "kg" : "u."} (aprox)`;
                  return `
                  <div class="py-2.5 flex items-center justify-between gap-2 ${item.sin_stock ? "opacity-40 line-through" : ""}">
                    <div>
                      <span class="font-bold text-slate-800 text-xs">${item.nombre}</span>
                      <span class="text-[11px] text-slate-400 block">${pesoTexto}</span>
                    </div>
                    <strong class="text-slate-900 font-bold text-xs">
                      $${(item.subtotal || 0).toLocaleString("es-AR")}
                    </strong>
                  </div>
                `;
                })
                .join("")}
            </div>
          </div>

          <!-- Acciones de Seguimiento -->
          <div class="mt-6 pt-4 border-t border-slate-100 space-y-2">
            <button 
              id="btn-new-order" 
              class="w-full min-h-[46px] py-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition tap-feedback"
            >
              Realizar Otro Pedido
            </button>
          </div>
        </div>
      </div>
    `;

    container.querySelector("#btn-back-to-catalog")?.addEventListener("click", () => {
      viewingActiveOrder = false;
      update();
    });

    container.querySelector("#btn-new-order")?.addEventListener("click", () => {
      store.setActiveOrderId(null);
      viewingActiveOrder = false;
      update();
    });
  }

  // SuscripciÃ³n reactiva al store
  const unsubscribe = store.subscribe((event) => {
    if (
      event === "cart_changed" ||
      event === "products_changed" ||
      event === "orders_changed" ||
      event === "active_order_changed" ||
      event === "storage_sync" ||
      event === "user_changed"
    ) {
      update();
    }
  });

  update();
  return () => unsubscribe();
}


  // ==========================================

  // 4. VISTA OPERARIO (BALANZA Y MOSTRADOR)

  // ==========================================



function renderOperatorView(container) {
  let activeTab = "PENDIENTE"; // PENDIENTE | EN_PREPARACION | LISTO | ENTREGADO
  let editingOrderId = null; // ID del pedido que se estÃ¡ editando en modal
  let addingProductOrderId = null; // ID del pedido que tiene abierto el desplegable de agregar Ã­tem

  function update() {
    container.innerHTML = "";
    const orders = store.getOrders();

    const counts = {
      PENDIENTE: orders.filter((o) => o.estado === "PENDIENTE").length,
      EN_PREPARACION: orders.filter((o) => o.estado === "EN_PREPARACION").length,
      LISTO: orders.filter((o) => o.estado === "LISTO").length,
      ENTREGADO: orders.filter((o) => o.estado === "ENTREGADO").length
    };

    container.innerHTML = `
      <div class="max-w-2xl mx-auto pb-24">
        <!-- Header del Mostrador -->
        <header class="sticky top-11 z-20 bg-slate-900 text-white px-4 py-3 shadow-md">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Puesto de Balanza</span>
              <h1 class="font-extrabold text-sm leading-tight text-white">Mostrador & Pesaje</h1>
              <p class="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                RecepciÃ³n en vivo activa
              </p>
            </div>

            <!-- BotÃ³n para probar sonido de alerta -->
            <button 
              id="btn-test-sound" 
              title="Probar sonido de pedido" 
              class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition tap-feedback"
            >
              <span>Probar timbre</span>
            </button>
          </div>

          <!-- PestaÃ±as del Kanban (Mobile-First) -->
          <div class="grid grid-cols-4 gap-1.5 mt-3 bg-slate-800/80 p-1 rounded-xl text-center">
            <button 
              data-tab="PENDIENTE" 
              class="tab-btn py-2 px-1 rounded-lg text-xs font-bold transition flex flex-col items-center gap-0.5 tap-feedback ${
                activeTab === "PENDIENTE" ? "bg-amber-400 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
              }"
            >
              <span>Entrantes</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === "PENDIENTE" ? "bg-amber-600/30 text-slate-950 font-black" : "bg-slate-700 text-slate-300"
              }">${counts.PENDIENTE}</span>
            </button>

            <button 
              data-tab="EN_PREPARACION" 
              class="tab-btn py-2 px-1 rounded-lg text-xs font-bold transition flex flex-col items-center gap-0.5 tap-feedback ${
                activeTab === "EN_PREPARACION" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }"
            >
              <span>En Balanza</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === "EN_PREPARACION" ? "bg-blue-800 text-white font-black" : "bg-slate-700 text-slate-300"
              }">${counts.EN_PREPARACION}</span>
            </button>

            <button 
              data-tab="LISTO" 
              class="tab-btn py-2 px-1 rounded-lg text-xs font-bold transition flex flex-col items-center gap-0.5 tap-feedback ${
                activeTab === "LISTO" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }"
            >
              <span>Listos</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === "LISTO" ? "bg-emerald-800 text-white font-black" : "bg-slate-700 text-slate-300"
              }">${counts.LISTO}</span>
            </button>

            <button 
              data-tab="ENTREGADO" 
              class="tab-btn py-2 px-1 rounded-lg text-xs font-bold transition flex flex-col items-center gap-0.5 tap-feedback ${
                activeTab === "ENTREGADO" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
              }"
            >
              <span>Cobrados</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-slate-300">${counts.ENTREGADO}</span>
            </button>
          </div>
        </header>

        <!-- Contenido segÃºn la pestaÃ±a activa -->
        <main class="p-4">
          ${renderTabContent(orders)}
        </main>

        <!-- Modal de EdiciÃ³n de Pedido -->
        ${editingOrderId ? renderEditModal(orders.find((o) => o.id === editingOrderId)) : ""}
      </div>
    `;

    // Listeners del header
    container.querySelector("#btn-test-sound").addEventListener("click", () => {
      store.playAudioAlert();
    });

    container.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeTab = btn.dataset.tab;
        update();
      });
    });

    attachActions(orders);
  }

  // --- Render segÃºn PestaÃ±a ---
  function renderTabContent(orders) {
    const tabOrders = orders.filter((o) => o.estado === activeTab);

    if (tabOrders.length === 0) {
      return `
        <div class="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-6">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Sin Ã³rdenes</span>
          <h3 class="font-bold text-slate-700 text-sm">No hay pedidos en esta columna</h3>
          <p class="text-xs text-slate-400 mt-1">Los nuevos pedidos ingresarÃ¡n automÃ¡ticamente aquÃ­ en tiempo real.</p>
        </div>
      `;
    }

    // 1. PestaÃ±a PENDIENTES
    if (activeTab === "PENDIENTE") {
      return `
        <div class="space-y-3">
          ${tabOrders
            .map((order) => {
              const itemsList = order.items
                .map((i) => `${i.cantidad_solicitada}${i.unidad_medida === "KG" ? "kg" : "u"} ${i.nombre}`)
                .join(" Â· ");

              return `
              <div class="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm transition">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-base font-black text-slate-900">#${order.id}</span>
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        order.tipo_entrega === "DELIVERY"
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-700"
                      }">
                        ${order.tipo_entrega === "DELIVERY" ? "EnvÃ­o a Domicilio" : "Retiro en Local"}
                      </span>
                    </div>
                    <h3 class="font-extrabold text-slate-900 text-sm mt-1.5">${order.cliente.nombre}</h3>
                    <p class="text-xs text-slate-400">${order.cliente.telefono} Â· ${timeAgo(order.fecha)}</p>
                  </div>
                  <div class="text-right">
                    <span class="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Estimado</span>
                    <span class="font-black text-base text-slate-900">$${order.total_estimado.toLocaleString("es-AR")}</span>
                  </div>
                </div>

                <!-- Resumen de productos solicitados -->
                <div class="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                  <span class="font-bold text-slate-700 block mb-0.5 text-[11px] uppercase tracking-wider">Productos solicitados (${order.items.length}):</span>
                  <p class="leading-relaxed">${itemsList || "Sin productos"}</p>
                </div>

                <!-- Acciones Principales y de GestiÃ³n -->
                <div class="mt-3 space-y-2">
                  <button 
                    data-start-id="${order.id}" 
                    class="btn-start-prep w-full min-h-[46px] bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-950 font-black py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-sm transition tap-feedback flex items-center justify-center gap-2"
                  >
                    <span>Tomar y Pesar en Balanza</span>
                    <span class="text-xs">â€º</span>
                  </button>

                  <div class="grid grid-cols-2 gap-2">
                    <button 
                      data-edit-order-id="${order.id}"
                      class="btn-open-edit min-h-[38px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition tap-feedback"
                    >
                      <span>Editar datos</span>
                    </button>
                    <button 
                      data-delete-order-id="${order.id}"
                      class="btn-cancel-order min-h-[38px] bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition tap-feedback"
                    >
                      <span>Cancelar pedido</span>
                    </button>
                  </div>
                </div>
              </div>
            `;
            })
            .join("")}
        </div>
      `;
    }

    // 2. PestaÃ±a EN PREPARACIÃ“N (MÃ³dulo de Pesaje en Balanza)
    if (activeTab === "EN_PREPARACION") {
      const activeProducts = store.getProducts().filter((p) => p.disponible);

      return `
        <div class="space-y-4">
          ${tabOrders
            .map((order) => {
              const currentTotal = order.items
                .filter((i) => !i.sin_stock)
                .reduce((sum, i) => sum + (i.peso_real !== null ? i.subtotal : Math.round(i.cantidad_solicitada * i.precio_unitario)), 0);

              const isAddingProduct = addingProductOrderId === order.id;

              return `
              <div class="bg-white rounded-3xl p-4 sm:p-5 border-2 border-blue-200/80 shadow-md">
                <!-- Header de la tarjeta -->
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span class="text-[10px] font-black text-blue-600 tracking-widest uppercase">Pesaje Activo</span>
                    <h2 class="text-lg font-black text-slate-900">Pedido #${order.id} Â· ${order.cliente.nombre}</h2>
                    <p class="text-xs text-slate-400">
                      ${order.tipo_entrega === "DELIVERY" ? order.direccion_entrega : "Retiro por mostrador"}
                    </p>
                  </div>
                  <div class="text-right">
                    <span class="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Total en Balanza</span>
                    <span id="order-balanza-total-${order.id}" class="text-2xl font-black text-emerald-700">$${Math.round(currentTotal).toLocaleString("es-AR")}</span>
                  </div>
                </div>

                <!-- Lista de Pesaje Ãtem por Ãtem -->
                <div class="mt-4 space-y-2.5">
                  ${
                    order.items.length === 0
                      ? `
                    <div class="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      No hay productos en este pedido. PodÃ©s agregar uno abajo.
                    </div>
                  `
                      : order.items
                          .map((item, idx) => {
                            const isWeight = item.unidad_medida === "KG";
                            const currentVal = item.peso_real !== null ? item.peso_real : "";
                            const subtotalItem = item.peso_real !== null ? item.subtotal : Math.round(item.cantidad_solicitada * item.precio_unitario);

                            return `
                      <div class="item-weigh-card p-3 rounded-2xl border transition ${
                        item.sin_stock
                          ? "bg-rose-50 border-rose-200 opacity-60"
                          : item.peso_real !== null
                          ? "bg-emerald-50/50 border-emerald-300"
                          : "bg-slate-50 border-slate-200"
                      }">
                        <div class="flex items-start justify-between gap-2">
                          <div class="flex-1 min-w-0">
                            <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                              ${item.categoria || (isWeight ? "Por Kilo" : "Por Unidad")}
                            </span>
                            <h4 class="font-extrabold text-slate-900 text-sm mt-1 truncate ${item.sin_stock ? "line-through text-rose-600" : ""}">
                              ${item.nombre}
                            </h4>
                            <p class="text-xs text-slate-500 mt-0.5">
                              SolicitÃ³: <strong class="text-slate-800 font-bold">${item.cantidad_solicitada} ${isWeight ? "kg" : "u."}</strong>
                              Â· ($${item.precio_unitario.toLocaleString("es-AR")} / ${isWeight ? "kg" : "u"})
                            </p>
                          </div>

                          <!-- Acciones por Ã­tem: Sin Stock y Quitar -->
                          <div class="flex items-center gap-1.5 shrink-0">
                            <button 
                              data-toggle-stock-order="${order.id}"
                              data-item-index="${idx}"
                              class="btn-toggle-stock min-h-[34px] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border transition tap-feedback ${
                                item.sin_stock
                                  ? "bg-rose-600 text-white border-rose-600"
                                  : "bg-white text-slate-600 border-slate-300 hover:text-rose-600"
                              }"
                              title="Marcar sin disponibilidad en el cajÃ³n"
                            >
                              ${item.sin_stock ? "Anulado" : "Sin Stock"}
                            </button>

                            <button 
                              data-remove-item-order="${order.id}"
                              data-item-index="${idx}"
                              class="btn-remove-item min-h-[34px] px-2 py-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition tap-feedback"
                              title="Eliminar este Ã­tem del pedido"
                            >
                              X
                            </button>
                          </div>
                        </div>

                        ${
                          !item.sin_stock
                            ? `
                          <div class="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between gap-3">
                            <div class="flex items-center gap-2 flex-1">
                              <label class="text-xs font-bold text-slate-700 shrink-0">
                                ${isWeight ? "Peso Balanza:" : "Cantidad Real:"}
                              </label>
                              <div class="relative flex-1 max-w-[150px]">
                                <input 
                                  type="number" 
                                  inputmode="decimal"
                                  step="${isWeight ? "0.01" : "1"}"
                                  min="0"
                                  data-order-id="${order.id}"
                                  data-item-idx="${idx}"
                                  data-price-unit="${item.precio_unitario}"
                                  value="${currentVal}"
                                  placeholder="${item.cantidad_solicitada}"
                                  class="input-weight w-full text-center py-2 px-2 bg-white border-2 rounded-xl font-black text-base text-slate-900 outline-none focus:border-blue-600 transition ${
                                    item.peso_real !== null ? "border-emerald-500 text-emerald-800 bg-emerald-50/20" : "border-slate-300"
                                  }"
                                />
                                <span class="absolute right-2.5 top-2.5 text-xs font-bold text-slate-400 pointer-events-none select-none">
                                  ${isWeight ? "kg" : "u."}
                                </span>
                              </div>
                            </div>

                            <div class="text-right shrink-0">
                              <span class="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Subtotal</span>
                              <span id="item-subtotal-${order.id}-${idx}" class="font-black text-sm text-slate-900">$${subtotalItem.toLocaleString("es-AR")}</span>
                            </div>
                          </div>
                        `
                            : ""
                        }
                      </div>
                    `;
                          })
                          .join("")
                  }
                </div>

                <!-- MÃ³dulo para Agregar Producto al Pedido -->
                <div class="mt-3">
                  ${
                    isAddingProduct
                      ? `
                    <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-800 uppercase tracking-wide">Sumar producto al pedido</span>
                        <button id="btn-close-add-product" class="text-xs text-slate-400 hover:text-slate-700 font-bold">Cerrar</button>
                      </div>

                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label class="block text-[11px] font-bold text-slate-600 mb-1">Producto</label>
                          <select id="select-new-product" class="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-600">
                            ${activeProducts
                              .map(
                                (p) => `
                              <option value="${p.id}" data-unit="${p.unidad_medida}" data-price="${p.precio}">
                                ${p.nombre} ($${p.precio.toLocaleString("es-AR")}/${p.unidad_medida === "KG" ? "kg" : "u"})
                              </option>
                            `
                              )
                              .join("")}
                          </select>
                        </div>

                        <div>
                          <label class="block text-[11px] font-bold text-slate-600 mb-1">Cantidad / Peso inicial</label>
                          <div class="flex gap-2">
                            <input 
                              type="number" 
                              id="input-new-quantity" 
                              value="1.0" 
                              step="0.5" 
                              min="0.1" 
                              class="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-black text-center outline-none focus:border-blue-600"
                            />
                            <button 
                              data-confirm-add-order="${order.id}"
                              class="btn-confirm-add-item bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 rounded-xl text-xs transition tap-feedback shrink-0"
                            >
                              Agregar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  `
                      : `
                    <button 
                      data-toggle-add-order="${order.id}"
                      class="btn-open-add-product w-full py-2.5 px-3 border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 tap-feedback"
                    >
                      <span>+</span>
                      <span>Agregar producto que olvidÃ³ el cliente</span>
                    </button>
                  `
                  }
                </div>

                <!-- Cierre de Pesaje y Acciones Secundarias -->
                <div class="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <button 
                    data-finish-order-id="${order.id}"
                    class="btn-finish-weighing w-full min-h-[48px] bg-slate-950 hover:bg-slate-900 active:bg-black text-white font-black py-3 px-4 rounded-xl shadow-lg shadow-slate-950/15 text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition tap-feedback"
                  >
                    <span>Finalizar Pesaje y Notificar al Cliente</span>
                    <span class="text-xs">â€º</span>
                  </button>

                  <div class="grid grid-cols-2 gap-2">
                    <button 
                      data-edit-order-id="${order.id}"
                      class="btn-open-edit min-h-[38px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition tap-feedback"
                    >
                      <span>Cambiar entrega/datos</span>
                    </button>

                    <button 
                      data-delete-order-id="${order.id}"
                      class="btn-cancel-order min-h-[38px] bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition tap-feedback"
                    >
                      <span>Cancelar pedido</span>
                    </button>
                  </div>
                </div>
              </div>
            `;
            })
            .join("")}
        </div>
      `;
    }

    // 3. PestaÃ±a LISTOS
    if (activeTab === "LISTO") {
      return `
        <div class="space-y-4">
          ${tabOrders
            .map((order) => {
              const waSummary = generateWhatsAppSummary(order);
              const waMessage = encodeURIComponent(waSummary);
              const waLink = `https://wa.me/549${order.cliente.telefono}?text=${waMessage}`;

              return `
              <div class="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm">
                <div class="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Pesaje Completo
                    </span>
                    <h3 class="text-base font-black text-slate-900 mt-1">#${order.id} Â· ${order.cliente.nombre}</h3>
                    <p class="text-xs text-slate-500">${order.cliente.telefono} Â· ${order.tipo_entrega === "DELIVERY" ? "EnvÃ­o" : "Retiro"}</p>
                  </div>
                  <div class="text-right">
                    <span class="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Total Exacto</span>
                    <span class="font-black text-2xl text-emerald-700">$${(order.total_real || order.total_estimado).toLocaleString("es-AR")}</span>
                  </div>
                </div>

                <!-- Vista previa del mensaje de WhatsApp -->
                <div class="mt-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-700 font-mono whitespace-pre-line leading-relaxed">
                  ${waSummary}
                </div>

                <div class="grid grid-cols-2 gap-2 mt-4">
                  <a 
                    href="${waLink}" 
                    target="_blank"
                    class="min-h-[46px] bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition text-center tap-feedback"
                  >
                    <span>Enviar WhatsApp</span>
                    <span class="text-xs">â€º</span>
                  </a>
                  <button 
                    data-deliver-order-id="${order.id}"
                    class="btn-deliver-order min-h-[46px] bg-slate-950 hover:bg-slate-900 active:bg-black text-white font-bold py-3 px-3 rounded-xl text-xs transition tap-feedback"
                  >
                    Marcar Cobrado
                  </button>
                </div>

                <!-- OpciÃ³n de Cancelar / Eliminar Pedido Listo -->
                <div class="mt-2 text-right">
                  <button 
                    data-delete-order-id="${order.id}"
                    class="btn-cancel-order text-[11px] font-bold text-rose-600 hover:text-rose-800 p-1 transition"
                  >
                    Cancelar / Anular pedido
                  </button>
                </div>
              </div>
            `;
            })
            .join("")}
        </div>
      `;
    }

    // 4. PestaÃ±a ENTREGADOS / COBRADOS
    if (activeTab === "ENTREGADO") {
      return `
        <div class="space-y-2.5">
          ${tabOrders
            .map(
              (order) => `
            <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">#${order.id}</span>
                <h4 class="font-extrabold text-slate-900 text-sm">${order.cliente.nombre}</h4>
                <p class="text-xs text-slate-400">${order.tipo_entrega === "DELIVERY" ? "EnvÃ­o" : "Retiro"} Â· ${timeAgo(order.fecha)}</p>
              </div>
              <div class="text-right">
                <span class="font-black text-base text-slate-900">$${(order.total_real || order.total_estimado).toLocaleString("es-AR")}</span>
                <span class="block text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Cobrado</span>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      `;
    }
  }

  // --- Modal de EdiciÃ³n de Pedido ---
  function renderEditModal(order) {
    if (!order) return "";

    return `
      <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span class="text-[10px] font-black uppercase tracking-wider text-slate-400">Modificar</span>
              <h3 class="font-black text-base text-slate-900">Pedido #${order.id}</h3>
            </div>
            <button id="btn-close-edit-modal" class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-xs">
              X
            </button>
          </div>

          <form id="edit-order-form" class="space-y-3 text-left">
            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Nombre del cliente</label>
              <input 
                type="text" 
                id="edit-name" 
                value="${order.cliente.nombre}" 
                class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-slate-800"
                required
              />
            </div>

            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">TelÃ©fono / WhatsApp</label>
              <input 
                type="tel" 
                id="edit-phone" 
                value="${order.cliente.telefono}" 
                class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-slate-800"
                required
              />
            </div>

            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Forma de entrega</label>
              <div class="grid grid-cols-2 gap-2">
                <label class="flex items-center gap-2 p-2.5 border rounded-xl cursor-pointer has-[:checked]:border-slate-900 has-[:checked]:bg-slate-50">
                  <input type="radio" name="edit-delivery-mode" value="RETIRO" ${order.tipo_entrega === "RETIRO" ? "checked" : ""} />
                  <span class="text-xs font-bold text-slate-800">Retiro Local</span>
                </label>
                <label class="flex items-center gap-2 p-2.5 border rounded-xl cursor-pointer has-[:checked]:border-slate-900 has-[:checked]:bg-slate-50">
                  <input type="radio" name="edit-delivery-mode" value="DELIVERY" ${order.tipo_entrega === "DELIVERY" ? "checked" : ""} />
                  <span class="text-xs font-bold text-slate-800">EnvÃ­o Domicilio</span>
                </label>
              </div>
            </div>

            <div id="edit-address-container" class="${order.tipo_entrega === "DELIVERY" ? "" : "hidden"}">
              <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">DirecciÃ³n de entrega</label>
              <input 
                type="text" 
                id="edit-address" 
                value="${order.direccion_entrega || ""}" 
                placeholder="Calle, altura, depto..."
                class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-slate-800"
              />
            </div>

            <div class="pt-2 flex gap-2">
              <button 
                type="button" 
                id="btn-cancel-edit-modal"
                class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Volver
              </button>
              <button 
                type="submit" 
                class="flex-1 py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs transition shadow-md"
              >
                Guardar cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  // Generador de mensaje de WhatsApp
  function generateWhatsAppSummary(order) {
    const itemsLines = order.items
      .filter((i) => !i.sin_stock)
      .map((i) => `- ${i.nombre} (${i.peso_real} ${i.unidad_medida === "KG" ? "kg" : "u"}): $${i.subtotal.toLocaleString("es-AR")}`)
      .join("\n");

    const total = order.total_real || order.total_estimado;

    return `Hola ${order.cliente.nombre}. Tu pedido #${order.id} en Mi Huerta ya fue pesado y estÃ¡ listo:

${itemsLines}

Total exacto en balanza: $${total.toLocaleString("es-AR")}
${order.tipo_entrega === "DELIVERY" ? "El cadete estÃ¡ coordinado con tu direcciÃ³n de entrega." : "Ya podÃ©s pasar a retirarlo por el mostrador."}

Alias para transferir: mihuerta.verduras
(O podÃ©s abonar en efectivo al recibir).`;
  }

  // --- Attach Event Listeners ---
  function attachActions(orders) {
    // Tomar y pesar
    container.querySelectorAll(".btn-start-prep").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.startId);
        store.updateOrderStatus(id, "EN_PREPARACION");
        activeTab = "EN_PREPARACION";
        update();
      });
    });

    // Cancelar / Eliminar Pedido
    container.querySelectorAll(".btn-cancel-order").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.deleteOrderId);
        const order = orders.find((o) => o.id === id);
        const clientName = order ? order.cliente.nombre : "este cliente";
        const confirmCancel = confirm(`Â¿EstÃ¡s seguro de que querÃ©s cancelar y eliminar el pedido #${id} de ${clientName}?`);
        if (confirmCancel) {
          store.deleteOrder(id);
        }
      });
    });

    // Abrir Modal de EdiciÃ³n
    container.querySelectorAll(".btn-open-edit").forEach((btn) => {
      btn.addEventListener("click", () => {
        editingOrderId = Number(btn.dataset.editOrderId);
        update();
      });
    });

    // Desplegable para Agregar Producto
    container.querySelectorAll(".btn-open-add-product").forEach((btn) => {
      btn.addEventListener("click", () => {
        addingProductOrderId = Number(btn.dataset.toggleAddOrder);
        update();
      });
    });

    const btnCloseAddProduct = container.querySelector("#btn-close-add-product");
    if (btnCloseAddProduct) {
      btnCloseAddProduct.addEventListener("click", () => {
        addingProductOrderId = null;
        update();
      });
    }

    // Confirmar agregar nuevo Ã­tem a la orden
    const btnConfirmAddItem = container.querySelector(".btn-confirm-add-item");
    if (btnConfirmAddItem) {
      btnConfirmAddItem.addEventListener("click", () => {
        const orderId = Number(btnConfirmAddItem.dataset.confirmAddOrder);
        const select = container.querySelector("#select-new-product");
        const inputQty = container.querySelector("#input-new-quantity");
        if (select && inputQty) {
          const productId = select.value;
          const qty = Number(inputQty.value) || 1.0;
          store.addProductToOrder(orderId, productId, qty);
          addingProductOrderId = null;
        }
      });
    }

    // Quitar un Ã­tem especÃ­fico del pedido
    container.querySelectorAll(".btn-remove-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const orderId = Number(btn.dataset.removeItemOrder);
        const itemIdx = Number(btn.dataset.itemIndex);
        const confirmRemove = confirm("Â¿Eliminar este producto de la lista?");
        if (confirmRemove) {
          store.removeItemFromOrder(orderId, itemIdx);
        }
      });
    });

    // Modal de ediciÃ³n - Listeners
    if (editingOrderId) {
      const btnCloseEdit = container.querySelector("#btn-close-edit-modal");
      const btnCancelEdit = container.querySelector("#btn-cancel-edit-modal");
      const editForm = container.querySelector("#edit-order-form");
      const editRadios = container.querySelectorAll('input[name="edit-delivery-mode"]');
      const addressContainer = container.querySelector("#edit-address-container");

      const closeModal = () => {
        editingOrderId = null;
        update();
      };

      if (btnCloseEdit) btnCloseEdit.addEventListener("click", closeModal);
      if (btnCancelEdit) btnCancelEdit.addEventListener("click", closeModal);

      editRadios.forEach((radio) => {
        radio.addEventListener("change", (e) => {
          if (e.target.value === "DELIVERY") {
            addressContainer.classList.remove("hidden");
          } else {
            addressContainer.classList.add("hidden");
          }
        });
      });

      if (editForm) {
        editForm.addEventListener("submit", (e) => {
          e.preventDefault();
          const name = container.querySelector("#edit-name").value.trim();
          const phone = container.querySelector("#edit-phone").value.trim();
          const mode = container.querySelector('input[name="edit-delivery-mode"]:checked').value;
          const address = mode === "DELIVERY" ? container.querySelector("#edit-address").value.trim() : "Retiro por mostrador";

          store.updateOrderDetails(editingOrderId, {
            nombre: name,
            telefono: phone,
            tipo_entrega: mode,
            direccion_entrega: address
          });

          editingOrderId = null;
        });
      }
    }

    // Inputs de pesaje
    container.querySelectorAll(".input-weight").forEach((input) => {
      input.addEventListener("input", (e) => {
        const orderId = Number(e.target.dataset.orderId);
        const itemIdx = Number(e.target.dataset.itemIdx);
        const priceUnit = Number(e.target.dataset.priceUnit) || 0;
        const val = e.target.value.trim();

        const numVal = val !== "" ? Math.max(0, Number(val)) : 0;
        const subtotal = Math.round(numVal * priceUnit);

        const subtotalEl = container.querySelector(`#item-subtotal-${orderId}-${itemIdx}`);
        if (subtotalEl) {
          subtotalEl.textContent = `$${subtotal.toLocaleString("es-AR")}`;
        }

        const orderInputs = container.querySelectorAll(`.input-weight[data-order-id="${orderId}"]`);
        let runningTotal = 0;
        orderInputs.forEach((inp) => {
          const p = Number(inp.dataset.priceUnit) || 0;
          const v = inp.value.trim() !== "" ? Number(inp.value) : Number(inp.placeholder || 0);
          runningTotal += Math.round(v * p);
        });

        const totalEl = container.querySelector(`#order-balanza-total-${orderId}`);
        if (totalEl) {
          totalEl.textContent = `$${Math.round(runningTotal).toLocaleString("es-AR")}`;
        }
      });

      input.addEventListener("change", (e) => {
        const orderId = Number(e.target.dataset.orderId);
        const itemIdx = Number(e.target.dataset.itemIdx);
        const val = e.target.value.trim();
        if (val !== "") {
          store.updateItemWeight(orderId, itemIdx, Number(val));
        }
      });
    });

    container.querySelectorAll(".btn-toggle-stock").forEach((btn) => {
      btn.addEventListener("click", () => {
        const orderId = Number(btn.dataset.toggleStockOrder);
        const itemIdx = Number(btn.dataset.itemIndex);
        store.toggleItemOutOfStock(orderId, itemIdx);
      });
    });

    container.querySelectorAll(".btn-finish-weighing").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.finishOrderId);

        const currentInputs = container.querySelectorAll(`.input-weight[data-order-id="${id}"]`);
        currentInputs.forEach((input) => {
          const itemIdx = Number(input.dataset.itemIdx);
          const val = input.value.trim();
          if (val !== "") {
            store.updateItemWeight(id, itemIdx, Number(val));
          }
        });

        store.finalizeOrderWeighing(id);
        activeTab = "LISTO";
        update();
      });
    });

    container.querySelectorAll(".btn-deliver-order").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.deliverOrderId);
        store.updateOrderStatus(id, "ENTREGADO");
        update();
      });
    });
  }

  function timeAgo(dateString) {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
    if (diff < 1) return "Hace instantes";
    if (diff === 1) return "Hace 1 min";
    if (diff < 60) return `Hace ${diff} min`;
    return `Hace ${Math.floor(diff / 60)} hs`;
  }

  const unsubscribe = store.subscribe((event) => {
    if (event === "orders_changed" || event === "order_created" || event === "storage_sync") {
      update();
    }
  });

  update();
  return () => unsubscribe();
}


  // ==========================================

  // 5. VISTA ADMIN / DUENO

  // ==========================================




function renderAdminView(container) {
  let selectedCategory = "Todos";

  function update() {
    container.innerHTML = "";
    const products = store.getProducts();

    const filtered = products.filter(
      (p) => selectedCategory === "Todos" || p.categoria === selectedCategory
    );

    container.innerHTML = `
      <div class="max-w-xl mx-auto p-4 pb-32">
        <!-- Header DueÃ±o / Admin -->
        <div class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm mb-4">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-0.5">
                Panel de AdministraciÃ³n
              </span>
              <h1 class="font-black text-slate-900 text-lg tracking-tight">Precios y Disponibilidad</h1>
              <p class="text-xs text-slate-500 mt-0.5">AjustÃ¡ los valores del dÃ­a en tiempo real.</p>
            </div>
            <span class="text-xs font-black px-3 py-1 bg-slate-100 text-slate-800 rounded-full border border-slate-200">
              ${products.length} productos
            </span>
          </div>

          <!-- Filtro de CategorÃ­as TÃ¡ctil -->
          <div class="mt-4 flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            ${CATEGORIAS.map(
              (cat) => `
              <button 
                data-admin-cat="${cat}"
                class="admin-cat-pill whitespace-nowrap min-h-[38px] px-4 py-1.5 rounded-full text-xs font-bold transition tap-feedback ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }"
              >
                ${cat}
              </button>
            `
            ).join("")}
          </div>
        </div>

        <!-- Lista de Productos y Precios con Inputs de 16px (evita auto-zoom iOS) -->
        <div class="space-y-2.5">
          ${filtered
            .map((p) => {
              const unit = p.unidad_medida === "KG" ? "kg" : "unidad";

              return `
              <div class="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex items-center justify-between gap-3 transition">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1.5 mb-0.5">
                    <span class="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      ${p.categoria}
                    </span>
                    <span class="text-[10px] text-slate-300">Â·</span>
                    <span class="text-[10px] text-slate-400 font-medium">Por ${unit}</span>
                  </div>
                  <h3 class="font-extrabold text-slate-900 text-sm truncate mt-0.5">${p.nombre}</h3>
                  <p class="text-[11px] text-slate-400 truncate">${p.detalle || ""}</p>
                </div>

                <!-- Campo de Precio Editable y Switch de Stock -->
                <div class="flex items-center gap-2 shrink-0">
                  <div class="relative w-28">
                    <span class="absolute left-3 top-2.5 text-sm font-bold text-slate-400 select-none">$</span>
                    <input 
                      type="number" 
                      inputmode="numeric"
                      step="50"
                      min="0"
                      data-product-id="${p.id}"
                      value="${p.precio}"
                      class="input-price w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-black text-base text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition"
                    />
                  </div>

                  <!-- BotÃ³n Switch Disponible / Pausado (44px min) -->
                  <button 
                    data-toggle-stock="${p.id}"
                    class="btn-stock-toggle min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition tap-feedback ${
                      p.disponible
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100"
                        : "bg-slate-100 text-slate-500 border border-slate-300 hover:bg-slate-200"
                    }"
                  >
                    ${p.disponible ? "Activo" : "Pausado"}
                  </button>
                </div>
              </div>
            `;
            })
            .join("")}
        </div>
      </div>
    `;

    // Listeners
    container.querySelectorAll(".admin-cat-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedCategory = btn.dataset.adminCat;
        update();
      });
    });

    container.querySelectorAll(".input-price").forEach((input) => {
      input.addEventListener("change", (e) => {
        const id = e.target.dataset.productId;
        const val = Number(e.target.value);
        store.updateProductPrice(id, val);
      });
    });

    container.querySelectorAll(".btn-stock-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.toggleStock;
        store.toggleProductStock(id);
      });
    });
  }

  const unsubscribe = store.subscribe((event) => {
    if (event === "products_changed" || event === "storage_sync") {
      update();
    }
  });

  update();
  return () => unsubscribe();
}


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

  // Auto-inicializar cuando el documento estÃ© listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => new App());
  } else {
    new App();
  }

})();
