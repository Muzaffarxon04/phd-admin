"use client";

/**
 * Small responsive building blocks shared by the admin submissions and
 * examiners pages. They only deal with layout/visuals — no data logic.
 *
 * Colours follow the existing admin palette (primary #7367f0, dark surface
 * rgb(40,48,70)) so the pages keep their current look while gaining
 * consistent spacing, radii and mobile behaviour.
 */

import type { CSSProperties, ReactNode } from "react";
import { useThemeStore } from "@/lib/stores/themeStore";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { getApplicationStatusLabel } from "@/lib/utils";

export const ADMIN_PRIMARY = "#7367f0";

/** < 768px: phones and small tablets in portrait. */
export function useIsAdminMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}

export interface AdminSurface {
  isDark: boolean;
  surface: string;
  subtle: string;
  border: string;
  divider: string;
  text: string;
  muted: string;
  shadow: string;
}

export function useAdminSurface(): AdminSurface {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  return {
    isDark,
    surface: isDark ? "rgb(40, 48, 70)" : "#ffffff",
    subtle: isDark ? "rgba(255, 255, 255, 0.03)" : "#f8f9fa",
    border: isDark ? "rgb(59, 66, 83)" : "rgb(235, 233, 241)",
    divider: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)",
    text: isDark ? "#ffffff" : "#484650",
    muted: isDark ? "#94a3b8" : "#6e6b7b",
    shadow: isDark ? "none" : "0 4px 12px rgba(0, 0, 0, 0.05)",
  };
}

/** Drawer width that never exceeds the phone viewport. */
export function drawerWidth(isMobile: boolean, desktop = 420): number | string {
  return isMobile ? "100%" : desktop;
}

/* ------------------------------------------------------------------ */
/* Page header                                                         */
/* ------------------------------------------------------------------ */

export function PageHeader({
  title,
  subtitle,
  leading,
  extra,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  leading?: ReactNode;
  extra?: ReactNode;
}) {
  const s = useAdminSurface();
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        {leading}
        <div className="min-w-0">
          <h1
            className="m-0 text-xl font-bold leading-tight sm:text-2xl break-words"
            style={{ color: s.text }}
          >
            {title}
          </h1>
          {subtitle ? (
            <div className="mt-1 text-sm font-medium" style={{ color: s.muted }}>
              {subtitle}
            </div>
          ) : null}
        </div>
      </div>
      {extra ? <div className="min-w-0">{extra}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Cards / sections                                                    */
/* ------------------------------------------------------------------ */

export function AdminCard({
  children,
  className = "",
  style,
  padded = false,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  padded?: boolean;
}) {
  const s = useAdminSurface();
  return (
    <section
      className={`min-w-0 rounded-xl ${padded ? "p-4 sm:p-6" : ""} ${className}`}
      style={{
        background: s.surface,
        border: `1px solid ${s.border}`,
        boxShadow: s.shadow,
        ...style,
      }}
    >
      {children}
    </section>
  );
}

export function SectionHeader({
  icon,
  title,
  accent = ADMIN_PRIMARY,
  extra,
}: {
  icon?: ReactNode;
  title: ReactNode;
  accent?: string;
  extra?: ReactNode;
}) {
  const s = useAdminSurface();
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6 sm:py-4"
      style={{ borderColor: s.divider }}
    >
      <div className="flex min-w-0 items-center gap-3">
        {icon ? (
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg"
            style={{ background: `${accent}1f`, color: accent }}
          >
            {icon}
          </span>
        ) : null}
        <h2 className="m-0 text-base font-semibold" style={{ color: s.text }}>
          {title}
        </h2>
      </div>
      {extra}
    </div>
  );
}

/**
 * Label / value row. Stacks on narrow screens, side-by-side from `sm`.
 * Long values wrap instead of pushing the page wider.
 */
export function InfoRow({ label, children }: { label: ReactNode; children: ReactNode }) {
  const s = useAdminSurface();
  return (
    <div className="flex flex-col gap-0.5 py-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <span className="shrink-0 text-[13px]" style={{ color: s.muted }}>
        {label}
      </span>
      <span
        className="min-w-0 break-words text-sm font-semibold sm:text-right"
        style={{ color: s.text, overflowWrap: "anywhere" }}
      >
        {children}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Status badges                                                       */
/* ------------------------------------------------------------------ */

const PILL_TONES = {
  green: { light: "#15803d", dark: "#4ade80", rgb: "34, 197, 94" },
  red: { light: "#dc2626", dark: "#f87171", rgb: "239, 68, 68" },
  orange: { light: "#c2410c", dark: "#fb923c", rgb: "249, 115, 22" },
  gray: { light: "#52525b", dark: "#d4d4d8", rgb: "113, 113, 122" },
  purple: { light: "#5e50ee", dark: "#a29bfe", rgb: "115, 103, 240" },
  blue: { light: "#1d4ed8", dark: "#60a5fa", rgb: "59, 130, 246" },
} as const;

export type PillTone = keyof typeof PILL_TONES;

export function Pill({ tone, children }: { tone: PillTone; children: ReactNode }) {
  const { isDark } = useAdminSurface();
  const t = PILL_TONES[tone];
  return (
    <span
      className="inline-flex max-w-full items-center whitespace-normal break-words rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase leading-5 tracking-wide"
      style={{
        color: isDark ? t.dark : t.light,
        background: `rgba(${t.rgb}, ${isDark ? 0.16 : 0.1})`,
        borderColor: `rgba(${t.rgb}, 0.28)`,
      }}
    >
      {children}
    </span>
  );
}

export function submissionStatusTone(status: string): PillTone {
  switch (status) {
    case "APPROVED":
      return "green";
    case "REJECTED":
      return "red";
    case "DRAFT":
      return "gray";
    case "WITHDRAWN":
      return "orange";
    default:
      return "purple";
  }
}

export function SubmissionStatusPill({ status }: { status: string }) {
  return <Pill tone={submissionStatusTone(status)}>{getApplicationStatusLabel(status)}</Pill>;
}

const PAYMENT_LABELS: Record<string, string> = {
  PENDING: "Kutilmoqda",
  PAID: "To'langan",
  FAILED: "Xatolik",
};

export function PaymentStatusPill({ status }: { status: string }) {
  const tone: PillTone = status === "PAID" ? "green" : status === "FAILED" ? "red" : "orange";
  return <Pill tone={tone}>{PAYMENT_LABELS[status] || status}</Pill>;
}

/* ------------------------------------------------------------------ */
/* Action bar                                                          */
/* ------------------------------------------------------------------ */

/**
 * Primary actions. On phones it sticks to the bottom of the viewport so the
 * review buttons are always in thumb reach; on larger screens it renders
 * inline (wherever it is placed).
 */
export function StickyActionBar({ children, isMobile }: { children: ReactNode; isMobile: boolean }) {
  const s = useAdminSurface();
  if (!isMobile) {
    return <div className="flex flex-wrap items-center justify-end gap-3">{children}</div>;
  }
  return (
    <div
      className="sticky bottom-0 z-20 -mx-1 mt-2 rounded-xl border p-3"
      style={{
        background: s.surface,
        borderColor: s.border,
        boxShadow: "0 -8px 24px rgba(0, 0, 0, 0.12)",
        paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
      }}
    >
      {/* Two per row; an odd last action spans the full width. */}
      <div className="flex flex-wrap gap-2 [&>*]:min-w-[calc(50%-4px)] [&>*]:flex-1 [&_.ant-btn]:!h-11 [&_.ant-btn]:w-full [&_.ant-btn]:!px-3 [&_.ant-btn]:justify-center">
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared global styles (tables, modals, drawers)                      */
/* ------------------------------------------------------------------ */

/**
 * Theme-aware overrides for antd tables/modals used on these pages.
 * Rendered once per page.
 */
export function AdminListStyles() {
  const s = useAdminSurface();
  const isDark = s.isDark;
  return (
    <style jsx global>{`
      .custom-admin-table .ant-table {
        background: transparent !important;
        color: ${isDark ? "#e2e8f0" : "#484650"} !important;
      }
      .custom-admin-table .ant-table-thead > tr > th {
        background: ${isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.015)"} !important;
        border-bottom: 1px solid ${isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"} !important;
        color: ${isDark ? "#94a3b8" : "#64748b"} !important;
        font-weight: 700 !important;
        white-space: nowrap;
      }
      .custom-admin-table .ant-table-tbody > tr > td {
        border-bottom: 1px solid ${isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.04)"} !important;
      }
      .custom-admin-table .ant-table-tbody > tr:hover > td {
        background: ${isDark ? "rgba(115, 103, 240, 0.05)" : "rgba(115, 103, 240, 0.03)"} !important;
      }
      .custom-admin-table .ant-table-cell-fix-left,
      .custom-admin-table .ant-table-cell-fix-right {
        background: ${s.surface} !important;
      }
      .custom-admin-table .ant-pagination,
      .admin-pagination {
        flex-wrap: wrap;
        row-gap: 8px;
      }
      .custom-admin-table .ant-pagination-item-active,
      .admin-pagination .ant-pagination-item-active {
        border-color: ${ADMIN_PRIMARY} !important;
        background: ${ADMIN_PRIMARY} !important;
      }
      .custom-admin-table .ant-pagination-item-active a,
      .admin-pagination .ant-pagination-item-active a {
        color: #fff !important;
      }
      .premium-select .ant-select-selector {
        background: ${s.surface} !important;
        border: 1px solid ${s.border} !important;
        color: ${s.text} !important;
        border-radius: 10px !important;
        min-height: 40px !important;
        display: flex !important;
        align-items: center !important;
      }
      .premium-modal .ant-modal-content {
        background: ${s.surface} !important;
        color: ${isDark ? "#ffffff" : "#000000"} !important;
        border: ${isDark ? `1px solid ${s.border}` : "none"} !important;
        border-radius: 16px !important;
      }
      .premium-modal .ant-modal-header {
        background: transparent !important;
        border-bottom: 1px solid ${isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"} !important;
      }
      .premium-modal .ant-modal-title {
        color: ${isDark ? "#ffffff" : "#000000"} !important;
      }
      @media (max-width: 767px) {
        .premium-modal.ant-modal,
        .admin-responsive-modal.ant-modal {
          max-width: calc(100vw - 24px) !important;
          margin: 12px auto !important;
          top: 12px !important;
          padding-bottom: 12px !important;
        }
        .premium-modal .ant-modal-content,
        .admin-responsive-modal .ant-modal-content {
          padding: 16px !important;
        }
        .premium-select .ant-select-selector,
        .admin-touch .ant-input-affix-wrapper,
        .admin-touch .ant-input {
          min-height: 44px !important;
        }
        .admin-pagination .ant-pagination-prev,
        .admin-pagination .ant-pagination-next,
        .admin-pagination .ant-pagination-item,
        .custom-admin-table .ant-pagination-prev,
        .custom-admin-table .ant-pagination-next,
        .custom-admin-table .ant-pagination-item {
          min-width: 40px !important;
          height: 40px !important;
          line-height: 38px !important;
        }
      }
    `}</style>
  );
}
