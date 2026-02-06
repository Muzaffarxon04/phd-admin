"use client";

import { useState } from "react";
import { Table, Button, Tag, Space, Typography, Input } from "antd";
const { Title } = Typography;
import type { ColumnsType } from "antd/es/table";
import {
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
  TrophyOutlined
} from "@ant-design/icons";
import { useGet } from "@/lib/hooks";
import { useThemeStore } from "@/lib/stores/themeStore";
import { TableSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

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

const columns: ColumnsType<Application> = [
  {
    title: (
      <div className="flex items-center gap-2 py-3 px-4">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Ariza nomi</span>
      </div>
    ),
    key: "title_info",
    render: (_, record) => (
      <div>
        <div className="font-bold text-sm text-[#7367f0] mb-1">
          #{record.id}
        </div>
        <div className={`font-bold text-sm ${useThemeStore.getState().theme === "dark" ? "text-gray-200" : "text-[#484650]"}`}>
          {record.title}
        </div>
      </div>
    ),
    width: 280,
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
      <div className="py-2">
        <div className="text-xs font-bold text-green-500 mb-1 flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          {formatDate(record.start_date)}
        </div>
        <div className="text-xs font-bold text-red-500 flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          {formatDate(record.end_date)}
        </div>
      </div>
    ),
    width: 180,
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
    width: 130,
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
    width: 150,
  },
  {
    title: (
      <div className="flex items-center justify-center py-3">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Amallar</span>
      </div>
    ),
    key: "actions",
    render: (_, record) => (
      <div className="flex justify-center py-2">
        <Link href={`/admin-panel/applications/${record.id}`}>
          <Button
            className={`w-10 h-10 rounded-xl flex items-center justify-center border-0 transition-all duration-300 shadow-sm ${useThemeStore.getState().theme === "dark"
                ? "bg-[#7367f0]/20 text-[#7367f0] hover:bg-[#7367f0] hover:text-white"
                : "bg-[#7367f0]/10 text-[#7367f0] hover:bg-[#7367f0] hover:text-white"
              }`}
            icon={<EyeOutlined style={{ fontSize: "18px" }} />}
          />
        </Link>
      </div>
    ),
    width: 100,
  },
];

export default function AdminApplicationsPage() {
  const { theme } = useThemeStore();
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

  // Extract applications from nested response structure
  const applications = applicationsData?.data?.data || [];
  const totalElements = applicationsData?.total_elements || 0;


  if (isLoading) {
    return (
      <div className="space-y-6" style={{ color: theme === "dark" ? "#ffffff" : "#484650" }}>
        <div className="flex justify-between items-center mb-6">
          <Title level={4} className="!mb-0" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
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
        <Title level={4} className="!mb-6" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
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
          <Title level={4} className="!mb-1" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
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
    </div>
  );
}

