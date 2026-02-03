"use client";

import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Steps,
  App,
  ConfigProvider,
  Switch,
} from "antd";
import { useThemeStore } from "@/lib/stores/themeStore";
import {
  PhoneOutlined,
  LockOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  SunOutlined,
  MoonOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { usePost } from "@/lib/hooks";
import Link from "next/link";
import Image from "next/image";

// interface RequestResetData {
//   phone_number: string;
// }

// interface VerifyOTPData {
//   phone_number: string;
//   otp_code: string;
// }

// interface ResetPasswordData {
//   phone_number: string;
//   otp_code: string;
//   new_password: string;
//   confirm_password: string;
// }

export default function ForgotPasswordPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";

  const router = useRouter();
  const { message } = App.useApp();

  const { mutate: requestReset, isPending: isRequesting } = usePost(
    "/auth/password/reset/",
    {
      onSuccess: () => {
        setCurrentStep(1);
        message.success("OTP kod yuborildi");
      },
    }
  );

  const { mutate: verifyOTP, isPending: isVerifying } = usePost(
    "/auth/password/reset/verify/",
    {
      onSuccess: () => {
        setCurrentStep(2);
        message.success("OTP tasdiqlandi");
      },
    }
  );

  const { mutate: resetPassword, isPending: isResetting } = usePost(
    "/auth/password/reset/confirm/",
    {
      onSuccess: () => {
        message.success("Parol muvaffaqiyatli o‘zgartirildi");
        router.push("/login");
      },
    }
  );

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#5B5BEA",
          borderRadius: 14,
          controlHeight: 48,
          colorText: isDark ? "#E5E7EB" : "#111827",
          colorTextSecondary: isDark ? "#9CA3AF" : "#6B7280",
          colorBorder: isDark ? "#2A2A2E" : "#E5E7EB",
        },
        components: {
          Card: {
            colorBgContainer: isDark ? "#16161A" : "#FFFFFF",
          },
          Input: {
            colorBgContainer: isDark ? "#1F1F23" : "#F9FAFB",
          },
        },
      }}
    >
      <div
        className="min-h-screen flex items-center justify-center px-4 relative"
        style={{ background: isDark ? "#0B0B0E" : "#F5F6FA" }}
      >
        {/* THEME TOGGLE */}
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <SunOutlined style={{ color: isDark ? "#6B7280" : "#5B5BEA" }} />
          <Switch checked={isDark} onChange={toggleTheme} />
          <MoonOutlined style={{ color: isDark ? "#5B5BEA" : "#6B7280" }} />
        </div>

        <Card
          className="w-full max-w-md"
          style={{
            borderRadius: 24,
            border: isDark ? "1px solid #1F1F23" : "1px solid #E5E7EB",
            boxShadow: isDark
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

          {/* HEADER */}
          <h1 className="text-center text-xl font-bold mb-1">
            Parolni tiklash
          </h1>
          <p
            className="text-center mb-6"
            style={{ color: isDark ? "#9CA3AF" : "#6B7280" }}
          >
            Parol Tiklash
          </p>

          <Steps
            current={currentStep}
            className="mb-8"
            items={[
              { title: "Telefon", icon: <PhoneOutlined /> },
              { title: "OTP", icon: <CheckCircleOutlined /> },
              { title: "Yangi parol", icon: <LockOutlined /> },
            ]}
          />

          {/* STEP 1 */}
          {currentStep === 0 && (
            <Form
              layout="vertical"
              onFinish={(v) => {
                setPhoneNumber(v.phone_number);
                requestReset(v);
              }}
            >
              <Form.Item
                name="phone_number"
                rules={[
                  { required: true },
                  { pattern: /^\+998\d{9}$/, message: "+998901234567" },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="+998901234567"
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={isRequesting}
                block
              >
                Davom etish
              </Button>
            </Form>
          )}

          {/* STEP 2 */}
          {currentStep === 1 && (
            <Form
              layout="vertical"
              onFinish={(v) => {
                setOtpCode(v.otp_code);
                verifyOTP({
                  phone_number: phoneNumber,
                  otp_code: v.otp_code,
                });
              }}
            >
              <Form.Item name="otp_code" rules={[{ len: 6 }]}>
                <Input
                  placeholder="123456"
                  maxLength={6}
                  style={{ textAlign: "center", letterSpacing: 4 }}
                  prefix={<SafetyOutlined />}
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={isVerifying}
                block
              >
                Tasdiqlash
              </Button>

              <div className="text-center mt-4">
                <Button type="link" onClick={() => setCurrentStep(0)}>
                  ← Orqaga
                </Button>
              </div>
            </Form>
          )}

          {/* STEP 3 */}
          {currentStep === 2 && (
            <Form
              layout="vertical"
              onFinish={(v) =>
                resetPassword({
                  phone_number: phoneNumber,
                  otp_code: otpCode,
                  new_password: v.new_password,
                  confirm_password: v.confirm_password,
                })
              }
            >
              <Form.Item
                name="new_password"
                rules={[{ required: true }, { min: 8 }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Yangi parol"
                />
              </Form.Item>

              <Form.Item
                name="confirm_password"
                rules={[{ required: true }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Parolni tasdiqlang"
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={isResetting}
                block
              >
                Parolni o‘zgartirish
              </Button>

              <div className="text-center mt-4">
                <Button type="link" onClick={() => setCurrentStep(1)}>
                  ← Orqaga
                </Button>
              </div>
            </Form>
          )}

          <div className="text-center mt-6 text-sm">
            <Link href="/login" style={{ color: "#5B5BEA" }}>
              Kirish sahifasiga qaytish
            </Link>
          </div>
        </Card>
      </div>
    </ConfigProvider>
  );
}
