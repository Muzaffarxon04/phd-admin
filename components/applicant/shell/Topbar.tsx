"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Dropdown, type MenuProps } from "antd";
import { LogoutOutlined, SafetyCertificateOutlined, UserOutlined } from "@ant-design/icons";
import { displayName, useStoredUser } from "@/lib/applicant/session";
import { formatPhone } from "@/lib/utils";
import { UserAvatar } from "@/components/applicant/ui/UserAvatar";
import { ThemeToggle } from "./ThemeToggle";
import { pageTitle, useLogout } from "./nav";

export function Topbar() {
  const pathname = usePathname() || "";
  const router = useRouter();
  const user = useStoredUser();
  const logout = useLogout();

  const items: MenuProps["items"] = [
    {
      key: "who",
      type: "group",
      label: (
        <div className="max-w-[240px] py-1">
          <div className="truncate text-sm font-medium text-text">{displayName(user)}</div>
          {user?.phone_number && (
            <div className="tabular truncate text-xs text-muted">{formatPhone(String(user.phone_number))}</div>
          )}
        </div>
      ),
    },
    { type: "divider" },
    { key: "profile", icon: <UserOutlined />, label: "Profil", onClick: () => router.push("/dashboard") },
    ...(user && user.is_verified !== true
      ? [
          {
            key: "verify",
            icon: <SafetyCertificateOutlined />,
            label: "Shaxsni tasdiqlash",
            onClick: () => router.push(`/verify-identity?next=${encodeURIComponent(pathname || "/dashboard")}`),
          },
        ]
      : []),
    { type: "divider" },
    { key: "logout", icon: <LogoutOutlined />, label: "Chiqish", danger: true, onClick: logout },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur supports-[backdrop-filter]:bg-bg/70">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-3 px-4 md:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2.5">
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2 md:hidden" aria-label="Bosh sahifa">
            <Image src="/logo.png" alt="" width={26} height={26} />
            <span className="text-sm font-semibold text-text">TSMU</span>
          </Link>
          <span className="hidden truncate text-sm font-medium text-text md:block">{pageTitle(pathname)}</span>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle className="hidden md:inline-flex" />
          <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
            <button
              type="button"
              className="flex h-10 items-center gap-2.5 rounded-lg pl-1 pr-1 transition-colors hover:bg-surface-2 md:pr-2.5"
              aria-label="Foydalanuvchi menyusi"
            >
              <UserAvatar user={user} size={30} />
              <span className="hidden max-w-[180px] truncate text-left text-[13px] font-medium text-text lg:block">
                {displayName(user)}
              </span>
            </button>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
