"use client";

import { useState } from "react";
import { Form, Input, Button, Card, App, Avatar, Upload, Row, Col, Divider, Space } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, SecurityScanOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useGet, usePatch } from "@/lib/hooks";
import { useAuthStore } from "@/lib/stores/authStore";

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Profil</h1>
        <Space>
          <Button type="primary" onClick={handleEdit}>
            ✏️ Tahrirlash
          </Button>
          <Button onClick={handleLogout} danger>
            🚪 Chiqish
          </Button>
        </Space>
      </div>

      {/* Profile Card */}
      <Card className="shadow-lg">
        <Row gutter={[24, 24]}>
          {/* Avatar Section */}
          <Col span={8}>
            <div className="text-center">
              <Upload {...uploadProps} className="mb-4">
                <Avatar
                  size={120}
                  src={filePath || undefined}
                  icon={!filePath && <UserOutlined />}
                  className="cursor-pointer border-4 border-gray-200 hover:border-purple-500 transition-colors"
                />
              </Upload>
              <p className="text-sm text-gray-500">Profil rasmini yuklash</p>
            </div>
          </Col>

          {/* Profile Form Section */}
          <Col span={16}>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">👤 {authUser?.full_name || "Admin"}</h3>
              <p className="text-gray-600">{authUser?.role || "Admin"}</p>
            </div>
            
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              disabled={!isEditing}
              initialValues={initialValues}
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item
                    name="first_name"
                    label={<span className="font-semibold">Ism</span>}
                    rules={[{ required: true, message: "Ismni kiriting!" }]}
                  >
                    <Input prefix={<UserOutlined />} className="rounded-lg" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="last_name"
                    label={<span className="font-semibold">Familiya</span>}
                    rules={[{ required: true, message: "Familiyani kiriting!" }]}
                  >
                    <Input prefix={<UserOutlined />} className="rounded-lg" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label={<span className="font-semibold">Email</span>}
                    rules={[
                      { required: true, message: "Emailni kiriting!" },
                      { type: "email", message: "Email formati noto'g'ri!" },
                    ]}
                  >
                    <Input prefix={<MailOutlined />} className="rounded-lg" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="phone_number"
                    label={<span className="font-semibold">Telefon raqam</span>}
                    rules={[
                      { required: true, message: "Telefon raqamni kiriting!" },
                      { pattern: /^\+998\d{9}$/, message: "Telefon raqam formati: +998901234567" },
                    ]}
                  >
                    <Input prefix={<PhoneOutlined />} className="rounded-lg" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <h3 className="font-semibold mb-4">Passport ma&apos;lumotlari</h3>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item
                    name="pinfl"
                    label={<span className="font-semibold">PINFL</span>}
                  >
                    <Input className="rounded-lg" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="address"
                    label={<span className="font-semibold">Manzil</span>}
                  >
                    <Input className="rounded-lg" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item
                    name="passport_series"
                    label={<span className="font-semibold">Pasport seriyasi</span>}
                  >
                    <Input className="rounded-lg" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="passport_number"
                    label={<span className="font-semibold">Pasport raqami</span>}
                  >
                    <Input className="rounded-lg" />
                  </Form.Item>
                </Col>
              </Row>

              {isEditing && (
                <div className="flex gap-4 pt-4">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isUpdating}
                    className="rounded-lg"
                    style={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none",
                    }}
                  >
                    💾 Saqlash
                  </Button>
                  <Button onClick={handleCancel} className="rounded-lg">
                    ❌ Bekor qilish
                  </Button>
                </div>
              )}
            </Form>
          </Col>
        </Row>
      </Card>

      {/* Quick Info Card */}
      <Card title="Tezkor ma'lumotlar" className="shadow-lg">
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">F.I.SH</p>
              <p className="font-semibold">{profile?.first_name} {profile?.last_name}</p>
            </div>
          </Col>
          <Col span={8}>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Rol</p>
              <p className="font-semibold text-purple-600">{profile?.role}</p>
            </div>
          </Col>
          <Col span={8}>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Ro&apos;yxatdan o&apos;tgan</p>
              <p className="font-semibold">{profile?.created_at?.split('T')[0]}</p>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Change Password Section */}
      <Card 
        title={
          <div className="flex items-center gap-2">
            <SecurityScanOutlined className="text-purple-600" />
            <span>Parolni o&apos;zgartirish</span>
          </div>
        } 
        className="shadow-lg"
      >
        <p className="text-gray-600 mb-4">
          Parolni o&apos;zgartirish uchun parolni tiklash sahifasidan foydalaning.
        </p>
        <Button 
          type="primary" 
          className="rounded-lg"
          onClick={() => {
            router.push("/forgot-password");
          }}
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
          }}
        >
          🔐 Parolni Tiklash
        </Button>
      </Card>
    </div>
  );
}