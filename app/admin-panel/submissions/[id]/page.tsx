"use client";

import { use, useState, useEffect, type CSSProperties } from "react";
import {
  Spin,
  Tag,
  Button,
  Alert,
  Table,
  Typography,
  Tabs,
  Avatar,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Drawer,
  Tooltip,
} from "antd";
import { useGet, usePost } from "@/lib/hooks";
import { useMutation } from "@tanstack/react-query";
import { marksApi } from "@/lib/api/marks";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { formatDate, formatDateTime, getApplicationStatusLabel, getApplicationStatusColor } from "@/lib/utils";
import { apiRequest } from "@/lib/hooks/useUniversalFetch";
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
  RollbackOutlined,
  EditOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import { useThemeStore } from "@/lib/stores/themeStore";
import {
  AdminCard,
  AdminListStyles,
  InfoRow,
  PageHeader,
  SectionHeader,
  StickyActionBar,
  SubmissionStatusPill,
  drawerWidth,
  useAdminSurface,
  useIsAdminMobile,
} from "@/components/admin/submissions/AdminUi";
import { FormActions } from "@/components/admin/submissions/FormActions";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApplicantDetails {
  id: number;
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  phone_number?: string | null;
  email?: string | null;
  pinfl?: string | null;
  passport_seria?: string | null;

  passport_number?: string | null;
  passport_issued_date?: string | null;
  passport_issued_by?: string | null;
  birth_date?: string | null;
  birth_place?: string | null;
  citizen?: string | null;
  nation?: string | null;
  permanent_address?: string | null;
  region?: string | null;
  district?: string | null;
  organization?: string | null;
  role?: string;
  is_active?: boolean;
  profile?: unknown;
}

interface ApplicationSpeciality {
  id: number;
  name: string;
  code: string;
  comment?: string | null;
  file?: unknown;
  file_speciality_id?: number;
}

interface ApplicationDetails {
  id: number;
  title: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  exam_date?: string | null;
  status?: string;
  application_fee?: string | null;
  total_submissions?: number;
  is_open?: boolean;
  is_upcoming?: boolean;
  is_closed?: boolean;
  created_by_name?: string | null;
  created_at?: string | null;
  specialities?: ApplicationSpeciality[];
}

interface SubmissionDetail {
  id: number;
  speciality?: ApplicationSpeciality;
  submission_number: string;
  application: unknown;
  application_title?: string;
  applicant: number | ApplicantDetails;
  applicant_name: string;
  applicant_phone: string;
  education_form?: string | null;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN";
  payment_status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  mark?: { score: number; id: number; comments: string; marked_at?: string };
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
  answer_text: string | null;
}

const { Text } = Typography;

const formatAnswer = (item: DataObject, onPreviewFile?: (path: string) => void) => {
  if (item.field_type === "FILE" && item.answer) {
    const path = typeof item.answer === "string" ? item.answer : typeof item.answer_text === "string" ? item.answer_text : "";
    if (path && onPreviewFile) {
      return (
        <button
          type="button"
          onClick={() => onPreviewFile(path)}
          className="text-[#7367f0] hover:underline font-bold inline-flex items-center gap-2 bg-transparent border-0 cursor-pointer p-0 min-h-11 text-left"
        >
          📎 Hujjatni ko&apos;rish
        </button>
      );
    }
    return (
      <a
        href={API_BASE_URL?.replace("/api/v1", "") + path}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#7367f0] hover:underline font-bold inline-flex items-center gap-2 min-h-11"
      >
        📎 Hujjatni ko&apos;rish
      </a>
    );
  }

  return (
    <span className="font-medium break-words" style={{ overflowWrap: "anywhere" }}>
      {item.answer_text || item.answer || "—"}
    </span>
  );
};

const CardView = ({ answers, theme, onPreviewFile }: { answers: DataObject[]; theme: string; onPreviewFile?: (path: string) => void }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 pt-2">
    {answers.map((item: DataObject) => (
      <div
        key={item.id}
        className="rounded-xl p-4 transition-all duration-300 min-w-0"
        style={{
          background: theme === "dark" ? "rgb(48, 56, 78)" : "#f8f9fa",
          border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
        }}
      >
        <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
          {item.field_label}
        </div>
        <div style={{ color: theme === "dark" ? "#ffffff" : "#484650" }}>
          {formatAnswer(item, onPreviewFile)}
        </div>
      </div>
    ))}
  </div>
);

const TableView = ({ answers, theme, onPreviewFile }: { answers: DataObject[]; theme: string; onPreviewFile?: (path: string) => void }) => {
  const columns = [
    {
      title: "№",
      key: "index",
      width: 56,
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
          {formatAnswer(record, onPreviewFile)}
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
        scroll={{ x: 560 }}
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
  const surface = useAdminSurface();
  const isMobile = useIsAdminMobile();
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [scoreForm] = Form.useForm();
  const [form] = Form.useForm();

  // Drawer review state
  const [reviewDrawerOpen, setReviewDrawerOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | "withdrawn" | null>(null);
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);

  // File preview modal state
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);

  const getFilePreviewUrl = (path: string) =>
    path.startsWith("http") ? path : (API_BASE_URL?.replace("/api/v1", "") || "") + (path.startsWith("/") ? path : `/${path}`);

  const handleOpenPreview = (path: string) => {
    const p = typeof path === "string" ? path.trim() : "";
    if (!p || p === "/") return;
    const url = getFilePreviewUrl(p);
    setPreviewFileName("");
    setPreviewFileUrl(url);
    setPreviewLoading(true);
  };

  const handleClosePreview = () => {
    if (previewFileUrl && previewFileUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewFileUrl);
    }
    setPreviewFileUrl(null);
    setPreviewFileName("");
    setPreviewLoading(false);
  };

  const handlePreviewLoad = () => setPreviewLoading(false);

  const getProxyUrl = (url: string) => `/api/proxy-file?url=${encodeURIComponent(url)}`;

  const getFileExt = (url: string) => {
    const pathPart = url.split("?")[0];
    return pathPart.split(".").pop()?.toLowerCase() || "";
  };

  useEffect(() => {
    if (!previewFileUrl || !previewLoading) return;
    const ext = getFileExt(previewFileName || previewFileUrl);
    const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];
    if (!imageExts.includes(ext) && ext !== "pdf") {
      const id = setTimeout(() => setPreviewLoading(false), 0);
      return () => clearTimeout(id);
    }
    const t = setTimeout(() => setPreviewLoading(false), 15000);
    return () => clearTimeout(t);
  }, [previewFileUrl, previewLoading, previewFileName]);

  const renderFilePreview = (displayUrl: string, originalUrl: string, fileName?: string) => {
    const ext = getFileExt(fileName || originalUrl);
    const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];
    if (imageExts.includes(ext)) {
      // eslint-disable-next-line @next/next/no-img-element -- Dynamic file preview (blob/proxy URLs)
      return <img src={displayUrl} alt="Preview" className="max-w-full max-h-[70vh] object-contain" onLoad={handlePreviewLoad} />;
    }
    if (ext === "pdf") {
      return (
        <object
          data={displayUrl}
          type="application/pdf"
          className="w-full h-[70vh] rounded"
          title="PDF preview"
          onLoad={handlePreviewLoad}
        >
          <p className="py-8 text-center" style={{ color: theme === "dark" ? "#9ca3af" : "#6b7280" }}>
            PDF ko&apos;rish uchun{" "}
            <a href={displayUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              yangi tabda oching
            </a>
          </p>
        </object>
      );
    }
    return (
      <div className="text-center py-8">
        <FileTextOutlined style={{ fontSize: 48, color: theme === "dark" ? "#6b7280" : "#9ca3af" }} />
        <p className="mt-4 mb-4" style={{ color: theme === "dark" ? "#9ca3af" : "#6b7280" }}>
          Ushbu fayl formatida oldindan ko&apos;rish mumkin emas
        </p>
        <a href={displayUrl} target="_blank" rel="noopener noreferrer" download={fileName} className="text-blue-500 hover:underline">
          Yuklab olish
        </a>
      </div>
    );
  };

  const { data: submissionData, isLoading } = useGet<{ data: SubmissionDetail }>(
    `/admin/application/submissions/${id}/`
  );
  const submission = submissionData?.data;

  const handleReviewSubmit = async (values: { notes: string }) => {
    if (!reviewAction) return;

    setIsReviewSubmitting(true);
    try {
      const endpoint = reviewAction === "approve"
        ? `/admin/application/submissions/${id}/approve/`
        : reviewAction === "reject"
          ? `/admin/application/submissions/${id}/reject/`
          : `/admin/application/submissions/${id}/withdrawn/`;

      await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify({ notes: values.notes }),
      });

      const successMsg = reviewAction === "approve" ? "Ariza tasdiqlandi" : reviewAction === "reject" ? "Ariza rad etildi" : "Ariza qayta topshirishga qaytarildi";
      message.success(successMsg);
      setReviewDrawerOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: [`/admin/application/submissions/${id}/`] });
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Xatolik yuz berdi";
      message.error(errorMessage);
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  const openReviewDrawer = (action: "approve" | "reject" | "withdrawn") => {
    setReviewAction(action);
    setReviewDrawerOpen(true);
  };

  const { mutate: submitScore, isPending: isSubmittingScore } = usePost("/admin/application/marks/", {
    onSuccess: () => {
      message.success("Baho muvaffaqiyatli qo'yildi");
      setIsScoreModalOpen(false);
      scoreForm.resetFields();
      queryClient.invalidateQueries({ queryKey: [`/admin/application/submissions/${id}/`] });
    },
    onError: (error) => {
      message.error(error.message || "Baho qo'yishda xatolik");
    },
  });

  const { mutate: updateScore, isPending: isUpdatingScore } = useMutation({
    mutationFn: ({ markId, data }: { markId: number; data: { score: string; comments?: string } }) =>
      marksApi.patchMark(String(markId), data),
    onSuccess: () => {
      message.success("Baho muvaffaqiyatli yangilandi");
      setIsScoreModalOpen(false);
      scoreForm.resetFields();
      queryClient.invalidateQueries({ queryKey: [`/admin/application/submissions/${id}/`] });
    },
    onError: (error) => {
      message.error(error.message || "Bahoni yangilashda xatolik");
    },
  });

  const handleScoreSubmit = (values: { score: number; comments: string }) => {
    const payload = { score: values.score.toString(), comments: values.comments };
    if (submission?.mark?.id != null) {
      updateScore({ markId: submission.mark.id, data: payload });
    } else {
      submitScore({ submission: parseInt(id), ...payload });
    }
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
      <div className="px-0 py-8 sm:p-12 text-center">
        <Alert
          message="Ariza topilmadi"
          description="Siz so'ragan ariza mavjud emas yoki o'chirilgan bo'lishi mumkin."
          type="error"
          showIcon
          className="rounded-xl border-0 shadow-lg text-left"
        />
        <Link href="/admin-panel/submissions" className="inline-block mt-6">
          <Button icon={<ArrowLeftOutlined />} className="rounded-xl !h-11">Ro&apos;yxatga qaytish</Button>
        </Link>
      </div>
    );
  }

  const application =
    submission.application && typeof submission.application === "object" && "title" in submission.application
      ? (submission.application as ApplicationDetails)
      : null;
  const applicant = typeof submission.applicant === "object" && submission.applicant != null ? submission.applicant : null;
  const applicantFullName =
    typeof submission.applicant === "object" && submission.applicant?.first_name != null
      ? [submission.applicant.last_name, submission.applicant.first_name, submission.applicant.middle_name].filter(Boolean).join(" ")
      : submission.applicant_name;

  const canReview = submission.status === "SUBMITTED" || submission.status === "UNDER_REVIEW";
  const hasActions = canReview || submission.status === "APPROVED";

  const actionButtonClass = "!h-[42px] px-5 !rounded-xl !border-0 shadow-lg font-bold flex items-center justify-center gap-2";

  const reviewActions = (
    <>
      {canReview && (
        <>
          <Button
            danger
            icon={<CloseOutlined />}
            onClick={() => openReviewDrawer("reject")}
            className={`${actionButtonClass} !text-white`}
            style={{
              background: "linear-gradient(118deg, #ea5455, rgba(234, 84, 85, 0.7))",
              boxShadow: "0 8px 25px -8px #ea5455",
              color: "white",
            }}
          >
            Rad etish
          </Button>
          <Button
            icon={<RollbackOutlined />}
            onClick={() => openReviewDrawer("withdrawn")}
            className={`${actionButtonClass} !text-white`}
            style={{
              background: "linear-gradient(118deg, #f59e0b, rgba(245, 158, 11, 0.7))",
              boxShadow: "0 8px 25px -8px #f59e0b",
              color: "white",
            }}
          >
            Qayta topshirish
          </Button>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => openReviewDrawer("approve")}
            className={actionButtonClass}
            style={{
              background: "linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.7))",
              boxShadow: "0 8px 25px -8px #7367f0",
            }}
          >
            Qabul qilish
          </Button>
        </>
      )}
      {submission.status === "APPROVED" &&
        (submission.mark ? (
          <>
            <Tooltip
              title={submission.mark?.comments?.trim() ? submission.mark.comments : "Izoh yo'q"}
              placement="top"
            >
              <span
                className="min-h-[42px] max-md:min-h-11 px-4 rounded-xl font-bold flex items-center justify-center gap-2 border border-[#28c76f]/30 cursor-pointer text-center"
                style={{
                  background: theme === "dark" ? "rgba(40, 199, 111, 0.15)" : "rgba(40, 199, 111, 0.08)",
                  color: "#28c76f",
                }}
              >
                Qo&apos;yilgan Baho: {Number(submission.mark?.score)}
              </span>
            </Tooltip>
            <Button
              type="default"
              icon={<EditOutlined />}
              onClick={() => {
                scoreForm.setFieldsValue({
                  score: Number(submission.mark?.score) ?? undefined,
                  comments: submission.mark?.comments ?? "",
                });
                setIsScoreModalOpen(true);
              }}
              className="!h-[42px] px-4 !rounded-xl font-bold flex items-center justify-center gap-2"
              style={{
                borderColor: theme === "dark" ? "rgba(115, 103, 240, 0.5)" : "#7367f0",
                color: "#7367f0",
                background: "transparent",
              }}
            >
              Tahrirlash
            </Button>
          </>
        ) : (
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => setIsScoreModalOpen(true)}
            className={actionButtonClass}
            style={{
              background: "linear-gradient(118deg, #28c76f, rgba(40, 199, 111, 0.7))",
              boxShadow: "0 8px 25px -8px #28c76f",
            }}
          >
            Baho qo&apos;yish
          </Button>
        ))}
    </>
  );

  const dash = (v: string | null | undefined) => v ?? "—";

  return (
    <div className="space-y-5 sm:space-y-6" style={{ color: surface.text }}>
      <AdminListStyles />

      {/* Page Header */}
      <PageHeader
        leading={
          <Link href="/admin-panel/submissions" aria-label="Ro'yxatga qaytish" className="shrink-0">
            <Button
              icon={<ArrowLeftOutlined />}
              className="!w-11 !h-11 !rounded-xl flex items-center justify-center !border-0 shadow-md transition-all duration-300"
              style={{
                background: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "#ffffff",
                color: theme === "dark" ? "#ffffff" : "#484650",
              }}
            />
          </Link>
        }
        title={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>Ariza #{submission.submission_number}</span>
            <SubmissionStatusPill status={submission.status} />
          </span>
        }
        subtitle={
          <span className="flex items-center gap-2">
            <CalendarOutlined /> Topshirilgan: {submission.submitted_at ? formatDateTime(submission.submitted_at) : formatDateTime(submission.created_at)}
          </span>
        }
        extra={!isMobile && hasActions ? <div className="flex flex-wrap items-center gap-3 lg:justify-end">{reviewActions}</div> : null}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 items-start">
        <div className="lg:col-span-2 space-y-5 sm:space-y-6 min-w-0">
          <AdminCard className="overflow-hidden">
            <SectionHeader icon={<FileTextOutlined />} title={<>Ariza Ma&apos;lumotlari</>} />

            <div className="p-4 sm:p-6">
              {application ? (
                <div
                  className="rounded-xl px-4 py-2 sm:px-5 sm:py-3 mb-6"
                  style={{
                    background: surface.subtle,
                    border: `1px solid ${surface.border}`,
                    borderColor: surface.border,
                  }}
                >
                  <div className="divide-y divide-[var(--admin-divider)]" style={{ "--admin-divider": surface.divider } as CSSProperties}>
                    <InfoRow label="Sarlavha:">{application.title ?? "—"}</InfoRow>
                    {application.description != null && (
                      <InfoRow label="Tavsif:">
                        <span className="font-normal">{application.description || "—"}</span>
                      </InfoRow>
                    )}
                    <InfoRow label="Boshlanish sanasi:">
                      {application.start_date ? formatDateTime(application.start_date) : "—"}
                    </InfoRow>
                    <InfoRow label="Tugash sanasi:">
                      {application.end_date ? formatDateTime(application.end_date) : "—"}
                    </InfoRow>
                    <InfoRow label="Imtihon sanasi:">
                      {application.exam_date ? formatDateTime(application.exam_date) : "—"}
                    </InfoRow>
                    <InfoRow label="Holat:">
                      <Tag
                        color={getApplicationStatusColor(application.status as "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED")}
                        className="m-0"
                      >
                        {getApplicationStatusLabel(application.status as "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED")}
                      </Tag>
                    </InfoRow>
                    <InfoRow label="Ta'lim shakli:">{submission.education_form ?? "—"}</InfoRow>
                    <InfoRow label="Ariza to'lovi:">
                      {application.application_fee != null
                        ? `${Number(application.application_fee).toLocaleString()} UZS`
                        : "—"}
                    </InfoRow>
                    <InfoRow label="Yaratuvchi:">{application.created_by_name ?? "—"}</InfoRow>
                    <InfoRow label="Yaratilgan:">
                      {application.created_at ? formatDateTime(application.created_at) : "—"}
                    </InfoRow>
                    {submission.speciality && (
                      <div className="py-2">
                        <span className="block mb-2 text-[13px]" style={{ color: surface.muted }}>Mutaxassislik:</span>
                        <div className="flex flex-wrap gap-2">
                          <Tag style={{ margin: 0, whiteSpace: "normal", wordBreak: "break-word" }}>
                            {submission.speciality.code} — {submission.speciality.name}
                          </Tag>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              <h3 className="m-0 mb-2 text-base font-semibold" style={{ color: surface.text }}>
                Javoblar
              </h3>
              <Tabs
                defaultActiveKey="card"
                className={`premium-tabs ${theme === "dark" ? "dark-tabs" : ""}`}
                items={[
                  {
                    key: "card",
                    label: (
                      <span className="flex items-center gap-2">
                        <InfoCircleOutlined />
                        Karta ko&apos;rinishi
                      </span>
                    ),
                    children: <CardView answers={submission.answers} theme={theme} onPreviewFile={handleOpenPreview} />,
                  },
                  {
                    key: "table",
                    label: (
                      <span className="flex items-center gap-2">
                        <TableOutlined />
                        Jadval ko&apos;rinishi
                      </span>
                    ),
                    children: <TableView answers={submission.answers} theme={theme} onPreviewFile={handleOpenPreview} />,
                  },
                ]}
              />
            </div>
          </AdminCard>

          {submission.documents && submission.documents.length > 0 ? (
            <AdminCard className="overflow-hidden">
              <SectionHeader icon={<CheckCircleOutlined />} title="Hujjatlar" accent="#28c76f" />
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {(submission.documents as { id?: number; file?: string }[]).map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-3 sm:p-4 rounded-xl border flex items-center justify-between gap-3"
                      style={{
                        background: surface.subtle,
                        borderColor: surface.border,
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileTextOutlined className="text-gray-400 text-lg shrink-0" />
                        <span className="font-medium text-sm truncate">Hujjat #{doc.id || idx + 1}</span>
                      </div>
                      <a
                        href={(API_BASE_URL?.replace("/api/v1", "") || "") + (doc.file || "")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 inline-flex items-center justify-center min-h-11 px-4 rounded-lg text-[#7367f0] text-xs font-bold hover:underline"
                        style={{ background: "rgba(115, 103, 240, 0.1)" }}
                      >
                        YUKLASH
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </AdminCard>
          ) : null}
        </div>

        <div className="space-y-5 sm:space-y-6 min-w-0">
          <AdminCard padded>
            <div className="flex items-center gap-4 mb-4">
              <Avatar size={56} icon={<UserOutlined />} className="bg-[#7367f0] shrink-0" />
              <div className="min-w-0">
                <div className="text-base font-semibold break-words" style={{ color: surface.text }}>
                  {applicantFullName}
                </div>
                <Text className="text-gray-400 font-medium">Talabgor</Text>
              </div>
            </div>

            <div className="border-t divide-y divide-[var(--admin-divider)]" style={{ borderColor: surface.divider, "--admin-divider": surface.divider } as CSSProperties}>
              {applicant && (
                <>
                  <InfoRow label="Ism:">{dash(applicant.first_name)}</InfoRow>
                  <InfoRow label="Familiya:">{dash(applicant.last_name)}</InfoRow>
                  <InfoRow label="Otasining ismi:">{dash(applicant.middle_name)}</InfoRow>
                  <InfoRow label="Telefon:">
                    {applicant.phone_number ?? submission.applicant_phone ?? "—"}
                  </InfoRow>
                  <InfoRow label="Email:">{dash(applicant.email)}</InfoRow>
                  <InfoRow label="PINFL:">{dash(applicant.pinfl)}</InfoRow>
                  <InfoRow label="Pasport seriyasi:">{dash(applicant.passport_seria)}</InfoRow>
                  <InfoRow label="Pasport raqami:">{dash(applicant.passport_number)}</InfoRow>
                  <InfoRow label="Pasport berilgan sana:">
                    {applicant.passport_issued_date ? formatDate(applicant.passport_issued_date) : "—"}
                  </InfoRow>
                  <InfoRow label="Pasport berilgan joy:">{dash(applicant.passport_issued_by)}</InfoRow>
                  <InfoRow label="Tug'ilgan sana:">
                    {applicant.birth_date ? formatDate(applicant.birth_date) : "—"}
                  </InfoRow>
                  <InfoRow label="Tug'ilgan joy:">{dash(applicant.birth_place)}</InfoRow>
                  <InfoRow label="Fuqaroligi:">{dash(applicant.citizen)}</InfoRow>
                  <InfoRow label="Millati:">{dash(applicant.nation)}</InfoRow>
                  <InfoRow label="Doimiy manzil:">{dash(applicant.permanent_address)}</InfoRow>
                  <InfoRow label="Viloyat:">{dash(applicant.region)}</InfoRow>
                  <InfoRow label="Tuman:">{dash(applicant.district)}</InfoRow>
                  <InfoRow label="Tashkilot:">{dash(applicant.organization)}</InfoRow>
                </>
              )}
              {typeof submission.applicant !== "object" && (
                <InfoRow label="Telefon:">{submission.applicant_phone}</InfoRow>
              )}
              <InfoRow label="To'lov holati:">
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
              </InfoRow>
              <InfoRow label="Ariza ID:">{submission.id}</InfoRow>
            </div>
          </AdminCard>

          <AdminCard padded>
            <h3 className="m-0 mb-4 flex items-center gap-2 text-base font-semibold" style={{ color: surface.text }}>
              <ClockCircleOutlined className="text-[#ff9f43]" />
              Muhim Sanalar
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <div>
                <Text className="text-gray-400 block mb-1">Yaratilgan:</Text>
                <Text strong style={{ color: surface.text }}>{formatDateTime(submission.created_at)}</Text>
              </div>
              <div>
                <Text className="text-gray-400 block mb-1">Oxirgi o&apos;zgarish:</Text>
                <Text strong style={{ color: surface.text }}>{formatDateTime(submission.updated_at)}</Text>
              </div>
              {submission.submitted_at && (
                <div>
                  <Text className="text-gray-400 block mb-1">Topshirilgan:</Text>
                  <Text strong style={{ color: surface.text }}>{formatDateTime(submission.submitted_at)}</Text>
                </div>
              )}
              {submission.mark?.marked_at && (
                <div>
                  <Text className="text-gray-400 block mb-1">Baholangan:</Text>
                  <Text strong style={{ color: surface.text }}>
                    {formatDateTime(submission.mark.marked_at)}
                  </Text>
                </div>
              )}
            </div>
          </AdminCard>

          {submission.review_notes && (
            <div
              className="rounded-xl p-4 sm:p-6 transition-all duration-300"
              style={{
                background: theme === "dark" ? "rgba(115, 103, 240, 0.1)" : "#f4f3ff",
                border: "1px solid rgba(115, 103, 240, 0.2)",
              }}
            >
              <h3 className="m-0 mb-3 flex items-center gap-2 text-base font-semibold" style={{ color: "#7367f0" }}>
                <MessageOutlined />
                Ko&apos;rib chiqish eslatmasi
              </h3>
              <Text className="whitespace-pre-line break-words" style={{ color: surface.text }}>
                {submission.review_notes}
              </Text>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: review actions pinned to the bottom of the viewport */}
      {isMobile && hasActions && <StickyActionBar isMobile>{reviewActions}</StickyActionBar>}

      <style jsx global>{`
        .premium-tabs .ant-tabs-nav::before {
          border-bottom: 2px solid ${theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"};
        }
        .premium-tabs .ant-tabs-tab {
          padding: 12px 0;
          margin-right: 32px;
        }
        .premium-tabs .ant-tabs-tab + .ant-tabs-tab {
          margin-left: 0;
        }
        @media (max-width: 639px) {
          .premium-tabs .ant-tabs-tab {
            margin-right: 20px;
            min-height: 44px;
          }
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
        .premium-table .ant-table-tbody > tr > td {
          padding-top: 8px !important;
          padding-bottom: 8px !important;
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

      <Drawer
        title={reviewAction === "approve" ? "Arizani Tasdiqlash" : reviewAction === "reject" ? "Arizani Rad Etish" : "Qayta topshirishga qaytarish"}
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
                  : reviewAction === "reject"
                    ? "linear-gradient(118deg, #ea5455, rgba(234, 84, 85, 0.7))"
                    : "linear-gradient(118deg, #f59e0b, rgba(245, 158, 11, 0.7))",
                borderColor: reviewAction === "approve" ? "#28c76f" : reviewAction === "reject" ? "#ea5455" : "#f59e0b",
                boxShadow: reviewAction === "approve"
                  ? "0 8px 25px -8px #28c76f"
                  : reviewAction === "reject"
                    ? "0 8px 25px -8px #ea5455"
                    : "0 8px 25px -8px #f59e0b",
              }}
            >
              {reviewAction === "approve" ? "Tasdiqlash" : reviewAction === "reject" ? "Rad etish" : "Qaytarish"}
            </Button>
          </FormActions>
        </Form>
      </Drawer>

      <Modal
        title="Ariza Baholash"
        open={isScoreModalOpen}
        onCancel={() => setIsScoreModalOpen(false)}
        footer={null}
        className="premium-modal"
      >
        {submission && (
          <>
            <div className="mb-6 space-y-2">
              <div className="flex flex-wrap justify-between items-center gap-x-4">
                <span className="text-gray-400 font-medium">Ariza raqami:</span>
                <span className="font-bold text-[#7367f0]">#{submission.submission_number}</span>
              </div>
              <div className="flex flex-wrap justify-between items-center gap-x-4">
                <span className="text-gray-400 font-medium">Arizachi:</span>
                <span className="font-bold break-words">{submission.applicant_name}</span>
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
                  <Button onClick={() => setIsScoreModalOpen(false)} className="rounded-xl">
                    Bekor qilish
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isSubmittingScore || isUpdatingScore}
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

      <Modal
        title="Fayl ko'rinishi"
        open={!!previewFileUrl}
        onCancel={handleClosePreview}
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            {previewFileUrl && (
              <a
                href={previewFileUrl.startsWith("blob:") ? previewFileUrl : getProxyUrl(previewFileUrl)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button icon={<ExportOutlined />} className="max-sm:!h-11">Yangi tabda oching</Button>
              </a>
            )}
            <Button onClick={handleClosePreview} className="max-sm:!h-11">Yopish</Button>
          </div>
        }
        width={isMobile ? "100%" : 800}
        className="admin-responsive-modal"
        destroyOnClose
        zIndex={1100}
        styles={{ wrapper: { zIndex: 1100 } }}
      >
        {previewFileUrl && (
          <div className="relative flex justify-center overflow-auto" style={{ minHeight: isMobile ? 240 : 300 }}>
            {previewLoading && (
              <div
                className="absolute inset-0 flex flex-col justify-center items-center rounded z-10"
                style={{ background: theme === "dark" ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.8)" }}
              >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7367f0] mb-4" />
                <Text style={{ color: theme === "dark" ? "#9ca3af" : "#6b7280" }}>Fayl yuklanmoqda...</Text>
              </div>
            )}
            {renderFilePreview(
              previewFileUrl.startsWith("blob:") ? previewFileUrl : getProxyUrl(previewFileUrl),
              previewFileUrl,
              previewFileName
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
