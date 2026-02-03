"use client";

import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Progress,
  Badge,
  Timeline,
  // Statistic,
  Row,
  Col,
  Alert,
  Tooltip
} from "antd";
import {
  EyeOutlined,
  FileTextOutlined,
  // CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  ReloadOutlined,
  DollarOutlined,
  CalendarOutlined,
  DownloadOutlined,
  EyeInvisibleOutlined,
  PlusOutlined
} from "@ant-design/icons";
import { useGet } from "@/lib/hooks";
import { useThemeStore } from "@/lib/stores/themeStore";
import { TableSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import Link from "next/link";
import { formatDate, getApplicationStatusLabel, getApplicationStatusColor } from "@/lib/utils";
import { useState, useMemo } from "react";

const { Title, Text } = Typography;

interface Submission {
  id: number;
  submission_number: string;
  application_title: string;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN";
  payment_status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  created_at: string;
  submitted_at?: string;
  review_notes?: string;
  documents_uploaded?: number;
  total_required_documents?: number;
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
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Handle different response formats
  const submissions = useMemo(() => {
    if (!submissionsData) return [];
    if (Array.isArray(submissionsData)) return submissionsData;
    if (submissionsData.data && submissionsData.data.data && Array.isArray(submissionsData.data.data)) return submissionsData.data.data;
    if (submissionsData.data && Array.isArray(submissionsData.data)) return submissionsData.data;
    return [];
  }, [submissionsData]);

  // Filter submissions based on status and search
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(submission => {
      const matchesStatus = statusFilter === "all" || submission.status === statusFilter;
      const matchesSearch = submission.application_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  // Timeline data for visual representation
  const timelineData = filteredSubmissions.slice(0, 5).map(submission => ({
    key: submission.id,
    status: submission.status,
    title: submission.application_title,
    submissionNumber: submission.submission_number,
    date: submission.created_at,
    paymentStatus: submission.payment_status,
    reviewNotes: submission.review_notes,
    color: getApplicationStatusColor(submission.status),
  }));

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
          <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-[#484650]"}`}>
            Yaratilgan: {formatDate(record.created_at)}
          </div>
        </div>
      ),
      width: 180,
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <TrophyOutlined />
          <span>Ariza nomi</span>
        </div>
      ),
      dataIndex: "application_title",
      key: "application_title",
      render: (text: string, record: Submission) => (
        <div className="max-w-xs">
          <Tooltip title={text}>
            <div className={`font-medium truncate ${theme === "dark" ? "text-gray-200" : "text-[#484650]"}`} title={text}>
              {text}
            </div>
          </Tooltip>
          <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-[#484650]"}`}>
            {record.submitted_at && "Topshirilgan: " + formatDate(record.submitted_at)}
          </div>
        </div>
      ),
      width: 250,
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
        <Badge
          status={status === "APPROVED" ? "success" : status === "REJECTED" ? "error" : "processing"}
          text={<span style={{ color: theme === "dark" ? "rgb(200, 203, 209)" : "#484650" }}>{getApplicationStatusLabel(status)}</span>}
        />
      ),
      width: 150,
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <DollarOutlined />
          <span>Tolov holati</span>
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
          <span>Amallar</span>
        </div>
      ),
      key: "actions",
      render: (_: unknown, record: Submission) => (
        <Space size="small">
          <Link href={`/my-submissions/${record.id}`}>
            <Tooltip title="Ko'rish">
              <Button
                type="primary"
                size="small"
                icon={<EyeOutlined />}
                className=" from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-0"
              />
            </Tooltip>
          </Link>

          {record.status === "DRAFT" && (
            <Link href={`/my-submissions/${record.id}`}>
              <Tooltip title="Tahrirlash">
                <Button
                  size="small"
                  icon={<EyeInvisibleOutlined />}
                />
              </Tooltip>
            </Link>
          )}

          {record.documents_uploaded && record.total_required_documents && (
            <Tooltip title={`${record.documents_uploaded}/${record.total_required_documents} hujjat yuklandi`}>
              <Button
                size="small"
                icon={<DownloadOutlined />}
              >
                {record.documents_uploaded}
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
      width: 120,
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <Title level={2} className="mb-8">Mening Arizalarim</Title>
          <TableSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    // Handle array error format from backend
    let errorMessage = error.message || "Ma'lumotlarni yuklashda xatolik yuz berdi";

    const errorData = (error).data;
    if (errorData && Array.isArray(errorData)) {
      errorMessage = errorData.join(", ");
    }

    return (
      <div className="min-h-screen p-8">
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
    <div className="min-h-screen">
      {/* Header Section */}
      <div className={`text-white`}>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <Title className="text-4xl font-bold mb-4">Mening Arizalarim</Title>
            <Text className="text-xl text-purple-100">Ozingiz topshirgan arizalarni kuzating</Text>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 ">
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <Title level={2} className="mb-0">Arizalar royxati</Title>

          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Ariza nomi raqamini qidirish..."
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FileTextOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            <select
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Barchasi</option>
              <option value="DRAFT">Tayyorlanmoqda</option>
              <option value="SUBMITTED">Topshirilgan</option>
              <option value="UNDER_REVIEW">Korib chiqilmoqda</option>
              <option value="APPROVED">Tasdiqlangan</option>
              <option value="REJECTED">Rad etilgan</option>
            </select>
          </div>
        </div>

        {/* Stats Summary */}
        {/* <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} lg={12}>
            <Card className="transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <Title level={4} className="mb-0">Holatlar boyicha taqsimot</Title>
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
                      <Progress
                        percent={stats.total > 0 ? (item.value / stats.total) * 100 : 0}
                        size="small"
                        showInfo={false}
                        strokeColor={{
                          '0%': item.color === "blue" ? "#1890ff" :
                            item.color === "processing" ? "#1890ff" :
                              item.color === "success" ? "#52c41a" : "#ff4d4f",
                          '100%': item.color === "blue" ? "#1890ff" :
                            item.color === "processing" ? "#1890ff" :
                              item.color === "success" ? "#52c41a" : "#ff4d4f",
                        }}
                        trailColor={theme === "dark" ? "#374151" : "#f0f0f0"}
                        style={{ width: "80px" }}
                      />
                      <span className="text-sm font-medium w-8 text-right">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card className="transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <Title level={4} className="mb-0">Tolov holati</Title>
                <DollarOutlined className="text-green-500" />
              </div>
              <div className="space-y-3">
                {[
                  { label: "Tolangan", value: stats.paid, color: "green" },
                  { label: "Kutilmoqda", value: stats.pendingPayment, color: "orange" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full bg-${item.color}-500`}></div>
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        percent={stats.total > 0 ? (item.value / stats.total) * 100 : 0}
                        size="small"
                        showInfo={false}
                        strokeColor={{
                          '0%': item.color === "green" ? "#52c41a" : "#faad14",
                          '100%': item.color === "green" ? "#52c41a" : "#faad14",
                        }}
                        trailColor={theme === "dark" ? "#374151" : "#f0f0f0"}
                        style={{ width: "80px" }}
                      />
                      <span className="text-sm font-medium w-8 text-right">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row> */}

        {/* Table */}
        <Card
          className="transform hover:scale-[1.01] transition-all duration-300"
          bodyStyle={{
            padding: "0",
            borderRadius: "16px",
            overflow: "hidden",
            background: theme === "dark" ? "#1a1d29" : "#ffffff"
          }}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <Title level={3} className="mb-0">Arizalar jadvali</Title>
              <Space>
                <Badge count={filteredSubmissions.length} overflowCount={999} />
                <Link href="/applications">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    className=" from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0"
                  >
                    Yangi ariza
                  </Button>
                </Link>
              </Space>
            </div>

            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-12">
                <EmptyState
                  description={searchTerm ? "Hech qanday ariza topilmadi" : "Hozircha arizalar mavjud emas"}
                  action={
                    <Link href="/applications">
                      <Button type="primary">
                        Yangi ariza yaratish
                      </Button>
                    </Link>
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

        {/* Recent Activities */}
        <div className="mt-8">
          <Timeline
            items={timelineData.map(item => ({
              color: item.color,
              dot: <ClockCircleOutlined />,
              children: (
                <Card
                  size="small"
                  className="mb-4 border-l-4 border-l-blue-500"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{item.title}</h4>
                    <Tag color={item.color}>{getApplicationStatusLabel(item.status)}</Tag>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    #{item.submissionNumber} • {formatDate(item.date)}
                    {item.reviewNotes && (
                      <div className="mt-2">
                        <Alert
                          message="Izoh"
                          description={item.reviewNotes}
                          type="info"
                          showIcon
                        />
                      </div>
                    )}
                  </div>
                </Card>
              )
            }))}
          />
        </div>
      </div>
    </div>
  );
}