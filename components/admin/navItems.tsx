import type { ReactNode } from "react";
import {
  DashboardOutlined,
  FileTextOutlined,
  TeamOutlined,
  BookOutlined,
  FileWordOutlined,
  StarOutlined,
  ScanOutlined,
} from "@ant-design/icons";

export interface AdminNavItem {
  key: string;
  icon: ReactNode;
  label: string;
}

/** Admin sidebar navigation (order = menu order). */
export const adminNavItems: AdminNavItem[] = [
  { key: "/admin-panel", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "/admin-panel/applications", icon: <FileTextOutlined />, label: "Arizalar" },
  { key: "/admin-panel/submissions", icon: <FileTextOutlined />, label: "Qabul Hujjatlari" },
  { key: "/admin-panel/examiners", icon: <TeamOutlined />, label: "Imtihonchilar" },
  { key: "/admin-panel/specialities", icon: <BookOutlined />, label: "Mutaxassisliklar" },
  { key: "/admin-panel/guvohnoma", icon: <FileWordOutlined />, label: "Guvohnoma" },
  { key: "/admin-panel/marks", icon: <StarOutlined />, label: "Baholar" },
  { key: "/admin-panel/face-logs", icon: <ScanOutlined />, label: "Yuz tekshiruvi loglari" },
];

/** Nav key of the section the pathname belongs to (longest prefix match), e.g. /admin-panel/applications/12 → /admin-panel/applications. */
export function getActiveNavKey(pathname: string | null): string | undefined {
  if (!pathname) return undefined;
  let best: AdminNavItem | undefined;
  for (const item of adminNavItems) {
    // The dashboard root only matches exactly; other sections also match their sub-pages.
    const match = pathname === item.key || (item.key !== "/admin-panel" && pathname.startsWith(`${item.key}/`));
    if (match && (!best || item.key.length > best.key.length)) best = item;
  }
  return best?.key;
}

/** Short title for the mobile/tablet top bar. */
export function getAdminPageTitle(pathname: string | null): string {
  if (pathname?.startsWith("/admin-panel/profile")) return "Profil";
  const key = getActiveNavKey(pathname);
  return adminNavItems.find((i) => i.key === key)?.label ?? "Admin Panel";
}
