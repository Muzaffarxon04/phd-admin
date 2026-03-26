"use client";

import { use, useState, useEffect } from "react";
import { Card, Spin, Tag, Button, Descriptions, Modal, Form, Input, InputNumber, Select, Switch, Space, App, Row, Col, DatePicker, Radio, Checkbox, Upload } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useGet, usePost } from "@/lib/hooks";
import { apiRequest, apiUpload } from "@/lib/hooks/useUniversalFetch";
import { useThemeStore } from "@/lib/stores/themeStore";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDateTime, getApplicationStatusLabel, getApplicationStatusColor, getExaminerRoleLabel, getFieldTypeLabel } from "@/lib/utils";
import { PlusOutlined, DeleteOutlined, EditOutlined, MinusCircleOutlined, InboxOutlined, RollbackOutlined, HolderOutlined, UploadOutlined, FileTextOutlined } from "@ant-design/icons";
import type { Speciality as SpecialityType, Examiner as ExaminerType } from "@/types";

interface ApplicationField {
  id: number;
  label: string;
  field_type: "TEXT" | "TEXTAREA" | "EMAIL" | "PHONE" | "NUMBER" | "DATE" | "SELECT" | "RADIO" | "CHECKBOX" | "FILE" | "URL";
  help_text?: string;
  placeholder?: string;
  required?: boolean;
  options?: unknown;
  min_length?: number;
  max_length?: number;
  min_value?: string;
  max_value?: string;
  allowed_file_types?: string[];
  max_file_size?: number;
  order?: number;
}

interface Examiner {
  id: number;
  full_name: string | null;
  title: string;
  department: string;
  academic_degree: string;
  position: string;
  role: "CHAIRMAN" | "PRE_CHAIRMAN" | "SECRETARY" | "MEMBER";
  role_display: string;
}

const API_BASE = (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "")) || "https://api-doktarant.tashmeduni.uz";

interface Speciality {
  id: number;
  name: string;
  code: string;
  description: string;
  examiners: Examiner[];
  comment?: string;
  file?: string | null;
  file_speciality_id?: number;
}

interface Application {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  exam_date?: string | null;
  status: "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
  requires_oneid_verification: boolean;
  max_submissions?: number;
  application_fee?: string;
  instructions?: string;
  required_documents: string[];
  total_submissions: number;
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  fields?: ApplicationField[];
  specialities: Speciality[];
}

interface CreateFieldData {
  label: string;
  field_type: "TEXT" | "TEXTAREA" | "EMAIL" | "PHONE" | "NUMBER" | "DATE" | "SELECT" | "RADIO" | "CHECKBOX" | "FILE" | "URL";
  help_text?: string;
  placeholder?: string;
  required?: boolean;
  options?: unknown;
  min_length?: number;
  max_length?: number;
  min_value?: string;
  max_value?: string;
  allowed_file_types?: string[];
  max_file_size?: number;
  order?: number;
}

interface ApplicationSpecialityForm {
  speciality_id: string | number;
  examiner_ids: Array<{
    examiner_id: string | number;
    role: "CHAIRMAN" | "PRE_CHAIRMAN" | "SECRETARY" | "MEMBER";
  }>;
  /** Izoh – har bir mutaxassislik uchun alohida */
  comment?: string;
  /** FormData da `file_spec_${speciality_id}` kaliti bilan yuboriladi */
  file?: File;
  /** API dan kelgan mavjud fayl URL (modalda default ko'rsatish uchun) */
  existing_file_url?: string | null;
}

const renderFieldInput = (field: ApplicationField) => {
  const options = Array.isArray(field.options) ? field.options : [];

  switch (field.field_type) {
    case "TEXT":
      return (
        <Input
          placeholder={field.placeholder || "Matn kiriting"}
          readOnly
          className="w-full"
        />
      );

    case "TEXTAREA":
      return (
        <Input.TextArea
          placeholder={field.placeholder || "Matn kiriting"}
          rows={4}
          readOnly
          className="w-full"
        />
      );

    case "EMAIL":
      return (
        <Input
          type="email"
          placeholder={field.placeholder || "email@example.com"}
          readOnly
          className="w-full"
        />
      );

    case "PHONE":
      return (
        <Input
          type="tel"
          placeholder={field.placeholder || "+998901234567"}

          className="w-full"
        />
      );

    case "NUMBER":
      return (
        <InputNumber
          placeholder={field.placeholder || "Raqam kiriting"}

          className="w-full"
          min={field.min_value ? parseFloat(field.min_value) : undefined}
          max={field.max_value ? parseFloat(field.max_value) : undefined}
        />
      );

    case "DATE":
      return (
        <DatePicker
          placeholder={field.placeholder || "Sanani tanlang"}

          className="w-full"
        />
      );

    case "SELECT":
      return (
        <Select
          placeholder={field.placeholder || "Tanlang"}

          className="w-full"
          options={options.map((opt: string) => ({ label: opt, value: opt }))}
        />
      );

    case "RADIO":
      return (
        <Radio.Group >
          {options.map((opt: string, index: number) => (
            <Radio key={index} value={opt}>
              {opt}
            </Radio>
          ))}
        </Radio.Group>
      );

    case "CHECKBOX":
      return (
        <Checkbox.Group >
          {options.map((opt: string, index: number) => (
            <Checkbox key={index} value={opt}>
              {opt}
            </Checkbox>
          ))}
        </Checkbox.Group>
      );

    case "FILE":
      return (
        <Upload >
          <Button >Fayl yuklash</Button>
        </Upload>
      );

    case "URL":
      return (
        <Input
          type="url"
          placeholder={field.placeholder || "https://example.com"}

          className="w-full"
        />
      );

    default:
      return (
        <Input
          placeholder={field.placeholder || "Qiymat kiriting"}

          className="w-full"
        />
      );
  }
};

export default function AdminApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { theme } = useThemeStore();
  const queryClient = useQueryClient();
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [isSpecialitiesModalOpen, setIsSpecialitiesModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<ApplicationField | null>(null);
  const [form] = Form.useForm();
  const [applicationForm] = Form.useForm();
  const [specialitiesForm] = Form.useForm();
  const { message, modal } = App.useApp();
  const fieldType = Form.useWatch("field_type", form);
  const watchedSpecialities = Form.useWatch("specialities", specialitiesForm) as ApplicationSpecialityForm[] | undefined;

  const [orderedFields, setOrderedFields] = useState<ApplicationField[]>([]);
  const [dragFieldId, setDragFieldId] = useState<number | null>(null);
  const [dragOverFieldId, setDragOverFieldId] = useState<number | null>(null);

  const { data: applicationData, isLoading } = useGet<{ data: Application }>(`/admin/application/${id}/`);
  const application = applicationData?.data;

  const [isUpdatingApplication, setIsUpdatingApplication] = useState(false);

  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);

  const getProxyUrl = (url: string) => `/api/proxy-file?url=${encodeURIComponent(url)}`;

  const getFileExt = (url: string) => {
    const pathPart = url.split("?")[0];
    return pathPart.split(".").pop()?.toLowerCase() || "";
  };

  const handleOpenPreview = (path: string) => {
    const p = typeof path === "string" ? path.trim() : "";
    if (!p || p === "/") return;
    const url = path.startsWith("http") ? path : API_BASE + (path.startsWith("/") ? path : `/${path}`);
    setPreviewFileName(path.split("/").pop() || "");
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
      return (
        // eslint-disable-next-line @next/next/no-img-element -- Dynamic file preview
        <img src={displayUrl} alt="Preview" className="max-w-full max-h-[70vh] object-contain" onLoad={handlePreviewLoad} />
      );
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

  const invalidateApplication = () => {
    queryClient.invalidateQueries({ queryKey: [`/admin/application/${id}/`] });
    queryClient.refetchQueries({ queryKey: [`/admin/application/${id}/`] });
    queryClient.invalidateQueries({ queryKey: ["/admin/application/"] });
  };

  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [unarchivingId, setUnarchivingId] = useState<string | null>(null);

  const { mutate: archiveApplication } = useMutation({
    mutationFn: (appId: string) =>
      apiRequest(`/admin/application/${appId}/archive/`, { method: "POST" }),
    onMutate: (appId) => setArchivingId(appId),
    onSuccess: () => {
      message.success("Ariza arxivga olindi");
      invalidateApplication();
    },
    onError: (error: Error) => {
      message.error(error.message || "Arxivlashda xatolik");
    },
    onSettled: () => setArchivingId(null),
  });

  const { mutate: unarchiveApplication } = useMutation({
    mutationFn: (appId: string) =>
      apiRequest(`/admin/application/${appId}/unarchive/`, { method: "POST" }),
    onMutate: (appId) => setUnarchivingId(appId),
    onSuccess: () => {
      message.success("Ariza arxivdan chiqarildi");
      invalidateApplication();
    },
    onError: (error: Error) => {
      message.error(error.message || "Arxivdan chiqarishda xatolik");
    },
    onSettled: () => setUnarchivingId(null),
  });

  const { data: specialitiesData } = useGet<{ data: { data: SpecialityType[] } }>("/speciality/list/?page_size=1000");
  const { data: examinersData } = useGet<{ data: { data: ExaminerType[] } }>("/examiner/list/?is_active=true&page_size=1000");
  const specialitiesList = specialitiesData?.data?.data || [];
  const examinersList = examinersData?.data?.data || [];

  const { mutate: createField, isPending: isCreatingField } = usePost<{ data: ApplicationField }, CreateFieldData>(
    `/admin/application/${id}/fields/create/`,
    {
      onSuccess: () => {
        message.success("Maydon muvaffaqiyatli yaratildi!");
        setIsFieldModalOpen(false);
        form.resetFields();
        queryClient.invalidateQueries({ queryKey: [`/admin/application/${id}/`] });
      },
      onError: (error) => {
        message.error(error.message || "Maydon yaratishda xatolik");
      },
    }
  );

  const [isUpdatingField, setIsUpdatingField] = useState(false);

  const handleCreateField = (values: CreateFieldData & {
    allowed_file_types_input?: string;
    min_value?: number | null;
    max_value?: number | null;
    min_length?: number | null;
    max_length?: number | null;
    options_list?: Array<{ value: string }>;
  }) => {
    const { allowed_file_types_input, options_list, ...restValues } = values;
    const fieldData: CreateFieldData = {
      ...restValues,
    };

    // If field_type is FILE, process allowed_file_types
    if (values.field_type === "FILE") {
      if (allowed_file_types_input) {
        // Split by comma and trim each item
        fieldData.allowed_file_types = allowed_file_types_input
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
      } else {
        // Default empty array for FILE type
        fieldData.allowed_file_types = [];
      }
    }

    // If field_type is SELECT, RADIO, or CHECKBOX, process options
    if (values.field_type === "SELECT" || values.field_type === "RADIO" || values.field_type === "CHECKBOX") {
      if (options_list && options_list.length > 0) {
        // Extract values from options_list array
        fieldData.options = options_list
          .map((item) => item.value)
          .filter((value) => value && value.trim().length > 0);
      } else {
        fieldData.options = [];
      }
    }

    // If field_type is NUMBER, process min_value and max_value
    if (values.field_type === "NUMBER") {
      const minVal = values.min_value;
      const maxVal = values.max_value;
      fieldData.min_value = minVal !== null && minVal !== undefined ? String(minVal) : undefined;
      fieldData.max_value = maxVal !== null && maxVal !== undefined ? String(maxVal) : undefined;
    }

    // Process min_length and max_length for text-based fields
    if (values.min_length !== undefined && values.min_length !== null) {
      fieldData.min_length = values.min_length;
    }
    if (values.max_length !== undefined && values.max_length !== null) {
      fieldData.max_length = values.max_length;
    }

    if (editingField) {
      console.log(fieldData);
      handleUpdateField(editingField.id, fieldData);
    } else {
      createField(fieldData);
    }
  };

  const handleUpdateField = async (fieldId: number, fieldData: Partial<CreateFieldData>) => {
    setIsUpdatingField(true);
    try {
      await apiRequest(`/admin/application/${id}/fields/${fieldId}/update/`, {
        method: "PUT",
        body: JSON.stringify(fieldData),
      });
      message.success("Maydon muvaffaqiyatli yangilandi!");
      setIsFieldModalOpen(false);
      setEditingField(null);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: [`/admin/application/${id}/`] });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Maydon yangilashda xatolik";
      message.error(errorMessage);
    } finally {
      setIsUpdatingField(false);
    }
  };

  useEffect(() => {
    if (application?.fields) {
      const sorted = [...application.fields].sort((a, b) => {
        const orderA = a.order ?? 0;
        const orderB = b.order ?? 0;
        if (orderA !== orderB) return orderA - orderB;
        return a.id - b.id;
      });
      setOrderedFields(sorted);
    } else {
      setOrderedFields([]);
    }
  }, [application?.fields]);

  const handleReorderFields = async (nextFields: ApplicationField[]) => {
    setOrderedFields(nextFields);

    try {
      await Promise.all(
        nextFields.map((field, index) =>
          apiRequest(`/admin/application/${id}/fields/${field.id}/update/`, {
            method: "PUT",
            body: JSON.stringify({ order: index + 1 }),
          }),
        ),
      );
      message.success("Maydonlar tartibi yangilandi!");
      queryClient.invalidateQueries({ queryKey: [`/admin/application/${id}/`] });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Maydonlar tartibini saqlashda xatolik";
      message.error(errorMessage);
    }
  };

  const handleFieldDrop = async (targetFieldId: number) => {
    if (!orderedFields.length || dragFieldId === null || dragFieldId === targetFieldId) return;

    const currentIndex = orderedFields.findIndex((f) => f.id === dragFieldId);
    const targetIndex = orderedFields.findIndex((f) => f.id === targetFieldId);
    if (currentIndex === -1 || targetIndex === -1) return;

    const updated = [...orderedFields];
    const [moved] = updated.splice(currentIndex, 1);
    updated.splice(targetIndex, 0, moved);

    setDragFieldId(null);
    await handleReorderFields(updated);
  };

  const handleEditField = (field: ApplicationField) => {
    setEditingField(field);
    setIsFieldModalOpen(true);

    // Populate form with field data
    const optionsArray = Array.isArray(field.options)
      ? field.options.map((opt: string) => ({ value: opt }))
      : [];

    form.setFieldsValue({
      label: field.label,
      field_type: field.field_type,
      required: field.required || false,
      placeholder: field.placeholder,
      help_text: field.help_text,
      min_length: field.min_length,
      max_length: field.max_length,
      min_value: field.min_value ? parseFloat(field.min_value) : null,
      max_value: field.max_value ? parseFloat(field.max_value) : null,
      max_file_size: field.max_file_size,
      allowed_file_types_input: field.allowed_file_types?.join(", "),
      options_list: optionsArray.length > 0 ? optionsArray : [{ value: "" }],
      order: field.order,
    });
  };

  const handleDeleteField = async (fieldId: number) => {
    modal.confirm({
      title: "Maydonni ochirish",
      content: "Haqiqatdan ham bu maydonni ochirmoqchimisiz?",
      okText: "Ha, ochirish",
      cancelText: "Bekor qilish",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await apiRequest(`/admin/application/${id}/fields/${fieldId}/delete/`, {
            method: "DELETE",
          });
          message.success("Maydon ochirildi!");
          queryClient.invalidateQueries({ queryKey: [`/admin/application/${id}/`] });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "Maydon ochirishda xatolik";
          message.error(errorMessage);
        }
      },
    });
  };

  const sendApplicationFormData = async (
    overrides: {
      title?: string;
      description?: string;
      start_date?: Dayjs | null;
      end_date?: Dayjs | null;
      exam_date?: Dayjs | null;
      status?: Application["status"];
    },
    successMessage?: string,
  ) => {
    if (!application) return;
    setIsUpdatingApplication(true);
    try {
      const formData = new FormData();

      const start = overrides.start_date ?? (application.start_date ? dayjs(application.start_date) : null);
      const end = overrides.end_date ?? (application.end_date ? dayjs(application.end_date) : null);
      const exam = overrides.exam_date !== undefined
        ? overrides.exam_date
        : (application.exam_date ? dayjs(application.exam_date) : null);

      formData.set("title", overrides.title ?? application.title);
      formData.set("description", overrides.description ?? application.description);
      if (start) {
        formData.set("start_date", start.format("YYYY-MM-DDTHH:mm:ss[Z]"));
      }
      if (end) {
        formData.set("end_date", end.format("YYYY-MM-DDTHH:mm:ss[Z]"));
      }
      if (exam !== null && exam !== undefined) {
        formData.set("exam_date", exam.format("YYYY-MM-DDTHH:mm:ss[Z]"));
      }

      formData.set("status", overrides.status ?? application.status);
      formData.set(
        "requires_oneid_verification",
        String(application.requires_oneid_verification ?? false),
      );

      if (application.application_fee != null) {
        formData.set("application_fee", application.application_fee);
      }
      if (application.instructions) {
        formData.set("instructions", application.instructions);
      }
      if (Array.isArray(application.required_documents) && application.required_documents.length > 0) {
        formData.set("required_documents", JSON.stringify(application.required_documents));
      }
      if (application.max_submissions != null) {
        formData.set("max_submissions", String(application.max_submissions));
      }

      await apiUpload(`/admin/application/${id}/update/`, formData, "PATCH");

      if (successMessage) {
        message.success(successMessage);
      }
      invalidateApplication();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Arizani yangilashda xatolik";
      message.error(errorMessage);
      throw error;
    } finally {
      setIsUpdatingApplication(false);
    }
  };

  const handlePublish = () => {
    if (!application) return;
    void sendApplicationFormData(
      { status: "PUBLISHED" },
      "Ariza e'lon qilindi!",
    );
  };

  const handleClose = () => {
    if (!application) return;
    void sendApplicationFormData(
      { status: "CLOSED" },
      "Ariza yopildi!",
    );
  };

  const handleDeleteApplication = () => {
    modal.confirm({
      title: "Arizani ochirish",
      content: "Haqiqatdan ham bu arizani ochirmoqchimisiz? Bu amalni qaytarib bolmaydi!",
      okText: "Ha, ochirish",
      cancelText: "Bekor qilish",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await apiRequest(`/admin/application/${id}/delete/`, {
            method: "DELETE",
          });
          message.success("Ariza muvaffaqiyatli ochirildi!");
          queryClient.invalidateQueries({ queryKey: ["/admin/application/"] });
          router.push("/admin-panel/applications");
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "Arizani ochirishda xatolik";
          message.error(errorMessage);
        }
      },
    });
  };

  const handleEditApplication = () => {
    if (application) {
      applicationForm.setFieldsValue({
        title: application.title,
        description: application.description,
        start_date: application.start_date ? dayjs(application.start_date) : null,
        end_date: application.end_date ? dayjs(application.end_date) : null,
        exam_date: application.exam_date ? dayjs(application.exam_date) : null,
        status: application.status,
      });
      setIsApplicationModalOpen(true);
    }
  };

  const handleUpdateApplication = async (values: {
    title: string;
    description: string;
    start_date: Dayjs | null;
    end_date: Dayjs | null;
    exam_date?: Dayjs | null;
    status: string;
  }) => {
    if (!application) return;

    try {
      await sendApplicationFormData(
        {
          title: values.title,
          description: values.description,
          start_date: values.start_date,
          end_date: values.end_date,
          exam_date: values.exam_date ?? null,
          status: values.status as Application["status"],
        },
        "Ariza muvaffaqiyatli yangilandi!",
      );
      setIsApplicationModalOpen(false);
      applicationForm.resetFields();
    } catch {
      // xabar sendApplicationFormData ichida ko'rsatiladi
    }
  };

  const handleOpenSpecialitiesModal = () => {
    if (application?.specialities && application.specialities.length > 0) {
      const formValues: ApplicationSpecialityForm[] = application.specialities.map((spec) => {
        const specWithId = spec as { id?: number; speciality_id?: number; speciality?: number };
        const specialityId = specWithId.speciality_id ?? specWithId.speciality ?? spec.id;
        return {
          speciality_id: specialityId,
          examiner_ids: (spec.examiners || []).map((ex) => ({
            examiner_id: ex.id,
            role: ex.role,
          })),
          comment: (spec as Speciality).comment ?? "",
          existing_file_url: (spec as Speciality).file ?? null,
        };
      });
      specialitiesForm.setFieldsValue({ specialities: formValues });
    } else {
      specialitiesForm.setFieldsValue({ specialities: [] });
    }
    setIsSpecialitiesModalOpen(true);
  };

  const handleUpdateSpecialities = async (values: { specialities?: ApplicationSpecialityForm[] }) => {
    const list = values.specialities || [];
    if (list.length === 0) {
      message.warning("Kamida bitta mutaxassislik qo'shishingiz kerak");
      return;
    }
    if (!application) return;

    try {
      const formData = new FormData();

      // Asosiy application maydonlari (mavjud qiymatlar bilan)
      formData.set("title", application.title);
      formData.set("description", application.description);
      formData.set("start_date", application.start_date);
      formData.set("end_date", application.end_date);
      formData.set("status", application.status);
      formData.set("requires_oneid_verification", String(application.requires_oneid_verification ?? false));
      if (application.exam_date != null) {
        formData.set("exam_date", application.exam_date ?? "");
      }
      if (application.application_fee != null) {
        formData.set("application_fee", application.application_fee);
      }
      if (application.instructions) {
        formData.set("instructions", application.instructions);
      }

      // Mutaxassisliklar payload (examiners + comment)
      const specialitiesPayload = list.map(({ speciality_id, examiner_ids, comment }) => ({
        speciality_id,
        examiner_ids: examiner_ids,
        ...(comment && { comment }),
      }));

      // Update endpoint bu ma'lumotni `speciality_examiners` kalitida kutadi
      formData.set("speciality_examiners", JSON.stringify(specialitiesPayload));

      // Fayllar: har bir mutaxassislik uchun alohida kalit (create dagi formatga mos)
      list.forEach((item) => {
        const sid = item.speciality_id;
        const file = item.file;
        if (sid != null && file instanceof File) {
          formData.set(`file_${sid}`, file);
        }
      });

      await apiUpload(`/admin/application/${id}/update/`, formData, "PATCH");

      message.success("Mutaxassisliklar muvaffaqiyatli yangilandi!");
      setIsSpecialitiesModalOpen(false);
      specialitiesForm.resetFields();
      invalidateApplication();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Mutaxassisliklarni yangilashda xatolik";
      message.error(errorMessage);
    }
  };

  // Update form when application data changes
  useEffect(() => {
    if (application && isApplicationModalOpen) {
      applicationForm.setFieldsValue({
        title: application.title,
        description: application.description,
        start_date: application.start_date ? dayjs(application.start_date) : null,
        end_date: application.end_date ? dayjs(application.end_date) : null,
        exam_date: application.exam_date ? dayjs(application.exam_date) : null,
        status: application.status,
      });
    }
  }, [application, isApplicationModalOpen, applicationForm]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!application) {
    return (
      <div>
        <Card>
          <p>Ariza topilmadi</p>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ color: theme === "dark" ? "#ffffff" : "#484650" }}>
   <div className="flex justify-between items-center">
   <div className="flex items-center gap-4">
   <div >
        <Link href="/admin-panel/applications">
          <Button type="link" className={theme === "dark" ? "text-gray-400 hover:text-white" : ""}>← Orqaga</Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold " style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>{application.title}</h1>
   </div>
      <div className=" flex gap-4">
          <Button type="default" icon={<EditOutlined />} onClick={handleEditApplication}>
            Tahrirlash
          </Button>
          {application.status !== "ARCHIVED" ? (
            <Button
              type="default"
              icon={<InboxOutlined />}
              onClick={() => archiveApplication(String(application.id))}
              loading={archivingId === String(application.id)}
            >
              Arxivlash
            </Button>
          ) : (
            <Button
              type="default"
              icon={<RollbackOutlined />}
              onClick={() => unarchiveApplication(String(application.id))}
              loading={unarchivingId === String(application.id)}
            >
              Arxivdan chiqarish
            </Button>
          )}
          {application.status !== "PUBLISHED" && (
            <Button type="primary" onClick={handlePublish}>
              E&apos;lon qilish
            </Button>
          )}
          {application.status === "PUBLISHED" && (
            <Button onClick={handleClose}>Yopish</Button>
          )}
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleDeleteApplication}
          >
            O&apos;chirish
          </Button>
        </div>
   </div>
  <div className="my-6">
 
  <Descriptions
          bordered
          column={1}
          styles={{
            content: {
              color: theme === "dark" ? "#e2e8f0" : "inherit"
            },
            label: {
              color: theme === "dark" ? "#94a3b8" : "inherit",
              background:
                theme === "dark"
                  ? "rgba(255, 255, 255, 0.02)"
                  : "rgba(0, 0, 0, 0.02)"
            }
          }}
        >
          <Descriptions.Item label="ID">{application.id}</Descriptions.Item>
          <Descriptions.Item label="Nomi">{application.title}</Descriptions.Item>
          <Descriptions.Item label="Tavsif">{application.description}</Descriptions.Item>
          <Descriptions.Item label="Holati">
            <Tag color={getApplicationStatusColor(application.status)}>
              {getApplicationStatusLabel(application.status)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="OneID tekshiruvi">
            <Tag color={application.requires_oneid_verification ? "green" : "default"}>
              {application.requires_oneid_verification ? "Talab qilinadi" : "Talab qilinmaydi"}
            </Tag>
          </Descriptions.Item>
          {/* <Descriptions.Item label="Maksimal topshiriqlar">
            {application.max_submissions || "Cheklanmagan"}
          </Descriptions.Item> */}
          <Descriptions.Item label="Boshlanish sanasi">{formatDateTime(application.start_date)}</Descriptions.Item>
          <Descriptions.Item label="Tugash sanasi">{formatDateTime(application.end_date)}</Descriptions.Item>
          <Descriptions.Item label="Imtihon sanasi">
            {application.exam_date ? formatDateTime(application.exam_date) : "Kiritilmagan"}
          </Descriptions.Item>
          <Descriptions.Item label="Ariza to&apos;lovi">
            {application.application_fee ? `${application.application_fee} UZS` : "Bepul"}
          </Descriptions.Item>
          <Descriptions.Item label="Ko&apos;rsatmalar">
            {application.instructions || "Kiritilmagan"}
          </Descriptions.Item>
          <Descriptions.Item label="Majburiy hujjatlar">
            {application.required_documents && application.required_documents.length > 0
              ? application.required_documents.join(", ")
              : "Kiritilmagan"}
          </Descriptions.Item>
          <Descriptions.Item label="Jami arizalar">{application.total_submissions}</Descriptions.Item>
          <Descriptions.Item label="Yaratgan">{application.created_by_name}</Descriptions.Item>
        <Descriptions.Item label="Yaratilgan sana">{formatDateTime(application.created_at)}</Descriptions.Item>
           {/*  <Descriptions.Item label="Yangilangan sana">{formatDateTime(application.updated_at)}</Descriptions.Item> */}
        </Descriptions>

  </div>

  <div className="space-y-4 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold" style={{ color: theme === "dark" ? "#e2e8f0" : "inherit" }}>
                    Mutaxassisliklar va Imtihonchilar
                  </span>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={handleOpenSpecialitiesModal}
                    className={theme === "dark" ? "bg-[#7367f0]/20 text-[#7367f0] border-0 hover:bg-[#7367f0] hover:text-white" : ""}
                  >
                    Qo&apos;shish / Tahrirlash
                  </Button>
                </div>
                  {application.specialities && application.specialities.length > 0 ? (
                    <div className="space-y-4">
                      {application.specialities.map((speciality) => (
                        <Card
                          key={speciality.id}
                          title={
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{speciality.code} - {speciality.name}</span>
                              {speciality.description && (
                                <p className="text-sm mt-1" style={{ color: theme === "dark" ? "#94a3b8" : "#6b7280", fontWeight: "normal" }}>
                                  {speciality.description}
                                </p>
                              )}
                            </div>
                          }
                          style={{
                            background: theme === "dark" ? "rgba(255, 255, 255, 0.02)" : "#ffffff",
                            borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "#e5e7eb",
                          }}
                        >
                          {speciality.examiners && speciality.examiners.length > 0 ? (
                            <div className="space-y-3!">
                              <h5 className="font-semibold mb-3" style={{ color: theme === "dark" ? "#e2e8f0" : "inherit" }}>Imtihonchilar:</h5>
                              {speciality.examiners.map((examiner) => (
                                <Card
                                  key={examiner.id}
                                  size="small"
                                  style={{
                                    background: theme === "dark" ? "rgba(255, 255, 255, 0.02)" : "#f9fafb",
                                    borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "#e5e7eb",
                                  }}
                                >
                                  <Descriptions column={1} size="small" bordered>
                                    <Descriptions.Item label="Ism">
                                      {examiner.full_name || "Noma&apos;lum"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Rol">
                                      <Tag color={examiner.role === "CHAIRMAN" ? "gold" : examiner.role === "PRE_CHAIRMAN" ? "orange" : examiner.role === "SECRETARY" ? "blue" : "green"}>
                                        {getExaminerRoleLabel(examiner.role)}
                                      </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Unvon">
                                      {examiner.title || "Kiritilmagan"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Kafedra">
                                      {examiner.department || "Kiritilmagan"}
                                    </Descriptions.Item>
                                    {!!examiner.academic_degree && (
                                      <Descriptions.Item label="Ilmiy daraja">
                                        {examiner.academic_degree}
                                      </Descriptions.Item>
                                    )}
                                    {!!examiner.position && (
                                      <Descriptions.Item label="Lavozim">
                                        {examiner.position}
                                      </Descriptions.Item>
                                    )}
                                  </Descriptions>
                                </Card>
                              ))}
                              
                            </div>
                          ) : (
                            <div className="text-center py-4" style={{ color: theme === "dark" ? "#94a3b8" : "#6b7280" }}>
                              Imtihonchilar tayinlanmagan
                            </div>
                          )}
                          {(speciality.comment || speciality.file) && (
                            <div className="mt-4 pt-3 border-t" style={{ borderColor: theme === "dark" ? "rgba(255,255,255,0.06)" : "#e5e7eb" }}>
                              {speciality.comment && (
                                <div className="mb-2">
                                  <span className="font-medium text-sm" style={{ color: theme === "dark" ? "#94a3b8" : "#6b7280" }}>Izoh: </span>
                                  <span className="text-sm" style={{ color: theme === "dark" ? "#e2e8f0" : "#374151" }}>{speciality.comment}</span>
                                </div>
                              )}
                              {speciality.file && (
                                <div>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenPreview(speciality.file!)}
                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#7367f0] hover:underline bg-transparent border-0 cursor-pointer p-0"
                                  >
                                    <FileTextOutlined />
                                    Ko&apos;rish
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8" style={{ color: theme === "dark" ? "#94a3b8" : "#6b7280" }}>
                      Mutaxassisliklar mavjud emas
                    </div>
                  )}
                </div>

       

      <Card
        style={{
          background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
          border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid #f0f0f0",
        }}
      >
   
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-lg font-semibold">Jami maydonlar: {application.fields?.length || 0}</span>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setEditingField(null);
                        form.resetFields();
                        form.setFieldsValue({ options_list: [{ value: "" }] });
                        setIsFieldModalOpen(true);
                      }}
                    >
                      Maydon qo&apos;shish
                    </Button>
                  </div>
              <div>
              {orderedFields && orderedFields.length > 0 ? (
                    <div className="space-y-2!">
                      {orderedFields.map((field, index) => (
                          <Card
                            key={field.id + "-" + index}
                            draggable
                            onDragStart={() => setDragFieldId(field.id)}
                            onDragOver={(e) => {
                              e.preventDefault();
                              if (dragOverFieldId !== field.id) {
                                setDragOverFieldId(field.id);
                              }
                            }}
                            onDragLeave={(e) => {
                              e.preventDefault();
                              if (dragOverFieldId === field.id) {
                                setDragOverFieldId(null);
                              }
                            }}
                            onDrop={() => {
                              setDragOverFieldId(null);
                              handleFieldDrop(field.id);
                            }}
                            className="border border-gray-200 cursor-move"
                            style={{
                              background: theme === "dark" ? "rgba(255, 255, 255, 0.02)" : "#ffffff",
                              borderColor:
                                dragOverFieldId === field.id
                                  ? "#7367f0"
                                  : theme === "dark"
                                    ? "rgba(255, 255, 255, 0.05)"
                                    : "#e5e7eb",
                              borderStyle: dragOverFieldId === field.id ? "dashed" : "solid",
                            }}
                            
                            extra={
                              <Space >
                           
                       <div className="flex absolute left-2 xl:left-[47%] top-4  items-center ">
                       <HolderOutlined  style={{ cursor: "grab", fontSize: 22, color: "#9ca3af" }} />
                       <HolderOutlined  style={{ cursor: "grab", fontSize: 22, color: "#9ca3af" }} />
                       <HolderOutlined  style={{ cursor: "grab", fontSize: 22, color: "#9ca3af" }} />
                       </div>
                                <Button
                                  type="primary"
                                  size="small"
                                  icon={<EditOutlined />}
                                  onClick={() => handleEditField(field)}
                                  className={theme === "dark" ? "bg-[#7367f0]/20 text-[#7367f0] border-0 hover:bg-[#7367f0] hover:text-white" : ""}
                                >
                                  Tahrirlash
                                </Button>
                                <Button
                                  danger
                                  size="small"
                                  icon={<DeleteOutlined />}
                                  onClick={() => handleDeleteField(field.id)}
                                  className={theme === "dark" ? "bg-red-500/20 text-red-500 border-0 hover:bg-red-500 hover:text-white" : ""}
                                >
                                  O&apos;chirish
                                </Button>
                       
                              </Space>
                            }
                          >
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-base" style={{ color: theme === "dark" ? "#e2e8f0" : "inherit" }}>{field.label}</span>
                                {field.required && <Tag color="red">Majburiy</Tag>}
                                <Tag>{getFieldTypeLabel(field.field_type)}</Tag>
                                {field.order !== undefined && field.order !== null && (
                                  <Tag color="blue">Tartib: {field.order}</Tag>
                                )}
                              </div>

                              {field.help_text && (
                                <p className="text-sm mb-2" style={{ color: theme === "dark" ? "#94a3b8" : "#4b5563" }}>
                                  <strong>Yordamchi matn:</strong> {field.help_text}
                                </p>
                              )}

                              {field.placeholder && (
                                <p className="text-sm mb-2" style={{ color: theme === "dark" ? "#94a3b8" : "#4b5563" }}>
                                  <strong>O&apos;rnib:</strong> {field.placeholder}
                                </p>
                              )}

                              {(field.min_length !== null && field.min_length !== undefined) && (
                                <p className="text-sm mb-2" style={{ color: theme === "dark" ? "#94a3b8" : "#4b5563" }}>
                                  <strong>Minimal uzunlik:</strong> {field.min_length}
                                </p>
                              )}

                              {(field.max_length !== null && field.max_length !== undefined) && (
                                <p className="text-sm mb-2" style={{ color: theme === "dark" ? "#94a3b8" : "#4b5563" }}>
                                  <strong>Maksimal uzunlik:</strong> {field.max_length}
                                </p>
                              )}

                              {field.min_value && (
                                <p className="text-sm mb-2" style={{ color: theme === "dark" ? "#94a3b8" : "#4b5563" }}>
                                  <strong>Minimal qiymat:</strong> {field.min_value}
                                </p>
                              )}

                              {field.max_value && (
                                <p className="text-sm mb-2" style={{ color: theme === "dark" ? "#94a3b8" : "#4b5563" }}>
                                  <strong>Maksimal qiymat:</strong> {field.max_value}
                                </p>
                              )}

                              {field.allowed_file_types && field.allowed_file_types.length > 0 && (
                                <p className="text-sm mb-2" style={{ color: theme === "dark" ? "#94a3b8" : "#4b5563" }}>
                                  <strong>Ruxsat etilgan fayl turlari:</strong> {field.allowed_file_types.join(", ")}
                                </p>
                              )}

                              {field.max_file_size !== null && field.max_file_size !== undefined && (
                                <p className="text-sm mb-2" style={{ color: theme === "dark" ? "#94a3b8" : "#4b5563" }}>
                                  <strong>Maksimal fayl hajmi:</strong> {field.max_file_size} MB
                                </p>
                              )}

                              {Array.isArray(field.options) && field.options.length > 0 && (
                                <p className="text-sm mb-2" style={{ color: theme === "dark" ? "#94a3b8" : "#4b5563" }}>
                                  <strong>Variantlar:</strong> {(field.options as string[]).map(String).join(", ")}
                                </p>
                              )}

                              <div className="mt-3">
                                {renderFieldInput(field)}
                              </div>
                            </div>
                          </Card>
                        ))}
                        
                    </div>
                  ) : (
                    <div className="text-center py-8" style={{ color: theme === "dark" ? "#94a3b8" : "#6b7280" }}>
                      Hozircha maydonlar mavjud emas
                    </div>
                  )}
                  
              </div>
                </div>
            
        <style jsx global>{`
          .ant-tabs-tab {
            color: ${theme === "dark" ? "#94a3b8" : "rgba(0, 0, 0, 0.88)"} !important;
          }
          .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
            color: #7367f0 !important;
          }
          .ant-descriptions-bordered .ant-descriptions-item-label,
          .ant-descriptions-bordered .ant-descriptions-item-content {
            border-color: ${theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "#f0f0f0"} !important;
          }
        `}
        </style>
      </Card>

      <Modal
        title={editingField ? "Maydonni Tahrirlash" : "Yangi Maydon Qoshish"}
        open={isFieldModalOpen}
        onCancel={() => {
          setIsFieldModalOpen(false);
          setEditingField(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateField} autoComplete="off">
          <Form.Item
            name="label"
            label="Maydon nomi"
            rules={[{ required: true, message: "Maydon nomini kiriting!" }]}
          >
            <Input placeholder="Masalan: Research Topic" />
          </Form.Item>

          <Form.Item
            name="field_type"
            label="Maydon turi"
            rules={[{ required: true, message: "Maydon turini tanlang!" }]}
          >
            <Select
              placeholder="Maydon turini tanlang"
              onChange={(value) => {
                // Clear options_list if field type is not SELECT, RADIO, or CHECKBOX
                if (value !== "SELECT" && value !== "RADIO" && value !== "CHECKBOX") {
                  form.setFieldValue("options_list", undefined);
                } else if (!form.getFieldValue("options_list") || form.getFieldValue("options_list").length === 0) {
                  form.setFieldValue("options_list", [{ value: "" }]);
                }
              }}
            >
              <Select.Option value="TEXT">{getFieldTypeLabel("TEXT")}</Select.Option>
              <Select.Option value="TEXTAREA">{getFieldTypeLabel("TEXTAREA")}</Select.Option>
              <Select.Option value="EMAIL">{getFieldTypeLabel("EMAIL")}</Select.Option>
              <Select.Option value="PHONE">{getFieldTypeLabel("PHONE")}</Select.Option>
              <Select.Option value="NUMBER">{getFieldTypeLabel("NUMBER")}</Select.Option>
              <Select.Option value="DATE">{getFieldTypeLabel("DATE")}</Select.Option>
              <Select.Option value="SELECT">{getFieldTypeLabel("SELECT")}</Select.Option>
              <Select.Option value="RADIO">{getFieldTypeLabel("RADIO")}</Select.Option>
              <Select.Option value="CHECKBOX">{getFieldTypeLabel("CHECKBOX")}</Select.Option>
              <Select.Option value="FILE">{getFieldTypeLabel("FILE")}</Select.Option>
              <Select.Option value="URL">{getFieldTypeLabel("URL")}</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="required" label="Majburiy" valuePropName="checked" initialValue={false}>
            <Switch checkedChildren="Ha" unCheckedChildren="Yoq" />
          </Form.Item>

          <Form.Item name="placeholder" label="Placeholder">
            <Input placeholder="Placeholder matni" />
          </Form.Item>

          <Form.Item name="help_text" label="Yordam matni">
            <Input.TextArea rows={2} placeholder="Foydalanuvchiga korsatma" />
          </Form.Item>

          {fieldType === "FILE" && (
            <>
              <Form.Item
                name="allowed_file_types_input"
                label="Ruxsat etilgan fayl formatlari"
                help="Formatlarni vergul bilan ajrating. Masalan: pdf, doc, docx, jpg"
              >
                <Input placeholder="pdf, doc, docx, jpg, png" />
              </Form.Item>
              <Form.Item
                name="max_file_size"
                label="Maksimal fayl hajmi (MB)"
                rules={[
                  { type: "number", min: 1, message: "Fayl hajmi kamida 1 MB bolishi kerak!" },
                ]}
              >
                <InputNumber className="w-full" placeholder="Masalan: 10" min={1} addonAfter="MB" />
              </Form.Item>
            </>
          )}

          {fieldType === "NUMBER" && (
            <>
              <Form.Item name="min_value" label="Minimal qiymat">
                <InputNumber className="w-full" placeholder="Minimal qiymat" />
              </Form.Item>
              <Form.Item name="max_value" label="Maksimal qiymat">
                <InputNumber className="w-full" placeholder="Maksimal qiymat" />
              </Form.Item>
            </>
          )}

          {(fieldType === "SELECT" || fieldType === "RADIO" || fieldType === "CHECKBOX") && (
            <Form.Item label="Variantlar (Options)">
              <Form.List name="options_list" initialValue={[{ value: "" }]}>
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                        <Form.Item
                          {...restField}
                          name={[name, "value"]}
                          rules={[{ required: true, message: "Variant qiymatini kiriting!" }]}
                          style={{ flex: 1, marginBottom: 0 }}
                        >
                          <Input placeholder="Variant qiymati" />
                        </Form.Item>
                        {fields.length > 1 && (
                          <MinusCircleOutlined
                            onClick={() => remove(name)}
                            style={{ color: "#ff4d4f", fontSize: 16, cursor: "pointer" }}
                          />
                        )}
                      </Space>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Variant qo&apos;shish
                    </Button>
                  </>
                )}
              </Form.List>
            </Form.Item>
          )}

          {(fieldType === "TEXT" || fieldType === "TEXTAREA" || fieldType === "EMAIL" || fieldType === "PHONE" || fieldType === "URL") && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="min_length" label="Minimal uzunlik">
                  <InputNumber className="w-full" placeholder="Minimal uzunlik" min={0} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="max_length" label="Maksimal uzunlik">
                  <InputNumber className="w-full" placeholder="Maksimal uzunlik" min={0} />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isCreatingField || isUpdatingField}>
                {editingField ? "Yangilash" : "Qoshish"}
              </Button>
              <Button
                onClick={() => {
                  setIsFieldModalOpen(false);
                  setEditingField(null);
                  form.resetFields();
                }}
              >
                Bekor qilish
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Arizani Tahrirlash"
        open={isApplicationModalOpen}
        onCancel={() => {
          setIsApplicationModalOpen(false);
          applicationForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={applicationForm}
          layout="vertical"
          onFinish={handleUpdateApplication}
          autoComplete="off"
        >
          <Form.Item
            name="title"
            label="Ariza nomi"
            rules={[{ required: true, message: "Ariza nomini kiriting!" }]}
          >
            <Input placeholder="Ariza nomi" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Tavsif"
            rules={[{ required: true, message: "Tavsifni kiriting!" }]}
          >
            <Input.TextArea rows={4} placeholder="Ariza tavsifi" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="start_date"
                label="Boshlanish sanasi"
                rules={[{ required: true, message: "Boshlanish sanasini tanlang!" }]}
              >
                <DatePicker className="w-full" format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="end_date"
                label="Tugash sanasi"
                rules={[{ required: true, message: "Tugash sanasini tanlang!" }]}
              >
                <DatePicker className="w-full" format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="exam_date" label="Imtihon sanasi">
            <DatePicker
              className="w-full"
              format="YYYY-MM-DD"
              disabledDate={(current) =>
                current && applicationForm.getFieldValue("end_date")
                  ? current.isBefore(applicationForm.getFieldValue("end_date"), "day")
                  : false
              }
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Holati"
            rules={[{ required: true, message: "Holatni tanlang!" }]}
          >
            <Select placeholder="Holatni tanlang">
              <Select.Option value="DRAFT">{getApplicationStatusLabel("DRAFT")}</Select.Option>
              <Select.Option value="PUBLISHED">{getApplicationStatusLabel("PUBLISHED")}</Select.Option>
              <Select.Option value="CLOSED">{getApplicationStatusLabel("CLOSED")}</Select.Option>
              <Select.Option value="ARCHIVED">{getApplicationStatusLabel("ARCHIVED")}</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isUpdatingApplication}>
                Yangilash
              </Button>
              <Button
                onClick={() => {
                  setIsApplicationModalOpen(false);
                  applicationForm.resetFields();
                }}
              >
                Bekor qilish
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Mutaxassisliklar va Imtihonchilarni tahrirlash"
        open={isSpecialitiesModalOpen}
        onCancel={() => {
          setIsSpecialitiesModalOpen(false);
          specialitiesForm.resetFields();
        }}
        footer={null}
        width={900}
      >
        <Form
          form={specialitiesForm}
          layout="vertical"
          onFinish={handleUpdateSpecialities}
          autoComplete="off"
          initialValues={{ specialities: [] }}
        >
          <Form.List name="specialities">
            {(fields, { add, remove }) => (
              <>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-base font-medium">Mutaxassisliklar va Imtihonchilar</span>
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                    Mutaxassislik qo&apos;shish
                  </Button>
                </div>
                {fields.map(({ key, name, ...restField }) => (
                  <Card key={key} size="small" style={{ marginBottom: 16 }}>
                    <div className="flex justify-end">
                      <MinusCircleOutlined
                        onClick={() => remove(name)}
                        className="text-red-500 cursor-pointer text-[20px]"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Form.Item
                        {...restField}
                        name={[name, "speciality_id"]}
                        label="Mutaxassislik"
                        rules={[{ required: true, message: "Mutaxassislikni tanlang!" }]}
                      >
                        <Select
                          placeholder="Mutaxassislikni tanlang"
                          showSearch
                          optionFilterProp="children"
                        >
                          {specialitiesList.map((s: SpecialityType) => (
                            <Select.Option key={s.id} value={s.id}>
                              {s.code} - {s.name}{s.is_foreign ? " (Chet tili)" : ""}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, "examiner_ids"]}
                        label="Imtihonchilar va rollari"
                        rules={[{ required: true, message: "Imtihonchilarni va rollarini kiriting!" }]}
                      >
                        <Form.List name={[name, "examiner_ids"]}>
                          {(examinerFields, { add: addExaminer, remove: removeExaminer }) => (
                            <>
                              {examinerFields.map((examinerField) => {
                                const { key: fieldKey, ...restExaminerField } = examinerField;
                                return (
                                  <div
                                    key={fieldKey}
                                    className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto] gap-2 items-start mb-2"
                                  >
                                    <Form.Item
                                      {...restExaminerField}
                                      name={[examinerField.name, "examiner_id"]}
                                      rules={[{ required: true, message: "Imtihonchini tanlang!" }]}
                                    >
                                      <Select
                                        className="w-full"
                                        placeholder="Imtihonchini tanlang"
                                        showSearch
                                        optionFilterProp="children"
                                      >
                                        {examinersList.map((e: ExaminerType) => (
                                          <Select.Option key={e.id} value={e.id}>
                                            {e.full_name}
                                          </Select.Option>
                                        ))}
                                      </Select>
                                    </Form.Item>
                                    <Form.Item
                                      {...restExaminerField}
                                      name={[examinerField.name, "role"]}
                                      rules={[{ required: true, message: "Rolni tanlang!" }]}
                                    >
                                      <Select className="w-full" placeholder="Rol">
                                        <Select.Option value="CHAIRMAN">{getExaminerRoleLabel("CHAIRMAN")}</Select.Option>
                                        <Select.Option value="PRE_CHAIRMAN">{getExaminerRoleLabel("PRE_CHAIRMAN")}</Select.Option>
                                        <Select.Option value="SECRETARY">{getExaminerRoleLabel("SECRETARY")}</Select.Option>
                                        <Select.Option value="MEMBER">{getExaminerRoleLabel("MEMBER")}</Select.Option>
                                      </Select>
                                    </Form.Item>
                                    <div className="flex md:justify-center pt-1">
                                      <MinusCircleOutlined
                                        onClick={() => removeExaminer(examinerField.name)}
                                        className="text-red-500 cursor-pointer"
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                              <Button
                                type="dashed"
                                onClick={() => addExaminer()}
                                block
                                icon={<PlusOutlined />}
                              >
                                Imtihonchi qo&apos;shish
                              </Button>
                            </>
                          )}
                        </Form.List>
                      </Form.Item>
                    </div>
                    {watchedSpecialities?.[name]?.existing_file_url && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-500 mr-2">Mavjud fayl:</span>
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(watchedSpecialities[name].existing_file_url!)}
                          className="inline-flex items-center gap-1 text-[#7367f0] hover:underline bg-transparent border-0 cursor-pointer p-0"
                        >
                          <FileTextOutlined />
                          Ko&apos;rish
                        </button>
                      </div>
                    )}
                    <Form.Item
                      {...restField}
                      name={[name, "file"]}
                      label="Fayl (ixtiyoriy)"
                      className="mt-4"
                      getValueFromEvent={(e) => e?.fileList?.[0]?.originFileObj ?? undefined}
                      getValueProps={(value: File | undefined) => ({
                        fileList: value
                          ? [{ uid: "-1", name: value.name, status: "done" as const, originFileObj: value }]
                          : [],
                      })}
                    >
                      <Upload
                        maxCount={1}
                        beforeUpload={() => false}
                        accept="*"
                      >
                        <Button icon={<UploadOutlined />}>Fayl tanlash</Button>
                      </Upload>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "comment"]}
                      label="Izoh (ushbu mutaxassislik uchun)"
                      className="mt-4"
                    >
                      <Input.TextArea rows={2} placeholder="Izoh (ixtiyoriy)" />
                    </Form.Item>
                  </Card>
                ))}
              </>
            )}
          </Form.List>

          <Form.Item className="mt-6">
            <Space>
              <Button type="primary" htmlType="submit" loading={isUpdatingApplication}>
                Saqlash
              </Button>
              <Button
                onClick={() => {
                  setIsSpecialitiesModalOpen(false);
                  specialitiesForm.resetFields();
                }}
              >
                Bekor qilish
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Fayl ko'rinishi"
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
              <div className="absolute inset-0 flex flex-col justify-center items-center bg-white/80 dark:bg-gray-900/80 rounded z-10" style={{ background: theme === "dark" ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.8)" }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7367f0] mb-4" />
                <span style={{ color: theme === "dark" ? "#9ca3af" : "#6b7280" }}>Fayl yuklanmoqda...</span>
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