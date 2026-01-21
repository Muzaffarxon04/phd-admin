"use client";

import { use } from "react";
import { Card, Spin, Button, Alert, Form, Input, InputNumber, Select, Radio, Checkbox, DatePicker, Upload, App } from "antd";
import { useGet, usePost } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { Dayjs } from "dayjs";

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
  start_date: string;
  end_date: string;
  exam_date?: string | null;
  application_fee: string;
  instructions?: string;
  can_apply: {
    can_apply: boolean;
    reason: string;
  };
  requires_oneid_verification?: boolean;
  max_submissions?: number;
  required_documents?: unknown[];
  user_submission_count?: number;
  fields: ApplicationField[];
}

interface ApplicationResponse {
  message: string;
  error: string | null;
  status: number;
  data: Application;
}

interface SubmissionData {
  application: number;
  answers: Array<{
    field_id: number;
    answer_text?: string;
    file?: File;
  }>;
}

const renderFieldInput = (field: ApplicationField) => {
  const options = field.options || [];

  switch (field.field_type) {
    case "TEXT":
      return (
        <Input
          placeholder={field.placeholder}
          minLength={field.min_length || undefined}
          maxLength={field.max_length || undefined}
        />
      );

    case "TEXTAREA":
      return (
        <Input.TextArea
          rows={4}
          placeholder={field.placeholder}
          minLength={field.min_length || undefined}
          maxLength={field.max_length || undefined}
        />
      );

    case "EMAIL":
      return <Input type="email" placeholder={field.placeholder || "email@example.com"} />;

    case "PHONE":
      return <Input type="tel" placeholder={field.placeholder || "+998901234567"} />;

    case "NUMBER":
      return (
        <InputNumber
          className="w-full"
          placeholder={field.placeholder}
          min={field.min_value ? parseFloat(field.min_value) : undefined}
          max={field.max_value ? parseFloat(field.max_value) : undefined}
        />
      );

    case "DATE":
      return <DatePicker className="w-full" format="YYYY-MM-DD" placeholder={field.placeholder} />;

    case "SELECT":
      return (
        <Select placeholder={field.placeholder || "Tanlang"}>
          {options.map((opt, index) => (
            <Select.Option key={index} value={opt}>
              {opt}
            </Select.Option>
          ))}
        </Select>
      );

    case "RADIO":
      return (
        <Radio.Group>
          {options.map((opt, index) => (
            <Radio key={index} value={opt}>
              {opt}
            </Radio>
          ))}
        </Radio.Group>
      );

    case "CHECKBOX":
      return (
        <Checkbox.Group>
          {options.map((opt, index) => (
            <Checkbox key={index} value={opt}>
              {opt}
            </Checkbox>
          ))}
        </Checkbox.Group>
      );

    case "FILE":
      return (
        <Upload
          beforeUpload={() => false}
          accept={field.allowed_file_types?.map((type) => `.${type}`).join(",")}
          maxCount={1}
        >
          <Button>Fayl tanlash</Button>
        </Upload>
      );

    case "URL":
      return <Input type="url" placeholder={field.placeholder || "https://example.com"} />;

    default:
      return <Input placeholder={field.placeholder} />;
  }
};

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const { data: applicationResponse, isLoading } = useGet<ApplicationResponse>(`/applicant/applications/${id}/`);
  const application = applicationResponse?.data;

  const { mutate: createSubmission, isPending: isCreating } = usePost<unknown, SubmissionData>(
    "/applicant/submissions/create/",
    {
      onSuccess: () => {
        message.success("Ariza muvaffaqiyatli yaratildi!");
        queryClient.invalidateQueries({ queryKey: ["/applicant/my-submissions/"] });
        router.push("/my-submissions");
      },
      onError: (error) => {
        message.error(error.message || "Ariza yaratishda xatolik");
      },
    }
  );

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (!application) return;

    const answers: Array<{ field_id: number; answer_text?: string }> = [];

    application.fields.forEach((field) => {
      const value = values[`field_${field.id}`];
      
      if (field.field_type === "FILE") {
        // File upload will be handled separately in submission detail page
        // For now, we'll skip file fields in initial submission
        if (field.required) {
          // Add empty answer for required file fields
          answers.push({
            field_id: field.id,
            answer_text: "",
          });
        }
        return;
      }

      let answerText: string | undefined;

      if (value !== undefined && value !== null) {
        if (field.field_type === "DATE") {
          const dateValue = value as Dayjs;
          if (dateValue && typeof dateValue.format === "function") {
            answerText = dateValue.format("YYYY-MM-DD");
          }
        } else if (field.field_type === "CHECKBOX" && Array.isArray(value)) {
          answerText = value.join(", ");
        } else if (field.field_type === "RADIO" || field.field_type === "SELECT") {
          answerText = String(value);
        } else {
          answerText = String(value);
        }
      }

      if (answerText || field.required) {
        answers.push({
          field_id: field.id,
          answer_text: answerText || "",
        });
      }
    });

    createSubmission({
      application: application.id,
      answers,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <p>Ariza topilmadi</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <div className="mb-6">
          <Link href="/applications">
            <Button type="link">← Orqaga</Button>
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-4">{application.title}</h1>
        <div className="flex flex-wrap gap-6 mb-6">
          <div className=" flex-1 min-w-[200px]">
            <p className="text-sm text-gray-500 font-medium">Boshlanish sanasi</p>
            <p className="text-base font-semibold text-gray-900">{formatDate(application.start_date)}</p>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <p className="text-sm text-gray-500 font-medium">Tugash sanasi</p>
            <p className="text-base font-semibold text-gray-900">{formatDate(application.end_date)}</p>
          </div>
          
          {application.exam_date && (
            <div className="  flex-1 min-w-[200px]">
              <p className="text-sm text-gray-500 font-medium">Imtihon sanasi</p>
              <p className="text-base font-semibold text-gray-900">{formatDate(application.exam_date)}</p>
            </div>
          )}
          
          <div className=" flex-1 min-w-[200px]">
            <p className="text-sm text-gray-500 font-medium">To&apos;lov</p>
            <p className="text-base font-semibold text-gray-900">{application.application_fee} UZS</p>
          </div>
        </div>

        <div className="mb-6 pb-4  border-b border-gray-200">
          <h2 className="text-xl font-semibold mb-2">Tavsif</h2>
          <p className="text-gray-700 whitespace-pre-line">{application.description}</p>
        </div>
        {application.instructions && (
          <div className="mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold mb-2">Ko&apos;rsatmalar</h2>
            <p className="text-gray-700 whitespace-pre-line">{application.instructions}</p>
          </div>
        )}

        {!application.can_apply.can_apply ? (
          <Alert message={application.can_apply.reason} type="warning" className="mb-4" />
        ) : (
          <>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Ariza to&apos;ldirish</h2>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
            >
              {application.fields
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((field) => (
                  <Form.Item
                    key={field.id}
                    name={`field_${field.id}`}
                    label={
                      <span>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </span>
                    }
                    help={field.help_text}
                    rules={[
                      {
                        required: field.required,
                        message: `${field.label} maydonini to'ldirish majburiy!`,
                      },
                    ]}
                    valuePropName={field.field_type === "FILE" ? "fileList" : "value"}
                    getValueFromEvent={field.field_type === "FILE" ? (e) => (Array.isArray(e) ? e : e?.fileList) : undefined}
                    style={{ marginBottom: 40 }}
                  >
                    {renderFieldInput(field)}
                  </Form.Item>
                ))}

              <Form.Item>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={isCreating}
                  className="w-full"
                >
                  Ariza topshirish
                </Button>
              </Form.Item>
            </Form>
          </div>
          </>
        )}

      
      </Card>
    </div>
  );
}
