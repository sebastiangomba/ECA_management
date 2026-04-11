/**
 * HistorialPage — historial de ingresos cargado desde la API.
 * Reemplaza la versión anterior que usaba transactions de localStorage.
 */
import { useEffect, useMemo, useRef, useState } from "react";

import { EmptyState, Icon, InfoBlock, SummaryPanel } from "../components/AppUi";
import { ApiError, getIngresos, type ApiIngreso } from "../services/api";
import { downloadCsv, formatCOP, formatNumber } from "../utils/format";

export function HistorialPage() {
  const [ingresos,   setIngresos]   = useState<ApiIngreso[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page,       setPage]       = useState(1);

  // Filtros locales (sobre los resultados de la página actual)
  const [searchQuery, setSearchQuery]   = useState('');
  const [filterDate,  setFilterDate]    = useState('all');

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Cargar ingresos con debounce en búsqueda
  useEffect(() => {
    clearTimeout(searchTimeoutRef.current);
    setLoading(true);
    searchTimeoutRef.current = setTimeout(() => {
      getIngresos({ search: searchQuery || undefined, page })
        .then((res) => {
          setIngresos(res.results);
          setTotalCount(res.count);
          setError(null);
        })
        .catch((err) => {
          const msg = err instanceof ApiError ? err.userMessage : 'Error cargando historial.';
          setError(msg);
        })
        .finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchQuery, page]);

  // Filtro por fecha en el cliente (sobre la página actual)
  const filteredIngresos = useMemo(() => {
    if (filterDate === 'all') return ingresos;
    const now  = new Date();
    return ingresos.filter((ing) => {
      const d = new Date(ing.fecha);
      const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      if (filterDate === 'today')  return d.toDateString() === now.toDateString();
      if (filterDate === 'week')   return diffDays <= 7;
      if (filterDate === 'month')  return diffDays <= 31;
      return true;
    });
  }, [ingresos, filterDate]);

  // Totales de la página filtrada
  const totalPesoRecibido = filteredIngresos.reduce((s, i) => s + parseFloat(i.peso_recibido),  0);
  const totalPesoTotal    = filteredIngresos.reduce((s, i) => s + parseFloat(i.peso_total),     0);
  const totalPago         = filteredIngresos.reduce((s, i) => s + i.total_pago,                 0);

  const exportar = () => {
    const rows: Array<Array<string | number>> = [
      ['ID', 'Fecha', 'Hora', 'Reciclador', 'Ruta', 'Vehículo', 'Peso Total (kg)',
       'Rechazado (kg)', 'Recibido (kg)', 'Pago Total (COP)', 'Estado'],
    ];
    filteredIngresos.forEach((i) => {
      rows.push([
        i.ingreso_id.slice(0, 8).toUpperCase(),
        i.fecha,
        i.hora.slice(0, 5),
        i.reciclador_nombre,
        i.ruta_nombre,
        i.vehiculo_id_field,
        parseFloat(i.peso_total).toFixed(3),
        parseFloat(i.peso_rechazado).toFixed(3),
        parseFloat(i.peso_recibido).toFixed(3),
        i.total_pago.toFixed(0),
        i.estado,
      ]);
    });
    downloadCsv(`historial_ingresos_${new Date().toISOString().split('T')[0]}.csv`, rows);
  };

  const totalPages = Math.ceil(totalCount / 20);

  return (
    <section className="view">
      <header className="view-header split">
        <div>
          <h1>Historial de Ingresos</h1>
          <p>Registro completo de todas las operaciones de recepción</p>
        </div>
        <button type="button" className="button primary" onClick={exportar} disabled={loading}>
          <Icon name="download" />
          Exportar CSV
        </button>
      </header>

      {/* ── Totales ───────────────────────────────────────────────────────── */}
      <div className="stats-grid three">
        <SummaryPanel
          title="Ingresos Mostrados"
          value={String(filteredIngresos.length)}
          icon="history"
        />
        <SummaryPanel
          title="Peso Total"
          value={`${formatNumber(Math.round(totalPesoTotal))} kg`}
          icon="scale"
        />
        <SummaryPanel
          title="Pago Estimado"
          value={formatCOP(totalPago)}
          subtitle={`Recibido: ${formatNumber(Math.round(totalPesoRecibido))} kg`}
          accent="green"
          icon="package"
        />
      </div>

      {/* ── Filtros ────────────────────────────────────────────────────────── */}
      <article className="panel filters-panel">
        <div className="filters-grid three-col">
          <label className="search-field">
            <Icon name="search" className="field-icon" />
            <input
              type="text"
              placeholder="Buscar por reciclador o documento..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            />
          </label>

          <label className="select-field">
            <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)}>
              <option value="all">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
            </select>
          </label>

          {loading ? (
            <span className="loading-inline">
              <Icon name="refresh" className="spin" /> Cargando...
            </span>
          ) : (
            <span className="count-label">{totalCount} registros en total</span>
          )}
        </div>
      </article>

      {/* ── Error ──────────────────────────────────────────────────────────── */}
      {error ? (
        <div className="panel alert-panel">
          <Icon name="warning" />
          <p>{error}</p>
        </div>
      ) : null}

      {/* ── Lista de ingresos ─────────────────────────────────────────────── */}
      <article className="panel table-panel">
        <div className="panel-heading section-border">
          <h2>Ingresos Registrados</h2>
        </div>

        {!loading && filteredIngresos.length === 0 ? (
          <EmptyState
            icon="history"
            title="No hay ingresos registrados"
            text="Los ingresos aparecerán aquí después de registrar recepciones de material."
          />
        ) : (
          <div className="history-list">
            {filteredIngresos.map((ing) => (
              <HistorialCard key={ing.ingreso_id} ingreso={ing} />
            ))}
          </div>
        )}
      </article>

      {/* ── Paginación ────────────────────────────────────────────────────── */}
      {totalPages > 1 ? (
        <div className="pagination">
          <button
            type="button"
            className="button secondary"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            <Icon name="back" /> Anterior
          </button>
          <span>Página {page} de {totalPages}</span>
          <button
            type="button"
            className="button secondary"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
          >
            Siguiente <Icon name="trendUp" />
          </button>
        </div>
      ) : null}
    </section>
  );
}

// ── Tarjeta de ingreso individual ─────────────────────────────────────────────

function HistorialCard({ ingreso }: { ingreso: ApiIngreso }) {
  const [expanded, setExpanded] = useState(false);

  const pesoRecibido = parseFloat(ingreso.peso_recibido);
  const pesoTotal    = parseFloat(ingreso.peso_total);
  const pesoRechazo  = parseFloat(ingreso.peso_rechazado);

  const estadoBadgeClass =
    ingreso.estado === 'liquidado'   ? 'badge-green'  :
    ingreso.estado === 'clasificado' ? 'badge-amber'  : 'badge-gray';

  return (
    <div className="history-card">
      <div className="history-top">
        <span className="transaction-badge">#{ingreso.ingreso_id.slice(0, 8).toUpperCase()}</span>
        <span className={`status-badge ${estadoBadgeClass}`}>{ingreso.estado}</span>
        <span className="history-date">
          <Icon name="calendar" />
          {ingreso.fecha} · {ingreso.hora.slice(0, 5)}
        </span>
      </div>

      <div className="history-grid">
        <InfoBlock icon="user"     label="Reciclador" value={ingreso.reciclador_nombre} />
        <InfoBlock icon="location" label="Ruta"        value={ingreso.ruta_nombre} />
        <InfoBlock icon="scale"    label="Peso total"  value={`${formatNumber(parseFloat(pesoTotal.toFixed(2)))} kg`} strong />
        <InfoBlock
          icon="scale"
          label="Pago estimado"
          value={formatCOP(ingreso.total_pago)}
          highlight
          extra={pesoRechazo > 0 ? `(Rechazo: ${pesoRecibido.toFixed(2)} kg recibidos)` : undefined}
        />
      </div>

      {/* Materiales detallados — colapsables */}
      <div className="history-footer">
        <span>{ingreso.detalles.length} material{ingreso.detalles.length !== 1 ? 'es' : ''}</span>
        <button
          type="button"
          className="button tertiary"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Ocultar detalle' : 'Ver detalle'}
        </button>
      </div>

      {expanded ? (
        <div className="history-detail">
          <table className="materials-table compact">
            <thead>
              <tr>
                <th>Material</th>
                <th className="num">Recibido</th>
                <th className="num">Rechazo</th>
                <th className="num">Precio/kg</th>
                <th className="num">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {ingreso.detalles.map((d) => (
                <tr key={d.detalle_id}>
                  <td>
                    <span className="mat-code">{d.material_codigo}</span>
                    {d.material_nombre}
                  </td>
                  <td className="num">{formatNumber(parseFloat(parseFloat(d.peso_recibido).toFixed(2)))} kg</td>
                  <td className="num warn">{formatNumber(parseFloat(parseFloat(d.peso_rechazado).toFixed(2)))} kg</td>
                  <td className="num">{formatCOP(parseFloat(d.material_precio_kg))}</td>
                  <td className="num accent">{formatCOP(d.subtotal_pago)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
