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
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password" || pathname === "/reset-password";
  
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
            ? "linear-gradient(135deg, #1a1d29 0%, #252836 100%)" 
            : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
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
          ? "linear-gradient(135deg, #1a1d29 0%, #252836 100%)" 
          : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        transition: "background 0.3s ease"
      }}
    >
      <ApplicantSidebar />
      <Layout 
        style={{ 
          marginLeft: 280, 
          background: "transparent",
          transition: "margin-left 0.3s ease"
        }}
      >
        <ApplicantHeader />
        <Content
          style={{
            margin: "24px",
            padding: 32,
            minHeight: 280,
            background: theme === "dark" ? "#1a1d29" : "#ffffff",
            borderRadius: 16,
            color: theme === "dark" ? "#ffffff" : "#000000",
            boxShadow: theme === "dark" 
              ? "0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)" 
              : "0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
            transition: "all 0.3s ease",
            border: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(0, 0, 0, 0.06)",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
