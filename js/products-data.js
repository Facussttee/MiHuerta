// Catálogo inicial de productos para la verdulería
export const INITIAL_PRODUCTS = [
  // Frutas
  {
    id: "prod-1",
    nombre: "Banana Cavendish",
    categoria: "Frutas",
    unidad_medida: "KG",
    precio: 1800,
    disponible: true,
    paso: 0.5, // incremento mínimo (500g)
    icono: "🍌"
  },
  {
    id: "prod-2",
    nombre: "Manzana Roja Elegida",
    categoria: "Frutas",
    unidad_medida: "KG",
    precio: 2200,
    disponible: true,
    paso: 0.5,
    icono: "🍎"
  },
  {
    id: "prod-3",
    nombre: "Naranja de Jugo",
    categoria: "Frutas",
    unidad_medida: "KG",
    precio: 1400,
    disponible: true,
    paso: 0.5,
    icono: "🍊"
  },
  {
    id: "prod-4",
    nombre: "Limón Comercial",
    categoria: "Frutas",
    unidad_medida: "KG",
    precio: 1600,
    disponible: true,
    paso: 0.25,
    icono: "🍋"
  },
  {
    id: "prod-5",
    nombre: "Frutilla Seleccionada",
    categoria: "Frutas",
    unidad_medida: "KG",
    precio: 4500,
    disponible: true,
    paso: 0.25,
    icono: "🍓"
  },
  {
    id: "prod-6",
    nombre: "Palta Hass Madura",
    categoria: "Frutas",
    unidad_medida: "UNIDAD",
    precio: 1200,
    disponible: true,
    paso: 1,
    icono: "🥑"
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
    icono: "🥔"
  },
  {
    id: "prod-8",
    nombre: "Cebolla Selección",
    categoria: "Verduras",
    unidad_medida: "KG",
    precio: 1100,
    disponible: true,
    paso: 0.5,
    icono: "🧅"
  },
  {
    id: "prod-9",
    nombre: "Tomate Redondo Premium",
    categoria: "Verduras",
    unidad_medida: "KG",
    precio: 2600,
    disponible: true,
    paso: 0.5,
    icono: "🍅"
  },
  {
    id: "prod-10",
    nombre: "Zanahoria Fresca",
    categoria: "Verduras",
    unidad_medida: "KG",
    precio: 1300,
    disponible: true,
    paso: 0.5,
    icono: "🥕"
  },
  {
    id: "prod-11",
    nombre: "Zapallito Verde Tronco",
    categoria: "Verduras",
    unidad_medida: "KG",
    precio: 1700,
    disponible: true,
    paso: 0.5,
    icono: "🥒"
  },
  {
    id: "prod-12",
    nombre: "Calabaza Anco / Butternut",
    categoria: "Verduras",
    unidad_medida: "KG",
    precio: 1100,
    disponible: true,
    paso: 1.0,
    icono: "🎃"
  },

  // Hojas Verdes
  {
    id: "prod-13",
    nombre: "Acelga de Huerta",
    categoria: "Hojas Verdes",
    unidad_medida: "UNIDAD", // Se vende por atado
    precio: 900,
    disponible: true,
    paso: 1,
    icono: "🥬"
  },
  {
    id: "prod-14",
    nombre: "Lechuga Mantecosa",
    categoria: "Hojas Verdes",
    unidad_medida: "KG",
    precio: 2800,
    disponible: true,
    paso: 0.25,
    icono: "🥗"
  },
  {
    id: "prod-15",
    nombre: "Espinaca Fresca",
    categoria: "Hojas Verdes",
    unidad_medida: "UNIDAD",
    precio: 1100,
    disponible: true,
    paso: 1,
    icono: "🌿"
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
    icono: "🥚"
  },
  {
    id: "prod-17",
    nombre: "Huevos de Campo (Docena)",
    categoria: "Almacén",
    unidad_medida: "UNIDAD",
    precio: 2300,
    disponible: true,
    paso: 1,
    icono: "🥚"
  }
];

export const CATEGORIAS = ["Todos", "Frutas", "Verduras", "Hojas Verdes", "Almacén"];
