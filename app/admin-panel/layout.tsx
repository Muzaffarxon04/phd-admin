"use client";

import { Layout } from "antd";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { useThemeStore } from "@/lib/stores/themeStore";
import { tokenStorage } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Spin } from "antd";

const { Content } = Layout;

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { theme } = useThemeStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Use requestAnimationFrame to avoid setState in effect warning
    const checkAuth = () => {
      // Check if user is authenticated
      const accessToken = tokenStorage.getAccessToken();
      
      if (!accessToken) {
        router.push("/login");
        return;
      }
      
      setIsChecking(false);
    };

    requestAnimationFrame(checkAuth);
  }, [router]);

  if (isChecking) {
    return (
      <div 
        style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          minHeight: "100vh",
          background: theme === "dark" ? "#1a1d29" : "#f5f7fa"
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
        background: theme === "dark" ? "#1a1d29" : "#f5f7fa",
        transition: "background 0.3s ease"
      }}
    >
      <Sidebar />
      <Layout 
        style={{ 
          marginLeft: 280, 
          background: "transparent",
          transition: "margin-left 0.3s ease"
        }}
      >
        <Header />
        <Content
          style={{
            margin: "24px",
            padding: 0,
            minHeight: 280,
            background: "transparent",
            transition: "all 0.3s ease",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
