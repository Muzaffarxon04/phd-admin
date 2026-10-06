"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Switch } from "antd";
import {
  EllipsisOutlined,
  LogoutOutlined,
  MoonOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { cn, formatPhone } from "@/lib/utils";
import { useThemeStore } from "@/lib/stores/themeStore";
import { displayName, HELP_TELEGRAM_URL, useStoredUser } from "@/lib/applicant/session";
import { Sheet } from "@/components/applicant/ui/Sheet";
import { UserAvatar } from "@/components/applicant/ui/UserAvatar";
import { VerifiedBadge } from "@/components/applicant/ui/VerifiedBadge";
import { NAV_ITEMS, isNavActive, useLogout } from "./nav";

export function BottomNav() {
  const pathname = usePathname() || "";
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);
  const { theme, toggleTheme } = useThemeStore();
  const user = useStoredUser();
  const logout = useLogout();

  const tab = (active: boolean) =>
    cn(
      "flex h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
      active ? "text-primary" : "text-muted active:text-text"
    );

  const row =
    "flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-left text-sm text-text transition-colors active:bg-surface-2";

  return (
    <>
      <nav
        aria-label="Asosiy menyu"
        className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur md:hidden"
      >
        <div className="grid grid-cols-4">
          {NAV_ITEMS.map((n) => {
            const active = isNavActive(pathname, n.href);
            return (
              <Link key={n.href} href={n.href} className={tab(active)} aria-current={active ? "page" : undefined}>
                <span className="text-[18px] leading-none">{n.icon}</span>
                <span className="max-w-full truncate px-1">{n.shortLabel ?? n.label}</span>
              </Link>
            );
          })}
          <button type="button" className={tab(moreOpen)} onClick={() => setMoreOpen(true)}>
            <span className="text-[18px] leading-none">
              <EllipsisOutlined />
            </span>
            <span>Ko&apos;proq</span>
          </button>
        </div>
      </nav>

      <Sheet open={moreOpen} onClose={() => setMoreOpen(false)}>
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-surface-2 p-3">
          <UserAvatar user={user} size={40} />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-text">{displayName(user)}</div>
            {user?.phone_number ? (
              <div className="tabular truncate text-xs text-muted">{formatPhone(String(user.phone_number))}</div>
            ) : null}
            {user?.is_verified === true && <VerifiedBadge compact className="mt-1.5" />}
          </div>
        </div>

        <div className="flex flex-col">
          {user && user.is_verified !== true && (
            <button
              type="button"
              className={row}
              onClick={() => {
                setMoreOpen(false);
                router.push(`/verify-identity?next=${encodeURIComponent(pathname)}`);
              }}
            >
              <SafetyCertificateOutlined className="text-base text-warning" />
              <span className="flex-1">Shaxsni tasdiqlash</span>
              <RightOutlined className="text-xs text-muted" />
            </button>
          )}
          <label className={cn(row, "cursor-pointer")}>
            <MoonOutlined className="text-base text-muted" />
            <span className="flex-1">Qorong&apos;i rejim</span>
            <Switch checked={theme === "dark"} onChange={toggleTheme} />
          </label>
          <a href={HELP_TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className={row}>
            <SendOutlined className="text-base text-muted" />
            <span className="flex-1">Telegram orqali yordam</span>
            <RightOutlined className="text-xs text-muted" />
          </a>
          <div className="my-2 h-px bg-border" />
          <button
            type="button"
            className={cn(row, "text-danger")}
            onClick={() => {
              setMoreOpen(false);
              logout();
            }}
          >
            <LogoutOutlined className="text-base" />
            <span className="flex-1">Chiqish</span>
          </button>
        </div>
      </Sheet>
    </>
  );
}
