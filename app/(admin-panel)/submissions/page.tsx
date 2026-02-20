"use client";

import { Card, Table, Tag, Button, Space, Typography, Row, Col, Statistic, Badge, Tooltip } from "antd";
import {
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CalendarOutlined,
  ReloadOutlined,
  FileTextOutlined,
  UserOutlined
} from "@ant-design/icons";
import { useGet } from "@/lib/hooks";
// import { useThemeStore } from "@/lib/stores/themeStore";
import { TableSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import {
  formatDate, getApplicationStatusLabel, getApplicationStatusColor
  //  getPaymentStatusColor

} from "@/lib/utils";
import { useState, useMemo } from "react";

const { Title } = Typography;

interface Submission {
  id: number;
  submission_number: string;
  application: number;
  application_title: string;
  applicant: number;
  applicant_name: string;
  applicant_phone: string;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN";
  submitted_at?: string | null;
  payment_status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  created_at: string;
  updated_at: string;
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

export default function SubmissionsPage() {
  const { data: submissionsData, isLoading, error } = useGet<SubmissionsResponse>("/admin/submissions/");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Handle the specific response structure
  const submissions = useMemo(() => {
    if (submissionsData) {
      return submissionsData.data.data || [];
    }
    return [];
  }, [submissionsData]);

  // Filter submissions based on status and search
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(submission => {
      const matchesStatus = statusFilter === "all" || submission.status === statusFilter;
      const matchesSearch = submission.application_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.submission_number.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [submissions, statusFilter, searchTerm]);

  // Calculate statistics
  const stats = useMemo(() => ({
    total: filteredSubmissions.length,
    submitted: filteredSubmissions.filter(s => s.status === "SUBMITTED").length,
    underReview: filteredSubmissions.filter(s => s.status === "UNDER_REVIEW").length,
    approved: filteredSubmissions.filter(s => s.status === "APPROVED").length,
    rejected: filteredSubmissions.filter(s => s.status === "REJECTED").length,
    paid: filteredSubmissions.filter(s => s.payment_status === "PAID").length,
    pendingPayment: filteredSubmissions.filter(s => s.payment_status === "PENDING").length,
  }), [filteredSubmissions]);

  const columns = [
    {
      title: (
        <div className="flex items-center gap-2">
          <FileTextOutlined />
          <span>Ariza raqami</span>
        </div>
      ),
      dataIndex: "submission_number",
      key: "submission_number",
      render: (text: string, record: Submission) => (
        <div>
          <div className="font-semibold text-blue-600 dark:text-blue-400">
            #{text}
          </div>
          <div className="text-xs text-gray-500">
            Yaratilgan: {formatDate(record.created_at)}
          </div>
        </div>
      ),
      width: 180,
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <FileTextOutlined />
          <span>Ariza nomi</span>
        </div>
      ),
      dataIndex: "application_title",
      key: "application_title",
      render: (text: string, record: Submission) => (
        <div>
          <div className="font-medium truncate max-w-xs" title={text}>
            {text}
          </div>
          <div className="text-xs text-gray-500">
            #{typeof record.application === "object" && record.application !== null
              ? (record.application as { id?: number }).id ?? "-"
              : record.application}
          </div>
        </div>
      ),
      width: 200,
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <UserOutlined />
          <span>Ariza beruvchi</span>
        </div>
      ),
      dataIndex: "applicant_name",
      key: "applicant_name",
      render: (text: string, record: Submission) => (
        <div className="max-w-xs">
          <Tooltip title={text}>
            <div className="font-medium truncate" title={text}>
              {text}
            </div>
          </Tooltip>
          <div className="text-xs text-gray-500">
            {record.applicant_phone}
          </div>
        </div>
      ),
      width: 180,
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <ClockCircleOutlined />
          <span>Ariza holati</span>
        </div>
      ),
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getApplicationStatusColor(status)}>
          {getApplicationStatusLabel(status)}
        </Tag>
      ),
      width: 150,
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <DollarOutlined />
          <span>To&apos;lov</span>
        </div>
      ),
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
          PAID: "To'langan",
          FAILED: "Xatolik",
          REFUNDED: "Qaytarilgan",
        };
        return (
          <Tag color={colors[status]}>
            {labels[status] || status}
          </Tag>
        );
      },
      width: 120,
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <CalendarOutlined />
          <span>Sanalar</span>
        </div>
      ),
      key: "dates",
      render: (_: unknown, record: Submission) => (
        <div className="text-sm">
          <div className="text-gray-500">Yaratilgan:</div>
          <div>{formatDate(record.created_at)}</div>
          {record.submitted_at && (
            <>
              <div className="text-gray-500 mt-1">Topshirilgan:</div>
              <div>{formatDate(record.submitted_at)}</div>
            </>
          )}
        </div>
      ),
      width: 150,
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <EyeOutlined />
          <span>Amallar</span>
        </div>
      ),
      key: "actions",
      render: () => (
        <Space size="small">
          <Tooltip title="Ko'rish">
            <Button
              type="primary"
              size="small"
              icon={<EyeOutlined />}
            />
          </Tooltip>
        </Space>
      ),
      width: 80,
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <Title level={2} className="mb-8">Qabul Hujjatlari</Title>
          <TableSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    let errorMessage = error.message || "Ma'lumotlarni yuklashda xatolik yuz berdi";

    // Handle different error formats
    if (typeof error === "object" && error !== null) {
      const errorData = (error as { data?: unknown }).data;
      if (errorData) {
        if (Array.isArray(errorData)) {
          errorMessage = errorData.join(", ");
        } else if (typeof errorData === "string") {
          errorMessage = errorData;
        } else if (typeof errorData === "object" && errorData !== null && "message" in errorData) {
          errorMessage = String(errorData.message);
        }
      }
    }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <ErrorState
            description={errorMessage}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className=" from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Qabul Hujjatlari</h1>
            <p className="text-xl text-purple-100">Barcha arizalarni boshqarish</p>
          </div>

          {/* Statistics */}
          <Row gutter={[24, 24]} className="mb-8">
            <Col xs={24} sm={6}>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <Statistic
                  title="Jami Arizalar"
                  value={stats.total}
                  valueStyle={{ color: "#ffffff" }}
                  prefix={<FileTextOutlined />}
                />
              </div>
            </Col>
            <Col xs={24} sm={6}>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <Statistic
                  title="Topshirilgan"
                  value={stats.submitted}
                  valueStyle={{ color: "#1890ff" }}
                  prefix={<FileTextOutlined />}
                />
              </div>
            </Col>
            <Col xs={24} sm={6}>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <Statistic
                  title="Ko'rib chiqilmoqda"
                  value={stats.underReview}
                  valueStyle={{ color: "#1890ff" }}
                  prefix={<ClockCircleOutlined />}
                />
              </div>
            </Col>
            <Col xs={24} sm={6}>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <Statistic
                  title="Tasdiqlangan"
                  value={stats.approved}
                  valueStyle={{ color: "#52c41a" }}
                  prefix={<CheckCircleOutlined />}
                />
              </div>
            </Col>
          </Row>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <Title level={2} className="mb-0!">Arizalar jadvali</Title>

          <div className="flex items-center gap-4">
            <div className="relative">

              <input
                type="text"
                placeholder="Qidirish..."
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Barchasi</option>
              <option value="DRAFT">Tayyorlanmoqda</option>
              <option value="SUBMITTED">Topshirilgan</option>
              <option value="UNDER_REVIEW">Ko&apos;rib chiqilmoqda</option>
              <option value="APPROVED">Tasdiqlangan</option>
              <option value="REJECTED">Rad etilgan</option>
              <option value="WITHDRAWN">O&apos;chirilgan</option>
            </select>
          </div>
        </div>

        {/* Stats Summary */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} lg={12}>
            <Card className="transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <Title level={4} className="mb-0!">Holatlar bo&apos;yicha taqsimot</Title>
                <ReloadOutlined className="text-gray-400 cursor-pointer" />
              </div>
              <div className="space-y-3">
                {[
                  { label: "Topshirilgan", value: stats.submitted, color: "blue" },
                  { label: "Ko'rib chiqilmoqda", value: stats.underReview, color: "processing" },
                  { label: "Tasdiqlangan", value: stats.approved, color: "success" },
                  { label: "Rad etilgan", value: stats.rejected, color: "error" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full bg-${item.color}-500`}></div>
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge count={item.value} />
                      <span className="text-sm text-gray-500">
                        {stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card className="transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <Title level={4} className="mb-0!">To&apos;lov holati</Title>
                <DollarOutlined className="text-green-500" />
              </div>
              <div className="space-y-3">
                {[
                  { label: "To&apos;langan", value: stats.paid, color: "green" },
                  { label: "Kutilmoqda", value: stats.pendingPayment, color: "orange" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full bg-${item.color}-500`}></div>
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge count={item.value} />
                      <span className="text-sm text-gray-500">
                        {stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Table */}
        <Card
          className="transform hover:scale-[1.01] transition-all duration-300"
          bodyStyle={{
            padding: "0",
            borderRadius: "16px",
            overflow: "hidden"
          }}
        >
          <div className="p-6">
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-12">
                <EmptyState
                  description={searchTerm ? "Hech qanday ariza topilmadi" : "Hozircha arizalar mavjud emas"}
                  action={
                    <Button onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}>
                      Barchalarini ko&apos;rish
                    </Button>
                  }
                />
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={filteredSubmissions}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} dan ${total} ta ariza`,
                }}
                className="custom-submission-table"
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}