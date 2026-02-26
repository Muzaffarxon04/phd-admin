"use client";

import { use } from "react";
import {
  Card,
  Spin,
  Tag,
  Button,
  Typography,
  Row,
  Col,
  App,
  Alert,
  List,
  Result,
  Steps,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Radio,
  Checkbox,
  InputNumber,
  Upload
} from "antd";
import dayjs from "dayjs";
// import type { Dayjs } from "dayjs";
import {
  useGet,
  usePost,
  useUploadPatch,
  useDownload,
  // usePatch, 
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
  EyeOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  TeamOutlined,
  SendOutlined,
  FileTextOutlined
} from "@ant-design/icons";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const { Title, Text } = Typography;
import { useState, useEffect } from "react";
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
  reviewed_by_name?: string;
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

interface ApplicationField {
  id: number;
  label: string;
  field_type: "TEXT" | "TEXTAREA" | "EMAIL" | "PHONE" | "NUMBER" | "DATE" | "SELECT" | "RADIO" | "CHECKBOX" | "FILE" | "URL";
  help_text?: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  min_length?: number | null;
  max_length?: number | null;
  min_value?: string | null;
  max_value?: string | null;
  allowed_file_types?: string[];
  max_file_size?: number | null;
  order?: number;
}

interface Application {
  id: number;
  title: string;
  description: string;
  fields: ApplicationField[];
  // Add other fields if necessary based on your API usage
}

function formatAnswerValue(val: unknown): string {
  if (val == null) return "—";
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  if (Array.isArray(val)) return val.join(", ");
  if (typeof val === "object") return JSON.stringify(val) || "—";
  return String(val);
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
  const { message } = App.useApp();

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
      const errData = (error as { data?: { message?: string; error?: string } })?.data;
      const errMsg = errData?.message || errData?.error || (error as Error).message;
      const text = typeof errMsg === "string" && errMsg.toLowerCase().includes("missing required fields")
        ? "To'ldirilishi shart bo'lgan maydonlar yetishmayapti yoki ariza allaqachon topshirilgan."
        : errMsg || "Topshirishda xatolik";
      message.error({ content: text, duration: 4 });
    },
  });

  // Fetch application details to get field definitions (options, types, etc.)
  const { data: applicationData } = useGet<{ data: Application }>(
    submission?.application?.id ? `/applicant/applications/${submission.application.id}/` : "",
    { enabled: !!submission?.application?.id }
  );
  const applicationFields = applicationData?.data?.fields || [];

  const { mutate: updateSubmission, isPending: isUpdating } = useUploadPatch(
    `/applicant/submissions/${id}/update/`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [`/applicant/my-submissions/${id}/`] });
        message.success("Ariza muvaffaqiyatli yangilandi!");
        setIsEditModalOpen(false);
      },
      onError: (error) => {
        message.error(error.message || "Yangilashda xatolik");
      },
    }
  );

  const { mutate: downloadGuvohnoma, isPending: isDownloading } = useDownload(
    `/pdf/submission-marks/${submissionId}/generate-guvohnoma/`,
    `guvohnoma-${submission?.submission_number || "certificate"}.pdf`,
    {
      onSuccess: () => {
        message.success("Guvohnoma yuklanmoqda...");
      },
      onError: (error) => {
        message.error(error.message || "Guvohnomani yuklashda xatolik");
      },
    }
  );

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [editForm] = Form.useForm();

  const getFilePreviewUrl = (path: string) =>
    path.startsWith("http") ? path : (BASE_URL?.replace("/api/v1", "") || "") + (path.startsWith("/") ? path : `/${path}`);

  const handleOpenPreview = (path: string) => {
    const p = typeof path === "string" ? path.trim() : "";
    if (!p || p === "/") return;
    const url = getFilePreviewUrl(p);
    setPreviewFileName("");
    setPreviewFileUrl(url);
    setPreviewLoading(true);
  };

  const handleOpenFilePreview = (file: { originFileObj?: File; url?: string; name?: string; response?: { url?: string } }) => {
    if (file.originFileObj) {
      const blobUrl = URL.createObjectURL(file.originFileObj);
      setPreviewFileName(file.name || "");
      setPreviewFileUrl(blobUrl);
      setPreviewLoading(true);
    } else {
      const url = file.url || file.response?.url;
      if (url) {
        const fullUrl = url.startsWith("http") ? url : getFilePreviewUrl(url);
        setPreviewFileName(file.name || "");
        setPreviewFileUrl(fullUrl);
        setPreviewLoading(true);
      }
    }
  };

  const getFilenameFromPath = (path: string) => path.split("/").pop()?.split("?")[0] || "file";

  const handleFileDownload = (file: { originFileObj?: File; url?: string; name?: string }) => {
    if (file.originFileObj) {
      const blobUrl = URL.createObjectURL(file.originFileObj);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = file.name || "file";
      a.click();
      URL.revokeObjectURL(blobUrl);
    } else if (file.url) {
      const url = file.url.startsWith("http") ? file.url : getFilePreviewUrl(file.url);
      handleDownloadByUrl(url, getFilenameFromPath(url));
    }
  };

  const handleDownloadByPath = async (path: string) => {
    const url = getFilePreviewUrl(path);
    const filename = getFilenameFromPath(path);
    await handleDownloadByUrl(url, filename || "file");
  };

  const getFilenameFromContentDisposition = (header: string | null): string | null => {
    if (!header) return null;
    const match = /filename\*?=(?:UTF-8'')?"?([^";\n]+)"?/i.exec(header);
    return match ? decodeURIComponent(match[1].trim()) : null;
  };

  const handleDownloadByUrl = async (url: string, filename: string) => {
    try {
      const res = await fetch(getProxyUrl(url));
      if (!res.ok) throw new Error("Faylni yuklab olib bo'lmadi");
      const blob = await res.blob();
      const finalName = getFilenameFromContentDisposition(res.headers.get("Content-Disposition")) || filename;
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = finalName;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      const a = document.createElement("a");
      a.href = getProxyUrl(url);
      a.download = filename;
      a.target = "_blank";
      a.click();
    }
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

  const handleEditClick = () => {
    if (!submission || !applicationFields.length) return;

    // Prefill form
    const initialValues: Record<string, unknown> = {};
    submission.answers.forEach((ans) => {
      const fieldDef = applicationFields.find((f) => f.id === ans.field);
      if (fieldDef) {
        if (fieldDef.field_type === "FILE" && (ans.answer || ans.answer_text)) {
          const path = typeof ans.answer === "string" ? ans.answer : typeof ans.answer_text === "string" ? ans.answer_text : "";
          const fileUrl = path ? getFilePreviewUrl(path) : "";
          initialValues[`field_${ans.field}`] = [{
            uid: `file-${ans.field}`,
            name: "Fayl yuklangan",
            status: "done",
            url: fileUrl,
          }];
        } else if (fieldDef.field_type === "DATE") {
          const dateVal = typeof ans.answer === "string" ? ans.answer : typeof ans.answer_text === "string" ? ans.answer_text : null;
          const parsed = dateVal ? dayjs(dateVal) : null;
          initialValues[`field_${ans.field}`] = parsed?.isValid?.() ? parsed : undefined;
        } else if (fieldDef.field_type === "CHECKBOX" && ans.answer) {
          // Assuming checkbox answer is stored as comma separated string or similar
          const val = ans.answer;
          initialValues[`field_${ans.field}`] = typeof val === "string"
            ? val.split(",").map((s: string) => s.trim())
            : Array.isArray(val)
              ? val
              : [];
        } else if (fieldDef.field_type === "SELECT" || fieldDef.field_type === "RADIO") {
          const val = ans.answer_text ?? ans.answer;
          initialValues[`field_${ans.field}`] =
            typeof val === "string" || typeof val === "number" ? val : Array.isArray(val) ? val : "";
        } else {
          const val = ans.answer ?? ans.answer_text;
          initialValues[`field_${ans.field}`] =
            typeof val === "string" || typeof val === "number" ? val : Array.isArray(val) ? val : "";
        }
      }
    });

    editForm.setFieldsValue(initialValues);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (values: Record<string, unknown>) => {
    const formData = new FormData();
    const answers: Array<{ field_id: number; answer_text: string }> = [];

    applicationFields.forEach((field) => {
      const value = values[`field_${field.id}`];

      if (field.field_type === "FILE") {
        if (value && Array.isArray(value) && value.length > 0) {
          // If new file uploaded (originFileObj exists)
          if (value[0].originFileObj) {
            formData.append(`field_${field.id}_file`, value[0].originFileObj);
          }
        }

        // We push empty string for file answer text or keep it as is if not updating
        answers.push({
          field_id: field.id,
          answer_text: "",
        });
        return;
      }

      let answerText = "";
      if (value !== undefined && value !== null) {
        if (field.field_type === "DATE" && dayjs.isDayjs(value)) {
          answerText = value.format("YYYY-MM-DD");
        } else if (Array.isArray(value)) {
          answerText = value.join(", ");
        } else {
          answerText = String(value);
        }
      }

      if (answerText) {
        answers.push({
          field_id: field.id,
          answer_text: answerText,
        });
      }
    });

    formData.append("answers", JSON.stringify(answers));
    updateSubmission(formData);
  };

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
              Arizalar ro&apos;yxatiga qaytish
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentStatusIndex = statusTimeline.findIndex(step => step.status === submission.status);
  const activeStep = currentStatusIndex >= 0 ? currentStatusIndex : 0;


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
                        <Text style={textStyle}>So&apos;nggi o&apos;zgarish</Text>
                        <Text style={{ color: theme === 'dark' ? '#e5e7eb' : '#111827' }}>{formatDate(submission.updated_at)}</Text>
                      </div>
                    )}
                    {submission.reviewed_by_name && (
                      <div className="flex items-center justify-between border-b pb-2 last:border-0" style={{ borderColor: theme === 'dark' ? '#374151' : '#f3f4f6' }}>
                        <Text style={textStyle}>Ko&apos;rib chiqdi</Text>
                        <Text style={{ color: theme === 'dark' ? '#e5e7eb' : '#111827' }}>{submission.reviewed_by_name}</Text>
                      </div>
                    )}
                  </div>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card className="h-full border-0" style={cardStyle}>
                  <div className="flex items-center justify-between mb-6">
                    <Title level={5} style={titleStyle}>To&apos;lov</Title>
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
                className="!mb-6 rounded-lg border-0 "
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
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: '16px', ...titleStyle }}>Javoblar</span>
                    {submission.status !== "APPROVED" && (
                      <Button
                        size="large"
                        type="primary"
                        className="h-[40px] rounded-lg"
                        onClick={handleEditClick}
                      >
                        Tahrirlash
                      </Button>
                    )}
                  </div>
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
                            {answer.field_type === "FILE" ? (
                              <button
                                type="button"
                                onClick={() => {
                                  const path = typeof answer.answer === "string" ? answer.answer : typeof answer.answer_text === "string" ? answer.answer_text : "";
                                  if (path) handleOpenPreview(path);
                                }}
                                className="text-blue-500 hover:underline bg-transparent border-0 cursor-pointer p-0"
                              >
                                Faylni ko&apos;rish
                              </button>
                            ) : (
                              formatAnswerValue(
                                answer.field_type === "SELECT" || answer.field_type === "RADIO"
                                  ? answer.answer_text
                                  : answer.answer ?? answer.answer_text
                              )
                            )}
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
                      <Text style={textStyle}>Hujjatlar yo&apos;q</Text>
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

                      </>
                    )}

                    {(submission.status === "SUBMITTED" || submission.status === "UNDER_REVIEW") && (
                      <div className="text-center py-4">
                        <Text type="secondary">Arizangiz ko&apos;rib chiqilmoqda</Text>
                      </div>
                    )}

                    {submission.status === "APPROVED" && (
                      <div className="text-center py-4">
                        <Text type="success" strong className="block mb-3">Arizangiz tasdiqlandi</Text>
                        <Button
                          type="primary"
                          icon={<DownloadOutlined />}
                          onClick={() => downloadGuvohnoma()}
                          loading={isDownloading}
                          block
                          className="h-[40px] rounded-lg shadow-none bg-green-600 hover:bg-green-500"
                        >
                          Guvohnomani yuklash
                        </Button>
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
                          onClick={() => submitSubmission({})}
                          loading={isSubmitting}
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
      <Modal
        title="Arizani tahrirlash"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        width={800}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
          {applicationFields
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((field) => (
              <Form.Item
                key={field.id}
                name={`field_${field.id}`}
                label={field.label}
                rules={[{ required: field.required, message: "To&apos;ldirish majburiy" }]}
                valuePropName={field.field_type === "FILE" ? "fileList" : "value"}
                getValueFromEvent={field.field_type === "FILE" ? (e) => {
                  if (Array.isArray(e)) {
                    return e;
                  }
                  return e?.fileList;
                } : undefined}
                getValueProps={field.field_type === "DATE" ? (value: unknown) => {
                  const d = dayjs.isDayjs(value) ? value : (typeof value === "string" ? dayjs(value) : null);
                  return { value: d?.isValid?.() ? d : undefined };
                } : undefined}
              >
                {(() => {
                  switch (field.field_type) {
                    case "TEXT": return <Input />;
                    case "TEXTAREA": return <Input.TextArea rows={4} />;
                    case "NUMBER": return <InputNumber className="w-full" />;
                    case "DATE": return <DatePicker className="w-full" format="YYYY-MM-DD" />;
                    case "SELECT":
                      return (
                        <Select>
                          {(field.options || []).map((opt: string) => (
                            <Select.Option key={opt} value={opt}>{opt}</Select.Option>
                          ))}
                        </Select>
                      );
                    case "RADIO":
                      return (
                        <Radio.Group>
                          {(field.options || []).map((opt: string) => (
                            <Radio key={opt} value={opt}>{opt}</Radio>
                          ))}
                        </Radio.Group>
                      );
                    case "CHECKBOX":
                      return (
                        <Checkbox.Group>
                          <Row>
                            {(field.options || []).map((opt: string) => (
                              <Col span={24} key={opt}><Checkbox value={opt}>{opt}</Checkbox></Col>
                            ))}
                          </Row>
                        </Checkbox.Group>
                      );
                    case "FILE": {
                      const fileAnswer = submission?.answers?.find((a: { field: number }) => a.field === field.id);
                      const filePath = fileAnswer ? (typeof fileAnswer.answer === "string" ? fileAnswer.answer : typeof fileAnswer.answer_text === "string" ? fileAnswer.answer_text : "") : "";
                      return (
                        <Upload
                          maxCount={1}
                          beforeUpload={() => false}
                          listType="text"
                          showUploadList={{ showRemoveIcon: true }}
                          itemRender={(_, file) => {
                            const hasFile = !!file.originFileObj || !!file.url;
                            const onPreview = () => {
                              if (file.originFileObj) {
                                handleOpenFilePreview(file);
                              } else if (filePath) {
                                handleOpenPreview(filePath);
                              } else if (file.url) {
                                handleOpenPreview(file.url);
                              }
                            };
                            const onDownload = () => {
                              if (file.originFileObj) {
                                handleFileDownload(file);
                              } else if (filePath) {
                                handleDownloadByPath(filePath);
                              } else if (file.url) {
                                handleFileDownload(file);
                              }
                            };
                            return (
                              <div
                                className="flex items-center gap-2 rounded-lg border p-2 mt-1"
                                style={{
                                  background: theme === "dark" ? "rgb(40, 48, 70)" : "#f9fafb",
                                  borderColor: theme === "dark" ? "rgb(59, 66, 83)" : "#e5e7eb",
                                }}
                              >
                                {hasFile && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => onDownload()}
                                      className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5"
                                      title="Yuklab olish"
                                    >
                                      <DownloadOutlined style={{ color: "#7367f0", fontSize: 16 }} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        onPreview();
                                      }}
                                      className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5"
                                      title="Ko'rish"
                                    >
                                      <EyeOutlined style={{ color: "#7367f0", fontSize: 16 }} />
                                    </button>
                                  </>
                                )}
                                <span className="flex-1 truncate text-sm" style={{ color: theme === "dark" ? "#9ca3af" : "#6b7280" }}>
                                  {file.name || "Fayl yuklangan"}
                                </span>
                              </div>
                            );
                          }}
                        >
                          <Button icon={<UploadOutlined />}>Fayl yuklash</Button>
                        </Upload>
                      );
                    }
                    default: return <Input />;
                  }
                })()}
              </Form.Item>
            ))}
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsEditModalOpen(false)}>Bekor qilish</Button>
            <Button type="primary" htmlType="submit" loading={isUpdating}>Saqlash</Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title="Fayl ko&apos;rinishi"
        open={!!previewFileUrl}
        onCancel={handleClosePreview}
        footer={<Button onClick={handleClosePreview}>Yopish</Button>}
        width={800}
        destroyOnClose
        zIndex={1100}
        styles={{ wrapper: { zIndex: 1100 } }}
      >
        {previewFileUrl && (
          <div className="relative flex justify-center" style={{ minHeight: 300 }}>
            {previewLoading && (
              <div className="absolute inset-0 flex flex-col justify-center items-center bg-white/80 dark:bg-gray-900/80 rounded z-10">
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