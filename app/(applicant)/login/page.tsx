"use client";

import { Form, Input, Button, Card, App } from "antd";
import { PhoneOutlined, LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { usePost } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { tokenStorage } from "@/lib/utils";
import Link from "next/link";

interface LoginData {
  phone_number: string;
  password: string;
}

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

interface LoginResponse {
  data: {
    user: User;
    tokens: {
      refresh: string;
      access: string;
    };
  };
  message: string;
  status: number;
}

function getRedirectPath(role: string): string {
  const roleUpper = role.toUpperCase();
  
  if (roleUpper === "ADMIN" || roleUpper === "SUPER_ADMIN" || roleUpper === "SUPERADMIN") {
    return "/admin-panel";
  }
  
  return "/dashboard";
}

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  
  const { mutate: login, isPending } = usePost<LoginResponse, LoginData>("/auth/login/", {
    onSuccess: (response) => {
      // Save tokens
      tokenStorage.setTokens(response.data.tokens.access, response.data.tokens.refresh);
      
      // Save user data to localStorage if needed
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/auth/me/"] });
      
      // Get redirect path based on user role
      const redirectPath = getRedirectPath(response.data.user.role);
      
      message.success(response.message || "Muvaffaqiyatli kirildi!");
      router.push(redirectPath);
    },
    onError: (error) => {
      // Handle array error format from backend
      let errorMessage = error.message || "Login xatosi";
      
      // Agar backenddan array formatida error kelgan bo'lsa
      const errorData = (error as { data?: unknown }).data;
      if (Array.isArray(errorData)) {
        errorMessage = errorData.join(", ");
      }
      
      message.error(errorMessage);
    },
  });

  const onFinish = (values: LoginData) => {
    login(values);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 fade-in"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated Background Elements */}
      <div
        style={{
          position: "absolute",
          top: "-50%",
          right: "-50%",
          width: "100%",
          height: "100%",
          background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
          animation: "pulse 4s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-50%",
          left: "-50%",
          width: "100%",
          height: "100%",
          background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
          animation: "pulse 4s ease-in-out infinite 2s",
        }}
      />

      <Card 
        className="w-full max-w-md shadow-2xl fade-in"
        style={{
          background: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "20px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="text-center mb-8">
          <div
            style={{
              width: 64,
              height: 64,
              margin: "0 auto 16px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
            }}
          >
            🎓
          </div>
          <h1 
            className="text-3xl font-bold mb-2"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            PhD Imtihonlar Tizimi
          </h1>
          <p className="text-gray-600" style={{ fontSize: "15px" }}>Hisobingizga kiring</p>
        </div>

        <Form name="login" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item
            name="phone_number"
            label={<span style={{ fontWeight: 600 }}>Telefon raqam</span>}
            rules={[
              { required: true, message: "Telefon raqamni kiriting!" },
              { pattern: /^\+998\d{9}$/, message: "Telefon raqam formati: +998901234567" },
            ]}
          >
            <Input 
              prefix={<PhoneOutlined style={{ color: "#667eea" }} />} 
              placeholder="+998901234567"
              style={{ borderRadius: "8px" }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span style={{ fontWeight: 600 }}>Parol</span>}
            rules={[{ required: true, message: "Parolni kiriting!" }]}
          >
            <Input.Password 
              prefix={<LockOutlined style={{ color: "#667eea" }} />} 
              placeholder="Parolingizni kiriting"
              style={{ borderRadius: "8px" }}
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isPending} 
              block 
              className="h-12"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "16px",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
              }}
            >
              Kirish
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-6">
          <p className="text-gray-600" style={{ fontSize: "14px" }}>
            Hisobingiz yo&apos;qmi?{" "}
            <Link 
              href="/register" 
              style={{
                color: "#667eea",
                fontWeight: 600,
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#764ba2";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#667eea";
              }}
            >
              Ro&apos;yxatdan o&apos;tish
            </Link>
          </p>
          <p className="text-gray-600" style={{ fontSize: "14px", marginTop: "12px" }}>
            <Link 
              href="/forgot-password" 
              style={{
                color: "#667eea",
                fontWeight: 600,
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#764ba2";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#667eea";
              }}
            >
              Parolni unutdingizmi?
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
