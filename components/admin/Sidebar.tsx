"use client";

import { Drawer, Layout, Menu, type MenuProps } from "antd";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { adminNavItems, getActiveNavKey } from "./navItems";
import { useAdminBreakpoint } from "./ui/useAdminBreakpoint";
import "./ui/admin-ui.css";

const { Sider } = Layout;

const menuItems: MenuProps["items"] = adminNavItems.map(({ key, icon, label }) => ({ key, icon, label }));

/** Width of the full sidebar (desktop) and of the icon rail (tablet). Keep in sync with layout gutters. */
export const SIDEBAR_WIDTH = 260;
export const SIDEBAR_RAIL_WIDTH = 72;

interface SidebarProps {
  /** Off-canvas drawer state (phones and tablets). */
  drawerOpen: boolean;
  onDrawerClose: () => void;
}

function Brand({ compact }: { compact: boolean }) {
  return (
    <div className={`admin-sidebar__brand ${compact ? "admin-sidebar__brand--compact" : ""}`}>
      <Image src="/logo.png" alt="Logo" width={38} height={38} priority />
      {!compact && <span className="admin-sidebar__brand-text">Admin Panel</span>}
    </div>
  );
}

/**
 * Admin navigation.
 * - desktop (>= 1024px): fixed full sidebar
 * - tablet (640-1023px): fixed icon rail; labels show as tooltips, the top-bar
 *   hamburger opens the full drawer
 * - phone (< 640px): no rail; navigation lives in the off-canvas drawer
 */
export default function Sidebar({ drawerOpen, onDrawerClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, isDesktop } = useAdminBreakpoint();
  const activeKey = getActiveNavKey(pathname);
  const selectedKeys = activeKey ? [activeKey] : [];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key !== "swagger") {
      router.push(key);
    }
    onDrawerClose();
  };

  return (
    <>
      {!isMobile && (
        <Sider
          width={SIDEBAR_WIDTH}
          collapsedWidth={SIDEBAR_RAIL_WIDTH}
          collapsed={!isDesktop}
          trigger={null}
          className="admin-sidebar"
          style={{
            overflow: "auto",
            height: "100dvh",
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
            background: "var(--admin-surface)",
            borderRight: "1px solid var(--admin-border)",
          }}
        >
          <Brand compact={!isDesktop} />
          <nav aria-label="Asosiy menyu">
            <Menu
              mode="inline"
              selectedKeys={selectedKeys}
              items={menuItems}
              onClick={handleMenuClick}
              className="admin-menu"
            />
          </nav>
        </Sider>
      )}

      <Drawer
        open={drawerOpen && !isDesktop}
        onClose={onDrawerClose}
        placement="left"
        width={Math.min(SIDEBAR_WIDTH + 20, 320)}
        closable={false}
        rootClassName="admin-sidebar-drawer"
        styles={{ body: { padding: 0, background: "var(--admin-surface)" } }}
      >
        <Brand compact={false} />
        <nav aria-label="Asosiy menyu">
          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            items={menuItems}
            onClick={handleMenuClick}
            className="admin-menu"
          />
        </nav>
      </Drawer>
    </>
  );
}
