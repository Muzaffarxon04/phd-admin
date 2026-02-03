"use client";

import { use, useState } from "react";
import {
  Spin,
  Tag,
  Button,
  Alert,
  Table,
  Typography,
  Tabs,
  Avatar,
  Divider,
} from "antd";
import { useGet, usePost } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { formatDate, getApplicationStatusLabel, getApplicationStatusColor } from "@/lib/utils";
import {
  CheckOutlined,
  CloseOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  MessageOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TableOutlined,
} from "@ant-design/icons";
import { useThemeStore } from "@/lib/stores/themeStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface SubmissionDetail {
  id: number;
  submission_number: string;
  application: unknown;
  application_title?: string;
  applicant: number;
  applicant_name: string;
  applicant_phone: string;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN";
  payment_status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  review_notes?: string;
  reviewed_by?: number | null;
  reviewed_by_name?: string;
  reviewed_at?: string | null;
  answers: DataObject[];
  documents: unknown[];
  created_at: string;
  updated_at: string;
  submitted_at?: string | null;
}

interface DataObject {
  id: number;
  field_label: string;
  field_type: string;
  answer: string | null;
}

const { Text, Title } = Typography;

const formatAnswer = (item: DataObject) => {
  if (item.field_type === "FILE" && item.answer) {
    return (
      <a
        href={API_BASE_URL + item.answer || ""}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#7367f0] hover:underline font-bold flex items-center gap-2"
      >
        📎 Hujjatni ko&apos;rish
      </a>
    );
  }

  return <span className="font-medium">{item.answer || "—"}</span>;
};

const CardView = ({ answers, theme }: { answers: DataObject[]; theme: string }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
    {answers.map((item: DataObject) => (
      <div
        key={item.id}
        className="rounded-xl p-5 transition-all duration-300"
        style={{
          background: theme === "dark" ? "rgb(48, 56, 78)" : "#f8f9fa",
          border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
        }}
      >
        <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
          {item.field_label}
        </div>
        <div style={{ color: theme === "dark" ? "#ffffff" : "#484650" }}>
          {formatAnswer(item)}
        </div>
      </div>
    ))}
  </div>
);

const TableView = ({ answers, theme }: { answers: DataObject[]; theme: string }) => {
  const columns = [
    {
      title: "№",
      key: "index",
      width: 80,
      render: (_: unknown, __: unknown, index: number) => (
        <Text strong style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
          {index + 1}
        </Text>
      ),
    },
    {
      title: "Savol",
      dataIndex: "field_label",
      key: "field_label",
      render: (text: string) => (
        <Text strong style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Javob",
      key: "answer",
      render: (_: unknown, record: DataObject) => (
        <div style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
          {formatAnswer(record)}
        </div>
      ),
    },
  ];

  return (
    <div className="pt-4">
      <Table
        rowKey="id"
        columns={columns}
        dataSource={answers}
        pagination={false}
        className={`premium-table ${theme === "dark" ? "dark-table" : ""}`}
        style={{
          background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      />
    </div>
  );
};

export default function AdminSubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const { theme } = useThemeStore();
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const { data: submissionData, isLoading } = useGet<{ data: SubmissionDetail }>(
    `/admin/application/submissions/${id}/`
  );
  const submission = submissionData?.data;

  const { mutate: approveSubmission } = usePost(`/admin/application/submissions/${id}/approve/`, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/admin/application/submissions/${id}/`] });
      setIsApproving(false);
    },
    onError: () => setIsApproving(false),
  });

  const { mutate: rejectSubmission } = usePost(`/admin/application/submissions/${id}/reject/`, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/admin/application/submissions/${id}/`] });
      setIsRejecting(false);
    },
    onError: () => setIsRejecting(false),
  });

  const handleApprove = () => {
    setIsApproving(true);
    approveSubmission({ notes: "Tasdiqlandi" });
  };

  const handleReject = () => {
    setIsRejecting(true);
    rejectSubmission({ notes: "Hujjatlar noto'g'ri yoki to'liq emas" });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <Spin size="large" />
        <Text className="text-gray-400 font-medium">Ma&apos;lumotlar yuklanmoqda...</Text>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="p-12 text-center">
        <Alert
          message="Ariza topilmadi"
          description="Siz so'ragan ariza mavjud emas yoki o'chirilgan bo'lishi mumkin."
          type="error"
          showIcon
          className="rounded-xl border-0 shadow-lg"
        />
        <Link href="/admin-panel/submissions" className="inline-block mt-6">
          <Button icon={<ArrowLeftOutlined />} className="rounded-xl">Ro&apos;yxatga qaytish</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ color: theme === "dark" ? "#ffffff" : "#484650" }}>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin-panel/submissions">
            <Button
              icon={<ArrowLeftOutlined />}
              className="w-10 h-10 rounded-xl flex items-center justify-center border-0 shadow-md"
              style={{
                background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
                color: theme === "dark" ? "#ffffff" : "#484650",
              }}
            />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <Title level={4} className="!mb-0" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
                Ariza #{submission.submission_number}
              </Title>
              <Tag
                className="rounded-lg border-0 px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
                style={{
                  background: `${getApplicationStatusColor(submission.status)}15`,
                  color: getApplicationStatusColor(submission.status),
                }}
              >
                {getApplicationStatusLabel(submission.status)}
              </Tag>
            </div>
            <div className="text-gray-400 text-sm font-medium flex items-center gap-2 mt-1">
              <CalendarOutlined /> Topshirilgan: {submission.submitted_at ? formatDate(submission.submitted_at) : formatDate(submission.created_at)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {submission.status === "UNDER_REVIEW" && (
            <>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={handleReject}
                loading={isRejecting}
                className="h-[42px] px-6 rounded-xl border-0 shadow-lg font-bold flex items-center gap-2"
                style={{
                  background: "linear-gradient(118deg, #ea5455, rgba(234, 84, 85, 0.7))",
                  boxShadow: "0 8px 25px -8px #ea5455",
                }}
              >
                Rad etish
              </Button>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleApprove}
                loading={isApproving}
                className="h-[42px] px-6 rounded-xl border-0 shadow-lg font-bold flex items-center gap-2"
                style={{
                  background: "linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.7))",
                  boxShadow: "0 8px 25px -8px #7367f0",
                }}
              >
                Qabul qilish
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div
            className="rounded-xl overflow-hidden transition-all duration-300"
            style={{
              background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
              border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
              boxShadow: theme === "dark" ? "none" : "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <div className="p-6 border-b" style={{ borderColor: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#7367f0]15 flex items-center justify-center text-[#7367f0]">
                  <FileTextOutlined style={{ fontSize: "20px" }} />
                </div>
                <Title level={5} className="!m-0" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
                  Ariza Ma&apos;lumotlari
                </Title>
              </div>
            </div>

            <div className="p-6">
              <Tabs
                defaultActiveKey="card"
                className={`premium-tabs ${theme === "dark" ? "dark-tabs" : ""}`}
                items={[
                  {
                    key: "card",
                    label: (
                      <span>
                        <InfoCircleOutlined />
                        Karta ko&apos;rinishi
                      </span>
                    ),
                    children: <CardView answers={submission.answers} theme={theme} />,
                  },
                  {
                    key: "table",
                    label: (
                      <span>
                        <TableOutlined />
                        Jadval ko&apos;rinishi
                      </span>
                    ),
                    children: <TableView answers={submission.answers} theme={theme} />,
                  },
                ]}
              />
            </div>
          </div>

          <div
            className="rounded-xl overflow-hidden transition-all duration-300"
            style={{
              background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
              border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
              boxShadow: theme === "dark" ? "none" : "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <div className="p-6 border-b" style={{ borderColor: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#28c76f]15 flex items-center justify-center text-[#28c76f]">
                  <CheckCircleOutlined style={{ fontSize: "20px" }} />
                </div>
                <Title level={5} className="!m-0" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
                  Hujjatlar
                </Title>
              </div>
            </div>
            <div className="p-6">
              {submission.documents && submission.documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(submission.documents as { id?: number; file?: string }[]).map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border flex items-center justify-between"
                      style={{
                        background: theme === "dark" ? "rgba(255,255,255,0.02)" : "#f8f9fa",
                        borderColor: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgb(235, 233, 241)"
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <FileTextOutlined className="text-gray-400 text-lg" />
                        <span className="font-medium text-sm">Hujjat #{doc.id || idx + 1}</span>
                      </div>
                      <a
                        href={(API_BASE_URL || "") + (doc.file || "")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#7367f0] text-xs font-bold hover:underline"
                      >
                        YUKLASH
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 italic">Hujjatlar biriktirilmagan</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div
            className="rounded-xl p-6 transition-all duration-300"
            style={{
              background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
              border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
              boxShadow: theme === "dark" ? "none" : "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <div className="flex items-center gap-4 mb-6">
              <Avatar size={56} icon={<UserOutlined />} className="bg-[#7367f0]" />
              <div>
                <Title level={5} className="!mb-0" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
                  {submission.applicant_name}
                </Title>
                <Text className="text-gray-400 font-medium">Talabgor</Text>
              </div>
            </div>

            <Divider className="my-4 opacity-10" />

            <div className="space-y-4">
              <div className="flex justify-between">
                <Text className="text-gray-400">Telefon:</Text>
                <Text strong style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>{submission.applicant_phone}</Text>
              </div>
              <div className="flex justify-between">
                <Text className="text-gray-400">To&apos;lov holati:</Text>
                <Tag
                  className="rounded-lg border-0 m-0"
                  style={{
                    background: submission.payment_status === "PAID" ? "#28c76f15" : "#ff9f4315",
                    color: submission.payment_status === "PAID" ? "#28c76f" : "#ff9f43",
                    fontWeight: "bold"
                  }}
                >
                  {submission.payment_status === "PAID" ? "TO'LANGAN" : submission.payment_status}
                </Tag>
              </div>
              <div className="flex justify-between">
                <Text className="text-gray-400">ID:</Text>
                <Text strong style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>{submission.id}</Text>
              </div>
            </div>
          </div>

          <div
            className="rounded-xl p-6 transition-all duration-300"
            style={{
              background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
              border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
              boxShadow: theme === "dark" ? "none" : "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <Title level={5} className="mb-6 flex items-center gap-2" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
              <ClockCircleOutlined className="text-[#ff9f43]" />
              Muhim Sanalar
            </Title>
            <div className="space-y-4">
              <div>
                <Text className="text-gray-400 block mb-1">Yaratilgan:</Text>
                <Text strong style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>{formatDate(submission.created_at)}</Text>
              </div>
              <div>
                <Text className="text-gray-400 block mb-1">Oxirgi o&apos;zgarish:</Text>
                <Text strong style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>{formatDate(submission.updated_at)}</Text>
              </div>
              {submission.submitted_at && (
                <div>
                  <Text className="text-gray-400 block mb-1">Topshirilgan:</Text>
                  <Text strong style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>{formatDate(submission.submitted_at)}</Text>
                </div>
              )}
            </div>
          </div>

          {submission.review_notes && (
            <div
              className="rounded-xl p-6 transition-all duration-300"
              style={{
                background: theme === "dark" ? "rgba(115, 103, 240, 0.1)" : "#f4f3ff",
                border: "1px solid rgba(115, 103, 240, 0.2)",
              }}
            >
              <Title level={5} className="mb-4 flex items-center gap-2" style={{ color: "#7367f0" }}>
                <MessageOutlined />
                Ko&apos;rib chiqish eslatmasi
              </Title>
              <Text style={{ color: theme === "dark" ? "#ffffff" : "#484650" }}>
                {submission.review_notes}
              </Text>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .premium-tabs .ant-tabs-nav::before {
          border-bottom: 2px solid ${theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"};
        }
        .premium-tabs .ant-tabs-tab {
          padding: 12px 0;
          margin-right: 32px;
        }
        .premium-tabs .ant-tabs-tab-btn {
          color: ${theme === "dark" ? "#888ea8" : "#8b8b8b"};
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .premium-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #7367f0 !important;
        }
        .premium-tabs .ant-tabs-ink-bar {
          background: #7367f0;
          height: 3px;
          border-radius: 3px 3px 0 0;
        }
        .dark-table .ant-table {
          background: transparent !important;
          color: #ffffff !important;
        }
        .dark-table .ant-table-thead > tr > th {
          background: rgba(255, 255, 255, 0.02) !important;
          color: #888ea8 !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .dark-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
        }
        .dark-table .ant-table-tbody > tr:hover > td {
          background: rgba(115, 103, 240, 0.05) !important;
        }
      `}</style>
    </div>
  );
}
