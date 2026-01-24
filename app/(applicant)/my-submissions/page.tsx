"use client";

import { Card, Table, Tag, Button } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useGet } from "@/lib/hooks";
import { useThemeStore } from "@/lib/stores/themeStore";
import { TableSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import Link from "next/link";
import { formatDate, getApplicationStatusLabel, getApplicationStatusColor } from "@/lib/utils";
import type { ColumnsType } from "antd/es/table";
import type { ApiError } from "@/lib/hooks";

interface Submission {
  id: number;
  submission_number: string;
  application_title: string;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN";
  payment_status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  created_at: string;
  submitted_at?: string;
}

interface SubmissionsResponse {
  next: string | null;
  previous: string | null;
  total_elements: number;
  page_size: number;
  data: {
    message: string;
    error: string | null;
    status: number;
    data: Submission[];
  };
  from: number;
  to: number;
}

export default function MySubmissionsPage() {
  const { theme } = useThemeStore();
  const { data: submissionsData, isLoading, error } = useGet<SubmissionsResponse | Submission[]>("/applicant/my-submissions/");
  
  // Handle different response formats
  let submissions: Submission[] = [];
  if (submissionsData) {
    if (Array.isArray(submissionsData)) {
      submissions = submissionsData;
    } else if (submissionsData.data && submissionsData.data.data && Array.isArray(submissionsData.data.data)) {
      submissions = submissionsData.data.data;
    } else if (submissionsData.data && Array.isArray(submissionsData.data)) {
      submissions = submissionsData.data;
    }
  }
  
  // Ensure submissions is always an array
  const tableData = Array.isArray(submissions) ? submissions : [];

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
      title: "Holati",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getApplicationStatusColor(status)}>
          {getApplicationStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: "To&apos;lov holati",
      dataIndex: "payment_status",
      key: "payment_status",
      render: (status: string) => {
        const colors: Record<string, string> = {
          PENDING: "orange",
          PAID: "green",
          FAILED: "red",
          REFUNDED: "gray",
        };
        const labels: Record<string, string> = {
          PENDING: "Kutilmoqda",
          PAID: "To&apos;langan",
          FAILED: "Xatolik",
          REFUNDED: "Qaytarilgan",
        };
        return <Tag color={colors[status]}>{labels[status] || status}</Tag>;
      },
    },
    {
      title: "Yaratilgan sana",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => formatDate(date),
    },
    {
      title: "Topshirilgan sana",
      dataIndex: "submitted_at",
      key: "submitted_at",
      render: (date?: string) => date ? formatDate(date) : "-",
    },
    {
      title: "Amallar",
      key: "actions",
      render: (_, record) => (
        <Link href={`/my-submissions/${record.id}`}>
          <Button icon={<EyeOutlined />}>Ko&apos;rish</Button>
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
          Mening Arizalarim
        </h1>
        <TableSkeleton />
      </div>
    );
  }

  if (error) {
    // Handle array error format from backend
    let errorMessage = error.message || "Ma'lumotlarni yuklashda xatolik yuz berdi";
    
    // Agar backenddan array formatida error kelgan bo'lsa
    const errorData = (error as ApiError).data;
    if (errorData && Array.isArray(errorData)) {
      errorMessage = errorData.join(", ");
    }
    
    return (
      <div style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>
        <h1 style={{ 
          fontSize: "24px", 
          fontWeight: 700,
          marginBottom: 24,
          color: theme === "dark" ? "#ffffff" : "#1a1a1a"
        }}>
          Mening Arizalarim
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
      <h1 style={{ 
        fontSize: "24px", 
        fontWeight: 700,
        marginBottom: 24,
        color: theme === "dark" ? "#ffffff" : "#1a1a1a"
      }}>
        Mening Arizalarim
      </h1>
      <Card style={cardStyle} bodyStyle={{ padding: 0 }}>
        {!tableData || tableData.length === 0 ? (
          <EmptyState 
            description="Hozircha arizalar mavjud emas"
            action={
              <Link href="/applications">
                <Button 
                  type="primary"
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                  }}
                >
                  Yangi ariza yaratish
                </Button>
              </Link>
            }
          />
        ) : (
          <Table 
            columns={columns} 
            dataSource={tableData} 
            rowKey="id"
            className="custom-admin-table"
          />
        )}
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
