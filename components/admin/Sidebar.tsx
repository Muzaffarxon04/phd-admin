"use client";

import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  FileTextOutlined,
  HomeOutlined,
  ApiOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import { useThemeStore } from "@/lib/stores/themeStore";

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

  const handleMenuClick = ({ key }: { key: string }) => {
    // Swagger docs opens in new tab, so don't navigate
    if (key !== "swagger") {
      router.push(key);
    }
  };

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
          ? "linear-gradient(180deg, #1a1d29 0%, #1f2230 100%)" 
          : "#ffffff",
        borderRight: `1px solid ${theme === "dark" ? "#252836" : "#e8e8e8"}`,
        boxShadow: theme === "dark" 
          ? "4px 0 20px rgba(0, 0, 0, 0.3)" 
          : "2px 0 8px rgba(0, 0, 0, 0.05)",
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          padding: "24px",
          borderBottom: theme === "dark" ? "1px solid #252836" : "1px solid #e8e8e8",
          background: theme === "dark" 
            ? "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)" 
            : "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "12px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
              fontSize: "24px",
              transition: "transform 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            ⚙️
          </div>
          <div>
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
            <div
              style={{
                fontSize: "12px",
                color: theme === "dark" ? "#a0a0a0" : "#666",
                marginTop: 2,
              }}
            >
              Boshqaruv paneli
            </div>
          </div>
        </div>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          borderRight: 0,
          background: "transparent",
          padding: "16px 8px",
        }}
        theme={theme === "dark" ? "dark" : "light"}
        className="custom-menu-admin"
      />
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
