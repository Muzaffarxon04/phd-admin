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
  InboxOutlined,
  FileTextOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
import { useState } from "react";
interface Submission {
  id: number;
  submission_number: string;
  application: {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    status: string;
    application_fee: string;
    created_at: string;
  };
  applicant: number;
  applicant_name: string;
  applicant_phone: string;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN";
  payment_status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  payment_reference?: string;
  review_notes?: string;
  reviews?: unknown[]; // or define Review type if needed
  answers: Array<{
    id: number;
    field: number;
    field_label: string;
    field_type: string;
    answer_text?: string;
    answer?: string;
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
  const { theme } = useThemeStore();

  const { data: response, isLoading } = useGet<{ data: Submission }>(`/applicant/my-submissions/${id}/`);
  const submission = response?.data;
  // console.log(submission);
  const submissionId = submission?.id;
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

  /* 
    Updated to derive active step directly during render instead of setting state.
    This prevents the "Too many re-renders" error.
  */

  /* 
    Updated to derive active step directly during render instead of setting state.
    This prevents the "Too many re-renders" error.
  */

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center" style={{ background: theme === "dark" ? "rgb(23, 28, 41)" : "#f8f9fa" }}>
        <div className="text-center">
          <Spin size="large" className="mb-4" />
          <Text style={{ color: theme === "dark" ? "#b4b7bd" : "#6c757d" }}>Ariza yuklanmoqda...</Text>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen p-8" style={{ background: theme === "dark" ? "rgb(23, 28, 41)" : "#f8f9fa" }}>
        <div className="max-w-4xl mx-auto text-center">
          <Result
            status="error"
            title={<span style={{ color: theme === "dark" ? "#ffffff" : "#333333" }}>Ariza topilmadi</span>}
            subTitle={<span style={{ color: theme === "dark" ? "#b4b7bd" : "#6c757d" }}>Bunday ariza mavjud emas yoki sizga ruxsat etilmagan</span>}
          />
          <Link href="/my-submissions">
            <Button type="primary" className="mt-4 h-[42px] px-6 rounded-xl font-medium">
              Arizalar ro'yxatiga qaytish
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentStatusIndex = statusTimeline.findIndex(step => step.status === submission.status);
  const activeStep = currentStatusIndex >= 0 ? currentStatusIndex : 0;

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

  const cardStyle = {
    background: theme === "dark" ? "#1f2937" : "#ffffff",
    border: theme === "dark" ? "1px solid #374151" : "1px solid #f0f0f0",
    boxShadow: "none",
    borderRadius: "8px"
  };

  const textStyle = {
    color: theme === "dark" ? "#9ca3af" : "#6b7280"
  };

  const titleStyle = {
    color: theme === "dark" ? "#f3f4f6" : "#111827",
    marginBottom: "0px"
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="pt-8 pb-8 border-b" style={{
        background: theme === "dark" ? "#1f2937" : "#ffffff",
        borderColor: theme === "dark" ? "#374151" : "#e5e7eb"
      }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Link href="/my-submissions">
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                  style={{ color: theme === "dark" ? "#e5e7eb" : "#374151" }}
                />
              </Link>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-semibold m-0" style={{ color: theme === "dark" ? "#f9fafb" : "#111827" }}>
                    Ariza #{submission.submission_number}
                  </h1>
                  <Tag
                    className="m-0 border-0 px-2 py-0.5 rounded text-xs font-medium"
                    color={submission.status === 'APPROVED' ? 'success' : submission.status === 'REJECTED' ? 'error' : 'processing'}
                  >
                    {getApplicationStatusLabel(submission.status)}
                  </Tag>
                </div>
                <p className="text-sm m-0" style={{ color: theme === "dark" ? "#9ca3af" : "#6b7280" }}>
                  {submission?.application?.title}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6">
        {/* Timeline */}
        <Card className="!mb-6 border-0" style={cardStyle} bodyStyle={{ padding: "32px 24px" }}>
          <Steps
            current={activeStep}
            size="small"
            items={statusTimeline.map((step) => ({
              key: step.status,
              title: <span style={{ color: theme === 'dark' ? '#d1d5db' : (activeStep >= statusTimeline.indexOf(step) ? '#111827' : '#9ca3af') }}>{step.title}</span>,
              icon: step.icon,
            }))}
          />
        </Card>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Spin />
          </div>
        ) : (
          <>
            {/* Status Overview */}
            <Row gutter={[24, 24]} className="mb-6">
              <Col xs={24} md={12}>
                <Card className="h-full border-0" style={cardStyle}>
                  <div className="flex items-center justify-between mb-6">
                    <Title level={5} style={titleStyle}>Ariza holati</Title>
                  </div>

                  <div className="space-y-4">
                 
                    {submission.submitted_at && (
                      <div className="flex items-center justify-between border-b pb-2 last:border-0" style={{ borderColor: theme === 'dark' ? '#374151' : '#f3f4f6' }}>
                        <Text style={textStyle}>Topshirilgan</Text>
                        <Text style={{ color: theme === 'dark' ? '#e5e7eb' : '#111827' }}>{formatDate(submission.submitted_at)}</Text>
                      </div>
                    )}
                    {submission.updated_at && (
                      <div className="flex items-center justify-between border-b pb-2 last:border-0" style={{ borderColor: theme === 'dark' ? '#374151' : '#f3f4f6' }}>
                        <Text style={textStyle}>So'nggi o'zgarish</Text>
                        <Text style={{ color: theme === 'dark' ? '#e5e7eb' : '#111827' }}>{formatDate(submission.updated_at)}</Text>
                      </div>
                    )}
                  </div>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card className="h-full border-0" style={cardStyle}>
                  <div className="flex items-center justify-between mb-6">
                    <Title level={5} style={titleStyle}>To'lov</Title>
                    <Tag bordered={false} color={submission.payment_status === "PAID" ? "success" : "warning"}>
                      {submission.payment_status === "PAID" ? "TO'LANGAN" : submission.payment_status}
                    </Tag>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2 last:border-0" style={{ borderColor: theme === 'dark' ? '#374151' : '#f3f4f6' }}>
                      <Text style={textStyle}>Turi</Text>
                      <Text style={{ color: theme === 'dark' ? '#e5e7eb' : '#111827' }}>Online</Text>
                    </div>
                    <div className="flex items-center justify-between border-b pb-2 last:border-0" style={{ borderColor: theme === 'dark' ? '#374151' : '#f3f4f6' }}>
                      <Text style={textStyle}>Miqdori</Text>
                      <Text style={{ color: theme === 'dark' ? '#e5e7eb' : '#111827' }}>500,000 UZS</Text>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Review Notes */}
            {submission.review_notes && (
              <Alert
                message="Komissiya xulosasi"
                description={submission.review_notes}
                type={submission.status === 'REJECTED' ? 'error' : 'info'}
                showIcon
                className="mb-6 rounded-lg border-0"
                style={{
                  backgroundColor: submission.status === 'REJECTED' ? (theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2') : (theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff'),
                  color: theme === 'dark' ? '#e5e7eb' : '#1f2937'
                }}
              />
            )}

            <Row gutter={[24, 24]}>
              {/* Main Content: Answers */}
              <Col xs={24} lg={16}>
                <Card className="border-0 mb-6" style={cardStyle} title={
                  <span style={{ fontSize: '16px', ...titleStyle }}>Ariza ma'lumotlari</span>
                }>
                  <List
                    itemLayout="vertical"
                    dataSource={submission.answers}
                    renderItem={(answer) => (
                      <List.Item className="border-b px-0 py-4 last:border-0" style={{ borderColor: theme === 'dark' ? '#374151' : '#f3f4f6' }}>
                        <div className="flex flex-col gap-1">
                          <Text className="text-xs uppercase font-semibold tracking-wide" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                            {answer.field_label}
                          </Text>
                          <div className="text-base" style={{ color: theme === 'dark' ? '#e5e7eb' : '#1f2937' }}>
                            {answer.answer || answer.answer_text || "—"}
                          </div>
                        </div>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>

              {/* Sidebar: Documents & Actions */}
              <Col xs={24} lg={8}>
                {/* Documents */}
                <Card className="border-0 mb-6" style={cardStyle} title={
                  <span style={{ fontSize: '16px', ...titleStyle }}>Hujjatlar</span>
                }>
                  {submission?.documents?.length === 0 ? (
                    <div className="text-center py-8">
                      <Text style={textStyle}>Hujjatlar yo'q</Text>
                    </div>
                  ) : (
                    <List
                      dataSource={submission.documents || []}
                      renderItem={(doc) => (
                        <div className="mb-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group flex items-center justify-between"
                          onClick={() => window.open(doc.file, '_blank')}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <FileTextOutlined style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }} />
                            <div className="flex flex-col min-w-0">
                              <Text className="truncate" style={{ color: theme === 'dark' ? '#e5e7eb' : '#374151' }}>
                                {doc.document_type}
                              </Text>
                              <span className="text-xs" style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }}>{formatDate(doc.uploaded_at)}</span>
                            </div>
                          </div>
                          <DownloadOutlined style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }} />
                        </div>
                      )}
                    />
                  )}
                </Card>

                {/* Actions */}
                <Card className="border-0 !mt-4" style={cardStyle} bodyStyle={{ padding: "20px" }}>
                  <div className="flex flex-col gap-3">
                    {submission.status === "DRAFT" && (
                      <>
                        <Button
                          type="primary"
                          size="large"
                          onClick={() => submitSubmission({})}
                          loading={isSubmitting}
                          block
                          className="h-[40px] rounded-lg shadow-none"
                        >
                          Topshirish
                        </Button>
                        <Button
                          size="large"
                          block
                          className="h-[40px] rounded-lg"
                        >
                          Tahrirlash
                        </Button>
                      </>
                    )}

                    {(submission.status === "SUBMITTED" || submission.status === "UNDER_REVIEW") && (
                      <div className="text-center py-4">
                        <Text type="secondary">Arizangiz ko'rib chiqilmoqda</Text>
                      </div>
                    )}

                    {submission.status === "APPROVED" && (
                      <div className="text-center py-4">
                        <Text type="success" strong>Arizangiz tasdiqlandi</Text>
                      </div>
                    )}

                    {submission.status === "REJECTED" && (
                      <div className="flex flex-col gap-3">
                        <Text type="danger" className="text-center">Arizangiz rad etildi</Text>
                        <Button
                          type="primary"
                          danger
                          size="large"
                          block
                          className="h-[40px] rounded-lg shadow-none"
                        >
                          Qayta topshirish
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </div>
    </div>
  );
}