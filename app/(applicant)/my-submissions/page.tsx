"use client";

import {
  Table,
  Button,
  Typography,
  Tooltip,
  Input,
  Breadcrumb,
  ConfigProvider,
  Modal,
} from "antd";
import {
  EyeOutlined,
  DownloadOutlined,
  PlusOutlined,
  HomeOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useGet } from "@/lib/hooks";
import { useThemeStore } from "@/lib/stores/themeStore";
import { TableSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDate, getApplicationStatusLabel } from "@/lib/utils";
import React, { useState, useMemo, cloneElement, isValidElement } from "react";

const { Title } = Typography;

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
  const router = useRouter();
  const { theme } = useThemeStore();
  const { data: submissionsData, isLoading, error } = useGet<SubmissionsResponse | Submission[]>("/applicant/my-submissions/");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [draftModalSubmission, setDraftModalSubmission] = useState<Submission | null>(null);

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

  // Timeline data for visual representation

  const columns = [

    {
      title: "Ariza raqami",
      dataIndex: "submission_number",
      key: "submission_number",
      render: (text: string) => (
        <span className="font-bold text-[#7367f0]">#{text}</span>
      ),
      width: 160,
    },
    {
      title: "Ariza nomi",
      dataIndex: "application_title",
      key: "application_title",
      render: (text: string) => (
        <Tooltip title={text}>
          <div className={`font-bold text-sm truncate max-w-[200px] ${theme === "dark" ? "text-gray-200" : "text-[#484650]"}`}>
            {text}
          </div>
        </Tooltip>
      ),
      width: 200,
    },
    {
      title: "Yaratilgan vaqt",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => (
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {formatDate(date)}
        </span>
      ),
      width: 140,
    },

    {
      title: "Topshirilgan vaqt",
      dataIndex: "submitted_at",
      key: "submitted_at",
      render: (date?: string) => (
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {date ? formatDate(date) : "-"}
        </span>
      ),
      width: 140,
    },
    {
      title: "Holat",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const label = getApplicationStatusLabel(status);
        const badge = (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${status === "APPROVED" ? "bg-green-500/10 text-green-500 border-green-500/20" :
              status === "REJECTED" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                status === "DRAFT" ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" :
                  "bg-purple-500/10 text-purple-500 border-purple-500/20"
              }`}
          >
            {status === "DRAFT" && <ExclamationCircleOutlined style={{ fontSize: 12 }} />}
            {label}
          </span>
        );
        return status === "DRAFT" ? (
          <Tooltip title="Arizangiz hali qoralama holatida. Tekshirib chiqib uni yuboring.">
            {badge}
          </Tooltip>
        ) : badge;
      },
      width: 140,
    },
    {
      title: "To'lov",
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
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border whitespace-nowrap ${colorClass}`}>
            {labels[status] || status}
          </span>
        );
      },
      width: 120,
    },
    {
      title: "Amallar",
      key: "actions",
      fixed: "right" as const,
      width: 80,
      render: (_: unknown, record: Submission) => (
        <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Link href={`/my-submissions/${record.id}`}>
            <Tooltip title="Ko'rish">
              <Button
                shape="circle"
                icon={<EyeOutlined />}
                size="small"
                className="flex items-center justify-center hover:scale-110 transition-transform"
                style={{
                  background: "linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.7))",
                  border: "none",
                  boxShadow: "0 2px 8px rgba(115, 103, 240, 0.3)",
                  color: "#fff"
                }}
              />
            </Tooltip>
          </Link>

          {record.documents_uploaded && record.total_required_documents && (
            <Tooltip title={`${record.documents_uploaded}/${record.total_required_documents} hujjat yuklandi`}>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-blue-500/10 text-blue-500 text-[10px] font-bold border border-blue-500/20 whitespace-nowrap">
                <DownloadOutlined style={{ fontSize: "12px" }} />
                {record.documents_uploaded}/{record.total_required_documents}
              </div>
            </Tooltip>
          )}
        </div>
      ),
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
      <style jsx global>{`
        .draft-row-warning {
          border-left: 3px solid #f59e0b !important;
          background: rgba(245, 158, 11, 0.06) !important;
        }
        .custom-redesigned-table [data-theme="dark"] .draft-row-warning,
        [data-theme="dark"] .draft-row-warning {
          background: rgba(245, 158, 11, 0.08) !important;
        }
      `}</style>
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
                    colorText: theme === "dark" ? "#ffffff" : "#484650",
                    colorTextHeading: theme === "dark" ? "rgba(255, 255, 255, 0.85)" : "#5a5a6a",
                    colorBorderSecondary: theme === "dark" ? "rgb(59, 66, 83)" : "#f0f0f0",
                    borderRadius: 12,
                  },
                  components: {
                    Table: {
                      headerBg: theme === "dark" ? "rgb(33, 41, 60)" : "#f4f5f6",
                      headerColor: theme === "dark" ? "#ffffff" : "#222222",
                      headerBorderRadius: 0,
                      cellPaddingInline: 16,
                      cellPaddingBlock: 16,
                      rowHoverBg: theme === "dark" ? "rgb(55, 63, 85)" : "#fafafa",
                    }
                  }
                }}
              >
                <Table
                  rowClassName={(record) => (record.status === "DRAFT" ? "draft-row-warning" : "")}
                  onRow={(record) => ({
                    onClick: () => {
                      if (record.status === "DRAFT") {
                        setDraftModalSubmission(record);
                      } else {
                        router.push(`/my-submissions/${record.id}`);
                      }
                    },
                    style: { cursor: "pointer" },
                  })}
                  columns={columns.map(col => ({
                    ...col,
                    title: typeof col.title === 'string' ? (
                      <span className="text-[11px] font-black uppercase tracking-widest">{col.title}</span>
                    ) : col.title,
                    onCell: () => ({
                      style: { verticalAlign: 'top' }
                    })
                  }))}
                  dataSource={filteredSubmissions}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    className: "px-6 py-4 mb-0",
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} dan ${total} ta ariza`,
                    itemRender: (page, type, element) => {
                      if ((type === 'page' || type === 'prev' || type === 'next') && isValidElement(element)) {
                        return cloneElement(element as React.ReactElement, {
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
                  className="custom-redesigned-table"
                  scroll={{ x: 1200 }}
                />
              </ConfigProvider>
            )}
          </div>
        </div>

        <Modal
          title="Ogohlantirish"
          open={!!draftModalSubmission}
          onCancel={() => setDraftModalSubmission(null)}
          footer={
            <div className="flex justify-end gap-2">
              <Button onClick={() => setDraftModalSubmission(null)}>Yopish</Button>
              <Button
                type="primary"
                onClick={() => {
                  if (draftModalSubmission) {
                    router.push(`/my-submissions/${draftModalSubmission.id}`);
                    setDraftModalSubmission(null);
                  }
                }}
                style={{
                  background: "linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.7))",
                  border: "none",
                }}
              >
                Ko&apos;rib chiqish
              </Button>
            </div>
          }
        >
          <p style={{ margin: 0, fontSize: 15 }}>
            Arizangiz hali qoralama holatida turibdi, tekshirib chiqib uni yuboring.
          </p>
        </Modal>

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