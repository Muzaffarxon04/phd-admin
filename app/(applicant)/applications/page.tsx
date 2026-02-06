"use client";

import dynamic from "next/dynamic";

import {
  Button,
  Row,
  Col,
  Tag,
  Badge,
  Typography,
  Breadcrumb,
  Input,
} from "antd";
import {
  ExclamationCircleOutlined,
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
  const { theme } = useThemeStore();
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
    <div style={{ minHeight: "100vh" }}>
      <div className="mx-auto">
        {/* Page Title & Breadcrumb */}
        <div className="mb-8 flex items-center gap-4">
          <Title level={4} className="!text-[24px] mb-0! border-r-1 border-[rgb(214,220,225)] pr-4" style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>
            Mavjud Arizalar
          </Title>
          <Breadcrumb
            items={[
              {
                href: "/dashboard",
                title: (
                  <span style={{ display: "flex", alignItems: "center", gap: 4, color: "rgb(115, 103, 240)" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="align-text-top feather feather-home"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                  </span>
                ),
              },
              { title: <span style={{ color: theme === "dark" ? "#ffffff" : "inherit" }}>Mavjud Arizalar</span> },
            ]}
          />
          <Badge count={filteredApplications.length} overflowCount={999} style={{ backgroundColor: "#7367f0" }} />
        </div>

        {/* Premium Filters & Search */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">

              <Input
                placeholder="Arizani izlang..."
                className="pl-9 pr-4 py-2 w-64 rounded-xl transition-all duration-300"
                style={{
                  background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
                  border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
                  color: theme === "dark" ? "#ffffff" : "#484650",
                }}
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7367f0]/50 transition-all duration-300 cursor-pointer"
              style={{
                background: theme === "dark" ? "rgb(40, 48, 70)" : "#ffffff",
                border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
                color: theme === "dark" ? "#ffffff" : "#484650",
              }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Saralash</option>
              <option value="DRAFT">Tayyorlanmoqda</option>
              <option value="SUBMITTED">Topshirilgan</option>
              <option value="UNDER_REVIEW">Ko&apos;rib chiqilmoqda</option>
            </select>
          </div>
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
            {filteredApplications.map((app: AvailableApplication) => {
              const isExpanded = expandedCards.has(app.id);
              return (
                <Col xs={24} sm={12} lg={8} key={app.id}>
                  <div
                    className="rounded-lg transition-all duration-300 cursor-pointer flex flex-col group overflow-hidden"
                    style={{
                      background: theme === "dark" ? "rgb(40, 48, 70)" : "rgba(255, 255, 255, 0.98)",
                      border: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
                      boxShadow: theme === "dark"
                        ? "0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)"
                        : "0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
                    }}
                    onClick={() => router.push(`/applications/${app.id}`)}
                  >
                    {/* Card Header */}
                    <div
                      className="p-6 flex justify-between items-center"
                      style={{ borderBottom: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)" }}
                    >
                      <h3
                        className="font-bold text-lg truncate flex-1 transition-opacity"
                        style={{ color: "#7367f0" }}
                        title={app.title}
                      >
                        {app.title}
                      </h3>
                      <div className="flex items-center gap-2 ml-4">
                        <div
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                          style={{
                            background: theme === "dark" ? "rgba(115, 103, 240, 0.1)" : "rgba(115, 103, 240, 0.05)",
                            color: theme === "dark" ? "#ffffff" : "#484650",
                          }}
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
                      className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? ' opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      {/* Card Content */}
                      <div className="p-6">
                        <Tag
                          className="mb-4 border-0 rounded-md px-3 py-1 text-xs font-bold uppercase tracking-wider"
                          style={{
                            background: "rgba(115, 103, 240, 0.15)",
                            color: "#7367f0"
                          }}
                        >
                          {getApplicationStatusLabel(app.status || "DRAFT")}
                        </Tag>

                        <Paragraph
                          className="text-sm mb-6 leading-relaxed line-clamp-3"
                          style={{ color: theme === "dark" ? "rgb(180, 183, 189)" : "#484650" }}
                          ellipsis={{ rows: 3 }}
                        >
                          {app.description}
                        </Paragraph>

                        <div className="space-y-4 mb-6">
                          <div
                            className="flex items-center justify-between text-sm py-1"
                            style={{ borderBottom: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(0, 0, 0, 0.03)" }}
                          >
                            <span style={{ color: "rgb(120, 120, 120)" }}>Tolov:</span>
                            <span style={{ fontWeight: 700, color: theme === "dark" ? "#ffffff" : "#333" }}>{app.application_fee} UZS</span>
                          </div>

                          <div
                            className="flex items-center justify-between text-sm py-1"
                            style={{ borderBottom: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(0, 0, 0, 0.03)" }}
                          >
                            <span style={{ color: "rgb(120, 120, 120)" }}>Imtihon sanasi:</span>
                            <span style={{ color: theme === "dark" ? "rgb(200, 203, 209)" : "#484650" }}>{app.exam_date ? formatDate(app.exam_date) : "Aniqlanmagan"}</span>
                          </div>

                          <div
                            className="flex items-center justify-between text-sm py-1"
                            style={{ borderBottom: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(0, 0, 0, 0.03)" }}
                          >
                            <span style={{ color: "rgb(120, 120, 120)" }}>Boshlanish:</span>
                            <span style={{ color: theme === "dark" ? "rgb(200, 203, 209)" : "#484650" }}>{formatDate(app.start_date)}</span>
                          </div>

                          <div
                            className="flex items-center justify-between text-sm py-1"
                            style={{ borderBottom: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(0, 0, 0, 0.03)" }}
                          >
                            <span style={{ color: "rgb(120, 120, 120)" }}>Tugash:</span>
                            <span style={{ color: theme === "dark" ? "rgb(200, 203, 209)" : "#484650" }}>{formatDate(app.end_date)}</span>
                          </div>

                          <div className="flex items-center justify-between text-sm py-1">
                            <span style={{ color: "rgb(120, 120, 120)" }}>Max. arizalar:</span>
                            <span style={{ color: theme === "dark" ? "rgb(200, 203, 209)" : "#484650" }}>{app.max_submissions || 1}</span>
                          </div>
                        </div>

                        {!app.can_apply && (
                          <div
                            className="mt-4 p-4 rounded-xl border"
                            style={{
                              background: theme === "dark" ? "rgba(255, 159, 67, 0.1)" : "rgba(255, 159, 67, 0.05)",
                              borderColor: "rgba(255, 159, 67, 0.3)"
                            }}
                          >
                            <div className="flex gap-2">
                              <ExclamationCircleOutlined className="mt-0.5" style={{ color: "#ff9f43" }} />
                              <Text style={{ fontSize: "14px", color: theme === "dark" ? "#ff9f43" : "#ff9f43", fontWeight: 500 }}>
                                {app.can_apply_message}
                              </Text>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Footer */}
                      <div
                        className="px-6 py-5"
                        style={{ background: theme === "dark" ? "rgba(0, 0, 0, 0.1)" : "rgba(0, 0, 0, 0.02)", borderTop: theme === "dark" ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)" }}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Jarayon</span>
                          <span className="text-sm font-black" style={{ color: "#7367f0" }}>
                            {Math.round(app.user_submission_count ? (app.user_submission_count / (app.max_submissions || 1)) * 100 : 0)}%
                          </span>
                        </div>
                        <div
                          className="w-full rounded-full h-2 overflow-hidden"
                          style={{ background: theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)" }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                              width: `${app.user_submission_count ? (app.user_submission_count / (app.max_submissions || 1)) * 100 : 0}%`,
                              background: "linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.7))"
                            }}
                          />
                        </div>
                        <Button
                          type="primary"
                          block
                          className="mt-4"
                          style={{
                            height: "40px",
                            fontWeight: 500,
                            borderRadius: "8px"
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/applications/${app.id}`);
                          }}
                        >
                          Ariza topshirish
                        </Button>
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