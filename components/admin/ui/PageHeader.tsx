"use client";

import type { ReactNode } from "react";
import "./admin-ui.css";

export interface PageHeaderProps {
  /** Page title (rendered as <h1>). */
  title: ReactNode;
  /** Optional one-line description under the title. */
  subtitle?: ReactNode;
  /** Optional element above the title (e.g. antd <Breadcrumb />). */
  breadcrumb?: ReactNode;
  /** Optional icon shown in a soft square left of the title. */
  icon?: ReactNode;
  /**
   * Action buttons. On phones they stack under the title and stretch to full
   * width (each direct child gets `flex: 1`); from `sm` up they sit on the right.
   */
  actions?: ReactNode;
  className?: string;
}

/** Consistent page title block for admin pages. */
export function PageHeader({ title, subtitle, breadcrumb, icon, actions, className }: PageHeaderProps) {
  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between ${className ?? ""}`}>
      <div className="min-w-0">
        {breadcrumb ? <div className="mb-1.5">{breadcrumb}</div> : null}
        <div className="flex items-center gap-3 min-w-0">
          {icon ? <span className="admin-card__icon !w-10 !h-10 !text-lg">{icon}</span> : null}
          <div className="min-w-0">
            <h1 className="admin-heading m-0 text-xl sm:text-[22px] font-semibold leading-tight tracking-tight break-words">
              {title}
            </h1>
            {subtitle ? <p className="admin-muted m-0 mt-1 text-[13px] sm:text-[14px]">{subtitle}</p> : null}
          </div>
        </div>
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2 [&>*]:flex-1 sm:[&>*]:flex-none sm:shrink-0">{actions}</div>
      ) : null}
    </div>
  );
}
