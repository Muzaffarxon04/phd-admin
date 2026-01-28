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

} from "@ant-design/icons";
import { useGet, usePost, usePut, useDelete } from "@/lib/hooks";
import type { Speciality } from "@/types";
// import { formatDate } from "@/lib/utils";

const { Title } = Typography;

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
    data: {
      data: Speciality[];
    };
  }>("/speciality/list/");

  const specialities = specialitiesData?.data?.data || [];

  // Mutations
  const createSpeciality = usePost("/speciality/create/", {
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

  const updateSpeciality = usePut(`/speciality/${editingSpeciality?.id}/update/`, {
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

  const deleteSpeciality = useDelete(`/speciality/${editingSpeciality?.id}/delete/`, {
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
      title: "Mutaxassislik nomi",
      dataIndex: "name",
      key: "name",
      render: (name: string) => (
        <div className="flex items-center gap-3">
          <span className="font-medium">{name}</span>
        </div>
      ),
    },
    {
      title: "Kodi",
      dataIndex: "code",
      key: "code",
      render: (code: string) => (
        <Tag color="geekblue">{code}</Tag>
      ),
    },
    {
      title: "Arizalar",
      dataIndex: "applications_count",
      key: "applications_count",
      render: (count: number) => (
        <Tag color={count > 0 ? "green" : "default"}>
          {count}
        </Tag>
      ),
    },
    {
      title: "Imtihonchilar",
      dataIndex: "examiners_count",
      key: "examiners_count",
      render: (count: number) => (
        <Tag color={count > 0 ? "blue" : "default"}>
          {count}
        </Tag>
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
      title: "Yaratilgan sana",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) =>
        new Date(date).toLocaleDateString("uz-UZ"),
    },
    {
      title: "Amallar",
      key: "actions",
      width: 100,
      render: (_: unknown, record:Speciality) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
          
            onClick={() => handleEdit(record)}
          >
            <EditOutlined />
          </Button>
  
          <Popconfirm
            title="O‘chirish"
            description="Haqiqatan ham o‘chirmoqchimisiz?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ha"
            cancelText="Yo‘q"
          >
            <Button danger size="small" >
            <DeleteOutlined />
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  

  return (
    <div className="min-h-screen ">
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
            className=" from-blue-500 to-purple-600 border-0"
          >
            Yangi Mutaxassislik
          </Button>
        </div>
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
            speciality.code.toLowerCase().includes(searchTerm.toLowerCase()) 
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
             
            ]}
          >
            <Input placeholder="Masalan: 03.00.01" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Nomi"
            rules={[{ required: true, message: "Nomni kiriting" }]}
          >
            <Input placeholder="Biokimyo" />
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