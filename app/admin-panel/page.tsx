"use client";

import { Row, Col, Card, Button, Select, Tag } from "antd";
import {
  ArrowUpOutlined,
  ExportOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  UserOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { useGet } from "@/lib/hooks";
import { useThemeStore } from "@/lib/stores/themeStore";
import { DashboardSkeleton } from "@/components/LoadingSkeleton";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatDate } from "@/lib/utils";

interface Submission {
  status: string;
  payment_status?: string;
  application_title?: string;
  created_at?: string;
  [key: string]: unknown;
}

interface Application {
  id: number;
  title: string;
  status: string;
  total_submissions?: number;
  [key: string]: unknown;
}

export default function AdminPanelPage() {
  const { theme } = useThemeStore();
  const { data: applications, isLoading: isLoadingApps } = useGet<unknown[]>("/admin/application/");
  const { data: submissions, isLoading: isLoadingSubs } = useGet<unknown[]>("/admin/application/submissions/");

  const totalApplications = applications?.length || 0;
  const totalSubmissions = submissions?.length || 0;
  const submissionsList = (submissions as Submission[]) || [];
  
  // Arizalar holati boyicha statistika
  const approvedCount = submissionsList.filter((s) => s.status === "APPROVED").length;
  const rejectedCount = submissionsList.filter((s) => s.status === "REJECTED").length;
  const pendingCount = submissionsList.filter((s) => s.status === "UNDER_REVIEW" || s.status === "SUBMITTED").length;
  const draftCount = submissionsList.filter((s) => s.status === "DRAFT").length;
  
  // Tolovlar boyicha statistika
  const paidCount = submissionsList.filter((s) => s.payment_status === "PAID").length;
  const pendingPaymentCount = submissionsList.filter((s) => s.payment_status === "PENDING").length;
  const failedPaymentCount = submissionsList.filter((s) => s.payment_status === "FAILED").length;
  
  // Oylik statistika (oxirgi 6 oy)
  const currentMonth = new Date().getMonth();
  const months = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const monthIndex = (currentMonth - 5 + i + 12) % 12;
    const monthSubmissions = submissionsList.filter((s) => {
      if (!s.created_at) return false;
      const date = new Date(s.created_at);
      return date.getMonth() === monthIndex;
    });
    return {
      month: months[monthIndex],
      arizalar: monthSubmissions.length,
      qabul: monthSubmissions.filter((s) => s.status === "APPROVED").length,
      rad: monthSubmissions.filter((s) => s.status === "REJECTED").length,
    };
  });
  
  // Eng kop ariza berilgan arizalar (top 5)
  const applicationsList = (applications as Application[]) || [];
  const topApplications = [...applicationsList]
    .sort((a, b) => (b.total_submissions || 0) - (a.total_submissions || 0))
    .slice(0, 5);
  
  // Oxirgi arizalar (5 ta)
  const recentSubmissions = [...submissionsList]
    .sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  // Chart data - Arizalar holati boyicha
  const statusData = [
    { name: "Qabul qilingan", value: approvedCount, color: "#52c41a" },
    { name: "Rad etilgan", value: rejectedCount, color: "#ff4d4f" },
    { name: "Tekshirilmoqda", value: pendingCount, color: "#faad14" },
    { name: "Qoralama", value: draftCount, color: "#8b8b8b" },
  ].filter((item) => item.value > 0);

  // Chart data - Tolovlar holati boyicha
  const paymentData = [
    { name: "Tolangan", value: paidCount, color: "#52c41a" },
    { name: "Kutilmoqda", value: pendingPaymentCount, color: "#faad14" },
    { name: "Xatolik", value: failedPaymentCount, color: "#ff4d4f" },
  ].filter((item) => item.value > 0);
  
  // Foiz ozgarishlar (mock data - keyinroq API'dan keladi)
  const calculatePercentage = (current: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((current / total) * 100);
  };
  
  const approvalRate = totalSubmissions > 0 ? calculatePercentage(approvedCount, totalSubmissions) : 0;
  const paymentRate = totalSubmissions > 0 ? calculatePercentage(paidCount, totalSubmissions) : 0;

  if (isLoadingApps || isLoadingSubs) {
    return <DashboardSkeleton />;
  }

  const cardStyle = {
    background: theme === "dark" ? "#252836" : "#ffffff",
    border: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.06)",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: theme === "dark" 
      ? "0 4px 12px rgba(0, 0, 0, 0.2)" 
      : "0 2px 8px rgba(0, 0, 0, 0.08)",
  };

  return (
    <div style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>
      {/* Key Metrics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: "14px", 
                  color: theme === "dark" ? "#8b8b8b" : "#666",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}>
                  <FileTextOutlined style={{ fontSize: "16px" }} />
                  Jami Arizalar
                </div>
                <div style={{ 
                  fontSize: "28px", 
                  fontWeight: 700,
                  color: theme === "dark" ? "#ffffff" : "#1a1a1a",
                  marginBottom: 8 
                }}>
                  {totalApplications.toLocaleString()}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <ArrowUpOutlined style={{ color: "#52c41a", fontSize: "12px" }} />
                  <span style={{ color: "#52c41a", fontSize: "12px", fontWeight: 600 }}>
                    {totalApplications > 0 ? `+${Math.round((totalApplications / 10) * 100) / 10}` : 0}%
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle}>
            <div>
              <div style={{ 
                fontSize: "14px", 
                color: theme === "dark" ? "#8b8b8b" : "#666",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 6
              }}>
                <UserOutlined style={{ fontSize: "16px" }} />
                Topshirilgan Arizalar
              </div>
              <div style={{ 
                fontSize: "28px", 
                fontWeight: 700,
                color: theme === "dark" ? "#ffffff" : "#1a1a1a",
                marginBottom: 8 
              }}>
                {totalSubmissions.toLocaleString()}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <ArrowUpOutlined style={{ color: "#52c41a", fontSize: "12px" }} />
                <span style={{ color: "#52c41a", fontSize: "12px", fontWeight: 600 }}>
                  {totalSubmissions > 0 ? `+${Math.round((totalSubmissions / 20) * 100) / 10}` : 0}%
                </span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle}>
            <div>
              <div style={{ 
                fontSize: "14px", 
                color: theme === "dark" ? "#8b8b8b" : "#666",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 6
              }}>
                <CheckCircleOutlined style={{ fontSize: "16px", color: "#52c41a" }} />
                Qabul qilingan
              </div>
              <div style={{ 
                fontSize: "28px", 
                fontWeight: 700,
                color: "#52c41a",
                marginBottom: 8 
              }}>
                {approvedCount}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ color: theme === "dark" ? "#8b8b8b" : "#666", fontSize: "12px" }}>
                  {approvalRate}% qabul qilingan
                </span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle}>
            <div>
              <div style={{ 
                fontSize: "14px", 
                color: theme === "dark" ? "#8b8b8b" : "#666",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 6
              }}>
                <DollarOutlined style={{ fontSize: "16px", color: "#52c41a" }} />
                To&apos;langan
              </div>
              <div style={{ 
                fontSize: "28px", 
                fontWeight: 700,
                color: "#52c41a",
                marginBottom: 8 
              }}>
                {paidCount}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ color: theme === "dark" ? "#8b8b8b" : "#666", fontSize: "12px" }}>
                  {paymentRate}% to&apos;lovlar
                </span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card 
            style={cardStyle}
            title={
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "16px", fontWeight: 600 }}>Arizalar holati</span>
                <Button 
                  type="text" 
                  icon={<ExportOutlined />}
                  style={{ color: theme === "dark" ? "#ffffff" : "#666" }}
                >
                  Export
                </Button>
              </div>
            }
          >
            <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ 
                position: "absolute", 
                top: "50%", 
                left: "50%", 
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                pointerEvents: "none"
              }}>
                <div style={{ fontSize: "24px", fontWeight: 700, color: theme === "dark" ? "#ffffff" : "#1a1a1a" }}>
                  {totalSubmissions}
                </div>
                <div style={{ fontSize: "12px", color: theme === "dark" ? "#8b8b8b" : "#666" }}>Jami</div>
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap", justifyContent: "center" }}>
                {statusData.map((item, index) => (
                  <div key={index} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: "50%", 
                      background: item.color 
                    }} />
                    <span style={{ fontSize: "14px", color: theme === "dark" ? "#8b8b8b" : "#666" }}>
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            style={cardStyle}
            title={
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 600 }}>Oylik arizalar statistikasi</div>
                  <div style={{ fontSize: "14px", color: theme === "dark" ? "#8b8b8b" : "#666", marginTop: 4 }}>
                    Oxirgi 6 oy
                  </div>
                </div>
                <Select
                  defaultValue="last-6-months"
                  style={{ width: 140 }}
                  options={[
                    { value: "last-6-months", label: "Oxirgi 6 oy" },
                    { value: "last-12-months", label: "Oxirgi 12 oy" },
                  ]}
                />
              </div>
            }
          >
            <div style={{ marginBottom: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 12, height: 12, background: "#667eea", borderRadius: "2px" }} />
                <span style={{ fontSize: "12px", color: theme === "dark" ? "#8b8b8b" : "#666" }}>Jami arizalar</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 12, height: 12, background: "#52c41a", borderRadius: "2px" }} />
                <span style={{ fontSize: "12px", color: theme === "dark" ? "#8b8b8b" : "#666" }}>Qabul qilingan</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 12, height: 12, background: "#ff4d4f", borderRadius: "2px" }} />
                <span style={{ fontSize: "12px", color: theme === "dark" ? "#8b8b8b" : "#666" }}>Rad etilgan</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"} />
                <XAxis dataKey="month" stroke={theme === "dark" ? "#8b8b8b" : "#666"} />
                <YAxis stroke={theme === "dark" ? "#8b8b8b" : "#666"} />
                <Tooltip 
                  contentStyle={{
                    background: theme === "dark" ? "#252836" : "#ffffff",
                    border: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Bar dataKey="arizalar" fill="#667eea" name="Jami arizalar" />
                <Bar dataKey="qabul" fill="#52c41a" name="Qabul qilingan" />
                <Bar dataKey="rad" fill="#ff4d4f" name="Rad etilgan" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Bottom Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card 
            style={cardStyle}
            title={
              <span style={{ fontSize: "16px", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                <BookOutlined /> Eng ko&apos;p ariza berilgan
              </span>
            }
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {topApplications.length > 0 ? (
                topApplications.map((app) => (
                  <div key={app.id} style={{ 
                    display: "flex", 
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px",
                    background: theme === "dark" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
                    borderRadius: "8px"
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4, fontSize: "14px" }}>
                        {app.title || `Ariza #${app.id}`}
                      </div>
                      <div style={{ fontSize: "12px", color: theme === "dark" ? "#8b8b8b" : "#666" }}>
                        {app.total_submissions || 0} ta ariza
                      </div>
                    </div>
                    <Tag color={app.status === "PUBLISHED" ? "green" : "default"} style={{ marginLeft: 8 }}>
                      {app.status === "PUBLISHED" ? "Faol" : app.status}
                    </Tag>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center", padding: "20px", color: theme === "dark" ? "#8b8b8b" : "#666" }}>
                  Ma&apos;lumotlar mavjud emas
                </div>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            style={cardStyle}
            title={
              <span style={{ fontSize: "16px", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                <ClockCircleOutlined /> To&apos;lovlar holati
              </span>
            }
          >
            <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ 
                position: "absolute", 
                top: "50%", 
                left: "50%", 
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                pointerEvents: "none"
              }}>
                <div style={{ fontSize: "20px", fontWeight: 700, color: theme === "dark" ? "#ffffff" : "#1a1a1a" }}>
                  {paymentRate}%
                </div>
                <div style={{ fontSize: "12px", color: theme === "dark" ? "#8b8b8b" : "#666" }}>To&apos;langan</div>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap", justifyContent: "center" }}>
                {paymentData.map((item, index) => (
                  <div key={index} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ 
                      width: 10, 
                      height: 10, 
                      borderRadius: "50%", 
                      background: item.color 
                    }} />
                    <span style={{ fontSize: "12px", color: theme === "dark" ? "#8b8b8b" : "#666" }}>
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            style={cardStyle}
            title={
              <span style={{ fontSize: "16px", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                <FileTextOutlined /> Oxirgi arizalar
              </span>
            }
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recentSubmissions.length > 0 ? (
                recentSubmissions.map((submission, index) => (
                  <div key={index} style={{ 
                    padding: "12px",
                    background: theme === "dark" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
                    borderRadius: "8px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4, fontSize: "13px" }}>
                          {submission.application_title || "Ariza"}
                        </div>
                        <div style={{ fontSize: "11px", color: theme === "dark" ? "#8b8b8b" : "#666" }}>
                          {submission.created_at ? formatDate(submission.created_at) : "-"}
                        </div>
                      </div>
                      <Tag 
                        color={
                          submission.status === "APPROVED" ? "green" :
                          submission.status === "REJECTED" ? "red" :
                          submission.status === "UNDER_REVIEW" ? "orange" : "default"
                        }
                        style={{ fontSize: "11px" }}
                      >
                        {submission.status === "APPROVED" ? "Qabul" :
                         submission.status === "REJECTED" ? "Rad" :
                         submission.status === "UNDER_REVIEW" ? "Tekshirilmoqda" :
                         submission.status === "SUBMITTED" ? "Topshirilgan" : submission.status}
                      </Tag>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center", padding: "20px", color: theme === "dark" ? "#8b8b8b" : "#666" }}>
                  Hozircha arizalar mavjud emas
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
