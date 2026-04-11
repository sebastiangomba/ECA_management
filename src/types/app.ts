// Re-exportar tipos de API para uso en componentes
export type {
  ApiUser,
  ApiReciclador,
  ApiVehiculo,
  ApiRuta,
  ApiMaterial,
  ApiDetalleIngreso,
  ApiIngreso,
  ApiDashboardStats,
} from '../services/api';

// ============================================================
// NAVEGACIÓN Y VISTAS
// ============================================================

export type ViewId =
  | "dashboard"
  | "recepcion"
  | "inventario"
  | "reportes"
  | "historial";

export type IconName =
  | "dashboard"
  | "scale"
  | "package"
  | "report"
  | "history"
  | "wifi"
  | "wifiOff"
  | "message"
  | "search"
  | "filter"
  | "calendar"
  | "user"
  | "location"
  | "warning"
  | "download"
  | "printer"
  | "send"
  | "check"
  | "refresh"
  | "truck"
  | "trendUp"
  | "trendDown"
  | "bar"
  | "mail"
  | "lock"
  | "logout"
  | "idCard"
  | "sun"
  | "moon"
  | "plus"
  | "close"
  | "back";

export type NavigationItem = {
  id: ViewId;
  name: string;
  icon: IconName;
};

// ============================================================
// FLUJO DE INGRESO (sesión local en RecepcionPage)
// ============================================================

/** Un ítem de material dentro de la sesión de ingreso activa */
export type SessionItem = {
  /** ID temporal del lado del cliente — para key de React */
  clientId: string;
  materialId: string;
  materialNombre: string;
  materialCodigo: string;
  /** precio_kg como número (viene como string del API) */
  materialPrecioKg: number;
  pesoTotal: number;
  pesoRechazado: number;
  /** pesoTotal - pesoRechazado */
  pesoRecibido: number;
  /** true = rechazo por contaminación del generador → reciclador cobra el total */
  aplicaTarifa: boolean;
  /** si aplicaTarifa: pesoRecibido, si no: 0 */
  pesoTarifa: number;
  /** pesoTarifa × materialPrecioKg */
  subtotalPago: number;
};

export type IngresoStep = 'iniciar' | 'materiales' | 'recibo';

// ============================================================
// NOTIFICACIONES
// ============================================================

export type Notice = {
  id: number;
  type: "success" | "error" | "info";
  message: string;
};

// ============================================================
// AUTH (legacy — mantenido para compatibilidad con AuthScreen)
// ============================================================

export type AuthMode = "login";

// ============================================================
// UI HELPERS
// ============================================================

export type TrendType = "up" | "down" | "neutral";
export type SummaryAccent = "amber" | "green" | "gradient";
export type LegendTone = "incoming" | "outgoing" | "reject" | "violet";

// ============================================================
// INVENTARIO (aún en mock — sin modelo backend todavía)
// ============================================================

export type InventoryItem = {
  code: string;
  name: string;
  stock: number;
  unit: string;
  status: "critical" | "low" | "medium" | "high";
  lastUpdate: string;
};

export type InventoryTotals = {
  totalStock: number;
  criticalItems: number;
};

// ============================================================
// REPORTES (aún en mock)
// ============================================================

export type BalanceRow = {
  material: string;
  ingresado: number;
  rechazos: number;
  aprovechado: number;
};

export type RecyclerPayment = {
  name: string;
  tons: number;
  payments: number;
  efficiency: number;
};

export type ReportTotals = {
  totalIngresado: number;
  totalRechazos: number;
  totalAprovechado: number;
  rejectionPercent: string;
};
