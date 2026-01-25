"use client";

import { use } from "react";
import {
  Card,
  Button,
  Tag,
  Typography,
  Row,
  Col,
  Avatar,
  Breadcrumb,
  Descriptions,
  Spin,
  Alert,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  BookOutlined,
  EditOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useGet } from "@/lib/hooks";
import type { Examiner } from "@/types";
import { formatDate } from "@/lib/utils";

const { Title, Text } = Typography;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ExaminerDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: examiner, isLoading, error } = useGet<Examiner>(`/admin/examiners/${id}/`);

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
          description="Imtihonchi ma&apos;lumotlarini yuklashda xatolik yuz berdi"
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (!examiner) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <Alert
          message="Topilmadi"
          description="Bunday imtihonchi mavjud emas"
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
            { href: "/admin-panel/examiners", title: "Imtihonchilar" },
            { title: examiner.full_name },
          ]}
          className="mb-4"
        />

        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push("/admin-panel/examiners")}
          >
            Orqaga
          </Button>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* Profile Card */}
        <Col xs={24} lg={8}>
          <Card className="text-center">
            <Avatar
              size={120}
              icon={<UserOutlined />}
              className="mb-4 mx-auto"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            />

            <Title level={3} className="mb-2">
              {examiner.full_name}
            </Title>

            <div className="space-y-2 mb-4">
              <Tag color="purple" className="text-base px-3 py-1">
                {examiner.degree}
              </Tag>
              <div className="text-gray-600 dark:text-gray-400">
                {examiner.position}
              </div>
            </div>

            <Tag color={examiner.is_active ? "green" : "red"} className="mb-4">
              {examiner.is_active ? "Faol" : "Nofaol"}
            </Tag>

            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => router.push(`/admin-panel/examiners/${id}/edit`)}
              className="w-full"
            >
              Tahrirlash
            </Button>
          </Card>
        </Col>

        {/* Details */}
        <Col xs={24} lg={16}>
          <Card title="Asosiy ma&apos;lumotlar" className="mb-6">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="To'liq ism">
                <Text strong>{examiner.full_name}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Email">
                <div className="flex items-center gap-2">
                  <MailOutlined className="text-gray-400" />
                  {examiner.email}
                </div>
              </Descriptions.Item>

              {examiner.phone && (
                <Descriptions.Item label="Telefon">
                  <div className="flex items-center gap-2">
                    <PhoneOutlined className="text-gray-400" />
                    {examiner.phone}
                  </div>
                </Descriptions.Item>
              )}

              <Descriptions.Item label="Ilmiy daraja">
                <Tag color="purple">{examiner.degree}</Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Lavozim">
                {examiner.position}
              </Descriptions.Item>

              <Descriptions.Item label="Tashkilot">
                <div className="flex items-center gap-2">
                  <HomeOutlined className="text-gray-400" />
                  {examiner.organization}
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Mutaxassislik">
                {examiner.specialization ? (
                  <div className="flex items-center gap-2">
                    <BookOutlined className="text-blue-500" />
                    <Tag color="blue">
                      {examiner.specialization.code} - {examiner.specialization.name}
                    </Tag>
                  </div>
                ) : (
                  <Text type="secondary">Kiritilmagan</Text>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Holati">
                <Tag color={examiner.is_active ? "green" : "red"}>
                  {examiner.is_active ? "Faol" : "Nofaol"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Timeline */}
          <Card title="Faoliyat tarixi">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <div className="font-medium">Imtihonchi sifatida ro&apos;yxatdan o&apos;tdi</div>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <CalendarOutlined />
                    {formatDate(examiner.created_at)}
                  </div>
                </div>
              </div>

              {examiner.updated_at !== examiner.created_at && (
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium">Ma&apos;lumotlar yangilandi</div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <CalendarOutlined />
                      {formatDate(examiner.updated_at)}
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