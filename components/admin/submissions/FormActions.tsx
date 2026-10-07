"use client";

import type { ReactNode } from "react";

/**
 * Footer row for drawer/modal forms: two equal, 44px-tall buttons on phones,
 * right-aligned natural-width buttons from `sm` up.
 */
export function FormActions({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`mt-4 grid grid-cols-2 gap-3 sm:flex sm:justify-end [&_.ant-btn]:max-sm:!h-11 [&_.ant-btn]:max-sm:w-full ${className}`}
    >
      {children}
    </div>
  );
}
