import { useState } from "react";

import { Icon } from "../components/AppUi";
import { type ApiReportesData, getReportesData } from "../services/api";
import type { IconName } from "../types/app";
import { downloadCsv, formatMoney, formatNumber } from "../utils/format";

// ── Definición del catálogo ───────────────────────────────────────────────────

type ReportId = "sui" | "pagos" | "consolidado" | "por_ruta" | "por_vehiculo";

type ReportDef = {
  id: ReportId;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  icon: IconName;
  tag?: string;
};

const CATALOG: ReportDef[] = [
  {
    id: "sui",
    titulo: "Reporte SUI",
    subtitulo: "Formato 13 y 14 · Res. 754/2014",
    descripcion:
      "Balance de masas por tipo de material. Requerido mensualmente por la Superintendencia de Servicios Públicos.",
    icon: "report",
    tag: "Legal obligatorio",
  },
  {
    id: "pagos",
    titulo: "Pagos a Recicladores",
    subtitulo: "Liquidación por período",
    descripcion:
      "Total pagado a cada reciclador en el período seleccionado, desglosado por kilogramos recibidos y eficiencia.",
    icon: "user",
  },
  {
    id: "consolidado",
    titulo: "Consolidado de Materiales",
    subtitulo: "Balance completo + pagos por material",
    descripcion:
      "Resumen integral de cada material: peso ingresado, rechazos, aprovechado y el pago generado en el período.",
    icon: "package",
  },
  {
    id: "por_ruta",
    titulo: "Reporte por Ruta",
    subtitulo: "Desempeño por zona de recolección",
    descripcion:
      "Totales de ingreso, rechazo y pago agrupados por ruta. Permite evaluar el desempeño de cada zona.",
    icon: "location",
  },
  {
    id: "por_vehiculo",
    titulo: "Reporte por Vehículo",
    subtitulo: "Actividad por unidad de transporte",
    descripcion:
      "Kilogramos y pagos agrupados por vehículo. Trazabilidad completa de cada unidad registrada.",
    icon: "truck",
  },
];

// ── Helpers de fecha ──────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function firstOfMonthStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

// ── Sub-componentes de tabla ──────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return <p className="empty-state-inline">{message}</p>;
}

function TablaSui({
  rows,
}: {
  rows: ApiReportesData["balance_materiales"];
}) {
  const total_ingresado   = rows.reduce((s, r) => s + r.ingresado,   0);
  const total_rechazos    = rows.reduce((s, r) => s + r.rechazos,    0);
  const total_aprovechado = rows.reduce((s, r) => s + r.aprovechado, 0);
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>MATERIAL</th>
            <th className="align-right">INGRESADO (kg)</th>
            <th className="align-right">RECHAZOS (kg)</th>
            <th className="align-right">APROVECHADO (kg)</th>
            <th className="align-right">% RECHAZO</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.material}>
              <td>{r.material}</td>
              <td className="align-right">{formatNumber(r.ingresado)}</td>
              <td className="align-right text-amber">{formatNumber(r.rechazos)}</td>
              <td className="align-right text-green">{formatNumber(r.aprovechado)}</td>
              <td className="align-right">
                {r.ingresado > 0 ? ((r.rechazos / r.ingresado) * 100).toFixed(1) : "0.0"}%
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="table-total">
            <td>TOTAL</td>
            <td className="align-right">{formatNumber(total_ingresado)}</td>
            <td className="align-right">{formatNumber(total_rechazos)}</td>
            <td className="align-right">{formatNumber(total_aprovechado)}</td>
            <td className="align-right">
              {total_ingresado > 0
                ? ((total_rechazos / total_ingresado) * 100).toFixed(1)
                : "0.0"}%
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function TablaPagos({
  rows,
}: {
  rows: ApiReportesData["pagos_recicladores"];
}) {
  const total_pago = rows.reduce((s, r) => s + r.total_pago, 0);
  const total_kg   = rows.reduce((s, r) => s + r.kg_recibido, 0);
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>RECICLADOR</th>
            <th className="align-right">INGRESOS</th>
            <th className="align-right">KG RECIBIDOS</th>
            <th className="align-right">EFICIENCIA</th>
            <th className="align-right">PAGO TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.nombre}>
              <td>{r.nombre}</td>
              <td className="align-right">{r.num_ingresos}</td>
              <td className="align-right">{formatNumber(r.kg_recibido)} kg</td>
              <td className="align-right">{r.eficiencia}%</td>
              <td className="align-right text-green">{formatMoney(r.total_pago)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="table-total">
            <td>TOTAL</td>
            <td className="align-right">{rows.reduce((s, r) => s + r.num_ingresos, 0)}</td>
            <td className="align-right">{formatNumber(total_kg)} kg</td>
            <td className="align-right">—</td>
            <td className="align-right">{formatMoney(total_pago)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function TablaConsolidado({
  rows,
}: {
  rows: ApiReportesData["balance_materiales"];
}) {
  const total_ingresado   = rows.reduce((s, r) => s + r.ingresado,   0);
  const total_rechazos    = rows.reduce((s, r) => s + r.rechazos,    0);
  const total_aprovechado = rows.reduce((s, r) => s + r.aprovechado, 0);
  const total_pago        = rows.reduce((s, r) => s + r.total_pago,  0);
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>MATERIAL</th>
            <th className="align-right">INGRESADO (kg)</th>
            <th className="align-right">RECHAZOS (kg)</th>
            <th className="align-right">APROVECHADO (kg)</th>
            <th className="align-right">% RECHAZO</th>
            <th className="align-right">PAGO GENERADO</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.material}>
              <td>{r.material}</td>
              <td className="align-right">{formatNumber(r.ingresado)}</td>
              <td className="align-right text-amber">{formatNumber(r.rechazos)}</td>
              <td className="align-right">{formatNumber(r.aprovechado)}</td>
              <td className="align-right">
                {r.ingresado > 0 ? ((r.rechazos / r.ingresado) * 100).toFixed(1) : "0.0"}%
              </td>
              <td className="align-right text-green">{formatMoney(r.total_pago)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="table-total">
            <td>TOTAL</td>
            <td className="align-right">{formatNumber(total_ingresado)}</td>
            <td className="align-right">{formatNumber(total_rechazos)}</td>
            <td className="align-right">{formatNumber(total_aprovechado)}</td>
            <td className="align-right">
              {total_ingresado > 0
                ? ((total_rechazos / total_ingresado) * 100).toFixed(1)
                : "0.0"}%
            </td>
            <td className="align-right">{formatMoney(total_pago)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function TablaRuta({ rows }: { rows: ApiReportesData["por_ruta"] }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>RUTA</th>
            <th className="align-right">INGRESOS</th>
            <th className="align-right">KG INGRESADOS</th>
            <th className="align-right">KG RECHAZADOS</th>
            <th className="align-right">KG RECIBIDOS</th>
            <th className="align-right">PAGO TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.ruta}>
              <td>{r.ruta}</td>
              <td className="align-right">{r.num_ingresos}</td>
              <td className="align-right">{formatNumber(r.kg_ingresado)} kg</td>
              <td className="align-right text-amber">{formatNumber(r.kg_rechazado)} kg</td>
              <td className="align-right text-green">{formatNumber(r.kg_recibido)} kg</td>
              <td className="align-right">{formatMoney(r.total_pago)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="table-total">
            <td>TOTAL</td>
            <td className="align-right">{rows.reduce((s, r) => s + r.num_ingresos, 0)}</td>
            <td className="align-right">{formatNumber(rows.reduce((s, r) => s + r.kg_ingresado, 0))} kg</td>
            <td className="align-right">{formatNumber(rows.reduce((s, r) => s + r.kg_rechazado, 0))} kg</td>
            <td className="align-right">{formatNumber(rows.reduce((s, r) => s + r.kg_recibido,  0))} kg</td>
            <td className="align-right">{formatMoney(rows.reduce((s, r) => s + r.total_pago, 0))}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function TablaVehiculo({ rows }: { rows: ApiReportesData["por_vehiculo"] }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>VEHÍCULO</th>
            <th className="align-right">INGRESOS</th>
            <th className="align-right">KG INGRESADOS</th>
            <th className="align-right">KG RECHAZADOS</th>
            <th className="align-right">KG RECIBIDOS</th>
            <th className="align-right">PAGO TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.vehiculo}>
              <td>{r.vehiculo}</td>
              <td className="align-right">{r.num_ingresos}</td>
              <td className="align-right">{formatNumber(r.kg_ingresado)} kg</td>
              <td className="align-right text-amber">{formatNumber(r.kg_rechazado)} kg</td>
              <td className="align-right text-green">{formatNumber(r.kg_recibido)} kg</td>
              <td className="align-right">{formatMoney(r.total_pago)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="table-total">
            <td>TOTAL</td>
            <td className="align-right">{rows.reduce((s, r) => s + r.num_ingresos, 0)}</td>
            <td className="align-right">{formatNumber(rows.reduce((s, r) => s + r.kg_ingresado, 0))} kg</td>
            <td className="align-right">{formatNumber(rows.reduce((s, r) => s + r.kg_rechazado, 0))} kg</td>
            <td className="align-right">{formatNumber(rows.reduce((s, r) => s + r.kg_recibido,  0))} kg</td>
            <td className="align-right">{formatMoney(rows.reduce((s, r) => s + r.total_pago, 0))}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ── CSV export helpers ────────────────────────────────────────────────────────

function exportSui(data: ApiReportesData) {
  downloadCsv(`reporte_SUI_${data.periodo.fin}.csv`, [
    ["Material", "Ingresado (kg)", "Rechazos (kg)", "Aprovechado (kg)", "% Rechazo"],
    ...data.balance_materiales.map((r) => [
      r.material,
      r.ingresado.toFixed(3),
      r.rechazos.toFixed(3),
      r.aprovechado.toFixed(3),
      r.ingresado > 0 ? ((r.rechazos / r.ingresado) * 100).toFixed(2) : "0.00",
    ]),
  ]);
}

function exportPagos(data: ApiReportesData) {
  downloadCsv(`pagos_recicladores_${data.periodo.fin}.csv`, [
    ["Reciclador", "Ingresos", "Kg recibidos", "Eficiencia (%)", "Pago (COP)"],
    ...data.pagos_recicladores.map((r) => [
      r.nombre,
      r.num_ingresos,
      r.kg_recibido.toFixed(3),
      r.eficiencia,
      r.total_pago.toFixed(0),
    ]),
  ]);
}

function exportConsolidado(data: ApiReportesData) {
  downloadCsv(`consolidado_materiales_${data.periodo.fin}.csv`, [
    ["Material", "Ingresos", "Ingresado (kg)", "Rechazos (kg)", "Aprovechado (kg)", "% Rechazo", "Pago (COP)"],
    ...data.balance_materiales.map((r) => [
      r.material,
      r.num_ingresos,
      r.ingresado.toFixed(3),
      r.rechazos.toFixed(3),
      r.aprovechado.toFixed(3),
      r.ingresado > 0 ? ((r.rechazos / r.ingresado) * 100).toFixed(2) : "0.00",
      r.total_pago.toFixed(0),
    ]),
  ]);
}

function exportRuta(data: ApiReportesData) {
  downloadCsv(`reporte_por_ruta_${data.periodo.fin}.csv`, [
    ["Ruta", "Ingresos", "Kg ingresados", "Kg rechazados", "Kg recibidos", "Pago (COP)"],
    ...data.por_ruta.map((r) => [
      r.ruta,
      r.num_ingresos,
      r.kg_ingresado.toFixed(3),
      r.kg_rechazado.toFixed(3),
      r.kg_recibido.toFixed(3),
      r.total_pago.toFixed(0),
    ]),
  ]);
}

function exportVehiculo(data: ApiReportesData) {
  downloadCsv(`reporte_por_vehiculo_${data.periodo.fin}.csv`, [
    ["Vehículo", "Ingresos", "Kg ingresados", "Kg rechazados", "Kg recibidos", "Pago (COP)"],
    ...data.por_vehiculo.map((r) => [
      r.vehiculo,
      r.num_ingresos,
      r.kg_ingresado.toFixed(3),
      r.kg_rechazado.toFixed(3),
      r.kg_recibido.toFixed(3),
      r.total_pago.toFixed(0),
    ]),
  ]);
}

// ── Componente principal ──────────────────────────────────────────────────────

type ReportesPageProps = {
  printPreview: boolean;
  onPrintPreviewChange: (value: boolean) => void;
};

export function ReportesPage({ printPreview, onPrintPreviewChange }: ReportesPageProps) {
  const [activeId,    setActiveId]    = useState<ReportId | null>(null);
  const [fechaInicio, setFechaInicio] = useState(firstOfMonthStr);
  const [fechaFin,    setFechaFin]    = useState(todayStr);
  const [data,        setData]        = useState<ApiReportesData | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  const activeDef = activeId ? CATALOG.find((r) => r.id === activeId) ?? null : null;

  const handleSelectReport = (id: ReportId) => {
    if (id === activeId) return;
    setActiveId(id);
    setData(null);
    setError(null);
  };

  const handleBack = () => {
    setActiveId(null);
    setData(null);
    setError(null);
    onPrintPreviewChange(false);
  };

  const handleGenerar = async () => {
    if (!activeId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getReportesData(fechaInicio, fechaFin);
      setData(result);
    } catch {
      setError("No se pudieron cargar los datos para el período seleccionado.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!data || !activeId) return;
    const exportFns: Record<ReportId, (d: ApiReportesData) => void> = {
      sui:         exportSui,
      pagos:       exportPagos,
      consolidado: exportConsolidado,
      por_ruta:    exportRuta,
      por_vehiculo: exportVehiculo,
    };
    exportFns[activeId](data);
  };

  const hasData = data !== null;
  const isEmpty = (reportId: ReportId) => {
    if (!data) return false;
    const counts: Record<ReportId, number> = {
      sui:          data.balance_materiales.length,
      pagos:        data.pagos_recicladores.length,
      consolidado:  data.balance_materiales.length,
      por_ruta:     data.por_ruta.length,
      por_vehiculo: data.por_vehiculo.length,
    };
    return counts[reportId] === 0;
  };

  // ── Vista: catálogo ─────────────────────────────────────────────────────────
  if (!activeId) {
    return (
      <section className="view">
        <header className="view-header">
          <div>
            <h1>Centro de Reportes</h1>
            <p>Selecciona el tipo de reporte a generar</p>
          </div>
        </header>
        <div className="report-catalog">
          {CATALOG.map((def) => (
            <button
              key={def.id}
              type="button"
              className="report-card"
              onClick={() => handleSelectReport(def.id)}
            >
              <Icon name={def.icon} className="report-card-icon" />
              {def.tag ? <span className="report-card-tag">{def.tag}</span> : null}
              <p className="report-card-titulo">{def.titulo}</p>
              <p className="report-card-subtitulo">{def.subtitulo}</p>
              <p className="report-card-desc">{def.descripcion}</p>
            </button>
          ))}
        </div>
      </section>
    );
  }

  // ── Vista: reporte activo ───────────────────────────────────────────────────
  return (
    <section className={`view ${printPreview ? "print-preview" : ""}`}>
      {/* Encabezado */}
      <header className="view-header split">
        <div className="report-view-title">
          {!printPreview ? (
            <button type="button" className="button ghost small" onClick={handleBack}>
              <Icon name="back" />
              Catálogo
            </button>
          ) : null}
          <div>
            <h1 className="with-icon">
              <Icon name={activeDef!.icon} className="heading-icon" />
              {activeDef!.titulo}
            </h1>
            <p>{activeDef!.subtitulo}</p>
          </div>
        </div>
        <div className="report-header-actions">
          {!printPreview ? (
            <button
              type="button"
              className="button secondary"
              onClick={() => onPrintPreviewChange(true)}
              disabled={!hasData}
            >
              <Icon name="printer" />
              Imprimir
            </button>
          ) : (
            <button type="button" className="button secondary" onClick={() => onPrintPreviewChange(false)}>
              Salir de impresión
            </button>
          )}
        </div>
      </header>

      {/* Panel de configuración de período */}
      {!printPreview ? (
        <article className="panel form-panel report-config-panel">
          <div className="report-config-row">
            <div className="report-config-dates">
              <label className="report-date-field">
                <span>Fecha inicio</span>
                <input
                  type="date"
                  value={fechaInicio}
                  max={fechaFin}
                  onChange={(e) => { setFechaInicio(e.target.value); setData(null); }}
                />
              </label>
              <label className="report-date-field">
                <span>Fecha fin</span>
                <input
                  type="date"
                  value={fechaFin}
                  min={fechaInicio}
                  max={todayStr()}
                  onChange={(e) => { setFechaFin(e.target.value); setData(null); }}
                />
              </label>
            </div>
            <button
              type="button"
              className="button primary"
              onClick={handleGenerar}
              disabled={loading || !fechaInicio || !fechaFin}
            >
              {loading ? (
                <><Icon name="refresh" className="spin" /> Generando...</>
              ) : (
                <><Icon name="bar" /> Generar reporte</>
              )}
            </button>
            {hasData && !loading ? (
              <button
                type="button"
                className="button secondary"
                onClick={handleExport}
                disabled={isEmpty(activeId)}
              >
                <Icon name="download" />
                Exportar CSV
              </button>
            ) : null}
          </div>
        </article>
      ) : null}

      {/* Contenido del reporte */}
      <article className="panel table-panel">
        <div className="panel-heading section-border">
          <h2 className="with-icon">
            <Icon name={activeDef!.icon} className="heading-icon" />
            {activeDef!.titulo}
            {data ? (
              <span className="report-periodo-badge">
                {data.periodo.inicio} — {data.periodo.fin}
              </span>
            ) : null}
          </h2>
        </div>

        {!hasData && !loading ? (
          <div className="report-empty-cta">
            <Icon name={activeDef!.icon} className="report-empty-icon" />
            <p>Configura el período y presiona <strong>Generar reporte</strong></p>
          </div>
        ) : loading ? (
          <div className="loading-placeholder">
            <Icon name="refresh" className="spin" />
            <p>Generando reporte...</p>
          </div>
        ) : error ? (
          <div className="notice error" style={{ margin: "1rem 1.4rem" }}>{error}</div>
        ) : isEmpty(activeId) ? (
          <EmptyState message="Sin datos para el período seleccionado." />
        ) : (
          <>
            {activeId === "sui"         && <TablaSui         rows={data!.balance_materiales} />}
            {activeId === "pagos"       && <TablaPagos       rows={data!.pagos_recicladores} />}
            {activeId === "consolidado" && <TablaConsolidado rows={data!.balance_materiales} />}
            {activeId === "por_ruta"    && <TablaRuta        rows={data!.por_ruta}           />}
            {activeId === "por_vehiculo"&& <TablaVehiculo    rows={data!.por_vehiculo}        />}
          </>
        )}
      </article>
    </section>
  );
}
