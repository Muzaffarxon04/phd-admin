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
import { formatDateTime } from "@/lib/utils";
import { CardSkeleton } from "@/components/LoadingSkeleton";

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
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
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
      <div className="space-y-6">
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Breadcrumb
          items={[
            { href: "/admin-panel", title: "Admin Panel" },
            { href: "/admin-panel/specialities", title: "Mutaxassisliklar" },
            { title: speciality.name },
          ]}
          className="mb-3 [&_ol]:flex-wrap"
        />

        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push("/admin-panel/specialities")}
            className="min-h-[44px] sm:min-h-0"
          >
            Orqaga
          </Button>
        </div>
      </div>

      {/* Header Card */}
      <Card styles={{ body: { padding: "clamp(16px, 4vw, 24px)" } }}>
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} md={16}>
            <div className="mb-4 flex items-center gap-3 sm:gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 sm:h-16 sm:w-16">
                <BookOutlined className="text-xl text-white sm:text-2xl" />
              </div>
              <div className="min-w-0">
                <Title level={3} className="mb-1! break-words text-xl! sm:text-2xl!">
                  {speciality.name}
                </Title>
                <Tag color="blue" className="px-3 py-1 text-sm sm:text-base">
                  {speciality.code}
                </Tag>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-2">
                <ExperimentOutlined className="text-purple-500" />
                <Text strong>{speciality.field_of_science}</Text>
              </div>

              <Tag color={speciality.is_active ? "green" : "red"}>
                {speciality.is_active ? "Faol" : "Nofaol"}
              </Tag>
            </div>

            {speciality.description && (
              <Text className="text-base text-gray-600 dark:text-gray-400">
                {speciality.description}
              </Text>
            )}
          </Col>

          <Col xs={24} md={8} className="md:text-right">
            <Button
              type="primary"
              size="large"
              icon={<EditOutlined />}
              onClick={() => router.push(`/admin-panel/specialities/${id}/edit`)}
              className="w-full md:w-auto"
            >
              Tahrirlash
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Imtihonchilar soni"
              value={stats.totalExaminers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Jami arizalar"
              value={stats.totalApplications}
              prefix={<BookOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
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
          <Card title="Batafsil ma'lumotlar">
            <Descriptions column={{ xs: 1, sm: 1, md: 2 }} bordered size="middle">
              <Descriptions.Item label="Kod">
                <Tag color="blue" className="font-mono text-base">
                  {speciality.code}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Nomi">
                <Text strong className="break-words text-base">{speciality.name}</Text>
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
                <Descriptions.Item label="Tavsif" span={{ xs: 1, sm: 1, md: 2 }}>
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
                    {formatDateTime(speciality.created_at)}
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
                      {formatDateTime(speciality.updated_at)}
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