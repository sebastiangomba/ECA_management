export type ViewId =
  | "dashboard"
  | "recepcion"
  | "inventario"
  | "reportes"
  | "historial";

export type MaterialType = {
  code: string;
  name: string;
  unit: string;
};

export type RouteItem = {
  id: string;
  name: string;
  zone: string;
};

export type Recycler = {
  id: string;
  name: string;
  document: string;
};

export type Transaction = {
  id: string;
  recyclerId: string;
  recyclerName: string;
  routeId: string;
  routeName: string;
  materialCode: string;
  materialName: string;
  weight: number;
  rejection: number;
  timestamp: string;
};

export type InventoryItem = {
  code: string;
  name: string;
  stock: number;
  unit: string;
  status: "critical" | "low" | "medium" | "high";
  lastUpdate: string;
};

export type Notice = {
  id: number;
  type: "success" | "error" | "info";
  message: string;
};

export type AuthMode = "login" | "register";

export type StoredUser = {
  id: string;
  fullName: string;
  email: string;
  document: string;
  password: string;
  role: "Operador";
  createdAt: string;
};

export type AuthUser = Omit<StoredUser, "password">;

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

export type MassBalanceItem = {
  month: string;
  entrada: number;
  salida: number;
  rechazo: number;
};

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
  | "idCard";

export type NavigationItem = {
  id: ViewId;
  name: string;
  icon: IconName;
};

export type TrendType = "up" | "down" | "neutral";

export type SummaryAccent = "amber" | "green" | "gradient";

export type LegendTone = "incoming" | "outgoing" | "reject" | "violet";

export type DashboardStats = {
  totalIncoming: number;
  totalOutgoing: number;
  totalRejection: number;
  rejectionPercentage: string;
  activeRecyclers: number;
  todayTransactions: number;
};

export type InventoryTotals = {
  totalStock: number;
  criticalItems: number;
};

export type HistoryTotals = {
  totalWeight: number;
  totalRejection: number;
  netWeight: number;
};

export type ReportTotals = {
  totalIngresado: number;
  totalRechazos: number;
  totalAprovechado: number;
  rejectionPercent: string;
};
