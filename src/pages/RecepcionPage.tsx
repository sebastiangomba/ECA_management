import type { FormEvent } from "react";

import { materialTypes, recyclers, routes } from "../data/mockData";
import { Field, Icon } from "../components/AppUi";

type RecepcionPageProps = {
  selectedRecycler: string;
  selectedRoute: string;
  selectedMaterial: string;
  weight: string;
  rejection: string;
  simulatedWeight: number;
  isWeighing: boolean;
  onSelectedRecyclerChange: (value: string) => void;
  onSelectedRouteChange: (value: string) => void;
  onSelectedMaterialChange: (value: string) => void;
  onWeightChange: (value: string) => void;
  onRejectionChange: (value: string) => void;
  onSimulateScale: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function RecepcionPage({
  selectedRecycler,
  selectedRoute,
  selectedMaterial,
  weight,
  rejection,
  simulatedWeight,
  isWeighing,
  onSelectedRecyclerChange,
  onSelectedRouteChange,
  onSelectedMaterialChange,
  onWeightChange,
  onRejectionChange,
  onSimulateScale,
  onSubmit,
}: RecepcionPageProps) {
  return (
    <section className="view">
      <header className="view-header">
        <div>
          <h1>Recepción de Material</h1>
          <p>Registro de entrada y generación de tiquete de soporte</p>
        </div>
      </header>

      <div className="content-grid">
        <article className="panel form-panel">
          <div className="panel-heading section-border">
            <h2 className="with-icon">
              <Icon name="scale" className="heading-icon" />
              Formulario de Pesaje
            </h2>
          </div>

          <form className="form-grid" onSubmit={onSubmit}>
            <Field label="Reciclador *" icon="user">
              <select
                value={selectedRecycler}
                onChange={(event) => onSelectedRecyclerChange(event.target.value)}
              >
                <option value="">Seleccione el reciclador</option>
                {recyclers.map((recycler) => (
                  <option key={recycler.id} value={recycler.id}>
                    {recycler.name} - CC {recycler.document}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Ruta *" icon="location">
              <select
                value={selectedRoute}
                onChange={(event) => onSelectedRouteChange(event.target.value)}
              >
                <option value="">Seleccione la ruta</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Tipo de Material *" icon="package">
              <select
                value={selectedMaterial}
                onChange={(event) => onSelectedMaterialChange(event.target.value)}
              >
                <option value="">Seleccione el tipo de material</option>
                {materialTypes.map((material) => (
                  <option key={material.code} value={material.code}>
                    [{material.code}] {material.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Peso Total (kg) *" icon="scale">
              <div className="scale-row">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={weight}
                  onChange={(event) => onWeightChange(event.target.value)}
                  placeholder="0.00"
                  className="scale-input"
                />
                <button
                  type="button"
                  className="button primary tall"
                  onClick={onSimulateScale}
                  disabled={isWeighing}
                >
                  <Icon
                    name={isWeighing ? "refresh" : "scale"}
                    className={isWeighing ? "spin" : ""}
                  />
                  {isWeighing ? "Pesando..." : "Leer Báscula"}
                </button>
              </div>
              {isWeighing ? (
                <div className="scale-preview">
                  <strong>{simulatedWeight.toFixed(2)} kg</strong>
                  <span>Estabilizando lectura...</span>
                </div>
              ) : null}
            </Field>

            <Field
              label="Material de Rechazo (kg)"
              icon="warning"
              hint="Material sucio, aceitado o no aprovechable que se descarta"
            >
              <input
                type="number"
                step="0.01"
                min="0"
                value={rejection}
                onChange={(event) => onRejectionChange(event.target.value)}
                placeholder="0.00"
              />
            </Field>

            <button type="submit" className="button primary big">
              <Icon name="check" />
              Registrar Transacción
            </button>
          </form>
        </article>

        <aside className="stacked-panels">
          <article className="panel side-panel">
            <h3>Proceso de Verificación</h3>
            <ul className="check-list">
              <li>
                <Icon name="check" /> El operador registra el peso
              </li>
              <li>
                <Icon name="check" /> El reciclador valida visualmente
              </li>
              <li>
                <Icon name="check" /> Sistema genera tiquete inmediato
              </li>
            </ul>
          </article>

          <article className="panel side-panel">
            <h3>Controles del Sistema</h3>
            <ul className="bullet-list">
              <li>Guardado automático al registrar</li>
              <li>No permite edición posterior</li>
              <li>Peso capturado de báscula calibrada</li>
            </ul>
          </article>
        </aside>
      </div>
    </section>
  );
}
