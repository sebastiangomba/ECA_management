/**
 * DashboardPage — KPIs y gráfico de balance de masas.
 * Datos cargados desde GET /api/v1/ingresos/stats/
 */
import { useEffect, useState } from "react";

import { Icon, LegendDot, MetricCard } from "../components/AppUi";
import {
  ApiError,
  getDashboardStats,
  type ApiDashboardStats,
} from "../services/api";
import { formatCOP, formatNumber } from "../utils/format";

export function DashboardPage() {
  const [stats, setStats] = useState<ApiDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((err) => {
        const msg =
          err instanceof ApiError
            ? err.userMessage
            : "Error cargando estadísticas.";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  const chartMax = stats?.balance_mensual.length
    ? Math.max(...stats.balance_mensual.map((m) => m.entrada), 1)
    : 1;

  return (
    <section className="view">
      <header className="view-header">
        <div>
          <h1>Dashboard de Gestión</h1>
          <p>Monitoreo en tiempo real de operaciones ECA</p>
        </div>
        {loading ? (
          <span className="loading-inline">
            <Icon name="refresh" className="spin" /> Actualizando...
          </span>
        ) : null}
      </header>

      {error ? (
        <div className="alert-panel panel">
          <Icon name="warning" />
          <p>{error}</p>
        </div>
      ) : null}

      {/* ── KPI Cards ────────────────────────────────────────────────────── */}
      <div className="stats-grid four">
        <MetricCard
          title="Balance de Masa"
          value={
            loading
              ? "—"
              : `${formatNumber(stats?.total_peso_recibido ?? 0)} kg`
          }
          detail={`De ${formatNumber(stats?.total_peso_entrante ?? 0)} kg ingresados`}
          trend={stats ? `${stats.total_ingresos} ingresos totales` : ""}
          trendType="up"
          icon="scale"
        />
        <MetricCard
          title="% Rechazo"
          value={loading ? "—" : `${stats?.porc_rechazo ?? 0}%`}
          detail={`${formatNumber(stats?.total_peso_rechazado ?? 0)} kg rechazados`}
          trend="Balance de masas SUI"
          trendType="neutral"
          icon="warning"
        />
        <MetricCard
          title="Recicladores Activos"
          value={loading ? "—" : String(stats?.recicladores_activos_mes ?? 0)}
          detail="Con ingresos este mes"
          trend="+3 nuevos este mes"
          trendType="up"
          icon="user"
        />
        <MetricCard
          title="Ingresos Hoy"
          value={loading ? "—" : String(stats?.ingresos_hoy ?? 0)}
          detail={
            loading ? "" : `Pago mes: ${formatCOP(stats?.total_pago_mes ?? 0)}`
          }
          trend="Transacciones del día"
          trendType="neutral"
          icon="truck"
        />
      </div>

      {/* ── Gráfico Balance de Masas ─────────────────────────────────────── */}
      <div className="charts-grid">
        <article className="panel chart-panel wide">
          <div className="panel-heading">
            <div>
              <h2>Balance de Masas</h2>
              <p>Material entrante, saliente y rechazo por mes</p>
            </div>
          </div>

          {loading ? (
            <div className="chart-loading">
              <Icon name="refresh" className="spin" />
            </div>
          ) : stats?.balance_mensual.length ? (
            <div className="simple-chart" aria-label="Balance de masas mensual">
              {stats.balance_mensual.map((item) => (
                <div key={item.month} className="bar-group">
                  <div className="bars">
                    <span
                      className="bar incoming"
                      style={{ height: `${(item.entrada / chartMax) * 100}%` }}
                    />
                    <span
                      className="bar outgoing"
                      style={{ height: `${(item.salida / chartMax) * 100}%` }}
                    />
                    <span
                      className="bar reject"
                      style={{ height: `${(item.rechazo / chartMax) * 100}%` }}
                    />
                  </div>
                  <span className="bar-label">{item.month}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-chart">Sin datos de balance mensual aún.</p>
          )}

          <div className="chart-legend">
            <LegendDot tone="incoming" label="Entrante" />
            <LegendDot tone="outgoing" label="Saliente" />
            <LegendDot tone="reject" label="Rechazo" />
          </div>
        </article>

        <article className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <h2>Pagos del Mes</h2>
              <p>Total estimado a recicladores</p>
            </div>
          </div>
          <div className="donut-wrap">
            <div className="donut-chart">
              <div className="donut-center">
                <strong>
                  {loading ? "—" : formatCOP(stats?.total_pago_mes ?? 0)}
                </strong>
                <span>Este mes</span>
              </div>
            </div>
            <div className="distribution-list">
              {(
                [
                  {
                    label: "Plástico PET",
                    value: "≈ $900/kg",
                    tone: "incoming",
                  },
                  { label: "Aluminio", value: "≈ $2500/kg", tone: "outgoing" },
                  { label: "Metal", value: "≈ $1200/kg", tone: "violet" },
                  { label: "Cartón/Papel", value: "≈ $350/kg", tone: "reject" },
                ] as const
              ).map((item) => (
                <div key={item.label} className="distribution-item">
                  <LegendDot tone={item.tone} label={item.label} />
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
