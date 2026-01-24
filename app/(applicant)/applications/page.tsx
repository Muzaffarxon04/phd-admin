"use client";

import { Card, Button, Row, Col } from "antd";
import { FileTextOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useGet } from "@/lib/hooks";
import { useThemeStore } from "@/lib/stores/themeStore";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

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

export default function ApplicationsPage() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { data: applicationsData, isLoading, error } = useGet<ApplicationsResponse | AvailableApplication[]>("/applicant/applications/");
  
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

  if (isLoading) {
    return (
      <div style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>
        <h1 style={{ 
          fontSize: "24px", 
          fontWeight: 700,
          marginBottom: 24,
          color: theme === "dark" ? "#ffffff" : "#1a1a1a"
        }}>
          Mavjud Arizalar
        </h1>
        <Row gutter={[16, 16]}>
          {[1, 2, 3].map((i) => (
            <Col xs={24} sm={12} lg={8} key={i}>
              <CardSkeleton />
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  if (error) {
    // Handle array error format from backend
    let errorMessage = error.message || "Ma'lumotlarni yuklashda xatolik yuz berdi";
    
    // Agar backenddan array formatida error kelgan bo'lsa
    if (Array.isArray((error as any).data)) {
      errorMessage = (error as any).data.join(", ");
    }
    
    return (
      <div style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>
        <h1 style={{ 
          fontSize: "24px", 
          fontWeight: 700,
          marginBottom: 24,
          color: theme === "dark" ? "#ffffff" : "#1a1a1a"
        }}>
          Mavjud Arizalar
        </h1>
        <ErrorState 
          description={errorMessage}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Ensure applications is always an array
  const tableData = Array.isArray(applications) ? applications : [];

  const cardStyle = {
    background: theme === "dark" ? "#252836" : "#ffffff",
    border: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.06)",
    borderRadius: "12px",
    boxShadow: theme === "dark" 
      ? "0 4px 12px rgba(0, 0, 0, 0.2)" 
      : "0 2px 8px rgba(0, 0, 0, 0.08)",
    transition: "all 0.3s ease",
  };

  return (
    <div style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>
      <h1 style={{ 
        fontSize: "24px", 
        fontWeight: 700,
        marginBottom: 24,
        color: theme === "dark" ? "#ffffff" : "#1a1a1a"
      }}>
        Mavjud Arizalar
      </h1>

      {!tableData || tableData.length === 0 ? (
        <EmptyState 
          description="Hozircha mavjud arizalar yo'q"
          action={
            <Link href="/applications">
              <Button 
                type="primary"
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                }}
              >
                Yangi ariza yaratish
              </Button>
            </Link>
          }
        />
      ) : (
        <Row gutter={[16, 16]}>
          {tableData.map((app) => (
            <Col xs={24} sm={12} lg={8} key={app.id}>
              <Card
                hoverable
                style={{
                  ...cardStyle,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = theme === "dark"
                    ? "0 8px 24px rgba(102, 126, 234, 0.3)"
                    : "0 8px 24px rgba(102, 126, 234, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = cardStyle.boxShadow;
                }}
                onClick={() => router.push(`/applications/${app.id}`)}
                title={
                  <span style={{ 
                    fontSize: "18px", 
                    fontWeight: 600,
                    color: theme === "dark" ? "#ffffff" : "#1a1a1a"
                  }}>
                    {app.title}
                  </span>
                }
                extra={
                  <Link href={`/applications/${app.id}`} onClick={(e) => e.stopPropagation()}>
                    <Button 
                      type="primary"
                      icon={<ArrowRightOutlined />}
                      style={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: 600,
                      }}
                    >
                      Batafsil
                    </Button>
                  </Link>
                }
              >
                <p style={{ 
                  color: theme === "dark" ? "#8b8b8b" : "#666",
                  marginBottom: 16,
                  minHeight: 60,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}>
                  {app.description}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "14px" }}>
                  <p style={{ margin: 0, color: theme === "dark" ? "#8b8b8b" : "#666" }}>
                    <strong style={{ color: theme === "dark" ? "#ffffff" : "#1a1a1a" }}>Boshlanish:</strong> {formatDate(app.start_date)}
                  </p>
                  <p style={{ margin: 0, color: theme === "dark" ? "#8b8b8b" : "#666" }}>
                    <strong style={{ color: theme === "dark" ? "#ffffff" : "#1a1a1a" }}>Tugash:</strong> {formatDate(app.end_date)}
                  </p>
                  {app.exam_date && (
                    <p style={{ margin: 0, color: theme === "dark" ? "#8b8b8b" : "#666" }}>
                      <strong style={{ color: theme === "dark" ? "#ffffff" : "#1a1a1a" }}>Imtihon sana:</strong> {formatDate(app.exam_date)}
                    </p>
                  )}
                  <p style={{ margin: 0, color: theme === "dark" ? "#8b8b8b" : "#666" }}>
                    <strong style={{ color: theme === "dark" ? "#ffffff" : "#1a1a1a" }}>To'lov:</strong> {app.application_fee} UZS
                  </p>
                </div>
                {app.can_apply === false && (
                  <div style={{
                    marginTop: 16,
                    padding: "12px",
                    background: theme === "dark" ? "rgba(255, 193, 7, 0.1)" : "#fffbe6",
                    borderRadius: "8px",
                    border: `1px solid ${theme === "dark" ? "rgba(255, 193, 7, 0.3)" : "#ffe58f"}`,
                    color: theme === "dark" ? "#ffc107" : "#d48806",
                    fontSize: "13px",
                  }}>
                    {app.can_apply_message}
                  </div>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}

