"use client";

import { Table, Button, Input, Select, App, Modal, Descriptions, Spin, Tag, Drawer, Form, InputNumber, Pagination, Skeleton } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  SearchOutlined,
  FileTextOutlined,
  UserOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useGet, usePost, API_BASE_URL } from "@/lib/hooks";
import { useThemeStore } from "@/lib/stores/themeStore";
import { tokenStorage } from "@/lib/utils";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { formatDateTime } from "@/lib/utils";
import { useState, useMemo, type ReactNode } from "react";
import { apiRequest } from "@/lib/hooks/useUniversalFetch";
import { useQueryClient } from "@tanstack/react-query";
import {
  AdminCard,
  AdminListStyles,
  PageHeader,
  PaymentStatusPill,
  SubmissionStatusPill,
  drawerWidth,
  useAdminSurface,
  useIsAdminMobile,
} from "@/components/admin/submissions/AdminUi";
import { SubmissionRowActions } from "@/components/admin/submissions/SubmissionRowActions";
import { FormActions } from "@/components/admin/submissions/FormActions";

const getSpecialityLabel = (record: Submission): string => {
  const specialityObj =
    record.speciality && typeof record.speciality === "object" && !Array.isArray(record.speciality)
      ? (record.speciality as { id?: number; name?: string; code?: string; parent?: { name?: string } })
      : null;
  const baseName =
    specialityObj?.name ||
    record.speciality_name ||
    (typeof record.speciality === "string" ? record.speciality : "") ||
    "—";
  const parentName =
    specialityObj?.parent?.name ||
    (record as unknown as { speciality_parent_name?: string }).speciality_parent_name ||
    undefined;
  const nameWithParent = parentName ? `${baseName} (${parentName})` : baseName;
  const code = specialityObj?.code || (record.speciality_code ? String(record.speciality_code) : "");
  return code ? `${code} - ${nameWithParent}` : nameWithParent;
};

interface Submission {
  id: number;
  submission_number: string;
  application: number;
  application_title: string;
  speciality?: { id: number; name: string; code: string } | string | null;
  speciality_name?: string | null; // fallback (old)
  speciality_code?: string | null; // fallback (old)
  education_form?: string | null;
  applicant: number;
  applicant_name: string;
  applicant_phone: string;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN";
  payment_status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  mark?: { score: number; id: number; comments: string; marked_at?: string };
  created_at: string;
  updated_at: string;
  submitted_at?: string | null;
}

interface ApplicationItem {
  id: number;
  title: string;
}

export default function AdminSubmissionsPage() {
  const { message } = App.useApp();
  const { theme } = useThemeStore();
  const surface = useAdminSurface();
  const isMobile = useIsAdminMobile();
  const [mobilePage, setMobilePage] = useState(1);
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Submission["status"] | "all">("all");
  const [applicationFilter, setApplicationFilter] = useState<number | "all">("all");

  const searchParams = new URLSearchParams();
  if (statusFilter !== "all") {
    searchParams.set("status", statusFilter);
  }
  if (applicationFilter !== "all") {
    searchParams.set("application", String(applicationFilter));
  }
  if (searchTerm.trim()) {
    searchParams.set("search", searchTerm.trim());
  }
  const submissionsUrl = `/admin/application/submissions/${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  const { data: submissionsData, isLoading, error } = useGet<{ data: { data: Submission[] } }>(submissionsUrl);

  const { data: applicationsData } = useGet<{ data: { data: ApplicationItem[] } }>("/admin/application/");
  
  // Handle different response formats
  const submissions = useMemo(() => {
  if (submissionsData) {
      if (Array.isArray(submissionsData?.data?.data)) {
        return submissionsData.data.data;
      } else if (submissionsData.data && Array.isArray(submissionsData.data.data)) {
        return submissionsData.data.data;
      }
    }
    return [];
  }, [submissionsData]);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentCheckId, setPaymentCheckId] = useState<number | null>(null);

  // Return drawer state
  const [returnDrawerOpen, setReturnDrawerOpen] = useState(false);
  const [selectedReturnId, setSelectedReturnId] = useState<number | null>(null);
  const [isReturnSubmitting, setIsReturnSubmitting] = useState(false);
  const [returnForm] = Form.useForm();

  const handleReturnSubmit = async (values: { notes: string }) => {
    if (!selectedReturnId) return;
    setIsReturnSubmitting(true);
    try {
      await apiRequest(`/admin/application/submissions/${selectedReturnId}/withdrawn/`, {
        method: "POST",
        body: JSON.stringify({ notes: values.notes }),
      });
      message.success("Ariza qaytarildi");
      setReturnDrawerOpen(false);
      returnForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ["/admin/application/submissions/"] });
    } catch (error) {
      message.error((error as Error).message || "Qaytarishda xatolik");
    } finally {
      setIsReturnSubmitting(false);
    }
  };

  // Drawer review state
  const [reviewDrawerOpen, setReviewDrawerOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<number | null>(null);
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);

  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [scoreModalSubmission, setScoreModalSubmission] = useState<Submission | null>(null);
  const [scoreForm] = Form.useForm();

  const handleReviewSubmit = async (values: { notes: string }) => {
    if (!selectedSubmissionId || !reviewAction) return;

    setIsReviewSubmitting(true);
    try {
      const endpoint = reviewAction === "approve"
        ? `/admin/application/submissions/${selectedSubmissionId}/approve/`
        : `/admin/application/submissions/${selectedSubmissionId}/reject/`;

      await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify({ notes: values.notes }),
      });

      message.success(reviewAction === "approve" ? "Ariza tasdiqlandi" : "Ariza rad etildi");
      setReviewDrawerOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ["/admin/application/submissions/"] });
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Xatolik yuz berdi";
      message.error(errorMessage);
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  const openReviewDrawer = (id: number, action: "approve" | "reject") => {
    setSelectedSubmissionId(id);
    setReviewAction(action);
    setReviewDrawerOpen(true);
  };

  const openScoreModal = (record: Submission) => {
    setScoreModalSubmission(record);
    scoreForm.resetFields();
    setIsScoreModalOpen(true);
  };

  const { mutate: submitScore, isPending: isSubmittingScore } = usePost("/admin/application/marks/", {
    onSuccess: () => {
      message.success("Baho muvaffaqiyatli qo'yildi");
      setIsScoreModalOpen(false);
      setScoreModalSubmission(null);
      scoreForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ["/admin/application/submissions/"] });
    },
    onError: (error) => {
      message.error(error.message || "Baho qo'yishda xatolik");
    },
  });

  const handleScoreSubmit = (values: { score: number; comments?: string }) => {
    if (!scoreModalSubmission) return;
    submitScore({
      submission: scoreModalSubmission.id,
      score: String(values.score),
      comments: values.comments,
    });
  };

  const { data: paymeStatusData, isLoading: isPaymeStatusLoading } = useGet<{
    status: string;
    transaction_id?: string;
    paid_at?: string;
    amount?: number;
    reason?: string;
    state?: number;
  }>(
    paymentCheckId ? `/payments/submission/${paymentCheckId}/payme/status/` : "",
    { enabled: !!paymentCheckId }
  );

  const buildExportUrl = (type: "word" | "excel") => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") {
      params.set("status", statusFilter);
    }
    if (applicationFilter !== "all") {
      params.set("application_id", String(applicationFilter));
    }
    const query = params.toString();
    return `${API_BASE_URL}/admin/application/submissions/export/${type}/${query ? `?${query}` : ""}`;
  };

  const getFilenameFromContentDisposition = (header: string | null): string | null => {
    if (!header) return null;
    const match = /filename\*?=(?:UTF-8'')?"?([^";\n]+)"?/i.exec(header);
    return match ? decodeURIComponent(match[1].trim()) : null;
  };

  const handleExport = async (type: "word" | "excel") => {
    try {
      const url = buildExportUrl(type);
      const headers: Record<string, string> = {};
      if (typeof window !== "undefined") {
        const token = tokenStorage.getAccessToken();
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      }
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error("Faylni yuklab olib bo'lmadi");
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition");
      const selectedAppTitle =
        applicationFilter !== "all"
          ? applicationsData?.data?.data?.find((a) => a.id === applicationFilter)?.title
          : undefined;
      const safeTitle = selectedAppTitle
        ? selectedAppTitle.replace(/[^a-zA-Z0-9_\-]+/g, "_").slice(0, 80)
        : null;
      const fallbackBase = safeTitle || "submissions";
      const fallback = type === "word" ? `${fallbackBase}.docx` : `${fallbackBase}.xlsx`;
      const filename = getFilenameFromContentDisposition(cd) || fallback;
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error(e);
      message.error("Eksport faylini yuklashda xatolik yuz berdi");
    }
  };

  const headerCell = (icon: ReactNode, label: ReactNode, extraClass = "") => (
    <div className={`flex items-center gap-2 py-3 ${extraClass}`}>
      {icon}
      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
    </div>
  );

  const strongText = theme === "dark" ? "text-gray-200" : "text-[#484650]";

  const openPaymentCheck = (id: number) => {
    setPaymentCheckId(id);
    setIsPaymentModalOpen(true);
  };

  const openReturnDrawer = (id: number) => {
    setSelectedReturnId(id);
    setReturnDrawerOpen(true);
  };

  const renderActions = (record: Submission, variant: "table" | "card") => (
    <SubmissionRowActions
      record={record}
      variant={variant}
      detailHref={`/admin-panel/submissions/${record.id}`}
      onPaymentCheck={() => openPaymentCheck(record.id)}
      onApprove={() => openReviewDrawer(record.id, "approve")}
      onReject={() => openReviewDrawer(record.id, "reject")}
      onReturn={() => openReturnDrawer(record.id)}
      onScore={() => openScoreModal(record)}
    />
  );

  const columns: ColumnsType<Submission> = [
    {
      title: headerCell(<FileTextOutlined className="text-[#7367f0]" />, <>Ariza ma&apos;lumotlari</>, "px-4"),
      key: "submission_info",
      render: (_, record) => (
        <div>
          <div className="font-bold text-base mb-1" style={{ color: "#7367f0" }}>
            #{record.submission_number}
          </div>
          <div className={`text-sm font-bold ${strongText}`}>
            {record.application_title}
          </div>
        </div>
      ),
      width: 250,
    },
    {
      title: headerCell(<FileTextOutlined className="text-[#7367f0]" />, "Mutaxassislik"),
      key: "speciality",
      width: 220,
      render: (_: unknown, record) => (
        <div className="py-2">
          <div className={`font-bold text-sm ${strongText}`}>{getSpecialityLabel(record)}</div>
        </div>
      ),
    },
    {
      title: headerCell(<CreditCardOutlined className="text-[#7367f0]" />, <>Ta&apos;lim shakli</>),
      key: "education_form",
      dataIndex: "education_form",
      width: 160,
      render: (value?: string | null) => (
        <div className="py-2">
          <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
            theme === "dark"
              ? "text-gray-300 bg-white/5 border-white/10"
              : "text-gray-600 bg-black/5 border-black/10"
          }`}>
            {value || "—"}
          </span>
        </div>
      ),
    },
    {
      title: headerCell(<UserOutlined className="text-[#7367f0]" />, "Talabgor"),
      key: "applicant_info",
      render: (_, record) => (
        <div className="py-2">
          <div className={`font-bold text-sm ${strongText}`}>
            {record.applicant_name}
          </div>
          <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <PhoneOutlined className="text-[10px]" />
            {record.applicant_phone}
          </div>
        </div>
      ),
      width: 200,
    },
    {
      title: headerCell(<ClockCircleOutlined className="text-[#7367f0]" />, "Holati"),
      dataIndex: "status",
      key: "status",
      width: 200,
      render: (status: string) => (
        <div className="py-2">
          <SubmissionStatusPill status={status} />
        </div>
      ),
    },
    {
      title: headerCell(<DollarOutlined className="text-[#7367f0]" />, <>To&apos;lov</>),
      dataIndex: "payment_status",
      key: "payment_status",
      render: (status: string) => (
        <div className="py-2">
          <PaymentStatusPill status={status} />
        </div>
      ),
      width: 130,
    },
    {
      title: headerCell(<StarOutlined className="text-[#7367f0]" />, <>O&apos;rtacha ball</>),
      dataIndex: "mark",
      key: "mark",
      width: 120,
      render: (_: Submission["mark"], record: Submission) => {
        const score = record.mark?.score;
        const display =
          score !== null && score !== undefined
            ? Number(score)
            : "—";
        return (
          <div className="py-2">
            <span className={`font-semibold text-sm ${strongText}`}>
              {display}
            </span>
          </div>
        );
      },
    },
    {
      title: headerCell(<CalendarOutlined className="text-[#7367f0]" />, "Sana"),
      dataIndex: "submitted_at",
      key: "submitted_at",
      render: (date?: string) => (
        <div className="py-2 text-xs font-medium text-gray-400 whitespace-nowrap">
          {date ? formatDateTime(date) : "-"}
        </div>
      ),
      width: 150,
    },
    {
      title: (
        <div className="flex items-center justify-center py-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Amallar</span>
        </div>
      ),
      key: "actions",
      fixed: "right",
      render: (_, record) => renderActions(record, "table"),
      width: 300,
    },
  ];

  const pageTitle = "Qabul Hujjatlari";

  if (error) {
    // Handle array error format from backend
    let errorMessage = error.message || "Ma'lumotlarni yuklashda xatolik yuz berdi";

    // Agar backenddan array formatida error kelgan bo'lsa
    if (Array.isArray((error).data)) {
      errorMessage = (error).data.join(", ");
    }

    return (
      <div className="space-y-6" style={{ color: surface.text }}>
        <PageHeader title={pageTitle} />
        <ErrorState
          description={errorMessage}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const MOBILE_PAGE_SIZE = 10;
  const mobilePageCount = Math.max(1, Math.ceil(submissions.length / MOBILE_PAGE_SIZE));
  const currentMobilePage = Math.min(mobilePage, mobilePageCount);
  const mobileItems = submissions.slice(
    (currentMobilePage - 1) * MOBILE_PAGE_SIZE,
    currentMobilePage * MOBILE_PAGE_SIZE
  );

  const exportButtonClass =
    "!h-10 max-md:!h-11 w-full md:w-auto px-3 !rounded-xl !border-0 shadow-sm font-medium flex items-center justify-center gap-2";

  return (
    <div className="space-y-5 sm:space-y-6" style={{ color: surface.text }}>
      <AdminListStyles />

      {/* Page Header */}
      <PageHeader
        title={pageTitle}
        subtitle={<>Barcha talabgorlar arizalari ro&apos;yxati</>}
      />

      {/* Filters */}
      <AdminCard padded className="admin-touch">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(200px,1fr)_200px_240px_auto] lg:items-center">
          <Input
            allowClear
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Qidirish..."
            className="!h-10 max-md:!h-11 !rounded-xl sm:col-span-2 lg:col-span-1"
            style={{
              background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
              border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
              color: theme === "dark" ? "#ffffff" : "#484650",
            }}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setMobilePage(1); }}
          />

          <Select
            className="w-full premium-select"
            placeholder="Holat bo&apos;yicha"
            onChange={(value) => { setStatusFilter(value); setMobilePage(1); }}
            value={statusFilter}
            options={[
              { value: "all", label: "Barcha holatlar" },
              { value: "DRAFT", label: "Qoralama" },
              { value: "SUBMITTED", label: "Topshirilgan" },
              { value: "UNDER_REVIEW", label: "Tekshirilmoqda" },
              { value: "APPROVED", label: "Tasdiqlangan" },
              { value: "REJECTED", label: "Rad etilgan" },
              { value: "WITHDRAWN", label: "Qaytarilgan" },
            ]}
          />

          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            filterOption={(input, option) =>
              (option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())
            }
            className="w-full premium-select"
            placeholder="Ariza (campaign) bo'yicha"
            value={applicationFilter === "all" ? undefined : applicationFilter}
            onChange={(value) => { setApplicationFilter(value ?? "all"); setMobilePage(1); }}
            options={[
              { value: "all", label: "Barcha arizalar" },
              ...(applicationsData?.data?.data || []).map((app: ApplicationItem) => ({
                value: app.id,
                label: app.title,
              })),
            ]}
          />

          <div className="grid grid-cols-2 gap-2 sm:col-span-2 lg:col-span-1 lg:flex">
            <Button
              icon={<FileWordOutlined />}
              className={exportButtonClass}
              style={{
                background: theme === "dark" ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.08)",
                color: "#2563eb",
              }}
              disabled={applicationFilter === "all"}
              onClick={() => handleExport("word")}
            >
              Word
            </Button>
            <Button
              icon={<FileExcelOutlined />}
              className={exportButtonClass}
              style={{
                background: theme === "dark" ? "rgba(34, 197, 94, 0.15)" : "rgba(34, 197, 94, 0.08)",
                color: "#16a34a",
              }}
              disabled={applicationFilter === "all"}
              onClick={() => handleExport("excel")}
            >
              Excel
            </Button>
          </div>
        </div>
      </AdminCard>

      {isMobile ? (
        /* Mobile: card list */
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <AdminCard key={i} padded>
                <Skeleton active paragraph={{ rows: 3 }} />
              </AdminCard>
            ))
          ) : submissions.length === 0 ? (
            <EmptyState description="Arizalar mavjud emas" />
          ) : (
            <>
              <div className="px-1 text-xs font-medium" style={{ color: surface.muted }}>
                Jami: {submissions.length} ta
              </div>
              {mobileItems.map((record) => (
                <AdminCard key={record.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-base font-bold" style={{ color: "#7367f0" }}>
                        #{record.submission_number}
                      </div>
                      <div className={`mt-0.5 text-sm font-semibold break-words ${strongText}`}>
                        {record.application_title}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-[11px] uppercase tracking-wide" style={{ color: surface.muted }}>
                        Ball
                      </div>
                      <div className={`text-base font-bold ${strongText}`}>
                        {record.mark?.score !== null && record.mark?.score !== undefined ? Number(record.mark.score) : "—"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <SubmissionStatusPill status={record.status} />
                    <PaymentStatusPill status={record.payment_status} />
                    {record.education_form ? (
                      <span
                        className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase leading-5 tracking-wide"
                        style={{ color: surface.muted, borderColor: surface.border }}
                      >
                        {record.education_form}
                      </span>
                    ) : null}
                  </div>

                  <dl className="mt-3 grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <dt className="text-xs" style={{ color: surface.muted }}>Mutaxassislik</dt>
                      <dd className={`m-0 font-medium break-words ${strongText}`}>{getSpecialityLabel(record)}</dd>
                    </div>
                    <div className="flex flex-wrap items-end justify-between gap-2">
                      <div className="min-w-0">
                        <dt className="text-xs" style={{ color: surface.muted }}>Talabgor</dt>
                        <dd className={`m-0 font-semibold break-words ${strongText}`}>{record.applicant_name}</dd>
                        <dd className="m-0 flex items-center gap-1 text-xs text-gray-400">
                          <PhoneOutlined className="text-[10px]" />
                          {record.applicant_phone}
                        </dd>
                      </div>
                      <dd className="m-0 text-xs text-gray-400">
                        {record.submitted_at ? formatDateTime(record.submitted_at) : "-"}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-4 border-t pt-3" style={{ borderColor: surface.divider }}>
                    {renderActions(record, "card")}
                  </div>
                </AdminCard>
              ))}
              {submissions.length > MOBILE_PAGE_SIZE && (
                <div className="flex justify-center pt-1">
                  <Pagination
                    className="admin-pagination"
                    current={currentMobilePage}
                    pageSize={MOBILE_PAGE_SIZE}
                    total={submissions.length}
                    showSizeChanger={false}
                    showLessItems
                    onChange={(page) => {
                      setMobilePage(page);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <AdminCard className="overflow-hidden">
          <Table
            columns={columns}
            dataSource={submissions}
            rowKey="id"
            loading={isLoading}
            locale={{ emptyText: <EmptyState description="Arizalar mavjud emas" /> }}
            className="custom-admin-table"
            scroll={{ x: "max-content" }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} dan ${total} ta`,
              className: "!px-4 sm:!px-6 !py-4",
            }}
          />
        </AdminCard>
      )}

      <Modal
        title="Payme to'lov holati"
        open={isPaymentModalOpen}
        onCancel={() => {
          setIsPaymentModalOpen(false);
          setPaymentCheckId(null);
        }}
        footer={null}
        width={440}
        className="premium-modal"
      >
        <div className="py-4">
          {isPaymeStatusLoading ? (
            <div className="flex justify-center py-8">
              <Spin size="large" />
            </div>
          ) : paymeStatusData ? (
            <Descriptions column={1} bordered size="small" labelStyle={{ whiteSpace: "nowrap" }} contentStyle={{ wordBreak: "break-word" }}>
              <Descriptions.Item label="Holati">
                <Tag color={paymeStatusData.state === 2 ? "green" : "red"}>
                  {paymeStatusData.state === 2 ? "To'langan" : "To'lanmagan"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Transaction ID">{paymeStatusData.transaction_id || "-"}</Descriptions.Item>
              <Descriptions.Item label="Summa">{paymeStatusData.amount ? `${(paymeStatusData.amount / 100).toLocaleString()} UZS` : "-"}</Descriptions.Item>
              <Descriptions.Item label="Vaqti">{paymeStatusData.paid_at ? formatDateTime(paymeStatusData.paid_at) : "-"}</Descriptions.Item>
              {paymeStatusData.reason && (
                <Descriptions.Item label="Sabab">{paymeStatusData.reason}</Descriptions.Item>
              )}
              {paymeStatusData.state !== undefined && (
                <Descriptions.Item label="State Code">{paymeStatusData.state}</Descriptions.Item>
              )}
            </Descriptions>
          ) : (
            <div className="text-center py-4 text-gray-500">
              Ma&apos;lumot topilmadi
            </div>
          )}
        </div>
      </Modal>

      <Modal
        title="Ariza Baholash"
        open={isScoreModalOpen}
        onCancel={() => {
          setIsScoreModalOpen(false);
          setScoreModalSubmission(null);
          scoreForm.resetFields();
        }}
        footer={null}
        className="premium-modal"
      >
        {scoreModalSubmission && (
          <>
            <div className="mb-6 space-y-2">
              <div className="flex flex-wrap justify-between items-center gap-x-4">
                <span className="text-gray-400 font-medium">Ariza raqami:</span>
                <span className="font-bold text-[#7367f0]">#{scoreModalSubmission.submission_number}</span>
              </div>
              <div className="flex flex-wrap justify-between items-center gap-x-4">
                <span className="text-gray-400 font-medium">Arizachi:</span>
                <span className="font-bold break-words">{scoreModalSubmission.applicant_name}</span>
              </div>
            </div>

            <Form
              form={scoreForm}
              layout="vertical"
              onFinish={handleScoreSubmit}
            >
              <Form.Item
                name="score"
                label="Imtihon bali"
                rules={[{ required: true, message: "Ballni kiriting" }]}
              >
                <InputNumber
                  className="!w-full flex items-center"
                  placeholder="Masalan: 85"
                  min={0}
                  max={100}
                  inputMode="decimal"
                />
              </Form.Item>

              <Form.Item
                name="comments"
                label="Eslatmalar"
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Imtihon natijalari bo'yicha qo'shimcha ma'lumotlar"
                  className="rounded-xl"
                />
              </Form.Item>

              <Form.Item className="mb-0">
                <FormActions className="!mt-0">
                  <Button
                    onClick={() => {
                      setIsScoreModalOpen(false);
                      setScoreModalSubmission(null);
                      scoreForm.resetFields();
                    }}
                    className="rounded-xl"
                  >
                    Bekor qilish
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isSubmittingScore}
                    className="rounded-xl h-[40px] px-6 border-0"
                    style={{
                      background: "linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.7))",
                      boxShadow: "0 8px 25px -8px #7367f0",
                    }}
                  >
                    Saqlash
                  </Button>
                </FormActions>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>

      <Drawer
        title={reviewAction === "approve" ? "Arizani Tasdiqlash" : "Arizani Rad Etish"}
        placement="right"
        onClose={() => {
          setReviewDrawerOpen(false);
          form.resetFields();
        }}
        open={reviewDrawerOpen}
        width={drawerWidth(isMobile, 400)}
        styles={{
          header: {
            background: surface.surface,
            color: theme === "dark" ? "#ffffff" : "#000000",
            borderBottom: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(0, 0, 0, 0.05)",
          },
          body: {
            background: surface.surface,
            color: theme === "dark" ? "#ffffff" : "#000000",
          }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleReviewSubmit}
        >
          <Form.Item
            name="notes"
            label={<span style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>Eslatmalar</span>}
            rules={[{ required: true, message: "Eslatma kiritish majburiy!" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Qaror bo'yicha izoh qoldiring..."
              className="rounded-xl"
            />
          </Form.Item>

          <FormActions>
            <Button
              onClick={() => {
                setReviewDrawerOpen(false);
                form.resetFields();
              }}
              className="rounded-xl"
            >
              Bekor qilish
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isReviewSubmitting}
              className="rounded-xl"
              style={{
                background: reviewAction === "approve"
                  ? "linear-gradient(118deg, #28c76f, rgba(40, 199, 111, 0.7))"
                  : "linear-gradient(118deg, #ea5455, rgba(234, 84, 85, 0.7))",
                borderColor: reviewAction === "approve" ? "#28c76f" : "#ea5455",
                boxShadow: reviewAction === "approve"
                  ? "0 8px 25px -8px #28c76f"
                  : "0 8px 25px -8px #ea5455",
              }}
            >
              {reviewAction === "approve" ? "Tasdiqlash" : "Rad etish"}
            </Button>
          </FormActions>
        </Form>
      </Drawer>

      <Drawer
        title="Arizani Qaytarish"
        placement="right"
        onClose={() => {
          setReturnDrawerOpen(false);
          returnForm.resetFields();
        }}
        open={returnDrawerOpen}
        width={drawerWidth(isMobile, 400)}
        styles={{
          header: {
            background: surface.surface,
            color: theme === "dark" ? "#ffffff" : "#000000",
            borderBottom: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(0, 0, 0, 0.05)",
          },
          body: {
            background: surface.surface,
            color: theme === "dark" ? "#ffffff" : "#000000",
          }
        }}
      >
        <Form
          form={returnForm}
          layout="vertical"
          onFinish={handleReturnSubmit}
        >
          <Form.Item
            name="notes"
            label={<span style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>Eslatmalar</span>}
            rules={[{ required: true, message: "Eslatma kiritish majburiy!" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Qaytarish sababi yoki izoh qoldiring..."
              className="rounded-xl"
            />
          </Form.Item>

          <FormActions>
            <Button
              onClick={() => {
                setReturnDrawerOpen(false);
                returnForm.resetFields();
              }}
              className="rounded-xl"
            >
              Bekor qilish
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isReturnSubmitting}
              className="rounded-xl"
              style={{
                background: "linear-gradient(118deg, #ff9f43, rgba(255, 159, 67, 0.7))",
                borderColor: "#ff9f43",
                boxShadow: "0 8px 25px -8px #ff9f43",
              }}
            >
              Qaytarish
            </Button>
          </FormActions>
        </Form>
      </Drawer>
    </div>
  );
}
