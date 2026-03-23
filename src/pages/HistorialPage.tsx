import { EmptyState, Icon, InfoBlock, SummaryPanel } from "../components/AppUi";
import { materialTypes } from "../data/mockData";
import type { HistoryTotals, Transaction } from "../types/app";
import { formatNumber } from "../utils/format";

type HistorialPageProps = {
  filteredTransactions: Transaction[];
  historyTotals: HistoryTotals;
  historySearch: string;
  historyMaterial: string;
  historyDate: string;
  onHistorySearchChange: (value: string) => void;
  onHistoryMaterialChange: (value: string) => void;
  onHistoryDateChange: (value: string) => void;
  onExportTransactions: () => void;
  onOpenReceipt: (transaction: Transaction) => void;
};

export function HistorialPage({
  filteredTransactions,
  historyTotals,
  historySearch,
  historyMaterial,
  historyDate,
  onHistorySearchChange,
  onHistoryMaterialChange,
  onHistoryDateChange,
  onExportTransactions,
  onOpenReceipt,
}: HistorialPageProps) {
  return (
    <section className="view">
      <header className="view-header split">
        <div>
          <h1>Historial de Transacciones</h1>
          <p>Registro completo de todas las operaciones de recepción</p>
        </div>
        <button
          type="button"
          className="button primary"
          onClick={onExportTransactions}
        >
          <Icon name="download" />
          Exportar CSV
        </button>
      </header>

      <div className="stats-grid three">
        <SummaryPanel
          title="Total Transacciones"
          value={String(filteredTransactions.length)}
          icon="history"
        />
        <SummaryPanel
          title="Peso Total"
          value={`${formatNumber(historyTotals.totalWeight)} kg`}
          icon="scale"
        />
        <SummaryPanel
          title="Peso Neto"
          value={`${formatNumber(historyTotals.netWeight)} kg`}
          subtitle={`Rechazo: ${formatNumber(historyTotals.totalRejection)} kg`}
          accent="green"
          icon="package"
        />
      </div>

      <article className="panel filters-panel">
        <div className="filters-grid three-col">
          <label className="search-field">
            <Icon name="search" className="field-icon" />
            <input
              type="text"
              placeholder="Buscar por ID o reciclador..."
              value={historySearch}
              onChange={(event) => onHistorySearchChange(event.target.value)}
            />
          </label>

          <label className="select-field">
            <select
              value={historyMaterial}
              onChange={(event) => onHistoryMaterialChange(event.target.value)}
            >
              <option value="all">Todos los materiales</option>
              {materialTypes.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="select-field">
            <select
              value={historyDate}
              onChange={(event) => onHistoryDateChange(event.target.value)}
            >
              <option value="all">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
            </select>
          </label>
        </div>
      </article>

      <article className="panel table-panel">
        <div className="panel-heading section-border">
          <h2>Transacciones Registradas</h2>
        </div>

        {filteredTransactions.length === 0 ? (
          <EmptyState
            icon="history"
            title="No hay transacciones registradas todavía"
            text="Las transacciones aparecerán aquí después de registrar recepciones de material."
          />
        ) : (
          <div className="history-list">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="history-card">
                <div className="history-top">
                  <span className="transaction-badge">{transaction.id}</span>
                  <span className="history-date">
                    <Icon name="calendar" />
                    {new Date(transaction.timestamp).toLocaleString("es-CO")}
                  </span>
                </div>
                <div className="history-grid">
                  <InfoBlock
                    icon="user"
                    label="Reciclador"
                    value={transaction.recyclerName}
                  />
                  <InfoBlock
                    icon="package"
                    label="Material"
                    value={transaction.materialName}
                  />
                  <InfoBlock
                    icon="scale"
                    label="Peso Total"
                    value={`${transaction.weight.toFixed(2)} kg`}
                    strong
                  />
                  <InfoBlock
                    icon="scale"
                    label="Peso Neto"
                    value={`${(transaction.weight - transaction.rejection).toFixed(2)} kg`}
                    highlight
                    extra={
                      transaction.rejection > 0
                        ? `(Rechazo: ${transaction.rejection.toFixed(2)} kg)`
                        : undefined
                    }
                  />
                </div>
                <div className="history-footer">
                  <span>
                    <strong>Ruta:</strong> {transaction.routeName}
                  </span>
                  <button
                    type="button"
                    className="button tertiary"
                    onClick={() => onOpenReceipt(transaction)}
                  >
                    Ver Detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
