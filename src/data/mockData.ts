/**
 * mockData.ts — solo datos estáticos que NO vienen de la API.
 *
 * Eliminados: seededOperator, materialTypes, routes, recyclers,
 *             balanceData, recyclerPayments, massBalanceData, inventoryData.
 * Todos esos datos ahora provienen del backend (/api/v1/).
 */

import type { InventoryItem, NavigationItem, BalanceRow, RecyclerPayment } from "../types/app";

// Claves de localStorage — sólo para tema (las de auth las gestiona api.ts)
export const themeStorageKey = "eca-management-theme";

// ── Navegación lateral ────────────────────────────────────────────────────────
export const navigation: NavigationItem[] = [
  { id: "dashboard",  name: "Dashboard",         icon: "dashboard" },
  { id: "recepcion",  name: "Recepción",          icon: "scale"     },
  { id: "inventario", name: "Inventario",         icon: "package"   },
  { id: "reportes",   name: "Centro de Reportes", icon: "report"    },
  { id: "historial",  name: "Historial",          icon: "history"   },
];

// ── Inventario mock (sin modelo backend aún) ──────────────────────────────────
export const inventoryData: InventoryItem[] = [
  { code: "PET-01",   name: "Plástico PET",       stock: 1250, unit: "kg", status: "high",     lastUpdate: "Hace 2 horas" },
  { code: "CART-01",  name: "Cartón",              stock: 850,  unit: "kg", status: "medium",   lastUpdate: "Hace 5 horas" },
  { code: "PAP-01",   name: "Papel de archivo",    stock: 320,  unit: "kg", status: "low",      lastUpdate: "Hace 1 hora"  },
  { code: "HDPE-01",  name: "Plástico duro HDPE",  stock: 420,  unit: "kg", status: "medium",   lastUpdate: "Hace 4 horas" },
  { code: "VIDR-01",  name: "Vidrio",              stock: 740,  unit: "kg", status: "medium",   lastUpdate: "Hace 2 horas" },
  { code: "METAL-01", name: "Metal ferroso",       stock: 560,  unit: "kg", status: "medium",   lastUpdate: "Hace 3 horas" },
  { code: "ALU-01",   name: "Aluminio",            stock: 95,   unit: "kg", status: "critical", lastUpdate: "Hace 8 horas" },
  { code: "TETRA-01", name: "Tetrapack",           stock: 180,  unit: "kg", status: "low",      lastUpdate: "Hace 6 horas" },
];

// ── Reportes mock (aún no conectados a API) ───────────────────────────────────
export const balanceData: BalanceRow[] = [
  { material: "PET",      ingresado: 450, rechazos: 35, aprovechado: 415 },
  { material: "Cartón",   ingresado: 380, rechazos: 25, aprovechado: 355 },
  { material: "Papel",    ingresado: 280, rechazos: 20, aprovechado: 260 },
  { material: "HDPE",     ingresado: 165, rechazos: 12, aprovechado: 153 },
  { material: "Vidrio",   ingresado: 220, rechazos: 18, aprovechado: 202 },
  { material: "Metal",    ingresado: 310, rechazos: 15, aprovechado: 295 },
  { material: "Aluminio", ingresado: 95,  rechazos: 5,  aprovechado: 90  },
  { material: "Tetrapack",ingresado: 145, rechazos: 15, aprovechado: 130 },
];

export const recyclerPayments: RecyclerPayment[] = [
  { name: "Rosa Elena Mora Vargas",      tons: 2.45, payments: 850000,  efficiency: 94 },
  { name: "Pedro Antonio Cifuentes",     tons: 3.20, payments: 1120000, efficiency: 96 },
  { name: "Luz Marina Ospina Torres",    tons: 1.89, payments: 661500,  efficiency: 92 },
  { name: "Carlos Hernando Rodríguez",   tons: 2.78, payments: 973000,  efficiency: 95 },
  { name: "María Claudia Suárez León",   tons: 0.98, payments: 343000,  efficiency: 88 },
];
