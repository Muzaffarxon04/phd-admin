"use client";

import { use } from "react";
import { 
  Card, 
  Button, 
  Alert, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Radio, 
  Checkbox, 
  DatePicker, 
  Upload, 
  Progress,
  Tag,
  Timeline,
  Divider,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Badge,
  Tooltip,
  message
} from "antd";
import { 
  useGet, 
  usePost 
} from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeftOutlined, 
  UploadOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  DollarOutlined,
  CalendarOutlined,
  TrophyOutlined,
  InfoCircleOutlined,
  SaveOutlined,
  SendOutlined
} from "@ant-design/icons";
import { formatDate, parseMoneyAmount } from "@/lib/utils";
import { type Dayjs } from "dayjs";
import { useState } from "react";

const { Title, Text, Paragraph } = Typography;

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
          size="large"
          className="w-full"
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
          className="w-full"
        />
      );

    case "EMAIL":
      return <Input type="email" placeholder={field.placeholder || "email@example.com"} size="large" />;

    case "PHONE":
      return <Input type="tel" placeholder={field.placeholder || "+998901234567"} size="large" />;

    case "NUMBER":
      return (
        <InputNumber
          className="w-full"
          placeholder={field.placeholder}
          min={field.min_value ? parseFloat(field.min_value) : undefined}
          max={field.max_value ? parseFloat(field.max_value) : undefined}
          size="large"
          style={{ width: "100%" }}
        />
      );

    case "DATE":
      return (
        <DatePicker 
          className="w-full" 
          format="YYYY-MM-DD" 
          placeholder={field.placeholder} 
          size="large"
        />
      );

    case "SELECT":
      return (
        <Select placeholder={field.placeholder || "Tanlang"} size="large" className="w-full">
          {options.map((opt, index) => (
            <Select.Option key={index} value={opt}>
              {opt}
            </Select.Option>
          ))}
        </Select>
      );

    case "RADIO":
      return (
        <Radio.Group className="w-full">
          {options.map((opt, index) => (
            <Radio key={index} value={opt} className="mb-2">
              {opt}
            </Radio>
          ))}
        </Radio.Group>
      );

    case "CHECKBOX":
      return (
        <Checkbox.Group className="w-full">
          {options.map((opt, index) => (
            <Checkbox key={index} value={opt} className="mb-2">
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
          className="w-full"
        >
          <Button icon={<UploadOutlined />} size="large" block>
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
        />
      );

    default:
      return <Input placeholder={field.placeholder} size="large" className="w-full" />;
  }
};

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completedFields, setCompletedFields] = useState<Set<number>>(new Set());
  const { theme } = useThemeStore();

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

  // Track field completion
  const handleFieldChange = (fieldId: number, value: unknown) => {
    setCompletedFields(prev => {
      const newSet = new Set(prev);
      if (value && value !== "" && value !== null && value !== undefined) {
        newSet.add(fieldId);
      } else {
        newSet.delete(fieldId);
      }
      return newSet;
    });
  };

  const calculateProgress = () => {
    if (!application) return 0;
    
    const totalFields = application.fields.length;
    const completedCount = completedFields.size;
    return Math.round((completedCount / totalFields) * 100);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (!application) return;

    const answers: Array<{ field_id: number; answer_text?: string; file?: File }> = [];

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Ariza yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
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

  const progress = calculateProgress();
  const canApply = application.can_apply.can_apply;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className={`text-white ${
        theme === "dark" 
          ? "bg-gradient-to-r from-blue-700 to-purple-700" 
          : "bg-gradient-to-r from-blue-600 to-purple-600"
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/applications">
              <Button 
                type="primary" 
                icon={<ArrowLeftOutlined />}
                className="bg-white/20 hover:bg-white/30 border-white/20"
              >
                Orqaga
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{application.title}</h1>
              <p className="text-blue-100">Ariza topshirish</p>
            </div>
          </div>

          {/* Progress and Stats */}
          <Row gutter={[24, 24]} className="mb-6">
            <Col xs={24} sm={8}>
              <div className={`backdrop-blur-sm rounded-lg p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <span>To&apos;ldirish holati</span>
                  <Badge count={`${progress}%`} color="green" />
                </div>
                <Progress percent={progress} showInfo={false} />
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className={`backdrop-blur-sm rounded-lg p-4 text-center`}>
                <DollarOutlined className="text-2xl mb-2" />
                <div className="text-xl font-bold">{parseMoneyAmount(application.application_fee)}</div>
                <div className="text-sm text-blue-100">To&apos;lov miqdori</div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className={`backdrop-blur-sm rounded-lg p-4 text-center`}>
                <CalendarOutlined className="text-2xl mb-2" />
                <div className="text-xl font-bold">{formatDate(application.end_date)}</div>
                <div className="text-sm text-blue-100">Tugash muddati</div>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {!canApply && (
          <Alert
            message={application.can_apply.reason}
            type="warning"
            showIcon
            className="mb-8"
            action={
              <Button size="small" type="link">
                Ko&apos;proq ma&apos;lumot
              </Button>
            }
          />
        )}

        {/* Application Info */}
        <Card className="mb-8" style={{ background: theme === "dark" ? "#1a1d29" : "#ffffff", color: theme === "dark" ? "#ffffff" : "#333333" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CalendarOutlined className="text-blue-500" />
                <div>
                  <Text className="text-gray-500">Boshlanish sanasi</Text>
                  <div className="font-semibold">{formatDate(application.start_date)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CalendarOutlined className="text-purple-500" />
                <div>
                  <Text className="text-gray-500">Tugash sanasi</Text>
                  <div className="font-semibold">{formatDate(application.end_date)}</div>
                </div>
              </div>
              {application.exam_date && (
                <div className="flex items-center gap-3">
                  <CalendarOutlined className="text-green-500" />
                  <div>
                    <Text className="text-gray-500">Imtihon sanasi</Text>
                    <div className="font-semibold">{formatDate(application.exam_date)}</div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FileTextOutlined className="text-blue-500" />
                <div>
                  <Text className="text-gray-500">Imtihon turi</Text>
                  <div className="font-semibold">Fanlararo PhD</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TrophyOutlined className="text-purple-500" />
                <div>
                  <Text className="text-gray-500">Arizalar soni</Text>
                  <div className="font-semibold">
                    {application.user_submission_count || 0}/{application.max_submissions || "Cheksiz"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {application.requires_oneid_verification ? (
                  <ExclamationCircleOutlined className="text-orange-500" />
                ) : (
                  <CheckCircleOutlined className="text-green-500" />
                )}
                <div>
                  <Text className="text-gray-500">Tekshirish</Text>
                  <div className="font-semibold">
                    {application.requires_oneid_verification ? "Talab qilinadi" : "Zarur emas"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Description */}
        <Card className="mb-8" style={{ background: theme === "dark" ? "#1a1d29" : "#ffffff", color: theme === "dark" ? "#ffffff" : "#333333" }}>
          <Title level={4} className="mb-4">Ariza tavsifi</Title>
          <Paragraph className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {application.description}
          </Paragraph>
        </Card>

        {/* Instructions */}
        {application.instructions && (
          <Card className="mb-8 border-l-4 border-l-blue-500" style={{ background: theme === "dark" ? "#1a1d29" : "#ffffff", color: theme === "dark" ? "#ffffff" : "#333333" }}>
            <Title level={4} className="mb-4 flex items-center gap-2">
              <InfoCircleOutlined className="text-blue-500" />
              Ko&apos;rsatmalar
            </Title>
            <Paragraph className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {application.instructions}
            </Paragraph>
          </Card>
        )}

        {/* Application Form */}
        {canApply && (
          <Card className="mb-8" style={{ background: theme === "dark" ? "#1a1d29" : "#ffffff", color: theme === "dark" ? "#ffffff" : "#333333" }}>
            <Title level={4} className="mb-6">Ariza to&apos;ldirish</Title>
            
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
              className="space-y-6"
            >
              {application.fields
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((field, index) => (
                  <div key={field.id} className="relative">
                    <Form.Item
                      name={`field_${field.id}`}
                      label={
                        <div className="flex items-center gap-2">
                          <span>
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </span>
                          {completedFields.has(field.id) && (
                            <CheckCircleOutlined className="text-green-500" />
                          )}
                        </div>
                      }
                      help={field.help_text}
                      rules={[
                        {
                          required: field.required,
                          message: `${field.label} maydonini to&apos;ldirish majburiy!`,
                        },
                      ]}
                      valuePropName={field.field_type === "FILE" ? "fileList" : "value"}
                      getValueFromEvent={field.field_type === "FILE" ? (e) => (Array.isArray(e) ? e : e?.fileList) : undefined}
                    >
                      {renderFieldInput(field)}
                    </Form.Item>
                  </div>
                ))}

              <div className="flex gap-4 pt-6 border-t">
                <Button
                  size="large"
                  type="default"
                  icon={<SaveOutlined />}
                  loading={saving}
                  className="flex-1"
                >
                  Saqlash
                </Button>
                <Button
                  size="large"
                  type="primary"
                  htmlType="submit"
                  loading={isCreating}
                  icon={<SendOutlined />}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-0"
                >
                  Arizani topshirish
                </Button>
              </div>
            </Form>
          </Card>
        )}
      </div>
    </div>
  );
}