"use client";

import { useState } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  message,
  Popconfirm,
  Breadcrumb,
  Typography,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";
import { useGet, usePost, usePut, useDelete } from "@/lib/hooks";
import type { Speciality } from "@/types";
import { formatDate } from "@/lib/utils";

const { Title, Text } = Typography;
const { Option } = Select;

export default function SpecialitiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpeciality, setEditingSpeciality] = useState<Speciality | null>(null);
  const [form] = Form.useForm();

  // Fetch specialities
  const { data: specialitiesData, refetch: refetchSpecialities, isLoading } = useGet<{
    count: number;
    next: string | null;
    previous: string | null;
    results: Speciality[];
  }>("/examiner/");

  const specialities = specialitiesData?.results || [];

  // Mutations
  const createSpeciality = usePost("/examiner/create/", {
    onSuccess: () => {
      message.success("Mutaxassislik muvaffaqiyatli yaratildi");
      setIsModalOpen(false);
      form.resetFields();
      refetchSpecialities();
    },
    onError: (error) => {
      let errorMessage = error.message || "Xatolik yuz berdi";

      // Agar backenddan array formatida error kelgan bo'lsa
      const errorData = (error as { data?: unknown }).data;
      if (Array.isArray(errorData)) {
        errorMessage = errorData.join(", ");
      }

      message.error(errorMessage);
    },
  });

  const updateSpeciality = usePut(`/examiner/${editingSpeciality?.id}/update/`, {
    onSuccess: () => {
      message.success("Mutaxassislik muvaffaqiyatli yangilandi");
      setIsModalOpen(false);
      setEditingSpeciality(null);
      form.resetFields();
      refetchSpecialities();
    },
    onError: (error) => {
      let errorMessage = error.message || "Xatolik yuz berdi";

      // Agar backenddan array formatida error kelgan bo'lsa
      const errorData = (error as { data?: unknown }).data;
      if (Array.isArray(errorData)) {
        errorMessage = errorData.join(", ");
      }

      message.error(errorMessage);
    },
  });

  const deleteSpeciality = useDelete(`/examiner/${editingSpeciality?.id}/delete/`, {
    onSuccess: () => {
      message.success("Mutaxassislik muvaffaqiyatli o'chirildi");
      refetchSpecialities();
    },
    onError: (error) => {
      let errorMessage = error.message || "Xatolik yuz berdi";

      // Agar backenddan array formatida error kelgan bo'lsa
      const errorData = (error as { data?: unknown }).data;
      if (Array.isArray(errorData)) {
        errorMessage = errorData.join(", ");
      }

      message.error(errorMessage);
    },
  });

  const handleCreate = () => {
    setEditingSpeciality(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (speciality: Speciality) => {
    setEditingSpeciality(speciality);
    form.setFieldsValue({
      code: speciality.code,
      name: speciality.name,
      description: speciality.description,
      field_of_science: speciality.field_of_science,
      is_active: speciality.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setEditingSpeciality({ id } as Speciality);
    await deleteSpeciality.mutateAsync();
  };

  const handleSubmit = (values: Record<string, unknown>) => {
    if (editingSpeciality) {
      updateSpeciality.mutate(values);
    } else {
      createSpeciality.mutate(values);
    }
  };

  const columns = [
    {
      title: "Kod",
      dataIndex: "code",
      key: "code",
      render: (code: string) => (
        <Tag color="blue" className="font-mono">
          {code}
        </Tag>
      ),
    },
    {
      title: "Nomi",
      dataIndex: "name",
      key: "name",
      render: (name: string) => (
        <div className="flex items-center gap-3">
          <BookOutlined className="text-blue-500" />
          <div>
            <div className="font-medium">{name}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Fan sohasi",
      dataIndex: "field_of_science",
      key: "field_of_science",
      render: (field: string) => (
        <div className="flex items-center gap-2">
          <ExperimentOutlined className="text-purple-500" />
          <span>{field}</span>
        </div>
      ),
    },
    {
      title: "Tavsif",
      dataIndex: "description",
      key: "description",
      render: (description: string) => description && (
        <Text ellipsis={{ tooltip: description }} className="max-w-xs">
          {description}
        </Text>
      ),
    },
    {
      title: "Holati",
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Faol" : "Nofaol"}
        </Tag>
      ),
    },
    {
      title: "Yaratilgan",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => formatDate(date),
    },
    {
      title: "Amallar",
      key: "actions",
      render: (_: unknown, record: Speciality) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Tahrirlash
          </Button>
          <Popconfirm
            title="Mutaxassislikni o'chirish"
            description="Haqiqatan ham bu mutaxassislikni o'chirmoqchimisiz?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ha"
            cancelText="Yo'q"
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              O&apos;chirish
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <Breadcrumb
          items={[
            { href: "/admin-panel", title: "Admin Panel" },
            { title: "Mutaxassisliklar" },
          ]}
          className="mb-4"
        />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Title level={2} className="mb-2">
              Mutaxassisliklar Boshqaruvi
            </Title>
            <p className="text-gray-600 dark:text-gray-400">
              PhD dasturlari uchun mutaxassisliklarni boshqaring
            </p>
          </div>

          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            className="bg-gradient-to-r from-blue-500 to-purple-600 border-0"
          >
            Yangi Mutaxassislik
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {specialitiesData?.count || 0}
          </div>
          <div className="text-gray-600 dark:text-gray-400">Jami Mutaxassisliklar</div>
        </Card>

        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">
            {specialities.filter(s => s.is_active).length}
          </div>
          <div className="text-gray-600 dark:text-gray-400">Faol Mutaxassisliklar</div>
        </Card>

        <Card className="text-center">
          <div className="text-2xl font-bold text-purple-600 mb-2">
            {new Set(specialities.map(s => s.field_of_science)).size}
          </div>
          <div className="text-gray-600 dark:text-gray-400">Fan Sohalari</div>
        </Card>
      </div>

      {/* Search and Table */}
      <Card>
        <div className="mb-4">
          <Input
            placeholder="Mutaxassislik nomini qidiring..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        <Table
          columns={columns}
          dataSource={specialities.filter(speciality =>
            speciality.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            speciality.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            speciality.field_of_science.toLowerCase().includes(searchTerm.toLowerCase())
          )}
          loading={isLoading}
          rowKey="id"
          pagination={{
            total: specialitiesData?.count || 0,
            pageSize: 20,
            showSizeChanger: false,
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingSpeciality ? "Mutaxassislikni tahrirlash" : "Yangi mutaxassislik qo'shish"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingSpeciality(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ is_active: true }}
        >
          <Form.Item
            name="code"
            label="Kod"
            rules={[
              { required: true, message: "Kodni kiriting" },
              { pattern: /^\d{2}\.\d{2}\.\d{2}$/, message: "Kod format: 00.00.00" }
            ]}
          >
            <Input placeholder="03.00.01" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Nomi"
            rules={[{ required: true, message: "Nomni kiriting" }]}
          >
            <Input placeholder="Biokimyo" />
          </Form.Item>

          <Form.Item
            name="field_of_science"
            label="Fan sohasi"
            rules={[{ required: true, message: "Fan sohasini kiriting" }]}
          >
            <Select placeholder="Fan sohasini tanlang">
              <Option value="Tabiiy fanlar">Tabiiy fanlar</Option>
              <Option value="Texnik fanlar">Texnik fanlar</Option>
              <Option value="Ijtimoiy-gumanitar fanlar">Ijtimoiy-gumanitar fanlar</Option>
              <Option value="Tibbiyot fanlari">Tibbiyot fanlari</Option>
              <Option value="Qishloq xo&apos;jaligi fanlari">Qishloq xo&apos;jaligi fanlari</Option>
              <Option value="Iqtisodiyot fanlari">Iqtisodiyot fanlari</Option>
              <Option value="Huquq fanlari">Huquq fanlari</Option>
              <Option value="Pedagogika fanlari">Pedagogika fanlari</Option>
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Tavsif">
            <Input.TextArea
              placeholder="Mutaxassislik haqida qisqacha ma'lumot"
              rows={3}
            />
          </Form.Item>

          <Form.Item name="is_active" label="Faollik" valuePropName="checked">
            <input type="checkbox" className="rounded" />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={() => {
                setIsModalOpen(false);
                setEditingSpeciality(null);
                form.resetFields();
              }}
            >
              Bekor qilish
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createSpeciality.isPending || updateSpeciality.isPending}
            >
              {editingSpeciality ? "Yangilash" : "Yaratish"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}