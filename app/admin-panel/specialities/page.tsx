"use client";

import { useState } from "react";
import { useThemeStore } from "@/lib/stores/themeStore";
import {
  Table,
  Button,
  Input,
  Modal,
  Form,
  message,
  Popconfirm,
  Typography,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
  CodeOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  FileTextOutlined
} from "@ant-design/icons";
import { useGet, usePost, usePut, useDelete } from "@/lib/hooks";
import type { Speciality } from "@/types";
// import { formatDate } from "@/lib/utils";

const { Title } = Typography;

export default function SpecialitiesPage() {
  const { theme } = useThemeStore();
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
      title: (
        <div className="flex items-center gap-2 py-3 px-4">
          <BookOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Mutaxassislik nomi</span>
        </div>
      ),
      dataIndex: "name",
      key: "name",
      render: (name: string) => (
        <div className="px-4 py-2 font-bold text-sm" style={{ color: theme === "dark" ? "#e2e8f0" : "#484650" }}>
          {name}
        </div>
      ),
      width: 300,
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <CodeOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Kodi</span>
        </div>
      ),
      dataIndex: "code",
      key: "code",
      render: (code: string) => (
        <span className="px-2 py-1 rounded-lg bg-[#7367f0]/10 text-[#7367f0] text-xs font-bold border border-[#7367f0]/20">
          {code}
        </span>
      ),
      width: 150,
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <FileTextOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Arizalar</span>
        </div>
      ),
      dataIndex: "applications_count",
      key: "applications_count",
      render: (count: number) => (
        <div className="py-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${count > 0 ? "text-green-500 bg-green-500/10 border-green-500/20" : "text-gray-400 bg-gray-500/5 border-gray-500/10"
            }`}>
            {count} ta
          </span>
        </div>
      ),
      width: 120,
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <TeamOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Imtihonchilar</span>
        </div>
      ),
      dataIndex: "examiners_count",
      key: "examiners_count",
      render: (count: number) => (
        <div className="py-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${count > 0 ? "text-blue-500 bg-blue-500/10 border-blue-500/20" : "text-gray-400 bg-gray-500/5 border-gray-500/10"
            }`}>
            {count} ta
          </span>
        </div>
      ),
      width: 150,
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
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Amallar</span>
        </div>
      ),
      key: "actions",
      width: 120,
      render: (_: unknown, record: Speciality) => (
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
            Mutaxassisliklar Boshqaruvi
          </Title>
          <div className="text-gray-400 text-sm font-medium">PhD dasturlari uchun mutaxassisliklar ro&apos;yxati va ularni boshqarish</div>
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
            Yangi mutaxassislik
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
              placeholder="Mutaxassislik nomini qidiring..."
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
          dataSource={specialities.filter(speciality =>
            speciality.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            speciality.code.toLowerCase().includes(searchTerm.toLowerCase())
          )}
          loading={isLoading}
          rowKey="id"
          className="custom-admin-table"
          pagination={{
            total: specialitiesData?.count || 0,
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
          .premium-modal .ant-modal-close {
            color: ${theme === "dark" ? "#ffffff" : "#000000"} !important;
          }
          .premium-modal .ant-form-item-label > label {
            color: ${theme === "dark" ? "#94a3b8" : "#64748b"} !important;
          }
          .premium-modal .ant-input, .premium-modal .ant-input-textarea {
            background: ${theme === "dark" ? "rgb(30, 38, 60)" : "#f8f8f8"} !important;
            border: ${theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)"} !important;
            color: ${theme === "dark" ? "#ffffff" : "#484650"} !important;
            border-radius: 12px !important;
          }
          .premium-popconfirm .ant-popover-inner {
            background: ${theme === "dark" ? "rgb(50, 58, 80)" : "#ffffff"} !important;
            color: ${theme === "dark" ? "#ffffff" : "#000000"} !important;
            border: ${theme === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" : "none"} !important;
          }
          .premium-popconfirm .ant-popover-message, .premium-popconfirm .ant-popover-description {
            color: ${theme === "dark" ? "#e2e8f0" : "inherit"} !important;
          }
        `}</style>
      </div>

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
        className="premium-modal"
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

          <div className="flex justify-end gap-3 mt-6">
            <Button
              className="rounded-xl"
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
              className="rounded-xl flex items-center gap-2"
              loading={createSpeciality.isPending || updateSpeciality.isPending}
              style={{
                background: "linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.7))",
                border: "none"
              }}
            >
              {editingSpeciality ? "Yangilash" : "Yaratish"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}