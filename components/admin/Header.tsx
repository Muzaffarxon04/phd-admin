"use client";

import { Layout, Button, Space, Avatar } from "antd";
import {
  MoonOutlined,
  SunOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useThemeStore } from "@/lib/stores/themeStore";
import { tokenStorage } from "@/lib/utils";
import { useState, useEffect } from "react";

const { Header: AntHeader } = Layout;

export default function Header() {
  const { theme, toggleTheme } = useThemeStore();
  const [userName, setUserName] = useState<string>("Admin");

  useEffect(() => {
    const user = tokenStorage.getUser() as { full_name?: string } | null;
    const fullName = user?.full_name;
    if (fullName) {
      setTimeout(() => {
        setUserName(fullName.split(" ").pop() || "Admin");
      }, 0);
    }
  }, []);

  return (
    <div className={`sticky pt-[1.3rem] top-0 z-1000`} style={{ background: theme === "dark" ? "rgb(22, 29, 49)" : "rgb(246, 246, 246)" }}>
      <AntHeader
        className="admin-header"
        style={{
          background: theme === "dark"
            ? "rgb(40, 48, 70)"
            : "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          padding: ".8rem 1rem",
          height: 60,
          borderRadius: "6px",
          borderBottom: theme === "dark"
            ? "1px solid rgba(255, 255, 255, 0.08)"
            : "1px solid rgba(0, 0, 0, 0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          boxShadow: theme === "dark"
            ? "0 4px 20px rgba(0, 0, 0, 0.3), inset 0 -1px 0 rgba(255, 255, 255, 0.05)"
            : "0 4px 20px rgba(0, 0, 0, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.03)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Right side - Actions */}
        <Space size="middle" style={{ alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <Button
            type="text"
            icon={theme === "dark" ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggleTheme}
            style={{
              fontSize: "20px",
              color: theme === "dark" ? "#ffffff" : "#666",
              height: 46,
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              overflow: "hidden",
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span
              style={{
                fontWeight: 700,
                color: theme === "dark" ? "#ffffff" : "#333",
                fontSize: "14px",
                textTransform: "uppercase"
              }}
            >
              {userName}
            </span>

            <Avatar
              size={40}
              icon={<UserOutlined />}
              style={{
                cursor: "pointer",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            />
          </div>
        </Space>
      </AntHeader>
    </div>
  );
}
