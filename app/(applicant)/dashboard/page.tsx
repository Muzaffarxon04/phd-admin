"use client";

import { Breadcrumb, Table, Card } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useGet } from "@/lib/hooks";
import { tokenStorage } from "@/lib/utils";
import { Spin } from "antd";
import { useThemeStore } from "@/lib/stores/themeStore";

interface User {
  id: number;
  phone_number: string;
  email?: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  full_name: string;
  role: string;
  is_verified: boolean;
  photo?: string | null;
  profile_completion: number;
  date_joined: string;
  last_login: string;
}

export default function DashboardPage() {
  const user = tokenStorage.getUser() as User | null;
  const { data: userData, isLoading } = useGet<User>("/auth/me/");
  const { theme } = useThemeStore();

  const currentUser = userData || user;

  if (isLoading && !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const tableData = currentUser
    ? [
        {
          key: "1",
          type: "F.I.SH.",
          value: currentUser.full_name || `${currentUser.last_name} ${currentUser.first_name} ${currentUser.middle_name || ""}`.trim(),
        },
        {
          key: "2",
          type: "Elektron pochta",
          value: currentUser.email || "-",
        },
        {
          key: "3",
          type: "Rol",
          value: currentUser.role === "APPLICANT" ? "Ariza beruvchi" : currentUser.role,
        },
        {
          key: "4",
          type: "Tashkilot",
          value: "None",
        },
        {
          key: "5",
          type: "Telefon raqami",
          value: currentUser.phone_number || "-",
        },
      ]
    : [];

  const columns = [
    {
      title: "MA'LUMOT TURI",
      dataIndex: "type",
      key: "type",
      width: "40%",
      style: { fontWeight: 600 },
      render: (text: string) => (
        <span style={{ color: theme === "dark" ? "#ffffff" : "#333" }}>{text}</span>
      ),
    },
    {
      title: "MA'LUMOT",
      dataIndex: "value",
      key: "value",
      width: "60%",
      render: (text: string) => (
        <span style={{ color: theme === "dark" ? "#ffffff" : "#333" }}>{text}</span>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb
        items={[
          {
            href: "/",
            title: (
              <span style={{ color: theme === "dark" ? "#ffffff" : "#333" }}>
                <HomeOutlined /> Dashboard
              </span>
            ),
          },
          {
            title: <span style={{ color: theme === "dark" ? "#ffffff" : "#333" }}>Bosh sahifa</span>,
          },
        ]}
        style={{ marginBottom: 24, color: theme === "dark" ? "#ffffff" : "#333" }}
      />

      <h1
        style={{
          fontSize: "24px",
          fontWeight: 600,
          marginBottom: 24,
          color: theme === "dark" ? "#ffffff" : "#333",
        }}
      >
        Foydalanuvchi ma&apos;lumotlari
      </h1>

      <Card
        style={{
          background: theme === "dark" ? "#1a1d29" : "#ffffff",
          border: theme === "dark" ? "1px solid #252836" : "1px solid #e8e8e8",
        }}
        bodyStyle={{
          padding: 0,
        }}
      >
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={false}
          bordered={false}
          style={{
            background: theme === "dark" ? "#1a1d29" : "#ffffff",
          }}
          className={theme === "dark" ? "dark-table" : ""}
        />
        <style jsx global>{`
          .dark-table .ant-table-thead > tr > th {
            background: #1a1d29 !important;
            color: #ffffff !important;
            border-bottom: 1px solid #252836 !important;
          }
          .dark-table .ant-table-tbody > tr > td {
            background: #1a1d29 !important;
            color: #ffffff !important;
            border-bottom: 1px solid #252836 !important;
          }
          .dark-table .ant-table-tbody > tr:hover > td {
            background: #252836 !important;
          }
          .dark-table .ant-table-tbody > tr:nth-child(even) > td {
            background: #1f2230 !important;
          }
        `}</style>
      </Card>
    </div>
  );
}
