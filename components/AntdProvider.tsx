"use client";

import { ConfigProvider, App, theme as antdTheme, type ThemeConfig } from "antd";
import { usePathname } from "next/navigation";
import { useThemeStore } from "@/lib/stores/themeStore";
import { useEffect } from "react";
import { getApplicantAntdTheme } from "@/lib/theme/tokens";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

/** Admin routes keep their original antd look; everything else uses the applicant design tokens. */
function isAdminPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname.startsWith("/admin-panel") || pathname.startsWith("/submissions");
}

function legacyAdminTheme(mode: "light" | "dark"): ThemeConfig {
  return {
    algorithm: mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: "#667eea",
      borderRadius: 8,
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      fontSize: 14,
      wireframe: false,
    },
    components: {
      Button: {
        borderRadius: 8,
        fontWeight: 600,
        controlHeight: 40,
        primaryShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
      },
      Card: { borderRadius: 12, paddingLG: 24 },
      Input: {
        borderRadius: 8,
        controlHeight: 40,
        colorTextPlaceholder: mode === "dark" ? "#ccc" : "#666",
      },
      Table: { borderRadius: 8 },
      Tag: { borderRadius: 6 },
      Menu: { borderRadius: 8, itemBorderRadius: 8 },
    },
  };
}

export default function AntdProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();
  const pathname = usePathname();
  const isClient = typeof window !== "undefined";
  const isMobile = useMediaQuery("(max-width: 767px)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  // On server, use light theme as default to prevent hydration mismatch
  const currentTheme = isClient ? theme : "light";

  const config: ThemeConfig = isAdminPath(pathname)
    ? legacyAdminTheme(currentTheme)
    : {
        ...getApplicantAntdTheme({ mode: currentTheme, isMobile, reducedMotion }),
        algorithm: currentTheme === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      };

  return (
    <ConfigProvider theme={config} warning={{ strict: false }}>
      <App>{children}</App>
    </ConfigProvider>
  );
}
