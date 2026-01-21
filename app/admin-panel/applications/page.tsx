"use client";

import { useState } from "react";
import { Table, Button, Tag, Space, Card, Spin } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { useGet } from "@/lib/hooks";
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
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Arizalar</h1>
        <Card>
          <p className="text-red-600">Xatolik: {error.message}</p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Arizalar</h1>
        <Link href="/admin-panel/applications/create">
          <Button type="primary" icon={<PlusOutlined />}>
            Yangi ariza
          </Button>
        </Link>
      </div>
      <Card>
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
          }}
        />
      </Card>
    </div>
  );
}

