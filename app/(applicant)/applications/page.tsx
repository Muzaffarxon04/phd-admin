"use client";

import dynamic from "next/dynamic";

import { 
  Card, 
  Button, 
  Row, 
  Col, 
  Tag, 
  Badge, 
  Typography, 
  // Space, 
  Divider, 
  // Tooltip,
  Progress,
  // Statistic,
  // Timeline
} from "antd";
import { 
  // FileTextOutlined, 
  ArrowRightOutlined,
  // ClockCircleOutlined,
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  TrophyOutlined,
  EyeOutlined,
  // PlusOutlined,
  // FilterOutlined,
  SearchOutlined
} from "@ant-design/icons";
import { useGet } from "@/lib/hooks";
import { useThemeStore } from "@/lib/stores/themeStore";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import Link from "next/link";
// import { useRouter } from "next/navigation";
import { formatDate, getApplicationStatusLabel, getApplicationStatusColor } from "@/lib/utils";
import { useState } from "react";

const { Title, Text, Paragraph } = Typography;

interface AvailableApplication {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  exam_date?: string | null;
  application_fee: string;
  can_apply: boolean;
  can_apply_message: string;
  requires_oneid_verification?: boolean;
  max_submissions?: number;
  instructions?: string;
  required_documents?: unknown[];
  user_submission_count?: number;
  status?: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN";
}

interface ApplicationsResponse {
  next: string | null;
  previous: string | null;
  total_elements: number;
  page_size: number;
  data: {
    message: string;
    error: string | null;
    status: number;
    data: AvailableApplication[];
  };
  from: number;
  to: number;
}

function ApplicationsPage() {
  // const router = useRouter();
  const { theme } = useThemeStore();
  const { data: applicationsData, isLoading, error } = useGet<ApplicationsResponse | AvailableApplication[]>("/applicant/applications/");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Handle different response formats
  let applications: AvailableApplication[] = [];
  if (applicationsData) {
    if (Array.isArray(applicationsData)) {
      applications = applicationsData;
    } else if (applicationsData.data && applicationsData.data.data && Array.isArray(applicationsData.data.data)) {
      applications = applicationsData.data.data;
    } else if (applicationsData.data && Array.isArray(applicationsData.data)) {
      applications = applicationsData.data;
    }
  }

  // Filter applications based on search and status
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Title level={2} className="mb-8 text-center">Mavjud Arizalar</Title>
          <Row gutter={[24, 24]}>
            {[1, 2, 3].map((i) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={i}>
                <CardSkeleton />
              </Col>
            ))}
          </Row>
        </div>
      </div>
    );
  }

  if (error) {
    // Handle array error format from backend
    let errorMessage = error.message || "Ma&apos;lumotlarni yuklashda xatolik yuz berdi";
    
    // Agar backenddan array formatida error kelgan bo&apos;lsa
    if (Array.isArray((error ).data)) {
      errorMessage = (error ).data.join(", ");
    }
    
    return (
      <div className="min-h-screen ">
        <div className=" text-center">
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
  

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Title level={2} className="mb-0!">Mavjud Arizalar</Title>
            <Badge count={filteredApplications.length} overflowCount={999} />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Izlash..."
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg  focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg  focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Barchasi</option>
              <option value="DRAFT">Tayyorlanmoqda</option>
              <option value="SUBMITTED">Topshirilgan</option>
              <option value="UNDER_REVIEW">Ko&apos;rib chiqilmoqda</option>
            </select>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Tag 
            className={`cursor-pointer ${statusFilter === "all" ? "bg-blue-500 text-white" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            Barchasi ({filteredApplications.length})
          </Tag>
          <Tag 
            className={`cursor-pointer ${statusFilter === "DRAFT" ? "bg-blue-500 text-white" : ""}`}
            onClick={() => setStatusFilter("DRAFT")}
          >
            Tayyorlanmoqda ({filteredApplications.filter(a => a.status === "DRAFT").length})
          </Tag>
          <Tag 
            className={`cursor-pointer ${statusFilter === "SUBMITTED" ? "bg-blue-500 text-white" : ""}`}
            onClick={() => setStatusFilter("SUBMITTED")}
          >
            Topshirilgan ({filteredApplications.filter(a => a.status === "SUBMITTED").length})
          </Tag>
          <Tag 
            className={`cursor-pointer ${statusFilter === "UNDER_REVIEW" ? "bg-blue-500 text-white" : ""}`}
            onClick={() => setStatusFilter("UNDER_REVIEW")}
          >
            Ko&apos;rib chiqilmoqda ({filteredApplications.filter(a => a.status === "UNDER_REVIEW").length})
          </Tag>
        </div>

        {/* Applications Grid */}
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <EmptyState 
              description={searchTerm ? "Hech qanday ariza topilmadi" : "Hozircha mavjud arizalar yo&apos;q"}
              action={
                searchTerm ? 
                  <Button onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}>Barchalarini ko&apos;rish</Button>
                  : 
                  <Link href="/dashboard">
                    <Button type="primary">
                      Yangi ariza yaratish
                    </Button>
                  </Link>
              }
            />
          </div>
        ) : (
          <Row gutter={[24, 24]}>
            {filteredApplications.map((app) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={app.id}>
                <Card
                  className="h-full transform hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer"
                  hoverable
                  bodyStyle={{
                    padding: "0",
                    borderRadius: "16px",
                    overflow: "hidden",
                    background: theme === "dark" ? "#1a1d29" : "#ffffff",
                    color: theme === "dark" ? "#ffffff" : "#333333"
                  }}
                  actions={[
                    <Link href={`/applications/${app.id}`} key="view" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        type="primary"
                        icon={<EyeOutlined />}
                        className=" from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-0"
                      >
                        Ko&apos;rish
                      </Button>
                    </Link>
                  ]}
                >
                  {/* Header */}
                  <div className="p-6 pb-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-2 line-clamp-2" title={app.title}>
                          {app.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <CalendarOutlined />
                          <span>{formatDate(app.start_date)} - {formatDate(app.end_date)}</span>
                        </div>
                      </div>
                      <Tag 
                        color={getApplicationStatusColor(app.status || "DRAFT")}
                        className="shrink-0"
                      >
                        {getApplicationStatusLabel(app.status || "DRAFT")}
                      </Tag>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6">
                    <div className="mb-4">
                      <Progress 
                        percent={app.user_submission_count ? (app.user_submission_count / (app.max_submissions || 1)) * 100 : 0}
                        strokeColor={{
                          '0%': '#1890ff',
                          '100%': '#722ed1',
                        }}
                        showInfo={false}
                        size="small"
                        className="mb-2"
                        trailColor={theme === "dark" ? "#374151" : "#f0f0f0"}
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Arizalar</span>
                        <span>{app.user_submission_count || 0}/{app.max_submissions || 1}</span>
                      </div>
                    </div>

                    <Paragraph className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3" ellipsis={{ rows: 3 }}>
                      {app.description}
                    </Paragraph>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarOutlined className="text-green-500" />
                        <span className="font-semibold">{app.application_fee} UZS</span>
                      </div>
                    </div>

                    {/* Application Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Imtihon sanasi:</span>
                        <span className="font-medium">
                          {app.exam_date ? formatDate(app.exam_date) : "Aniqlanmagan"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Tekshirish:</span>
                        <div className="flex items-center gap-1">
                          {app.requires_oneid_verification ? (
                            <>
                              <ExclamationCircleOutlined className="text-orange-500" />
                              <span>Talab qilinadi</span>
                            </>
                          ) : (
                            <>
                              <CheckCircleOutlined className="text-green-500" />
                              <span>Zarur emas</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {!app.can_apply && (
                      <div className="mb-4 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                        <Text type="warning" className="text-sm">
                          {app.can_apply_message}
                        </Text>
                      </div>
                    )}

                    {/* Footer */}
                    <Divider className="my-4" />
                    <div className="flex items-center justify-between">
                      <Text type="secondary" className="text-sm">
                        <TrophyOutlined className="mr-1" />
                        Shu yo&apos;nalish
                      </Text>
                      <Link href={`/applications/${app.id}`}>
                        <Button 
                          type="primary"
                          icon={<ArrowRightOutlined />}
                          size="small"
                          className=" from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-0"
                        >
                          Batafsil
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(ApplicationsPage), {
  ssr: false,
});