import { INITIAL_PRODUCTS } from "./products-data.js";

// Claves de almacenamiento local
const STORAGE_KEYS = {
  PRODUCTS: "mihuerta_products_v1",
  ORDERS: "mihuerta_orders_v1",
  CUSTOMERS: "mihuerta_customers_v1",
  CURRENT_USER: "mihuerta_current_user_v1",
  CART: "mihuerta_cart_v1"
};

class Store {
  constructor() {
    this.listeners = new Set();
    this.init();

    // Sincronización en tiempo real entre distintas pestañas del navegador
    window.addEventListener("storage", (e) => {
      if (Object.values(STORAGE_KEYS).includes(e.key)) {
        this.notify("storage_sync");
      }
    });
  }

  init() {
    // 1. Cargar o inicializar productos
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    }

    // 2. Clientes registrados
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
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
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(defaultCustomers));
    }

    // 3. Pedidos iniciales de demostración para ver el tablero en acción
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
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
          estado: "PENDIENTE", // PENDIENTE | EN_PREPARACION | LISTO | ENTREGADO
          fecha: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // hace 15 min
          total_estimado: 6400,
          total_real: null,
          items: [
            {
              producto_id: "prod-9",
              nombre: "Tomate Redondo Premium",
              icono: "🍅",
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
              icono: "🍌",
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
              icono: "🍎",
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
              icono: "🥬",
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
              icono: "🥔",
              unidad_medida: "KG",
              precio_unitario: 950,
              cantidad_solicitada: 2.0,
              peso_real: 2.150, // Ya pesó la papa
              subtotal: 2042.5,
              sin_stock: false
            },
            {
              producto_id: "prod-10",
              nombre: "Zanahoria Fresca",
              icono: "🥕",
              unidad_medida: "KG",
              precio_unitario: 1300,
              cantidad_solicitada: 1.0,
              peso_real: null, // Aún falta pesar
              subtotal: 1300,
              sin_stock: false
            },
            {
              producto_id: "prod-3",
              nombre: "Naranja de Jugo",
              icono: "🍊",
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
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(sampleOrders));
    }
  }

  // --- Suscripciones / Reactividad ---
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(event, data) {
    this.listeners.forEach((cb) => cb(event, data));
  }

  // --- Productos ---
  getProducts() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || "[]");
  }

  updateProductPrice(productId, newPrice) {
    const products = this.getProducts().map((p) => {
      if (p.id === productId) {
        return { ...p, precio: Math.max(0, Number(newPrice)) };
      }
      return p;
    });
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.notify("products_changed");
  }

  toggleProductStock(productId) {
    const products = this.getProducts().map((p) => {
      if (p.id === productId) {
        return { ...p, disponible: !p.disponible };
      }
      return p;
    });
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.notify("products_changed");
  }

  // --- Clientes ---
  getCustomers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || "{}");
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
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    this.setCurrentUser(customers[cleanPhone]);
    this.notify("customers_changed");
    return customers[cleanPhone];
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || "null");
  }

  setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    this.notify("user_changed", user);
  }

  logoutUser() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    this.clearCart();
    this.notify("user_changed", null);
  }

  // --- Carrito de Compras del Cliente ---
  getCart() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || "{}");
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
        icono: product.icono,
        unidad_medida: product.unidad_medida,
        precio_unitario: product.precio,
        cantidad: newQty,
        subtotal_estimado: Math.round(newQty * product.precio)
      };
    }

    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    this.notify("cart_changed");
  }

  clearCart() {
    localStorage.removeItem(STORAGE_KEYS.CART);
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
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || "[]");
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
        icono: item.icono,
        unidad_medida: item.unidad_medida,
        precio_unitario: item.precio_unitario,
        cantidad_solicitada: item.cantidad,
        peso_real: item.unidad_medida === "UNIDAD" ? item.cantidad : null,
        subtotal: item.subtotal_estimado,
        sin_stock: false
      }))
    };

    orders.unshift(newOrder); // al principio de la lista
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.clearCart();
    this.playAudioAlert(); // Alerta sonora de nuevo pedido
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
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.notify("orders_changed");
  }

  // Operario actualiza el peso real de un ítem
  updateItemWeight(orderId, itemIndex, pesoReal) {
    const orders = this.getOrders().map((order) => {
      if (order.id === orderId) {
        const items = [...order.items];
        const item = { ...items[itemIndex] };
        
        const peso = Math.max(0, Number(pesoReal));
        item.peso_real = peso;
        item.subtotal = Math.round(peso * item.precio_unitario);
        items[itemIndex] = item;

        // Recalcular total real si todos los no anulados tienen peso
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
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.notify("orders_changed");
  }

  // Operario marca un ítem como sin stock
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

        // Recalcular total real
        const totalReal = items
          .filter((i) => !i.sin_stock && i.peso_real !== null)
          .reduce((sum, i) => sum + (i.subtotal || 0), 0);

        return { ...order, items, total_real: totalReal };
      }
      return order;
    });
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.notify("orders_changed");
  }

  // Finalizar pesaje y pasar a LISTO
  finalizeOrderWeighing(orderId) {
    const orders = this.getOrders().map((order) => {
      if (order.id === orderId) {
        // Asegurar que cada ítem que no fue pesado tome el valor solicitado si es unidad
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

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.notify("orders_changed");
    this.notify("order_ready", orderId);
  }

  // Alerta sonora sutil con Web Audio API (cero dependencias de archivos mp3 externos)
  playAudioAlert() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // AudioContext bloqueado si el usuario no interactuó aún
    }
  }
}

export const store = new Store();
