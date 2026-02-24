"use client";

import { Form, Input, InputNumber, DatePicker, App, Button, Space, Card, Switch, Select } from "antd";
import { useRouter } from "next/navigation";
import { usePost, useGet } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
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
  // max_applicants: number;
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

interface CreateApplicationData {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status?: "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
  requires_oneid_verification?: boolean;
  exam_date?: string;
  application_fee?: string;
  instructions?: string;
  fields?: ApplicationField[];
  specialities?: ApplicationSpeciality[];
}

interface Application {
  id: number;
  title: string;
  description: string;
  status: "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
  start_date: string;
  end_date: string;
  exam_date?: string | null;
  application_fee?: string;
  total_submissions: number;
  is_open?: boolean;
  is_upcoming?: boolean;
  is_closed?: boolean;
  created_by_name: string;
  created_at: string;
}

export default function CreateApplicationPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  // Fetch specialities and examiners
  const { data: specialitiesData } = useGet<{ data: { data: Speciality[] } }>("/speciality/list/");
  const { data: examinersData } = useGet<{ data: { data: Examiner[] } }>("/examiner/list/?is_active=true");

  const specialitiesList = specialitiesData?.data?.data || [];
  const examinersList = examinersData?.data?.data || [];

  const { mutate: createApplication, isPending: isCreating } = usePost<{ data: Application }, CreateApplicationData>("/admin/application/create/", {
    onSuccess: () => {
      message.success("Ariza muvaffaqiyatli yaratildi!");
      queryClient.invalidateQueries({ queryKey: ["/admin/application/"] });
      router.push("/admin-panel/applications");
    },
    onError: (error) => {
      message.error(error.message || "Ariza yaratishda xatolik");
    },
  });

  const handleSubmit = (values: {
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
    createApplication({
      title: values.title,
      description: values.description,
      start_date: values.start_date.format("YYYY-MM-DDTHH:mm:ss[Z]"),
      end_date: values.end_date.format("YYYY-MM-DDTHH:mm:ss[Z]"),
      status: values.status || "DRAFT",
      requires_oneid_verification: values.requires_oneid_verification || false,
      ...(values.exam_date && { exam_date: values.exam_date.format("YYYY-MM-DD") }),
      ...(values.application_fee && { application_fee: values.application_fee.toString() }),
      ...(values.instructions && { instructions: values.instructions }),
      ...(values.fields && values.fields.length > 0 && { fields: values.fields }),
      ...(values.specialities && values.specialities.length > 0 && { specialities: values.specialities }),
    });
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
            <DatePicker className="w-full" format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            name="end_date"
            label="Tugash sanasi"
            rules={[{ required: true, message: "Tugash sanasini tanlang!" }]}
          >
            <DatePicker className="w-full" format="YYYY-MM-DD" />
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
            <DatePicker className="w-full" format="YYYY-MM-DD" />
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
            {(fields, { add, remove }) => (
              <>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-base font-medium">Maydonlar</span>
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                    Maydon qo&apos;shish
                  </Button>
                </div>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline" className="w-full">
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
                              {s.code} - {s.name}
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
