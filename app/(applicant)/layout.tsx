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
  const isAuthPage = pathname === "/" || pathname === "/login" || pathname === "/register" || pathname === "/forgot-password" || pathname === "/reset-password";

  useEffect(() => {
    // Use requestAnimationFrame to avoid setState in effect warning
    const checkAuth = () => {
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
        return;
      }

      setIsChecking(false);
    };

    requestAnimationFrame(checkAuth);
  }, [pathname, router]);

  // Don't show layout for login and register pages
  if (isAuthPage) {
    return <>{children}</>;
  }

  if (isChecking) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: theme === "dark"
            ? "rgb(22, 29, 49)"
            : "rgb(246,246,246)"
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: theme === "dark"
          ? "rgb(22, 29, 49)"
          : "rgb(246,246,246)",
        transition: "background 0.3s ease"
      }}
    >
      <ApplicantSidebar />
      <Layout
        style={{
          marginLeft: 280,
          marginRight: 20,
          background: "transparent",
          transition: "margin-left 0.3s ease"
        }}
      >
        <ApplicantHeader />
        <Content
          style={{
            marginTop: "20px",
            padding: 22,
            minHeight: 280,
            background: theme === "dark"
              ? "rgb(40, 48, 70)"
              : "rgba(255, 255, 255, 0.98)",
            borderRadius: 6,
            color: theme === "dark" ? "#ffffff" : "#000000",
            boxShadow: theme === "dark"
              ? "0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)"
              : "0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
            transition: "all 0.3s ease",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
