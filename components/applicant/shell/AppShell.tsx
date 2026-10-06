"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { BottomNav } from "./BottomNav";

const COLLAPSE_KEY = "applicant:sidebar-collapsed";

/**
 * Responsive application frame.
 * - ≥1024px: 248px sidebar (collapsible to 72px, persisted)
 * - 768–1023px: 72px icon rail
 * - <768px: top bar + bottom tab bar
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const pathname = usePathname();
  // AppShell only mounts on the client (after the auth check), so reading storage here is safe.
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === "1";
    } catch {
      return false;
    }
  });

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const rail = !isDesktop || collapsed;

  return (
    <div
      className="applicant-app min-h-dvh md:grid md:grid-cols-[var(--sb)_minmax(0,1fr)] md:transition-[grid-template-columns] md:duration-200"
      style={{ ["--sb" as string]: rail ? "72px" : "248px" }}
    >
      <Sidebar rail={rail} canCollapse={isDesktop} onToggle={toggle} />
      <div className="flex min-w-0 flex-col">
        <Topbar />
        <main className="mx-auto w-full min-w-0 max-w-[1200px] flex-1 px-4 pb-[calc(88px+env(safe-area-inset-bottom))] pt-5 md:px-6 md:pb-12 md:pt-8 lg:px-8">
          <div key={pathname} className="animate-enter">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
