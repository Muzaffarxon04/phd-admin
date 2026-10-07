"use client";

import type { CSSProperties, ReactNode } from "react";
import "./admin-ui.css";

export interface AdminCardProps {
  /** Card heading. When omitted (and no `extra`/`icon`), no header is rendered. */
  title?: ReactNode;
  /** Small muted line under the title. */
  subtitle?: ReactNode;
  /** Icon shown in a soft primary square before the title. */
  icon?: ReactNode;
  /** Right side of the header (buttons, totals...). Wraps under the title on narrow cards. */
  extra?: ReactNode;
  /**
   * Body padding: "none" (tables / edge-to-edge content), "sm" (12 → 16px),
   * "md" (16 → 20 → 24px by breakpoint). Default "md".
   */
  padding?: "none" | "sm" | "md";
  /** "default" surface card, "sunken" (inside another card/modal) or "tinted" (info callout). */
  variant?: "default" | "sunken" | "tinted";
  /** Render the header without a divider line (title flows into the body). */
  plainHeader?: boolean;
  className?: string;
  bodyClassName?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * Surface card used across the admin panel. Follows the admin tokens in
 * admin-ui.css (radius 12, 1px border, soft shadow; dark mode via html.dark).
 */
export function AdminCard({
  title,
  subtitle,
  icon,
  extra,
  padding = "md",
  variant = "default",
  plainHeader = false,
  className,
  bodyClassName,
  style,
  children,
}: AdminCardProps) {
  const hasHeader = title != null || extra != null || icon != null;
  const variantClass = variant === "default" ? "" : ` admin-card--${variant}`;
  const bodyPad = padding === "none" ? "" : ` admin-card__body--${padding}`;

  return (
    <section className={`admin-card${variantClass} ${className ?? ""}`} style={style}>
      {hasHeader ? (
        <header className={`admin-card__header${plainHeader ? " admin-card__header--plain" : ""}`}>
          <div className="flex items-center gap-3 min-w-0">
            {icon ? <span className="admin-card__icon">{icon}</span> : null}
            <div className="min-w-0">
              {title != null ? <h2 className="admin-card__title">{title}</h2> : null}
              {subtitle != null ? <div className="admin-card__subtitle">{subtitle}</div> : null}
            </div>
          </div>
          {extra != null ? <div className="flex flex-wrap items-center gap-2">{extra}</div> : null}
        </header>
      ) : null}
      <div className={`${bodyPad} ${bodyClassName ?? ""}`}>{children}</div>
    </section>
  );
}
