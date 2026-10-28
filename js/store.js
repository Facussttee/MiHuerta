import { INITIAL_PRODUCTS } from "./products-data.js";

// Claves de almacenamiento local (versión 3 sin emojis)
const STORAGE_KEYS = {
  PRODUCTS: "mihuerta_products_v3",
  ORDERS: "mihuerta_orders_v3",
  CUSTOMERS: "mihuerta_customers_v3",
  CURRENT_USER: "mihuerta_current_user_v3",
  CART: "mihuerta_cart_v3"
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

    // Sincronización en tiempo real entre pestañas
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
          nombre: "Facundo Gómez",
          direccion: "Av. Rivadavia 4520, Piso 3 B"
        },
        "1198765432": {
          telefono: "1198765432",
          nombre: "María Elena",
          direccion: "San Martín 1230"
        }
      };
      safeSet(STORAGE_KEYS.CUSTOMERS, defaultCustomers);
    }

    // 3. Pedidos iniciales de demostración
    if (!safeGet(STORAGE_KEYS.ORDERS, null)) {
      const sampleOrders = [
        {
          id: 101,
          cliente: {
            nombre: "Facundo Gómez",
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
            nombre: "María Elena",
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

export const store = new Store();
export { STORAGE_KEYS, safeGet, safeSet, safeRemove };
