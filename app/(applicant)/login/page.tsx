"use client";

import { Form, Input, Button, Card, App, ConfigProvider, Switch } from "antd";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { usePost } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { tokenStorage } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import { User } from "@/lib/api/auth";
import Image from "next/image";



interface LoginResponse {
  data: {
    tokens: {
      access: string;
      refresh: string;
    };
    user: User;
  };
}
export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const [dark, setDark] = useState(true); // default dark (rasmdagidek)

  const { mutate: login, isPending } = usePost("/auth/login/", {
    onSuccess: (response: LoginResponse) => {
      tokenStorage.setTokens(
        response.data.tokens.access,
        response.data.tokens.refresh
      );
      localStorage.setItem("user", JSON.stringify(response.data.user));
      queryClient.invalidateQueries({ queryKey: ["/auth/me/"] });
      message.success("Muvaffaqiyatli kirildi!");
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      message.error(error.message || "Login xatosi");
    },
  });

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#5B5BEA",
          borderRadius: 14,
          controlHeight: 48,
          colorText: dark ? "#E5E7EB" : "#111827",
          colorTextSecondary: dark ? "#9CA3AF" : "#6B7280",
          colorBorder: dark ? "#2A2A2E" : "#E5E7EB",
        },
        components: {
          Card: {
            colorBgContainer: dark ? "#16161A" : "#FFFFFF",
          },
          Input: {
            colorBgContainer: dark ? "#1F1F23" : "#F9FAFB",
            colorBorder: dark ? "#2A2A2E" : "#E5E7EB",
            activeBorderColor: "#5B5BEA",
            hoverBorderColor: "#5B5BEA",
          },
        },
      }}
    >
      {/* BACKGROUND */}
      <div
        className="min-h-screen flex items-center justify-center px-4 relative transition-all"
        style={{
          background: dark ? "#0B0B0E" : "#F5F6FA",
        }}
      >
        {/* TOGGLE */}
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <SunOutlined style={{ color: dark ? "#6B7280" : "#5B5BEA" }} />
          <Switch checked={dark} onChange={setDark} />
          <MoonOutlined style={{ color: dark ? "#5B5BEA" : "#6B7280" }} />
        </div>

        {/* CARD */}
        <Card
          className="w-full max-w-md transition-all"
          style={{
            borderRadius: 24,
            border: dark ? "1px solid #1F1F23" : "1px solid #E5E7EB",
            boxShadow: dark
              ? "0 30px 80px rgba(0,0,0,0.7)"
              : "0 20px 60px rgba(0,0,0,0.18)",
          }}
        >
          {/* LOGO */}
          <div className="flex justify-center mb-4">
       <Image src="/logo.png" alt="logo" width={64} height={64} />
          </div>

          {/* TITLES */}
          <h2
            style={{
              textAlign: "center",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.08em",
              color: "#5B5BEA",
              marginBottom: 4,
            }}
          >
            ILM.TASHMEDUNI.UZ
          </h2>

          <h1
            style={{
              textAlign: "center",
              fontSize: 22,
              fontWeight: 700,
              marginBottom: 2,
            }}
          >
            Tizimga kirish
          </h1>

          <p
            style={{
              textAlign: "center",
              fontSize: 14,
              marginBottom: 28,
              color: dark ? "#9CA3AF" : "#6B7280",
            }}
          >
            PhD Qabul Tizimi
          </p>

          {/* FORM */}
          <Form layout="vertical" onFinish={login}>
            <Form.Item
              name="phone_number"
              rules={[
                { required: true, message: "Telefon raqamni kiriting" },
              ]}
            >
              <Input
              //  addonBefore="+998" 
               placeholder="Telefon raqamni kiriting" />
            </Form.Item>

            <Form.Item
            style={{ marginBottom: 4}}
              name="password"
              rules={[{ required: true, message: "Parolni kiriting" }]}
            >
              <Input.Password placeholder="Parol" />
            </Form.Item>

            <div style={{ textAlign: "right", marginBottom: 18 }}>
              <Link
                href="/forgot-password"
                style={{
                  fontSize: 13,
                  color: "#5B5BEA",
                  fontWeight: 500,
                }}
              >
                Parolni unutdingizmi?
              </Link>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              loading={isPending}
              block
              style={{
                height: 48,
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              Kirish
            </Button>
          </Form>

          <div
            style={{
              textAlign: "center",
              marginTop: 24,
              fontSize: 14,
              color: dark ? "#9CA3AF" : "#6B7280",
            }}
            className="w-full text-indigo-500 dark:text-indigo-400 text-sm py-2 hover:underline"
          >
            Hisobingiz yo‘qmi?{" "}
            <Link href="/register" className="w-full text-indigo-500 dark:text-indigo-400 text-sm py-2 hover:underline">
              Ro‘yxatdan o‘ting
            </Link>
          </div>
        </Card>
      </div>
    </ConfigProvider>
  );
}
