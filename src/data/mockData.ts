import type {
  BalanceRow,
  InventoryItem,
  MassBalanceItem,
  MaterialType,
  NavigationItem,
  Recycler,
  RecyclerPayment,
  RouteItem,
  StoredUser,
} from "../types/app";

export const storageKey = "eca-management-transactions";
export const authUsersStorageKey = "eca-management-auth-users";
export const authSessionStorageKey = "eca-management-auth-session";

export const seededOperator: StoredUser = {
  id: "1047034711",
  fullName: "Sebastian Gomez Barraza",
  email: "segoba20@gmail.com",
  document: "1047034711",
  password: "123456",
  role: "Operador",
  createdAt: "2026-03-23T00:00:00.000Z",
};

export const materialTypes: MaterialType[] = [
  { code: "PET-01", name: "PET (Botellas Plásticas)", unit: "kg" },
  { code: "CART-01", name: "Cartón", unit: "kg" },
  { code: "PAP-01", name: "Papel de Archivo", unit: "kg" },
  { code: "SOPL-01", name: "Soplado", unit: "kg" },
  { code: "HDPE-01", name: "HDPE (Plástico Duro)", unit: "kg" },
  { code: "LDPE-01", name: "LDPE (Bolsas Plásticas)", unit: "kg" },
  { code: "ALU-01", name: "Aluminio (Latas)", unit: "kg" },
  { code: "VIDR-01", name: "Vidrio", unit: "kg" },
];

export const routes: RouteItem[] = [
  { id: "1", name: "Ruta 1 - Centro", zone: "Centro" },
  { id: "2", name: "Ruta 2 - Norte", zone: "Norte" },
  { id: "3", name: "Ruta 3 - Sur", zone: "Sur" },
  { id: "4", name: "Ruta 4 - Oriental", zone: "Oriental" },
  { id: "5", name: "Ruta 5 - Occidental", zone: "Occidental" },
];

export const recyclers: Recycler[] = [
  { id: "1", name: "Juan Carlos Pérez", document: "1234567890" },
  { id: "2", name: "María Elena Gómez", document: "0987654321" },
  { id: "3", name: "Pedro Antonio Martínez", document: "1122334455" },
  { id: "4", name: "Ana Lucía Rodríguez", document: "5566778899" },
  { id: "5", name: "Luis Fernando Castro", document: "9988776655" },
];

export const balanceData: BalanceRow[] = [
  { material: "PET", ingresado: 450, rechazos: 35, aprovechado: 415 },
  { material: "Cartón", ingresado: 380, rechazos: 25, aprovechado: 355 },
  { material: "Papel", ingresado: 280, rechazos: 20, aprovechado: 260 },
  { material: "Soplado", ingresado: 210, rechazos: 18, aprovechado: 192 },
  { material: "HDPE", ingresado: 165, rechazos: 12, aprovechado: 153 },
  { material: "LDPE", ingresado: 145, rechazos: 15, aprovechado: 130 },
  { material: "Aluminio", ingresado: 95, rechazos: 5, aprovechado: 90 },
  { material: "Vidrio", ingresado: 220, rechazos: 18, aprovechado: 202 },
];

export const recyclerPayments: RecyclerPayment[] = [
  { name: "Juan Carlos Pérez", tons: 2.45, payments: 850000, efficiency: 94 },
  { name: "María Elena Gómez", tons: 3.2, payments: 1120000, efficiency: 96 },
  {
    name: "Pedro Antonio Martínez",
    tons: 1.89,
    payments: 661500,
    efficiency: 92,
  },
  { name: "Ana Lucía Rodríguez", tons: 2.78, payments: 973000, efficiency: 95 },
  {
    name: "Luis Fernando Castro",
    tons: 0.98,
    payments: 343000,
    efficiency: 88,
  },
];

export const massBalanceData: MassBalanceItem[] = [
  { month: "Ene", entrada: 4500, salida: 4200, rechazo: 300 },
  { month: "Feb", entrada: 5200, salida: 4800, rechazo: 400 },
  { month: "Mar", entrada: 4800, salida: 4500, rechazo: 300 },
  { month: "Abr", entrada: 5500, salida: 5100, rechazo: 400 },
  { month: "May", entrada: 6000, salida: 5600, rechazo: 400 },
  { month: "Jun", entrada: 5800, salida: 5400, rechazo: 400 },
];

export const inventoryData: InventoryItem[] = [
  {
    code: "PET-01",
    name: "PET (Botellas Plásticas)",
    stock: 1250,
    unit: "kg",
    status: "high",
    lastUpdate: "Hace 2 horas",
  },
  {
    code: "CART-01",
    name: "Cartón",
    stock: 850,
    unit: "kg",
    status: "medium",
    lastUpdate: "Hace 5 horas",
  },
  {
    code: "PAP-01",
    name: "Papel de Archivo",
    stock: 320,
    unit: "kg",
    status: "low",
    lastUpdate: "Hace 1 hora",
  },
  {
    code: "SOPL-01",
    name: "Soplado",
    stock: 560,
    unit: "kg",
    status: "medium",
    lastUpdate: "Hace 3 horas",
  },
  {
    code: "HDPE-01",
    name: "HDPE (Plástico Duro)",
    stock: 420,
    unit: "kg",
    status: "medium",
    lastUpdate: "Hace 4 horas",
  },
  {
    code: "LDPE-01",
    name: "LDPE (Bolsas Plásticas)",
    stock: 180,
    unit: "kg",
    status: "low",
    lastUpdate: "Hace 6 horas",
  },
  {
    code: "ALU-01",
    name: "Aluminio (Latas)",
    stock: 95,
    unit: "kg",
    status: "critical",
    lastUpdate: "Hace 8 horas",
  },
  {
    code: "VIDR-01",
    name: "Vidrio",
    stock: 740,
    unit: "kg",
    status: "medium",
    lastUpdate: "Hace 2 horas",
  },
];

export const navigation: NavigationItem[] = [
  { id: "dashboard", name: "Dashboard", icon: "dashboard" },
  { id: "recepcion", name: "Recepción", icon: "scale" },
  { id: "inventario", name: "Inventario", icon: "package" },
  { id: "reportes", name: "Centro de Reportes", icon: "report" },
  { id: "historial", name: "Historial", icon: "history" },
];
