import { Icon, SummaryPanel } from "../components/AppUi";
import { balanceData, recyclerPayments } from "../data/mockData";
import type { ReportTotals } from "../types/app";
import { formatMoney, formatNumber } from "../utils/format";

type ReportesPageProps = {
  printPreview: boolean;
  reportPeriod: string;
  reportTotals: ReportTotals;
  onPrintPreviewChange: (value: boolean) => void;
  onReportPeriodChange: (value: string) => void;
  onExportSui: () => void;
  onExportPayments: () => void;
};

export function ReportesPage({
  printPreview,
  reportPeriod,
  reportTotals,
  onPrintPreviewChange,
  onReportPeriodChange,
  onExportSui,
  onExportPayments,
}: ReportesPageProps) {
  return (
    <section className={`view ${printPreview ? "print-preview" : ""}`}>
      <header className="view-header split">
        <div>
          <h1>Centro de Reportes</h1>
          <p>Generación de reportes para SuperServicios y gestión de pagos</p>
        </div>
        {!printPreview ? (
          <button
            type="button"
            className="button secondary"
            onClick={() => onPrintPreviewChange(true)}
          >
            <Icon name="printer" />
            Vista de Impresión
          </button>
        ) : (
          <button
            type="button"
            className="button secondary"
            onClick={() => onPrintPreviewChange(false)}
          >
            Volver al modo normal
          </button>
        )}
      </header>

      {!printPreview ? (
        <>
          <article className="panel filters-panel">
            <div className="report-toolbar">
              <div className="toolbar-label">
                <Icon name="filter" />
                <span>Período</span>
              </div>
              <select
                value={reportPeriod}
                onChange={(event) => onReportPeriodChange(event.target.value)}
              >
                <option value="daily">Diario</option>
                <option value="monthly">Mensual</option>
                <option value="quarterly">Trimestral</option>
                <option value="yearly">Anual</option>
              </select>
              <div className="date-chip">
                <Icon name="calendar" />
                Febrero 2026
              </div>
            </div>
          </article>

          <div className="stats-grid four">
            <SummaryPanel
              title="Material Ingresado"
              value={`${formatNumber(reportTotals.totalIngresado)} kg`}
            />
            <SummaryPanel
              title="Rechazos"
              value={`${formatNumber(reportTotals.totalRechazos)} kg`}
              subtitle={`${reportTotals.rejectionPercent}% del total`}
              accent="amber"
            />
            <SummaryPanel
              title="Aprovechado"
              value={`${formatNumber(reportTotals.totalAprovechado)} kg`}
              accent="green"
            />
            <SummaryPanel
              title="Eficiencia"
              value={`${(100 - Number.parseFloat(reportTotals.rejectionPercent)).toFixed(1)}%`}
              accent="gradient"
            />
          </div>
        </>
      ) : null}

      <article className="panel table-panel">
        <div className="panel-heading section-border">
          <h2 className="with-icon">
            <Icon name="scale" className="heading-icon" />
            Balance de Masas
          </h2>
          {!printPreview ? (
            <button type="button" className="button primary" onClick={onExportSui}>
              <Icon name="download" />
              Exportar para SUI
            </button>
          ) : null}
        </div>

        <div className="report-chart">
          {balanceData.map((item) => (
            <div key={item.material} className="report-row">
              <div className="report-row-label">{item.material}</div>
              <div className="report-bars">
                <span
                  className="report-bar incoming"
                  style={{ width: `${item.ingresado / 5}%` }}
                />
                <span
                  className="report-bar reject"
                  style={{ width: `${item.rechazos * 2}%` }}
                />
                <span
                  className="report-bar outgoing"
                  style={{ width: `${item.aprovechado / 5}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>MATERIAL</th>
                <th className="align-right">INGRESADO</th>
                <th className="align-right">RECHAZOS</th>
                <th className="align-right">APROVECHADO</th>
                <th className="align-right">% RECHAZO</th>
              </tr>
            </thead>
            <tbody>
              {balanceData.map((item) => (
                <tr key={item.material}>
                  <td>{item.material}</td>
                  <td className="align-right">
                    {formatNumber(item.ingresado)}
                  </td>
                  <td className="align-right text-amber">
                    {formatNumber(item.rechazos)}
                  </td>
                  <td className="align-right text-green">
                    {formatNumber(item.aprovechado)}
                  </td>
                  <td className="align-right">
                    {((item.rechazos / item.ingresado) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
              <tr className="table-total">
                <td>TOTAL</td>
                <td className="align-right">
                  {formatNumber(reportTotals.totalIngresado)}
                </td>
                <td className="align-right">
                  {formatNumber(reportTotals.totalRechazos)}
                </td>
                <td className="align-right">
                  {formatNumber(reportTotals.totalAprovechado)}
                </td>
                <td className="align-right">
                  {reportTotals.rejectionPercent}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <article className="panel table-panel">
        <div className="panel-heading section-border">
          <h2 className="with-icon">
            <Icon name="user" className="heading-icon" />
            Resumen de Pagos a Recicladores
          </h2>
          {!printPreview ? (
            <button
              type="button"
              className="button secondary"
              onClick={onExportPayments}
            >
              <Icon name="download" />
              Exportar Resumen
            </button>
          ) : null}
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>RECICLADOR</th>
                <th className="align-right">TONELADAS</th>
                <th className="align-right">PAGO</th>
                <th className="align-right">EFICIENCIA</th>
              </tr>
            </thead>
            <tbody>
              {recyclerPayments.map((item) => (
                <tr key={item.name}>
                  <td>{item.name}</td>
                  <td className="align-right">{item.tons.toFixed(2)} t</td>
                  <td className="align-right">{formatMoney(item.payments)}</td>
                  <td className="align-right">{item.efficiency}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
