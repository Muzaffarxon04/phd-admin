"use client";

import { Layout, Menu, Avatar, Dropdown } from "antd";
import {
  DashboardOutlined,
  FileTextOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import { useThemeStore } from "@/lib/stores/themeStore";
import { tokenStorage } from "@/lib/utils";
import { useState, useEffect } from "react";
import type { MenuProps } from "antd";

const { Sider } = Layout;

const menuItems = [
  {
    key: "/admin-panel",
    icon: <DashboardOutlined />,
    label: "Dashboard",
  },
  {
    key: "/admin-panel/applications",
    icon: <FileTextOutlined />,
    label: "Arizalar",
  },
  {
    key: "/admin-panel/submissions",
    icon: <FileTextOutlined />,
    label: "Topshirilgan Arizalar",
  },

];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useThemeStore();
  const [userName, setUserName] = useState<string>("Admin");
const [role, setRole] = useState<string>("Admin");

  useEffect(() => {
    const loadUser = () => {
      const user = tokenStorage.getUser() as { full_name?: string, role?: string } | null;
      const fullName = user?.full_name;
      setRole(user?.role || "Admin");
      if (fullName) {
        setUserName(fullName);
      }
    };
    loadUser();
  }, []);

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key !== "swagger") {
      router.push(key);
    }
  };

  const handleLogout = () => {
    tokenStorage.removeTokens();
    router.push("/login");
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profil",
      onClick: () => router.push("/admin-panel/profile"),
    },
    // {
    //   key: "settings",
    //   icon: <SettingOutlined />,
    //   label: "Sozlamalar",
    // },
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
    <Sider
      width={280}
      style={{
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        background: theme === "dark" 
          ? "#1a1d29" 
          : "#ffffff",
        borderRight: `1px solid ${theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"}`,
        boxShadow: theme === "dark" 
          ? "4px 0 20px rgba(0, 0, 0, 0.3)" 
          : "2px 0 8px rgba(0, 0, 0, 0.05)",
        transition: "all 0.3s ease",
      }}
    >
      {/* Logo Section */}
      <div
        style={{
          padding: "24px",
          borderBottom: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: "bold",
              color: "#ffffff",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
            }}
          >
         👨‍🎓
          </div>
          <div
            style={{
              fontWeight: 700,
              color: theme === "dark" ? "#ffffff" : "#1a1a1a",
              fontSize: "18px",
              letterSpacing: "-0.5px",
            }}
          >
             Admin Panel
          </div>
        </div>
      </div>

      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={[pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          borderRight: 0,
          background: "transparent",
          padding: "8px",
        }}
        theme={theme === "dark" ? "dark" : "light"}
        className="custom-menu-admin"
      />

      {/* User Profile Section */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "16px 24px",
          borderTop: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.06)",
          background: theme === "dark" ? "#1a1d29" : "#ffffff",
        }}
      >
        <Dropdown 
          menu={{ items: userMenuItems }}
          trigger={["click"]}
          placement="topLeft"
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
              padding: "8px",
              borderRadius: "8px",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <Avatar
              size={36}
              icon={<UserOutlined />}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  color: theme === "dark" ? "#ffffff" : "#1a1a1a",
                  fontSize: "14px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {userName}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: theme === "dark" ? "#8b8b8b" : "#666",
                  marginTop: 2,
                }}
              >
             {role}
              </div>
            </div>
          </div>
        </Dropdown>
      </div>
      <style jsx global>{`
        .custom-menu-admin .ant-menu-item {
          margin: 6px 8px !important;
          border-radius: 12px !important;
          height: 52px !important;
          line-height: 52px !important;
          color: ${theme === "dark" ? "#ffffff" : "#333"} !important;
          padding: 0 16px !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          font-weight: 500 !important;
          display: flex !important;
          align-items: center !important;
        }
        .custom-menu-admin .ant-menu-item-selected {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4) !important;
          transform: translateX(4px) !important;
        }
        .custom-menu-admin .ant-menu-item-selected::before {
          display: none !important;
        }
        .custom-menu-admin .ant-menu-item-selected .anticon {
          color: white !important;
          transform: scale(1.1) !important;
        }
        .custom-menu-admin .ant-menu-item:hover:not(.ant-menu-item-selected) {
          background: ${theme === "dark" ? "rgba(102, 126, 234, 0.1)" : "rgba(102, 126, 234, 0.08)"} !important;
          transform: translateX(4px) !important;
        }
        .custom-menu-admin .ant-menu-item .anticon {
          color: ${theme === "dark" ? "#a0a0a0" : "#666"} !important;
          font-size: 18px !important;
          margin-right: 12px !important;
          transition: all 0.3s ease !important;
        }
        .custom-menu-admin .ant-menu-item:hover .anticon {
          color: ${theme === "dark" ? "#ffffff" : "#667eea"} !important;
          transform: scale(1.1) !important;
        }
        .custom-menu-admin .ant-menu-item-selected .anticon {
          color: white !important;
        }
        /* Custom scrollbar */
        .custom-menu-admin::-webkit-scrollbar {
          width: 6px;
        }
        .custom-menu-admin::-webkit-scrollbar-track {
          background: ${theme === "dark" ? "#1a1d29" : "#f5f5f5"};
        }
        .custom-menu-admin::-webkit-scrollbar-thumb {
          background: ${theme === "dark" ? "#252836" : "#d9d9d9"};
          border-radius: 3px;
        }
        .custom-menu-admin::-webkit-scrollbar-thumb:hover {
          background: ${theme === "dark" ? "#667eea" : "#667eea"};
        }
      `}</style>
    </Sider>
  );
}
