"use client";

import { use, useState, useEffect } from "react";
import { Card, Spin, Tag, Button, Descriptions, Tabs, Modal, Form, Input, InputNumber, Select, Switch, Space, App, Row, Col, DatePicker, Radio, Checkbox, Upload } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useGet, usePut, usePost } from "@/lib/hooks";
import { apiRequest } from "@/lib/hooks/useUniversalFetch";
import { useThemeStore } from "@/lib/stores/themeStore";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { PlusOutlined, DeleteOutlined, EditOutlined, MinusCircleOutlined } from "@ant-design/icons";

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

interface Application {
  id: number;
  title: string;
  description: string;
  status: "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
  start_date: string;
  end_date: string;
  total_submissions: string;
  created_at: string;
  fields?: ApplicationField[];
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
  const [editingField, setEditingField] = useState<ApplicationField | null>(null);
  const [form] = Form.useForm();
  const [applicationForm] = Form.useForm();
  const { message, modal } = App.useApp();
  const fieldType = Form.useWatch("field_type", form);

  const { data: applicationData, isLoading } = useGet<{ data: Application }>(`/admin/application/${id}/`);
  const application = applicationData?.data;

  const { mutate: updateApplication, isPending: isUpdatingApplication } = usePut<{ data: Application }, Partial<Application>>(
    `/admin/application/${id}/update/`,
    {
      onSuccess: () => {
        message.success("Ariza muvaffaqiyatli yangilandi!");
        setIsApplicationModalOpen(false);
        queryClient.invalidateQueries({ queryKey: [`/admin/application/${id}/`] });
      },
      onError: (error) => {
        message.error(error.message || "Arizani yangilashda xatolik");
      },
    }
  );

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

  const handleUpdateField = async (fieldId: number, fieldData: CreateFieldData) => {
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

  const handlePublish = () => {
    if (application) {
      updateApplication({
        ...application,
        status: "PUBLISHED",
      });
    }
  };

  const handleClose = () => {
    if (application) {
      updateApplication({
        ...application,
        status: "CLOSED",
      });
    }
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
        status: application.status,
      });
      setIsApplicationModalOpen(true);
    }
  };

  const handleUpdateApplication = (values: {
    title: string;
    description: string;
    start_date: Dayjs | null;
    end_date: Dayjs | null;
    status: string;
  }) => {
    if (!application) return;

    const updateData: Partial<Application> = {
      title: values.title,
      description: values.description,
      start_date: values.start_date ? values.start_date.format("YYYY-MM-DD") : application.start_date,
      end_date: values.end_date ? values.end_date.format("YYYY-MM-DD") : application.end_date,
      status: values.status as Application["status"],
    };

    updateApplication(updateData);
  };

  // Update form when application data changes
  useEffect(() => {
    if (application && isApplicationModalOpen) {
      applicationForm.setFieldsValue({
        title: application.title,
        description: application.description,
        start_date: application.start_date ? dayjs(application.start_date) : null,
        end_date: application.end_date ? dayjs(application.end_date) : null,
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
      <div className="mb-6">
        <Link href="/admin-panel/applications">
          <Button type="link" className={theme === "dark" ? "text-gray-400 hover:text-white" : ""}>← Orqaga</Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>{application.title}</h1>

      <Card
        className="mb-6"
        style={{
          background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
          border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid #f0f0f0",
        }}
      >
        <Descriptions
          bordered
          column={1}
          contentStyle={{ color: theme === "dark" ? "#e2e8f0" : "inherit" }}
          labelStyle={{ color: theme === "dark" ? "#94a3b8" : "inherit", background: theme === "dark" ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.02)" }}
        >
          <Descriptions.Item label="ID">{application.id}</Descriptions.Item>
          <Descriptions.Item label="Holati">
            <Tag color={application.status === "PUBLISHED" ? "green" : "default"}>{application.status}</Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Boshlanish">{formatDate(application.start_date)}</Descriptions.Item>
          <Descriptions.Item label="Tugash">{formatDate(application.end_date)}</Descriptions.Item>
          <Descriptions.Item label="Arizalar soni">{application.total_submissions}</Descriptions.Item>
          <Descriptions.Item label="Tavsif">{application.description}</Descriptions.Item>

        </Descriptions>

        <div className="mt-6 flex gap-4">
          <Button type="default" icon={<EditOutlined />} onClick={handleEditApplication}>
            Tahrirlash
          </Button>
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
      </Card>

      <Card
        style={{
          background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
          border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid #f0f0f0",
        }}
      >
        <Tabs
          items={[

            {
              key: "fields",
              label: "Maydonlar",
              children: (
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
                  {application.fields && application.fields.length > 0 ? (
                    <div className="!space-y-2">
                      {application.fields
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map((field, index) => (
                          <Card
                            key={field.id + "-" + index}
                            className="border border-gray-200"
                            style={{
                              background: theme === "dark" ? "rgba(255, 255, 255, 0.02)" : "#ffffff",
                              borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "#e5e7eb",
                            }}
                            extra={
                              <Space>
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
                                <Tag>{field.field_type}</Tag>
                              </div>

                              {field.help_text && (
                                <p className="text-sm mb-2" style={{ color: theme === "dark" ? "#94a3b8" : "#4b5563" }}>{field.help_text}</p>
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
              ),
            },
            {
              key: "statistics",
              label: "Statistika",
              children: <div style={{ color: theme === "dark" ? "#e2e8f0" : "inherit" }}>Jami arizalar: {application.total_submissions}</div>,
            },
          ]}
        />
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

          <Form.Item
            name="status"
            label="Holati"
            rules={[{ required: true, message: "Holatni tanlang!" }]}
          >
            <Select placeholder="Holatni tanlang">
              <Select.Option value="DRAFT">DRAFT</Select.Option>
              <Select.Option value="PUBLISHED">PUBLISHED</Select.Option>
              <Select.Option value="CLOSED">CLOSED</Select.Option>
              <Select.Option value="ARCHIVED">ARCHIVED</Select.Option>
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
    </div>
  );
}
