"use client";

import { useState, useEffect } from "react";
import { Form, Input, InputNumber, DatePicker, App, Button, Switch, Select } from "antd";
import { useRouter } from "next/navigation";
import { useGet } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import {
  PlusOutlined,
  MinusCircleOutlined,
  HolderOutlined,
  FileTextOutlined,
  CalendarOutlined,
  FormOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { apiUpload } from "@/lib/hooks/useUniversalFetch";
import type { Dayjs } from "dayjs";
import type { Speciality, Examiner } from "@/types";
import { getFieldTypeLabel } from "@/lib/utils";
import { PageHeader, SectionCard, StickyActionBar, useAdminSurface } from "@/components/admin/applications/ui";
import { SpecialityExaminersList } from "@/components/admin/applications/SpecialityExaminersList";

interface ApplicationSpeciality {
  speciality_id: string | number;
  examiners: Array<{
    examiner_id: string | number;
    role: "CHAIRMAN" | "PRE_CHAIRMAN" | "SECRETARY" | "MEMBER";
  }>;
  /** Izoh – har bir mutaxassislik uchun alohida */
  comment?: string;
  /** FormData da `file_${speciality_id}` kaliti bilan yuboriladi */
  file?: File;
}
interface ApplicationField {
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





export default function CreateApplicationPage() {
  const router = useRouter();
  const surface = useAdminSurface();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [dragFieldIndex, setDragFieldIndex] = useState<number | null>(null);
  const [dragOverFieldIndex, setDragOverFieldIndex] = useState<number | null>(null);

  useEffect(() => {
    if (dragFieldIndex !== null) {
      document.body.style.cursor = "grabbing";
      return () => {
        document.body.style.cursor = "";
      };
    }
  }, [dragFieldIndex]);

  // Fetch specialities and examiners
  const { data: specialitiesData } = useGet<{ data: { data: Speciality[] } }>("/speciality/list/?page_size=1000&is_active=true");
  const { data: examinersData } = useGet<{ data: { data: Examiner[] } }>("/examiner/list/?is_active=true&page_size=1000");

  const specialitiesList = specialitiesData?.data?.data || [];
  const examinersList = examinersData?.data?.data || [];

  const handleSubmit = async (values: {
    title: string;
    description: string;
    start_date: Dayjs;
    end_date: Dayjs;
    status?: "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
    requires_oneid_verification?: boolean;
    exam_date?: Dayjs;
    application_fee?: number;
    instructions?: string;
    fields?: ApplicationField[];
    specialities?: ApplicationSpeciality[];
  }) => {
    setIsCreating(true);
    try {
      const formData = new FormData();
      formData.set("title", values.title);
      formData.set("description", values.description);
      formData.set("start_date", values.start_date.format("YYYY-MM-DDTHH:mm:ss[Z]"));
      formData.set("end_date", values.end_date.format("YYYY-MM-DDTHH:mm:ss[Z]"));
      formData.set("status", values.status || "DRAFT");
      formData.set("requires_oneid_verification", String(values.requires_oneid_verification ?? false));
      if (values.exam_date) {
        formData.set("exam_date", values.exam_date.format("YYYY-MM-DDTHH:mm:ss[Z]"));
      }
      if (values.application_fee != null) formData.set("application_fee", values.application_fee.toString());
      if (values.instructions) formData.set("instructions", values.instructions);

      const fieldsWithOrder =
        (values.fields || []).map((field, index) => ({
          ...field,
          order: index + 1,
        })) || [];
      if (fieldsWithOrder.length > 0) {
        formData.set("fields", JSON.stringify(fieldsWithOrder));
      }
      const specialitiesPayload = (values.specialities || []).map(({ speciality_id, examiners, comment }) => ({
        speciality_id,
        examiners,
        ...(comment && { comment }),
      }));
      if (specialitiesPayload.length > 0) {
        formData.set("specialities", JSON.stringify(specialitiesPayload));
      }
      (values.specialities || []).forEach((item) => {
        const sid = item.speciality_id;
        const file = item.file;
        if (sid != null && file instanceof File) {
          formData.set(`file_${sid}`, file);
        }
      });
      await apiUpload("/admin/application/create/", formData);
      message.success("Ariza muvaffaqiyatli yaratildi!");
      queryClient.invalidateQueries({ queryKey: ["/admin/application/"] });
      router.push("/admin-panel/applications");
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Ariza yaratishda xatolik");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6" style={{ color: surface.text }}>
      <PageHeader
        title="Yangi Ariza Yaratish"
        backHref="/admin-panel/applications"
      />

      <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off" className="space-y-6">
        <SectionCard title="Asosiy ma'lumotlar" icon={<FileTextOutlined />}>
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

          <Form.Item name="instructions" label="Korsatmalar" className="mb-0!">
            <Input.TextArea rows={3} placeholder="Talabgorlar uchun korsatmalar" />
          </Form.Item>
        </SectionCard>

        <SectionCard title="Muddatlar va sozlamalar" icon={<CalendarOutlined />}>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <Form.Item
              name="start_date"
              label="Boshlanish sanasi"
              rules={[{ required: true, message: "Boshlanish sanasini tanlang!" }]}
            >
              <DatePicker className="w-full" showTime format="YYYY-MM-DD HH:mm" />
            </Form.Item>

            <Form.Item
              name="end_date"
              label="Tugash sanasi"
              rules={[{ required: true, message: "Tugash sanasini tanlang!" }]}
            >
              <DatePicker className="w-full" showTime format="YYYY-MM-DD HH:mm" />
            </Form.Item>

            <Form.Item name="exam_date" label="Imtihon sanasi">
              <DatePicker
                className="w-full"
                showTime
                format="YYYY-MM-DD HH:mm"
                disabledDate={(current) =>
                  current && form.getFieldValue("end_date")
                    ? current.isBefore(form.getFieldValue("end_date"), "day")
                    : false
                }
              />
            </Form.Item>

            <Form.Item name="status" label="Holati" initialValue="DRAFT">
              <Select className="w-full">
                <Select.Option value="DRAFT">Qoralama</Select.Option>
                <Select.Option value="PUBLISHED">E&apos;lon qilingan</Select.Option>
                <Select.Option value="CLOSED">Yopilgan</Select.Option>
                <Select.Option value="ARCHIVED">Arxivlangan</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="application_fee"
              label="Ariza tolovi (UZS)"
              rules={[{ type: "number", min: 0, message: "Tolov 0 dan katta bolishi kerak!" }]}
            >
              <InputNumber className="w-full" placeholder="Ariza tolovi" min={0} />
            </Form.Item>

            <Form.Item
              name="requires_oneid_verification"
              label="OneID tasdiqlash talab qilinadi"
              valuePropName="checked"
              initialValue={false}
            >
              <Switch />
            </Form.Item>
          </div>
        </SectionCard>

        <Form.List name="fields">
          {(fields, { add, remove, move }) => (
            <SectionCard
              title="Maydonlar"
              icon={<FormOutlined />}
              description={fields.length > 0 ? `${fields.length} ta maydon` : undefined}
              extra={
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                  className="min-h-[44px] w-full sm:min-h-0 sm:w-auto"
                >
                  Maydon qo&apos;shish
                </Button>
              }
            >
              {fields.length === 0 ? (
                <div className="py-4 text-center text-sm" style={{ color: surface.muted }}>
                  Hozircha maydonlar mavjud emas
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map(({ key, name, ...restField }, index) => (
                    <div
                      key={key}
                      draggable
                      onDragStart={() => setDragFieldIndex(index)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (dragOverFieldIndex !== index) {
                          setDragOverFieldIndex(index);
                        }
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        if (dragOverFieldIndex === index) {
                          setDragOverFieldIndex(null);
                        }
                      }}
                      onDrop={() => {
                        if (dragFieldIndex !== null && dragFieldIndex !== index) {
                          move(dragFieldIndex, index);
                        }
                        setDragOverFieldIndex(null);
                        setDragFieldIndex(null);
                      }}
                      className="flex flex-col gap-3 rounded-xl p-3 transition-colors md:grid md:grid-cols-[auto_minmax(0,1fr)_180px_auto_auto] md:items-start"
                      style={{
                        background: surface.subtleBg,
                        border: `1px ${dragOverFieldIndex === index ? "dashed #7367f0" : `solid ${surface.subtleBorder}`}`,
                        cursor: "grab",
                      }}
                    >
                      <span className="hidden md:mt-[34px] md:inline-flex" aria-hidden>
                        <HolderOutlined style={{ cursor: "grab", fontSize: 20, color: "#9ca3af" }} />
                      </span>
                      <Form.Item
                        {...restField}
                        name={[name, "label"]}
                        label="Maydon nomi"
                        rules={[{ required: true, message: "Maydon nomini kiriting!" }]}
                        className="mb-0!"
                      >
                        <Input placeholder="Masalan: Research Topic" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "field_type"]}
                        label="Maydon turi"
                        rules={[{ required: true, message: "Maydon turini tanlang!" }]}
                        className="mb-0!"
                      >
                        <Select placeholder="Turi">
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
                      <div className="flex items-center justify-between gap-2 md:contents">
                        <Form.Item
                          {...restField}
                          name={[name, "required"]}
                          valuePropName="checked"
                          className="mb-0! md:mt-[34px]"
                        >
                          <Switch checkedChildren="Majburiy" unCheckedChildren="Ixtiyoriy" />
                        </Form.Item>
                        <button
                          type="button"
                          aria-label="Maydonni olib tashlash"
                          onClick={() => remove(name)}
                          className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-lg text-red-500 hover:bg-red-500/10 md:mt-[28px] md:h-9 md:w-9"
                        >
                          <MinusCircleOutlined />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          )}
        </Form.List>

        <SectionCard title="Mutaxassisliklar va Imtihonchilar" icon={<TeamOutlined />}>
          <SpecialityExaminersList
            examinersKey="examiners"
            specialitiesList={specialitiesList}
            examinersList={examinersList}
          />
        </SectionCard>

        <StickyActionBar>
          <Button onClick={() => router.push("/admin-panel/applications")}>Bekor qilish</Button>
          <Button type="primary" htmlType="submit" loading={isCreating}>
            Yaratish
          </Button>
        </StickyActionBar>
      </Form>
    </div>
  );
}
