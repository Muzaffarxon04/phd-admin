"use client";

import { AppstoreOutlined, FolderOpenOutlined, UserOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { clearSession } from "@/lib/applicant/session";

export interface NavItem {
  href: string;
  label: string;
  shortLabel?: string;
  icon: React.ReactNode;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Profil", icon: <UserOutlined /> },
  { href: "/applications", label: "Arizalar", icon: <AppstoreOutlined /> },
  { href: "/my-submissions", label: "Mening arizalarim", shortLabel: "Arizalarim", icon: <FolderOpenOutlined /> },
];

export function isNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

const TITLES: Array<[RegExp, string]> = [
  [/^\/dashboard/, "Profil"],
  [/^\/applications\/[^/]+/, "Ariza topshirish"],
  [/^\/applications/, "Arizalar"],
  [/^\/my-submissions\/[^/]+/, "Ariza tafsilotlari"],
  [/^\/my-submissions/, "Mening arizalarim"],
  [/^\/verify-identity/, "Shaxsni tasdiqlash"],
];

export function pageTitle(pathname: string): string {
  return TITLES.find(([re]) => re.test(pathname))?.[1] ?? "Kabinet";
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useCallback(() => {
    clearSession();
    queryClient.clear();
    router.push("/login");
  }, [queryClient, router]);
}
