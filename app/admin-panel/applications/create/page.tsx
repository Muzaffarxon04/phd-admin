"use client";

import { Form, Input, InputNumber, DatePicker, App, Button, Space, Card, Switch, Select } from "antd";
import { useRouter } from "next/navigation";
import { usePost } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import Link from "next/link";

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
  max_submissions?: number;
  requires_oneid_verification?: boolean;
  exam_date?: string;
  application_fee?: string;
  instructions?: string;
  fields?: ApplicationField[];
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
    max_submissions?: number;
    requires_oneid_verification?: boolean;
    exam_date?: Dayjs;
    application_fee?: number;
    instructions?: string;
    fields?: ApplicationField[];
  }) => {
    createApplication({
      title: values.title,
      description: values.description,
      start_date: values.start_date.format("YYYY-MM-DDTHH:mm:ss[Z]"),
      end_date: values.end_date.format("YYYY-MM-DDTHH:mm:ss[Z]"),
      status: values.status || "DRAFT",
      ...(values.max_submissions && { max_submissions: values.max_submissions }),
      requires_oneid_verification: values.requires_oneid_verification || false,
      ...(values.exam_date && { exam_date: values.exam_date.format("YYYY-MM-DD") }),
      ...(values.application_fee && { application_fee: values.application_fee.toString() }),
      ...(values.instructions && { instructions: values.instructions }),
      ...(values.fields && values.fields.length > 0 && { fields: values.fields }),
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
            name="max_submissions"
            label="Maksimal arizalar soni"
            rules={[
              { type: "number", min: 1, message: "Maksimal arizalar soni 1 dan katta bolishi kerak!" },
            ]}
          >
            <InputNumber className="w-full" placeholder="Maksimal arizalar soni" min={1} />
          </Form.Item>

          <Form.Item
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
                        <Select.Option value="TEXT">TEXT</Select.Option>
                        <Select.Option value="TEXTAREA">TEXTAREA</Select.Option>
                        <Select.Option value="EMAIL">EMAIL</Select.Option>
                        <Select.Option value="PHONE">PHONE</Select.Option>
                        <Select.Option value="NUMBER">NUMBER</Select.Option>
                        <Select.Option value="DATE">DATE</Select.Option>
                        <Select.Option value="SELECT">SELECT</Select.Option>
                        <Select.Option value="RADIO">RADIO</Select.Option>
                        <Select.Option value="CHECKBOX">CHECKBOX</Select.Option>
                        <Select.Option value="FILE">FILE</Select.Option>
                        <Select.Option value="URL">URL</Select.Option>
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
