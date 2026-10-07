"use client";

import { use, useState, useEffect } from "react";
import { Tag, Button, Modal, Form, App } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useGet, usePost } from "@/lib/hooks";
import { apiRequest, apiUpload } from "@/lib/hooks/useUniversalFetch";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { formatDateTime, getApplicationStatusLabel, getApplicationStatusColor } from "@/lib/utils";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  InboxOutlined,
  RollbackOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  StopOutlined,
  InfoCircleOutlined,
  TeamOutlined,
  FormOutlined,
} from "@ant-design/icons";
import type { Speciality as SpecialityType, Examiner as ExaminerType } from "@/types";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { InfoItem, ModalActions, PageHeader, SectionCard, useAdminSurface } from "@/components/admin/applications/ui";
import { ApplicationEditFields } from "@/components/admin/applications/ApplicationEditFields";
import {
  ApplicationFieldCard,
  type ApplicationField,
  type ApplicationFieldType,
} from "@/components/admin/applications/ApplicationFieldCard";
import { FieldFormFields } from "@/components/admin/applications/FieldFormFields";
import { FilePreviewModal, getFileExt } from "@/components/admin/applications/FilePreviewModal";
import {
  SpecialityOverviewCard,
  type ApplicationSpecialityDetail as Speciality,
} from "@/components/admin/applications/SpecialityOverviewCard";
import { SpecialityExaminersList } from "@/components/admin/applications/SpecialityExaminersList";

const API_BASE = (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "")) || "https://api-doktarant.tashmeduni.uz";

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
  field_type: ApplicationFieldType;
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

export default function AdminApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const surface = useAdminSurface();
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

  const { data: specialitiesData } = useGet<{ data: { data: SpecialityType[] } }>("/speciality/list/?page_size=1000&is_active=true");
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

  /** Touch-friendly reorder: swaps with the neighbour and saves via the same API as drag & drop. */
  const moveFieldBy = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= orderedFields.length) return;
    const updated = [...orderedFields];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    void handleReorderFields(updated);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="space-y-6">
        <PageHeader title="Ariza" backHref="/admin-panel/applications" />
        <EmptyState description="Ariza topilmadi" />
      </div>
    );
  }

  const headerActions = (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end [&_.ant-btn]:min-h-[44px] sm:[&_.ant-btn]:min-h-0">
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
        <Button type="primary" icon={<CheckCircleOutlined />} onClick={handlePublish}>
          E&apos;lon qilish
        </Button>
      )}
      {application.status === "PUBLISHED" && (
        <Button icon={<StopOutlined />} onClick={handleClose}>
          Yopish
        </Button>
      )}
      <Button danger icon={<DeleteOutlined />} onClick={handleDeleteApplication}>
        O&apos;chirish
      </Button>
    </div>
  );

  return (
    <div className="space-y-6" style={{ color: surface.text }}>
      <PageHeader
        backHref="/admin-panel/applications"
        title={application.title}
        meta={
          <Tag color={getApplicationStatusColor(application.status)} className="mr-0!">
            {getApplicationStatusLabel(application.status)}
          </Tag>
        }
        actions={headerActions}
      />

      {/* Key facts */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Boshlanish sanasi", value: formatDateTime(application.start_date), color: "text-green-500" },
          { label: "Tugash sanasi", value: formatDateTime(application.end_date), color: "text-red-500" },
          {
            label: "Imtihon sanasi",
            value: application.exam_date ? formatDateTime(application.exam_date) : "Kiritilmagan",
            color: "text-[#7367f0]",
          },
          { label: "Jami arizalar", value: String(application.total_submissions), color: "text-[#7367f0]" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl p-3 sm:p-4"
            style={{ background: surface.cardBg, border: `1px solid ${surface.cardBorder}` }}
          >
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: surface.muted }}>
              {item.label}
            </div>
            <div className={`mt-1 break-words text-sm font-bold sm:text-base ${item.color}`}>{item.value}</div>
          </div>
        ))}
      </div>

      <SectionCard title="Asosiy ma'lumotlar" icon={<InfoCircleOutlined />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="ID">{application.id}</InfoItem>
          <InfoItem label="Nomi">{application.title}</InfoItem>
          <InfoItem label="Holati">
            <Tag color={getApplicationStatusColor(application.status)}>
              {getApplicationStatusLabel(application.status)}
            </Tag>
          </InfoItem>
          <InfoItem label="OneID tekshiruvi">
            <Tag color={application.requires_oneid_verification ? "green" : "default"}>
              {application.requires_oneid_verification ? "Talab qilinadi" : "Talab qilinmaydi"}
            </Tag>
          </InfoItem>
          <InfoItem label="Ariza to'lovi">
            {application.application_fee ? `${application.application_fee} UZS` : "Bepul"}
          </InfoItem>
          <InfoItem label="Majburiy hujjatlar">
            {application.required_documents && application.required_documents.length > 0
              ? application.required_documents.join(", ")
              : "Kiritilmagan"}
          </InfoItem>
          <InfoItem label="Yaratgan">{application.created_by_name}</InfoItem>
          <InfoItem label="Yaratilgan sana">{formatDateTime(application.created_at)}</InfoItem>
          <InfoItem label="Tavsif" className="sm:col-span-2 lg:col-span-3">
            <span className="whitespace-pre-line">{application.description}</span>
          </InfoItem>
          <InfoItem label="Ko'rsatmalar" className="sm:col-span-2 lg:col-span-3">
            <span className="whitespace-pre-line">{application.instructions || "Kiritilmagan"}</span>
          </InfoItem>
        </div>
      </SectionCard>

      <SectionCard
        title="Mutaxassisliklar va Imtihonchilar"
        icon={<TeamOutlined />}
        extra={
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={handleOpenSpecialitiesModal}
            className="min-h-[44px] w-full sm:min-h-0 sm:w-auto"
          >
            Qo&apos;shish / Tahrirlash
          </Button>
        }
      >
        {application.specialities && application.specialities.length > 0 ? (
          <div className="space-y-4">
            {application.specialities.map((speciality) => (
              <SpecialityOverviewCard key={speciality.id} speciality={speciality} onPreviewFile={handleOpenPreview} />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-sm" style={{ color: surface.muted }}>
            Mutaxassisliklar mavjud emas
          </div>
        )}
      </SectionCard>

      <SectionCard
        title={`Jami maydonlar: ${application.fields?.length || 0}`}
        icon={<FormOutlined />}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="min-h-[44px] w-full sm:min-h-0 sm:w-auto"
            onClick={() => {
              setEditingField(null);
              form.resetFields();
              form.setFieldsValue({ options_list: [{ value: "" }] });
              setIsFieldModalOpen(true);
            }}
          >
            Maydon qo&apos;shish
          </Button>
        }
      >
        {orderedFields && orderedFields.length > 0 ? (
          <div className="space-y-3">
            {orderedFields.map((field, index) => (
              <ApplicationFieldCard
                key={field.id + "-" + index}
                field={field}
                isDragOver={dragOverFieldId === field.id}
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
                onEdit={() => handleEditField(field)}
                onDelete={() => handleDeleteField(field.id)}
                onMoveUp={index > 0 ? () => moveFieldBy(index, -1) : undefined}
                onMoveDown={index < orderedFields.length - 1 ? () => moveFieldBy(index, 1) : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-sm" style={{ color: surface.muted }}>
            Hozircha maydonlar mavjud emas
          </div>
        )}
      </SectionCard>

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
        style={{ top: 24 }}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateField} autoComplete="off">
          <FieldFormFields fieldType={fieldType} />

          <ModalActions>
            <Button
              onClick={() => {
                setIsFieldModalOpen(false);
                setEditingField(null);
                form.resetFields();
              }}
            >
              Bekor qilish
            </Button>
            <Button type="primary" htmlType="submit" loading={isCreatingField || isUpdatingField}>
              {editingField ? "Yangilash" : "Qoshish"}
            </Button>
          </ModalActions>
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
        centered
      >
        <Form form={applicationForm} layout="vertical" onFinish={handleUpdateApplication} autoComplete="off">
          <ApplicationEditFields />

          <ModalActions>
            <Button
              onClick={() => {
                setIsApplicationModalOpen(false);
                applicationForm.resetFields();
              }}
            >
              Bekor qilish
            </Button>
            <Button type="primary" htmlType="submit" loading={isUpdatingApplication}>
              Yangilash
            </Button>
          </ModalActions>
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
        style={{ top: 24 }}
      >
        <Form
          form={specialitiesForm}
          layout="vertical"
          onFinish={handleUpdateSpecialities}
          autoComplete="off"
          initialValues={{ specialities: [] }}
        >
          <SpecialityExaminersList
            examinersKey="examiner_ids"
            heading="Mutaxassisliklar va Imtihonchilar"
            specialitiesList={specialitiesList}
            examinersList={examinersList}
            renderBeforeFile={(name) =>
              watchedSpecialities?.[name]?.existing_file_url ? (
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">Mavjud fayl:</span>
                  <button
                    type="button"
                    onClick={() => handleOpenPreview(watchedSpecialities[name].existing_file_url!)}
                    className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-[#7367f0] hover:underline sm:min-h-0"
                  >
                    <FileTextOutlined />
                    Ko&apos;rish
                  </button>
                </div>
              ) : null
            }
          />

          <ModalActions>
            <Button
              onClick={() => {
                setIsSpecialitiesModalOpen(false);
                specialitiesForm.resetFields();
              }}
            >
              Bekor qilish
            </Button>
            <Button type="primary" htmlType="submit" loading={isUpdatingApplication}>
              Saqlash
            </Button>
          </ModalActions>
        </Form>
      </Modal>

      <FilePreviewModal
        url={previewFileUrl}
        fileName={previewFileName}
        loading={previewLoading}
        onLoad={handlePreviewLoad}
        onClose={handleClosePreview}
      />
    </div>
  );
}
