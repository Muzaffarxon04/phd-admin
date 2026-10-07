"use client";

import { Card, Table, Tag, Button, Space, Typography, Row, Col, Statistic, Badge, Tooltip, Pagination } from "antd";
import {
  EyeOutlined,
  SearchOutlined,
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
import { useIsAdminMobile } from "@/components/admin/submissions/AdminUi";

const { Title } = Typography;

const PAYMENT_COLORS: Record<string, string> = {
  PENDING: "orange",
  PAID: "green",
  FAILED: "red",
  REFUNDED: "gray",
};

const PAYMENT_LABELS: Record<string, string> = {
  PENDING: "Kutilmoqda",
  PAID: "To'langan",
  FAILED: "Xatolik",
  REFUNDED: "Qaytarilgan",
};

const MOBILE_PAGE_SIZE = 10;

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
  const isMobile = useIsAdminMobile();
  const [mobilePage, setMobilePage] = useState(1);

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
      render: (status: string) => (
        <Tag color={PAYMENT_COLORS[status]}>
          {PAYMENT_LABELS[status] || status}
        </Tag>
      ),
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

  const mobilePageCount = Math.max(1, Math.ceil(filteredSubmissions.length / MOBILE_PAGE_SIZE));
  const currentMobilePage = Math.min(mobilePage, mobilePageCount);
  const mobileItems = filteredSubmissions.slice(
    (currentMobilePage - 1) * MOBILE_PAGE_SIZE,
    currentMobilePage * MOBILE_PAGE_SIZE
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <Title level={2} className="!mb-6 sm:!mb-8 !text-2xl sm:!text-3xl">Qabul Hujjatlari</Title>
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      {/* Header Section */}
      <div className="bg-linear-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">Qabul Hujjatlari</h1>
            <p className="text-base sm:text-xl text-purple-100">Barcha arizalarni boshqarish</p>
          </div>

          {/* Statistics */}
          <Row gutter={[12, 12]}>
            <Col xs={12} md={6}>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center h-full">
                <Statistic
                  title={<span className="text-purple-100">Jami Arizalar</span>}
                  value={stats.total}
                  valueStyle={{ color: "#ffffff" }}
                  prefix={<FileTextOutlined />}
                />
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center h-full">
                <Statistic
                  title={<span className="text-purple-100">Topshirilgan</span>}
                  value={stats.submitted}
                  valueStyle={{ color: "#ffffff" }}
                  prefix={<FileTextOutlined />}
                />
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center h-full">
                <Statistic
                  title={<span className="text-purple-100">Ko&apos;rib chiqilmoqda</span>}
                  value={stats.underReview}
                  valueStyle={{ color: "#ffffff" }}
                  prefix={<ClockCircleOutlined />}
                />
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center h-full">
                <Statistic
                  title={<span className="text-purple-100">Tasdiqlangan</span>}
                  value={stats.approved}
                  valueStyle={{ color: "#ffffff" }}
                  prefix={<CheckCircleOutlined />}
                />
              </div>
            </Col>
          </Row>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Controls */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-center mb-6 sm:mb-8 gap-4">
          <Title level={3} className="!mb-0">Arizalar jadvali</Title>

          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_200px] gap-3 w-full lg:w-auto lg:min-w-[480px]">
            <div className="relative">
              <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Qidirish..."
                className="w-full h-11 sm:h-10 pl-10 pr-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setMobilePage(1); }}
              />
            </div>

            <select
              className="w-full h-11 sm:h-10 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setMobilePage(1); }}
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
        <Row gutter={[16, 16]} className="mb-6 sm:mb-8">
          <Col xs={24} lg={12}>
            <Card className="h-full rounded-xl transition-shadow duration-300 hover:shadow-md">
              <div className="flex items-center justify-between mb-4 gap-3">
                <Title level={4} className="!mb-0">Holatlar bo&apos;yicha taqsimot</Title>
                <ReloadOutlined className="text-gray-400 cursor-pointer" />
              </div>
              <div className="space-y-3">
                {[
                  { label: "Topshirilgan", value: stats.submitted, color: "blue" },
                  { label: "Ko'rib chiqilmoqda", value: stats.underReview, color: "processing" },
                  { label: "Tasdiqlangan", value: stats.approved, color: "success" },
                  { label: "Rad etilgan", value: stats.rejected, color: "error" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-3 h-3 shrink-0 rounded-full bg-${item.color}-500`}></div>
                      <span className="truncate">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge count={item.value} showZero color="#7367f0" />
                      <span className="text-sm text-gray-500 w-10 text-right">
                        {stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card className="h-full rounded-xl transition-shadow duration-300 hover:shadow-md">
              <div className="flex items-center justify-between mb-4 gap-3">
                <Title level={4} className="!mb-0">To&apos;lov holati</Title>
                <DollarOutlined className="text-green-500" />
              </div>
              <div className="space-y-3">
                {[
                  { label: "To'langan", value: stats.paid, color: "green" },
                  { label: "Kutilmoqda", value: stats.pendingPayment, color: "orange" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-3 h-3 shrink-0 rounded-full bg-${item.color}-500`}></div>
                      <span className="truncate">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge count={item.value} showZero color="#7367f0" />
                      <span className="text-sm text-gray-500 w-10 text-right">
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
          className="rounded-xl overflow-hidden"
          styles={{ body: { padding: 0 } }}
        >
          <div className="p-3 sm:p-6">
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <EmptyState
                  description={searchTerm ? "Hech qanday ariza topilmadi" : "Hozircha arizalar mavjud emas"}
                  action={
                    <Button className="h-11 sm:h-auto" onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}>
                      Barchalarini ko&apos;rish
                    </Button>
                  }
                />
              </div>
            ) : isMobile ? (
              <div className="space-y-3">
                {mobileItems.map((record) => (
                  <div key={record.id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold text-blue-600 dark:text-blue-400">#{record.submission_number}</div>
                        <div className="font-medium break-words">{record.application_title}</div>
                      </div>
                      <Tooltip title="Ko'rish">
                        <Button type="primary" icon={<EyeOutlined />} className="!w-11 !h-11 shrink-0" aria-label="Ko'rish" />
                      </Tooltip>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Tag color={getApplicationStatusColor(record.status)} className="!m-0">
                        {getApplicationStatusLabel(record.status)}
                      </Tag>
                      <Tag color={PAYMENT_COLORS[record.payment_status]} className="!m-0">
                        {PAYMENT_LABELS[record.payment_status] || record.payment_status}
                      </Tag>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div className="min-w-0 col-span-2">
                        <div className="text-xs text-gray-500">Ariza beruvchi</div>
                        <div className="font-medium break-words">{record.applicant_name}</div>
                        <div className="text-xs text-gray-500">{record.applicant_phone}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Yaratilgan:</div>
                        <div>{formatDate(record.created_at)}</div>
                      </div>
                      {record.submitted_at && (
                        <div>
                          <div className="text-xs text-gray-500">Topshirilgan:</div>
                          <div>{formatDate(record.submitted_at)}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {filteredSubmissions.length > MOBILE_PAGE_SIZE && (
                  <div className="flex justify-center pt-2">
                    <Pagination
                      current={currentMobilePage}
                      pageSize={MOBILE_PAGE_SIZE}
                      total={filteredSubmissions.length}
                      showSizeChanger={false}
                      showLessItems
                      onChange={(page) => setMobilePage(page)}
                    />
                  </div>
                )}
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={filteredSubmissions}
                rowKey="id"
                scroll={{ x: 1060 }}
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
