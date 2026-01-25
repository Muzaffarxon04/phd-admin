"use client";

import { Table, Tag, Button, Card } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EyeOutlined } from "@ant-design/icons";
import { useGet } from "@/lib/hooks";
// import { useQueryClient } from "@tanstack/react-query";
import { useThemeStore } from "@/lib/stores/themeStore";
import { TableSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import Link from "next/link";
import { formatDate, getApplicationStatusLabel, getApplicationStatusColor } from "@/lib/utils";

interface Submission {
  id: number;
  submission_number: string;
  application: number;
  application_title: string;
  applicant: number;
  applicant_name: string;
  applicant_phone: string;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN";
  payment_status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  created_at: string;
  updated_at: string;
  submitted_at?: string | null;
}

export default function AdminSubmissionsPage() {
  const { theme } = useThemeStore();
  // const queryClient = useQueryClient();
  const { data: submissionsData, isLoading, error } = useGet<{data: {data: Submission[] } }>("/admin/application/admin/submissions/");
  // console.log(submissionsData?.);
  
  // Handle different response formats
  let submissions: Submission[] = [];
  if (submissionsData) {
    if (Array.isArray(submissionsData?.data?.data)) {
      submissions = submissionsData.data.data;
    } else if (submissionsData.data && Array.isArray(submissionsData.data.data)) {
      submissions = submissionsData.data.data;
    }
  }

  const columns: ColumnsType<Submission> = [
    {
      title: "Ariza raqami",
      dataIndex: "submission_number",
      key: "submission_number",
    },
    {
      title: "Ariza nomi",
      dataIndex: "application_title",
      key: "application_title",
    },
    {
      title: "Talabgor",
      dataIndex: "applicant_name",
      key: "applicant_name",
    },
    {
      title: "Telefon",
      dataIndex: "applicant_phone",
      key: "applicant_phone",
    },
    {
      title: "Holati",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getApplicationStatusColor(status)}>{getApplicationStatusLabel(status)}</Tag>
      ),
    },
    {
      title: "To&apos;lov",
      dataIndex: "payment_status",
      key: "payment_status",
      render: (status: string) => {
        const colors: Record<string, string> = {
          PENDING: "orange",
          PAID: "green",
          FAILED: "red",
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
    {
      title: "Sana",
      dataIndex: "submitted_at",
      key: "submitted_at",
      render: (date?: string) => (date ? formatDate(date) : "-"),
    },
    {
      title: "Amallar",
      key: "actions",
      render: (_, record) => (
        <Link href={`/admin-panel/submissions/${record.id}`}>
          <Button icon={<EyeOutlined />} type="link">
            Ko&apos;rish
          </Button>
        </Link>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>
        <h1 style={{ 
          fontSize: "24px", 
          fontWeight: 700,
          marginBottom: 24,
          color: theme === "dark" ? "#ffffff" : "#1a1a1a"
        }}>
          Topshirilgan Arizalar
        </h1>
        <TableSkeleton />
      </div>
    );
  }

  if (error) {
    // Handle array error format from backend
    let errorMessage = error.message || "Ma'lumotlarni yuklashda xatolik yuz berdi";
    
    // Agar backenddan array formatida error kelgan bo'lsa
    if (Array.isArray((error).data)) {
      errorMessage = (error).data.join(", ");
    }
    
    return (
      <div style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>
        <h1 style={{ 
          fontSize: "24px", 
          fontWeight: 700,
          marginBottom: 24,
          color: theme === "dark" ? "#ffffff" : "#1a1a1a"
        }}>
          Topshirilgan Arizalar
        </h1>
        <ErrorState 
          description={errorMessage}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }
  console.log(submissions);
  // Ensure submissions is always an array
  const tableData = Array.isArray(submissions) ? submissions : [];

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
      <h1 style={{ 
        fontSize: "24px", 
        fontWeight: 700,
        marginBottom: 24,
        color: theme === "dark" ? "#ffffff" : "#1a1a1a"
      }}>
        Topshirilgan Arizalar
      </h1>
      <Card style={cardStyle} bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={tableData}
          rowKey="id"
          locale={{ emptyText: "Arizalar mavjud emas" }}
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
