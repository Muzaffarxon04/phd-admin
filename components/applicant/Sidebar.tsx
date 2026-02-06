"use client";

import { useState, useEffect } from "react";
import { Layout, Menu } from "antd";
import type { MenuProps } from "antd";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useThemeStore } from "@/lib/stores/themeStore";

const { Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

// Chevron icon component
const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      transition: "transform 0.3s ease",
      transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
      opacity: 0.6
    }}
  >
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

export default function ApplicantSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useThemeStore();

  // State for open submenu keys
  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    if (pathname === "/applications" || pathname === "/my-submissions") {
      return ["documents"];
    }
    return [];
  });

  // Update openKeys when pathname changes
  useEffect(() => {
    if (pathname === "/applications" || pathname === "/my-submissions") {
      const timer = setTimeout(() => {
        setOpenKeys(["documents"]);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const isDocumentsOpen = openKeys.includes("documents");

  const menuItems: MenuItem[] = [
    {
      key: "/dashboard",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-home"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
      label: "Mening Profilim",
    },
    {
      key: "documents",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-layers"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>,
      label: (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Shaxsiy hujjatlar
          <ChevronIcon isOpen={isDocumentsOpen} />
        </div>
      ),
      children: [
        {
          icon: <svg xmlns="http://www.w3.org/2000/svg" width="14px" height="14px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-briefcase"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>,
          key: "/applications",
          label: "Arizalar",
        },
        {
          icon: <svg xmlns="http://www.w3.org/2000/svg" width="14px" height="14px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-briefcase"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>,
          key: "/my-submissions",
          label: "Mening Arizalarim",
        },
      ],
    },
    {
      key: "/feedback",
      icon: <svg viewBox="64 64 896 896" focusable="false" data-icon="send" width="20px" height="20px" fill="currentColor" aria-hidden="true"><defs><style></style></defs><path d="M931.4 498.9L94.9 79.5c-3.4-1.7-7.3-2.1-11-1.2a15.99 15.99 0 00-11.7 19.3l86.2 352.2c1.3 5.3 5.2 9.6 10.4 11.3l147.7 50.7-147.6 50.7c-5.2 1.8-9.1 6-10.3 11.3L72.2 926.5c-.9 3.7-.5 7.6 1.2 10.9 3.9 7.9 13.5 11.1 21.5 7.2l836.5-417c3.1-1.5 5.6-4.1 7.2-7.1 3.9-8 .7-17.6-7.2-21.6zM170.8 826.3l50.3-205.6 295.2-101.3c2.3-.8 4.2-2.6 5-5 1.4-4.2-.8-8.7-5-10.2L221.1 403 171 198.2l628 314.9-628.2 313.2z"></path></svg>,
      label: "Xato topdingizmi?",
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === "/feedback") {
      window.open("https://t.me/ilmiy_darajali_kadrlar", "_blank");
      return;
    }
    if (key !== "documents") {
      router.push(key);
    }
  };

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  // Get selected keys including parent for submenu
  const getSelectedKeys = () => {
    if (pathname === "/applications" || pathname === "/my-submissions") {
      return [pathname];
    }
    return [pathname];
  };

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
        {/* Custom Logo - matching the image */}
        <div style={{ position: "relative", width: 38, height: 38 }}>
          {/* Head/Circle */}
          <Image src="/logo.png" alt="logo" width={38} height={38} />
        </div>

        {/* Title */}
        <span
          style={{
            fontSize: "18px",
            fontWeight: 700,
            // background: "linear-gradient(118deg,#7367f0,rgba(115,103,240,.7))",
            // WebkitBackgroundClip: "text",
            // WebkitTextFillColor: "transparent",
            // backgroundClip: "text",
            color: "#7367f0"
          }}
        >
          Ariza beruvchi
        </span>
      </div>

      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={getSelectedKeys()}
        openKeys={openKeys}
        onOpenChange={handleOpenChange}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          borderRight: 0,
          background: "transparent",
          padding: "8px 12px",
        }}
        className="custom-menu-applicant-new"
      />

      <style jsx global>{`
        .custom-menu-applicant-new {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .custom-menu-applicant-new .ant-menu-item,
        .custom-menu-applicant-new .ant-menu-submenu-title {
          margin: 1px 0 !important;
          border-radius: 4px !important;
          height: 42px !important;
          color: ${theme === "dark" ? "#ffffff" : "#1f2937"} !important;
          padding: 10px 15px 10px 15px !important;
          transition: all 0.2s ease !important;
          font-weight: 500 !important;
          font-size: 15px !important;
          display: flex !important;
          align-items: center !important;
        }
        
        .custom-menu-applicant-new .ant-menu-item-selected {
          background: linear-gradient(118deg,#7367f0,rgba(115,103,240,.7) )!important;
          color: white !important;
          box-shadow: 0 0 10px 1px rgba(115,103,240,.7) !important;
        }
        
        .custom-menu-applicant-new .ant-menu-item-selected .anticon,
        .custom-menu-applicant-new .ant-menu-item-selected svg {
          stroke: #ffffff !important;
        }
        
        .custom-menu-applicant-new .ant-menu-item:hover:not(.ant-menu-item-selected),
        .custom-menu-applicant-new .ant-menu-submenu-title:hover {
          background: rgba(129, 140, 248, 0.08) !important;
          color: ${theme === "dark" ? "#ffffff" : "#1f2937"} !important;
        }
        
        .custom-menu-applicant-new .ant-menu-item .anticon,
        .custom-menu-applicant-new .ant-menu-submenu-title .anticon,
        .custom-menu-applicant-new .ant-menu-item svg,
        .custom-menu-applicant-new .ant-menu-submenu-title svg {
          color: ${theme === "dark" ? "#ffffff" : "#1f2937"} !important;
          font-size: 20px !important;
        }
        
        .custom-menu-applicant-new .ant-menu-submenu .ant-menu-item {
          padding-left: 25px !important;
          height: 42px !important;
          font-size: 14px !important;
        }
        
        .custom-menu-applicant-new .ant-menu-submenu-arrow {
          display: none !important;
        }
        
        .custom-menu-applicant-new .ant-menu-sub {
          background: transparent !important;
        }
        
        /* Remove default ant-design borders and backgrounds */
        .custom-menu-applicant-new .ant-menu-item::after {
          display: none !important;
        }
        
        .custom-menu-applicant-new.ant-menu-inline {
          border-inline-end: none !important;
        }
      `}</style>
    </Sider>
  );
}
