"use client";

import { useState } from "react";
import { Table, Button, Tag, Space, Card } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EyeOutlined, PlusOutlined } from "@ant-design/icons";
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
    title: "ID",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Nomi",
    dataIndex: "title",
    key: "title",
  },
  {
    title: "Boshlanish",
    dataIndex: "start_date",
    key: "start_date",
    render: (date: string) => formatDate(date),
  },
  {
    title: "Tugash",
    dataIndex: "end_date",
    key: "end_date",
    render: (date: string) => formatDate(date),
  },

  {
    title: "Arizalar soni",
    dataIndex: "total_submissions",
    key: "total_submissions",
    render: (total: number) => <span>{total}</span>,
  },
  {
    title: "Holati",
    dataIndex: "status",
    key: "status",
    render: (status: string) => {
      const colorMap: Record<string, string> = {
        DRAFT: "default",
        PUBLISHED: "green",
        CLOSED: "orange",
        ARCHIVED: "gray",
      };
      const labelMap: Record<string, string> = {
        DRAFT: "Qoralama",
        PUBLISHED: "E'lon qilingan",
        CLOSED: "Yopilgan",
        ARCHIVED: "Arxivlangan",
      };
      return <Tag color={colorMap[status]}>{labelMap[status] || status}</Tag>;
    },
  },
  {
    title: "Yaratuvchi",
    dataIndex: "created_by_name",
    key: "created_by_name",
  },

  {
    title: "Yaratilgan sana",
    dataIndex: "created_at",
    key: "created_at",
    render: (date: string) => formatDate(date),
  },
  {
    title: "Amallar",
    key: "actions",
    render: (_, record) => (
      <Space>
        <Link href={`/admin-panel/applications/${record.id}`}>
          <Button icon={<EyeOutlined />} type="link">
            Ko&apos;rish
          </Button>
        </Link>
      </Space>
    ),
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
  }>(`/admin/application/admin/applications/?page=${currentPage}&page_size=${pageSize}`);
  
  // Extract applications from nested response structure
  const applications = applicationsData?.data?.data || [];
  const totalElements = applicationsData?.total_elements || 0;


  if (isLoading) {
    return (
      <div style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: 24 
        }}>
          <h1 style={{ 
            fontSize: "24px", 
            fontWeight: 700,
            margin: 0,
            color: theme === "dark" ? "#ffffff" : "#1a1a1a"
          }}>
            Arizalar
          </h1>
        </div>
        <TableSkeleton />
      </div>
    );
  }

  if (error) {
    // Handle array error format from backend
    let errorMessage = error.message || "Ma'lumotlarni yuklashda xatolik yuz berdi";
    
    // Agar backenddan array formatida error kelgan bo'lsa
    if (Array.isArray((error as any).data)) {
      errorMessage = (error as any).data.join(", ");
    }
    
    return (
      <div style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>
        <h1 style={{ 
          fontSize: "24px", 
          fontWeight: 700,
          marginBottom: 24,
          color: theme === "dark" ? "#ffffff" : "#1a1a1a"
        }}>
          Arizalar
        </h1>
        <ErrorState 
          description={errorMessage}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const cardStyle = {
    background: theme === "dark" ? "#252836" : "#ffffff",
    border: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.06)",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: theme === "dark" 
      ? "0 4px 12px rgba(0, 0, 0, 0.2)" 
      : "0 2px 8px rgba(0, 0, 0, 0.08)",
  };

  return (
    <div style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: 24 
      }}>
        <h1 style={{ 
          fontSize: "24px", 
          fontWeight: 700,
          margin: 0,
          color: theme === "dark" ? "#ffffff" : "#1a1a1a"
        }}>
          Arizalar
        </h1>
        <Link href="/admin-panel/applications/create">
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              borderRadius: "8px",
              height: "40px",
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
            }}
          >
            Yangi ariza
          </Button>
        </Link>
      </div>
      <Card style={cardStyle} bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={applications || []}
          rowKey="id"
          locale={{ emptyText: "Hozircha arizalar mavjud emas" }}
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
            onShowSizeChange: (current, size) => {
              setCurrentPage(1);
              setPageSize(size);
            },
            style: {
              padding: "16px 24px",
              background: theme === "dark" ? "#252836" : "#ffffff",
            },
          }}
          className="custom-admin-table"
        />
        <style jsx global>{`
          .custom-admin-table .ant-table {
            background: ${theme === "dark" ? "#252836" : "#ffffff"} !important;
            color: ${theme === "dark" ? "#ffffff" : "#000000"} !important;
          }
          .custom-admin-table .ant-table-thead > tr > th {
            background: ${theme === "dark" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)"} !important;
            border-bottom: ${theme === "dark" ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.06)"} !important;
            color: ${theme === "dark" ? "#ffffff" : "#1a1a1a"} !important;
            font-weight: 600 !important;
            padding: 16px !important;
          }
          .custom-admin-table .ant-table-tbody > tr > td {
            border-bottom: ${theme === "dark" ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(0, 0, 0, 0.04)"} !important;
            color: ${theme === "dark" ? "#ffffff" : "#000000"} !important;
            padding: 16px !important;
          }
          .custom-admin-table .ant-table-tbody > tr:hover > td {
            background: ${theme === "dark" ? "rgba(102, 126, 234, 0.1)" : "rgba(102, 126, 234, 0.05)"} !important;
          }
          .custom-admin-table .ant-table-tbody > tr.ant-table-row-selected > td {
            background: ${theme === "dark" ? "rgba(102, 126, 234, 0.15)" : "rgba(102, 126, 234, 0.08)"} !important;
          }
          .custom-admin-table .ant-pagination {
            color: ${theme === "dark" ? "#ffffff" : "#000000"} !important;
          }
          .custom-admin-table .ant-pagination-item {
            background: ${theme === "dark" ? "#252836" : "#ffffff"} !important;
            border-color: ${theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"} !important;
          }
          .custom-admin-table .ant-pagination-item a {
            color: ${theme === "dark" ? "#ffffff" : "#000000"} !important;
          }
          .custom-admin-table .ant-pagination-item-active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            border-color: transparent !important;
          }
          .custom-admin-table .ant-pagination-item-active a {
            color: #ffffff !important;
          }
          .custom-admin-table .ant-pagination-prev,
          .custom-admin-table .ant-pagination-next {
            color: ${theme === "dark" ? "#ffffff" : "#000000"} !important;
          }
          .custom-admin-table .ant-pagination-prev:hover,
          .custom-admin-table .ant-pagination-next:hover {
            color: #667eea !important;
          }
          .custom-admin-table .ant-select-selector {
            background: ${theme === "dark" ? "#252836" : "#ffffff"} !important;
            border-color: ${theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"} !important;
            color: ${theme === "dark" ? "#ffffff" : "#000000"} !important;
          }
          .custom-admin-table .ant-btn-link {
            color: ${theme === "dark" ? "#667eea" : "#667eea"} !important;
          }
          .custom-admin-table .ant-btn-link:hover {
            color: ${theme === "dark" ? "#764ba2" : "#764ba2"} !important;
          }
          .custom-admin-table .ant-tag {
            border-radius: 6px !important;
            padding: 4px 12px !important;
            font-weight: 500 !important;
            border: none !important;
          }
        `}</style>
      </Card>
    </div>
  );
}

