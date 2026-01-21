"use client";

import { Layout } from "antd";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";

const { Content } = Layout;

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />
      <Layout style={{ marginLeft: 250 }}>
        <Header />
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: "#f0f2f5",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
