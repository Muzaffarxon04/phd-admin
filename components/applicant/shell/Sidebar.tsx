"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined, SendOutlined } from "@ant-design/icons";
import { cn } from "@/lib/utils";
import { HELP_TELEGRAM_URL } from "@/lib/applicant/session";
import { NAV_ITEMS, isNavActive } from "./nav";

interface SidebarProps {
  /** Icon-only rail (tablet, or collapsed desktop). */
  rail: boolean;
  /** Collapse toggle is only offered on desktop. */
  canCollapse: boolean;
  onToggle: () => void;
}

export function Sidebar({ rail, canCollapse, onToggle }: SidebarProps) {
  const pathname = usePathname() || "";

  const item = (href: string, label: string, icon: React.ReactNode, active: boolean, external = false) => {
    const content = (
      <span
        className={cn(
          "group flex h-10 items-center gap-3 rounded-lg text-sm transition-colors",
          rail ? "w-10 justify-center" : "px-3",
          active ? "bg-primary-soft font-medium text-primary" : "text-muted hover:bg-surface-2 hover:text-text"
        )}
      >
        <span className="flex w-[18px] shrink-0 justify-center text-[16px]">{icon}</span>
        {!rail && <span className="truncate">{label}</span>}
      </span>
    );
    const link = external ? (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
        {content}
      </a>
    ) : (
      <Link href={href} aria-label={label} aria-current={active ? "page" : undefined}>
        {content}
      </Link>
    );
    return rail ? (
      <Tooltip title={label} placement="right" key={href}>
        {link}
      </Tooltip>
    ) : (
      <div key={href}>{link}</div>
    );
  };

  return (
    <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border bg-surface md:flex">
      <div className={cn("flex h-14 shrink-0 items-center border-b border-border", rail ? "justify-center" : "px-4")}>
        <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5" aria-label="Bosh sahifa">
          <Image src="/logo.png" alt="" width={28} height={28} className="shrink-0" />
          {!rail && (
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-semibold text-text">TSMU Doktorantura</span>
              <span className="block truncate text-[11px] text-muted">Qabul tizimi</span>
            </span>
          )}
        </Link>
      </div>

      <nav aria-label="Asosiy menyu" className={cn("flex flex-1 flex-col gap-1 py-4", rail ? "items-center px-0" : "px-3")}>
        {!rail && <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted">Kabinet</p>}
        {NAV_ITEMS.map((n) => item(n.href, n.label, n.icon, isNavActive(pathname, n.href)))}
      </nav>

      <div className={cn("flex shrink-0 flex-col gap-1 border-t border-border py-3", rail ? "items-center" : "px-3")}>
        {item(HELP_TELEGRAM_URL, "Xato topdingizmi?", <SendOutlined />, false, true)}
        {canCollapse && (
          <Tooltip title={rail ? "Menyuni yoyish" : undefined} placement="right">
            <button
              type="button"
              onClick={onToggle}
              aria-label={rail ? "Menyuni yoyish" : "Menyuni yig'ish"}
              className={cn(
                "flex h-10 items-center gap-3 rounded-lg text-sm text-muted transition-colors hover:bg-surface-2 hover:text-text",
                rail ? "w-10 justify-center" : "px-3"
              )}
            >
              <span className="flex w-[18px] justify-center text-[16px]">
                {rail ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </span>
              {!rail && <span>Yig&apos;ish</span>}
            </button>
          </Tooltip>
        )}
      </div>
    </aside>
  );
}
