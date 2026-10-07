"use client";

import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

export interface AdminBreakpoint {
  /** < 640px */
  isMobile: boolean;
  /** 640px – 1023px */
  isTablet: boolean;
  /** >= 1024px */
  isDesktop: boolean;
}

/**
 * Admin panel breakpoints (same edges as Tailwind `sm` / `lg`).
 * SSR-safe: on the server and during hydration every flag is `false`, so
 * prefer CSS (Tailwind `sm:` / `lg:`) for layout and use this hook only to
 * switch components (e.g. table → card list, modal → bottom sheet).
 */
export function useAdminBreakpoint(): AdminBreakpoint {
  const isMobile = useMediaQuery("(max-width: 639px)");
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  return { isMobile, isTablet: !isMobile && !isDesktop, isDesktop };
}
