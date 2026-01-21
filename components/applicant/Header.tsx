"use client";

import { Layout, Badge, Avatar, Dropdown, Space, Button } from "antd";
import {
  BellOutlined,
  GlobalOutlined,
  MoonOutlined,
  SunOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { tokenStorage } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/lib/stores/themeStore";
import { useState, useEffect } from "react";

const { Header: AntHeader } = Layout;

export default function ApplicantHeader() {
  const router = useRouter();
  const { theme, toggleTheme } = useThemeStore();
  const [userName, setUserName] = useState<string>("User");

  useEffect(() => {
    const user = tokenStorage.getUser() as { full_name?: string } | null;
    if (user?.full_name) {
      setUserName(user.full_name.split(" ").pop() || "User");
    }
  }, []);

  const handleLogout = () => {
    tokenStorage.removeTokens();
    router.push("/login");
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profil",
      onClick: () => router.push("/dashboard"),
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Chiqish",
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <AntHeader
      style={{
        background: theme === "dark" ? "#1a1d29" : "#ffffff",
        padding: "0 24px",
        borderBottom: theme === "dark" ? "1px solid #252836" : "1px solid #e8e8e8",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ flex: 1 }} />

      <Space size="large" style={{ alignItems: "center" }}>
        <Button
          type="text"
          icon={theme === "dark" ? <SunOutlined /> : <MoonOutlined />}
          onClick={toggleTheme}
          style={{
            fontSize: "18px",
            color: theme === "dark" ? "#ffffff" : "#666",
          }}
        />

        {/* <Badge count={3} size="small">
          <Button
            type="text"
            icon={<BellOutlined />}
            style={{
              fontSize: "18px",
              color: theme === "dark" ? "#ffffff" : "#666",
            }}
          />
        </Badge> */}

        {/* <Dropdown
          menu={{ items: [{ key: "uz", label: "O'zbek" }] }}
          trigger={["click"]}
        >
          <Button
            type="text"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: theme === "dark" ? "#ffffff" : "#666",
            }}
          >
            <span style={{ fontSize: "20px" }}>🇺🇿</span>
            <span>O&apos;zbek</span>
            <GlobalOutlined />
          </Button>
        </Dropdown> */}

        <span
          style={{
            fontWeight: 500,
            color: theme === "dark" ? "#ffffff" : "#333",
            textTransform: "uppercase",
            fontSize: "14px",
          }}
        >
          {userName}
        </span>

        <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
          <Avatar
            style={{
              backgroundColor: "#52c41a",
              cursor: "pointer",
              verticalAlign: "middle",
            }}
            size="default"
            icon={<UserOutlined />}
          />
        </Dropdown>
      </Space>
    </AntHeader>
  );
}
