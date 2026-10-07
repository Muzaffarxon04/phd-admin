"use client";

import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import { useThemeStore } from "@/lib/stores/themeStore";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";
  const label = isDark ? "Yorug' rejim" : "Qorong'i rejim";
  return (
    <Tooltip title={label}>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={label}
        className={cn(
          "inline-flex h-11 w-11 items-center justify-center rounded-lg text-[15px] sm:h-10 sm:w-10 text-muted transition-colors hover:bg-surface-2 hover:text-text",
          className
        )}
      >
        {isDark ? <SunOutlined /> : <MoonOutlined />}
      </button>
    </Tooltip>
  );
}
