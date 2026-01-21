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
    // Check if user is authenticated
    const accessToken = tokenStorage.getAccessToken();
    
    if (!accessToken) {
      router.push("/login");
    } else {
      setTimeout(() => setIsChecking(false), 0);
    }
  }, [router]);

  if (isChecking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh", background: theme === "dark" ? "#1a1d29" : "#f5f5f5" }}>
      <Sidebar />
      <Layout style={{ marginLeft: 280, background: theme === "dark" ? "#1a1d29" : "#f5f5f5" }}>
        <Header />
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
