"use client";

import { useState } from "react";
import { Form, Input, Button, App, Avatar, Upload, Divider, Typography } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, SecurityScanOutlined, LogoutOutlined, EditOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useGet, usePatch } from "@/lib/hooks";
import { useAuthStore } from "@/lib/stores/authStore";
import { useThemeStore } from "@/lib/stores/themeStore";
const { Title, Text } = Typography;

interface AdminProfileData {
  id: number;
  first_name: string;
  last_name: string;
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
  email?: string;
  phone_number?: string;
  pinfl?: string;
  address?: string;
  passport_series?: string;
  passport_number?: string;
}

export default function AdminProfilePage() {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [filePath, setFilePath] = useState("");

  const router = useRouter();
  const { message } = App.useApp();
  const { logout } = useAuthStore();

  // Get user profile data
  const { data: profile, refetch } = useGet<AdminProfileData>("/auth/me/");

  // Update profile mutation
  const { mutate: updateProfile, isPending: isUpdating } = usePatch<AdminProfileData, UpdateAdminProfileData>("/auth/me/", {
    onSuccess: () => {
      message.success("Profil muvaffaqiyatli yangilandi!");
      setIsEditing(false);
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

  // Form initial values
  const initialValues = profile ? {
    first_name: profile.first_name,
    last_name: profile.last_name,
    email: profile.email,
    phone_number: profile.phone_number,
    pinfl: profile.pinfl,
    address: profile.address,
    passport_series: profile.passport_series,
    passport_number: profile.passport_number,
  } : {};

  const handleSave = (values: UpdateAdminProfileData) => {
    updateProfile(values);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    form.resetFields();
    if (profile) {
      form.setFieldsValue({
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        phone_number: profile.phone_number,
        pinfl: profile.pinfl,
        address: profile.address,
        passport_series: profile.passport_series,
        passport_number: profile.passport_number,
      });
    }
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };


  const uploadProps = {
    beforeUpload: (file: File) => {
      setFilePath(URL.createObjectURL(file));
      return false;
    },
  };

  // Get user name from auth store
  const { user: authUser } = useAuthStore();
  const { theme } = useThemeStore();

  return (
    <div className="space-y-6" style={{ color: theme === "dark" ? "#ffffff" : "#484650" }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Title level={4} className="!mb-1" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
            Admin Profili
          </Title>
          <div className="text-gray-400 text-sm font-medium">Shaxsiy ma&apos;lumotlaringizni va profil sozlamalarini boshqaring</div>
        </div>

        <div className="flex items-center gap-3">
          {!isEditing ? (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEdit}
              className="h-[42px] px-6 rounded-xl border-0 shadow-lg font-bold flex items-center gap-2"
              style={{
                background: "linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.7))",
                boxShadow: "0 8px 25px -8px #7367f0",
              }}
            >
              Tahrirlash
            </Button>
          ) : (
            <Button
              onClick={handleCancel}
              className="h-[42px] px-6 rounded-xl border font-bold flex items-center gap-2"
              style={{
                background: theme === "dark" ? "rgb(48, 56, 78)" : "#ffffff",
                color: theme === "dark" ? "#ffffff" : "#484650",
                borderColor: theme === "dark" ? "rgb(59, 66, 83)" : "rgb(235, 233, 241)",
              }}
              icon={<CloseOutlined />}
            >
              Bekor qilish
            </Button>
          )}
          <Button
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            className="h-[42px] px-6 rounded-xl border-0 shadow-lg font-bold flex items-center gap-2"
            style={{
              background: "linear-gradient(118deg, #ea5455, rgba(234, 84, 85, 0.7))",
              boxShadow: "0 8px 25px -8px #ea5455",
            }}
          >
            Chiqish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Quick Info */}
        <div className="space-y-6">
          <div
            className="rounded-xl overflow-hidden transition-all duration-300"
            style={{
              background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
              border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
              boxShadow: theme === "dark" ? "none" : "0 4px 12px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div className="p-8 text-center bg-[#7367f0]/5 border-b" style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)" }}>
              <div className="relative inline-block group">
                <Upload {...uploadProps} showUploadList={false}>
                  <Avatar
                    size={120}
                    src={filePath || undefined}
                    icon={!filePath && <UserOutlined />}
                    className="cursor-pointer ring-4 ring-[#7367f0]/20 transition-all duration-300 group-hover:ring-[#7367f0]/50"
                  />
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <EditOutlined className="text-white text-2xl" />
                  </div>
                </Upload>
              </div>
              <Title level={4} className="!mt-4 !mb-0" style={{ color: theme === "dark" ? "#e2e8f0" : "#484650" }}>
                {authUser?.full_name || "Admin"}
              </Title>
              <div className="text-[#7367f0] font-bold text-xs uppercase tracking-widest mt-1">
                {authUser?.role || "Boshqaruvchi"}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Text style={{ color: "gray" }}>Status</Text>
                <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase">Faol</span>
              </div>
              <div className="flex items-center justify-between">
                <Text style={{ color: "gray" }}>ID</Text>
                <Text strong style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>#{profile?.id || "N/A"}</Text>
              </div>
              <div className="flex items-center justify-between">
                <Text style={{ color: "gray" }}>Ro&apos;yxatdan o&apos;tgan</Text>
                <Text strong style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>{profile?.created_at?.split('T')[0] || "N/A"}</Text>
              </div>
            </div>
          </div>

          <div
            className="rounded-xl p-6 space-y-4"
            style={{
              background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
              border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
            }}
          >
            <Title level={5} className="!mb-4" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
              <SecurityScanOutlined className="text-[#7367f0] mr-2" /> Xavfsizlik
            </Title>
            <p className="text-xs text-gray-400">Parolni o&apos;zgartirish uchun parolni tiklash tizimidan foydalaning.</p>
            <Button
              block
              onClick={() => router.push("/forgot-password")}
              className="rounded-xl h-[42px] border-0 font-bold"
              style={{ background: "#7367f015", color: "#7367f0" }}
            >
              Parolni yangilash
            </Button>
          </div>
        </div>

        {/* Right Column: Profile Form */}
        <div className="lg:col-span-2">
          <div
            className="rounded-xl overflow-hidden transition-all duration-300"
            style={{
              background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
              border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
              boxShadow: theme === "dark" ? "none" : "0 4px 12px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div className="p-6 border-b" style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)" }}>
              <Title level={5} className="!mb-0" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>Asosiy ma&apos;lumotlar</Title>
            </div>

            <div className="p-8">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                disabled={!isEditing}
                initialValues={initialValues}
                className="premium-form"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <Form.Item name="first_name" label="Ism" rules={[{ required: true }]}>
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                  <Form.Item name="last_name" label="Familiya" rules={[{ required: true }]}>
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                  <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
                    <Input prefix={<MailOutlined />} />
                  </Form.Item>
                  <Form.Item name="phone_number" label="Telefon" rules={[{ required: true }]}>
                    <Input prefix={<PhoneOutlined />} />
                  </Form.Item>
                </div>

                <Divider style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)" }} />

                <Title level={5} className="!mb-6" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>Passport ma&apos;lumotlari</Title>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <Form.Item name="pinfl" label="PINFL">
                    <Input />
                  </Form.Item>
                  <Form.Item name="address" label="Manzil">
                    <Input />
                  </Form.Item>
                  <Form.Item name="passport_series" label="Serya">
                    <Input />
                  </Form.Item>
                  <Form.Item name="passport_number" label="Raqam">
                    <Input />
                  </Form.Item>
                </div>

                {isEditing && (
                  <div className="flex gap-4 pt-8">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isUpdating}
                      className="h-[45px] px-8 rounded-xl border-0 shadow-lg font-bold flex items-center gap-2"
                      style={{ background: "linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.7))", boxShadow: "0 8px 25px -8px #7367f0" }}
                      icon={<SaveOutlined />}
                    >
                      Ma&apos;lumotlarni saqlash
                    </Button>
                    <Button onClick={handleCancel} className="h-[45px] px-8 rounded-xl font-bold">
                      Bekor qilish
                    </Button>
                  </div>
                )}
              </Form>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .premium-form .ant-form-item-label > label {
          color: ${theme === "dark" ? "#94a3b8" : "#64748b"} !important;
          font-weight: 600 !important;
          font-size: 13px !important;
        }
        .premium-form .ant-input, .premium-form .ant-input-affix-wrapper {
          background: ${theme === "dark" ? "rgb(30, 38, 60)" : "#f8f8f8"} !important;
          border: ${theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)"} !important;
          color: ${theme === "dark" ? "#ffffff" : "#484650"} !important;
          border-radius: 12px !important;
          padding: 8px 12px !important;
        }
        .premium-form .ant-input-prefix {
          color: #7367f0 !important;
          margin-right: 8px !important;
        }
      `}</style>
    </div>
  );
}