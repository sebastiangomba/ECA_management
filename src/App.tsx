import { type FormEvent, useEffect, useMemo, useState } from "react";

import "./App.css";
import { Icon } from "./components/AppUi";
import {
  authSessionStorageKey,
  authUsersStorageKey,
  balanceData,
  inventoryData,
  materialTypes,
  massBalanceData,
  navigation,
  recyclerPayments,
  recyclers,
  routes,
  seededOperator,
  storageKey,
} from "./data/mockData";
import { useNotices } from "./hooks/useNotices";
import { DashboardPage } from "./pages/DashboardPage";
import { HistorialPage } from "./pages/HistorialPage";
import { InventarioPage } from "./pages/InventarioPage";
import { RecepcionPage } from "./pages/RecepcionPage";
import { ReportesPage } from "./pages/ReportesPage";
import type {
  AuthMode,
  AuthUser,
  DashboardStats,
  HistoryTotals,
  InventoryTotals,
  Notice,
  ReportTotals,
  StoredUser,
  Transaction,
  ViewId,
} from "./types/app";
import { downloadCsv } from "./utils/format";

type ThemeMode = "dark" | "light";

const themeStorageKey = "eca-management-theme";

function readTransactionsFromStorage() {
  const stored = localStorage.getItem(storageKey);

  if (!stored) {
    return [] as Transaction[];
  }

  try {
    return JSON.parse(stored) as Transaction[];
  } catch {
    localStorage.removeItem(storageKey);
    return [] as Transaction[];
  }
}

function readStoredUsers() {
  const storedUsers = localStorage.getItem(authUsersStorageKey);

  if (!storedUsers) {
    return [seededOperator];
  }

  try {
    const parsedUsers = JSON.parse(storedUsers) as StoredUser[];
    const usersByDocument = new Map<string, StoredUser>();

    [seededOperator, ...parsedUsers].forEach((user) => {
      usersByDocument.set(user.document, user);
    });

    return Array.from(usersByDocument.values());
  } catch {
    localStorage.removeItem(authUsersStorageKey);
    return [seededOperator];
  }
}

function readStoredSession() {
  const storedSession = localStorage.getItem(authSessionStorageKey);

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession) as AuthUser;
  } catch {
    localStorage.removeItem(authSessionStorageKey);
    return null;
  }
}

function readStoredTheme(): ThemeMode {
  const storedTheme = localStorage.getItem(themeStorageKey);
  return storedTheme === "light" ? "light" : "dark";
}

function toSessionUser(user: StoredUser | AuthUser): AuthUser {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    document: user.document,
    role: user.role,
    createdAt: user.createdAt,
  };
}

function ReceiptModal({
  transaction,
  onClose,
  onReset,
  onPushNotice,
}: {
  transaction: Transaction;
  onClose: () => void;
  onReset: () => void;
  onPushNotice: (type: Notice["type"], message: string) => void;
}) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="with-icon">
            <Icon name="check" className="heading-icon" />
            Tiquete de Soporte
          </h2>
          <button className="close-button" type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="receipt-paper">
          <div className="receipt-brand">
            <h3>ECA ZIPAQUIRÁ</h3>
            <p>Estación de Clasificación y Aprovechamiento</p>
            <span>NIT: 123.456.789-0</span>
          </div>

          <div className="receipt-grid">
            <div>
              <strong>Transacción:</strong>
              <p>{transaction.id}</p>
            </div>
            <div>
              <strong>Fecha y Hora:</strong>
              <p>{new Date(transaction.timestamp).toLocaleString("es-CO")}</p>
            </div>
          </div>

          <div className="receipt-block">
            <strong>Reciclador:</strong>
            <p className="receipt-name">{transaction.recyclerName}</p>
          </div>

          <div className="receipt-grid">
            <div>
              <strong>Ruta:</strong>
              <p>{transaction.routeName}</p>
            </div>
            <div>
              <strong>Material:</strong>
              <p>{transaction.materialName}</p>
            </div>
          </div>

          <div className="receipt-total">
            <div>
              <span>Peso Total</span>
              <strong>{transaction.weight.toFixed(2)} kg</strong>
            </div>
            {transaction.rejection > 0 ? (
              <div className="receipt-reject">
                <span>Rechazo</span>
                <strong>-{transaction.rejection.toFixed(2)} kg</strong>
              </div>
            ) : null}
            <div className="receipt-net">
              <span>PESO NETO</span>
              <strong>
                {(transaction.weight - transaction.rejection).toFixed(2)} kg
              </strong>
            </div>
          </div>

          <div className="receipt-foot">
            <p>Sistema de Trazabilidad ECA - Zipaquirá</p>
            <p>SuperServicios Compliant</p>
          </div>
        </div>

        <div className="modal-actions two">
          <button
            className="button primary"
            type="button"
            onClick={() =>
              onPushNotice("success", "Enviando a impresora térmica POS...")
            }
          >
            <Icon name="printer" />
            Imprimir Recibo Térmico
          </button>
          <button
            className="button whatsapp"
            type="button"
            onClick={() =>
              onPushNotice("success", "Comprobante enviado por WhatsApp.")
            }
          >
            <Icon name="send" />
            Enviar a WhatsApp
          </button>
        </div>

        <button className="button secondary full" type="button" onClick={onReset}>
          Nueva Transacción
        </button>
      </div>
    </div>
  );
}

function AuthenticatedApp({
  currentUser,
  onLogout,
  theme,
  onToggleTheme,
}: {
  currentUser: AuthUser;
  onLogout: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}) {
  const [activeView, setActiveView] = useState<ViewId>("dashboard");
  const [transactions, setTransactions] = useState<Transaction[]>(
    readTransactionsFromStorage,
  );
  const [selectedRecycler, setSelectedRecycler] = useState("");
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [weight, setWeight] = useState("");
  const [rejection, setRejection] = useState("");
  const [simulatedWeight, setSimulatedWeight] = useState(0);
  const [isWeighing, setIsWeighing] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] =
    useState<Transaction | null>(null);
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryStatus, setInventoryStatus] = useState("all");
  const [historySearch, setHistorySearch] = useState("");
  const [historyMaterial, setHistoryMaterial] = useState("all");
  const [historyDate, setHistoryDate] = useState("all");
  const [reportPeriod, setReportPeriod] = useState("monthly");
  const [printPreview, setPrintPreview] = useState(false);
  const { notices, pushNotice } = useNotices();
  const scaleActive = true;
  const mainNavigation = navigation.filter(
    (item) => item.id !== "dashboard" && item.id !== "reportes",
  );
  const footerNavigation = navigation.filter(
    (item) => item.id === "dashboard" || item.id === "reportes",
  );

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(transactions));
  }, [transactions]);

  const filteredInventory = useMemo(() => {
    return inventoryData.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        item.code.toLowerCase().includes(inventorySearch.toLowerCase());
      const matchesStatus =
        inventoryStatus === "all" || item.status === inventoryStatus;

      return matchesSearch && matchesStatus;
    });
  }, [inventorySearch, inventoryStatus]);

  const filteredTransactions = useMemo(() => {
    const now = new Date();

    return transactions.filter((transaction) => {
      const matchesSearch =
        transaction.recyclerName
          .toLowerCase()
          .includes(historySearch.toLowerCase()) ||
        transaction.id.toLowerCase().includes(historySearch.toLowerCase());
      const matchesMaterial =
        historyMaterial === "all" ||
        transaction.materialCode === historyMaterial;

      if (!matchesSearch || !matchesMaterial) {
        return false;
      }

      if (historyDate === "all") {
        return true;
      }

      const parsedDate = new Date(transaction.timestamp);

      if (Number.isNaN(parsedDate.getTime())) {
        return true;
      }

      const diff = now.getTime() - parsedDate.getTime();
      const diffDays = diff / (1000 * 60 * 60 * 24);

      if (historyDate === "today") {
        return parsedDate.toDateString() === now.toDateString();
      }

      if (historyDate === "week") {
        return diffDays <= 7;
      }

      if (historyDate === "month") {
        return diffDays <= 31;
      }

      return true;
    });
  }, [historyDate, historyMaterial, historySearch, transactions]);

  const inventoryTotals = useMemo<InventoryTotals>(() => {
    const totalStock = inventoryData.reduce((sum, item) => sum + item.stock, 0);
    const criticalItems = inventoryData.filter(
      (item) => item.status === "critical" || item.status === "low",
    ).length;

    return { totalStock, criticalItems };
  }, []);

  const historyTotals = useMemo<HistoryTotals>(() => {
    const totalWeight = filteredTransactions.reduce(
      (sum, item) => sum + item.weight,
      0,
    );
    const totalRejection = filteredTransactions.reduce(
      (sum, item) => sum + item.rejection,
      0,
    );

    return {
      totalWeight,
      totalRejection,
      netWeight: totalWeight - totalRejection,
    };
  }, [filteredTransactions]);

  const dashboardStats = useMemo<DashboardStats>(() => {
    const totalIncoming = massBalanceData.reduce(
      (sum, item) => sum + item.entrada,
      0,
    );
    const totalOutgoing = massBalanceData.reduce(
      (sum, item) => sum + item.salida,
      0,
    );
    const totalRejection = massBalanceData.reduce(
      (sum, item) => sum + item.rechazo,
      0,
    );

    return {
      totalIncoming,
      totalOutgoing,
      totalRejection,
      rejectionPercentage: ((totalRejection / totalIncoming) * 100).toFixed(1),
      activeRecyclers: recyclers.length + 40,
      todayTransactions: transactions.length,
    };
  }, [transactions.length]);

  const reportTotals = useMemo<ReportTotals>(() => {
    const totalIngresado = balanceData.reduce(
      (sum, item) => sum + item.ingresado,
      0,
    );
    const totalRechazos = balanceData.reduce(
      (sum, item) => sum + item.rechazos,
      0,
    );
    const totalAprovechado = balanceData.reduce(
      (sum, item) => sum + item.aprovechado,
      0,
    );

    return {
      totalIngresado,
      totalRechazos,
      totalAprovechado,
      rejectionPercent: ((totalRechazos / totalIngresado) * 100).toFixed(1),
    };
  }, []);

  const simulateScale = () => {
    setIsWeighing(true);
    let counter = 0;

    const interval = window.setInterval(() => {
      const randomWeight = Math.floor(Math.random() * 50) + 10;
      setSimulatedWeight(randomWeight);
      counter += 1;

      if (counter > 10) {
        window.clearInterval(interval);
        setIsWeighing(false);
        setWeight(randomWeight.toString());
      }
    }, 100);
  };

  const resetReceptionForm = () => {
    setSelectedRecycler("");
    setSelectedRoute("");
    setSelectedMaterial("");
    setWeight("");
    setRejection("");
    setSimulatedWeight(0);
    setCurrentTransaction(null);
    setReceiptOpen(false);
  };

  const handleReceptionSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedRecycler || !selectedRoute || !selectedMaterial || !weight) {
      pushNotice("error", "Por favor complete todos los campos obligatorios.");
      return;
    }

    const weightNum = Number.parseFloat(weight);
    const rejectionNum = Number.parseFloat(rejection || "0");

    if (weightNum <= 0) {
      pushNotice("error", "El peso debe ser mayor a cero.");
      return;
    }

    if (rejectionNum < 0 || rejectionNum > weightNum) {
      pushNotice(
        "error",
        "El rechazo no puede ser negativo ni mayor al peso total.",
      );
      return;
    }

    const recycler = recyclers.find((item) => item.id === selectedRecycler);
    const route = routes.find((item) => item.id === selectedRoute);
    const material = materialTypes.find(
      (item) => item.code === selectedMaterial,
    );

    const transaction: Transaction = {
      id: `TRX-${Date.now()}`,
      recyclerId: selectedRecycler,
      recyclerName: recycler?.name ?? "",
      routeId: selectedRoute,
      routeName: route?.name ?? "",
      materialCode: selectedMaterial,
      materialName: material?.name ?? "",
      weight: weightNum,
      rejection: rejectionNum,
      timestamp: new Date().toISOString(),
    };

    setTransactions((current) => [transaction, ...current]);
    setCurrentTransaction(transaction);
    setReceiptOpen(true);
    pushNotice("success", "Transacción registrada exitosamente.");
  };

  const openReceipt = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    setReceiptOpen(true);
  };

  const exportSui = () => {
    downloadCsv(`reporte_SUI_${new Date().toISOString().split("T")[0]}.csv`, [
      [
        "Código Material",
        "Material",
        "Ingresado (kg)",
        "Rechazos (kg)",
        "Aprovechado (kg)",
        "% Rechazo",
      ],
      ...balanceData.map((item) => [
        item.material,
        item.material,
        item.ingresado,
        item.rechazos,
        item.aprovechado,
        ((item.rechazos / item.ingresado) * 100).toFixed(2),
      ]),
    ]);
    pushNotice("success", "Archivo SUI generado exitosamente.");
  };

  const exportPayments = () => {
    downloadCsv(`resumen_pagos_${new Date().toISOString().split("T")[0]}.csv`, [
      ["Reciclador", "Toneladas", "Pago (COP)", "Eficiencia (%)"],
      ...recyclerPayments.map((item) => [
        item.name,
        item.tons,
        item.payments,
        item.efficiency,
      ]),
    ]);
    pushNotice("success", "Resumen de pagos exportado.");
  };

  const exportTransactions = () => {
    downloadCsv(`transacciones_${new Date().toISOString().split("T")[0]}.csv`, [
      [
        "ID",
        "Fecha",
        "Reciclador",
        "Ruta",
        "Material",
        "Peso (kg)",
        "Rechazo (kg)",
        "Neto (kg)",
      ],
      ...filteredTransactions.map((item) => [
        item.id,
        new Date(item.timestamp).toLocaleString("es-CO"),
        item.recyclerName,
        item.routeName,
        item.materialName,
        item.weight,
        item.rejection,
        item.weight - item.rejection,
      ]),
    ]);
    pushNotice("success", "CSV de transacciones exportado.");
  };

  const openPqrsForm = () => {
    window.open("/pqrs-form.html", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <h2>ECA ZIPAQUIRÁ</h2>
          <p>Sistema de Gestión</p>
        </div>

        <nav className="nav-list" aria-label="Navegación principal">
          {mainNavigation.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${activeView === item.id ? "active" : ""}`}
              onClick={() => setActiveView(item.id)}
            >
              <Icon name={item.icon} className="nav-icon" />
              {item.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button
            className="theme-toggle-button"
            type="button"
            onClick={onToggleTheme}
          >
            <Icon name={theme === "dark" ? "sun" : "moon"} className="nav-icon" />
            {theme === "dark" ? "Modo claro" : "Modo oscuro"}
          </button>

          <div className={`status-card ${scaleActive ? "online" : "offline"}`}>
            <Icon
              name={scaleActive ? "wifi" : "wifiOff"}
              className="status-icon"
            />
            <div>
              <strong>
                {scaleActive ? "Báscula Activa" : "Báscula Inactiva"}
              </strong>
              <span>{scaleActive ? "Conectada" : "Sin conexión"}</span>
            </div>
          </div>

          <div className="session-card">
            <span className="session-label">Operador autenticado</span>
            <strong>{currentUser.fullName}</strong>
            <span>{currentUser.document}</span>
            <span>{currentUser.email}</span>
          </div>

          <div className="sidebar-footer">
            <p>Versión 1.0.0</p>
            <p>SuperServicios Compliant</p>
            <div className="footer-view-actions">
              {footerNavigation.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`footer-nav-button ${activeView === item.id ? "active" : ""}`}
                  onClick={() => setActiveView(item.id)}
                >
                  <Icon name={item.icon} className="nav-icon" />
                  {item.name}
                </button>
              ))}
            </div>
            <button className="logout-button" type="button" onClick={onLogout}>
              <Icon name="logout" className="nav-icon" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {activeView === "dashboard" ? (
          <DashboardPage dashboardStats={dashboardStats} />
        ) : null}
        {activeView === "recepcion" ? (
          <RecepcionPage
            selectedRecycler={selectedRecycler}
            selectedRoute={selectedRoute}
            selectedMaterial={selectedMaterial}
            weight={weight}
            rejection={rejection}
            simulatedWeight={simulatedWeight}
            isWeighing={isWeighing}
            onSelectedRecyclerChange={setSelectedRecycler}
            onSelectedRouteChange={setSelectedRoute}
            onSelectedMaterialChange={setSelectedMaterial}
            onWeightChange={setWeight}
            onRejectionChange={setRejection}
            onSimulateScale={simulateScale}
            onSubmit={handleReceptionSubmit}
          />
        ) : null}
        {activeView === "inventario" ? (
          <InventarioPage
            inventoryTotals={inventoryTotals}
            inventorySearch={inventorySearch}
            inventoryStatus={inventoryStatus}
            filteredInventory={filteredInventory}
            onInventorySearchChange={setInventorySearch}
            onInventoryStatusChange={setInventoryStatus}
          />
        ) : null}
        {activeView === "reportes" ? (
          <ReportesPage
            printPreview={printPreview}
            reportPeriod={reportPeriod}
            reportTotals={reportTotals}
            onPrintPreviewChange={setPrintPreview}
            onReportPeriodChange={setReportPeriod}
            onExportSui={exportSui}
            onExportPayments={exportPayments}
          />
        ) : null}
        {activeView === "historial" ? (
          <HistorialPage
            filteredTransactions={filteredTransactions}
            historyTotals={historyTotals}
            historySearch={historySearch}
            historyMaterial={historyMaterial}
            historyDate={historyDate}
            onHistorySearchChange={setHistorySearch}
            onHistoryMaterialChange={setHistoryMaterial}
            onHistoryDateChange={setHistoryDate}
            onExportTransactions={exportTransactions}
            onOpenReceipt={openReceipt}
          />
        ) : null}
      </main>

      <button
        className="floating-button"
        type="button"
        aria-label="Abrir formulario PQRS"
        onClick={openPqrsForm}
      >
        <Icon name="message" />
      </button>

      <div className="notice-stack" aria-live="polite">
        {notices.map((notice) => (
          <div key={notice.id} className={`notice ${notice.type}`}>
            {notice.message}
          </div>
        ))}
      </div>

      {receiptOpen && currentTransaction ? (
        <ReceiptModal
          transaction={currentTransaction}
          onClose={() => setReceiptOpen(false)}
          onReset={resetReceptionForm}
          onPushNotice={pushNotice}
        />
      ) : null}
    </div>
  );
}

function AuthScreen({
  authMode,
  authError,
  loginDocument,
  loginPassword,
  registerName,
  registerEmail,
  registerDocument,
  registerPassword,
  registerPasswordConfirm,
  onAuthModeChange,
  onLoginDocumentChange,
  onLoginPasswordChange,
  onRegisterNameChange,
  onRegisterEmailChange,
  onRegisterDocumentChange,
  onRegisterPasswordChange,
  onRegisterPasswordConfirmChange,
  onLoginSubmit,
  onRegisterSubmit,
}: {
  authMode: AuthMode;
  authError: string;
  loginDocument: string;
  loginPassword: string;
  registerName: string;
  registerEmail: string;
  registerDocument: string;
  registerPassword: string;
  registerPasswordConfirm: string;
  onAuthModeChange: (mode: AuthMode) => void;
  onLoginDocumentChange: (value: string) => void;
  onLoginPasswordChange: (value: string) => void;
  onRegisterNameChange: (value: string) => void;
  onRegisterEmailChange: (value: string) => void;
  onRegisterDocumentChange: (value: string) => void;
  onRegisterPasswordChange: (value: string) => void;
  onRegisterPasswordConfirmChange: (value: string) => void;
  onLoginSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onRegisterSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <main className="auth-shell">
      <section className="auth-hero">
        <h1>ECA Zipaquirá</h1>
      </section>

      <section className="auth-card panel">
        <div
          className="auth-toggle"
          role="tablist"
          aria-label="Opciones de acceso"
        >
          <button
            type="button"
            className={`auth-toggle-button ${authMode === "login" ? "active" : ""}`}
            onClick={() => onAuthModeChange("login")}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            className={`auth-toggle-button ${authMode === "register" ? "active" : ""}`}
            onClick={() => onAuthModeChange("register")}
          >
            Registrarse
          </button>
        </div>

        <div className="auth-heading">
          <h2>
            {authMode === "login"
              ? "Ingreso del operador"
              : "Registro del operador"}
          </h2>
        </div>

        {authError ? <div className="auth-alert">{authError}</div> : null}

        {authMode === "login" ? (
          <form className="auth-form" onSubmit={onLoginSubmit}>
            <label className="auth-field">
              <span>
                <Icon name="idCard" className="field-title-icon" />
                Documento de identidad
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Ej. 1234567890"
                value={loginDocument}
                onChange={(event) => onLoginDocumentChange(event.target.value)}
              />
            </label>

            <label className="auth-field">
              <span>
                <Icon name="lock" className="field-title-icon" />
                Contraseña
              </span>
              <input
                type="password"
                placeholder="Ingresa tu contraseña"
                value={loginPassword}
                onChange={(event) => onLoginPasswordChange(event.target.value)}
              />
            </label>

            <button className="button primary auth-submit" type="submit">
              <Icon name="check" />
              Entrar al sistema
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={onRegisterSubmit}>
            <label className="auth-field">
              <span>
                <Icon name="user" className="field-title-icon" />
                Nombre completo
              </span>
              <input
                type="text"
                placeholder="Ej. Laura Pérez Rodríguez"
                value={registerName}
                onChange={(event) => onRegisterNameChange(event.target.value)}
              />
            </label>

            <label className="auth-field">
              <span>
                <Icon name="mail" className="field-title-icon" />
                Correo electrónico
              </span>
              <input
                type="email"
                placeholder="operador@eca.com"
                value={registerEmail}
                onChange={(event) => onRegisterEmailChange(event.target.value)}
              />
            </label>

            <label className="auth-field">
              <span>
                <Icon name="idCard" className="field-title-icon" />
                Documento de identidad
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Ej. 1234567890"
                value={registerDocument}
                onChange={(event) => onRegisterDocumentChange(event.target.value)}
              />
            </label>

            <label className="auth-field">
              <span>
                <Icon name="lock" className="field-title-icon" />
                Contraseña
              </span>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={registerPassword}
                onChange={(event) => onRegisterPasswordChange(event.target.value)}
              />
            </label>

            <label className="auth-field">
              <span>
                <Icon name="lock" className="field-title-icon" />
                Confirmar contraseña
              </span>
              <input
                type="password"
                placeholder="Repite la contraseña"
                value={registerPasswordConfirm}
                onChange={(event) =>
                  onRegisterPasswordConfirmChange(event.target.value)
                }
              />
            </label>

            <button className="button primary auth-submit" type="submit">
              <Icon name="check" />
              Crear operador y entrar
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

function App() {
  const [theme, setTheme] = useState<ThemeMode>(readStoredTheme);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(
    readStoredSession,
  );
  const [loginDocument, setLoginDocument] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerDocument, setRegisterDocument] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState("");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

  const clearAuthForm = () => {
    setLoginDocument("");
    setLoginPassword("");
    setRegisterName("");
    setRegisterEmail("");
    setRegisterDocument("");
    setRegisterPassword("");
    setRegisterPasswordConfirm("");
  };

  const normalizeDocument = (value: string) => value.replace(/\D/g, "");

  const persistSession = (user: StoredUser | AuthUser) => {
    const sessionUser = toSessionUser(user);
    localStorage.setItem(authSessionStorageKey, JSON.stringify(sessionUser));
    setCurrentUser(sessionUser);
  };

  const switchAuthMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setAuthError("");
  };

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");

    const document = normalizeDocument(loginDocument);
    const password = loginPassword.trim();

    if (!document || !password) {
      setAuthError("Ingresa tu documento de identidad y la contraseña.");
      return;
    }

    const user = readStoredUsers().find(
      (item) => item.document === document && item.password === password,
    );

    if (!user) {
      setAuthError("Las credenciales no coinciden con un operador registrado.");
      return;
    }

    persistSession(user);
    clearAuthForm();
  };

  const handleRegister = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");

    const fullName = registerName.trim();
    const email = registerEmail.trim().toLowerCase();
    const document = normalizeDocument(registerDocument);
    const password = registerPassword.trim();
    const passwordConfirm = registerPasswordConfirm.trim();

    if (!fullName || !email || !document || !password || !passwordConfirm) {
      setAuthError("Completa todos los campos del registro.");
      return;
    }

    if (!email.includes("@")) {
      setAuthError("Ingresa un correo electrónico válido.");
      return;
    }

    if (password.length < 6) {
      setAuthError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== passwordConfirm) {
      setAuthError("La confirmación de la contraseña no coincide.");
      return;
    }

    const users = readStoredUsers();

    if (users.some((item) => item.document === document)) {
      setAuthError("Ya existe un operador registrado con ese documento.");
      return;
    }

    if (users.some((item) => item.email === email)) {
      setAuthError("Ya existe un operador registrado con ese correo.");
      return;
    }

    const user: StoredUser = {
      id: `OP-${Date.now()}`,
      fullName,
      email,
      document,
      password,
      role: "Operador",
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(authUsersStorageKey, JSON.stringify([user, ...users]));
    persistSession(user);
    clearAuthForm();
  };

  const handleLogout = () => {
    localStorage.removeItem(authSessionStorageKey);
    setCurrentUser(null);
    setAuthMode("login");
    setAuthError("");
  };

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  if (currentUser) {
    return (
      <AuthenticatedApp
        currentUser={currentUser}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <AuthScreen
      authMode={authMode}
      authError={authError}
      loginDocument={loginDocument}
      loginPassword={loginPassword}
      registerName={registerName}
      registerEmail={registerEmail}
      registerDocument={registerDocument}
      registerPassword={registerPassword}
      registerPasswordConfirm={registerPasswordConfirm}
      onAuthModeChange={switchAuthMode}
      onLoginDocumentChange={setLoginDocument}
      onLoginPasswordChange={setLoginPassword}
      onRegisterNameChange={setRegisterName}
      onRegisterEmailChange={setRegisterEmail}
      onRegisterDocumentChange={setRegisterDocument}
      onRegisterPasswordChange={setRegisterPassword}
      onRegisterPasswordConfirmChange={setRegisterPasswordConfirm}
      onLoginSubmit={handleLogin}
      onRegisterSubmit={handleRegister}
    />
  );
}

export default App;
