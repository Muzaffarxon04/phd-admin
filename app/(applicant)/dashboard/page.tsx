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

import { useGet, usePatch } from "@/lib/hooks";
import { tokenStorage, getRoleDisplayLabel } from "@/lib/utils";
import { useThemeStore } from "@/lib/stores/themeStore";
import { EditOutlined } from "@ant-design/icons";

const { Title } = Typography;

/* ================= TYPES ================= */

interface User {
  id?: number;
  phone_number?: string | null;
  email?: string | null;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  full_name?: string | null;
  role?: string;
  is_verified?: boolean;
  photo?: string | null;
  profile_completion?: number;
  date_joined?: string;
  last_login?: string;
  birth_date?: string | null;
  birth_place?: string | null;
  citizenship?: string | null;
  citizen?: string | null;
  nationality?: string | null;
  nation?: string | null;
  permanent_address?: string | null;
  pinfl?: string | null;
  organization?: string | null;
  passport_seria?: string | null;
  passport_number?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface ProfileFormValues {
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  email?: string;
  organization?: string;
  birth_date?: string;
  birth_place?: string;
  citizen?: string;
  nation?: string;
  permanent_address?: string;
  pinfl?: string;
  passport_seria?: string;
  passport_number?: string;
}

/* ================= PAGE ================= */

export default function DashboardPage() {
  const savedUser = tokenStorage.getUser() as User | null;
  const { data: userData, isLoading, refetch } = useGet<User>("/applicant/profile/");
  const patchProfile = usePatch("/applicant/profile/");
  const { theme } = useThemeStore();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [, setIsEditing] = useState(false);
  const [form] = Form.useForm<ProfileFormValues>();

  const apiUser = (userData as unknown as { data?: User } | undefined)?.data ?? userData;
  const currentUser = apiUser || savedUser;

  const fullName =
    currentUser?.full_name ||
    `${currentUser?.last_name ?? ""} ${currentUser?.first_name ?? ""} ${currentUser?.middle_name ?? ""}`.trim() ||
    "Foydalanuvchi";

  /* ================= TABLE DATA ================= */

  const userInfoData = [
    {
      key: "1",
      label: "F.I.SH.",
      value: (fullName || "Kiritilmagan").toUpperCase(),
    },
    {
      key: "2",
      label: "Elektron pochta",
      value: currentUser?.email || "Kiritilmagan",
    },
    {
      key: "3",
      label: "Rol",
      value: getRoleDisplayLabel(currentUser?.role),
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
      value: currentUser?.citizen || currentUser?.citizenship || "Kiritilmagan",
    },
    {
      key: "8",
      label: "Telefon raqami",
      value: currentUser?.phone_number || "Kiritilmagan",
    },
    {
      key: "9",
      label: "Millati",
      value: currentUser?.nation || currentUser?.nationality || "Kiritilmagan",
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
    {
      key: "12",
      label: "Pasport seriya",
      value: currentUser?.passport_seria || "Kiritilmagan",
    },
    {
      key: "13",
      label: "Pasport raqami",
      value: currentUser?.passport_number || "Kiritilmagan",
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
      await refetch();
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
        <Title level={4} className="text-[24px]!  mb-0! border-r-1 border-[rgb(214,220,225)] pr-4" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
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
        extra={
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              if (currentUser) {
                form.setFieldsValue({
                  first_name: (currentUser.first_name ?? "") || undefined,
                  last_name: (currentUser.last_name ?? "") || undefined,
                  middle_name: (currentUser.middle_name ?? "") || undefined,
                  email: (currentUser.email ?? "") || undefined,
                  organization: (currentUser.organization ?? "") || undefined,
                  birth_date: (currentUser.birth_date ?? "") || undefined,
                  birth_place: (currentUser.birth_place ?? "") || undefined,
                  citizen: (currentUser.citizen ?? currentUser.citizenship ?? "") || undefined,
                  nation: (currentUser.nation ?? currentUser.nationality ?? "") || undefined,
                  permanent_address: (currentUser.permanent_address ?? "") || undefined,
                  pinfl: (currentUser.pinfl ?? "") || undefined,
                  passport_seria: (currentUser.passport_seria ?? "") || undefined,
                  passport_number: (currentUser.passport_number ?? "") || undefined,
                });
              }
              setIsProfileModalOpen(true);
            }}
            className="h-[40px] px-4 rounded-xl border-0 shadow-sm font-medium flex items-center gap-2"
            style={{
              background: theme === "dark" ? "rgba(115, 103, 240, 0.2)" : "rgba(115, 103, 240, 0.12)",
              color: "#7367f0",
            }}
          >
            Tahrirlash
          </Button>
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
        width={900}
        style={{ maxWidth: "calc(100vw - 32px)" }}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveProfile}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="first_name" label="Ism">
              <Input placeholder="Ism" />
            </Form.Item>
            <Form.Item name="last_name" label="Familiya">
              <Input placeholder="Familiya" />
            </Form.Item>
            <Form.Item name="middle_name" label="Otasining ismi">
              <Input placeholder="Otasining ismi" />
            </Form.Item>
            <Form.Item name="email" label="Email">
              <Input placeholder="user@example.com" />
            </Form.Item>
            <Form.Item name="organization" label="Tashkilot">
              <Input placeholder="Tashkilot" />
            </Form.Item>
            <Form.Item name="birth_date" label="Tug'ilgan sana">
              <Input type="date" />
            </Form.Item>
            <Form.Item name="birth_place" label="Tug'ilgan joy">
              <Input placeholder="Tug'ilgan joy" />
            </Form.Item>
            <Form.Item name="citizen" label="Fuqarolik">
              <Input placeholder="Fuqarolik" />
            </Form.Item>
            <Form.Item name="nation" label="Millat">
              <Input placeholder="Millat" />
            </Form.Item>
            <Form.Item name="permanent_address" label="Doimiy manzil">
              <Input placeholder="Doimiy manzil" />
            </Form.Item>

            <div className="md:col-span-2 flex flex-col md:flex-row gap-4">
              <Form.Item name="passport_seria" label="Seriya" className="md:w-24">
                <Input placeholder="AA" maxLength={2} />
              </Form.Item>
              <Form.Item name="passport_number" label="Pasport raqami" className="md:w-40">
                <Input placeholder="1234567" maxLength={9} />
              </Form.Item>
              <Form.Item name="pinfl" label="PINFL" className="flex-1">
                <Input placeholder="PINFL" maxLength={14} />
              </Form.Item>
            </div>
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
