"use client";

import { use } from "react";
import {
  Card,
  Button,
  Tag,
  Typography,
  Row,
  Col,
  Breadcrumb,
  Descriptions,
  Spin,
  Alert,
  Statistic,
} from "antd";
import {
  ArrowLeftOutlined,
  BookOutlined,
  ExperimentOutlined,
  EditOutlined,
  CalendarOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useGet } from "@/lib/hooks";
import type { Speciality } from "@/types";
import { formatDate } from "@/lib/utils";

const { Title, Text } = Typography;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SpecialityDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: speciality, isLoading, error } = useGet<Speciality>(`/examiner/${id}/`);

  // Mock data for statistics - in real app this would come from API
  const stats = {
    totalExaminers: 12,
    totalApplications: 45,
    activeApplications: 23,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <Alert
          message="Xatolik"
          description="Mutaxassislik ma&apos;lumotlarini yuklashda xatolik yuz berdi"
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (!speciality) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <Alert
          message="Topilmadi"
          description="Bunday mutaxassislik mavjud emas"
          type="warning"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <Breadcrumb
          items={[
            { href: "/admin-panel", title: "Admin Panel" },
            { href: "/admin-panel/specialities", title: "Mutaxassisliklar" },
            { title: speciality.name },
          ]}
          className="mb-4"
        />

        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push("/admin-panel/specialities")}
          >
            Orqaga
          </Button>
        </div>
      </div>

      {/* Header Card */}
      <Card className="mb-6">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={16}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BookOutlined className="text-2xl text-white" />
              </div>
              <div>
                <Title level={2} className="mb-1">
                  {speciality.name}
                </Title>
                <Tag color="blue" className="text-lg px-3 py-1">
                  {speciality.code}
                </Tag>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <ExperimentOutlined className="text-purple-500" />
                <Text strong>{speciality.field_of_science}</Text>
              </div>

              <Tag color={speciality.is_active ? "green" : "red"}>
                {speciality.is_active ? "Faol" : "Nofaol"}
              </Tag>
            </div>

            {speciality.description && (
              <Text className="text-gray-600 dark:text-gray-400 text-lg">
                {speciality.description}
              </Text>
            )}
          </Col>

          <Col xs={24} md={8} className="text-right">
            <Button
              type="primary"
              size="large"
              icon={<EditOutlined />}
              onClick={() => router.push(`/admin-panel/specialities/${id}/edit`)}
              className="mb-4"
            >
              Tahrirlash
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={[24, 24]} className="mb-6">
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Imtihonchilar soni"
              value={stats.totalExaminers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Jami arizalar"
              value={stats.totalApplications}
              prefix={<BookOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Faol arizalar"
              value={stats.activeApplications}
              prefix={<ExperimentOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Details */}
        <Col xs={24} lg={16}>
          <Card title="Batafsil ma'lumotlar" className="mb-6">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Kod">
                <Tag color="blue" className="font-mono text-base">
                  {speciality.code}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Nomi">
                <Text strong className="text-lg">{speciality.name}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Fan sohasi">
                <div className="flex items-center gap-2">
                  <ExperimentOutlined className="text-purple-500" />
                  {speciality.field_of_science}
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Holati">
                <Tag color={speciality.is_active ? "green" : "red"} className="text-base">
                  {speciality.is_active ? "Faol" : "Nofaol"}
                </Tag>
              </Descriptions.Item>

              {speciality.description && (
                <Descriptions.Item label="Tavsif" span={2}>
                  <Text className="text-gray-600 dark:text-gray-400">
                    {speciality.description}
                  </Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>

        {/* Timeline */}
        <Col xs={24} lg={8}>
          <Card title="Tarix">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <div className="font-medium">Mutaxassislik yaratildi</div>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <CalendarOutlined />
                    {formatDate(speciality.created_at)}
                  </div>
                </div>
              </div>

              {speciality.updated_at !== speciality.created_at && (
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium">Ma&apos;lumotlar yangilandi</div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <CalendarOutlined />
                      {formatDate(speciality.updated_at)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}