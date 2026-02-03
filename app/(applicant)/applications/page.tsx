"use client";

import dynamic from "next/dynamic";

import {
  Button,
  Row,
  Col,
  Tag,
  Badge,
  Typography,
} from "antd";
import {
  ExclamationCircleOutlined,
  SearchOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { useGet } from "@/lib/hooks";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDate, getApplicationStatusLabel } from "@/lib/utils";
import { useState } from "react";
import { useThemeStore } from "@/lib/stores/themeStore";
// import router from "next/router";

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
  const router = useRouter();
  const { data: applicationsData, isLoading, error } = useGet<ApplicationsResponse | AvailableApplication[]>("/applicant/applications/");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  const toggleCard = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  };

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
    if (Array.isArray((error).data)) {
      errorMessage = (error).data.join(", ");
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
            {filteredApplications.map((app) => {
              const isExpanded = expandedCards.has(app.id);
              return (
                <Col xs={24} sm={12} lg={8} key={app.id}>
                  <div
                    className="bg-white dark:bg-[#111827] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all duration-500 cursor-pointer flex flex-col group"
                    onClick={() => router.push(`/applications/${app.id}`)}
                  >
                    {/* Card Header */}
                    <div className="p-6 flex justify-between items-center border-b border-gray-100 dark:border-gray-800/50">
                      <h3 className="text-[#43A047] dark:text-[#66BB6A] font-bold text-lg truncate flex-1 group-hover:opacity-80 transition-opacity" title={app.title}>
                        {app.title}
                      </h3>
                      <div className="flex items-center gap-2 ml-4">
                        <div
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleCard(app.id, e);
                          }}
                        >
                          <DownOutlined className={`text-[10px] duration-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} /> Batafsil
                        </div>
                      </div>
                    </div>
                    {/* Card Content & Footer Container */}
                    <div
                      className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      {/* Card Content */}
                      <div className="p-6">
                        <Tag
                          color="blue"
                          className="mb-4 border-0 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md px-3 py-1 text-xs font-bold uppercase tracking-wider"
                        >
                          {getApplicationStatusLabel(app.status || "DRAFT")}
                        </Tag>

                        <Paragraph
                          className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed line-clamp-3"
                          ellipsis={{ rows: 3 }}
                        >
                          {app.description}
                        </Paragraph>

                        <div className="space-y-4 mb-6">
                          <div className="flex items-center justify-between text-sm py-1 border-b border-gray-50 dark:border-gray-800/30">
                            <span className="text-gray-500 font-medium">Tolov:</span>
                            <span className="text-gray-900 dark:text-gray-100 font-bold">{app.application_fee} UZS</span>
                          </div>

                          <div className="flex items-center justify-between text-sm py-1 border-b border-gray-50 dark:border-gray-800/30">
                            <span className="text-gray-500 font-medium">Imtihon sanasi:</span>
                            <span className="text-gray-900 dark:text-gray-200">{app.exam_date ? formatDate(app.exam_date) : "Aniqlanmagan"}</span>
                          </div>

                          <div className="flex items-center justify-between text-sm py-1 border-b border-gray-50 dark:border-gray-800/30">
                            <span className="text-gray-500 font-medium">Boshlanish:</span>
                            <span className="text-gray-900 dark:text-gray-200">{formatDate(app.start_date)}</span>
                          </div>

                          <div className="flex items-center justify-between text-sm py-1 border-b border-gray-50 dark:border-gray-800/30">
                            <span className="text-gray-500 font-medium">Tugash:</span>
                            <span className="text-gray-900 dark:text-gray-200">{formatDate(app.end_date)}</span>
                          </div>

                          <div className="flex items-center justify-between text-sm py-1">
                            <span className="text-gray-500 font-medium">Max. arizalar:</span>
                            <span className="text-gray-900 dark:text-gray-200">{app.max_submissions || 1}</span>
                          </div>
                        </div>

                        {!app.can_apply && (
                          <div className="mt-4 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
                            <div className="flex gap-2">
                              <ExclamationCircleOutlined className="text-orange-500 mt-0.5" />
                              <Text className="text-sm text-orange-800 dark:text-orange-300 font-medium leading-relaxed">
                                {app.can_apply_message}
                              </Text>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Footer */}
                      <div className="px-6 py-5 bg-gray-50/50 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-800/50">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Jarayon</span>
                          <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                            {Math.round(app.user_submission_count ? (app.user_submission_count / (app.max_submissions || 1)) * 100 : 0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${app.user_submission_count ? (app.user_submission_count / (app.max_submissions || 1)) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        )}
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(ApplicationsPage), {
  ssr: false,
});