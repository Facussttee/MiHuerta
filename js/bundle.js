(function () {
  "use strict";

  // ==========================================
  // 1. CATÁLOGO INICIAL (Sin emojis, enfocado en tipografía moderna)
  // ==========================================
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
      detalle: "Alto Valle, Río Negro"
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
      nombre: "Limón Comercial",
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
      nombre: "Cebolla Selección",
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
      detalle: "Atado fresco del día"
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

    // Almacén / Granja
    {
      id: "prod-16",
      nombre: "Huevos de Campo (Maple x 30)",
      categoria: "Almacén",
      unidad_medida: "UNIDAD",
      precio: 5200,
      disponible: true,
      paso: 1,
      detalle: "Castaños de gallinas libres"
    },
    {
      id: "prod-17",
      nombre: "Huevos de Campo (Docena)",
      categoria: "Almacén",
      unidad_medida: "UNIDAD",
      precio: 2300,
      disponible: true,
      paso: 1,
      detalle: "Caja seleccionada x 12 u."
    }
  ];

  const CATEGORIAS = ["Todos", "Frutas", "Verduras", "Hojas Verdes", "Almacén"];

  // ==========================================
  // 2. STORE REACTIVO (Versión 3 sin emojis)
  // ==========================================
  const STORAGE_KEYS = {
    PRODUCTS: "mihuerta_products_v3",
    ORDERS: "mihuerta_orders_v3",
    CUSTOMERS: "mihuerta_customers_v3",
    CURRENT_USER: "mihuerta_current_user_v3",
    CART: "mihuerta_cart_v3"
  };

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

      window.addEventListener("storage", (e) => {
        if (Object.values(STORAGE_KEYS).includes(e.key)) {
          this.notify("storage_sync");
        }
      });
    }

    init() {
      if (!safeGet(STORAGE_KEYS.PRODUCTS, null)) {
        safeSet(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      }

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
                categoria: "Verduras",
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
                categoria: "Frutas",
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
                categoria: "Frutas",
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
                categoria: "Hojas Verdes",
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
                categoria: "Verduras",
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
                categoria: "Verduras",
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
                categoria: "Frutas",
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

    subscribe(callback) {
      this.listeners.add(callback);
      return () => this.listeners.delete(callback);
    }

    notify(event, data) {
      this.listeners.forEach((cb) => cb(event, data));
    }

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

  const store = new Store();

  // ==========================================
  // 3. VISTA CLIENTE
  // ==========================================
  function renderClientView(container) {
    let selectedCategory = "Todos";
    let searchQuery = "";
    let isCartOpen = false;
    let activeOrder = null;

    function update() {
      container.innerHTML = "";
      const user = store.getCurrentUser();

      if (!user) {
        renderPhoneGate();
        return;
      }

      if (activeOrder) {
        renderOrderTracking();
        return;
      }

      renderCatalog();
    }

    function renderPhoneGate() {
      container.innerHTML = `
        <div class="max-w-md mx-auto p-4 pt-10 min-h-[85vh] flex flex-col justify-center">
          <div class="bg-white rounded-3xl p-7 shadow-xl shadow-slate-200/50 border border-slate-200/80 text-left">
            <div class="mb-6">
              <span class="inline-block text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/60 mb-2">
                Verdulería Digital
              </span>
              <h1 class="text-2xl font-black text-slate-900 tracking-tight">Mi Huerta</h1>
              <p class="text-xs text-slate-500 mt-1">
                Catálogo de estación, pedidos directos y pesaje transparente en balanza.
              </p>
            </div>

            <form id="phone-form" class="space-y-4">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Número de WhatsApp
                </label>
                <div class="relative flex items-center">
                  <span class="absolute left-3.5 text-slate-400 font-semibold text-sm select-none">
                    +54 9
                  </span>
                  <input 
                    type="tel" 
                    id="phone-input" 
                    required 
                    inputmode="numeric"
                    placeholder="11 2345 6789" 
                    value="1123456789"
                    class="w-full pl-20 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 font-bold text-base outline-none transition"
                  />
                </div>
                <p class="text-[11px] text-slate-400 mt-1.5">
                  Tu número nos permite sincronizar tu pedido y avisarte cuando esté pesado.
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
                    placeholder="Ej: Facundo Gómez" 
                    class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 text-sm font-medium outline-none transition"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Dirección de entrega (opcional)
                  </label>
                  <input 
                    type="text" 
                    id="address-input" 
                    placeholder="Ej: Av. Rivadavia 4520, Piso 3 B" 
                    class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 text-sm font-medium outline-none transition"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                class="w-full mt-2 bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-slate-900/10 transition tap-feedback text-sm flex items-center justify-center gap-2"
              >
                <span>Ingresar al Catálogo</span>
                <span class="text-xs text-slate-400 font-normal">›</span>
              </button>
            </form>

            <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                Precios del día actualizados
              </span>
              <span>Balanza de precisión</span>
            </div>
          </div>
        </div>
      `;

      const phoneForm = container.querySelector("#phone-form");
      const phoneInput = container.querySelector("#phone-input");
      const nameInput = container.querySelector("#name-input");
      const addressInput = container.querySelector("#address-input");

      phoneInput.addEventListener("input", (e) => {
        const existing = store.getCustomer(e.target.value);
        if (existing) {
          nameInput.value = existing.nombre || "";
          addressInput.value = existing.direccion || "";
        }
      });

      const initialMatch = store.getCustomer(phoneInput.value);
      if (initialMatch) {
        nameInput.value = initialMatch.nombre || "";
        addressInput.value = initialMatch.direccion || "";
      }

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
        update();
      });
    }

    function renderCatalog() {
      const user = store.getCurrentUser();
      const products = store.getProducts();
      const cart = store.getCart();
      const { items: cartItems, totalEstimado, totalItems } = store.getCartSummary();

      const filteredProducts = products.filter((p) => {
        const matchesCategory = selectedCategory === "Todos" || p.categoria === selectedCategory;
        const matchesSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      });

      container.innerHTML = `
        <div class="max-w-md mx-auto pb-32">
          
          <!-- Header Móvil del Cliente -->
          <header class="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 pt-3 pb-2.5">
            <div class="flex items-center justify-between">
              <div>
                <div class="flex items-center gap-2">
                  <h1 class="text-base font-black text-slate-900 tracking-tight uppercase">Mi Huerta</h1>
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
                class="relative px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 tap-feedback"
              >
                <span>Pedido</span>
                <span class="px-1.5 py-0.2 rounded-full ${totalItems > 0 ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'} text-[10px] font-extrabold">
                  ${totalItems}
                </span>
              </button>
            </div>

            <!-- Buscador -->
            <div class="mt-2.5 relative">
              <input 
                type="text" 
                id="search-input" 
                placeholder="Buscar por nombre (ej: papa, tomate, acelga)..." 
                value="${searchQuery}"
                class="w-full pl-3 pr-8 py-2 bg-slate-100 hover:bg-slate-150 focus:bg-white border border-transparent focus:border-slate-300 rounded-xl text-xs font-medium outline-none transition"
              />
              ${
                searchQuery
                  ? `<button id="btn-clear-search" class="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 text-xs font-bold">X</button>`
                  : ""
              }
            </div>

            <!-- Píldoras de Categorías (Horizontal Scroll) -->
            <div class="mt-2.5 flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              ${CATEGORIAS.map(
                (cat) => `
                <button 
                  data-category="${cat}"
                  class="category-pill whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
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

          <!-- Lista de Productos -->
          <main class="p-4 space-y-2.5">
            ${
              filteredProducts.length === 0
                ? `
              <div class="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-6">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Sin coincidencias</span>
                <p class="text-sm font-semibold text-slate-700">No encontramos productos con ese nombre</p>
                <button id="btn-reset-filter" class="mt-3 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200">
                  Limpiar búsqueda
                </button>
              </div>
            `
                : filteredProducts
                    .map((product) => {
                      const cartItem = cart[product.id];
                      const currentQty = cartItem ? cartItem.cantidad : 0;
                      const step = product.paso || 0.5;
                      const unitLabel = product.unidad_medida === "KG" ? "kg" : "u.";
                      const unitSubtitle = product.unidad_medida === "KG" ? "Venta por kilo" : "Venta por unidad";

                      return `
                <div class="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm flex items-center justify-between gap-3 transition ${
                  !product.disponible ? "opacity-40 grayscale pointer-events-none" : ""
                }">
                  <!-- Info Producto -->
                  <div class="flex-1 min-w-0 pr-1">
                    <div class="flex items-center gap-1.5 mb-0.5">
                      <span class="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                        ${product.categoria}
                      </span>
                      <span class="text-[10px] text-slate-400">·</span>
                      <span class="text-[10px] font-medium text-slate-400">
                        ${unitSubtitle}
                      </span>
                    </div>

                    <h3 class="font-extrabold text-slate-900 text-sm leading-tight truncate">
                      ${product.nombre}
                    </h3>

                    <p class="text-[11px] text-slate-400 truncate mt-0.5">
                      ${product.detalle || ""}
                    </p>

                    <div class="mt-1 flex items-baseline gap-1">
                      <span class="text-sm font-black text-emerald-700">
                        $${product.precio.toLocaleString("es-AR")}
                      </span>
                      <span class="text-[11px] text-slate-400 font-medium">/ ${unitLabel}</span>
                    </div>

                    ${
                      !product.disponible
                        ? `<span class="inline-block text-[10px] font-bold text-rose-600 uppercase tracking-wider mt-1">Agotado</span>`
                        : ""
                    }
                  </div>

                  <!-- Selector de Cantidad / Botón Agregar -->
                  <div class="shrink-0">
                    ${
                      product.disponible
                        ? currentQty === 0
                          ? `
                          <button 
                            data-add-id="${product.id}"
                            data-step="${step}"
                            class="btn-add-initial bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition tap-feedback flex items-center gap-1 shadow-sm"
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
                              class="btn-qty-dec w-8 h-8 flex items-center justify-center rounded-lg hover:bg-emerald-700 active:scale-95 text-sm font-extrabold transition"
                              title="Restar"
                            >
                              −
                            </button>
                            <span class="px-2 text-xs font-black min-w-[48px] text-center tracking-tight">
                              ${currentQty} ${unitLabel}
                            </span>
                            <button 
                              data-inc-id="${product.id}"
                              data-step="${step}"
                              class="btn-qty-inc w-8 h-8 flex items-center justify-center rounded-lg hover:bg-emerald-700 active:scale-95 text-sm font-extrabold transition"
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
                    .join("")
            }
          </main>

          <!-- Barra Flotante Inferior de Carrito -->
          ${
            totalItems > 0
              ? `
            <div class="fixed bottom-4 left-4 right-4 z-30 max-w-md mx-auto pointer-events-auto">
              <button 
                id="btn-open-cart"
                class="w-full bg-slate-950 hover:bg-slate-900 text-white p-3.5 px-4 rounded-2xl shadow-xl shadow-slate-950/25 flex items-center justify-between transition tap-feedback border border-slate-800"
              >
                <div class="flex items-center gap-3">
                  <span class="bg-emerald-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-full">
                    ${totalItems}
                  </span>
                  <div class="text-left">
                    <span class="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Total Estimado</span>
                    <span class="font-black text-base leading-none">$${totalEstimado.toLocaleString("es-AR")}</span>
                  </div>
                </div>
                <div class="flex items-center gap-1.5 font-bold text-xs bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl text-emerald-400 transition">
                  <span>Ver Pedido</span>
                  <span>›</span>
                </div>
              </button>
            </div>
          `
              : ""
          }

          <!-- Drawer de Carrito y Checkout -->
          ${isCartOpen ? renderCartDrawer(user, cartItems, totalEstimado) : ""}
        </div>
      `;

      // Listeners del catálogo
      container.querySelector("#btn-change-user")?.addEventListener("click", () => {
        store.logoutUser();
        update();
      });

      container.querySelector("#btn-header-cart")?.addEventListener("click", () => {
        if (totalItems > 0) {
          isCartOpen = true;
          renderCatalog();
        }
      });

      const searchInput = container.querySelector("#search-input");
      searchInput?.addEventListener("input", (e) => {
        searchQuery = e.target.value;
        renderCatalog();
        const nextInput = container.querySelector("#search-input");
        if (nextInput) {
          nextInput.focus();
          nextInput.setSelectionRange(searchQuery.length, searchQuery.length);
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

      container.querySelector("#btn-open-cart")?.addEventListener("click", () => {
        isCartOpen = true;
        renderCatalog();
      });

      if (isCartOpen) {
        attachCartDrawerListeners(user);
      }
    }

    function renderCartDrawer(user, items, totalEstimado) {
      return `
        <div class="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm flex items-end justify-center animate-fade-in">
          <div class="bg-white w-full max-w-md rounded-t-3xl max-h-[92vh] flex flex-col shadow-2xl animate-slide-up border-t border-slate-200">
            
            <div class="w-10 h-1 bg-slate-300 rounded-full mx-auto mt-3"></div>

            <div class="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 class="font-black text-slate-900 text-lg tracking-tight">Tu Pedido</h2>
                <p class="text-[11px] text-slate-400">Revisá cantidades antes de confirmar</p>
              </div>
              <button 
                id="btn-close-cart" 
                class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-xs tap-feedback"
              >
                X
              </button>
            </div>

            <div class="p-5 overflow-y-auto space-y-3 flex-1">
              ${
                items.length === 0
                  ? `<p class="text-xs text-slate-400 text-center py-8">Tu carrito está vacío</p>`
                  : items
                      .map(
                        (item) => `
                  <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between gap-3">
                    <div class="flex-1 min-w-0">
                      <span class="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.2 rounded bg-slate-200/80 text-slate-600">
                        ${item.categoria || "Producto"}
                      </span>
                      <h4 class="font-extrabold text-slate-900 text-sm truncate mt-0.5">${item.nombre}</h4>
                      <p class="text-xs text-slate-400 mt-0.5">
                        $${item.precio_unitario.toLocaleString("es-AR")} / ${item.unidad_medida === "KG" ? "kg" : "u."}
                      </p>
                    </div>

                    <div class="flex items-center gap-1.5">
                      <div class="flex items-center bg-white border border-slate-200 rounded-xl p-0.5">
                        <button 
                          data-drawer-dec="${item.producto_id}" 
                          class="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-lg font-bold text-xs"
                        >
                          −
                        </button>
                        <span class="px-2 text-xs font-black min-w-[36px] text-center text-slate-900">
                          ${item.cantidad}
                        </span>
                        <button 
                          data-drawer-inc="${item.producto_id}" 
                          class="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-lg font-bold text-xs"
                        >
                          +
                        </button>
                      </div>

                      <div class="text-right min-w-[65px]">
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

              <div class="pt-3">
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Método de Entrega
                </label>
                <div class="grid grid-cols-2 gap-2">
                  <label class="flex flex-col p-3 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 has-[:checked]:border-slate-900 has-[:checked]:bg-slate-900 has-[:checked]:text-white transition">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-black">Retiro en Local</span>
                      <input type="radio" name="delivery-mode" value="RETIRO" checked class="accent-emerald-500" />
                    </div>
                    <span class="text-[10px] opacity-70 mt-1">Listo en 20-30 min · Sin costo</span>
                  </label>

                  <label class="flex flex-col p-3 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 has-[:checked]:border-slate-900 has-[:checked]:bg-slate-900 has-[:checked]:text-white transition">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-black">Envío a Domicilio</span>
                      <input type="radio" name="delivery-mode" value="DELIVERY" class="accent-emerald-500" />
                    </div>
                    <span class="text-[10px] opacity-70 mt-1">Cadete a tu puerta</span>
                  </label>
                </div>
              </div>

              <div id="delivery-address-container" class="hidden pt-1">
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Dirección exacta de entrega
                </label>
                <input 
                  type="text" 
                  id="delivery-address-input" 
                  value="${user.direccion || ""}" 
                  placeholder="Calle, número, piso y departamento"
                  class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 transition"
                />
              </div>

              <div class="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 text-xs text-amber-900 mt-2">
                <p class="font-bold text-[11px] uppercase tracking-wider text-amber-800 mb-0.5">Pesaje en Balanza</p>
                <p class="text-[11px] leading-relaxed opacity-90">
                  El total indicado es una estimación. En el mostrador se pesan las unidades reales y te notificaremos el comprobante con los gramos exactos y el importe final.
                </p>
              </div>
            </div>

            <div class="p-5 border-t border-slate-100 bg-slate-50 rounded-b-3xl space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Total Estimado</span>
                  <span class="text-xs text-slate-500">Sujeto a balanza</span>
                </div>
                <span class="font-black text-2xl text-slate-900">$${totalEstimado.toLocaleString("es-AR")}</span>
              </div>

              <button 
                id="btn-confirm-order"
                class="w-full bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-black py-4 rounded-xl shadow-lg shadow-slate-900/10 text-sm transition tap-feedback flex items-center justify-center gap-2"
              >
                <span>Confirmar Pedido</span>
                <span class="text-xs font-normal">›</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }

    function attachCartDrawerListeners(user) {
      container.querySelector("#btn-close-cart")?.addEventListener("click", () => {
        isCartOpen = false;
        renderCatalog();
      });

      const radios = container.querySelectorAll('input[name="delivery-mode"]');
      const addressContainer = container.querySelector("#delivery-address-container");
      radios.forEach((radio) => {
        radio.addEventListener("change", (e) => {
          if (e.target.value === "DELIVERY") {
            addressContainer?.classList.remove("hidden");
          } else {
            addressContainer?.classList.add("hidden");
          }
        });
      });

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
        const mode = container.querySelector('input[name="delivery-mode"]:checked')?.value || "RETIRO";
        const addressInput = container.querySelector("#delivery-address-input");
        const address = mode === "DELIVERY" ? addressInput?.value.trim() : "Retiro en local";

        if (mode === "DELIVERY" && !address) {
          alert("Por favor ingresá tu dirección para coordinar el envío.");
          addressInput?.focus();
          return;
        }

        const newOrder = store.createOrder({
          cliente: user,
          tipo_entrega: mode,
          direccion_entrega: address
        });

        isCartOpen = false;
        activeOrder = newOrder;
        update();
      });
    }

    function renderOrderTracking() {
      const currentOrder = store.getOrders().find((o) => o.id === activeOrder.id) || activeOrder;
      const isWeighing = currentOrder.estado === "EN_PREPARACION";
      const isReady = currentOrder.estado === "LISTO" || currentOrder.estado === "ENTREGADO";
      const isDelivered = currentOrder.estado === "ENTREGADO";

      let stepNumber = 1;
      let stepTitle = "Pedido Recibido";
      let stepDesc = "El pedido ingresó en la cola del mostrador.";

      if (isWeighing) {
        stepNumber = 2;
        stepTitle = "En Balanza";
        stepDesc = "El operario está pesando cada uno de tus productos.";
      } else if (isReady) {
        stepNumber = 3;
        stepTitle = "Listo para Entrega";
        stepDesc = currentOrder.tipo_entrega === "DELIVERY"
          ? "El pedido fue pesado y el cadete está listo para despachar."
          : "El pedido fue pesado y podés pasar a retirarlo por el local.";
      }
      if (isDelivered) {
        stepNumber = 4;
        stepTitle = "Entregado y Cobrado";
        stepDesc = "Pedido finalizado exitosamente. ¡Muchas gracias!";
      }

      container.innerHTML = `
        <div class="max-w-md mx-auto p-4 pt-6 pb-24">
          <div class="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-200/80 text-left">
            
            <div class="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Comprobante Digital</span>
                <h2 class="text-xl font-black text-slate-900 tracking-tight">Pedido #${currentOrder.id}</h2>
              </div>
              <span class="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                isReady
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : isWeighing
                  ? "bg-blue-100 text-blue-800 border border-blue-300"
                  : "bg-amber-100 text-amber-800 border border-amber-300"
              }">
                ${currentOrder.estado}
              </span>
            </div>

            <div class="my-5">
              <div class="grid grid-cols-3 gap-1.5 text-center">
                <div class="h-1.5 rounded-full ${stepNumber >= 1 ? 'bg-slate-900' : 'bg-slate-200'}"></div>
                <div class="h-1.5 rounded-full ${stepNumber >= 2 ? (isReady ? 'bg-slate-900' : 'bg-blue-600') : 'bg-slate-200'}"></div>
                <div class="h-1.5 rounded-full ${stepNumber >= 3 ? 'bg-emerald-600' : 'bg-slate-200'}"></div>
              </div>
              <div class="mt-3">
                <h3 class="text-sm font-extrabold text-slate-900">${stepTitle}</h3>
                <p class="text-xs text-slate-500 mt-0.5">${stepDesc}</p>
              </div>
            </div>

            <div class="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
              <div class="flex justify-between text-xs text-slate-500">
                <span>Entrega:</span>
                <strong class="text-slate-800 font-semibold">
                  ${currentOrder.tipo_entrega === "DELIVERY" ? "Envío a Domicilio" : "Retiro en Mostrador"}
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

            <div class="mt-5">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Detalle de Productos</h4>
              <div class="divide-y divide-slate-100 text-xs">
                ${currentOrder.items
                  .map((item) => {
                    const pesoTexto = item.peso_real !== null
                      ? `${item.peso_real} ${item.unidad_medida === "KG" ? "kg" : "u."} (pesado)`
                      : `${item.cantidad_solicitada} ${item.unidad_medida === "KG" ? "kg" : "u."} (aprox)`;
                    return `
                    <div class="py-2 flex items-center justify-between gap-2 ${item.sin_stock ? "opacity-40 line-through" : ""}">
                      <div>
                        <span class="font-bold text-slate-800">${item.nombre}</span>
                        <span class="text-[11px] text-slate-400 block">${pesoTexto}</span>
                      </div>
                      <strong class="text-slate-900 font-bold">
                        $${(item.subtotal || 0).toLocaleString("es-AR")}
                      </strong>
                    </div>
                  `;
                  })
                  .join("")}
              </div>
            </div>

            <div class="mt-6 pt-4 border-t border-slate-100 space-y-2">
              <button 
                id="btn-new-order" 
                class="w-full py-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition tap-feedback"
              >
                Realizar Otro Pedido
              </button>
            </div>
          </div>
        </div>
      `;

      container.querySelector("#btn-new-order")?.addEventListener("click", () => {
        activeOrder = null;
        update();
      });
    }

    const unsubscribe = store.subscribe((event) => {
      if (
        event === "cart_changed" ||
        event === "products_changed" ||
        event === "orders_changed" ||
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
  // 4. VISTA OPERARIO (Mostrador & Balanza)
  // ==========================================
  function renderOperatorView(container) {
    let activeTab = "PENDIENTE";

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
        <div class="max-w-xl mx-auto pb-28">
          <header class="sticky top-0 z-20 bg-slate-950 text-white px-4 py-3 border-b border-slate-800 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <div class="flex items-center gap-2">
                  <h1 class="font-black text-sm tracking-widest uppercase">Mostrador & Balanza</h1>
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <p class="text-[11px] text-slate-400">Recepción y control de pedidos en tiempo real</p>
              </div>

              <button 
                id="btn-test-sound" 
                class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-300 text-xs font-semibold border border-slate-700 transition tap-feedback"
              >
                Timbre de prueba
              </button>
            </div>

            <div class="grid grid-cols-4 gap-1 mt-3 bg-slate-900 p-1 rounded-xl text-center border border-slate-800">
              <button 
                data-tab="PENDIENTE" 
                class="tab-btn py-2 px-1 rounded-lg text-xs font-bold transition flex flex-col items-center gap-0.5 ${
                  activeTab === "PENDIENTE" ? "bg-amber-400 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
                }"
              >
                <span>Entrantes</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === "PENDIENTE" ? "bg-amber-600/30 text-slate-950" : "bg-slate-800 text-slate-400"
                }">${counts.PENDIENTE}</span>
              </button>

              <button 
                data-tab="EN_PREPARACION" 
                class="tab-btn py-2 px-1 rounded-lg text-xs font-bold transition flex flex-col items-center gap-0.5 ${
                  activeTab === "EN_PREPARACION" ? "bg-blue-500 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }"
              >
                <span>En Balanza</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === "EN_PREPARACION" ? "bg-blue-700 text-white" : "bg-slate-800 text-slate-400"
                }">${counts.EN_PREPARACION}</span>
              </button>

              <button 
                data-tab="LISTO" 
                class="tab-btn py-2 px-1 rounded-lg text-xs font-bold transition flex flex-col items-center gap-0.5 ${
                  activeTab === "LISTO" ? "bg-emerald-500 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
                }"
              >
                <span>Listos</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === "LISTO" ? "bg-emerald-700/30 text-slate-950" : "bg-slate-800 text-slate-400"
                }">${counts.LISTO}</span>
              </button>

              <button 
                data-tab="ENTREGADO" 
                class="tab-btn py-2 px-1 rounded-lg text-xs font-bold transition flex flex-col items-center gap-0.5 ${
                  activeTab === "ENTREGADO" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
                }"
              >
                <span>Cobrados</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400">${counts.ENTREGADO}</span>
              </button>
            </div>
          </header>

          <main class="p-4">
            ${renderTabContent(orders)}
          </main>
        </div>
      `;

      container.querySelector("#btn-test-sound")?.addEventListener("click", () => {
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

    function renderTabContent(orders) {
      const tabOrders = orders.filter((o) => o.estado === activeTab);

      if (tabOrders.length === 0) {
        return `
          <div class="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-6">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Sin órdenes</span>
            <h3 class="font-bold text-slate-700 text-sm">No hay pedidos en esta columna</h3>
            <p class="text-xs text-slate-400 mt-1">Los nuevos pedidos ingresarán automáticamente aquí en tiempo real.</p>
          </div>
        `;
      }

      if (activeTab === "PENDIENTE") {
        return `
          <div class="space-y-3">
            ${tabOrders
              .map((order) => {
                const itemsList = order.items
                  .map((i) => `${i.cantidad_solicitada}${i.unidad_medida === "KG" ? "kg" : "u"} ${i.nombre}`)
                  .join(" · ");

                return `
                <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm transition">
                  <div class="flex items-start justify-between">
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="text-base font-black text-slate-900">#${order.id}</span>
                        <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          order.tipo_entrega === "DELIVERY"
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-700"
                        }">
                          ${order.tipo_entrega === "DELIVERY" ? "Envío a Domicilio" : "Retiro en Local"}
                        </span>
                      </div>
                      <h3 class="font-extrabold text-slate-900 text-sm mt-1.5">${order.cliente.nombre}</h3>
                      <p class="text-xs text-slate-400">${order.cliente.telefono} · ${timeAgo(order.fecha)}</p>
                    </div>
                    <div class="text-right">
                      <span class="text-[10px] text-slate-400 block font-bold uppercase">Estimado</span>
                      <span class="font-black text-base text-slate-900">$${order.total_estimado.toLocaleString("es-AR")}</span>
                    </div>
                  </div>

                  <div class="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                    <span class="font-bold text-slate-700 block mb-0.5 text-[11px] uppercase tracking-wider">Productos solicitados:</span>
                    <p class="leading-relaxed">${itemsList}</p>
                  </div>

                  <button 
                    data-start-id="${order.id}" 
                    class="btn-start-prep w-full mt-3 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider shadow-sm transition tap-feedback flex items-center justify-center gap-2"
                  >
                    <span>Tomar y Pesar en Balanza</span>
                    <span>›</span>
                  </button>
                </div>
              `;
              })
              .join("")}
          </div>
        `;
      }

      if (activeTab === "EN_PREPARACION") {
        return `
          <div class="space-y-4">
            ${tabOrders
              .map((order) => {
                const currentTotal = order.items
                  .filter((i) => !i.sin_stock)
                  .reduce((sum, i) => sum + (i.peso_real !== null ? i.subtotal : i.cantidad_solicitada * i.precio_unitario), 0);

                return `
                <div class="bg-white rounded-3xl p-4 sm:p-5 border-2 border-blue-200/80 shadow-md">
                  <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span class="text-[10px] font-black text-blue-600 tracking-widest uppercase">Pesaje Activo</span>
                      <h2 class="text-lg font-black text-slate-900">Pedido #${order.id} · ${order.cliente.nombre}</h2>
                      <p class="text-xs text-slate-400">
                        ${order.tipo_entrega === "DELIVERY" ? order.direccion_entrega : "Retira en mostrador"}
                      </p>
                    </div>
                    <div class="text-right">
                      <span class="text-[10px] text-slate-400 uppercase font-bold block">Total en Balanza</span>
                      <span class="text-xl font-black text-emerald-700">$${Math.round(currentTotal).toLocaleString("es-AR")}</span>
                    </div>
                  </div>

                  <div class="mt-4 space-y-2.5">
                    ${order.items
                      .map((item, idx) => {
                        const isWeight = item.unidad_medida === "KG";
                        const currentVal = item.peso_real !== null ? item.peso_real : "";
                        const subtotalItem = item.peso_real !== null ? item.subtotal : Math.round(item.cantidad_solicitada * item.precio_unitario);

                        return `
                        <div class="p-3 rounded-2xl border transition ${
                          item.sin_stock
                            ? "bg-rose-50 border-rose-200 opacity-60"
                            : item.peso_real !== null
                            ? "bg-emerald-50/50 border-emerald-300"
                            : "bg-slate-50 border-slate-200"
                        }">
                          <div class="flex items-start justify-between gap-2">
                            <div class="flex-1 min-w-0">
                              <span class="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200">
                                ${item.categoria || (isWeight ? "Por Kilo" : "Por Unidad")}
                              </span>
                              <h4 class="font-extrabold text-slate-900 text-sm mt-1 truncate ${item.sin_stock ? "line-through text-rose-600" : ""}">
                                ${item.nombre}
                              </h4>
                              <p class="text-xs text-slate-500 mt-0.5">
                                Solicitó: <strong class="text-slate-800">${item.cantidad_solicitada} ${isWeight ? "kg" : "u."}</strong>
                                · ($${item.precio_unitario}/${isWeight ? "kg" : "u"})
                              </p>
                            </div>

                            <button 
                              data-toggle-stock-order="${order.id}"
                              data-item-index="${idx}"
                              class="btn-toggle-stock text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border transition tap-feedback ${
                                item.sin_stock
                                  ? "bg-rose-600 text-white border-rose-600"
                                  : "bg-white text-slate-600 border-slate-300 hover:text-rose-600"
                              }"
                            >
                              ${item.sin_stock ? "Anulado" : "Sin Stock"}
                            </button>
                          </div>

                          ${
                            !item.sin_stock
                              ? `
                            <div class="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between gap-3">
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
                                    value="${currentVal}"
                                    placeholder="${item.cantidad_solicitada}"
                                    class="input-weight w-full text-center py-2 px-2 bg-white border-2 rounded-xl font-black text-sm text-slate-900 outline-none focus:border-blue-600 ${
                                      item.peso_real !== null ? "border-emerald-500 text-emerald-800 bg-emerald-50/20" : "border-slate-300"
                                    }"
                                  />
                                  <span class="absolute right-2.5 top-2.5 text-xs font-bold text-slate-400 pointer-events-none">
                                    ${isWeight ? "kg" : "u."}
                                  </span>
                                </div>
                              </div>

                              <div class="text-right shrink-0">
                                <span class="text-[9px] text-slate-400 block font-bold uppercase">Subtotal</span>
                                <span class="font-black text-sm text-slate-900">$${subtotalItem.toLocaleString("es-AR")}</span>
                              </div>
                            </div>
                          `
                              : ""
                          }
                        </div>
                      `;
                      })
                      .join("")}
                  </div>

                  <div class="mt-4 pt-3 border-t border-slate-100">
                    <button 
                      data-finish-order-id="${order.id}"
                      class="btn-finish-weighing w-full bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-black py-3.5 px-4 rounded-xl shadow-lg shadow-slate-900/10 text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition tap-feedback"
                    >
                      <span>Finalizar Pesaje y Notificar al Cliente</span>
                      <span>›</span>
                    </button>
                  </div>
                </div>
              `;
              })
              .join("")}
          </div>
        `;
      }

      if (activeTab === "LISTO") {
        return `
          <div class="space-y-4">
            ${tabOrders
              .map((order) => {
                const waMessage = encodeURIComponent(generateWhatsAppSummary(order));
                const waLink = `https://wa.me/549${order.cliente.telefono}?text=${waMessage}`;

                return `
                <div class="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm">
                  <div class="flex items-start justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span class="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Pesaje Completo
                      </span>
                      <h3 class="text-base font-black text-slate-900 mt-1">#${order.id} · ${order.cliente.nombre}</h3>
                      <p class="text-xs text-slate-500">${order.cliente.telefono} · ${order.tipo_entrega}</p>
                    </div>
                    <div class="text-right">
                      <span class="text-[10px] text-slate-400 block font-bold uppercase">Total Exacto</span>
                      <span class="font-black text-2xl text-emerald-700">$${(order.total_real || order.total_estimado).toLocaleString("es-AR")}</span>
                    </div>
                  </div>

                  <div class="mt-3 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-700 font-mono whitespace-pre-line leading-relaxed">
                    ${generateWhatsAppSummary(order)}
                  </div>

                  <div class="grid grid-cols-2 gap-2 mt-4">
                    <a 
                      href="${waLink}" 
                      target="_blank"
                      class="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition text-center tap-feedback"
                    >
                      <span>Enviar WhatsApp</span>
                      <span>›</span>
                    </a>
                    <button 
                      data-deliver-order-id="${order.id}"
                      class="btn-deliver-order bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-bold py-3 px-3 rounded-xl text-xs transition tap-feedback"
                    >
                      Marcar Cobrado
                    </button>
                  </div>
                </div>
              `;
              })
              .join("")}
          </div>
        `;
      }

      if (activeTab === "ENTREGADO") {
        return `
          <div class="space-y-2.5">
            ${tabOrders
              .map(
                (order) => `
              <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">#${order.id}</span>
                  <h4 class="font-extrabold text-slate-900 text-sm">${order.cliente.nombre}</h4>
                  <p class="text-xs text-slate-400">${order.tipo_entrega} · ${timeAgo(order.fecha)}</p>
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

    function generateWhatsAppSummary(order) {
      const itemsLines = order.items
        .filter((i) => !i.sin_stock)
        .map((i) => `* ${i.nombre} (${i.peso_real} ${i.unidad_medida === "KG" ? "kg" : "u"}): $${i.subtotal}`)
        .join("\n");

      const total = order.total_real || order.total_estimado;

      return `Hola ${order.cliente.nombre}. Tu pedido #${order.id} en Mi Huerta ya fue pesado y está listo:

${itemsLines}

Total exacto en balanza: $${total.toLocaleString("es-AR")}
${order.tipo_entrega === "DELIVERY" ? "El cadete está coordinado con tu dirección de entrega." : "Ya podés pasar a retirarlo por el mostrador."}

Alias para transferir: mihuerta.verduras
(O podés abonar en efectivo al recibir).`;
    }

    function attachActions(orders) {
      container.querySelectorAll(".btn-start-prep").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = Number(btn.dataset.startId);
          store.updateOrderStatus(id, "EN_PREPARACION");
          activeTab = "EN_PREPARACION";
          update();
        });
      });

      container.querySelectorAll(".input-weight").forEach((input) => {
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
  // 5. VISTA DUEÑO / ADMINISTRADOR DE PRECIOS
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
        <div class="max-w-xl mx-auto p-4 pb-28">
          <div class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm mb-4">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-0.5">
                  Panel de Administración
                </span>
                <h1 class="font-black text-slate-900 text-lg tracking-tight">Precios y Disponibilidad</h1>
                <p class="text-xs text-slate-500 mt-0.5">Editá los valores del día en tiempo real.</p>
              </div>
              <span class="text-xs font-black px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full border border-slate-200">
                ${products.length} productos
              </span>
            </div>

            <div class="mt-4 flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              ${CATEGORIAS.map(
                (cat) => `
                <button 
                  data-admin-cat="${cat}"
                  class="admin-cat-pill whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition ${
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

          <div class="space-y-2">
            ${filtered
              .map((p) => {
                const unit = p.unidad_medida === "KG" ? "kg" : "unidad";

                return `
                <div class="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm flex items-center justify-between gap-3 transition">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1.5">
                      <span class="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                        ${p.categoria}
                      </span>
                      <span class="text-[10px] text-slate-400">·</span>
                      <span class="text-[10px] text-slate-400">Por ${unit}</span>
                    </div>
                    <h3 class="font-extrabold text-slate-900 text-sm truncate mt-0.5">${p.nombre}</h3>
                    <p class="text-[11px] text-slate-400 truncate">${p.detalle || ""}</p>
                  </div>

                  <div class="flex items-center gap-2 shrink-0">
                    <div class="relative w-24">
                      <span class="absolute left-2.5 top-2 text-xs font-bold text-slate-400">$</span>
                      <input 
                        type="number" 
                        inputmode="numeric"
                        step="50"
                        min="0"
                        data-product-id="${p.id}"
                        value="${p.precio}"
                        class="input-price w-full pl-6 pr-2 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-black text-sm text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition"
                      />
                    </div>

                    <button 
                      data-toggle-stock="${p.id}"
                      class="btn-stock-toggle px-3 py-1.5 rounded-xl text-xs font-bold transition tap-feedback ${
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

  // Auto-iniciar
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => new App());
  } else {
    new App();
  }
})();
