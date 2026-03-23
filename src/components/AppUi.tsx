import type { ReactNode } from "react";

import type {
  IconName,
  LegendTone,
  SummaryAccent,
  TrendType,
} from "../types/app";

export function Icon({
  name,
  className = "",
}: {
  name: IconName;
  className?: string;
}) {
  const icons: Record<IconName, string> = {
    dashboard: "M4 13h7V4H4zm9 7h7V4h-7zm-9 0h7v-5H4z",
    scale: "M12 3v3m-7 4h14M7 10l-3 6h6zm10 0l-3 6h6zM8 20h8",
    package: "M12 3l8 4.5v9L12 21l-8-4.5v-9zm0 0v18m8-13.5l-8 4.5-8-4.5",
    report: "M5 19V5h14v14M9 15v-3m4 3V9m4 6V7",
    history: "M4 12a8 8 0 101.9-5.2M4 4v5h5",
    wifi: "M4.9 9A12 12 0 0119 9M8.5 12.5a6.7 6.7 0 017 0M12 18h.01",
    wifiOff:
      "M3 3l18 18M8.5 12.5a6.7 6.7 0 012.1-.9m4.9.9a6.7 6.7 0 00-1.6-.8M4.9 9A12 12 0 0112 6c1.9 0 3.7.4 5.2 1.1",
    message: "M5 6h14v10H8l-3 3z",
    search: "M11 5a6 6 0 100 12 6 6 0 000-12zm8 14l-3.5-3.5",
    filter: "M4 6h16M7 12h10M10 18h4",
    calendar: "M7 3v4m10-4v4M4 9h16v11H4z",
    user: "M12 12a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 0114 0",
    location: "M12 21s6-5.3 6-11a6 6 0 10-12 0c0 5.7 6 11 6 11z",
    warning: "M12 4l9 16H3zm0 5v4m0 4h.01",
    download: "M12 4v10m0 0l-4-4m4 4l4-4M5 20h14",
    printer: "M7 8V4h10v4M6 17H4v-6h16v6h-2m-10 0h8v3H8z",
    send: "M21 3L3 11l7 2 2 7z",
    check: "M5 13l4 4L19 7",
    refresh: "M20 5v6h-6M4 19v-6h6M6.5 8A7 7 0 0118 6m-12 12a7 7 0 0011.5 2",
    truck:
      "M3 7h11v8H3zm11 3h4l3 3v2h-7M7 18a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z",
    trendUp: "M4 16l6-6 4 4 6-8M20 6v4h-4",
    trendDown: "M4 8l6 6 4-4 6 8M20 18v-4h-4",
    bar: "M5 19V9m7 10V5m7 14v-7",
    mail: "M4 6h16v12H4zm0 0l8 6 8-6",
    lock: "M7 11V8a5 5 0 0110 0v3m-9 0h8v9H8z",
    logout: "M10 17l5-5-5-5M15 12H3m9-9h6v18h-6",
    idCard: "M4 7h16v10H4zm3 0v10m3-6h6m-6 3h4",
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={icons[name]} />
    </svg>
  );
}

export function Field({
  label,
  icon,
  hint,
  children,
}: {
  label: string;
  icon: IconName;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="field-group">
      <span className="field-label">
        <Icon name={icon} className="field-title-icon" />
        {label}
      </span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

export function MetricCard({
  title,
  value,
  detail,
  trend,
  trendType,
  icon,
}: {
  title: string;
  value: string;
  detail: string;
  trend: string;
  trendType: TrendType;
  icon: IconName;
}) {
  const trendIcon =
    trendType === "up" ? "trendUp" : trendType === "down" ? "trendDown" : icon;

  return (
    <article className="panel metric-card">
      <div className="metric-head">
        <div>
          <p>{title}</p>
          <strong>{value}</strong>
        </div>
        <Icon name={icon} className="metric-icon" />
      </div>
      <span className="metric-detail">{detail}</span>
      <span className={`metric-trend ${trendType}`}>
        <Icon name={trendIcon} className="trend-icon" />
        {trend}
      </span>
    </article>
  );
}

export function SummaryPanel({
  title,
  value,
  subtitle,
  icon,
  accent,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon?: IconName;
  accent?: SummaryAccent;
}) {
  return (
    <article className={`panel summary-panel ${accent ?? ""}`}>
      <div>
        <p>{title}</p>
        <strong>{value}</strong>
        {subtitle ? <span>{subtitle}</span> : null}
      </div>
      {icon ? <Icon name={icon} className="summary-icon" /> : null}
    </article>
  );
}

export function LegendDot({
  tone,
  label,
}: {
  tone: LegendTone;
  label: string;
}) {
  return (
    <span className="legend-item">
      <i className={`legend-dot ${tone}`} />
      {label}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  text,
}: {
  icon: IconName;
  title: string;
  text: string;
}) {
  return (
    <div className="empty-state">
      <Icon name={icon} className="empty-icon" />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

export function InfoBlock({
  icon,
  label,
  value,
  strong,
  highlight,
  extra,
}: {
  icon: IconName;
  label: string;
  value: string;
  strong?: boolean;
  highlight?: boolean;
  extra?: string;
}) {
  return (
    <div className="info-block">
      <Icon
        name={icon}
        className={`info-icon ${highlight ? "highlight" : ""}`}
      />
      <div>
        <span>{label}</span>
        <strong
          className={
            strong ? "value-strong" : highlight ? "value-highlight" : ""
          }
        >
          {value}
        </strong>
        {extra ? <small>{extra}</small> : null}
      </div>
    </div>
  );
}
