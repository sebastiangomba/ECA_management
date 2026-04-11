/**
 * RecepcionPage — flujo de ingreso de material en 3 pasos.
 *
 * Paso 1 – INICIAR: seleccionar reciclador → vehículo → ruta → "Iniciar Ingreso"
 * Paso 2 – MATERIALES: agregar materiales uno a uno con peso, rechazo y tarifa
 * Paso 3 – RECIBO: recibo consolidado tras enviar a la API
 */
import { useEffect, useRef, useState } from "react";

import { Field, Icon } from "../components/AppUi";
import {
  ApiError,
  type ApiIngreso,
  type ApiMaterial,
  type ApiReciclador,
  type ApiRuta,
  type ApiVehiculo,
  createIngreso,
  getMateriales,
  getRecicladores,
  getRutas,
  getVehiculosByReciclador,
} from "../services/api";
import type { ApiUser, IngresoStep, Notice, SessionItem } from "../types/app";
import { formatCOP, formatNumber } from "../utils/format";

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildSessionItem(
  material: ApiMaterial,
  pesoTotal: number,
  pesoRechazado: number,
  aplicaTarifa: boolean,
): SessionItem {
  const pesoRecibido = pesoTotal - pesoRechazado;
  const pesoTarifa   = aplicaTarifa ? pesoRecibido : 0;
  const precioKg     = parseFloat(material.precio_kg);
  return {
    clientId:          crypto.randomUUID(),
    materialId:        material.material_id,
    materialNombre:    material.nombre,
    materialCodigo:    material.codigo,
    materialPrecioKg:  precioKg,
    pesoTotal,
    pesoRechazado,
    pesoRecibido,
    aplicaTarifa,
    pesoTarifa,
    subtotalPago:      pesoTarifa * precioKg,
  };
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

/** Panel de sesión activa — muestra reciclador/ruta/vehículo seleccionados */
function SessionHeader({
  reciclador,
  vehiculo,
  ruta,
  itemCount,
  onCancel,
}: {
  reciclador: ApiReciclador;
  vehiculo: ApiVehiculo;
  ruta: ApiRuta;
  itemCount: number;
  onCancel: () => void;
}) {
  return (
    <div className="session-banner">
      <div className="session-banner-info">
        <span className="session-badge">{itemCount} material{itemCount !== 1 ? 'es' : ''}</span>
        <strong>{reciclador.nombre}</strong>
        <span>CC {reciclador.num_documento}</span>
        <span className="separator">·</span>
        <span>{vehiculo.identificador}</span>
        <span className="separator">·</span>
        <span>{ruta.nombre}</span>
      </div>
      <button type="button" className="button ghost small" onClick={onCancel}>
        <Icon name="close" />
        Cancelar ingreso
      </button>
    </div>
  );
}

/** Tabla de materiales agregados en la sesión activa */
function MaterialesLista({
  items,
  onRemove,
}: {
  items: SessionItem[];
  onRemove: (clientId: string) => void;
}) {
  if (items.length === 0) return null;

  const totalRecibido = items.reduce((s, i) => s + i.pesoRecibido, 0);
  const totalPago     = items.reduce((s, i) => s + i.subtotalPago, 0);

  return (
    <div className="materials-list-panel panel">
      <div className="panel-heading">
        <h3 className="with-icon">
          <Icon name="package" className="heading-icon" />
          Materiales registrados
        </h3>
      </div>
      <table className="materials-table">
        <thead>
          <tr>
            <th>Material</th>
            <th className="num">Peso total</th>
            <th className="num">Rechazo</th>
            <th className="num">Recibido</th>
            <th className="num">Pago est.</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.clientId}>
              <td>
                <span className="mat-code">{item.materialCodigo}</span>
                {item.materialNombre}
              </td>
              <td className="num">{formatNumber(item.pesoTotal)} kg</td>
              <td className="num warn">{formatNumber(item.pesoRechazado)} kg</td>
              <td className="num">{formatNumber(item.pesoRecibido)} kg</td>
              <td className="num accent">{formatCOP(item.subtotalPago)}</td>
              <td>
                <button
                  type="button"
                  className="button ghost small danger"
                  onClick={() => onRemove(item.clientId)}
                  aria-label={`Quitar ${item.materialNombre}`}
                >
                  <Icon name="close" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="totals-row">
            <td><strong>TOTAL</strong></td>
            <td className="num"><strong>{formatNumber(items.reduce((s, i) => s + i.pesoTotal,     0))} kg</strong></td>
            <td className="num warn"><strong>{formatNumber(items.reduce((s, i) => s + i.pesoRechazado, 0))} kg</strong></td>
            <td className="num"><strong>{formatNumber(totalRecibido)} kg</strong></td>
            <td className="num accent"><strong>{formatCOP(totalPago)}</strong></td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/** Modal de recibo final — muestra el ingreso creado en la API */
function ReciboModal({
  ingreso,
  onNuevoIngreso,
  onPushNotice,
}: {
  ingreso: ApiIngreso;
  onNuevoIngreso: () => void;
  onPushNotice: (type: Notice["type"], message: string) => void;
}) {
  const totalRecibido = parseFloat(ingreso.peso_recibido);
  const totalPago     = ingreso.total_pago;

  return (
    <div className="modal-backdrop">
      <div className="modal-card receipt-wide" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2 className="with-icon">
            <Icon name="check" className="heading-icon" />
            Tiquete de Ingreso
          </h2>
        </div>

        <div className="receipt-paper">
          <div className="receipt-brand">
            <h3>ECA ZIPAQUIRÁ</h3>
            <p>Estación de Clasificación y Aprovechamiento</p>
            <span>NIT: 123.456.789-0</span>
          </div>

          <div className="receipt-grid">
            <div>
              <strong>Ingreso N°:</strong>
              <p className="mono">{ingreso.ingreso_id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div>
              <strong>Fecha y hora:</strong>
              <p>{ingreso.fecha} · {ingreso.hora.slice(0, 5)}</p>
            </div>
          </div>

          <div className="receipt-block">
            <strong>Reciclador:</strong>
            <p className="receipt-name">{ingreso.reciclador_nombre}</p>
          </div>

          <div className="receipt-grid">
            <div>
              <strong>Vehículo:</strong>
              <p>{ingreso.vehiculo_id_field}</p>
            </div>
            <div>
              <strong>Ruta:</strong>
              <p>{ingreso.ruta_nombre}</p>
            </div>
          </div>

          {/* Tabla de materiales */}
          <table className="receipt-materials">
            <thead>
              <tr>
                <th>Material</th>
                <th>Recibido</th>
                <th>Precio/kg</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {ingreso.detalles.map((d) => (
                <tr key={d.detalle_id}>
                  <td>{d.material_nombre}</td>
                  <td>{formatNumber(parseFloat(d.peso_recibido))} kg</td>
                  <td>{formatCOP(parseFloat(d.material_precio_kg))}</td>
                  <td>{formatCOP(d.subtotal_pago)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="receipt-total">
            <div>
              <span>Total recibido</span>
              <strong>{formatNumber(totalRecibido)} kg</strong>
            </div>
            {parseFloat(ingreso.peso_rechazado) > 0 ? (
              <div className="receipt-reject">
                <span>Material rechazado</span>
                <strong>{formatNumber(parseFloat(ingreso.peso_rechazado))} kg</strong>
              </div>
            ) : null}
            <div className="receipt-net">
              <span>TOTAL A PAGAR AL RECICLADOR</span>
              <strong className="big-pago">{formatCOP(totalPago)}</strong>
            </div>
          </div>

          <div className="receipt-foot">
            <p>Operador: {ingreso.operador_nombre}</p>
            <p>Sistema de Trazabilidad ECA · SuperServicios Compliant</p>
          </div>
        </div>

        <div className="modal-actions two">
          <button
            className="button primary"
            type="button"
            onClick={() => onPushNotice("success", "Enviando a impresora térmica POS...")}
          >
            <Icon name="printer" />
            Imprimir tiquete
          </button>
          <button
            className="button whatsapp"
            type="button"
            onClick={() => onPushNotice("success", "Comprobante enviado por WhatsApp.")}
          >
            <Icon name="send" />
            Enviar WhatsApp
          </button>
        </div>

        <button className="button secondary full" type="button" onClick={onNuevoIngreso}>
          <Icon name="plus" />
          Nuevo ingreso
        </button>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

type RecepcionPageProps = {
  currentUser: ApiUser;
  onPushNotice: (type: Notice["type"], message: string) => void;
};

export function RecepcionPage({ currentUser, onPushNotice }: RecepcionPageProps) {
  // ── Datos cargados desde API ────────────────────────────────────────────────
  const [recicladores, setRecicladores] = useState<ApiReciclador[]>([]);
  const [vehiculos,    setVehiculos]    = useState<ApiVehiculo[]>([]);
  const [rutas,        setRutas]        = useState<ApiRuta[]>([]);
  const [materiales,   setMateriales]   = useState<ApiMaterial[]>([]);
  const [loadingInit,  setLoadingInit]  = useState(true);

  // ── Estado de búsqueda de recicladores ─────────────────────────────────────
  const [recyclerSearch, setRecyclerSearch] = useState('');
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Flujo de sesión ────────────────────────────────────────────────────────
  const [step, setStep]   = useState<IngresoStep>('iniciar');

  // Paso 1
  const [selRecicladorId, setSelRecicladorId] = useState('');
  const [selVehiculoId,   setSelVehiculoId]   = useState('');
  const [selRutaId,       setSelRutaId]       = useState('');
  const [loadingVehiculos, setLoadingVehiculos] = useState(false);

  // Paso 2 — sesión de materiales
  const [sessionItems, setSessionItems] = useState<SessionItem[]>([]);
  const [formMaterialId,    setFormMaterialId]    = useState('');
  const [formPesoTotal,     setFormPesoTotal]     = useState('');
  const [formPesoRechazado, setFormPesoRechazado] = useState('');
  const [formAplicaTarifa,  setFormAplicaTarifa]  = useState(true);
  const [isWeighing,        setIsWeighing]        = useState(false);
  const [simulatedWeight,   setSimulatedWeight]   = useState(0);
  const [submitting,        setSubmitting]        = useState(false);

  // Paso 3 — recibo
  const [createdIngreso, setCreatedIngreso] = useState<ApiIngreso | null>(null);

  // ── Carga inicial ───────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([getRutas(), getMateriales()])
      .then(([rutasRes, materialesRes]) => {
        setRutas(rutasRes.results);
        setMateriales(materialesRes.results);
      })
      .catch(() => onPushNotice('error', 'Error cargando datos de configuración.'))
      .finally(() => setLoadingInit(false));
  }, []);

  // Búsqueda de recicladores con debounce
  useEffect(() => {
    if (searchTimeoutRef.current !== null) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      getRecicladores(recyclerSearch || undefined)
        .then((res) => setRecicladores(res.results))
        .catch(() => onPushNotice('error', 'Error buscando recicladores.'));
    }, 350);
    return () => {
      if (searchTimeoutRef.current !== null) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [recyclerSearch]);

  // Cargar vehículos cuando cambia el reciclador seleccionado
  useEffect(() => {
    if (!selRecicladorId) {
      setVehiculos([]);
      setSelVehiculoId('');
      return;
    }
    setLoadingVehiculos(true);
    getVehiculosByReciclador(selRecicladorId)
      .then(setVehiculos)
      .catch(() => onPushNotice('error', 'Error cargando vehículos del reciclador.'))
      .finally(() => setLoadingVehiculos(false));
  }, [selRecicladorId]);

  // ── Acciones ────────────────────────────────────────────────────────────────

  const resetSession = () => {
    setStep('iniciar');
    setSelRecicladorId('');
    setSelVehiculoId('');
    setSelRutaId('');
    setSessionItems([]);
    setFormMaterialId('');
    setFormPesoTotal('');
    setFormPesoRechazado('');
    setFormAplicaTarifa(true);
    setCreatedIngreso(null);
    setIsWeighing(false);
    setSimulatedWeight(0);
  };

  const handleIniciarIngreso = () => {
    if (!selRecicladorId || !selVehiculoId || !selRutaId) {
      onPushNotice('error', 'Selecciona reciclador, vehículo y ruta para continuar.');
      return;
    }
    setSessionItems([]);
    setStep('materiales');
  };

  const simulateScale = () => {
    setIsWeighing(true);
    let counter = 0;
    const interval = window.setInterval(() => {
      const w = Math.floor(Math.random() * 80) + 5;
      setSimulatedWeight(w);
      counter += 1;
      if (counter > 10) {
        clearInterval(interval);
        setIsWeighing(false);
        setFormPesoTotal(w.toString());
      }
    }, 100);
  };

  const handleAgregarMaterial = () => {
    if (!formMaterialId) {
      onPushNotice('error', 'Selecciona el tipo de material.');
      return;
    }
    const pesoTotal     = parseFloat(formPesoTotal);
    const pesoRechazado = parseFloat(formPesoRechazado || '0');

    if (!pesoTotal || pesoTotal <= 0) {
      onPushNotice('error', 'El peso debe ser mayor a cero.');
      return;
    }
    if (pesoRechazado < 0 || pesoRechazado > pesoTotal) {
      onPushNotice('error', 'El rechazo no puede ser negativo ni mayor al peso total.');
      return;
    }
    // Prevenir duplicar material en la misma sesión
    if (sessionItems.some((i) => i.materialId === formMaterialId)) {
      onPushNotice('error', 'Este material ya fue agregado al ingreso. Edita la fila existente si necesitas modificar.');
      return;
    }

    const material = materiales.find((m) => m.material_id === formMaterialId);
    if (!material) return;

    const item = buildSessionItem(material, pesoTotal, pesoRechazado, formAplicaTarifa);
    setSessionItems((prev) => [...prev, item]);

    // Limpiar formulario de material
    setFormMaterialId('');
    setFormPesoTotal('');
    setFormPesoRechazado('');
    setFormAplicaTarifa(true);
    setSimulatedWeight(0);
    onPushNotice('success', `${material.nombre} agregado al ingreso.`);
  };

  const handleRemoveItem = (clientId: string) => {
    setSessionItems((prev) => prev.filter((i) => i.clientId !== clientId));
  };

  const handleFinalizarIngreso = async () => {
    if (sessionItems.length === 0) {
      onPushNotice('error', 'Agrega al menos un material antes de finalizar.');
      return;
    }

    const reciclador = recicladores.find((r) => r.reciclador_id === selRecicladorId);
    if (!reciclador) return;

    setSubmitting(true);
    try {
      const payload = {
        reciclador: selRecicladorId,
        vehiculo:   selVehiculoId,
        ruta:       selRutaId,
        operador:   currentUser.id,
        usuario:    currentUser.id,
        detalles:   sessionItems.map((i) => ({
          material:        i.materialId,
          peso_total:      i.pesoTotal,
          peso_rechazado:  i.pesoRechazado,
          peso_tarifa:     i.pesoTarifa,
        })),
      };
      const ingreso = await createIngreso(payload);
      setCreatedIngreso(ingreso);
      setStep('recibo');
      onPushNotice('success', 'Ingreso registrado exitosamente.');
    } catch (err) {
      const msg = err instanceof ApiError
        ? err.userMessage
        : 'Error al guardar el ingreso. Intenta nuevamente.';
      onPushNotice('error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Datos derivados ─────────────────────────────────────────────────────────
  const selReciclador = recicladores.find((r) => r.reciclador_id === selRecicladorId);
  const selVehiculo   = vehiculos.find((v) => v.vehiculo_id === selVehiculoId);
  const selRuta       = rutas.find((r) => r.ruta_id === selRutaId);
  const totalPagoSession = sessionItems.reduce((s, i) => s + i.subtotalPago, 0);

  // Materiales no elegidos aún en esta sesión
  const materialesDisponibles = materiales.filter(
    (m) => !sessionItems.some((i) => i.materialId === m.material_id),
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loadingInit) {
    return (
      <section className="view">
        <header className="view-header">
          <div><h1>Recepción de Material</h1></div>
        </header>
        <div className="loading-placeholder">
          <Icon name="refresh" className="spin" />
          <p>Cargando configuración...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="view">
      <header className="view-header">
        <div>
          <h1>Recepción de Material</h1>
          <p>
            {step === 'iniciar'   ? 'Inicia un nuevo ingreso seleccionando el reciclador' : null}
            {step === 'materiales' ? 'Agrega los materiales del ingreso uno a uno' : null}
            {step === 'recibo'    ? 'Ingreso registrado — imprime o envía el tiquete' : null}
          </p>
        </div>
        {/* Indicador de pasos */}
        <div className="step-indicator">
          <span className={`step-dot ${step === 'iniciar' ? 'active' : 'done'}`}>1</span>
          <span className="step-line" />
          <span className={`step-dot ${step === 'materiales' ? 'active' : step === 'recibo'     ? 'done' : ''}`}>2</span>
          <span className="step-line" />
          <span className={`step-dot ${step === 'recibo'     ? 'active' : ''}`}>3</span>
        </div>
      </header>

      {/* ── PASO 1: INICIAR ─────────────────────────────────────────────────── */}
      {step === 'iniciar' ? (
        <article className="panel form-panel">
          <div className="panel-heading section-border">
            <h2 className="with-icon">
              <Icon name="user" className="heading-icon" />
              Paso 1 — Identificar al reciclador
            </h2>
          </div>

          <div className="form-grid">
            <Field label="Buscar reciclador" icon="search">
              <input
                type="text"
                placeholder="Nombre o número de documento..."
                value={recyclerSearch}
                onChange={(e) => setRecyclerSearch(e.target.value)}
              />
            </Field>

            <Field label="Reciclador *" icon="user">
              <select
                value={selRecicladorId}
                onChange={(e) => setSelRecicladorId(e.target.value)}
              >
                <option value="">Seleccione el reciclador</option>
                {recicladores.map((r) => (
                  <option key={r.reciclador_id} value={r.reciclador_id}>
                    {r.nombre} — CC {r.num_documento}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Vehículo *" icon="truck">
              {loadingVehiculos ? (
                <div className="field-loading">
                  <Icon name="refresh" className="spin" /> Cargando vehículos...
                </div>
              ) : (
                <select
                  value={selVehiculoId}
                  onChange={(e) => setSelVehiculoId(e.target.value)}
                  disabled={!selRecicladorId}
                >
                  <option value="">
                    {selRecicladorId
                      ? vehiculos.length === 0
                        ? '— Sin vehículos registrados —'
                        : 'Seleccione el vehículo'
                      : 'Primero selecciona un reciclador'}
                  </option>
                  {vehiculos.map((v) => (
                    <option key={v.vehiculo_id} value={v.vehiculo_id}>
                      {v.identificador} ({v.tipo})
                    </option>
                  ))}
                </select>
              )}
            </Field>

            <Field label="Ruta *" icon="location">
              <select
                value={selRutaId}
                onChange={(e) => setSelRutaId(e.target.value)}
              >
                <option value="">Seleccione la ruta</option>
                {rutas.map((r) => (
                  <option key={r.ruta_id} value={r.ruta_id}>
                    {r.nombre}
                  </option>
                ))}
              </select>
            </Field>

            <button
              type="button"
              className="button primary big"
              onClick={handleIniciarIngreso}
              disabled={!selRecicladorId || !selVehiculoId || !selRutaId}
            >
              <Icon name="check" />
              Iniciar ingreso
            </button>
          </div>
        </article>
      ) : null}

      {/* ── PASO 2: AGREGAR MATERIALES ──────────────────────────────────────── */}
      {step === 'materiales' && selReciclador && selVehiculo && selRuta ? (
        <>
          <SessionHeader
            reciclador={selReciclador}
            vehiculo={selVehiculo}
            ruta={selRuta}
            itemCount={sessionItems.length}
            onCancel={resetSession}
          />

          {/* Formulario de material */}
          <article className="panel form-panel">
            <div className="panel-heading section-border">
              <h2 className="with-icon">
                <Icon name="scale" className="heading-icon" />
                Paso 2 — Agregar material
              </h2>
            </div>

            <div className="form-grid">
              <Field label="Tipo de material *" icon="package">
                <select
                  value={formMaterialId}
                  onChange={(e) => setFormMaterialId(e.target.value)}
                >
                  <option value="">Seleccione el material</option>
                  {materialesDisponibles.map((m) => (
                    <option key={m.material_id} value={m.material_id}>
                      [{m.codigo}] {m.nombre} — ${parseFloat(m.precio_kg).toLocaleString('es-CO')}/kg
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Peso total (kg) *" icon="scale">
                <div className="scale-row">
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={formPesoTotal}
                    onChange={(e) => setFormPesoTotal(e.target.value)}
                    placeholder="0.000"
                    className="scale-input"
                    readOnly={isWeighing}
                  />
                  <button
                    type="button"
                    className="button primary tall"
                    onClick={simulateScale}
                    disabled={isWeighing}
                  >
                    <Icon name={isWeighing ? "refresh" : "scale"} className={isWeighing ? "spin" : ""} />
                    {isWeighing ? "Pesando..." : "Leer báscula"}
                  </button>
                </div>
                {isWeighing ? (
                  <div className="scale-preview">
                    <strong>{simulatedWeight.toFixed(3)} kg</strong>
                    <span>Estabilizando lectura...</span>
                  </div>
                ) : null}
              </Field>

              <Field
                label="Material rechazado (kg)"
                icon="warning"
                hint="Material sucio, aceitado o no aprovechable"
              >
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={formPesoRechazado}
                  onChange={(e) => setFormPesoRechazado(e.target.value)}
                  placeholder="0.000"
                />
              </Field>

              <Field
                label="Rechazo por contaminación del generador"
                icon="warning"
                hint="Si el rechazo es por contaminación, el reciclador cobra el peso total entregado"
              >
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={formAplicaTarifa}
                    onChange={(e) => setFormAplicaTarifa(e.target.checked)}
                  />
                  <span>
                    {formAplicaTarifa
                      ? 'Sí — reciclador cobra por todo el material entregado'
                      : 'No — reciclador solo cobra por material recibido'}
                  </span>
                </label>
              </Field>

              <button
                type="button"
                className="button secondary big"
                onClick={handleAgregarMaterial}
                disabled={!formMaterialId || !formPesoTotal || isWeighing}
              >
                <Icon name="plus" />
                Agregar material al ingreso
              </button>
            </div>
          </article>

          {/* Lista de materiales en sesión */}
          <MaterialesLista items={sessionItems} onRemove={handleRemoveItem} />

          {/* Panel totales + botón finalizar */}
          {sessionItems.length > 0 ? (
            <div className="finalize-panel">
              <div className="finalize-summary">
                <span>Total estimado a pagar al reciclador:</span>
                <strong className="big-pago">{formatCOP(totalPagoSession)}</strong>
              </div>
              <button
                type="button"
                className="button primary big"
                onClick={handleFinalizarIngreso}
                disabled={submitting}
              >
                {submitting ? (
                  <><Icon name="refresh" className="spin" /> Guardando...</>
                ) : (
                  <><Icon name="check" /> Finalizar ingreso</>
                )}
              </button>
            </div>
          ) : null}
        </>
      ) : null}

      {/* ── PASO 3: RECIBO ──────────────────────────────────────────────────── */}
      {step === 'recibo' && createdIngreso ? (
        <ReciboModal
          ingreso={createdIngreso}
          onNuevoIngreso={resetSession}
          onPushNotice={onPushNotice}
        />
      ) : null}
    </section>
  );
}
