"use client";

import { use } from "react";
import {
  Card,
  Spin,
  Tag,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Badge,
  Descriptions,
  Steps,
  Result,
  Avatar,
  Tabs,
  Progress
} from "antd";
import { useGet } from "@/lib/hooks";
import Link from "next/link";
// import { useThemeStore } from "@/lib/stores/themeStore";
import { formatDate, getApplicationStatusLabel, getApplicationStatusColor, getPaymentStatusColor } from "@/lib/utils";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  // DollarOutlined,
  ArrowLeftOutlined,
  MailOutlined,
  PhoneOutlined,
  EyeOutlined,
  SendOutlined,
  TeamOutlined,
  SafetyOutlined
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface Submission {
  id: number;
  submission_number: string;
  application: number;
  application_title: string;
  applicant: number;
  applicant_name: string;
  applicant_phone: string;
  applicant_email?: string;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN";
  submitted_at?: string | null;
  payment_status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  payment_amount?: number;
  created_at: string;
  updated_at: string;
  review_notes?: string;
}

interface SubmissionsResponse {
  message: string;
  error: string | null;
  status: number;
  data: Submission;
}

export default function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: submissionResponse, isLoading } = useGet<SubmissionsResponse>(`/admin/submissions/${id}/`);
  const submission = submissionResponse?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="text-center">
          <Spin size="large" className="mb-4" />
          <p className="text-gray-500">Ariya yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <Result
            status="error"
            title="Ariya topilmadi"
            subTitle="Bunday ariya mavjud emas yoki sizga ruxsat etilmagan"
          />
          <Button type="primary" className="mt-4" href="/admin-panel/submissions">
            Ariyalar ro&apos;yxatiga qaytish
          </Button>
        </div>
      </div>
    );
  }

  // Status timeline data
  const statusTimeline = [
    {
      status: "DRAFT",
      title: "Tayyorlanmoqda",
      description: "Ar tayyorlanmoqda",
      icon: <ClockCircleOutlined />,
      color: "default"
    },
    {
      status: "SUBMITTED",
      title: "Topshirilgan",
      description: "Ariza muvaffaqiyatli topshirildi",
      icon: <SendOutlined />,
      color: "processing"
    },
    {
      status: "UNDER_REVIEW",
      title: "Ko&apos;rib chiqilmoqda",
      description: "Komissiya ko&apos;rib chiqmoqda",
      icon: <TeamOutlined />,
      color: "processing"
    },
    {
      status: "APPROVED",
      title: "Tasdiqlangan",
      description: "Ariza tasdiqlandi",
      icon: <CheckCircleOutlined />,
      color: "success"
    },
    {
      status: "REJECTED",
      title: "Rad etilgan",
      description: "Ariza rad etildi",
      icon: <ExclamationCircleOutlined />,
      color: "error"
    },
    {
      status: "WITHDRAWN",
      title: "O&apos;chirilgan",
      description: "Ariza o&apos;chirildi",
      icon: <UserOutlined />,
      color: "default"
    }
  ];

  const getStatusTimeline = (status: string) => {
    const step = statusTimeline.findIndex(step => step.status === status);
    return step >= 0 ? step : 0;
  };

  const currentStep = getStatusTimeline(submission.status);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className=" from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/admin-panel/submissions">
              <Button
                type="primary"
                icon={<ArrowLeftOutlined />}
                className="bg-white/20 hover:bg-white/30 border-white/20"
              >
                Orqaga
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Ariya #{submission.submission_number}</h1>
              <p className="text-purple-100">
                {submission.application_title}
              </p>
            </div>
            <div className="text-right">
              <Badge
                count={getApplicationStatusLabel(submission.status)}
                status={getApplicationStatusColor(submission.status) as "success" | "processing" | "default" | "error" | "warning"}
                className="bg-white/20 text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <Tabs defaultActiveKey="1" type="card">
          <TabPane tab="Umumiy ma&apos;lumot" key="1">
            {/* Timeline */}
            <Card className="mb-8">
              <Steps
                current={currentStep}
                items={statusTimeline.map((step) => ({
                  key: step.status,
                  title: step.title,
                  description: step.description,
                  icon: step.icon,
                }))}
              />
            </Card>

            {/* Status Overview */}
            <Row gutter={[24, 24]} className="mb-8">
              <Col xs={24} sm={12}>
                <Card className="h-full">
                  <div className="flex items-center justify-between mb-4">
                    <Title level={4}>Ariya holati</Title>
                    <Tag color={getApplicationStatusColor(submission.status)}>
                      {getApplicationStatusLabel(submission.status)}
                    </Tag>
                  </div>
                  <Space direction="vertical" className="w-full">
                    <div className="flex items-center justify-between">
                      <span>Yaratilgan</span>
                      <Text>{formatDate(submission.created_at)}</Text>
                    </div>
                    {submission.submitted_at && (
                      <div className="flex items-center justify-between">
                        <span>Topshirilgan</span>
                        <Text>{formatDate(submission.submitted_at)}</Text>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span>Yangilangan</span>
                      <Text>{formatDate(submission.updated_at)}</Text>
                    </div>
                  </Space>
                </Card>
              </Col>

              <Col xs={24} sm={12}>
                <Card className="h-full">
                  <div className="flex items-center justify-between mb-4">
                    <Title level={4}>To&apos;lov holati</Title>
                    <Tag color={getPaymentStatusColor(submission.payment_status)}>
                      {submission.payment_status === "PAID" ? "To&apos;langan" : submission.payment_status}
                    </Tag>
                  </div>
                  <Space direction="vertical" className="w-full">
                    <div className="flex items-center justify-between">
                      <span>To&apos;lov turi</span>
                      <Text>Online to&apos;lov</Text>
                    </div>
                    {submission.payment_amount && (
                      <div className="flex items-center justify-between">
                        <span>Summa</span>
                        <Text>{submission.payment_amount.toLocaleString()} UZS</Text>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span>Status</span>
                      <Progress 
                        percent={submission.payment_status === "PAID" ? 100 : 50} 
                        status={submission.payment_status === "PAID" ? "success" : "active"}
                      />
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>

            {/* Applicant Information */}
            <Card className="mb-8">
              <Title level={4} className="mb-6">Ariza beruvchi ma&apos;lumotlari</Title>
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Ism">
                  <div className="flex items-center gap-2">
                    <Avatar icon={<UserOutlined />} />
                    <span>{submission.applicant_name}</span>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Telefon">
                  <div className="flex items-center gap-2">
                    <PhoneOutlined />
                    <span>{submission.applicant_phone}</span>
                  </div>
                </Descriptions.Item>
                {submission.applicant_email && (
                  <Descriptions.Item label="Email">
                    <div className="flex items-center gap-2">
                      <MailOutlined />
                      <span>{submission.applicant_email}</span>
                    </div>
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Ariya raqami">
                  #{submission.submission_number}
                </Descriptions.Item>
                <Descriptions.Item label="Ariza ID">
                  {submission.application}
                </Descriptions.Item>
                <Descriptions.Item label="Yaratilgan sana">
                  {formatDate(submission.created_at)}
                </Descriptions.Item>
                <Descriptions.Item label="Holati">
                  <Tag color={getApplicationStatusColor(submission.status)}>
                    {getApplicationStatusLabel(submission.status)}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Review Notes */}
            {submission.review_notes && (
              <Card className="mb-8 border-l-4 border-l-blue-500">
                <Title level={4} className="mb-4 flex items-center gap-2">
                  <SafetyOutlined className="text-blue-500" />
                  Komissiya izohi
                </Title>
                <Paragraph className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {submission.review_notes}
                </Paragraph>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              {submission.status === "SUBMITTED" && (
                <Space>
                  <Button 
                    type="primary" 
                    size="large"
                    icon={<TeamOutlined />}
                    className=" from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-0"
                  >
                    Ko&apos;rib chiqishni boshlash
                  </Button>
                  <Button 
                    size="large"
                    icon={<CheckCircleOutlined />}
                  >
                    Tasdiqlash
                  </Button>
                </Space>
              )}
              
              {submission.status === "UNDER_REVIEW" && (
                <Button 
                  size="large"
                  icon={<ClockCircleOutlined />}
                  loading
                >
                  Ko&apos;rib chiqilmoqda
                </Button>
              )}
              
              {submission.status === "APPROVED" && (
                <Result
                  status="success"
                  title="Muvaffaqiyatli!"
                  subTitle="Ariyamiz tasdiqlandi"
                  icon={<CheckCircleOutlined className="text-6xl text-green-500" />}
                  extra={[
                    <Button key="approve" type="primary" icon={<SendOutlined />}>
                      Tasdiqlanish haqida ma&apos;lumot yuborish
                    </Button>,
                    <Button key="view">
                      Arizani ko&apos;rish
                    </Button>
                  ]}
                />
              )}
              
              {submission.status === "REJECTED" && (
                <Result
                  status="error"
                  title="Rad etildi"
                  subTitle="Ariyamiz rad etildi"
                  extra={[
                    <Button key="review" type="primary" icon={<EyeOutlined />}>
                      Arizani qayta ko&apos;rib chiqish
                    </Button>,
                    <Button key="contact">
                      Ariza beruvchiga bog&apos;lanish
                    </Button>
                  ]}
                />
              )}
            </div>
          </TabPane>

          <TabPane tab="Qo'shimcha ma&apos;lumot" key="2">
            <Card>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Space direction="vertical" className="w-full">
                    <div>
                      <Text type="secondary">Sistemada yaratilgan:</Text>
                      <div className="text-lg font-medium">
                        {formatDate(submission.created_at)}
                      </div>
                    </div>
                    {submission.submitted_at && (
                      <div>
                        <Text type="secondary">Topshirilgan sana:</Text>
                        <div className="text-lg font-medium">
                          {formatDate(submission.submitted_at)}
                        </div>
                      </div>
                    )}
                    <div>
                      <Text type="secondary">Oxirgi yangilangan:</Text>
                      <div className="text-lg font-medium">
                        {formatDate(submission.updated_at)}
                      </div>
                    </div>
                  </Space>
                </Col>
                <Col xs={24} md={12}>
                  <Space direction="vertical" className="w-full">
                    <div>
                      <Text type="secondary">Ariza holati:</Text>
                      <Tag color={getApplicationStatusColor(submission.status)} className="text-base">
                        {getApplicationStatusLabel(submission.status)}
                      </Tag>
                    </div>
                    <div>
                      <Text type="secondary">To&apos;lov holati:</Text>
                      <Tag color={getPaymentStatusColor(submission.payment_status)} className="text-base">
                        {submission.payment_status === "PAID" ? "To&apos;langan" : submission.payment_status}
                      </Tag>
                    </div>
                    {submission.payment_amount && (
                      <div>
                        <Text type="secondary">To&apos;lov summasi:</Text>
                        <div className="text-lg font-medium text-green-600">
                          {submission.payment_amount.toLocaleString()} UZS
                        </div>
                      </div>
                    )}
                  </Space>
                </Col>
              </Row>
            </Card>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
}