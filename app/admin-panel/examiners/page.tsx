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

} from "@ant-design/icons";
import { useGet, usePost, useDelete } from "@/lib/hooks";
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
    total_elements: number;
    next: string | null;
    previous: string | null;
    page_size:string
    to:number
    from:number
    data: {
      data:Examiner[]};
  }>("/examiner/list/");

  // Fetch specialities for dropdown
  const { data: specialities } = useGet<{data:{data:Speciality[]};
    total_elements: number;
    next: string | null;
    previous: string | null;
    page_size:string
    to:number
    from:number;
  }>("/speciality/list/");

  const examiners = examinersData?.data?.data || [];
const specialitiesList = specialities?.data?.data

  // Mutations
  const createExaminer = usePost("/examiner/create/", {
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

  const updateExaminer = usePost(`/examiner/${editingExaminer?.id}/update/`, {
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

  const deleteExaminer = useDelete(`/examiner/${editingExaminer?.id}/delete/`, {
    onSuccess: () => {
      message.success("Imtihonchi muvaffaqiyatli o'chirildi");
      refetchExaminers();
    },
    onError: (error) => {
      console.log(error);
      
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
      first_name: examiner.first_name,
      last_name: examiner.last_name,
      title: examiner.title,
      specialization_ids: examiner.specialization_ids
      ? [examiner.specialization_ids]
      : [],
      department: examiner.department,
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
      key: "first_name",
      render: (_item: string, record: Examiner) => (
        <div className="flex items-center gap-3">
          <Avatar icon={<UserOutlined />}  className="shrink-0"/>
          <span className="font-medium">
            {record.first_name} {record.last_name}
          </span>
        </div>
      ),
    },
    {
      title: "Ilmiy unvon",
      dataIndex: "title",
      key: "title",
      render: (title: string) => (
        <Tag color="purple">{title}</Tag>
      ),
    },
    {
      title: "Bo‘lim",
      dataIndex: "department",
      key: "department",
      render: (department: string) => (
        <div className="flex items-center gap-2">
          <span>{department}</span>
        </div>
      ),
    },
    {
      title: "Mutaxassisliklar",
      dataIndex: "specialities_count",
      key: "specialities_count",
      render: (count: number) => (
        <Tag color="blue">{count} ta</Tag>
      ),
    },
    {
      title: "Ko‘rib chiqilgan",
      dataIndex: "reviews_count",
      key: "reviews_count",
      render: (count: number) => (
        <Tag color="green">{count}</Tag>
      ),
    },
    {
      title: "Kutilayotgan",
      dataIndex: "pending_reviews",
      key: "pending_reviews",
      render: (count: number) => (
        <Tag color={count > 0 ? "orange" : "default"}>
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
      render: (_: unknown, record:Examiner) => (
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
    <div className="min-h-screen">
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
            className=" from-blue-500 to-purple-600 border-0"
          >
            Yangi Imtihonchi
          </Button>
        </div>
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
            examiner.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            examiner.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            examiner.department?.toLowerCase().includes(searchTerm.toLowerCase()) || examiner.title?.toLowerCase().includes(searchTerm.toLowerCase())
          )}
          loading={isLoading}
          rowKey="id"
          scroll={{
            x:1300
          }}
          pagination={{
            total: examinersData?.total_elements || 0,
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
              name="first_name"
              label="Ism"
              rules={[{ required: true, message: "Ismni kiriting" }]}
            >
              <Input placeholder="Ism" />
            </Form.Item>
<Form.Item
              name="last_name"
              label="Familiya"
              rules={[{ required: true, message: "Familiyani kiriting" }]}
            >
              <Input placeholder="Familiya" />
            </Form.Item>
          
          <Form.Item
              name="title"
              label="Ilmiy unvon"
              rules={[{ required: true, message: "Ilmiy unvoni kiriting" }]}
            >
              <Input placeholder="Ilmiy unvon" />
            </Form.Item>

       

       
            <Form.Item
              name="department"
              label="Lavozim"
              rules={[{ required: true, message: "Lavozimni kiriting" }]}
            >
              <Input placeholder="Kafedra, Professor..." />
            </Form.Item>

            <Form.Item
  name="specialization_ids"
  label="Mutaxassisliklar"
  rules={[{ required: true, message: "Kamida bitta mutaxassislik tanlang" }]}
>
  <Select
    mode="multiple"
    allowClear
    placeholder="Mutaxassisliklarni tanlang"
  >
    {specialitiesList?.map((speciality) => (
      <Option key={speciality.id} value={speciality.id}>
        {speciality.code} - {speciality.name}
      </Option>
    ))}
  </Select>
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