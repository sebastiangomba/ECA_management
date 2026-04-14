/**
 * Cliente API para ECA Zipaquirá.
 * Gestiona autenticación JWT, refresh automático y todas las llamadas REST.
 * Usar fetch nativo — sin dependencias externas.
 */

const API_ROOT = 'http://localhost:8000/api/v1';
const AUTH_ROOT = 'http://localhost:8000/api/v1/auth';

export const ACCESS_TOKEN_KEY  = 'eca-jwt-access';
export const REFRESH_TOKEN_KEY = 'eca-jwt-refresh';
export const USER_PROFILE_KEY  = 'eca-user-profile';

// ============================================================
// Tipos de dominio — espejo de los modelos Django
// ============================================================

export type ApiUser = {
  id: string;
  email: string;
  nombre: string;
  rol: 'operario' | 'supervisor' | 'administrador';
  num_documento: string | null;
  is_active: boolean;
};

export type ApiReciclador = {
  reciclador_id: string;
  nombre: string;
  num_documento: string;
  genero: string | null;
  telefono: string | null;
  activo: boolean;
  created_at: string;
};

export type ApiVehiculo = {
  vehiculo_id: string;
  reciclador: string;
  reciclador_nombre: string;
  identificador: string;
  tipo: string;
  descripcion: string | null;
  activo: boolean;
};

export type ApiRuta = {
  ruta_id: string;
  nombre: string;
  descripcion: string | null;
  activa: boolean;
};

export type ApiMaterial = {
  material_id: string;
  codigo: string;
  nombre: string;
  precio_kg: string; // DecimalField llega como string desde DRF
  categoria_sui: string;
  activo: boolean;
};

export type ApiDetalleIngreso = {
  detalle_id: string;
  ingreso: string;
  material: string;
  material_nombre: string;
  material_codigo: string;
  material_precio_kg: string;
  peso_total: string;
  peso_rechazado: string;
  peso_recibido: string;
  peso_tarifa: string;
  subtotal_pago: number;
};

export type ApiIngreso = {
  ingreso_id: string;
  reciclador: string;
  reciclador_nombre: string;
  vehiculo: string;
  vehiculo_id_field: string;
  ruta: string;
  ruta_nombre: string;
  operador: string;
  operador_nombre: string;
  liquidacion: string | null;
  usuario: string;
  fecha: string;
  hora: string;
  peso_total: string;
  peso_rechazado: string;
  peso_recibido: string;
  peso_tarifa: string;
  estado: 'pendiente' | 'clasificado' | 'liquidado';
  created_at: string;
  detalles: ApiDetalleIngreso[];
  total_pago: number;
};

export type ApiDashboardStats = {
  total_peso_entrante: number;
  total_peso_rechazado: number;
  total_peso_recibido: number;
  porc_rechazo: number;
  recicladores_activos_mes: number;
  ingresos_hoy: number;
  total_pago_mes: number;
  total_ingresos: number;
  balance_mensual: Array<{
    month: string;
    entrada: number;
    salida: number;
    rechazo: number;
  }>;
};

export type ApiReportesData = {
  periodo: { inicio: string; fin: string };
  balance_materiales: Array<{
    material: string;
    ingresado: number;
    rechazos: number;
    aprovechado: number;
    total_pago: number;
    num_ingresos: number;
  }>;
  pagos_recicladores: Array<{
    nombre: string;
    kg_recibido: number;
    total_pago: number;
    eficiencia: number;
    num_ingresos: number;
  }>;
  por_ruta: Array<{
    ruta: string;
    kg_ingresado: number;
    kg_rechazado: number;
    kg_recibido: number;
    total_pago: number;
    num_ingresos: number;
  }>;
  por_vehiculo: Array<{
    vehiculo: string;
    kg_ingresado: number;
    kg_rechazado: number;
    kg_recibido: number;
    total_pago: number;
    num_ingresos: number;
  }>;
};

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

// Payload para crear un ingreso
export type CreateDetallePayload = {
  material: string;       // UUID del material
  peso_total: number;
  peso_rechazado: number;
  peso_tarifa: number;
};

export type CreateIngresoPayload = {
  reciclador: string;
  vehiculo: string;
  ruta: string;
  operador: string;
  usuario: string;
  detalles: CreateDetallePayload[];
};

// ============================================================
// Manejo de errores
// ============================================================

export class ApiError extends Error {
  readonly status: number;
  readonly data: Record<string, unknown>;

  constructor(
    status: number,
    data: Record<string, unknown>,
  ) {
    super(`API ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }

  /** Extrae el primer mensaje de error legible para mostrar al usuario. */
  get userMessage(): string {
    if (typeof this.data['detail'] === 'string') return this.data['detail'];
    if (typeof this.data['error'] === 'string')  return this.data['error'];
    const values = Object.values(this.data);
    if (values.length > 0) {
      const first = values[0];
      if (Array.isArray(first) && typeof first[0] === 'string') return first[0];
      if (typeof first === 'string') return first;
    }
    return `Error del servidor (${this.status})`;
  }
}

// ============================================================
// Helpers de token
// ============================================================

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_PROFILE_KEY);
}

function saveTokens(access: string, refresh: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

async function tryRefresh(): Promise<boolean> {
  const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refresh) return false;

  try {
    const res = await fetch(`${AUTH_ROOT}/token/refresh/`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ refresh }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { access: string };
    localStorage.setItem(ACCESS_TOKEN_KEY, data.access);
    return true;
  } catch {
    return false;
  }
}

// ============================================================
// Función base de request
// ============================================================

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(`${API_ROOT}${path}`, { ...options, headers });

  // Token expirado — intentar refresh una vez
  if (res.status === 401 && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request<T>(path, options, false);
    }
    clearTokens();
    throw new ApiError(401, { detail: 'Sesión expirada. Por favor inicia sesión nuevamente.' });
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: 'Error desconocido' })) as Record<string, unknown>;
    throw new ApiError(res.status, errData);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ============================================================
// AUTH
// ============================================================

export async function loginByDocumento(
  num_documento: string,
  password: string,
): Promise<ApiUser> {
  const res = await fetch(`${AUTH_ROOT}/token/documento/`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ num_documento, password }),
  });

  const data = await res.json() as Record<string, unknown>;

  if (!res.ok) {
    throw new ApiError(res.status, data);
  }

  const { access, refresh, user } = data as {
    access: string;
    refresh: string;
    user: ApiUser;
  };

  saveTokens(access, refresh);
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(user));
  return user;
}

export function logout(): void {
  clearTokens();
}

export function getStoredUser(): ApiUser | null {
  const raw = localStorage.getItem(USER_PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ApiUser;
  } catch {
    return null;
  }
}

// ============================================================
// RECICLADORES
// ============================================================

export async function getRecicladores(search?: string): Promise<PaginatedResponse<ApiReciclador>> {
  const params = new URLSearchParams({ activo: 'true', page_size: '100' });
  if (search) params.set('search', search);
  return request<PaginatedResponse<ApiReciclador>>(`/recicladores/?${params}`);
}

export async function getVehiculosByReciclador(recicladorId: string): Promise<ApiVehiculo[]> {
  return request<ApiVehiculo[]>(`/recicladores/${recicladorId}/vehiculos/`);
}

// ============================================================
// RUTAS
// ============================================================

export async function getRutas(): Promise<PaginatedResponse<ApiRuta>> {
  return request<PaginatedResponse<ApiRuta>>('/rutas/?activa=true&page_size=100');
}

// ============================================================
// MATERIALES
// ============================================================

export async function getMateriales(): Promise<PaginatedResponse<ApiMaterial>> {
  return request<PaginatedResponse<ApiMaterial>>('/materiales/?activo=true&page_size=100');
}

// ============================================================
// INGRESOS
// ============================================================

export async function createIngreso(payload: CreateIngresoPayload): Promise<ApiIngreso> {
  return request<ApiIngreso>('/ingresos/', {
    method: 'POST',
    body:   JSON.stringify(payload),
  });
}

export async function getIngresos(params?: {
  search?: string;
  fecha?: string;
  reciclador?: string;
  page?: number;
}): Promise<PaginatedResponse<ApiIngreso>> {
  const p = new URLSearchParams({ page_size: '20' });
  if (params?.search)     p.set('search',     params.search);
  if (params?.fecha)      p.set('fecha',       params.fecha);
  if (params?.reciclador) p.set('reciclador',  params.reciclador);
  if (params?.page)       p.set('page',        String(params.page));
  return request<PaginatedResponse<ApiIngreso>>(`/ingresos/?${p}`);
}

// ============================================================
// DASHBOARD
// ============================================================

export async function getDashboardStats(): Promise<ApiDashboardStats> {
  return request<ApiDashboardStats>('/ingresos/stats/');
}

// ============================================================
// REPORTES
// ============================================================

export async function getReportesData(
  fechaInicio: string,
  fechaFin: string,
): Promise<ApiReportesData> {
  const p = new URLSearchParams({ fecha_inicio: fechaInicio, fecha_fin: fechaFin });
  return request<ApiReportesData>(`/ingresos/reportes/?${p}`);
}
