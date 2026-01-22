"use client";

import { Breadcrumb, Card, Spin, Avatar, Tag, Progress } from "antd";
import { HomeOutlined, UserOutlined, MailOutlined, PhoneOutlined, SafetyOutlined, TeamOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useGet } from "@/lib/hooks";
import { tokenStorage } from "@/lib/utils";
import { useThemeStore } from "@/lib/stores/themeStore";

interface User {
  id: number;
  phone_number: string;
  email?: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  full_name: string;
  role: string;
  is_verified: boolean;
  photo?: string | null;
  profile_completion: number;
  date_joined: string;
  last_login: string;
}

export default function DashboardPage() {
  const user = tokenStorage.getUser() as User | null;
  const { data: userData, isLoading } = useGet<User>("/auth/me/");
  const { theme } = useThemeStore();

  const currentUser = userData || user;

  if (isLoading && !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const fullName = currentUser?.full_name || 
    `${currentUser?.last_name || ""} ${currentUser?.first_name || ""} ${currentUser?.middle_name || ""}`.trim() || 
    "Foydalanuvchi";

  return (
    <div className="dashboard-container">
      <Breadcrumb
        items={[
          {
            href: "/",
            title: (
              <span style={{ color: theme === "dark" ? "#ffffff" : "#333" }}>
                <HomeOutlined /> Dashboard
              </span>
            ),
          },
          {
            title: <span style={{ color: theme === "dark" ? "#ffffff" : "#333" }}>Bosh sahifa</span>,
          },
        ]}
        style={{ marginBottom: 24, color: theme === "dark" ? "#ffffff" : "#333" }}
      />

      {/* Profile Header Card */}
      <Card
        className="profile-header-card"
        style={{
          background: theme === "dark" 
            ? "linear-gradient(135deg, #1a1d29 0%, #252836 100%)" 
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          border: "none",
          marginBottom: 24,
          borderRadius: 16,
          overflow: "hidden",
        }}
        bodyStyle={{ padding: 32 }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }} className="md:flex-row md:items-start">
          <Avatar
            size={120}
            src={currentUser?.photo}
            icon={<UserOutlined />}
            className="border-4 border-white shadow-lg"
            style={{ 
              backgroundColor: theme === "dark" ? "#667eea" : "#ffffff",
              color: theme === "dark" ? "#ffffff" : "#667eea"
            }}
          />
          <div style={{ flex: 1, textAlign: "center" }} className="md:text-left">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 8 }} className="md:justify-start">
              <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                {fullName}
      </h1>
              {currentUser?.is_verified && (
                <Tag 
                  icon={<CheckCircleOutlined />} 
                  color="success"
                  style={{ fontSize: 14, padding: "4px 12px" }}
                >
                  Tasdiqlangan
                </Tag>
              )}
            </div>
            <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "18px", marginBottom: 16 }}>
              {currentUser?.role === "APPLICANT" ? "Ariza beruvchi" : currentUser?.role || "Foydalanuvchi"}
            </p>
            
            {/* Profile Completion */}
            {currentUser?.profile_completion !== undefined && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px" }}>Profil to&apos;liqligi</span>
                  <span style={{ color: "#ffffff", fontWeight: 600 }}>{currentUser.profile_completion}%</span>
                </div>
                <Progress
                  percent={currentUser.profile_completion}
                  strokeColor={{
                    '0%': '#87d068',
                    '100%': '#52c41a',
                  }}
                  showInfo={false}
                  style={{ marginBottom: 0 }}
                />
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Information Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }} className="md:grid-cols-2">
        {/* Personal Information Card */}
      <Card
          className="info-card"
        style={{
          background: theme === "dark" ? "#1a1d29" : "#ffffff",
          border: theme === "dark" ? "1px solid #252836" : "1px solid #e8e8e8",
            borderRadius: 16,
            boxShadow: theme === "dark" ? "0 4px 12px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.1)",
          }}
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <UserOutlined style={{ color: "#1890ff" }} />
              <span style={{ color: theme === "dark" ? "#ffffff" : "#333", fontWeight: 600 }}>
                Shaxsiy ma&apos;lumotlar
              </span>
            </div>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="info-item">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                <UserOutlined style={{ color: "#8c8c8c" }} />
                <span style={{ fontSize: "14px", color: "#8c8c8c" }}>F.I.SH.</span>
              </div>
              <p style={{ fontSize: "16px", fontWeight: 500, margin: 0, color: theme === "dark" ? "#ffffff" : "#333" }}>
                {fullName}
              </p>
            </div>

            {currentUser?.email && (
              <div className="info-item">
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                  <MailOutlined style={{ color: "#8c8c8c" }} />
                  <span style={{ fontSize: "14px", color: "#8c8c8c" }}>Elektron pochta</span>
                </div>
                <p style={{ fontSize: "16px", fontWeight: 500, margin: 0, color: theme === "dark" ? "#ffffff" : "#333" }}>
                  {currentUser.email}
                </p>
              </div>
            )}

            {currentUser?.phone_number && (
              <div className="info-item">
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                  <PhoneOutlined style={{ color: "#8c8c8c" }} />
                  <span style={{ fontSize: "14px", color: "#8c8c8c" }}>Telefon raqami</span>
                </div>
                <p style={{ fontSize: "16px", fontWeight: 500, margin: 0, color: theme === "dark" ? "#ffffff" : "#333" }}>
                  {currentUser.phone_number}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Account Information Card */}
        <Card
          className="info-card"
          style={{
            background: theme === "dark" ? "#1a1d29" : "#ffffff",
            border: theme === "dark" ? "1px solid #252836" : "1px solid #e8e8e8",
            borderRadius: 16,
            boxShadow: theme === "dark" ? "0 4px 12px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.1)",
          }}
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <SafetyOutlined style={{ color: "#52c41a" }} />
              <span style={{ color: theme === "dark" ? "#ffffff" : "#333", fontWeight: 600 }}>
                Hisob ma&apos;lumotlari
              </span>
            </div>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="info-item">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                <TeamOutlined style={{ color: "#8c8c8c" }} />
                <span style={{ fontSize: "14px", color: "#8c8c8c" }}>Rol</span>
              </div>
              <Tag 
                color={currentUser?.role === "APPLICANT" ? "blue" : "default"}
                style={{ fontSize: 14, padding: "4px 12px" }}
              >
                {currentUser?.role === "APPLICANT" ? "Ariza beruvchi" : currentUser?.role || "-"}
              </Tag>
            </div>

            <div className="info-item">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                <CheckCircleOutlined style={{ color: "#8c8c8c" }} />
                <span style={{ fontSize: "14px", color: "#8c8c8c" }}>Holati</span>
              </div>
              <Tag 
                color={currentUser?.is_verified ? "success" : "warning"}
                icon={currentUser?.is_verified ? <CheckCircleOutlined /> : null}
                style={{ fontSize: 14, padding: "4px 12px" }}
              >
                {currentUser?.is_verified ? "Tasdiqlangan" : "Tasdiqlanmagan"}
              </Tag>
            </div>

            {currentUser?.date_joined && (
              <div className="info-item">
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                  <span style={{ color: "#8c8c8c", fontSize: "16px" }}>📅</span>
                  <span style={{ fontSize: "14px", color: "#8c8c8c" }}>Qo&apos;shilgan sana</span>
                </div>
                <p style={{ fontSize: "16px", fontWeight: 500, margin: 0, color: theme === "dark" ? "#ffffff" : "#333" }}>
                  {new Date(currentUser.date_joined).toLocaleDateString("uz-UZ", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <style jsx>{`
        .dashboard-container {
          animation: fadeIn 0.5s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .profile-header-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .profile-header-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
        }

        .info-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .info-card:hover {
          transform: translateY(-4px);
          box-shadow: ${theme === "dark" 
            ? "0 8px 24px rgba(0,0,0,0.4)" 
            : "0 4px 16px rgba(0,0,0,0.15)"};
        }

        .info-item {
          padding: 12px 0;
        }

        .info-item:last-child {
          border-bottom: none;
          }
        `}</style>
    </div>
  );
}
