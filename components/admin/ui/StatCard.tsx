"use client";

import type { ReactNode } from "react";
import { Skeleton } from "antd";
import "./admin-ui.css";

export interface StatCardProps {
  /** Short label, e.g. "Jami arizalar". */
  label: ReactNode;
  /** The figure. Numbers are formatted with toLocaleString(). */
  value: ReactNode;
  /** Icon shown in a tinted square. */
  icon?: ReactNode;
  /** Accent color (hex) for the icon square. Defaults to the admin primary. */
  color?: string;
  /** Optional secondary line under the value. */
  hint?: ReactNode;
  /** Shows a skeleton instead of the value. */
  loading?: boolean;
  /** "card" (default, standalone surface) or "sunken" (inside a modal/card). */
  variant?: "card" | "sunken";
  className?: string;
}

/** KPI tile. Put several inside <StatGrid>. */
export function StatCard({
  label,
  value,
  icon,
  color = "#7367f0",
  hint,
  loading = false,
  variant = "card",
  className,
}: StatCardProps) {
  const display = typeof value === "number" ? value.toLocaleString() : value;
  return (
    <div
      className={`admin-card ${variant === "sunken" ? "admin-card--sunken" : ""} flex items-center gap-3 sm:gap-4 p-4 sm:p-5 ${className ?? ""}`}
    >
      {icon ? (
        <div
          className="flex h-11 w-11 sm:h-12 sm:w-12 flex-none items-center justify-center rounded-xl text-xl"
          style={{ background: `${color}1f`, color }}
          aria-hidden
        >
          {icon}
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="admin-muted text-[13px] font-medium leading-snug break-words">{label}</div>
        {loading ? (
          <Skeleton.Input active size="small" style={{ width: 72, marginTop: 6 }} />
        ) : (
          <div className="admin-heading admin-tabular mt-0.5 text-xl sm:text-2xl font-bold leading-tight break-words">
            {display}
          </div>
        )}
        {hint ? <div className="admin-muted mt-0.5 text-xs">{hint}</div> : null}
      </div>
    </div>
  );
}

const DESKTOP_COLS: Record<2 | 3 | 4, string> = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

export interface StatGridProps {
  children: ReactNode;
  /** Columns from `lg` (1024px) up. Mobile is always 1 column, tablet 2. Default 4. */
  columns?: 2 | 3 | 4;
  className?: string;
}

/** Responsive grid for StatCards: 1 col on phones, 2 on tablets, `columns` on desktop. */
export function StatGrid({ children, columns = 4, className }: StatGridProps) {
  return (
    <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 ${DESKTOP_COLS[columns]} ${className ?? ""}`}>
      {children}
    </div>
  );
}
