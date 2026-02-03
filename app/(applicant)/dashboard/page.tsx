"use client";

import {
  Breadcrumb,
  Card,
  Table,
  Modal,
  Form,
  Input,
  message,
  Typography,
} from "antd";

import { useState } from "react";

import { useGet, usePatch } from "@/lib/hooks";
import { tokenStorage } from "@/lib/utils";
import { useThemeStore } from "@/lib/stores/themeStore";

const { Title } = Typography;

/* ================= TYPES ================= */

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
  birth_date?: string;
  birth_place?: string;
  citizenship?: string;
  nationality?: string;
  permanent_address?: string;
  pinfl?: string;
  organization?: string;
}

interface ProfileFormValues {
  first_name: string;
  last_name: string;
  middle_name?: string;
  email?: string;
  phone_number: string;
}

/* ================= PAGE ================= */

export default function DashboardPage() {
  const savedUser = tokenStorage.getUser() as User | null;
  const { data: userData, isLoading } = useGet<User>("/auth/me/");
  const patchProfile = usePatch("/auth/update-profile/");
  const { theme } = useThemeStore();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [, setIsEditing] = useState(false);
  const [form] = Form.useForm<ProfileFormValues>();

  const currentUser = userData || savedUser;

  const fullName =
    currentUser?.full_name ||
    `${currentUser?.last_name ?? ""} ${currentUser?.first_name ?? ""} ${currentUser?.middle_name ?? ""}`.trim() ||
    "Foydalanuvchi";

  /* ================= TABLE DATA ================= */

  const userInfoData = [
    {
      key: "1",
      label: "F.I.SH.",
      value: fullName.toUpperCase(),
    },
    {
      key: "2",
      label: "Elektron pochta",
      value: currentUser?.email || "Kiritilmagan",
    },
    {
      key: "3",
      label: "Rol",
      value: currentUser?.role || "Ariza beruvchi",
    },
    {
      key: "4",
      label: "Tashkilot",
      value: currentUser?.organization || "None",
    },
    {
      key: "5",
      label: "Tug'ilgan kun",
      value: currentUser?.birth_date || "Kiritilmagan",
    },
    {
      key: "6",
      label: "Tug'ilgan joyi",
      value: currentUser?.birth_place || "NOMA'LUM",
    },
    {
      key: "7",
      label: "Fuqarolik",
      value: currentUser?.citizenship || "O'ZBEKISTON",
    },
    {
      key: "8",
      label: "Telefon raqami",
      value: currentUser?.phone_number || "Kiritilmagan",
    },
    {
      key: "9",
      label: "Millati",
      value: currentUser?.nationality || "O'ZBEK",
    },
    {
      key: "10",
      label: "Doimiy yashash joyi",
      value: currentUser?.permanent_address || "Kiritilmagan",
    },
    {
      key: "11",
      label: "PINFL",
      value: currentUser?.pinfl || "Kiritilmagan",
    },
  ];

  const columns = [
    {
      title: "MA'LUMOT TURI",
      dataIndex: "label",
      key: "label",
      width: "25%",
      render: (text: string) => (
        <span style={{
          color: theme === "dark" ? "rgb(180, 183, 189)" : "#484650",
          fontSize: "14px"
        }}>{text}</span>
      ),
    },
    {
      title: "MA'LUMOT",
      dataIndex: "value",
      key: "value",
      render: (text: string) => (
        <span style={{
          color: theme === "dark" ? "rgb(200, 203, 209)" : "#484650",
          fontSize: "14px"
        }}>{text}</span>
      ),
    },
  ];

  /* ================= HANDLERS ================= */

  const handleSaveProfile = async (values: ProfileFormValues) => {
    try {
      await patchProfile.mutateAsync(values);
      message.success("Profil muvaffaqiyatli yangilandi");
      setIsEditing(false);
      setIsProfileModalOpen(false);
    } catch {
      message.error("Profilni yangilashda xatolik yuz berdi");
    }
  };

  if (isLoading && !currentUser) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Page Title */}
      <div className="mb-4 flex items-center gap-4">
        <Title level={4} className="!text-[24px]  mb-0! border-r-1 border-[rgb(214,220,225)] pr-4" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
          Bosh sahifa
        </Title>
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            {
              href: "/dashboard",
              title: (
                <span style={{ display: "flex", alignItems: "center", gap: 4, color: "rgb(115, 103, 240)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="align-text-top feather feather-home"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                </span>
              ),
            },
            { title: <span style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>Bosh sahifa</span> },
          ]}
        />
      </div>



      {/* User Info Card */}
      <Card
        title={
          <span style={{ fontSize: "20px", fontWeight: 500, color: theme === "dark" ? "#ffffff" : "inherit" }}>
            Foydalanuvchi malumotlari
          </span>
        }
        style={{
          borderRadius: 6,
          background: "transparent",
          boxShadow: "none",
          border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
        }}
        styles={{
          header: {
            borderBottom: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
            padding: "16px 24px",
            background: "transparent",
          },
          body: {
            padding: 0,
            background: "transparent",
          },
        }}
      >
        <Table
          columns={columns}
          dataSource={userInfoData}
          pagination={false}
          showHeader={true}
          size="middle"
          style={{ borderRadius: 0 }}
          className="user-info-table"
        />
      </Card>

      {/* PROFILE MODAL */}
      <Modal
        open={isProfileModalOpen}
        title="Profilni tahrirlash"
        onCancel={() => setIsProfileModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveProfile}>
          <Form.Item name="first_name" label="Ism" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="last_name" label="Familiya" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="middle_name" label="Sharif">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
          <Form.Item name="phone_number" label="Telefon" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <style jsx global>{`
        .user-info-table .ant-table {
          background: transparent !important;
        }
        
        .user-info-table .ant-table-thead > tr > th {
          background: transparent !important;
          color: ${theme === "dark" ? "#ffffff" : "#484650"} !important;
          font-weight: 600 !important;
          font-size: 12px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
          border-bottom: ${theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)"} !important;
          padding: 12px 24px !important;
        }
        
        .user-info-table .ant-table-tbody > tr > td {
          background: transparent !important;
          padding: 14px 24px !important;
          border-bottom: ${theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)"} !important;
        }
        
        .user-info-table .ant-table-tbody > tr:hover > td {
          background: ${theme === "dark" ? "rgba(115, 103, 240, 0.1)" : "rgba(115, 103, 240, 0.05)"} !important;
        }
        
        .user-info-table .ant-table-tbody > tr:last-child > td {
          border-bottom: none !important;
        }
        
        .user-info-table .ant-table-container {
          background: transparent !important;
        }
      `}</style>
    </div>
  );
}
