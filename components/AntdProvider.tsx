"use client";

import { ConfigProvider, App, theme as antdTheme } from "antd";
import { useThemeStore } from "@/lib/stores/themeStore";

export default function AntdProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useThemeStore();
  const isClient = typeof window !== "undefined";

  // On server, use light theme as default to prevent hydration mismatch
  const currentTheme = isClient ? theme : "light";

  return (
    <ConfigProvider
      theme={{
        algorithm:
          currentTheme === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#667eea",
          borderRadius: 8,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
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
          Card: {
            borderRadius: 12,
            paddingLG: 24,
          },
          Input: {
            borderRadius: 8,
            controlHeight: 40,
          },
          Table: {
            borderRadius: 8,
          },
          Tag: {
            borderRadius: 6,
          },
          Menu: {
            borderRadius: 8,
            itemBorderRadius: 8,
          },
        },
      }}
      // Suppress React version warning for Ant Design v6 with React 19
      warning={{ strict: false }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}
