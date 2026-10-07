"use client";

import { Layout, Spin } from "antd";
import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { tokenStorage } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "@/components/admin/ui/admin-ui.css";
import "./admin-overrides.css";

const { Content } = Layout;

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  // Close the navigation drawer whenever the route changes.
  useEffect(() => {
    const id = requestAnimationFrame(() => setDrawerOpen(false));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  if (isChecking) {
    return (
      <div className="admin-shell flex min-h-dvh items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout className="admin-shell" style={{ minHeight: "100dvh" }}>
      <Sidebar drawerOpen={drawerOpen} onDrawerClose={() => setDrawerOpen(false)} />
      <Layout className="admin-main">
        <AdminHeader onMenuClick={() => setDrawerOpen(true)} />
        <Content className="admin-page-container">{children}</Content>
      </Layout>
    </Layout>
  );
}
