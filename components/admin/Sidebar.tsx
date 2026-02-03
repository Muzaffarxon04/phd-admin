"use client";

import { Layout, Menu, Avatar, Dropdown } from "antd";
import {
  DashboardOutlined,
  FileTextOutlined,
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  // DollarOutlined,
  // StarOutlined,
  // FilePdfOutlined,
  // BarChartOutlined,
  // LinkOutlined,
  // SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import Image from "next/image";
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

  {
    key: "/admin-panel/examiners",
    icon: <TeamOutlined />,
    label: "Imtihonchilar",
  },
  {
    key: "/admin-panel/specialities",
    icon: <BookOutlined />,
    label: "Mutaxassisliklar",
  },
  // {
  //   key: "/admin-panel/application-specialities",
  //   icon: <LinkOutlined />,
  //   label: "Ariza-Mutaxassislik",
  // },
  // {
  //   key: "/admin-panel/marks",
  //   icon: <StarOutlined />,
  //   label: "Baholar",
  // },
  // {
  //   key: "/admin-panel/payments",
  //   icon: <DollarOutlined />,
  //   label: "To'lovlar",
  // },
  // {
  //   key: "/admin-panel/documents",
  //   icon: <FilePdfOutlined />,
  //   label: "Hujjatlar",
  // },
  // {
  //   key: "/admin-panel/reports",
  //   icon: <BarChartOutlined />,
  //   label: "Hisobotlar",
  // },
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
      setTimeout(() => {
        setRole(user?.role || "Admin");
        if (fullName) {
          setUserName(fullName);
        }
      }, 0);
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
      width={260}
      style={{
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
        borderRight: "none",
        boxShadow: "none",
        transition: "all 0.3s ease",
      }}
    >
      {/* Logo Section */}
      <div
        style={{
          padding: "20px 24px 0",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ position: "relative", width: 38, height: 38 }}>
          <Image src="/logo.png" alt="Logo" width={38} height={38} />
        </div>

        <span
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "#7367f0"
          }}
        >
          Admin Panel
        </span>
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
          padding: "8px 12px",
        }}
        className="custom-menu-admin-new"
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
          background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
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
        .custom-menu-admin-new {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .custom-menu-admin-new .ant-menu-item {
          margin: 1px 0 !important;
          border-radius: 4px !important;
          height: 42px !important;
          color: ${theme === "dark" ? "#ffffff" : "#1f2937"} !important;
          padding: 10px 15px !important;
          transition: all 0.2s ease !important;
          font-weight: 500 !important;
          font-size: 15px !important;
          display: flex !important;
          align-items: center !important;
        }
        .custom-menu-admin-new .ant-menu-item-selected {
          background: linear-gradient(118deg,#7367f0,rgba(115,103,240,.7) )!important;
          color: white !important;
          box-shadow: 0 0 10px 1px rgba(115,103,240,.7) !important;
        }
        .custom-menu-admin-new .ant-menu-item-selected .anticon {
          color: #ffffff !important;
        }
        .custom-menu-admin-new .ant-menu-item:hover:not(.ant-menu-item-selected) {
          background: rgba(129, 140, 248, 0.08) !important;
          color: ${theme === "dark" ? "#ffffff" : "#1f2937"} !important;
        }
        .custom-menu-admin-new .ant-menu-item .anticon {
          color: ${theme === "dark" ? "#ffffff" : "#1f2937"} !important;
          font-size: 20px !important;
        }
        .custom-menu-admin-new .ant-menu-item:hover .anticon {
          color: ${theme === "dark" ? "#ffffff" : "#667eea"} !important;
        }
        /* Custom scrollbar */
        .ant-layout-sider-children::-webkit-scrollbar {
          width: 6px;
        }
        .ant-layout-sider-children::-webkit-scrollbar-track {
          background: transparent;
        }
        .ant-layout-sider-children::-webkit-scrollbar-thumb {
          background: ${theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};
          border-radius: 3px;
        }
      `}</style>
    </Sider>
  );
}
