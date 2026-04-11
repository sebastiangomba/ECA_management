import { type FormEvent, useEffect, useMemo, useState } from "react";

import "./App.css";
import { Icon } from "./components/AppUi";
import { balanceData, inventoryData, navigation, recyclerPayments, themeStorageKey } from "./data/mockData";
import { useNotices } from "./hooks/useNotices";
import { DashboardPage } from "./pages/DashboardPage";
import { HistorialPage } from "./pages/HistorialPage";
import { InventarioPage } from "./pages/InventarioPage";
import { RecepcionPage } from "./pages/RecepcionPage";
import { ReportesPage } from "./pages/ReportesPage";
import {
  ApiError,
  clearTokens,
  getStoredUser,
  loginByDocumento,
  type ApiUser,
} from "./services/api";
import type { Notice, ViewId } from "./types/app";
import { downloadCsv } from "./utils/format";

type ThemeMode = "dark" | "light";

function readStoredTheme(): ThemeMode {
  return localStorage.getItem(themeStorageKey) === "light" ? "light" : "dark";
}

// ============================================================
// SHELL DE APLICACIÓN AUTENTICADA
// ============================================================

function AuthenticatedApp({
  currentUser,
  onLogout,
  theme,
  onToggleTheme,
}: {
  currentUser: ApiUser;
  onLogout: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}) {
  const [activeView, setActiveView] = useState<ViewId>("dashboard");
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryStatus, setInventoryStatus] = useState("all");
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

  const inventoryTotals = useMemo(() => {
    const totalStock   = inventoryData.reduce((s, i) => s + i.stock, 0);
    const criticalItems = inventoryData.filter(
      (i) => i.status === "critical" || i.status === "low",
    ).length;
    return { totalStock, criticalItems };
  }, []);

  const reportTotals = useMemo(() => {
    const totalIngresado  = balanceData.reduce((s, i) => s + i.ingresado,  0);
    const totalRechazos   = balanceData.reduce((s, i) => s + i.rechazos,   0);
    const totalAprovechado = balanceData.reduce((s, i) => s + i.aprovechado, 0);
    return {
      totalIngresado,
      totalRechazos,
      totalAprovechado,
      rejectionPercent: ((totalRechazos / totalIngresado) * 100).toFixed(1),
    };
  }, []);

  const exportSui = () => {
    downloadCsv(`reporte_SUI_${new Date().toISOString().split("T")[0]}.csv`, [
      ["Código Material", "Material", "Ingresado (kg)", "Rechazos (kg)", "Aprovechado (kg)", "% Rechazo"],
      ...balanceData.map((item) => [
        item.material, item.material,
        item.ingresado, item.rechazos, item.aprovechado,
        ((item.rechazos / item.ingresado) * 100).toFixed(2),
      ]),
    ]);
    pushNotice("success", "Archivo SUI generado.");
  };

  const exportPayments = () => {
    downloadCsv(`resumen_pagos_${new Date().toISOString().split("T")[0]}.csv`, [
      ["Reciclador", "Toneladas", "Pago (COP)", "Eficiencia (%)"],
      ...recyclerPayments.map((item) => [item.name, item.tons, item.payments, item.efficiency]),
    ]);
    pushNotice("success", "Resumen de pagos exportado.");
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
          <button className="theme-toggle-button" type="button" onClick={onToggleTheme}>
            <Icon name={theme === "dark" ? "sun" : "moon"} className="nav-icon" />
            {theme === "dark" ? "Modo claro" : "Modo oscuro"}
          </button>

          <div className={`status-card ${scaleActive ? "online" : "offline"}`}>
            <Icon name={scaleActive ? "wifi" : "wifiOff"} className="status-icon" />
            <div>
              <strong>{scaleActive ? "Báscula Activa" : "Báscula Inactiva"}</strong>
              <span>{scaleActive ? "Conectada" : "Sin conexión"}</span>
            </div>
          </div>

          <div className="session-card">
            <span className="session-label">Operador autenticado</span>
            <strong>{currentUser.nombre}</strong>
            {currentUser.num_documento ? <span>CC {currentUser.num_documento}</span> : null}
            <span className="session-role">{currentUser.rol}</span>
          </div>

          <div className="sidebar-footer">
            <p>Versión 1.0.0 · SuperServicios Compliant</p>
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
          <DashboardPage />
        ) : null}

        {activeView === "recepcion" ? (
          <RecepcionPage currentUser={currentUser} onPushNotice={pushNotice} />
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
          <HistorialPage />
        ) : null}
      </main>

      {/* Botón flotante PQRS */}
      <button
        className="floating-button"
        type="button"
        aria-label="Abrir formulario PQRS"
        onClick={() => window.open("/pqrs-form.html", "_blank", "noopener,noreferrer")}
      >
        <Icon name="message" />
      </button>

      {/* Stack de notificaciones */}
      <div className="notice-stack" aria-live="polite">
        {notices.map((notice: Notice) => (
          <div key={notice.id} className={`notice ${notice.type}`}>
            {notice.message}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// PANTALLA DE LOGIN
// ============================================================

function AuthScreen({
  loading,
  error,
  document,
  password,
  onDocumentChange,
  onPasswordChange,
  onSubmit,
}: {
  loading: boolean;
  error: string;
  document: string;
  password: string;
  onDocumentChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <main className="auth-shell">
      <section className="auth-hero">
        <h1>ECA Zipaquirá</h1>
      </section>

      <section className="auth-card panel">
        <div className="auth-heading">
          <h2>Ingreso del operador</h2>
          <p>Ingresa con tu documento de identidad y contraseña</p>
        </div>

        {error ? <div className="auth-alert">{error}</div> : null}

        <form className="auth-form" onSubmit={onSubmit}>
          <label className="auth-field">
            <span>
              <Icon name="idCard" className="field-title-icon" />
              Documento de identidad
            </span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Ej. 1047034711"
              value={document}
              onChange={(e) => onDocumentChange(e.target.value)}
              autoComplete="username"
              disabled={loading}
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
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
          </label>

          <button
            className="button primary auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <><Icon name="refresh" className="spin" /> Verificando...</>
            ) : (
              <><Icon name="check" /> Entrar al sistema</>
            )}
          </button>
        </form>

        <p className="auth-hint">
          Demo: documento <strong>1047034711</strong> · contraseña <strong>eca2026dev</strong>
        </p>
      </section>
    </main>
  );
}

// ============================================================
// ROOT APP
// ============================================================

function App() {
  const [theme, setTheme] = useState<ThemeMode>(readStoredTheme);
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(getStoredUser);

  // Campos del formulario de login
  const [loginDocument, setLoginDocument] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError,    setLoginError]    = useState("");
  const [loginLoading,  setLoginLoading]  = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError("");

    const doc = loginDocument.replace(/\D/g, "").trim();
    const pwd = loginPassword.trim();

    if (!doc || !pwd) {
      setLoginError("Ingresa tu documento y contraseña.");
      return;
    }

    setLoginLoading(true);
    try {
      const user = await loginByDocumento(doc, pwd);
      setCurrentUser(user);
      setLoginDocument("");
      setLoginPassword("");
    } catch (err) {
      const msg = err instanceof ApiError
        ? err.userMessage
        : "No se pudo conectar con el servidor. Verifica que el backend esté activo.";
      setLoginError(msg);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    clearTokens();
    setCurrentUser(null);
    setLoginError("");
  };

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

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
      loading={loginLoading}
      error={loginError}
      document={loginDocument}
      password={loginPassword}
      onDocumentChange={setLoginDocument}
      onPasswordChange={setLoginPassword}
      onSubmit={handleLogin}
    />
  );
}

export default App;
