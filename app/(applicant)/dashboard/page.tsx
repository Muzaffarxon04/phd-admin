"use client";

import {
  Breadcrumb,
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Avatar,
  Tag,
  Button,
  Timeline,
  Typography,
  Modal,
  // Upload,
  Form,
  Input,
  message,
} from "antd";

import {
  HomeOutlined,
  UserOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  CalendarOutlined,
  DollarOutlined,
  EditOutlined,
} from "@ant-design/icons";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { uz } from "date-fns/locale";

import { useGet, usePatch } from "@/lib/hooks";
import { tokenStorage } from "@/lib/utils";
// import { useThemeStore } from "@/lib/stores/themeStore";

const { Title, Text } = Typography;

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
}

interface RecentActivity {
  id: number;
  action: string;
  description: string;
  timestamp: string;
  status: "completed" | "pending" | "failed";
  icon: React.ReactNode;
}

interface ProfileFormValues {
  first_name: string;
  last_name: string;
  middle_name?: string;
  email?: string;
  phone_number: string;
}

/* ================= HELPERS ================= */

const generateTimestamp = (hoursAgo: number) => {
  const date = new Date();
  date.setHours(date.getHours() - hoursAgo);
  return date.toISOString();
};

const getStatusColor = (status: RecentActivity["status"]) => {
  switch (status) {
    case "completed":
      return "green";
    case "pending":
      return "orange";
    case "failed":
      return "red";
    default:
      return "blue";
  }
};

const getStatusIcon = (status: RecentActivity["status"]) => {
  if (status === "completed") return <CheckCircleOutlined className="text-green-500" />;
  if (status === "pending") return <ClockCircleOutlined className="text-orange-500" />;
  return <ClockCircleOutlined />;
};

/* ================= PAGE ================= */

export default function DashboardPage() {
  const savedUser = tokenStorage.getUser() as User | null;
  const { data: userData, isLoading } = useGet<User>("/auth/me/");
  const patchProfile = usePatch("/auth/update-profile/");
  // const { theme } = useThemeStore();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [, setIsEditing] = useState(false);
  const [form] = Form.useForm<ProfileFormValues>();

  const currentUser = userData || savedUser;

  const fullName =
    currentUser?.full_name ||
    `${currentUser?.last_name ?? ""} ${currentUser?.first_name ?? ""} ${currentUser?.middle_name ?? ""}`.trim() ||
    "Foydalanuvchi";

  const recentActivities: RecentActivity[] = [
    {
      id: 1,
      action: "Ariza yaratildi",
      description: "Fanlararo PhD dasturi",
      timestamp: currentUser?.last_login || generateTimestamp(3),
      status: "completed",
      icon: <FileTextOutlined />,
    },
    {
      id: 2,
      action: "To‘lov amalga oshirildi",
      description: "100 000 UZS",
      timestamp: generateTimestamp(2),
      status: "completed",
      icon: <DollarOutlined />,
    },
    {
      id: 3,
      action: "Hujjat yuklandi",
      description: "Diplom nusxasi",
      timestamp: generateTimestamp(5),
      status: "completed",
      icon: <CheckCircleOutlined />,
    },
    {
      id: 4,
      action: "Tekshiruvda",
      description: "Nashrlar ro‘yxati",
      timestamp: generateTimestamp(24),
      status: "pending",
      icon: <ClockCircleOutlined />,
    },
  ];

  const stats = [
    {
      title: "Arizalar",
      value: 3,
      suffix: "/5",
      icon: <FileTextOutlined />,
      color: "#1890ff",
    },
    {
      title: "Topshirilgan",
      value: 2,
      icon: <CheckCircleOutlined />,
      color: "#52c41a",
    },
    {
      title: "Kutilmoqda",
      value: 1,
      icon: <ClockCircleOutlined />,
      color: "#faad14",
    },
    {
      title: "Profil to‘liqligi",
      value: currentUser?.profile_completion ?? 0,
      suffix: "%",
      icon: <TrophyOutlined />,
      color: "#722ed1",
    },
  ];

  /* ================= HANDLERS ================= */

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
    setIsEditing(false);
    form.setFieldsValue({
      first_name: currentUser?.first_name,
      last_name: currentUser?.last_name,
      middle_name: currentUser?.middle_name,
      email: currentUser?.email,
      phone_number: currentUser?.phone_number,
    });
  };

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
    <div className="min-h-screen px-4 py-8">
      <Breadcrumb
        className="mb-6"
        items={[
          {
            href: "/",
            title: (
              <span className="flex items-center gap-2">
                <HomeOutlined /> Dashboard
              </span>
            ),
          },
          { title: "Bosh sahifa" },
        ]}
      />

      {/* HEADER */}
      <Card className="mb-8 rounded-2xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar size={96} src={currentUser?.photo} icon={<UserOutlined />} />
              <Button
                size="small"
                shape="circle"
                icon={<EditOutlined />}
                className="absolute -bottom-2 -right-2"
                onClick={openProfileModal}
              />
            </div>

            <div>
              <Title level={3}>{fullName}</Title>
              <Text>{currentUser?.role || "Foydalanuvchi"}</Text>
              <div className="mt-2 flex gap-2">
                {currentUser?.is_verified && (
                  <Tag color="success" icon={<CheckCircleOutlined />}>
                    Tasdiqlangan
                  </Tag>
                )}
                <Tag>
                  <CalendarOutlined />{" "}
                  {formatDistanceToNow(new Date(currentUser?.date_joined ?? generateTimestamp(24)), {
                    addSuffix: true,
                    locale: uz,
                  })}
                </Tag>
              </div>
            </div>
          </div>

          <Progress
            type="circle"
            percent={currentUser?.profile_completion ?? 0}
            size={90}
          />
        </div>
      </Card>

      {/* STATS */}
      <Row gutter={[24, 24]} className="mb-8">
        {stats.map((stat) => (
          <Col xs={24} md={12} lg={6} key={stat.title}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                suffix={stat.suffix}
                valueStyle={{ color: stat.color }}
                prefix={stat.icon}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* ACTIVITIES */}
      <Card title="So‘nggi faoliyat">
        <Timeline
          items={recentActivities.map((a) => ({
            dot: getStatusIcon(a.status),
            color: getStatusColor(a.status),
            children: (
              <div>
                <strong>{a.action}</strong>
                <p className="text-gray-500">{a.description}</p>
                <small>
                  {formatDistanceToNow(new Date(a.timestamp), {
                    addSuffix: true,
                    locale: uz,
                  })}
                </small>
              </div>
            ),
          }))}
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
    </div>
  );
}
