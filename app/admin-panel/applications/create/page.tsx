"use client";

import { useState, useEffect } from "react";
import { Form, Input, InputNumber, DatePicker, App, Button, Space, Card, Switch, Select, Upload } from "antd";
import { useRouter } from "next/navigation";
import { useGet } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { PlusOutlined, MinusCircleOutlined, UploadOutlined, HolderOutlined } from "@ant-design/icons";
import { apiUpload } from "@/lib/hooks/useUniversalFetch";
import type { Dayjs } from "dayjs";
import Link from "next/link";
import type { Speciality, Examiner } from "@/types";
import { getExaminerRoleLabel, getFieldTypeLabel } from "@/lib/utils";

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
  const { data: specialitiesData } = useGet<{ data: { data: Speciality[] } }>("/speciality/list/");
  const { data: examinersData } = useGet<{ data: { data: Examiner[] } }>("/examiner/list/?is_active=true");

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
    <div>
      <div className="mb-6">
        <Link href="/admin-panel/applications">
          <Button type="link">← Orqaga</Button>
        </Link>
      </div>

      <Card>
        <h1 className="text-3xl font-bold mb-6">Yangi Ariza Yaratish</h1>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
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

          <Form.Item
            name="status"
            label="Holati"
            initialValue="DRAFT"
          >
            <Select className="w-full">
              <Select.Option value="DRAFT">Qoralama</Select.Option>
              <Select.Option value="PUBLISHED">E&apos;lon qilingan</Select.Option>
              <Select.Option value="CLOSED">Yopilgan</Select.Option>
              <Select.Option value="ARCHIVED">Arxivlangan</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="exam_date"
            label="Imtihon sanasi"
          >
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

        

          <Form.Item
          className="w-[400px]!"
            name="application_fee"
            label="Ariza tolovi (UZS)"
            rules={[
              { type: "number", min: 0, message: "Tolov 0 dan katta bolishi kerak!" },
            ]}
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

          <Form.Item
            name="instructions"
            label="Korsatmalar"
          >
            <Input.TextArea rows={3} placeholder="Talabgorlar uchun korsatmalar" />
          </Form.Item>

          <Form.List name="fields">
            {(fields, { add, remove, move }) => (
              <>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-base font-medium">Maydonlar</span>
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                    Maydon qo&apos;shish
                  </Button>
                </div>
                {fields.map(({ key, name, ...restField }, index) => (
                  <div key={key} className="cursor-grab">
                    <Space
                      style={{ display: "flex", marginBottom: 8, cursor: "grab" }}
                      align="baseline"
                      className="w-full rounded-md py-2 px-3 -mx-3 transition-colors hover:bg-gray-100/80"
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
                        if (
                          dragFieldIndex !== null &&
                          dragFieldIndex !== index
                        ) {
                          move(dragFieldIndex, index);
                        }
                        setDragOverFieldIndex(null);
                        setDragFieldIndex(null);
                      }}
                    >
                      <HolderOutlined style={{ cursor: "grab", fontSize: 20, color: "#9ca3af" }} />
                      <Form.Item
                        {...restField}
                        name={[name, "label"]}
                        label="Maydon nomi"
                        rules={[{ required: true, message: "Maydon nomini kiriting!" }]}
                        style={{ flex: 1 }}
                      >
                        <Input placeholder="Masalan: Research Topic" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "field_type"]}
                        label="Maydon turi"
                        rules={[{ required: true, message: "Maydon turini tanlang!" }]}
                        style={{ width: 150 }}
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
                      <Form.Item
                        {...restField}
                        name={[name, "required"]}
                        valuePropName="checked"
                        style={{ width: 100 }}
                      >
                        <Switch checkedChildren="Majburiy" unCheckedChildren="Ixtiyoriy" />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} className="text-red-500 cursor-pointer" />
                    </Space>
                  </div>
                ))}
              </>
            )}
          </Form.List>

          <div className="border-t my-8" />

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
                      <MinusCircleOutlined onClick={() => remove(name)} className="text-red-500 cursor-pointer text-[20px]" />
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
                          className="premium-select"
                        >
                          {specialitiesList.map((s: Speciality) => (
                            <Select.Option key={s.id} value={s.id}>
                              {s.code} - {s.name}{s.is_foreign ? " (Chet tili)" : ""}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, "examiners"]}
                        label="Imtihonchilar va rollari"
                        rules={[{ required: true, message: "Imtihonchilarni va rollarini kiriting!" }]}
                      >
                        <Form.List name={[name, "examiners"]}>
                          {(examinerFields, { add: addExaminer, remove: removeExaminer }) => (
                            <>
                              {examinerFields.map((examinerField) => {
                                const { key: fieldKey, ...restExaminerField } = examinerField;
                                return (
                                  <div key={fieldKey} className="flex items-start gap-2 ">
                                    <Form.Item
                                      {...restExaminerField}
                                      name={[examinerField.name, "examiner_id"]}
                                      rules={[{ required: true, message: "Imtihonchini tanlang!" }]}
                                      className="flex-1"
                                    >
                                      <Select
                                        className="w-[400px]!"
                                        placeholder="Imtihonchini tanlang"
                                        showSearch
                                        optionFilterProp="children"
                                      >
                                        {examinersList.map((e: Examiner) => (
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
                                      <Select className="w-[200px]!" placeholder="Rol">
                                        <Select.Option value="CHAIRMAN">{getExaminerRoleLabel("CHAIRMAN")}</Select.Option>
                                        <Select.Option value="PRE_CHAIRMAN">{getExaminerRoleLabel("PRE_CHAIRMAN")}</Select.Option>
                                        <Select.Option value="SECRETARY">{getExaminerRoleLabel("SECRETARY")}</Select.Option>
                                        <Select.Option value="MEMBER">{getExaminerRoleLabel("MEMBER")}</Select.Option>
                                      </Select>
                                    </Form.Item>
                                    <MinusCircleOutlined
                                      onClick={() => removeExaminer(examinerField.name)}
                                      className="text-red-500 cursor-pointer "
                                    />
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

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isCreating}>
                Yaratish
              </Button>
              <Button onClick={() => router.push("/admin-panel/applications")}>Bekor qilish</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
