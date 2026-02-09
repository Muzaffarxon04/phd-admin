"use client";

import { use } from "react";
import { Card, Button, Typography, Row, Col, Spin, Alert } from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useGet } from "@/lib/hooks";
import { formatDate } from "@/lib/utils";

const { Title, Text } = Typography;

interface Examiner {
  id: number;
  full_name: string | null;
  title: string;
  department: string;
  academic_degree: string;
  position: string;
  role: "CHAIRMAN" | "SECRETARY" | "MEMBER" | "OPPONENT";
  role_display: string;
}

interface Speciality {
  id: number;
  name: string;
  code: string;
  description: string;
  examiners: Examiner[];
}

interface ApplicationField {
  id: number;
  label: string;
  field_type: "TEXT" | "TEXTAREA" | "EMAIL" | "PHONE" | "NUMBER" | "DATE" | "SELECT" | "RADIO" | "CHECKBOX" | "FILE" | "URL";
  help_text?: string;
  placeholder?: string;
  required?: boolean;
  options?: unknown;
  min_length?: number;
  max_length?: number;
  min_value?: string;
  max_value?: string;
  allowed_file_types?: string[];
  max_file_size?: number;
  order?: number;
}

interface Application {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  exam_date?: string | null;
  status: "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
  requires_oneid_verification: boolean;
  max_submissions?: number;
  application_fee?: string;
  instructions?: string;
  required_documents: string[];
  total_submissions: number;
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  fields?: ApplicationField[];
  specialities: Speciality[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ApplicationDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: applicationData, isLoading, error } = useGet<{ data: Application }>(`/admin/application/${id}/`);

  const application = applicationData?.data;

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
          description="Ariza ma&apos;lumotlarini yuklashda xatolik yuz berdi"
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <Alert
          message="Topilmadi"
          description="Bunday ariza mavjud emas"
          type="warning"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/admin-panel/applications")}
            >
              Orqaga
            </Button>
            <div>
              <Title level={2} className="mb-0">{application.title}</Title>
              <Text type="secondary">Ariza #{application.id}</Text>
            </div>
          </div>
          <Button type="primary" icon={<EditOutlined />}>
            Tahrirlash
          </Button>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Card title="Ariza tafsilotlari">
            <p><strong>Nomi:</strong> {application.title}</p>
            <p><strong>Tavsif:</strong> {application.description}</p>
            <p><strong>Holat:</strong> {application.status}</p>
            <p><strong>OneID tekshiruvi:</strong> {application.requires_oneid_verification ? "Talab qilinadi" : "Talab qilinmaydi"}</p>
            <p><strong>Boshlanish sanasi:</strong> {formatDate(application.start_date)}</p>
            <p><strong>Tugash sanasi:</strong> {formatDate(application.end_date)}</p>
            <p><strong>Imtihon sanasi:</strong> {application.exam_date ? formatDate(application.exam_date) : "Kiritilmagan"}</p>
            <p><strong>Ariza to&apos;lovi:</strong> {application.application_fee ? `${application.application_fee} UZS` : "Bepul"}</p>
            <p><strong>Jami topshiriqlar:</strong> {application.total_submissions}</p>
            <p><strong>Yaratgan:</strong> {application.created_by_name}</p>
          </Card>
        </Col>

        <Col xs={24}>
          <Card title="Mutaxassisliklar">
            {application.specialities && application.specialities.length > 0 ? (
              application.specialities.map((speciality) => (
                <div key={speciality.id} className="mb-4 p-4 border rounded">
                  <h4>{speciality.code} - {speciality.name}</h4>
                  <p>{speciality.description}</p>
                  <h5>Imtihonchilar:</h5>
                  {speciality.examiners && speciality.examiners.length > 0 ? (
                    speciality.examiners.map((examiner) => (
                      <div key={examiner.id} className="ml-4 mb-2">
                        <p><strong>Ism:</strong> {examiner.full_name || "Noma&apos;lum"}</p>
                        <p><strong>Unvon:</strong> {examiner.title}</p>
                        <p><strong>Kafedra:</strong> {examiner.department}</p>
                        <p><strong>Roli:</strong> {examiner.role_display} ({examiner.role})</p>
                      </div>
                    ))
                  ) : (
                    <p>Imtihonchilar tayinlanmagan</p>
                  )}
                </div>
              ))
            ) : (
              <p>Mutaxassisliklar mavjud emas</p>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}