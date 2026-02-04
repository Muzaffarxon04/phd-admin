"use client";

import { Table, Button, Typography, Input, Select } from "antd";
const { Title } = Typography;
import type { ColumnsType } from "antd/es/table";
import {
  EyeOutlined,
  SearchOutlined,
  FileTextOutlined,
  UserOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CalendarOutlined
} from "@ant-design/icons";
import { useGet } from "@/lib/hooks";
import { useThemeStore } from "@/lib/stores/themeStore";
import { TableSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import Link from "next/link";
import { formatDate, getApplicationStatusLabel } from "@/lib/utils";
import { useState, useMemo } from "react";

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
  const { data: submissionsData, isLoading, error } = useGet<{ data: { data: Submission[] } }>("/admin/application/submissions/");
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

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(item => {
      const matchesSearch =
        item.submission_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.application_title.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [submissions, searchTerm, statusFilter]);

  const columns: ColumnsType<Submission> = [
    {
      title: (
        <div className="flex items-center gap-2 py-3 px-4">
          <FileTextOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Ariza ma&apos;lumotlari</span>
        </div>
      ),
      key: "submission_info",
      render: (_, record) => (
        <div className="px-4 py-2">
          <div className="font-bold text-base mb-1" style={{ color: "#7367f0" }}>
            #{record.submission_number}
          </div>
          <div className={`text-sm font-bold ${theme === "dark" ? "text-gray-200" : "text-[#484650]"}`}>
            {record.application_title}
          </div>
        </div>
      ),
      width: 250,
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <UserOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Talabgor</span>
        </div>
      ),
      key: "applicant_info",
      render: (_, record) => (
        <div className="py-2">
          <div className={`font-bold text-sm ${theme === "dark" ? "text-gray-200" : "text-[#484650]"}`}>
            {record.applicant_name}
          </div>
          <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <PhoneOutlined className="text-[10px]" />
            {record.applicant_phone}
          </div>
        </div>
      ),
      width: 200,
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <ClockCircleOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Holati</span>
        </div>
      ),
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const label = getApplicationStatusLabel(status);
        return (
          <div className="py-2">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${status === "APPROVED" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                status === "REJECTED" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                  status === "DRAFT" ? "bg-gray-500/10 text-gray-500 border-gray-500/20" :
                    "bg-purple-500/10 text-purple-500 border-purple-500/20"
                }`}
            >
              {label}
            </span>
          </div>
        );
      },
      width: 150,
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <DollarOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">To&apos;lov</span>
        </div>
      ),
      dataIndex: "payment_status",
      key: "payment_status",
      render: (status: string) => {
        const labels: Record<string, string> = {
          PENDING: "Kutilmoqda",
          PAID: "To'langan",
          FAILED: "Xatolik",
        };
        const colorClass =
          status === "PAID" ? "text-green-500 bg-green-500/10 border-green-500/20" :
            status === "FAILED" ? "text-red-500 bg-red-500/10 border-red-500/20" :
              "text-orange-500 bg-orange-500/10 border-orange-500/20";

        return (
          <div className="py-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${colorClass}`}>
              {labels[status] || status}
            </span>
          </div>
        );
      },
      width: 130,
    },
    {
      title: (
        <div className="flex items-center gap-2 py-3">
          <CalendarOutlined className="text-[#7367f0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Sana</span>
        </div>
      ),
      dataIndex: "submitted_at",
      key: "submitted_at",
      render: (date?: string) => (
        <div className="py-2 text-xs font-medium text-gray-400">
          {date ? formatDate(date) : "-"}
        </div>
      ),
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
          <Link href={`/admin-panel/submissions/${record.id}`}>
            <Button
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#7367f0]/10 text-[#7367f0] border-0 hover:bg-[#7367f0] hover:text-white transition-all duration-300 shadow-sm"
              icon={<EyeOutlined style={{ fontSize: "18px" }} />}
            />
          </Link>
        </div>
      ),
      width: 100,
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

  return (
    <div className="space-y-6" style={{ color: theme === "dark" ? "#ffffff" : "#484650" }}>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Title level={4} className="!mb-1" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
            Topshirilgan Arizalar
          </Title>
          <div className="text-gray-400 text-sm font-medium">Barcha talabgorlar arizalari ro&apos;yxati</div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7367f0] opacity-70 z-10" />
            <Input
              placeholder="Qidirish..."
              className="pl-9 pr-4 py-2 w-64 rounded-xl transition-all duration-300"
              style={{
                background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
                border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
                color: theme === "dark" ? "#ffffff" : "#484650",
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select
            className="w-48 h-[40px] premium-select"
            placeholder="Holat bo&apos;yicha"
            onChange={setStatusFilter}
            value={statusFilter}
            options={[
              { value: "all", label: "Barcha holatlar" },
              { value: "DRAFT", label: "Qoralama" },
              { value: "SUBMITTED", label: "Topshirilgan" },
              { value: "UNDER_REVIEW", label: "Tekshirilmoqda" },
              { value: "APPROVED", label: "Tasdiqlangan" },
              { value: "REJECTED", label: "Rad etilgan" },
            ]}
          />
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
          dataSource={filteredSubmissions}
          rowKey="id"
          locale={{ emptyText: "Arizalar mavjud emas" }}
          className="custom-admin-table"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
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
          .premium-select .ant-select-selector {
            background: ${theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff"} !important;
            border: ${theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)"} !important;
            color: ${theme === "dark" ? "#ffffff" : "#484650"} !important;
            border-radius: 12px !important;
            height: 40px !important;
            display: flex !important;
            align-items: center !important;
          }
        `}</style>
      </div>
    </div>
  );
}
