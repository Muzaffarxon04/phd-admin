"use client";

import { Layout, Dropdown, Avatar, Space, Badge, Button } from "antd";
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MoonOutlined,
  SunOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useThemeStore } from "@/lib/stores/themeStore";
import { tokenStorage } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const { Header: AntHeader } = Layout;

export default function Header() {
  const router = useRouter();
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

  const handleLogout = () => {
    tokenStorage.removeTokens();
    router.push("/login");
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profil",
      onClick: () => router.push("/admin-panel"),
    },
    {
      type: "divider",
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
      className="admin-header"
      style={{
        background: theme === "dark" 
          ? "linear-gradient(135deg, rgba(26, 29, 41, 0.98) 0%, rgba(37, 40, 54, 0.98) 100%)" 
          : "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        padding: "0 40px",
        height: 72,
        borderBottom: theme === "dark" 
          ? "1px solid rgba(255, 255, 255, 0.08)" 
          : "1px solid rgba(0, 0, 0, 0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: theme === "dark" 
          ? "0 4px 20px rgba(0, 0, 0, 0.3), inset 0 -1px 0 rgba(255, 255, 255, 0.05)" 
          : "0 4px 20px rgba(0, 0, 0, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.03)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Left side - Logo/Brand */}
      <div 
        className="header-brand"
        style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 16,
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
        onClick={() => router.push("/admin-panel")}
      >
        <div
          className="brand-icon"
          style={{
            width: 44,
            height: 44,
            borderRadius: "14px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 16px rgba(102, 126, 234, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
            fontSize: "22px",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-50%",
              left: "-50%",
              width: "200%",
              height: "200%",
              background: "linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent)",
              transform: "rotate(45deg)",
              transition: "all 0.6s ease",
            }}
            className="brand-shine"
          />
          <span style={{ position: "relative", zIndex: 1 }}>⚙️</span>
        </div>
        <div>
       
          <div
            style={{
              fontSize: "11px",
              color: theme === "dark" ? "rgba(255, 255, 255, 0.65)" : "rgba(0, 0, 0, 0.55)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              marginTop: 2,
            }}
          >
            Admin Panel
          </div>
        </div>
      </div>

      {/* Right side - Actions */}
      <Space size="middle" style={{ alignItems: "center" }}>
        <Button
          type="text"
          icon={theme === "dark" ? <SunOutlined /> : <MoonOutlined />}
          onClick={toggleTheme}
          className="header-action-btn theme-toggle-btn"
          style={{
            fontSize: "22px",
            color: theme === "dark" ? "#ffffff" : "#666",
            width: 46,
            height: 46,
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <span 
            style={{
              position: "relative",
              zIndex: 1,
              transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            className="theme-icon"
          />
        </Button>

        <div
          className="user-info-card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "12px 20px",
            borderRadius: "16px",
            background: theme === "dark" 
              ? "linear-gradient(135deg, rgba(102, 126, 234, 0.18) 0%, rgba(118, 75, 162, 0.18) 100%)" 
              : "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
            border: `1.5px solid ${theme === "dark" ? "rgba(102, 126, 234, 0.35)" : "rgba(102, 126, 234, 0.25)"}`,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            cursor: "default",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <div
            className="status-indicator"
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
              boxShadow: "0 0 12px rgba(82, 196, 26, 0.7), 0 0 20px rgba(82, 196, 26, 0.4)",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#ffffff",
              }}
            />
          </div>
          <span
            style={{
              fontWeight: 700,
              color: theme === "dark" ? "#ffffff" : "#333",
              fontSize: "15px",
              letterSpacing: "0.4px",
            }}
          >
            {userName}
          </span>
        </div>

        <Dropdown 
          menu={{ 
            items: userMenuItems,
            className: "user-dropdown-menu",
          }} 
          trigger={["click"]}
          placement="bottomRight"
          overlayStyle={{ marginTop: 12 }}
        >
          <Avatar
            className="user-avatar"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              cursor: "pointer",
              verticalAlign: "middle",
              boxShadow: "0 4px 20px rgba(102, 126, 234, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              border: `2.5px solid ${theme === "dark" ? "rgba(102, 126, 234, 0.4)" : "rgba(255, 255, 255, 0.6)"}`,
              position: "relative",
            }}
            size={46}
            icon={<UserOutlined />}
          >
            <div
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "#52c41a",
                border: `2px solid ${theme === "dark" ? "#1a1d29" : "#ffffff"}`,
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              }}
            />
          </Avatar>
        </Dropdown>
      </Space>
      
      <style jsx>{`
        .admin-header {
          position: relative;
        }
        .admin-header::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, 
            transparent 0%, 
            ${theme === "dark" ? "rgba(102, 126, 234, 0.4)" : "rgba(102, 126, 234, 0.25)"} 50%, 
            transparent 100%
          );
        }
        .header-brand:hover {
          transform: translateX(2px);
        }
        .brand-icon:hover {
          transform: scale(1.08) rotate(5deg);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5) !important;
        }
        .brand-icon:hover .brand-shine {
          top: 150%;
          left: 150%;
        }
        .header-action-btn {
          position: relative;
        }
        .header-action-btn::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 14px;
          padding: 2px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .header-action-btn:hover::before {
          opacity: 1;
        }
        .header-action-btn:hover {
          background: ${theme === "dark" ? "rgba(102, 126, 234, 0.25)" : "rgba(102, 126, 234, 0.15)"} !important;
          transform: scale(1.08);
        }
        .theme-toggle-btn:hover .theme-icon {
          transform: rotate(180deg) scale(1.1);
        }
        .user-info-card:hover {
          transform: translateY(-2px);
          box-shadow: ${theme === "dark" 
            ? "0 6px 20px rgba(102, 126, 234, 0.25)" 
            : "0 6px 20px rgba(102, 126, 234, 0.18)"};
          border-color: ${theme === "dark" ? "rgba(102, 126, 234, 0.5)" : "rgba(102, 126, 234, 0.35)"};
        }
        .status-indicator {
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }
        .user-avatar:hover {
          transform: scale(1.1);
          box-shadow: 0 8px 28px rgba(102, 126, 234, 0.55) !important;
        }
        .user-avatar:active {
          transform: scale(0.96);
        }
        :global(.user-dropdown-menu) {
          border-radius: 12px !important;
          padding: 8px !important;
          box-shadow: ${theme === "dark" 
            ? "0 8px 32px rgba(0, 0, 0, 0.4)" 
            : "0 8px 32px rgba(0, 0, 0, 0.12)"} !important;
          background: ${theme === "dark" ? "#1a1d29" : "#ffffff"} !important;
          border: ${theme === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.08)"} !important;
        }
        :global(.user-dropdown-menu .ant-dropdown-menu-item) {
          border-radius: 8px !important;
          margin: 4px 0 !important;
          padding: 10px 16px !important;
          transition: all 0.2s ease !important;
        }
        :global(.user-dropdown-menu .ant-dropdown-menu-item:hover) {
          background: ${theme === "dark" ? "rgba(102, 126, 234, 0.15)" : "rgba(102, 126, 234, 0.08)"} !important;
        }
      `}</style>
    </AntHeader>
  );
}
