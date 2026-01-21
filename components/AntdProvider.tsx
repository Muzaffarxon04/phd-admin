"use client";

import { ConfigProvider } from "antd";

export default function AntdProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1890ff",
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
