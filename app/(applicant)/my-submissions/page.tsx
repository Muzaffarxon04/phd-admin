"use client";

import { Card, Table, Tag, Button, Space, Spin } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useGet } from "@/lib/hooks";
import Link from "next/link";
import { formatDate, getApplicationStatusLabel, getApplicationStatusColor } from "@/lib/utils";
import type { ColumnsType } from "antd/es/table";

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
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <p className="text-red-600">Xatolik: {error.message}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mening Arizalarim</h1>
      <Card>
        {!tableData || tableData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Hozircha arizalar mavjud emas</p>
            <Link href="/applications">
              <Button type="primary" className="mt-4">
                Yangi ariza yaratish
              </Button>
            </Link>
          </div>
        ) : (
          <Table columns={columns} dataSource={tableData} rowKey="id" />
        )}
      </Card>
    </div>
  );
}
