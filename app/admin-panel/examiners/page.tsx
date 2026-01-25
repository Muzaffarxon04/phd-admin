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
  Avatar,
  Typography,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useGet, usePost, usePut, useDelete } from "@/lib/hooks";
import type { Examiner, Speciality } from "@/types";

const { Title } = Typography;
const { Option } = Select;

export default function ExaminersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExaminer, setEditingExaminer] = useState<Examiner | null>(null);
  const [form] = Form.useForm();

  // Fetch examiners
  const { data: examinersData, refetch: refetchExaminers, isLoading } = useGet<{
    count: number;
    next: string | null;
    previous: string | null;
    results: Examiner[];
  }>("/admin/examiners/");

  // Fetch specialities for dropdown
  const { data: specialities } = useGet<Speciality[]>("/examiner/");

  const examiners = examinersData?.results || [];

  // Mutations
  const createExaminer = usePost("/admin/examiners/create/", {
    onSuccess: () => {
      message.success("Imtihonchi muvaffaqiyatli yaratildi");
      setIsModalOpen(false);
      form.resetFields();
      refetchExaminers();
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

  const updateExaminer = usePut(`/admin/examiners/${editingExaminer?.id}/update/`, {
    onSuccess: () => {
      message.success("Imtihonchi muvaffaqiyatli yangilandi");
      setIsModalOpen(false);
      setEditingExaminer(null);
      form.resetFields();
      refetchExaminers();
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

  const deleteExaminer = useDelete(`/admin/examiners/${editingExaminer?.id}/delete/`, {
    onSuccess: () => {
      message.success("Imtihonchi muvaffaqiyatli o'chirildi");
      refetchExaminers();
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
    setEditingExaminer(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (examiner: Examiner) => {
    setEditingExaminer(examiner);
    form.setFieldsValue({
      full_name: examiner.full_name,
      email: examiner.email,
      phone: examiner.phone,
      specialization_id: examiner.specialization_id,
      degree: examiner.degree,
      position: examiner.position,
      organization: examiner.organization,
      is_active: examiner.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setEditingExaminer({ id } as Examiner);
    await deleteExaminer.mutateAsync();
  };

  const handleSubmit = (values: Record<string, unknown>) => {
    if (editingExaminer) {
      updateExaminer.mutate(values);
    } else {
      createExaminer.mutate(values);
    }
  };

  const columns = [
    {
      title: "F.I.O",
      dataIndex: "full_name",
      key: "full_name",
      render: (name: string) => (
        <div className="flex items-center gap-3">
          <Avatar icon={<UserOutlined />} />
          <span className="font-medium">{name}</span>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email: string) => (
        <div className="flex items-center gap-2">
          <MailOutlined className="text-gray-400" />
          <span>{email}</span>
        </div>
      ),
    },
    {
      title: "Telefon",
      dataIndex: "phone",
      key: "phone",
      render: (phone: string) => phone && (
        <div className="flex items-center gap-2">
          <PhoneOutlined className="text-gray-400" />
          <span>{phone}</span>
        </div>
      ),
    },
    {
      title: "Mutaxassislik",
      dataIndex: "specialization",
      key: "specialization",
      render: (specialization: Speciality) => specialization && (
        <Tag color="blue">{specialization.name}</Tag>
      ),
    },
    {
      title: "Daraja",
      dataIndex: "degree",
      key: "degree",
      render: (degree: string) => (
        <Tag color="purple">{degree}</Tag>
      ),
    },
    {
      title: "Lavozim",
      dataIndex: "position",
      key: "position",
    },
    {
      title: "Tashkilot",
      dataIndex: "organization",
      key: "organization",
      render: (org: string) => (
        <div className="flex items-center gap-2">
          <HomeOutlined className="text-gray-400" />
          <span>{org}</span>
        </div>
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
      title: "Amallar",
      key: "actions",
      render: (_: unknown, record: Examiner) => (
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
            title="Imtihonchini o'chirish"
            description="Haqiqatan ham bu imtihonchini o'chirmoqchimisiz?"
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
            { title: "Imtihonchilar" },
          ]}
          className="mb-4"
        />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Title level={2} className="mb-2">
              Imtihonchilar Boshqaruvi
            </Title>
            <p className="text-gray-600 dark:text-gray-400">
              PhD imtihonlarida qatnashuvchi imtihonchilarni boshqaring
            </p>
          </div>

          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            className="bg-gradient-to-r from-blue-500 to-purple-600 border-0"
          >
            Yangi Imtihonchi
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {examinersData?.count || 0}
          </div>
          <div className="text-gray-600 dark:text-gray-400">Jami Imtihonchilar</div>
        </Card>

        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">
            {examiners.filter(e => e.is_active).length}
          </div>
          <div className="text-gray-600 dark:text-gray-400">Faol Imtihonchilar</div>
        </Card>

        <Card className="text-center">
          <div className="text-2xl font-bold text-purple-600 mb-2">
            {new Set(examiners.map(e => e.specialization_id)).size}
          </div>
          <div className="text-gray-600 dark:text-gray-400">Mutaxassisliklar</div>
        </Card>
      </div>

      {/* Search and Table */}
      <Card>
        <div className="mb-4">
          <Input
            placeholder="Imtihonchi nomini qidiring..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        <Table
          columns={columns}
          dataSource={examiners.filter(examiner =>
            examiner.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            examiner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            examiner.specialization?.name.toLowerCase().includes(searchTerm.toLowerCase())
          )}
          loading={isLoading}
          rowKey="id"
          pagination={{
            total: examinersData?.count || 0,
            pageSize: 20,
            showSizeChanger: false,
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingExaminer ? "Imtihonchini tahrirlash" : "Yangi imtihonchi qo'shish"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingExaminer(null);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ is_active: true }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="full_name"
              label="To'liq ism"
              rules={[{ required: true, message: "Ismni kiriting" }]}
            >
              <Input placeholder="Familiya Ism Otasining ismi" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Emailni kiriting" },
                { type: "email", message: "To'g'ri email formatini kiriting" }
              ]}
            >
              <Input placeholder="email@example.com" />
            </Form.Item>

            <Form.Item name="phone" label="Telefon">
              <Input placeholder="+998901234567" />
            </Form.Item>

            <Form.Item
              name="specialization_id"
              label="Mutaxassislik"
              rules={[{ required: true, message: "Mutaxassislikni tanlang" }]}
            >
              <Select placeholder="Mutaxassislikni tanlang">
                {specialities?.map(speciality => (
                  <Option key={speciality.id} value={speciality.id}>
                    {speciality.code} - {speciality.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="degree"
              label="Ilmiy daraja"
              rules={[{ required: true, message: "Ilmiy darajani kiriting" }]}
            >
              <Select placeholder="Darajani tanlang">
                <Option value="PhD">PhD</Option>
                <Option value="DSc">DSc</Option>
                <Option value="Professor">Professor</Option>
                <Option value="Docent">Docent</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="position"
              label="Lavozim"
              rules={[{ required: true, message: "Lavozimni kiriting" }]}
            >
              <Input placeholder="Kafedra mudiri, Professor..." />
            </Form.Item>

            <Form.Item
              name="organization"
              label="Tashkilot"
              rules={[{ required: true, message: "Tashkilotni kiriting" }]}
            >
              <Input placeholder="Universitet nomi, Institut..." />
            </Form.Item>

            <Form.Item name="is_active" label="Faollik" valuePropName="checked">
              <input type="checkbox" className="rounded" />
            </Form.Item>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={() => {
                setIsModalOpen(false);
                setEditingExaminer(null);
                form.resetFields();
              }}
            >
              Bekor qilish
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createExaminer.isPending || updateExaminer.isPending}
            >
              {editingExaminer ? "Yangilash" : "Yaratish"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}