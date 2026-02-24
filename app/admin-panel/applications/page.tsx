"use client";

import { useState } from "react";
import { Table, Button, Typography, Popconfirm, message, Modal, Form, Input, Select, Row, Col, DatePicker, Space } from "antd";
const { Title } = Typography;
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import {
  EyeOutlined,
  PlusOutlined,
  CalendarOutlined,
  TrophyOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useGet, usePut } from "@/lib/hooks";
import { apiRequest } from "@/lib/hooks/useUniversalFetch";
import { useQueryClient } from "@tanstack/react-query";
import { useThemeStore } from "@/lib/stores/themeStore";
import { TableSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import Link from "next/link";
import { formatDate, getApplicationStatusLabel } from "@/lib/utils";

interface Application {
  id: number;
  title: string;
  description: string;
  status: "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
  start_date: string;
  end_date: string;
  exam_date?: string | null;
  application_fee?: string;
  total_submissions: number;
  is_open?: boolean;
  is_upcoming?: boolean;
  is_closed?: boolean;
  created_by_name: string;
  created_at: string;
}

export default function AdminApplicationsPage() {
  const { theme } = useThemeStore();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data: applicationsData, isLoading, error } = useGet<{
    next: string | null;
    previous: string | null;
    total_elements: number;
    page_size: number;
    data: {
      message: string;
      error: string | null;
      status: number;
      data: Application[];
    };
    from: number;
    to: number;
  }>(`/admin/application/?page=${currentPage}&page_size=${pageSize}`);

  const applicationsEndpoint = `/admin/application/?page=${currentPage}&page_size=${pageSize}`;

  // Extract applications from nested response structure
  const applications = applicationsData?.data?.data || [];
  const totalElements = applicationsData?.total_elements || 0;

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [editForm] = Form.useForm();

  const editId = editingApplication?.id ?? 0;
  const { mutate: updateApplication, isPending: isUpdatingApplication } = usePut<{ data: Application }>(
    `/admin/application/${editId}/update/`,
    {
      onSuccess: () => {
        message.success("Ariza muvaffaqiyatli yangilandi!");
        const updatedId = editingApplication?.id;
        setEditingApplication(null);
        editForm.resetFields();
        queryClient.invalidateQueries({ queryKey: [applicationsEndpoint] });
        queryClient.refetchQueries({ queryKey: [applicationsEndpoint] });
        if (updatedId) {
          queryClient.invalidateQueries({ queryKey: [`/admin/application/${updatedId}/`] });
        }
      },
      onError: (error) => {
        message.error(error.message || "Arizani yangilashda xatolik");
      },
    }
  );

  const handleEdit = (record: Application) => {
    setEditingApplication(record);
    editForm.setFieldsValue({
      title: record.title,
      description: record.description,
      start_date: record.start_date ? dayjs(record.start_date) : null,
      end_date: record.end_date ? dayjs(record.end_date) : null,
      exam_date: record.exam_date ? dayjs(record.exam_date) : null,
      status: record.status,
    });
  };

  const handleUpdateApplication = (values: {
    title: string;
    description: string;
    start_date: Dayjs | null;
    end_date: Dayjs | null;
    exam_date?: Dayjs | null;
    status: string;
  }) => {
    if (!editingApplication) return;
    updateApplication({
      title: values.title,
      description: values.description,
      start_date: values.start_date ? values.start_date.format("YYYY-MM-DD") : editingApplication.start_date,
      end_date: values.end_date ? values.end_date.format("YYYY-MM-DD") : editingApplication.end_date,
      exam_date: values.exam_date ? values.exam_date.format("YYYY-MM-DD") : null,
      status: values.status as Application["status"],
    });
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await apiRequest(`/admin/application/${id}/delete/`, { method: "DELETE" });
      message.success("Ariza muvaffaqiyatli o'chirildi");
      queryClient.invalidateQueries({ queryKey: [applicationsEndpoint] });
      queryClient.refetchQueries({ queryKey: [applicationsEndpoint] });
    } catch (err) {
      message.error((err as Error).message || "Arizani o'chirishda xatolik");
    } finally {
      setDeletingId(null);
    }
  };

  const columns: ColumnsType<Application> = [
    {
      title:"#",
      key: "id",
      render: (_, record) => (
        <div className="font-bold text-sm text-[#7367f0] mb-1">
          #{record.id}
        </div>
      ),
      // width: 45,
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3 px-4">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Ariza nomi</span>
        </div>
      ),
      key: "title_info",
      render: (_, record) => (
     
          <div className={`font-bold text-sm ${theme === "dark" ? "text-gray-200" : "text-[#484650]"}`}>
            {record.title}
          </div>
    
      ),
      // width: 280,
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <CalendarOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Muddati</span>
        </div>
      ),
      key: "dates",
      render: (_, record) => (
        <div className=" flex items-center gap-2">
          <div className="text-xs font-bold text-green-500 flex items-center gap-1">
            {/* <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> */}
            {formatDate(record.start_date)}
          </div>
          -
          <div className="text-xs font-bold text-red-500 flex items-center gap-1">
            {/* <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> */}
            {formatDate(record.end_date)}
          </div>
        </div>
      ),
      // width: 180,
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <CalendarOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Imtihon sanasi</span>
        </div>
      ),
      key: "exam_date",
      render: (_, record) => (
        <div className="text-xs font-bold text-[#7367f0]">
          {record.exam_date ? formatDate(record.exam_date) : "—"}
        </div>
      ),
      // width: 140,
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <TrophyOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Arizalar</span>
        </div>
      ),
      dataIndex: "total_submissions",
      key: "total_submissions",
      render: (total: number) => (
        <div className="py-2 font-bold text-sm text-[#7367f0]">
          {total} ta
        </div>
      ),
      // width: 130,
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Holati</span>
        </div>
      ),
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const labels: Record<string, string> = {
          DRAFT: "Qoralama",
          PUBLISHED: "E'lon qilingan",
          CLOSED: "Yopilgan",
          ARCHIVED: "Arxivlangan",
        };

        return (
          <div className="py-2">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${status === "PUBLISHED" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                status === "CLOSED" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                  "bg-gray-500/10 text-gray-500 border-gray-500/20"
                }`}
            >
              {labels[status] || status}
            </span>
          </div>
        );
      },
      // width: 150,
    },
    {
      title: (
        <div className="flex items-center justify-center py-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Amallar</span>
        </div>
      ),
      key: "actions",
      width: 150,
      render: (_, record) => (
        <div className="flex justify-center gap-2 py-2">
          <Link href={`/admin-panel/applications/${record.id}`}>
            <Button
              className={`w-10 h-10 rounded-xl flex items-center justify-center border-0 transition-all duration-300 shadow-sm ${theme === "dark"
                ? "bg-[#7367f0]/20 text-[#7367f0] hover:bg-[#7367f0] hover:text-white"
                : "bg-[#7367f0]/10 text-[#7367f0] hover:bg-[#7367f0] hover:text-white"
                }`}
              icon={<EyeOutlined style={{ fontSize: "18px" }} />}
              title="Ko'rish"
            />
          </Link>
          <Button
            className={`w-10 h-10 rounded-xl flex items-center justify-center border-0 transition-all duration-300 shadow-sm ${theme === "dark"
              ? "bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white"
              : "bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white"
              }`}
            icon={<EditOutlined style={{ fontSize: "18px" }} />}
            title="Tahrirlash"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="O'chirish"
            description="Haqiqatan ham bu arizani o'chirmoqchimisiz?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ha"
            cancelText="Yo'q"
            overlayClassName="premium-popconfirm"
          >
            <Button
              className={`w-10 h-10 rounded-xl flex items-center justify-center border-0 transition-all duration-300 shadow-sm ${theme === "dark"
                ? "bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
                : "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                }`}
              icon={<DeleteOutlined style={{ fontSize: "18px" }} />}
              title="O'chirish"
              loading={deletingId === record.id}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6" style={{ color: theme === "dark" ? "#ffffff" : "#484650" }}>
        <div className="flex justify-between items-center mb-6">
          <Title level={4} className="mb-0!" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
            Arizalar tizimi
          </Title>
        </div>
        <TableSkeleton />
      </div>
    );
  }

  if (error) {
    let errorMessage = error.message || "Ma'lumotlarni yuklashda xatolik yuz berdi";
    const errorData = (error as { data?: unknown }).data;
    if (Array.isArray(errorData)) {
      errorMessage = errorData.join(", ");
    }

    return (
      <div className="space-y-6" style={{ color: theme === "dark" ? "#ffffff" : "#484650" }}>
        <Title level={4} className="mb-6!" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
          Arizalar tizimi
        </Title>
        <ErrorState
          description={errorMessage}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ color: theme === "dark" ? "#ffffff" : "#484650" }}>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Title level={4} className="mb-1!" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
            Arizalar tizimi
          </Title>
          <div className="text-gray-400 text-sm font-medium">Barcha e&apos;lon qilingan arizalar va loyihalar boshqaruvi</div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin-panel/applications/create">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="h-[42px] px-6 rounded-xl border-0 shadow-lg font-bold flex items-center gap-2"
              style={{
                background: "linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.7))",
                boxShadow: "0 8px 25px -8px #7367f0",
              }}
            >
              Yangi ariza yaratish
            </Button>
          </Link>
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
        <Table
          columns={columns}
          dataSource={applications || []}
          rowKey="id"
          locale={{ emptyText: "Hozircha arizalar mavjud emas" }}
          className="custom-admin-table"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalElements,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} dan ${total} ta`,
            pageSizeOptions: ["10", "20", "50", "100"],
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
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
        `}</style>
      </div>

      <Modal
        title="Arizani Tahrirlash"
        open={!!editingApplication}
        onCancel={() => {
          setEditingApplication(null);
          editForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
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

          <Form.Item name="exam_date" label="Imtihon sanasi">
            <DatePicker className="w-full" format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Holati"
            rules={[{ required: true, message: "Holatni tanlang!" }]}
          >
            <Select placeholder="Holatni tanlang">
              <Select.Option value="DRAFT">{getApplicationStatusLabel("DRAFT")}</Select.Option>
              <Select.Option value="PUBLISHED">{getApplicationStatusLabel("PUBLISHED")}</Select.Option>
              <Select.Option value="CLOSED">{getApplicationStatusLabel("CLOSED")}</Select.Option>
              <Select.Option value="ARCHIVED">{getApplicationStatusLabel("ARCHIVED")}</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isUpdatingApplication}>
                Yangilash
              </Button>
              <Button
                onClick={() => {
                  setEditingApplication(null);
                  editForm.resetFields();
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

