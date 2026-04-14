// import { EmptyState, Icon, SummaryPanel } from "../components/AppUi";
// i//mport { inventoryData } from "../data/mockData";
// import type {
//   InventoryItem,
//   InventoryTotals,
// } from "../types/app";
// import { formatNumber } from "../utils/format";

// const statusLabel: Record<InventoryItem["status"], string> = {
//   critical: "Crítico",
//   low: "Bajo",
//   medium: "Medio",
//   high: "Alto",
// };

// type InventarioPageProps = {
//   inventoryTotals: InventoryTotals;
//   inventorySearch: string;
//   inventoryStatus: string;
//   filteredInventory: InventoryItem[];
//   onInventorySearchChange: (value: string) => void;
//   onInventoryStatusChange: (value: string) => void;
// };

// export function InventarioPage({
//   inventoryTotals,
//   inventorySearch,
//   inventoryStatus,
//   filteredInventory,
//   onInventorySearchChange,
//   onInventoryStatusChange,
// }: InventarioPageProps) {
//   return (
//     <section className="view">
//       <header className="view-header">
//         <div>
//           <h1>Inventario de Material</h1>
//           <p>Control de existencias en bodega</p>
//         </div>
//       </header>

//       <div className="stats-grid three">
//         <SummaryPanel
//           title="Stock Total"
//           value={`${formatNumber(inventoryTotals.totalStock)} kg`}
//           icon="package"
//         />
//         <SummaryPanel
//           title="Tipos de Material"
// //          value={String(inventoryData.length)}
//           icon="bar"
//         />
//         <SummaryPanel
//           title="Niveles Críticos"
//           value={String(inventoryTotals.criticalItems)}
//           icon="warning"
//           accent="amber"
//         />
//       </div>

//       <article className="panel filters-panel">
//         <div className="filters-grid">
//           <label className="search-field">
//             <Icon name="search" className="field-icon" />
//             <input
//               type="text"
//               placeholder="Buscar por código o nombre..."
//               value={inventorySearch}
//               onChange={(event) => onInventorySearchChange(event.target.value)}
//             />
//           </label>

//           <label className="select-field">
//             <select
//               value={inventoryStatus}
//               onChange={(event) => onInventoryStatusChange(event.target.value)}
//             >
//               <option value="all">Todos los estados</option>
//               <option value="critical">Crítico</option>
//               <option value="low">Bajo</option>
//               <option value="medium">Medio</option>
//               <option value="high">Alto</option>
//             </select>
//           </label>
//         </div>
//       </article>

//       <article className="panel table-panel">
//         <div className="panel-heading section-border">
//           <h2>Existencias Actuales</h2>
//         </div>

//         {filteredInventory.length > 0 ? (
//           <div className="table-wrap">
//             <table className="data-table">
//               <thead>
//                 <tr>
//                   <th>CÓDIGO</th>
//                   <th>MATERIAL</th>
//                   <th className="align-right">STOCK</th>
//                   <th className="align-center">ESTADO</th>
//                   <th>ÚLTIMA ACTUALIZACIÓN</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredInventory.map((item) => (
//                   <tr key={item.code}>
//                     <td className="code-cell">{item.code}</td>
//                     <td>{item.name}</td>
//                     <td className="align-right strong-cell">
//                       {formatNumber(item.stock)} <span>{item.unit}</span>
//                     </td>
//                     <td className="align-center">
//                       <span className={`status-pill ${item.status}`}>
//                         {statusLabel[item.status]}
//                       </span>
//                     </td>
//                     <td>{item.lastUpdate}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <EmptyState
//             icon="package"
//             title="No se encontraron materiales"
//             text="Ajusta los filtros para revisar otras existencias."
//           />
//         )}
//       </article>
//     </section>
//   );
// }
