import { INITIAL_PRODUCTS } from "./products-data.js";

// Claves de almacenamiento local (versión 3 sin emojis)
const STORAGE_KEYS = {
  PRODUCTS: "mihuerta_products_v3",
  ORDERS: "mihuerta_orders_v3",
  CUSTOMERS: "mihuerta_customers_v3",
  CURRENT_USER: "mihuerta_current_user_v3",
  CART: "mihuerta_cart_v3",
  ACTIVE_ORDER: "mihuerta_active_order_v3",
  CLOUD_CONFIG: "mihuerta_cloud_config_v3",
  PIN_UNLOCKED: "mihuerta_pin_unlocked_v3",
  THEME: "mihuerta_theme_v3"
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
    if (typeof window !== "undefined") {
      window.addEventListener("storage", (e) => {
        if (e.key === STORAGE_KEYS.THEME) {
          this.applyTheme(this.getTheme());
          this.notify("theme_changed");
        } else if (Object.values(STORAGE_KEYS).includes(e.key)) {
          this.notify("storage_sync");
        }
      });

      // Escuchar cambios en la preferencia del sistema operativo
      if (window.matchMedia) {
        try {
          window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
            const saved = safeGet(STORAGE_KEYS.THEME, null);
            if (!saved) {
              this.applyTheme(e.matches ? "dark" : "light");
              this.notify("theme_changed");
            }
          });
        } catch {}
      }
    }
  }

  init() {
    // 0. Aplicar tema visual (Claro / Oscuro)
    this.applyTheme(this.getTheme());

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

    // 4. Configuración inicial de PIN y Cloud (conectado por defecto al proyecto Supabase del local)
    if (!safeGet(STORAGE_KEYS.CLOUD_CONFIG, null)) {
      safeSet(STORAGE_KEYS.CLOUD_CONFIG, {
        supabaseUrl: "https://afrvwqghnvblgjbdndnt.supabase.co",
        supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmcnZ3cWdobnZibGdqYmRuZG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyMjQ0OTYsImV4cCI6MjEwODgwMDQ5Nn0.mhw70b-K3G-bhUEBTdXS-GMoylYnvBtWkJzeEmOrRzM",
        staffPin: "1234"
      });
    }

    // 5. Detectar parámetro ?tel= en el link enviado por el Bot de WhatsApp
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlPhone = urlParams.get("tel");
      if (urlPhone) {
        const cleanPhone = String(urlPhone).replace(/\D/g, "");
        const existingCustomer = this.getCustomer(cleanPhone);
        if (existingCustomer) {
          this.setCurrentUser(existingCustomer);
        } else if (cleanPhone.length >= 8) {
          this.prefilledPhone = cleanPhone;
        }
      }
    } catch {}

    // 6. Inicializar conexión con Supabase Cloud si está configurada
    this.supabase = null;
    this.realtimeChannel = null;
    this.initSupabaseConnection();
  }

  // --- Configuración Cloud (Supabase) y PIN de Seguridad ---
  getCloudConfig() {
    const DEFAULT_CONFIG = {
      supabaseUrl: "https://afrvwqghnvblgjbdndnt.supabase.co",
      supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmcnZ3cWdobnZibGdqYmRuZG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyMjQ0OTYsImV4cCI6MjEwODgwMDQ5Nn0.mhw70b-K3G-bhUEBTdXS-GMoylYnvBtWkJzeEmOrRzM",
      staffPin: "1234"
    };
    const stored = safeGet(STORAGE_KEYS.CLOUD_CONFIG, DEFAULT_CONFIG);
    return {
      supabaseUrl: stored.supabaseUrl || DEFAULT_CONFIG.supabaseUrl,
      supabaseAnonKey: stored.supabaseAnonKey || DEFAULT_CONFIG.supabaseAnonKey,
      staffPin: stored.staffPin || "1234"
    };
  }

  saveCloudConfig(newConfig) {
    const current = this.getCloudConfig();
    const updated = {
      supabaseUrl: (newConfig.supabaseUrl ?? current.supabaseUrl).trim(),
      supabaseAnonKey: (newConfig.supabaseAnonKey ?? current.supabaseAnonKey).trim(),
      staffPin: (newConfig.staffPin ?? current.staffPin).trim() || "1234"
    };
    safeSet(STORAGE_KEYS.CLOUD_CONFIG, updated);
    this.initSupabaseConnection();
    this.notify("cloud_config_changed", updated);
    return updated;
  }

  isCloudConnected() {
    return Boolean(this.supabase);
  }

  verifyStaffPin(inputPin) {
    const { staffPin } = this.getCloudConfig();
    const ok = String(inputPin).trim() === String(staffPin || "1234").trim();
    if (ok) {
      safeSet(STORAGE_KEYS.PIN_UNLOCKED, true);
    }
    return ok;
  }

  isStaffUnlocked() {
    return Boolean(safeGet(STORAGE_KEYS.PIN_UNLOCKED, false));
  }

  lockStaff() {
    safeRemove(STORAGE_KEYS.PIN_UNLOCKED);
    this.notify("staff_locked");
  }

  async initSupabaseConnection() {
    const { supabaseUrl, supabaseAnonKey } = this.getCloudConfig();
    if (typeof window === "undefined" || !supabaseUrl || !supabaseAnonKey || !window.supabase) {
      this.supabase = null;
      return;
    }

    try {
      this.supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
      await this.pullFromSupabase();
      this.subscribeToSupabaseRealtime();
      this.notify("cloud_connected");
    } catch (err) {
      console.warn("No se pudo conectar a Supabase:", err);
      this.supabase = null;
    }
  }

  async pullFromSupabase() {
    if (!this.supabase) return;
    try {
      const currentUser = this.getCurrentUser();
      const clientQuery = currentUser?.telefono
        ? this.supabase.from("clientes").select("*").eq("telefono", String(currentUser.telefono).replace(/\D/g, ""))
        : null;

      const [prodRes, cliRes, ordRes] = await Promise.all([
        this.supabase.from("productos").select("*").order("id"),
        clientQuery ? clientQuery : Promise.resolve({ data: [] }),
        this.supabase.from("pedidos").select("*").order("id", { ascending: false }).limit(50)
      ]);

      if (prodRes.data && prodRes.data.length > 0) {
        const mappedProducts = prodRes.data.map((p) => ({
          ...p,
          precio: Number(p.precio),
          paso: Number(p.paso || 0.5)
        }));
        safeSet(STORAGE_KEYS.PRODUCTS, mappedProducts);
      }

      if (cliRes && cliRes.data && cliRes.data.length > 0) {
        const customerMap = safeGet(STORAGE_KEYS.CUSTOMERS, {}) || {};
        cliRes.data.forEach((c) => {
          customerMap[c.telefono] = {
            telefono: c.telefono,
            nombre: c.nombre,
            direccion: c.direccion || ""
          };
        });
        safeSet(STORAGE_KEYS.CUSTOMERS, customerMap);
      }

      if (ordRes.data) {
        const mappedOrders = ordRes.data.map((o) => ({
          id: o.id,
          cliente: {
            nombre: o.cliente_nombre,
            telefono: o.cliente_telefono,
            direccion: o.direccion_entrega
          },
          tipo_entrega: o.tipo_entrega,
          direccion_entrega: o.direccion_entrega,
          estado: o.estado,
          fecha: o.fecha || o.created_at || new Date().toISOString(),
          total_estimado: Number(o.total_estimado),
          total_real: o.total_real !== null ? Number(o.total_real) : null,
          items: Array.isArray(o.items) ? o.items : []
        }));
        safeSet(STORAGE_KEYS.ORDERS, mappedOrders);
      }

      this.notify("storage_sync");
    } catch (err) {
      console.warn("Error sincronizando datos desde Supabase:", err);
    }
  }

  subscribeToSupabaseRealtime() {
    if (!this.supabase) return;
    if (this.realtimeChannel) {
      this.supabase.removeChannel(this.realtimeChannel);
    }

    this.realtimeChannel = this.supabase
      .channel("mihuerta-pwa-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "pedidos" }, (payload) => {
        if (payload.eventType === "INSERT") {
          this.playAudioAlert();
        }
        this.pullFromSupabase();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "productos" }, () => {
        this.pullFromSupabase();
      })
      .subscribe();
  }

  async syncOrderToSupabase(order) {
    if (!this.supabase || !order) return;
    try {
      // Garantizar que el cliente exista en Supabase antes de insertar el pedido para satisfacer la Foreign Key
      if (order.cliente && order.cliente.telefono) {
        const cleanPhone = String(order.cliente.telefono).replace(/\D/g, "");
        await this.supabase.from("clientes").upsert({
          telefono: cleanPhone,
          nombre: order.cliente.nombre || "Cliente",
          direccion: order.cliente.direccion || "",
          updated_at: new Date().toISOString()
        });
      }

      await this.supabase.from("pedidos").upsert({
        id: order.id,
        cliente_telefono: order.cliente.telefono,
        cliente_nombre: order.cliente.nombre,
        tipo_entrega: order.tipo_entrega,
        direccion_entrega: order.direccion_entrega,
        estado: order.estado,
        total_estimado: order.total_estimado,
        total_real: order.total_real,
        items: order.items
      });
    } catch (err) {
      console.warn("Error guardando pedido en Supabase:", err);
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
    const cleanPrice = Math.max(0, Number(newPrice));
    const products = this.getProducts().map((p) => {
      if (p.id === productId) {
        return { ...p, precio: cleanPrice };
      }
      return p;
    });
    safeSet(STORAGE_KEYS.PRODUCTS, products);
    if (this.supabase) {
      this.supabase.from("productos").update({ precio: cleanPrice, updated_at: new Date().toISOString() }).eq("id", productId).then(() => {});
    }
    this.notify("products_changed");
  }

  toggleProductStock(productId) {
    let newStatus = true;
    const products = this.getProducts().map((p) => {
      if (p.id === productId) {
        newStatus = !p.disponible;
        return { ...p, disponible: newStatus };
      }
      return p;
    });
    safeSet(STORAGE_KEYS.PRODUCTS, products);
    if (this.supabase) {
      this.supabase.from("productos").update({ disponible: newStatus, updated_at: new Date().toISOString() }).eq("id", productId).then(() => {});
    }
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
    if (this.supabase) {
      this.supabase.from("clientes").upsert({
        telefono: cleanPhone,
        nombre: customer.nombre || "Cliente",
        direccion: customer.direccion || "",
        updated_at: new Date().toISOString()
      }).then(() => {});
    }
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
    if (!product) return;
    if (quantityDelta > 0 && !product.disponible) return;

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

  setCartQuantity(productId, targetQty) {
    const cleanQty = Math.max(0, Number(targetQty.toFixed(2)));
    if (cleanQty <= 0) {
      this.removeFromCart(productId);
      return;
    }
    const cart = this.getCart();
    const product = this.getProducts().find((p) => p.id === productId);
    if (!product || !product.disponible) return;

    cart[productId] = {
      producto_id: productId,
      nombre: product.nombre,
      categoria: product.categoria,
      unidad_medida: product.unidad_medida,
      precio_unitario: product.precio,
      cantidad: cleanQty,
      subtotal_estimado: Math.round(cleanQty * product.precio)
    };

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

  isSameCustomer(phoneA, phoneB) {
    if (!phoneA || !phoneB) return false;
    const a = String(phoneA).replace(/\D/g, "");
    const b = String(phoneB).replace(/\D/g, "");
    if (a === b) return true;
    // Manejo de prefijos internacionales y locales (ej: 54911 vs 11)
    if (a.length >= 8 && b.length >= 8) {
      return a.slice(-8) === b.slice(-8);
    }
    return false;
  }

  getActiveOrder(userPhone = null) {
    const orders = this.getOrders();
    const targetPhone = userPhone || this.getCurrentUser()?.telefono;
    if (!targetPhone) return null;

    const activeId = this.getActiveOrderId();
    if (activeId) {
      const active = orders.find((o) => o.id === activeId);
      if (active && this.isSameCustomer(active.cliente?.telefono, targetPhone)) {
        if (active.estado !== "ENTREGADO" && active.estado !== "CANCELADO") {
          return active;
        }
      }
    }

    // Si el ID guardado no pertenece a este cliente o ya fue entregado, buscar su pedido activo más reciente
    const latestUserOrder = orders.find((o) => {
      const isOwner = this.isSameCustomer(o.cliente?.telefono, targetPhone);
      const isOngoing = o.estado !== "ENTREGADO" && o.estado !== "CANCELADO";
      return isOwner && isOngoing;
    });

    if (latestUserOrder) {
      this.setActiveOrderId(latestUserOrder.id);
      return latestUserOrder;
    }

    return null;
  }

  getOrdersByCustomer(phone) {
    if (!phone) return [];
    return this.getOrders().filter((o) => this.isSameCustomer(o.cliente?.telefono, phone));
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
    this.syncOrderToSupabase(newOrder);
    this.setActiveOrderId(newOrder.id);
    this.clearCart();
    this.playAudioAlert();
    this.notify("order_created", newOrder);
    return newOrder;
  }

  updateOrderStatus(orderId, newStatus) {
    let targetOrder = null;
    const orders = this.getOrders().map((order) => {
      if (order.id === orderId) {
        targetOrder = { ...order, estado: newStatus, updated_at: new Date().toISOString() };
        return targetOrder;
      }
      return order;
    });
    safeSet(STORAGE_KEYS.ORDERS, orders);
    if (targetOrder) this.syncOrderToSupabase(targetOrder);
    this.notify("orders_changed");
  }

  updateItemWeight(orderId, itemIndex, pesoReal, { notify = true } = {}) {
    let targetOrder = null;
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

        targetOrder = { ...order, items, total_real: totalReal };
        return targetOrder;
      }
      return order;
    });
    safeSet(STORAGE_KEYS.ORDERS, orders);
    if (targetOrder) this.syncOrderToSupabase(targetOrder);
    if (notify) {
      this.notify("orders_changed");
    }
  }

  toggleItemOutOfStock(orderId, itemIndex) {
    let targetOrder = null;
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

        targetOrder = { ...order, items, total_real: totalReal };
        return targetOrder;
      }
      return order;
    });
    safeSet(STORAGE_KEYS.ORDERS, orders);
    if (targetOrder) this.syncOrderToSupabase(targetOrder);
    this.notify("orders_changed");
  }

  finalizeOrderWeighing(orderId, weightsMap = null) {
    let targetOrder = null;
    const orders = this.getOrders().map((order) => {
      if (order.id === orderId) {
        const items = order.items.map((i, idx) => {
          if (i.sin_stock) return i;
          let pesoFinal;
          if (weightsMap && weightsMap[idx] !== undefined && weightsMap[idx] !== null && String(weightsMap[idx]).trim() !== "") {
            pesoFinal = Math.max(0, Number(weightsMap[idx]));
          } else {
            pesoFinal = i.peso_real !== null ? i.peso_real : i.cantidad_solicitada;
          }
          return {
            ...i,
            peso_real: pesoFinal,
            subtotal: Math.round(pesoFinal * i.precio_unitario)
          };
        });

        const totalFinal = items
          .filter((i) => !i.sin_stock)
          .reduce((sum, i) => sum + i.subtotal, 0);

        targetOrder = {
          ...order,
          items,
          total_real: totalFinal,
          estado: "LISTO",
          finalizado_at: new Date().toISOString()
        };
        return targetOrder;
      }
      return order;
    });

    safeSet(STORAGE_KEYS.ORDERS, orders);
    if (targetOrder) this.syncOrderToSupabase(targetOrder);
    this.notify("orders_changed");
    this.notify("order_ready", orderId);
  }

  // Eliminar o cancelar completamente un pedido
  deleteOrder(orderId) {
    const orders = this.getOrders().filter((o) => o.id !== orderId);
    safeSet(STORAGE_KEYS.ORDERS, orders);
    if (this.supabase) {
      this.supabase.from("pedidos").delete().eq("id", orderId).then(() => {});
    }
    if (this.getActiveOrderId() === orderId) {
      this.setActiveOrderId(null);
    }
    this.notify("orders_changed");
  }

  // Cancelar un pedido de forma lógica (soft cancellation)
  cancelOrder(orderId) {
    let targetOrder = null;
    const orders = this.getOrders().map((order) => {
      if (order.id === orderId) {
        targetOrder = {
          ...order,
          estado: "CANCELADO",
          cancelado_at: new Date().toISOString()
        };
        return targetOrder;
      }
      return order;
    });
    safeSet(STORAGE_KEYS.ORDERS, orders);
    if (targetOrder) this.syncOrderToSupabase(targetOrder);
    if (this.getActiveOrderId() === orderId) {
      this.setActiveOrderId(null);
    }
    this.notify("orders_changed");
  }

  // Quitar un producto específico del pedido
  removeItemFromOrder(orderId, itemIndex) {
    let targetOrder = null;
    const orders = this.getOrders().map((order) => {
      if (order.id === orderId) {
        const items = order.items.filter((_, idx) => idx !== itemIndex);
        const totalEstimado = items.reduce((sum, i) => sum + (i.subtotal || Math.round(i.cantidad_solicitada * i.precio_unitario)), 0);

        // Recalcular total_real si habia pesaje en curso o total_real existente
        const hasWeighedItems = items.some((i) => i.peso_real !== null);
        const totalReal = hasWeighedItems
          ? items.filter((i) => !i.sin_stock && i.peso_real !== null).reduce((sum, i) => sum + (i.subtotal || 0), 0)
          : null;

        targetOrder = { ...order, items, total_estimado: totalEstimado, total_real: totalReal };
        return targetOrder;
      }
      return order;
    });
    safeSet(STORAGE_KEYS.ORDERS, orders);
    if (targetOrder) this.syncOrderToSupabase(targetOrder);
    this.notify("orders_changed");
  }

  // Agregar un producto al pedido en preparación
  addProductToOrder(orderId, productId, cantidad) {
    const product = this.getProducts().find((p) => p.id === productId);
    if (!product) return;
    const qty = Math.max(0.1, Number(cantidad));
    const subtotal = Math.round(qty * product.precio);

    let targetOrder = null;
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

        // Si el pedido ya estaba en preparación o tenía pesaje, recalcular total_real
        const allWeighed = items.every((i) => i.sin_stock || i.peso_real !== null);
        let totalReal = order.total_real;
        if (allWeighed) {
          totalReal = items.filter((i) => !i.sin_stock).reduce((sum, i) => sum + (i.subtotal || 0), 0);
        } else if (order.total_real !== null) {
          const hasWeighedItems = items.some((i) => i.peso_real !== null);
          totalReal = hasWeighedItems
            ? items.filter((i) => !i.sin_stock && i.peso_real !== null).reduce((sum, i) => sum + (i.subtotal || 0), 0)
            : null;
        }

        targetOrder = { ...order, items, total_estimado: totalEstimado, total_real: totalReal };
        return targetOrder;
      }
      return order;
    });
    safeSet(STORAGE_KEYS.ORDERS, orders);
    if (targetOrder) this.syncOrderToSupabase(targetOrder);
    this.notify("orders_changed");
  }

  // Modificar datos de entrega y contacto del pedido
  updateOrderDetails(orderId, details) {
    let targetOrder = null;
    const orders = this.getOrders().map((order) => {
      if (order.id === orderId) {
        targetOrder = {
          ...order,
          cliente: {
            ...order.cliente,
            nombre: details.nombre !== undefined ? details.nombre : order.cliente.nombre,
            telefono: details.telefono !== undefined ? details.telefono : order.cliente.telefono
          },
          tipo_entrega: details.tipo_entrega || order.tipo_entrega,
          direccion_entrega: details.direccion_entrega || order.direccion_entrega
        };
        return targetOrder;
      }
      return order;
    });
    safeSet(STORAGE_KEYS.ORDERS, orders);
    if (targetOrder) this.syncOrderToSupabase(targetOrder);
    this.notify("orders_changed");
  }

  // ========================================================
  // GESTION DE MODO OSCURO / CLARO
  // ========================================================
  getTheme() {
    const saved = safeGet(STORAGE_KEYS.THEME, null);
    if (saved === "dark" || saved === "light") {
      return saved;
    }
    if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return "light";
  }

  setTheme(theme) {
    const validTheme = theme === "dark" ? "dark" : "light";
    safeSet(STORAGE_KEYS.THEME, validTheme);
    this.applyTheme(validTheme);
    this.notify("theme_changed");
    return validTheme;
  }

  toggleTheme() {
    const current = this.getTheme();
    const next = current === "dark" ? "light" : "dark";
    return this.setTheme(next);
  }

  applyTheme(theme) {
    if (typeof document === "undefined") return;
    const isDark = theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    if (document.body) {
      document.body.classList.toggle("dark", isDark);
    }
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", isDark ? "#020617" : "#f8fafc");
    }
    const labels = document.querySelectorAll(".theme-label");
    labels.forEach((el) => {
      el.textContent = isDark ? "Oscuro" : "Claro";
    });
    const btns = document.querySelectorAll(".theme-toggle-btn");
    btns.forEach((btn) => {
      btn.setAttribute("aria-label", isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro");
      btn.setAttribute("title", isDark ? "Cambiar a tema claro (atajo: T)" : "Cambiar a tema oscuro (atajo: T)");
    });
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
