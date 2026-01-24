"use client";

import { Layout, Button, Space } from "antd";
import {

  MoonOutlined,
  SunOutlined,
} from "@ant-design/icons";
import { useThemeStore } from "@/lib/stores/themeStore";
// import { usePathname } from "next/navigation";

const { Header: AntHeader } = Layout;

export default function Header() {
  const { theme, toggleTheme } = useThemeStore();
  // const pathname = usePathname();


  return (
    <AntHeader
      className="admin-header"
      style={{
        background: theme === "dark" 
          ? "#1a1d29" 
          : "#ffffff",
        padding: "0 32px",
        height: 72,
        borderBottom: theme === "dark" 
          ? "1px solid rgba(255, 255, 255, 0.08)" 
          : "1px solid rgba(0, 0, 0, 0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        transition: "all 0.3s ease",
      }}
    >
  

      {/* Right side - Actions */}
      <Space size="middle" style={{ alignItems: "center" }}>
        <Button
          type="text"
          icon={theme === "dark" ? <SunOutlined /> : <MoonOutlined />}
          onClick={toggleTheme}
          style={{
            fontSize: "18px",
            color: theme === "dark" ? "#ffffff" : "#666",
            width: 40,
            height: 40,
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s ease",
          }}
        />
      </Space>
    </AntHeader>
  );
}
