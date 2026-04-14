/**
 * mockData.ts — solo datos estáticos que NO vienen de la API.
 *
 * Eliminados: seededOperator, materialTypes, routes, recyclers,
 *             balanceData, recyclerPayments, massBalanceData, inventoryData.
 * Todos esos datos ahora provienen del backend (/api/v1/).
 */

import type { InventoryItem, NavigationItem } from "../types/app";

// Claves de localStorage — sólo para tema (las de auth las gestiona api.ts)
export const themeStorageKey = "eca-management-theme";

// ── Navegación lateral ────────────────────────────────────────────────────────
export const navigation: NavigationItem[] = [
  { id: "dashboard", name: "Dashboard", icon: "dashboard" },
  { id: "recepcion", name: "Recepción", icon: "scale" },
  // { id: "inventario", name: "Inventario",         icon: "package"   },
  { id: "reportes", name: "Centro de Reportes", icon: "report" },
  { id: "historial", name: "Historial", icon: "history" },
];

