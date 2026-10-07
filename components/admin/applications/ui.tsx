"use client";

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { Button, Tooltip } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useThemeStore } from "@/lib/stores/themeStore";

/**
 * Small responsive building blocks shared by the admin "applications" and
 * "specialities" pages. Colours follow the legacy admin palette (purple
 * #7367f0 accent, navy dark surfaces) so the pages blend with the admin shell.
 */

export const ADMIN_ACCENT = "#7367f0";

export interface AdminSurface {
  isDark: boolean;
  text: string;
  heading: string;
  muted: string;
  cardBg: string;
  cardBorder: string;
  subtleBg: string;
  subtleBorder: string;
  divider: string;
  barBg: string;
}

export function useAdminSurface(): AdminSurface {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  return {
    isDark,
    text: isDark ? "#e2e8f0" : "#484650",
    heading: isDark ? "#ffffff" : "#2f2b3d",
    muted: isDark ? "#94a3b8" : "#6b7280",
    cardBg: isDark ? "rgb(40, 48, 70)" : "#ffffff",
    cardBorder: isDark ? "rgb(59, 66, 83)" : "rgb(235, 233, 241)",
    subtleBg: isDark ? "rgba(255, 255, 255, 0.03)" : "#f9f9fb",
    subtleBorder: isDark ? "rgba(255, 255, 255, 0.06)" : "#ececf1",
    divider: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)",
    barBg: isDark ? "rgba(40, 48, 70, 0.96)" : "rgba(255, 255, 255, 0.96)",
  };
}

/* ------------------------------------------------------------------ */
/* Page header                                                         */
/* ------------------------------------------------------------------ */

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  backHref?: string;
  backLabel?: string;
  /** Rendered next to the title (e.g. a status tag). */
  meta?: ReactNode;
  actions?: ReactNode;
}

/** Title + actions; stacks vertically below `md`, actions wrap on small screens. */
export function PageHeader({ title, subtitle, backHref, backLabel = "Orqaga", meta, actions }: PageHeaderProps) {
  const s = useAdminSurface();
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-6">
      <div className="min-w-0 flex-1">
        {backHref && (
          <Link
            href={backHref}
            className="mb-2 inline-flex min-h-[44px] items-center gap-2 text-sm font-medium sm:min-h-0"
            style={{ color: s.muted }}
          >
            <ArrowLeftOutlined />
            {backLabel}
          </Link>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1
            className="m-0 min-w-0 break-words text-xl font-bold leading-tight sm:text-2xl"
            style={{ color: s.heading }}
          >
            {title}
          </h1>
          {meta}
        </div>
        {subtitle && (
          <div className="mt-1 text-sm font-medium" style={{ color: s.muted }}>
            {subtitle}
          </div>
        )}
      </div>
      {actions && <div className="w-full md:w-auto md:shrink-0">{actions}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section card                                                        */
/* ------------------------------------------------------------------ */

interface SectionCardProps {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  extra?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Remove body padding (e.g. for edge-to-edge tables). */
  flush?: boolean;
}

export function SectionCard({
  title,
  description,
  icon,
  extra,
  children,
  className = "",
  bodyClassName = "",
  flush = false,
}: SectionCardProps) {
  const s = useAdminSurface();
  return (
    <section
      className={`overflow-hidden rounded-xl ${className}`}
      style={{
        background: s.cardBg,
        border: `1px solid ${s.cardBorder}`,
        boxShadow: s.isDark ? "none" : "0 4px 12px rgba(0, 0, 0, 0.04)",
      }}
    >
      {(title || extra) && (
        <header
          className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
          style={{ borderBottom: `1px solid ${s.divider}` }}
        >
          <div className="flex min-w-0 items-start gap-3">
            {icon && (
              <span
                className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base"
                style={{ background: "rgba(115, 103, 240, 0.12)", color: ADMIN_ACCENT }}
              >
                {icon}
              </span>
            )}
            <div className="min-w-0">
              {title && (
                <h2 className="m-0 text-base font-semibold leading-snug" style={{ color: s.heading }}>
                  {title}
                </h2>
              )}
              {description && (
                <p className="m-0 mt-0.5 text-sm" style={{ color: s.muted }}>
                  {description}
                </p>
              )}
            </div>
          </div>
          {extra && <div className="flex flex-wrap gap-2 sm:shrink-0">{extra}</div>}
        </header>
      )}
      <div className={`${flush ? "" : "p-4 sm:p-6"} ${bodyClassName}`}>{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Action bars                                                         */
/* ------------------------------------------------------------------ */

/**
 * Save / cancel bar for long forms. Sticks to the bottom of the viewport on
 * phones so the primary action is always reachable; static on larger screens.
 */
export function StickyActionBar({ children }: { children: ReactNode }) {
  const s = useAdminSurface();
  return (
    <div
      className="sticky bottom-0 z-20 -mx-1 mt-6 flex flex-col-reverse gap-2 rounded-t-xl px-3 pt-3 backdrop-blur sm:static sm:mx-0 sm:flex-row sm:justify-end sm:rounded-none sm:bg-transparent! sm:px-0 sm:pt-4 sm:shadow-none! sm:border-t-0! sm:backdrop-blur-none [&_.ant-btn]:min-h-[44px] sm:[&_.ant-btn]:min-h-0"
      style={{
        background: s.barBg,
        borderTop: `1px solid ${s.divider}`,
        boxShadow: s.isDark ? "0 -6px 16px rgba(0,0,0,0.35)" : "0 -6px 16px rgba(0,0,0,0.06)",
        paddingBottom: "max(12px, env(safe-area-inset-bottom))",
      }}
    >
      {children}
    </div>
  );
}

/** Footer row for forms inside modals: full-width stacked buttons on phones. */
export function ModalActions({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end [&_.ant-btn]:min-h-[44px] sm:[&_.ant-btn]:min-h-0 ${className}`}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Icon action button (44px touch target on phones)                    */
/* ------------------------------------------------------------------ */

export type ActionTone = "primary" | "success" | "info" | "warning" | "neutral" | "amber" | "danger";

const toneClasses: Record<ActionTone, { light: string; dark: string }> = {
  primary: {
    light: "bg-[#7367f0]/10 text-[#7367f0] hover:bg-[#7367f0]! hover:text-white!",
    dark: "bg-[#7367f0]/20 text-[#a59cf5] hover:bg-[#7367f0]! hover:text-white!",
  },
  success: {
    light: "bg-green-500/10 text-green-600 hover:bg-green-500! hover:text-white!",
    dark: "bg-green-500/20 text-green-400 hover:bg-green-500! hover:text-white!",
  },
  info: {
    light: "bg-blue-500/10 text-blue-600 hover:bg-blue-500! hover:text-white!",
    dark: "bg-blue-500/20 text-blue-400 hover:bg-blue-500! hover:text-white!",
  },
  warning: {
    light: "bg-orange-500/10 text-orange-600 hover:bg-orange-500! hover:text-white!",
    dark: "bg-orange-500/20 text-orange-400 hover:bg-orange-500! hover:text-white!",
  },
  neutral: {
    light: "bg-gray-500/10 text-gray-600 hover:bg-gray-500! hover:text-white!",
    dark: "bg-gray-500/20 text-gray-300 hover:bg-gray-500! hover:text-white!",
  },
  amber: {
    light: "bg-amber-500/10 text-amber-600 hover:bg-amber-500! hover:text-white!",
    dark: "bg-amber-500/20 text-amber-400 hover:bg-amber-500! hover:text-white!",
  },
  danger: {
    light: "bg-red-500/10 text-red-500 hover:bg-red-500! hover:text-white!",
    dark: "bg-red-500/20 text-red-400 hover:bg-red-500! hover:text-white!",
  },
};

interface IconActionProps {
  icon: ReactNode;
  label: string;
  tone?: ActionTone;
  onClick?: () => void;
  loading?: boolean;
  /** Show the text label next to the icon (used in mobile card lists). */
  showLabel?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function IconAction({
  icon,
  label,
  tone = "primary",
  onClick,
  loading,
  showLabel = false,
  className = "",
  style,
}: IconActionProps) {
  const { isDark } = useAdminSurface();
  const toneClass = toneClasses[tone][isDark ? "dark" : "light"];
  const button = (
    <Button
      aria-label={label}
      title={showLabel ? undefined : label}
      onClick={onClick}
      loading={loading}
      icon={icon}
      className={`h-11! min-w-11 rounded-xl! border-0! shadow-none! transition-colors md:h-10! md:min-w-10 ${
        showLabel ? "w-full justify-center px-3!" : "w-11! px-0! md:w-10!"
      } ${toneClass} ${className}`}
      style={style}
    >
      {showLabel ? label : null}
    </Button>
  );
  return showLabel ? button : <Tooltip title={label}>{button}</Tooltip>;
}

/* ------------------------------------------------------------------ */
/* Status pill                                                         */
/* ------------------------------------------------------------------ */

const APPLICATION_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Qoralama",
  PUBLISHED: "E'lon qilingan",
  CLOSED: "Yopilgan",
  ARCHIVED: "Arxivlangan",
};

export function ApplicationStatusPill({ status }: { status: string }) {
  const tone =
    status === "PUBLISHED"
      ? "bg-green-500/10 text-green-500 border-green-500/20"
      : status === "CLOSED"
        ? "bg-red-500/10 text-red-500 border-red-500/20"
        : "bg-gray-500/10 text-gray-500 border-gray-500/20";
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${tone}`}
    >
      {APPLICATION_STATUS_LABELS[status] || status}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Label / value                                                       */
/* ------------------------------------------------------------------ */

export function InfoItem({ label, children, className = "" }: { label: ReactNode; children: ReactNode; className?: string }) {
  const s = useAdminSurface();
  return (
    <div className={`min-w-0 ${className}`}>
      <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: s.muted }}>
        {label}
      </div>
      <div className="mt-0.5 break-words text-sm" style={{ color: s.text }}>
        {children}
      </div>
    </div>
  );
}

/** Shared table header cell: optional icon + uppercase label. */
export function ColumnTitle({ icon, children, center }: { icon?: ReactNode; children: ReactNode; center?: boolean }) {
  return (
    <div className={`flex items-center gap-2 py-3 ${center ? "justify-center" : ""}`}>
      {icon && <span className="text-[#7367f0]">{icon}</span>}
      <span className="whitespace-nowrap text-xs font-bold uppercase tracking-wider text-gray-500">{children}</span>
    </div>
  );
}

/** Theme-aware styles for the `.custom-admin-table` antd tables on these pages. */
export function AdminTableStyles() {
  const { isDark } = useAdminSurface();
  return (
    <style jsx global>{`
      .custom-admin-table .ant-table {
        background: transparent !important;
        color: ${isDark ? "#e2e8f0" : "#484650"} !important;
      }
      .custom-admin-table .ant-table-thead > tr > th {
        background: ${isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.015)"} !important;
        border-bottom: ${isDark ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(0, 0, 0, 0.05)"} !important;
        color: ${isDark ? "#94a3b8" : "#64748b"} !important;
        font-weight: 700 !important;
      }
      .custom-admin-table .ant-table-tbody > tr > td {
        border-bottom: ${isDark ? "1px solid rgba(255, 255, 255, 0.03)" : "1px solid rgba(0, 0, 0, 0.04)"} !important;
      }
      .custom-admin-table .ant-table-tbody > tr:hover > td {
        background: ${isDark ? "rgba(115, 103, 240, 0.05)" : "rgba(115, 103, 240, 0.03)"} !important;
      }
      .custom-admin-table .ant-pagination,
      .admin-mobile-pagination {
        row-gap: 8px;
        flex-wrap: wrap;
      }
      .custom-admin-table .ant-pagination-item-active,
      .admin-mobile-pagination .ant-pagination-item-active {
        border-color: #7367f0 !important;
        background: #7367f0 !important;
      }
      .custom-admin-table .ant-pagination-item-active a,
      .admin-mobile-pagination .ant-pagination-item-active a {
        color: #fff !important;
      }
      .premium-popconfirm .ant-popover-inner {
        background: ${isDark ? "rgb(50, 58, 80)" : "#ffffff"} !important;
        color: ${isDark ? "#ffffff" : "#000000"} !important;
        border: ${isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "none"} !important;
      }
      .premium-popconfirm .ant-popover-message,
      .premium-popconfirm .ant-popover-description {
        color: ${isDark ? "#e2e8f0" : "inherit"} !important;
      }
    `}</style>
  );
}
