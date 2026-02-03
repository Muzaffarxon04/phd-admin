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
  SolutionOutlined,
  ClusterOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StarOutlined
} from "@ant-design/icons";
import { useGet, usePost, useDelete } from "@/lib/hooks";
import { useThemeStore } from "@/lib/stores/themeStore";
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
    page_size: string
    to: number
    from: number
    data: {
      data: Examiner[]
    };
  }>("/examiner/list/");

  // Fetch specialities for dropdown
  const { data: specialities } = useGet<{
    data: { data: Speciality[] };
    total_elements: number;
    next: string | null;
    previous: string | null;
    page_size: string
    to: number
    from: number;
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


  const { theme } = useThemeStore();

  const columns = [
    {
      title: (
        <div className="flex items-center gap-2 py-3 px-4">
          <UserOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Imtihonchi F.I.O</span>
        </div>
      ),
      key: "name_info",
      render: (_: unknown, record: Examiner) => (
        <div className="flex items-center gap-3 px-4 py-2">
          <Avatar
            icon={<UserOutlined />}
            className="shrink-0 ring-2 ring-[#7367f0]/20"
            style={{ backgroundColor: theme === "dark" ? "#7367f020" : "#7367f010", color: "#7367f0" }}
          />
          <div className="flex flex-col">
            <span className={`font-bold text-sm ${theme === "dark" ? "text-gray-200" : "text-[#484650]"}`}>
              {record.first_name} {record.last_name}
            </span>
            <span className="text-xs text-gray-400 font-medium">#{record.id}</span>
          </div>
        </div>
      ),
      width: 250,
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <SolutionOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Ilmiy unvon</span>
        </div>
      ),
      dataIndex: "title",
      key: "title",
      render: (title: string) => (
        <span className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-500 text-[10px] font-bold uppercase border border-purple-500/20">
          {title}
        </span>
      ),
      width: 150,
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <ClusterOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Lavozim</span>
        </div>
      ),
      dataIndex: "department",
      key: "department",
      render: (department: string) => (
        <div className="text-xs font-medium" style={{ color: theme === "dark" ? "#94a3b8" : "#64748b" }}>
          {department}
        </div>
      ),
      width: 200,
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <StarOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Faollik</span>
        </div>
      ),
      key: "activity",
      render: (_: unknown, record: Examiner) => (
        <div className="flex flex-col gap-1 py-1">
          <div className="text-[10px] flex items-center gap-1">
            <span className="text-green-500 font-bold uppercase tracking-tighter">Ko&apos;rilgan:</span>
            <span className="font-bold">{record.reviews_count || 0}</span>
          </div>
          <div className="text-[10px] flex items-center gap-1">
            <span className="text-orange-500 font-bold uppercase tracking-tighter">Kutilayotgan:</span>
            <span className="font-bold">{record.pending_reviews || 0}</span>
          </div>
        </div>
      ),
      width: 180,
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <CheckCircleOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Holati</span>
        </div>
      ),
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive: boolean) => (
        <div className="py-2">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isActive ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
            }`}>
            {isActive ? "Faol" : "Nofaol"}
          </span>
        </div>
      ),
      width: 120,
    },
    {
      title: (
        <div className="flex items-center justify-center py-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Amallar</span>
        </div>
      ),
      key: "actions",
      width: 120,
      render: (_: unknown, record: Examiner) => (
        <div className="flex items-center justify-center gap-2 py-2">
          <Button
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#7367f0]/10 text-[#7367f0] border-0 hover:bg-[#7367f0] hover:text-white transition-all duration-300 shadow-sm"
            icon={<EditOutlined style={{ fontSize: "18px" }} />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="O&apos;chirish"
            description="Haqiqatan ham o&apos;chirmoqchimisiz?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ha"
            cancelText="Yo&apos;q"
            overlayClassName="premium-popconfirm"
          >
            <Button
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/10 text-red-500 border-0 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm"
              icon={<DeleteOutlined style={{ fontSize: "18px" }} />}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];


  return (
    <div className="space-y-6" style={{ color: theme === "dark" ? "#ffffff" : "#484650" }}>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Title level={4} className="!mb-1" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
            Imtihonchilar Boshqaruvi
          </Title>
          <div className="text-gray-400 text-sm font-medium">PhD imtihonlarida qatnashuvchi imtihonchilarni boshqarish</div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            className="h-[42px] px-6 rounded-xl border-0 shadow-lg font-bold flex items-center gap-2"
            style={{
              background: "linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.7))",
              boxShadow: "0 8px 25px -8px #7367f0",
            }}
          >
            Yangi imtihonchi
          </Button>
        </div>
      </div>

      <div
        className="rounded-xl overflow-hidden transition-all duration-300"
        style={{
          background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
          border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
          boxShadow: theme === "dark" ? "none" : "0 4px 12px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div className="p-6 border-b" style={{ borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)" }}>
          <div className="relative max-w-md">
            <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7367f0] opacity-70 z-10" />
            <Input
              placeholder="Imtihonchi nomini qidiring..."
              className="pl-9 pr-4 py-2 w-full rounded-xl transition-all duration-300"
              style={{
                background: theme === "dark" ? "rgb(30, 38, 60)" : "#f8f8f8",
                border: "none",
                color: theme === "dark" ? "#ffffff" : "#484650",
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
          className="custom-admin-table"
          scroll={{ x: 1000 }}
          pagination={{
            total: examinersData?.total_elements || 0,
            pageSize: 20,
            showTotal: (total, range) => `${range[0]}-${range[1]} dan ${total} ta`,
            className: "px-6 py-4",
          }}
        />
        <style jsx global>{`
          .custom-admin-table .ant-table {
            background: transparent !important;
            color: ${theme === "dark" ? "#e2e8f0" : "#484650"} !important;
          }
          .custom-admin-table .ant-table-thead > tr > th {
            background: ${theme === "dark" ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.01)"} !important;
            border-bottom: ${theme === "dark" ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(0, 0, 0, 0.05)"} !important;
            color: ${theme === "dark" ? "#94a3b8" : "#64748b"} !important;
            font-weight: 700 !important;
          }
          .custom-admin-table .ant-table-tbody > tr > td {
            border-bottom: ${theme === "dark" ? "1px solid rgba(255, 255, 255, 0.03)" : "1px solid rgba(0, 0, 0, 0.03)"} !important;
            padding: 12px 16px !important;
          }
          .custom-admin-table .ant-table-tbody > tr:hover > td {
            background: ${theme === "dark" ? "rgba(115, 103, 240, 0.05)" : "rgba(115, 103, 240, 0.02)"} !important;
          }
          .custom-admin-table .ant-pagination-item-active {
            border-color: #7367f0 !important;
            background: #7367f0 !important;
          }
          .custom-admin-table .ant-pagination-item-active a {
            color: #fff !important;
          }
          
          .premium-modal .ant-modal-content {
            background: ${theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff"} !important;
            color: ${theme === "dark" ? "#ffffff" : "#000000"} !important;
            border: ${theme === "dark" ? "1px solid rgb(59, 66, 83)" : "none"} !important;
            border-radius: 16px !important;
          }
          .premium-modal .ant-modal-header {
            background: transparent !important;
            border-bottom: ${theme === "dark" ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(0, 0, 0, 0.05)"} !important;
          }
          .premium-modal .ant-modal-title {
            color: ${theme === "dark" ? "#ffffff" : "#000000"} !important;
          }
          .premium-modal .ant-form-item-label > label {
            color: ${theme === "dark" ? "#94a3b8" : "#64748b"} !important;
          }
          .premium-modal .ant-input, .premium-modal .ant-select-selector {
            background: ${theme === "dark" ? "rgb(30, 38, 60)" : "#f8f8f8"} !important;
            border: ${theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)"} !important;
            color: ${theme === "dark" ? "#ffffff" : "#484650"} !important;
            border-radius: 12px !important;
          }
          .premium-popconfirm .ant-popover-inner {
            background: ${theme === "dark" ? "rgb(50, 58, 80)" : "#ffffff"} !important;
            color: ${theme === "dark" ? "#ffffff" : "#000000"} !important;
          }
        `}</style>
      </div>

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
        className="premium-modal"
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