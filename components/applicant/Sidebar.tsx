"use client";

import { Layout, Menu } from "antd";
import {
  HomeOutlined,
  FileTextOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import { useThemeStore } from "@/lib/stores/themeStore";

const { Sider } = Layout;

const menuItems = [
  {
    key: "/dashboard",
    icon: <HomeOutlined />,
    label: "Mening Profilim",
  },
  {
    key: "/applications",
    icon: <FileTextOutlined />,
    label: "Arizalar",
  },
  {
    key: "/my-submissions",
    icon: <FolderOutlined />,
    label: "Mening Arizalarim",
  },
];

export default function ApplicantSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useThemeStore();

  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(key);
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
        background: theme === "dark" ? "#1a1d29" : "#ffffff",
        borderRight: `1px solid ${theme === "dark" ? "#252836" : "#e8e8e8"}`,
      }}
    >
      <div
        className="p-6 border-b"
        style={{
          borderBottom: theme === "dark" ? "1px solid #252836" : "1px solid #e8e8e8",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
              fontSize: "24px",
            }}
          >
            💡
          </div>
          <div>
            <div
              style={{
                fontWeight: 600,
                color: theme === "dark" ? "#ffffff" : "#1a1a1a",
                fontSize: "16px",
              }}
            >
              Ariza beruvchi
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
          background: theme === "dark" ? "#1a1d29" : "#ffffff",
          padding: "8px 0",
        }}
        theme={theme === "dark" ? "dark" : "light"}
        className="custom-menu"
      />
      <style jsx global>{`
        .custom-menu .ant-menu-item {
          margin: 4px 8px !important;
          border-radius: 8px !important;
          height: 48px !important;
          line-height: 48px !important;
          color: ${theme === "dark" ? "#ffffff" : "#333"} !important;
        }
        .custom-menu .ant-menu-item-selected {
          background: linear-gradient(135deg, #5b6ee9 0%, #6c5ce7 100%) !important;
          color: white !important;
        }
        .custom-menu .ant-menu-item-selected .anticon {
          color: white !important;
        }
        .custom-menu .ant-menu-item:hover {
          background: ${theme === "dark" ? "#252836" : "#f5f5f5"} !important;
        }
        .custom-menu .ant-menu-submenu-title {
          margin: 4px 8px !important;
          border-radius: 8px !important;
          height: 48px !important;
          line-height: 48px !important;
          color: ${theme === "dark" ? "#ffffff" : "#333"} !important;
        }
        .custom-menu .ant-menu-item .anticon {
          color: ${theme === "dark" ? "#a0a0a0" : "#666"} !important;
        }
        .custom-menu .ant-menu-item-selected .anticon {
          color: white !important;
        }
      `}</style>
    </Sider>
  );
}
