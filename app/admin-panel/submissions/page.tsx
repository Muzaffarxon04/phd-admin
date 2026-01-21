"use client";

import { Table, Tag, Button, Card, Spin } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EyeOutlined } from "@ant-design/icons";
import { useGet, usePost } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const { data: submissionsData, isLoading, error } = useGet<{ data: Submission[] } | Submission[]>("/admin/application/admin/submissions/");
  
  // Handle different response formats
  let submissions: Submission[] = [];
  if (submissionsData) {
    if (Array.isArray(submissionsData)) {
      submissions = submissionsData;
    } else if (submissionsData.data && Array.isArray(submissionsData.data)) {
      submissions = submissionsData.data;
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
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Topshirilgan Arizalar</h1>
        <Card>
          <p className="text-red-600">Xatolik: {error.message}</p>
        </Card>
      </div>
    );
  }

  // Ensure submissions is always an array
  const tableData = Array.isArray(submissions) ? submissions : [];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Topshirilgan Arizalar</h1>
      <Card>
        <Table
          columns={columns}
          dataSource={tableData}
          rowKey="id"
          locale={{ emptyText: "Arizalar mavjud emas" }}
        />
      </Card>
    </div>
  );
}
