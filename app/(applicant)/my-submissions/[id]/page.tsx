"use client";

import { use } from "react";
import { 
  Card, 
  Spin, 
  Tag, 
  Button, 
  Progress,
  Typography,
  Row,
  Col,
  message,
  Alert,
  List,
  Tooltip,
  Space,
  Result,
  Badge,
  Steps,
} from "antd";
import { 
  useGet, 
  usePost, 
  // usePatch, 
  // useUpload 
} from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useThemeStore } from "@/lib/stores/themeStore";
import Link from "next/link";
import { 
  formatDate, 
  getApplicationStatusLabel, 

} from "@/lib/utils";
import { 

  CheckCircleOutlined, 
  ClockCircleOutlined, 
  ExclamationCircleOutlined,
  UploadOutlined,
  DownloadOutlined,
  ArrowLeftOutlined,

  UserOutlined,
  TeamOutlined,

  ReloadOutlined,
  SendOutlined,
  InboxOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
import { useState } from "react";
interface Submission {
  id: number;
  submission_number: string;
  application_title: string;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN";
  payment_status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  review_notes?: string;
  answers: Array<{
    id: number;
    field_label: string;
    field_type: string;
    answer_text?: string;
  }>;
  documents: Array<{
    id: number;
    document_type: string;
    file: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    uploaded_at: string;
  }>;
  created_at: string;
  submitted_at?: string;
  updated_at?: string;
}

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
    description: "Ariya muvaffaqiyatli topshirildi",
    icon: <SendOutlined />,
    color: "processing"
  },
  {
    status: "UNDER_REVIEW",
    title: "Ko'rib chiqilmoqda",
    description: "Komissiya ko'rib chiqmoqda",
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
    title: "O'chirilgan",
    description: "Ariya o'chirildi",
    icon: <UserOutlined />,
    color: "default"
  }
];

export default function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState(0);
  const { theme } = useThemeStore();

  const { data: submission, isLoading } = useGet<Submission>(`/applicant/my-submissions/${id}/`);

  const { mutate: submitSubmission, isPending: isSubmitting } = usePost(`/applicant/submissions/${id}/submit/`, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/applicant/my-submissions/${id}/`] });
      message.success("Ariya muvaffaqiyatli topshirildi!");
    },
    onError: (error) => {
      message.error(error.message || "Topshirishda xatolik");
    },
  });

  // const { mutate: updateSubmission } = usePatch(`/applicant/submissions/${id}/update/`, {
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: [`/applicant/my-submissions/${id}/`] });
  //     message.success("Ariya yangilandi!");
  //   },
  //   onError: (error) => {
  //     message.error(error.message || "Yangilashda xatolik");
  //   },
  // });

  // const { mutate: uploadDocument } = useUpload(`/applicant/submissions/${id}/documents/`, {
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: [`/applicant/my-submissions/${id}/`] });
  //     message.success("Hujjat yuklandi!");
  //   },
  //   onError: (error) => {
  //     message.error(error.message || "Hujjat yuklashda xatolik");
  //   },
  // });

  const getStatusTimeline = (status: string) => {
    const step = statusTimeline.findIndex(step => step.status === status);
    setActiveStep(step >= 0 ? step : 0);
  };

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
          <Link href="/my-submissions">
            <Button type="primary" className="mt-4">
              Ariyalar ro&apos;yxatiga qaytish
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Set active step based on status
  getStatusTimeline(submission.status);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED": return "success";
      case "REJECTED": return "error";
      case "UNDER_REVIEW": return "processing";
      case "SUBMITTED": return "processing";
      case "DRAFT": return "default";
      case "WITHDRAWN": return "default";
      default: return "default";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className={`text-white ${
        theme === "dark" 
          ? " from-purple-700 to-pink-700" 
          : " from-purple-600 to-pink-600"
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/my-submissions">
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
                status={getStatusColor(submission.status)}
                className="bg-white/20 text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Timeline */}
        <Card className="mb-8" style={{ background: theme === "dark" ? "#1a1d29" : "#ffffff", color: theme === "dark" ? "#ffffff" : "#333333" }}>
          <Steps
            current={activeStep}
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
            <Card className="h-full" style={{ background: theme === "dark" ? "#1a1d29" : "#ffffff", color: theme === "dark" ? "#ffffff" : "#333333" }}>
              <div className="flex items-center justify-between mb-4">
                <Title level={4}>Ariya holati</Title>
                <Badge 
                  status={getStatusColor(submission.status)} 
                  text={getApplicationStatusLabel(submission.status)}
                />
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
                {submission.updated_at && (
                  <div className="flex items-center justify-between">
                    <span>Yangilangan</span>
                    <Text>{formatDate(submission.updated_at)}</Text>
                  </div>
                )}
              </Space>
            </Card>
          </Col>

          <Col xs={24} sm={12}>
            <Card className="h-full" style={{ background: theme === "dark" ? "#1a1d29" : "#ffffff", color: theme === "dark" ? "#ffffff" : "#333333" }}>
              <div className="flex items-center justify-between mb-4">
                <Title level={4}>To&apos;lov holati</Title>
                <Tag color={submission.payment_status === "PAID" ? "green" : "orange"}>
                  {submission.payment_status === "PAID" ? "To&apos;langan" : submission.payment_status}
                </Tag>
              </div>
              <Space direction="vertical" className="w-full">
                <div className="flex items-center justify-between">
                  <span>To&apos;lov turi</span>
                  <Text>Online to&apos;lov</Text>
                </div>
                <div className="flex items-center justify-between">
                  <span>Summa</span>
                  <Text>500 000 UZS</Text>
                </div>
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  <Progress 
                    percent={submission.payment_status === "PAID" ? 100 : 50} 
                    status={submission.payment_status === "PAID" ? "success" : "active"}
                    trailColor={theme === "dark" ? "#374151" : "#f0f0f0"}
                  />
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Review Notes */}
        {submission.review_notes && (
          <Alert
            message="Komissiya izohi"
            description={submission.review_notes}
            type="info"
            showIcon
            className="mb-8"
          />
        )}

        {/* Javoblar */}
        <Card className="mb-8" style={{ background: theme === "dark" ? "#1a1d29" : "#ffffff", color: theme === "dark" ? "#ffffff" : "#333333" }}>
          <Title level={4} className="mb-6">Ariya javoblari</Title>
          <List
            dataSource={submission.answers}
            renderItem={(answer) => (
              <List.Item>
                <Card size="small" className="w-full" style={{ background: theme === "dark" ? "#2d3748" : "#f9fafb" }}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Text strong>{answer.field_label}</Text>
                        <Tag color="blue">{answer.field_type}</Tag>
                      </div>
                      <Text className="text-gray-600 dark:text-gray-400">
                        {answer.answer_text || "-"}
                      </Text>
                    </div>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </Card>

        {/* Hujjatlar */}
        <Card className="mb-8" style={{ background: theme === "dark" ? "#1a1d29" : "#ffffff", color: theme === "dark" ? "#ffffff" : "#333333" }}>
          <div className="flex items-center justify-between mb-6">
            <Title level={4}>Yuklangan hujjatlar</Title>
            <Button 
              icon={<UploadOutlined />}
              size="small"
            >
              Hujjat yuklash
            </Button>
          </div>
          
          {submission?.documents?.length === 0 ? (
            <div className="text-center py-12">
              <InboxOutlined className="text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500">Hujjatlar yuklanmagan</p>
            </div>
          ) : (
            <List
              dataSource={submission.documents || []}
              renderItem={(doc) => (
                <List.Item
                  actions={[
                    <Tooltip key="download" title="Yuklab olish">
                      <Button 
                        type="text" 
                        icon={<DownloadOutlined />}
                        onClick={() => window.open(doc.file, '_blank')}
                      >
                        Yuklab olish
                      </Button>
                    </Tooltip>
                  ]}
                >
                  <Card size="small" className="flex-1" style={{ background: theme === "dark" ? "#2d3748" : "#f9fafb" }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <Text strong>{doc.document_type}</Text>
                        <div className="text-sm text-gray-500 mt-1">
                          Yuklangan: {formatDate(doc.uploaded_at)}
                        </div>
                      </div>
                      <Tag color={doc.status === "APPROVED" ? "green" : doc.status === "REJECTED" ? "red" : "orange"}>
                        {doc.status}
                      </Tag>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          )}
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          {submission.status === "DRAFT" && (
            <Space>
              <Button 
                type="primary" 
                size="large"
                onClick={() => submitSubmission({})}
                loading={isSubmitting}
                icon={<SendOutlined />}
                className=" from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 border-0"
              >
                Ariyani topshirish
              </Button>
              <Button 
                size="large"
                icon={<ReloadOutlined />}
              >
                O&apos;zgartirish
              </Button>
            </Space>
          )}
          
          {submission.status === "SUBMITTED" && (
            <Button 
              size="large"
              icon={<ClockCircleOutlined />}
            >
              Ko&apos;rib chiqilmoqda
            </Button>
          )}
          
          {submission.status === "UNDER_REVIEW" && (
            <Button 
              size="large"
              icon={<TeamOutlined />}
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
            />
          )}
          
          {submission.status === "REJECTED" && (
            <Result
              status="error"
              title="Rad etildi"
              subTitle="Ariyamiz rad etildi"
              extra={[
                <Button key="retry" type="primary" icon={<SendOutlined />}>
                  Qayta topshirish
                </Button>,
                <Button key="cancel">
                  Bekor qilish
                </Button>
              ]}
            />
          )}
        </div>
      </div>
    </div>
  );
}