"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, Button, Dropdown, type MenuProps } from "antd";
import { LogoutOutlined, MenuOutlined, MoonOutlined, SunOutlined, UserOutlined } from "@ant-design/icons";
import { tokenStorage, getRoleDisplayLabel } from "@/lib/utils";
import { useThemeStore } from "@/lib/stores/themeStore";
import { getAdminPageTitle } from "./navItems";
import { useAdminBreakpoint } from "./ui/useAdminBreakpoint";
import "./ui/admin-ui.css";

interface AdminHeaderProps {
  /** Opens the navigation drawer (button shown below 1024px). */
  onMenuClick: () => void;
}

/**
 * Sticky admin top bar: hamburger + current section title (phones/tablets),
 * university name (desktop), theme toggle and the user menu.
 */
export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useThemeStore();
  const [userName, setUserName] = useState<string>("Foydalanuvchi");
  const [role, setRole] = useState<string>("applicant");
  const { isMobile } = useAdminBreakpoint();

  useEffect(() => {
    const user = tokenStorage.getUser() as { full_name?: string; role?: string } | null;
    const fullName = user?.full_name;
    if (fullName) {
      setTimeout(() => {
        setUserName(fullName || "Foydalanuvchi");
        setRole(user?.role || "applicant");
      }, 0);
    }
  }, []);

  const handleLogout = () => {
    tokenStorage.removeTokens();
    router.push("/login");
  };

  const userMenuItems: MenuProps["items"] = [
    // Phones hide the name next to the avatar, so show it at the top of the menu instead.
    ...(isMobile
      ? [
          {
            key: "user",
            type: "group" as const,
            label: (
              <div className="max-w-[220px] py-1">
                <div className="admin-heading truncate text-sm font-semibold">{userName}</div>
                <div className="admin-muted text-xs">{getRoleDisplayLabel(role)}</div>
              </div>
            ),
          },
          { type: "divider" as const, key: "user-divider" },
        ]
      : []),
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profil",
      onClick: () => router.push(role === "SUPER_ADMIN" ? "/admin-panel/profile" : "/dashboard"),
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
    <div className="admin-topbar-wrap">
      <header className="admin-topbar">
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          <Button
            type="text"
            aria-label="Menyuni ochish"
            icon={<MenuOutlined />}
            onClick={onMenuClick}
            className="admin-icon-btn lg:!hidden"
          />
          <span className="admin-heading truncate text-base font-semibold lg:hidden">{getAdminPageTitle(pathname)}</span>
          <span className="admin-muted hidden truncate text-sm font-semibold uppercase tracking-[0.08em] lg:inline">
            Toshkent Davlat Tibbiyot Universiteti
          </span>
        </div>

        <div className="flex flex-none items-center gap-1 sm:gap-3">
          <Button
            type="text"
            aria-label={theme === "dark" ? "Yorug' rejim" : "Qorong'i rejim"}
            icon={theme === "dark" ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggleTheme}
            className="admin-icon-btn"
          />
          <div className="hidden min-w-0 flex-col items-end gap-1 sm:flex">
            <span className="admin-heading max-w-[220px] truncate text-sm font-bold uppercase leading-none">{userName}</span>
            <span className="admin-muted text-xs leading-none">{getRoleDisplayLabel(role)}</span>
          </div>
          <Dropdown menu={{ items: userMenuItems }} trigger={["click"]} placement="bottomRight">
            <button type="button" className="admin-avatar-btn" aria-label="Foydalanuvchi menyusi">
              <Avatar size={38} icon={<Image src="/avatar.png" alt="" width={38} height={38} />} />
              <span className="admin-avatar-btn__status" aria-hidden />
            </button>
          </Dropdown>
        </div>
      </header>
    </div>
  );
}
