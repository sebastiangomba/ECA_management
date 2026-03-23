import { massBalanceData } from "../data/mockData";
import type { DashboardStats } from "../types/app";
import { formatNumber } from "../utils/format";
import { Icon, LegendDot, MetricCard } from "../components/AppUi";

export function DashboardPage({
  dashboardStats,
}: {
  dashboardStats: DashboardStats;
}) {
  return (
    <section className="view">
      <header className="view-header">
        <div>
          <h1>Dashboard de Gestión</h1>
          <p>Monitoreo en tiempo real de operaciones ECA</p>
        </div>
      </header>

      <div className="stats-grid four">
        <MetricCard
          title="Balance de Masa"
          value={`${formatNumber(dashboardStats.totalOutgoing)} kg`}
          detail={`De ${formatNumber(dashboardStats.totalIncoming)} kg ingresados`}
          trend="+12.5% este mes"
          trendType="up"
          icon="scale"
        />
        <MetricCard
          title="% Rechazo"
          value={`${dashboardStats.rejectionPercentage}%`}
          detail={`${formatNumber(dashboardStats.totalRejection)} kg rechazados`}
          trend="-2.1% vs mes anterior"
          trendType="down"
          icon="warning"
        />
        <MetricCard
          title="Recicladores Activos"
          value={String(dashboardStats.activeRecyclers)}
          detail="En las últimas 24 horas"
          trend="+3 nuevos este mes"
          trendType="up"
          icon="user"
        />
        <MetricCard
          title="Transacciones Hoy"
          value={String(dashboardStats.todayTransactions)}
          detail="Última hace 15 minutos"
          trend="320 kg procesados hoy"
          trendType="neutral"
          icon="truck"
        />
      </div>

      <div className="charts-grid">
        <article className="panel chart-panel wide">
          <div className="panel-heading">
            <div>
              <h2>Balance de Masas</h2>
              <p>Comparación entre material entrante, saliente y rechazo</p>
            </div>
          </div>
          <div className="simple-chart" aria-label="Balance de masas">
            {massBalanceData.map((item) => {
              const max = 6000;

              return (
                <div key={item.month} className="bar-group">
                  <div className="bars">
                    <span
                      className="bar incoming"
                      style={{ height: `${(item.entrada / max) * 100}%` }}
                    />
                    <span
                      className="bar outgoing"
                      style={{ height: `${(item.salida / max) * 100}%` }}
                    />
                    <span
                      className="bar reject"
                      style={{ height: `${(item.rechazo / max) * 100}%` }}
                    />
                  </div>
                  <span className="bar-label">{item.month}</span>
                </div>
              );
            })}
          </div>
          <div className="chart-legend">
            <LegendDot tone="incoming" label="Entrante" />
            <LegendDot tone="outgoing" label="Saliente" />
            <LegendDot tone="reject" label="Rechazo" />
          </div>
        </article>

        <article className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <h2>Distribución por Tipo</h2>
              <p>Material procesado este mes</p>
            </div>
          </div>
          <div className="donut-wrap">
            <div className="donut-chart">
              <div className="donut-center">
                <strong>6.6 t</strong>
                <span>Total</span>
              </div>
            </div>
            <div className="distribution-list">
              {([
                { label: "PET", value: "36%", tone: "incoming" },
                { label: "Cartón", value: "27%", tone: "outgoing" },
                { label: "Papel", value: "18%", tone: "violet" },
                { label: "Otros", value: "19%", tone: "reject" },
              ] as const).map((item) => (
                <div key={item.label} className="distribution-item">
                  <LegendDot tone={item.tone} label={item.label} />
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>

      <article className="panel alert-panel">
        <Icon name="warning" className="panel-alert-icon" />
        <div>
          <h3>Alerta de Coherencia</h3>
          <p>
            Sistema de trazabilidad activo. Todas las transacciones están siendo
            monitoreadas para garantizar coherencia entre registros físicos y
            digitales.
          </p>
        </div>
      </article>
    </section>
  );
}
