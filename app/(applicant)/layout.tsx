"use client";

import { Layout } from "antd";
import ApplicantSidebar from "@/components/applicant/Sidebar";
import ApplicantHeader from "@/components/applicant/Header";
import { usePathname, useRouter } from "next/navigation";
import { useThemeStore } from "@/lib/stores/themeStore";
import { tokenStorage } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Spin } from "antd";

const { Content } = Layout;

export default function ApplicantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useThemeStore();
  const [isChecking, setIsChecking] = useState(true);
  const isAuthPage = pathname === "/login" || pathname === "/register";
  
  useEffect(() => {
    // Don't check auth for login and register pages
    if (pathname === "/login" || pathname === "/register") {
      setIsChecking(false);
      return;
    }

    // Check if user is authenticated
    const accessToken = tokenStorage.getAccessToken();
    const protectedRoutes = ["/dashboard", "/applications", "/my-submissions"];
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

    if (isProtectedRoute && !accessToken) {
      router.push("/login");
    } else {
      setIsChecking(false);
    }
  }, [pathname, router]);

  // Don't show layout for login and register pages
  if (isAuthPage) {
    return <>{children}</>;
  }

  if (isChecking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh", background: theme === "dark" ? "#1a1d29" : "#f5f5f5" }}>
      <ApplicantSidebar />
      <Layout style={{ marginLeft: 280, background: theme === "dark" ? "#1a1d29" : "#f5f5f5" }}>
        <ApplicantHeader />
        <Content
          style={{
            margin: "24px",
            padding: 24,
            minHeight: 280,
            background: theme === "dark" ? "#1a1d29" : "#ffffff",
            borderRadius: 8,
            color: theme === "dark" ? "#ffffff" : "#000000",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
