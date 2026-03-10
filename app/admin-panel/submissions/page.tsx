"use client";

import { Table, Button, Typography, Input, Select, message, Modal, Descriptions, Spin, Tag, Drawer, Form, InputNumber, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  EyeOutlined,
  // SearchOutlined,
  FileTextOutlined,
  UserOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  CheckOutlined,
  CloseOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useGet, usePost, API_BASE_URL } from "@/lib/hooks";
import { useThemeStore } from "@/lib/stores/themeStore";
import { tokenStorage } from "@/lib/utils";
// import { TableSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import Link from "next/link";
import { formatDate, getApplicationStatusLabel } from "@/lib/utils";
import { useState, useMemo } from "react";
import { apiRequest } from "@/lib/hooks/useUniversalFetch";
import { useQueryClient } from "@tanstack/react-query";

const { Title } = Typography;

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
  const { theme } = useThemeStore();
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
    searchParams.set("application_id", String(applicationFilter));
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

  const columns: ColumnsType<Submission> = [
    {
      title: (
        <div className="flex items-center gap-2 py-3 px-4">
          <FileTextOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Ariza ma&apos;lumotlari</span>
        </div>
      ),
      key: "submission_info",
      render: (_, record) => (
        <div>
          <div className="font-bold text-base mb-1" style={{ color: "#7367f0" }}>
            #{record.submission_number}
          </div>
          <div className={`text-sm font-bold ${theme === "dark" ? "text-gray-200" : "text-[#484650]"}`}>
            {record.application_title}
          </div>
        </div>
      ),
      width: 250,
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <FileTextOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Mutaxassislik</span>
        </div>
      ),
      key: "speciality",
      width: 220,
      render: (_: unknown, record) => {
        const specialityObj =
          record.speciality && typeof record.speciality === "object" && !Array.isArray(record.speciality)
            ? (record.speciality as { id?: number; name?: string; code?: string })
            : null;
        const name = specialityObj?.name || record.speciality_name || (typeof record.speciality === "string" ? record.speciality : "") || "—";
        const code = specialityObj?.code || (record.speciality_code ? String(record.speciality_code) : "");
        return (
          <div className="py-2">
            <div className={`font-bold text-sm ${theme === "dark" ? "text-gray-200" : "text-[#484650]"}`}>
              {code ? `${code} - ${name}` : name}
            </div>
          </div>
        );
      },
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <CreditCardOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Ta&apos;lim shakli</span>
        </div>
      ),
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
      title: (
        <div className="flex items-center gap-2 py-3">
          <UserOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Talabgor</span>
        </div>
      ),
      key: "applicant_info",
      render: (_, record) => (
        <div className="py-2">
          <div className={`font-bold text-sm ${theme === "dark" ? "text-gray-200" : "text-[#484650]"}`}>
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
      title: (
        <div className="flex items-center gap-2 py-3">
          <ClockCircleOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Holati</span>
        </div>
      ),
      dataIndex: "status",
      key: "status",
      width: 260,
      render: (status: string) => {
        const label = getApplicationStatusLabel(status);
        return (
          <div className="py-2">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${status === "APPROVED" ? "bg-green-500/10 text-green-500 border-green-500/20" :
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
        };
        const colorClass =
          status === "PAID" ? "text-green-500 bg-green-500/10 border-green-500/20" :
            status === "FAILED" ? "text-red-500 bg-red-500/10 border-red-500/20" :
              "text-orange-500 bg-orange-500/10 border-orange-500/20";

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
        <div className="flex items-center gap-2 py-3">
          <StarOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">O&apos;rtacha ball</span>
        </div>
      ),
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
            <span
              className={`font-semibold text-sm ${
                theme === "dark" ? "text-gray-200" : "text-[#484650]"
              }`}
            >
              {display} 
            </span>
          </div>
        );
      },
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <CalendarOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Sana</span>
        </div>
      ),
      dataIndex: "submitted_at",
      key: "submitted_at",
      render: (date?: string) => (
        <div className="py-2 text-xs font-medium text-gray-400">
          {date ? formatDate(date) : "-"}
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
      render: (_, record) => (
        <div className="flex justify-center gap-2 py-2">
        <Link href={`/admin-panel/submissions/${record.id}`}>
            <Button
              className={`w-10 h-10 rounded-xl flex items-center justify-center border-0 transition-all duration-300 shadow-sm ${useThemeStore.getState().theme === "dark"
                ? "bg-[#7367f0]/20 text-[#7367f0] hover:bg-[#7367f0] hover:text-white"
                : "bg-[#7367f0]/10 text-[#7367f0] hover:bg-[#7367f0] hover:text-white"
                }`}
              icon={<EyeOutlined style={{ fontSize: "18px" }} />}
            />
        </Link>
          <Button
            className={`w-10 h-10 rounded-xl flex items-center justify-center border-0 transition-all duration-300 shadow-sm ${useThemeStore.getState().theme === "dark"
              ? "bg-blue-500/20 text-blue-500 hover:bg-blue-500 hover:text-white"
              : "bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white"
              }`}
            icon={<CreditCardOutlined style={{ fontSize: "18px" }} />}
            title="Payme statusini tekshirish"
            onClick={() => {
              setPaymentCheckId(record.id);
              setIsPaymentModalOpen(true);
            }}
          />
          {(record.status === "SUBMITTED" || record.status === "UNDER_REVIEW") && (
            <>
              <Button
                className={`w-10 h-10 rounded-xl flex items-center justify-center border-0 transition-all duration-300 shadow-sm ${useThemeStore.getState().theme === "dark"
                  ? "bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white"
                  : "bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white"
                  }`}
                icon={<CheckOutlined style={{ fontSize: "18px" }} />}
                title="Tasdiqlash"
                onClick={() => openReviewDrawer(record.id, "approve")}
              />
              <Button
                className={`w-10 h-10 rounded-xl flex items-center justify-center border-0 transition-all duration-300 shadow-sm ${useThemeStore.getState().theme === "dark"
                  ? "bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
                  : "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                  }`}
                icon={<CloseOutlined style={{ fontSize: "18px" }} />}
                title="Rad etish"
                onClick={() => openReviewDrawer(record.id, "reject")}
              />
            </>
          )}
          {record.status === "APPROVED" && !record?.mark?.score && (
            <Button
              className={`w-10 h-10 rounded-xl flex items-center justify-center border-0 transition-all duration-300 shadow-sm ${useThemeStore.getState().theme === "dark"
                ? "bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white"
                : "bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white"
                }`}
              icon={<StarOutlined style={{ fontSize: "18px" }} />}
              title="Baho qo'yish"
              onClick={() => openScoreModal(record)}
            />
          )}
        </div>
      ),
      width: 180,
    },
  ];

  if (error) {
    // Handle array error format from backend
    let errorMessage = error.message || "Ma'lumotlarni yuklashda xatolik yuz berdi";

    // Agar backenddan array formatida error kelgan bo'lsa
    if (Array.isArray((error).data)) {
      errorMessage = (error).data.join(", ");
    }

    return (
      <div style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>
        <h1 style={{ 
          fontSize: "24px", 
          fontWeight: 700,
          marginBottom: 24,
          color: theme === "dark" ? "#ffffff" : "#1a1a1a"
        }}>
          Qabul Hujjatlari
        </h1>
        <ErrorState 
          description={errorMessage}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ color: theme === "dark" ? "#ffffff" : "#484650" }}>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Title level={4} className="!mb-1" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
            Qabul Hujjatlari
          </Title>
          <div className="text-gray-400 text-sm font-medium">Barcha talabgorlar arizalari ro&apos;yxati</div>
        </div>

        <div className="flex items-start gap-3">
          <Input
            placeholder="Qidirish..."
            className="pl-9 pr-4 py-2 w-64 h-[40px] rounded-xl transition-all duration-300"
            style={{
              background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
              border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
              color: theme === "dark" ? "#ffffff" : "#484650",
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Select
            className="w-48 premium-select"
            placeholder="Holat bo&apos;yicha"
            onChange={setStatusFilter}
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
            className="w-56 premium-select"
            placeholder="Ariza (campaign) bo'yicha"
            value={applicationFilter === "all" ? undefined : applicationFilter}
            onChange={(value) => setApplicationFilter(value ?? "all")}
            options={[
              { value: "all", label: "Barcha arizalar" },
              ...(applicationsData?.data?.data || []).map((app: ApplicationItem) => ({
                value: app.id,
                label: app.title,
              })),
            ]}
          />

          <div className="flex gap-2">
            <Button
              icon={<FileWordOutlined />}
              className="h-[40px] px-3 rounded-xl border-0 shadow-sm font-medium flex items-center gap-2"
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
              className="h-[40px] px-3 rounded-xl border-0 shadow-sm font-medium flex items-center gap-2"
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
      </div>

      <div
        className="rounded-xl overflow-hidden transition-all duration-300"
        style={{
          background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
          border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
          boxShadow: theme === "dark" ? "none" : "0 4px 12px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Table
          columns={columns}
          dataSource={submissions}
          rowKey="id"
          loading={isLoading}
          locale={{ emptyText: "Arizalar mavjud emas" }}
          className="custom-admin-table"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} dan ${total} ta`,
            className: "px-6 py-4",
          }}
        />
        <style jsx global>{`
          .custom-admin-table .ant-table {
            background: transparent !important;
            color: ${theme === "dark" ? "#e2e8f0" : "#484650"} !important;
          }
          .custom-admin-table .ant-table-thead > tr > th {
            background: ${theme === "dark" ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.01)"} !important;
            border-bottom: ${theme === "dark" ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(0, 0, 0, 0.05)"} !important;
            color: ${theme === "dark" ? "#94a3b8" : "#64748b"} !important;
          }
          .custom-admin-table .ant-table-tbody > tr > td {
            border-bottom: ${theme === "dark" ? "1px solid rgba(255, 255, 255, 0.03)" : "1px solid rgba(0, 0, 0, 0.03)"} !important;
          }
          .custom-admin-table .ant-table-tbody > tr:hover > td {
            background: ${theme === "dark" ? "rgba(115, 103, 240, 0.05)" : "rgba(115, 103, 240, 0.02)"} !important;
          }
          .custom-admin-table .ant-pagination-item-active {
            border-color: #7367f0 !important;
            background: #7367f0 !important;
          }
          .custom-admin-table .ant-pagination-item-active a {
            color: #fff !important;
          }
          .premium-select .ant-select-selector {
            background: ${theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff"} !important;
            border: ${theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)"} !important;
            color: ${theme === "dark" ? "#ffffff" : "#484650"} !important;
            border-radius: 12px !important;
            height: 40px !important;
            display: flex !important;
            align-items: center !important;
          }
          .premium-modal .ant-modal-content {
            background: ${theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff"} !important;
            color: ${theme === "dark" ? "#ffffff" : "#000000"} !important;
            border: ${theme === "dark" ? "1px solid rgb(59, 66, 83)" : "none"} !important;
            border-radius: 16px !important;
          }
          .premium-modal .ant-modal-header {
            background: transparent !important;
            border-bottom: ${theme === "dark" ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(0, 0, 0, 0.05)"} !important;
          }
          .premium-modal .ant-modal-title {
            color: ${theme === "dark" ? "#ffffff" : "#000000"} !important;
          }
        `}</style>
      </div>

      <Modal
        title="Payme to'lov holati"
        open={isPaymentModalOpen}
        onCancel={() => {
          setIsPaymentModalOpen(false);
          setPaymentCheckId(null);
        }}
        footer={null}
        width={400}
        className="premium-modal"
      >
        <div className="py-4">
          {isPaymeStatusLoading ? (
            <div className="flex justify-center py-8">
              <Spin size="large" />
            </div>
          ) : paymeStatusData ? (
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Holati">
                <Tag color={paymeStatusData.state === 2 ? "green" : "red"}>
                  {paymeStatusData.state === 2 ? "To'langan" : "To'lanmagan"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Transaction ID">{paymeStatusData.transaction_id || "-"}</Descriptions.Item>
              <Descriptions.Item label="Summa">{paymeStatusData.amount ? `${(paymeStatusData.amount / 100).toLocaleString()} UZS` : "-"}</Descriptions.Item>
              <Descriptions.Item label="Vaqti">{paymeStatusData.paid_at ? formatDate(paymeStatusData.paid_at) : "-"}</Descriptions.Item>
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
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 font-medium">Ariza raqami:</span>
                <span className="font-bold text-[#7367f0]">#{scoreModalSubmission.submission_number}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">Arizachi:</span>
                <span className="font-bold">{scoreModalSubmission.applicant_name}</span>
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

              <Form.Item className="mb-0 text-right">
                <Space>
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
                </Space>
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
        width={400}
        styles={{
          header: {
            background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
            color: theme === "dark" ? "#ffffff" : "#000000",
            borderBottom: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(0, 0, 0, 0.05)",
          },
          body: {
            background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
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

          <div className="flex gap-3 justify-end mt-4">
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
          </div>
        </Form>
      </Drawer>
    </div>
  );
}
