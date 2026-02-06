"use client";

import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Progress,
  Badge,
  Timeline,
  // Statistic,
  Row,
  Col,
  Alert,
  Tooltip,
  Input,
  Breadcrumb,
  ConfigProvider
} from "antd";
import {
  EyeOutlined,
  FileTextOutlined,
  // CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  DollarOutlined,
  CalendarOutlined,
  DownloadOutlined,
  PlusOutlined,
  SearchOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";
import { useGet } from "@/lib/hooks";
import { useThemeStore } from "@/lib/stores/themeStore";
import { TableSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import Link from "next/link";
import { formatDate, getApplicationStatusLabel, getApplicationStatusColor } from "@/lib/utils";
import React, { useState, useMemo, cloneElement, isValidElement } from "react";

const { Title, Text } = Typography;

interface Submission {
  id: number;
  submission_number: string;
  application_title: string;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN";
  payment_status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  created_at: string;
  submitted_at?: string;
  review_notes?: string;
  documents_uploaded?: number;
  total_required_documents?: number;
}

interface SubmissionsResponse {
  next: string | null;
  previous: string | null;
  total_elements: number;
  page_size: number;
  data: {
    message: string;
    error: string | null;
    status: number;
    data: Submission[];
  };
  from: number;
  to: number;
}

export default function MySubmissionsPage() {
  const { theme } = useThemeStore();
  const { data: submissionsData, isLoading, error } = useGet<SubmissionsResponse | Submission[]>("/applicant/my-submissions/");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Handle different response formats
  const submissions = useMemo(() => {
    if (!submissionsData) return [];
    if (Array.isArray(submissionsData)) return submissionsData;
    if (submissionsData.data && submissionsData.data.data && Array.isArray(submissionsData.data.data)) return submissionsData.data.data;
    if (submissionsData.data && Array.isArray(submissionsData.data)) return submissionsData.data;
    return [];
  }, [submissionsData]);

  // Filter submissions based on status and search
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(submission => {
      const matchesStatus = statusFilter === "all" || submission.status === statusFilter;
      const matchesSearch = submission.application_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.submission_number.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [submissions, statusFilter, searchTerm]);

  // Calculate statistics
  const stats = useMemo(() => ({
    total: filteredSubmissions.length,
    submitted: filteredSubmissions.filter(s => s.status === "SUBMITTED").length,
    underReview: filteredSubmissions.filter(s => s.status === "UNDER_REVIEW").length,
    approved: filteredSubmissions.filter(s => s.status === "APPROVED").length,
    rejected: filteredSubmissions.filter(s => s.status === "REJECTED").length,
    paid: filteredSubmissions.filter(s => s.payment_status === "PAID").length,
    pendingPayment: filteredSubmissions.filter(s => s.payment_status === "PENDING").length,
  }), [filteredSubmissions]);

  // Timeline data for visual representation
  const timelineData = filteredSubmissions.slice(0, 5).map(submission => ({
    key: submission.id,
    status: submission.status,
    title: submission.application_title,
    submissionNumber: submission.submission_number,
    date: submission.created_at,
    paymentStatus: submission.payment_status,
    reviewNotes: submission.review_notes,
    color: getApplicationStatusColor(submission.status),
  }));

  const columns = [
    {
      title: (
        <div className="flex items-center gap-2 py-3 px-4">
          <FileTextOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Ariza raqami</span>
        </div>
      ),
      dataIndex: "submission_number",
      key: "submission_number",
      render: (text: string, record: Submission) => (
        <div>
          <div className="font-bold text-base" style={{ color: "#7367f0" }}>
            #{text}
          </div>
          <div className="text-xs font-medium text-gray-400 mt-0.5">
            {formatDate(record.created_at)}
          </div>
        </div>
      ),
      width: 180,
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <TrophyOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Ariza nomi</span>
        </div>
      ),
      dataIndex: "application_title",
      key: "application_title",
      render: (text: string, record: Submission) => (
        <div className="max-w-xs py-2">
          <Tooltip title={text}>
            <div className={`font-bold text-sm truncate ${theme === "dark" ? "text-gray-200" : "text-[#484650]"}`}>
              {text}
            </div>
          </Tooltip>
          {record.submitted_at && (
            <div className="text-xs text-gray-400 mt-0.5">
              Topshirilgan: {formatDate(record.submitted_at)}
            </div>
          )}
        </div>
      ),
      width: 280,
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <ClockCircleOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Holat</span>
        </div>
      ),
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const label = getApplicationStatusLabel(status);
        const color = getApplicationStatusColor(status);
        return (
          <div className="py-2">
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${status === "APPROVED" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                status === "REJECTED" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                  status === "DRAFT" ? "bg-gray-500/10 text-gray-500 border-gray-500/20" :
                    "bg-purple-500/10 text-purple-500 border-purple-500/20"
                }`}
            >
              {label}
            </span>
          </div>
        );
      },
      width: 160,
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <DollarOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">To&apos;lov</span>
        </div>
      ),
      dataIndex: "payment_status",
      key: "payment_status",
      render: (status: string) => {
        const labels: Record<string, string> = {
          PENDING: "Kutilmoqda",
          PAID: "To'langan",
          FAILED: "Xatolik",
          REFUNDED: "Qaytarilgan",
        };
        const colorClass =
          status === "PAID" ? "text-green-500 bg-green-500/10 border-green-500/20" :
            status === "FAILED" ? "text-red-500 bg-red-500/10 border-red-500/20" :
              status === "PENDING" ? "text-orange-500 bg-orange-500/10 border-orange-500/20" :
                "text-gray-500 bg-gray-500/10 border-gray-500/20";

        return (
          <div className="py-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${colorClass}`}>
              {labels[status] || status}
            </span>
          </div>
        );
      },
      width: 130,
    },
    {
      title: (
        <div className="flex items-center justify-center py-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Amallar</span>
        </div>
      ),
      key: "actions",
      render: (_: unknown, record: Submission) => (
        <div className="flex justify-center items-center gap-2 py-2">
          <Link href={`/my-submissions/${record.id}`}>
            <Tooltip title="Ko'rish">
              <button
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#7367f0]/10 text-[#7367f0] hover:bg-[#7367f0] hover:text-white transition-all duration-300 shadow-sm"
              >
                <EyeOutlined style={{ fontSize: "18px" }} />
              </button>
            </Tooltip>
          </Link>

          {record.documents_uploaded && record.total_required_documents && (
            <Tooltip title={`${record.documents_uploaded}/${record.total_required_documents} hujjat yuklandi`}>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500/10 text-blue-500 text-xs font-bold border border-blue-500/20">
                <DownloadOutlined style={{ fontSize: "14px" }} />
                {record.documents_uploaded}
              </div>
            </Tooltip>
          )}
        </div>
      ),
      width: 150,
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <Title level={2} className="mb-8">Mening Arizalarim</Title>
          <TableSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    // Handle array error format from backend
    let errorMessage = error.message || "Ma'lumotlarni yuklashda xatolik yuz berdi";

    const errorData = (error).data;
    if (errorData && Array.isArray(errorData)) {
      errorMessage = errorData.join(", ");
    }

    return (
      <div className="min-h-screen ">
        <div className=" mx-auto text-center">
          <ErrorState
            description={errorMessage}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="mx-auto">
        {/* Page Title & Breadcrumb */}
        <div className="mb-8 flex items-center gap-4">
          <Title level={4} className="!text-[24px] mb-0! border-r-1 border-[rgb(214,220,225)] pr-4" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
            Mening Arizalarim
          </Title>
          <Breadcrumb
            items={[
              {
                href: "/dashboard",
                title: (
                  <div className="flex items-center gap-1">
                    <HomeOutlined />
                    <span>Bosh sahifa</span>
                  </div>
                ),
              },
              {
                title: "Mening Arizalarim",
              },
            ]}
          />
        </div>

        {/* Premium Filters & Search */}

        {/* Premium Stats Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: "Jami arizalar",
              value: submissions.length,
              icon: <TrophyOutlined style={{ fontSize: "24px" }} />,
              color: "blue",
              bg: "bg-blue-500/10",
              textColor: "text-blue-500"
            },
            {
              label: "Ko'rib chiqilmoqda",
              value: submissions.filter(s => s.status === "UNDER_REVIEW" || s.status === "SUBMITTED").length,
              icon: <ClockCircleOutlined style={{ fontSize: "24px" }} />,
              color: "purple",
              bg: "bg-purple-500/10",
              textColor: "text-purple-500"
            },
            {
              label: "Tasdiqlangan",
              value: submissions.filter(s => s.status === "APPROVED").length,
              icon: <CheckCircleOutlined style={{ fontSize: "24px" }} />,
              color: "green",
              bg: "bg-green-500/10",
              textColor: "text-green-500"
            },
            {
              label: "Rad etilgan",
              value: submissions.filter(s => s.status === "REJECTED").length,
              icon: <CloseCircleOutlined style={{ fontSize: "24px" }} />,
              color: "red",
              bg: "bg-red-500/10",
              textColor: "text-red-500"
            }
          ].map((stat, idx) => (
            <div
              key={idx}
              className="rounded-xl p-6 transition-all duration-300 hover:shadow-lg"
              style={{
                background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
                border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
                boxShadow: theme === "dark" ? "none" : "0 4px 12px rgba(0, 0, 0, 0.05)",
              }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.textColor}`}>
                  {stat.icon}
                </div>
                <div>
                  <div className="text-gray-500 text-sm font-medium">{stat.label}</div>
                  <div className="text-2xl font-bold mt-1" style={{ color: theme === "dark" ? "#ffffff" : "#484650" }}>
                    {stat.value}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div> */}

        {/* Table Section */}
        <div
          className="rounded-xl overflow-hidden transition-all duration-300 mb-8"

        >
          <div >
            <div className="flex justify-between items-center ">
              {/* <Title level={4} className="mb-0!" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
                Arizalar jadvali
              </Title> */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

                <div className="flex items-center gap-3">
                  <div className="relative">

                    <Input
                      placeholder="Arizani izlang..."
                      className="pl-9 pr-4 py-2 w-64 rounded-xl transition-all duration-300"
                      style={{
                        background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
                        border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
                        color: theme === "dark" ? "#ffffff" : "#484650",
                      }}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <select
                    className="px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7367f0]/50 transition-all duration-300 cursor-pointer text-sm"
                    style={{
                      background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
                      border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
                      color: theme === "dark" ? "#ffffff" : "#484650",
                    }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Saralash</option>
                    <option value="DRAFT">Tayyorlanmoqda</option>
                    <option value="SUBMITTED">Topshirilgan</option>
                    <option value="UNDER_REVIEW">Ko&apos;rib chiqilmoqda</option>
                    <option value="APPROVED">Tasdiqlangan</option>
                    <option value="REJECTED">Rad etilgan</option>
                  </select>
                </div>
              </div>

              <Link href="/applications">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  className="rounded-xl h-[42px] px-6 border-0 shadow-lg"
                  style={{
                    background: "linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.7))",
                    boxShadow: "0 8px 25px -8px #7367f0"
                  }}
                >
                  Yangi ariza
                </Button>
              </Link>
            </div>

            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-6">
                <EmptyState
                  description={searchTerm ? "Hech qanday ariza topilmadi" : "Hozircha arizalar mavjud emas"}
                  action={
                    <Link href="/applications">
                      <Button type="primary">
                        Yangi ariza yaratish
                      </Button>
                    </Link>
                  }
                />
              </div>
            ) : (
              <ConfigProvider
                theme={{
                  token: {
                    colorBgContainer: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
                    colorText: theme === "dark" ? "#ffffff" : "rgba(0, 0, 0, 0.88)",
                    colorTextHeading: theme === "dark" ? "#ffffff" : "rgba(0, 0, 0, 0.88)",
                    colorBorderSecondary: theme === "dark" ? "rgb(59, 66, 83)" : "#f0f0f0",
                    colorFillAlter: theme === "dark" ? "rgb(33, 41, 60)" : "#fafafa", // For header background
                  },
                  components: {
                    Table: {
                      headerBg: theme === "dark" ? "rgb(33, 41, 60)" : "#fafafa",
                      headerColor: theme === "dark" ? "#ffffff" : "rgba(0, 0, 0, 0.88)",
                      rowHoverBg: theme === "dark" ? "rgb(55, 63, 85)" : "#fafafa",
                      borderColor: theme === "dark" ? "rgb(59, 66, 83)" : "#f0f0f0",
                    }
                  }
                }}
              >
                <Table
                  columns={columns}
                  dataSource={filteredSubmissions}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} dan ${total} ta ariza`,
                    itemRender: (page, type, element) => {
                      if ((type === 'page' || type === 'prev' || type === 'next') && isValidElement(element)) {
                        return cloneElement(element as React.ReactElement<any>, {
                          style: {
                            backgroundColor: theme === 'dark' ? 'rgb(40, 48, 70)' : undefined,
                            color: theme === 'dark' ? '#fff' : undefined,
                            borderColor: theme === 'dark' ? 'rgb(59, 66, 83)' : undefined
                          }
                        });
                      }
                      return element;
                    }
                  }}
                  className="custom-submission-table"
                />
              </ConfigProvider>
            )}
          </div>
        </div>

        {/* Recent Activities Section */}
        {/* <div className="mt-12 bg-transparent">
          <Title level={4} className="mb-8" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
            So&apos;nggi faolliklar
          </Title>
          <Timeline
            items={timelineData.map(item => ({
              color: item.color === "success" ? "#52c41a" : item.color === "error" ? "#ff4d4f" : "#7367f0",
              dot: <div className="p-1 rounded-full bg-white dark:bg-[#283046] border-2 border-current"><ClockCircleOutlined style={{ fontSize: "14px" }} /></div>,
              children: (
                <div
                  className="mb-8 rounded-xl transition-all duration-300 hover:translate-x-1"
                  style={{
                    background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
                    border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
                    borderLeft: `4px solid ${item.color === "success" ? "#52c41a" : item.color === "error" ? "#ff4d4f" : "#7367f0"}`,
                    boxShadow: theme === "dark" ? "none" : "0 4px 12px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-base mb-1" style={{ color: theme === "dark" ? "#ffffff" : "#484650" }}>{item.title}</h4>
                      <div className="text-xs font-medium text-gray-400">
                        #{item.submissionNumber} • {formatDate(item.date)}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${item.status === "APPROVED" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                        item.status === "REJECTED" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                          "bg-purple-500/10 text-purple-500 border-purple-500/20"
                        }`}
                    >
                      {getApplicationStatusLabel(item.status)}
                    </span>
                  </div>
                  {item.reviewNotes && (
                    <div className="mt-4 p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                      <div className="flex gap-2 items-start text-sm">
                        <InfoCircleOutlined className="text-blue-500 mt-0.5" />
                        <div>
                          <span className="font-bold text-blue-500 block mb-1 text-xs uppercase">Komissiya izohi:</span>
                          <span className="text-gray-600 dark:text-gray-300 italic text-sm">{item.reviewNotes}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            }))}
          />
        </div> */}
      </div>
    </div>
  );
}