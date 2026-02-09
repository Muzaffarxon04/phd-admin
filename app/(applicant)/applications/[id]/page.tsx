"use client";

import { use } from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Radio,
  Checkbox,
  DatePicker,
  Upload,
  Breadcrumb,
  Typography,
  message,
  Alert,
} from "antd";
import {
  useGet,
  useUpload
} from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UploadOutlined,
  CheckCircleOutlined,
  // ClockCircleOutlined,
  ExclamationCircleOutlined,
  DollarOutlined,
  CalendarOutlined,
  TrophyOutlined,
  InfoCircleOutlined,
  // SaveOutlined,
  SendOutlined
} from "@ant-design/icons";
import { formatDate, parseMoneyAmount } from "@/lib/utils";
import { type Dayjs } from "dayjs";
import { useState } from "react";
import { useThemeStore } from "@/lib/stores/themeStore";

const { Title, Text, Paragraph } = Typography;

import { type Speciality } from "@/types";

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
  // max_submissions?: number;
  required_documents?: unknown[];
  user_submission_count?: number;
  fields: ApplicationField[];
  specialities: Speciality[];
}

interface ApplicationResponse {
  message: string;
  error: string | null;
  status: number;
  data: Application;
}


const renderFieldInput = (field: ApplicationField, theme: string) => {
  const options = field.options || [];
  const inputStyle = {
    background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
    border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
    color: theme === "dark" ? "#ffffff" : "#484650",
  };

  switch (field.field_type) {
    case "TEXT":
      return (
        <Input
          placeholder={field.placeholder}
          minLength={field.min_length || undefined}
          maxLength={field.max_length || undefined}
          size="large"
          className="w-full rounded-xl"
          style={inputStyle}
        />
      );

    case "TEXTAREA":
      return (
        <Input.TextArea
          rows={4}
          placeholder={field.placeholder}
          minLength={field.min_length || undefined}
          maxLength={field.max_length || undefined}
          size="large"
          className="w-full rounded-xl"
          style={inputStyle}
        />
      );

    case "EMAIL":
      return <Input type="email" placeholder={field.placeholder || "email@example.com"} size="large" className="rounded-xl" style={inputStyle} />;

    case "PHONE":
      return <Input type="tel" placeholder={field.placeholder || "+998901234567"} size="large" className="rounded-xl" style={inputStyle} />;

    case "NUMBER":
      return (
        <InputNumber
          className="w-full rounded-xl"
          placeholder={field.placeholder}
          min={field.min_value ? parseFloat(field.min_value) : undefined}
          max={field.max_value ? parseFloat(field.max_value) : undefined}
          size="large"
          style={{ ...inputStyle, width: "100%" }}
        />
      );

    case "DATE":
      return (
        <DatePicker
          className="w-full rounded-xl"
          format="YYYY-MM-DD"
          placeholder={field.placeholder}
          size="large"
          style={inputStyle}
        />
      );

    case "SELECT":
      return (
        <Select
          placeholder={field.placeholder || "Tanlang"}
          size="large"
          className="w-full custom-select-premium"
          dropdownStyle={{
            background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
            border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
          }}
        >
          {options.map((opt, index) => (
            <Select.Option key={index} value={opt}>
              <span style={{ color: theme === "dark" ? "rgba(255, 255, 255, 0.8)" : "inherit" }}>{opt}</span>
            </Select.Option>
          ))}
        </Select>
      );

    case "RADIO":
      return (
        <Radio.Group className="w-full">
          <div className="flex flex-col gap-2">
            {options.map((opt, index) => (
              <Radio key={index} value={opt} className="premium-radio">
                <span style={{ color: theme === "dark" ? "rgba(255, 255, 255, 0.8)" : "inherit" }}>{opt}</span>
              </Radio>
            ))}
          </div>
        </Radio.Group>
      );

    case "CHECKBOX":
      return (
        <Checkbox.Group className="w-full">
          <div className="flex flex-col gap-2">
            {options.map((opt, index) => (
              <Checkbox key={index} value={opt} className="premium-checkbox">
                <span style={{ color: theme === "dark" ? "rgba(255, 255, 255, 0.8)" : "inherit" }}>{opt}</span>
              </Checkbox>
            ))}
          </div>
        </Checkbox.Group>
      );

    case "FILE":
      return (
        <Upload
          beforeUpload={() => false}
          accept={field.allowed_file_types?.map((type) => `.${type}`).join(",")}
          maxCount={1}
          className="w-full premium-upload"
        >
          <Button icon={<UploadOutlined />} size="large" block className="rounded-xl" style={inputStyle}>
            Fayl tanlash
          </Button>
        </Upload>
      );

    case "URL":
      return (
        <Input
          type="url"
          placeholder={field.placeholder || "https://example.com"}
          size="large"
          className="rounded-xl"
          style={inputStyle}
        />
      );

    default:
      return <Input placeholder={field.placeholder} size="large" className="w-full rounded-xl" style={inputStyle} />;
  }
};

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  // const [, setSubmitting] = useState(false);
  const [completedFields] = useState<Set<number>>(new Set());
  const { theme } = useThemeStore();

  // Custom states
  const [selectedSpeciality, setSelectedSpeciality] = useState<string | null>(null);

  const { data: applicationResponse, isLoading } = useGet<ApplicationResponse>(`/applicant/applications/${id}/`);
  const application = applicationResponse?.data;




  const specialities = application?.specialities || [];

  const { mutate: createSubmission, isPending: isCreating } = useUpload<unknown>(
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

    // Validate speciality selection if needed
    if (!selectedSpeciality) {
      message.error("Iltimos, mutaxassislikni tanlang!");
      return;
    }

    const formData = new FormData();
    formData.append("application", String(application.id));
    formData.append("speciality", String(selectedSpeciality));

    const answers: Array<{
      field_id: number;
      answer_text: string;
      answer_number: null;
      answer_date: null;
      answer_json: Record<string, unknown>;
    }> = [];

    application.fields.forEach((field) => {
      const value = values[`field_${field.id}`];

      if (field.field_type === "FILE") {
        // Handle file upload

        if (value && Array.isArray(value) && value.length > 0 && value[0].originFileObj) {
          formData.append(`field_${field.id}_file`, value[0].originFileObj);
        }

        // Push empty answer for file field as per requirement
        answers.push({
          field_id: field.id,
          answer_text: "",
          answer_number: null,
          answer_date: null,
          answer_json: {},
        });
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
          answer_number: null,
          answer_date: null,
          answer_json: {},
        });
      }
    });

    formData.append("answers", JSON.stringify(answers));

    createSubmission(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Ariza yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto text-center">
          <Alert
            message="Xatolik"
            description="Ariza topilmadi"
            type="error"
            showIcon
          />
          <Link href="/applications">
            <Button className="mt-4" type="primary">
              Orqaga
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const canApply = true

  return (
    <div className="min-h-screen ">
      {/* Page Title & Breadcrumb */}
      <div className="mb-4 flex items-center gap-4">
        <Title level={4} className="!text-[24px] mb-0! border-r-1 border-[rgb(214,220,225)] pr-4" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
          Ariza topshirish
        </Title>

        <Breadcrumb
          items={[
            {
              href: "/dashboard",
              title: (
                <span style={{ display: "flex", alignItems: "center", gap: 4, color: "rgb(115, 103, 240)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="align-text-top feather feather-home"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                </span>
              ),
            },
            {
              href: "/applications",
              title: <span style={{ color: "rgb(115, 103, 240)" }}>Mavjud Arizalar</span>
            },
            { title: <span style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>{application.title}</span> },
          ]}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* {!canApply && (
          <div
            className="mb-8 p-4 rounded-xl border flex items-center justify-between"
            style={{
              background: theme === "dark" ? "rgba(255, 159, 67, 0.1)" : "rgba(255, 159, 67, 0.05)",
              borderColor: "rgba(255, 159, 67, 0.3)"
            }}
          >
            <div className="flex gap-3">
              <ExclamationCircleOutlined style={{ color: "#ff9f43", fontSize: "18px" }} />
              <div>
                <Text style={{ display: "block", color: theme === "dark" ? "#ff9f43" : "#ff9f43", fontWeight: 600 }}>
                  Arizani topshirish imkoni yo&apos;q
                </Text>
                <Text style={{ fontSize: "14px", color: theme === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)" }}>
                  {application?.can_apply?.reason}
                </Text>
              </div>
            </div>
           
          </div>
        )} */}
        <Title level={3} className="!text-[24px]  border-r-1 border-[rgb(214,220,225)] pr-4" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
          {application.title}
        </Title>
        {/* Application Info */}
        <div
          className="rounded-lg transition-all duration-300 p-6 mb-8"
          style={{
            background: theme === "dark" ? "rgb(40, 48, 70)" : "rgba(255, 255, 255, 0.98)",
            border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
            boxShadow: theme === "dark"
              ? "0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)"
              : "0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-500">
                  <CalendarOutlined style={{ fontSize: "20px" }} />
                </div>
                <div>
                  <Text className="text-gray-500 block text-xs font-semibold uppercase tracking-wider">Boshlanish sanasi</Text>
                  <div className="font-bold text-base" style={{ color: theme === "dark" ? "#ffffff" : "#484650" }}>
                    {formatDate(application.start_date)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-500/10 text-purple-500">
                  <CalendarOutlined style={{ fontSize: "20px" }} />
                </div>
                <div>
                  <Text className="text-gray-500 block text-xs font-semibold uppercase tracking-wider">Tugash sanasi</Text>
                  <div className="font-bold text-base" style={{ color: theme === "dark" ? "#ffffff" : "#484650" }}>
                    {formatDate(application.end_date)}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-500/10 text-green-500">
                  <DollarOutlined style={{ fontSize: "20px" }} />
                </div>
                <div>
                  <Text className="text-gray-500 block text-xs font-semibold uppercase tracking-wider">Tolov miqdori</Text>
                  <div className="font-black text-base" style={{ color: "#7367f0" }}>
                    {parseMoneyAmount(application.application_fee)}
                  </div>
                </div>
              </div>

              {application.exam_date && (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-orange-500/10 text-orange-500">
                    <CalendarOutlined style={{ fontSize: "20px" }} />
                  </div>
                  <div>
                    <Text className="text-gray-500 block text-xs font-semibold uppercase tracking-wider">Imtihon sanasi</Text>
                    <div className="font-bold text-base" style={{ color: theme === "dark" ? "#ffffff" : "#484650" }}>
                      {formatDate(application.exam_date)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-500">
                  <TrophyOutlined style={{ fontSize: "20px" }} />
                </div>
                <div>
                  <Text className="text-gray-500 block text-xs font-semibold uppercase tracking-wider">Arizalar soni</Text>
                  <div className="font-bold text-base" style={{ color: theme === "dark" ? "#ffffff" : "#484650" }}>
                    {application.user_submission_count || 0}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${application.requires_oneid_verification ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'}`}>
                  {application.requires_oneid_verification ? (
                    <ExclamationCircleOutlined style={{ fontSize: "20px" }} />
                  ) : (
                    <CheckCircleOutlined style={{ fontSize: "20px" }} />
                  )}
                </div>
                <div>
                  <Text className="text-gray-500 block text-xs font-semibold uppercase tracking-wider">Tasdiqlash</Text>
                  <div className="font-bold text-base" style={{ color: theme === "dark" ? "#ffffff" : "#484650" }}>
                    {application.requires_oneid_verification ? "OneID" : "Zarur emas"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div
          className="rounded-lg transition-all duration-300 p-6 mb-8"
          style={{
            background: theme === "dark" ? "rgb(40, 48, 70)" : "rgba(255, 255, 255, 0.98)",
            border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
            boxShadow: theme === "dark"
              ? "0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)"
              : "0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
          }}
        >
          <Title level={4} className="mb-4" style={{ color: "#7367f0" }}>Ariza tavsifi</Title>
          <Paragraph
            className="text-sm leading-relaxed"
            style={{ color: theme === "dark" ? "rgb(180, 183, 189)" : "#484650", whiteSpace: "pre-line" }}
          >
            {application.description}
          </Paragraph>
        </div>

        {/* Instructions */}
        {application.instructions && (
          <div
            className="rounded-lg transition-all duration-300 p-6 mb-8 border-l-[4px]"
            style={{
              background: theme === "dark" ? "rgb(40, 48, 70)" : "rgba(255, 255, 255, 0.98)",
              border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
              borderLeftColor: "#7367f0",
              boxShadow: theme === "dark"
                ? "0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)"
                : "0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
            }}
          >
            <Title level={4} className="mb-4 flex items-center gap-2" style={{ color: "#7367f0" }}>
              <InfoCircleOutlined />
              Ko&apos;rsatmalar
            </Title>
            <Paragraph
              className="text-sm leading-relaxed"
              style={{ color: theme === "dark" ? "rgb(180, 183, 189)" : "#484650", whiteSpace: "pre-line" }}
            >
              {application.instructions}
            </Paragraph>
          </div>
        )}

        {/* Application Form */}
        {canApply && (
          <div
            className="rounded-lg transition-all duration-300 p-8 mb-12"
            style={{
              background: theme === "dark" ? "rgb(40, 48, 70)" : "rgba(255, 255, 255, 0.98)",
              border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
              boxShadow: theme === "dark"
                ? "0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)"
                : "0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
            }}
          >
            <Title level={4} className="mb-8" style={{ color: "#7367f0" }}>Ariza to&apos;ldirish</Title>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
              className="premium-form"
            >
              {/* Speciality Selection */}
              <div className="mb-8 p-4 rounded-xl border border-dashed border-[#7367f0]/30 bg-[#7367f0]/5">
                <Form.Item
                  label={<span className="text-lg font-semibold" style={{ color: theme === "dark" ? "#fff" : "#484650" }}>Mutaxassislikni tanlang <span className="text-red-500">*</span></span>}
                  required
                  className="mb-0"
                >
                  <Select
                    placeholder="Mutaxassislikni tanlang"
                    size="large"
                    className="w-full custom-select-premium"
                    // loading={isSpecialitiesLoading}
                    value={selectedSpeciality}
                    onChange={setSelectedSpeciality}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={specialities.map((spec) => ({
                      value: spec.id,
                      label: `${spec.code} - ${spec.name}`,
                    }))}
                    dropdownStyle={{
                      background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
                      border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
                    }}
                  />
                </Form.Item>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                {application.fields
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((field) => (
                    <div key={field.id} className="relative">
                      <Form.Item
                        name={`field_${field.id}`}
                        label={
                          <div className="flex items-center gap-2">
                            <span style={{ color: theme === "dark" ? "rgba(255, 255, 255, 0.85)" : "inherit", fontWeight: 500 }}>
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </span>
                            {completedFields.has(field.id) && (
                              <CheckCircleOutlined className="text-green-500" />
                            )}
                          </div>
                        }
                        help={<span style={{ color: theme === "dark" ? "rgba(255, 255, 255, 0.45)" : "inherit", fontSize: "12px" }}>{field.help_text}</span>}
                        rules={[
                          {
                            required: field.required,
                            message: `${field.label} maydonini to&apos;ldirish majburiy!`,
                          },
                        ]}
                        valuePropName={field.field_type === "FILE" ? "fileList" : "value"}
                        getValueFromEvent={field.field_type === "FILE" ? (e) => (Array.isArray(e) ? e : e?.fileList) : undefined}
                      >
                        {renderFieldInput(field, theme)}
                      </Form.Item>
                    </div>
                  ))}

              </div>

              <div className="flex gap-4 pt-8 border-t" style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)" }}>
                <Button
                  size="large"
                  type="primary"
                  htmlType="submit"
                  loading={isCreating}
                  icon={<SendOutlined />}
                  className="h-[50px] text-lg font-bold rounded-xl border-0 shadow-lg"
                  style={{
                    flex: 1,
                    background: "linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.7))",
                    boxShadow: "0 8px 25px -8px #7367f0"
                  }}
                >
                  Arizani topshirish
                </Button>
              </div>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
}