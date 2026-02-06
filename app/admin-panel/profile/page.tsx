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
  Button,
} from "antd";

import { useState } from "react";
import { EditOutlined, SaveOutlined } from "@ant-design/icons";

import { useGet, usePatch } from "@/lib/hooks";
import { useAuthStore } from "@/lib/stores/authStore";
import { useThemeStore } from "@/lib/stores/themeStore";

const { Title } = Typography;

/* ================= TYPES ================= */

interface AdminProfileData {
  id: number;
  first_name: string;
  last_name: string;
  middle_name?: string;
  email: string;
  phone_number: string;
  role: string;
  pinfl?: string;
  address?: string;
  passport_series?: string;
  passport_number?: string;
  created_at?: string;
  updated_at?: string;
}

interface UpdateAdminProfileData {
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  email?: string;
}

/* ================= PAGE ================= */

export default function AdminProfilePage() {
  const [form] = Form.useForm<UpdateAdminProfileData>();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const { theme } = useThemeStore();
  const { user: authUser } = useAuthStore();

  // Get user profile data
  const { data: profile, isLoading, refetch } = useGet<AdminProfileData>("/auth/me/");

  // Update profile mutation
  const { mutate: updateProfile, isPending: isUpdating } = usePatch<AdminProfileData, UpdateAdminProfileData>("/auth/me/", {
    onSuccess: () => {
      message.success("Profil muvaffaqiyatli yangilandi!");
      setIsProfileModalOpen(false);
      refetch();
    },
    onError: (error) => {
      let errorMessage = error.message || "Xatolik yuz berdi";
      if (Array.isArray((error).data)) {
        errorMessage = (error).data.join(", ");
      }
      message.error(errorMessage);
    },
  });

  /* ================= TABLE DATA ================= */

  const fullName = profile
    ? `${profile.last_name || ""} ${profile.first_name || ""} ${profile.middle_name || ""}`.trim()
    : authUser?.full_name || "Admin";

  const userInfoData = [
    {
      key: "1",
      label: "F.I.SH.",
      value: fullName.toUpperCase(),
    },
    {
      key: "2",
      label: "Elektron pochta",
      value: profile?.email || "Kiritilmagan",
    },
    {
      key: "3",
      label: "Rol",
      value: profile?.role || authUser?.role || "Boshqaruvchi",
    },
    {
      key: "4",
      label: "Telefon raqami",
      value: profile?.phone_number || "Kiritilmagan",
    },
    {
      key: "5",
      label: "PINFL",
      value: profile?.pinfl || "Kiritilmagan",
    },
    {
      key: "6",
      label: "Manzil",
      value: profile?.address || "Kiritilmagan",
    },
    {
      key: "7",
      label: "Passport Serya",
      value: profile?.passport_series || "Kiritilmagan",
    },
    {
      key: "8",
      label: "Passport Raqam",
      value: profile?.passport_number || "Kiritilmagan",
    },
    {
      key: "9",
      label: "Ro'yxatdan o'tgan",
      value: profile?.created_at?.split('T')[0] || "N/A",
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

  const handleEdit = () => {
    if (profile) {
      form.setFieldsValue({
        first_name: profile.first_name,
        last_name: profile.last_name,
        middle_name: profile.middle_name,
        email: profile.email,
      });
    }
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = (values: UpdateAdminProfileData) => {
    updateProfile(values);
  };

  if (isLoading && !profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Breadcrumb */}
      <div className="mb-4 flex items-center gap-4">
        <Title level={4} className="!text-[24px] !mb-0 border-r border-[#d6dce1] pr-4" style={{ color: theme === "dark" ? "#ffffff" : "inherit", borderColor: theme === "dark" ? "rgb(59, 66, 83)" : "rgb(214,220,225)" }}>
          Admin Profili
        </Title>
        <Breadcrumb
          items={[
            {
              href: "/admin-panel",
              title: (
                <span style={{ display: "flex", alignItems: "center", gap: 4, color: "rgb(115, 103, 240)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="align-text-top feather feather-home"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                </span>
              ),
            },
            { title: <span style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>Profil</span> },
          ]}
        />
      </div>

      {/* User Info Card */}
      <Card
        title={
          <div className="flex items-center justify-between w-full">
            <span style={{ fontSize: "20px", fontWeight: 500, color: theme === "dark" ? "#ffffff" : "inherit" }}>
              Foydalanuvchi ma&apos;lumotlari
            </span>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEdit}
              className="h-[38px] px-6 rounded-xl border-0 shadow-lg font-bold flex items-center gap-2"
              style={{
                background: "linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.7))",
                boxShadow: "0 8px 25px -8px #7367f0",
              }}
            >
              Tahrirlash
            </Button>
          </div>
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
        className="profile-card"
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

      {/* EDIT MODAL */}
      <Modal
        open={isProfileModalOpen}
        title="Profilni tahrirlash"
        onCancel={() => setIsProfileModalOpen(false)}
        onOk={() => form.submit()}
        okButtonProps={{ loading: isUpdating, className: "bg-[#7367f0]", icon: <SaveOutlined /> }}
        okText="Saqlash"
        cancelText="Bekor qilish"
      >
        <Form form={form} layout="vertical" onFinish={handleSaveProfile} className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="first_name" label="Ism" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="last_name" label="Familiya" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="middle_name" label="Sharif">
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
              <Input />
            </Form.Item>
          </div>
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
          padding: 0 24px !important;
        }
        
        .user-info-table .ant-table-tbody > tr > td {
          background: transparent !important;
          padding: 0 24px !important;
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