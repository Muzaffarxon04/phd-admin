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
          colorPrimary: "#1890ff",
        },
      }}
      // Suppress React version warning for Ant Design v6 with React 19
      warning={{ strict: false }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}
