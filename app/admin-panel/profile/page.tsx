"use client";

import {
  Avatar,
  Breadcrumb,
  Form,
  Input,
  message,
  Button,
  Skeleton,
} from "antd";

import { useState } from "react";
import { EditOutlined, HomeOutlined, SaveOutlined, UserOutlined } from "@ant-design/icons";

import { useGet, usePatch } from "@/lib/hooks";
import { getRoleDisplayLabel } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/authStore";
import { AdminCard, PageHeader, ResponsiveModal } from "@/components/admin/ui";

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

  /* ================= DATA ================= */

  const fullName = profile
    ? `${profile.last_name || ""} ${profile.first_name || ""} ${profile.middle_name || ""}`.trim()
    : authUser?.full_name || "Admin";

  const roleLabel = getRoleDisplayLabel(profile?.role || authUser?.role || "admin");

  const userInfoData = [
    { key: "1", label: "F.I.SH.", value: fullName.toUpperCase() },
    { key: "2", label: "Elektron pochta", value: profile?.email || "Kiritilmagan" },
    { key: "3", label: "Rol", value: roleLabel },
    { key: "4", label: "Telefon raqami", value: profile?.phone_number || "Kiritilmagan" },
    { key: "5", label: "PINFL", value: profile?.pinfl || "Kiritilmagan" },
    { key: "6", label: "Manzil", value: profile?.address || "Kiritilmagan" },
    { key: "7", label: "Passport Serya", value: profile?.passport_series || "Kiritilmagan" },
    { key: "8", label: "Passport Raqam", value: profile?.passport_number || "Kiritilmagan" },
    { key: "9", label: "Ro'yxatdan o'tgan", value: profile?.created_at?.split('T')[0] || "N/A" },
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

  const editButton = (
    <Button
      type="primary"
      icon={<EditOutlined />}
      onClick={handleEdit}
      className="font-semibold"
      style={{
        background: "var(--admin-primary-gradient)",
        boxShadow: "0 8px 25px -8px #7367f0",
        border: "none",
      }}
    >
      Tahrirlash
    </Button>
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Admin Profili"
        breadcrumb={
          <Breadcrumb
            items={[
              {
                href: "/admin-panel",
                title: <HomeOutlined style={{ color: "var(--admin-primary)" }} aria-label="Bosh sahifa" />,
              },
              { title: <span className="admin-muted">Profil</span> },
            ]}
          />
        }
      />

      {isLoading && !profile ? (
        <AdminCard>
          <Skeleton active avatar paragraph={{ rows: 6 }} />
        </AdminCard>
      ) : (
        <AdminCard padding="none">
          {/* Identity strip */}
          <div
            className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 lg:px-6"
            style={{ borderBottom: "1px solid var(--admin-border)" }}
          >
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <Avatar
                size={56}
                icon={<UserOutlined />}
                style={{ background: "var(--admin-primary-soft)", color: "var(--admin-primary)", flex: "none" }}
              />
              <div className="min-w-0">
                <div className="admin-heading text-base font-semibold leading-snug break-words sm:text-lg">
                  {fullName.toUpperCase()}
                </div>
                <div className="admin-muted text-[13px]">{roleLabel}</div>
              </div>
            </div>
            <div className="flex [&>*]:flex-1 sm:[&>*]:flex-none">{editButton}</div>
          </div>

          {/* Details */}
          <div className="px-4 pt-3 sm:px-5 lg:px-6">
            <h2 className="admin-eyebrow m-0">Foydalanuvchi ma&apos;lumotlari</h2>
          </div>
          <dl className="m-0 px-4 pb-2 sm:px-5 lg:px-6">
            {userInfoData.map((row, i) => (
              <div
                key={row.key}
                className="grid grid-cols-1 gap-0.5 py-3 sm:grid-cols-[200px_1fr] sm:gap-4 lg:grid-cols-[260px_1fr]"
                style={{ borderTop: i === 0 ? undefined : "1px solid var(--admin-border)" }}
              >
                <dt className="admin-muted text-[13px]">{row.label}</dt>
                <dd className="admin-heading m-0 text-[14px] font-medium break-words">{row.value}</dd>
              </div>
            ))}
          </dl>
        </AdminCard>
      )}

      {/* EDIT MODAL */}
      <ResponsiveModal
        open={isProfileModalOpen}
        title="Profilni tahrirlash"
        onCancel={() => setIsProfileModalOpen(false)}
        onOk={() => form.submit()}
        okButtonProps={{ loading: isUpdating, className: "bg-[#7367f0]", icon: <SaveOutlined /> }}
        okText="Saqlash"
        cancelText="Bekor qilish"
      >
        <Form form={form} layout="vertical" onFinish={handleSaveProfile} className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Form.Item name="first_name" label="Ism" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="last_name" label="Familiya" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Form.Item name="middle_name" label="Sharif">
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
              <Input />
            </Form.Item>
          </div>
        </Form>
      </ResponsiveModal>
    </div>
  );
}
