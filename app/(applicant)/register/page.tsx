"use client";

import { useState, useEffect, useRef } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Steps,
  App,
  ConfigProvider,
  Switch,
  Checkbox,
  Alert,
} from "antd";
import { useThemeStore } from "@/lib/stores/themeStore";
import {
  PhoneOutlined,
  LockOutlined,
  UserOutlined,
  MailOutlined,
  SafetyOutlined,
  MoonOutlined,
  SunOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { usePost } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { tokenStorage } from "@/lib/utils";
// import { useAuthStore } from "@/lib/stores/authStore";
import Link from "next/link";
import { User } from "@/lib/api/auth";
import Image from "next/image";

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpId, setOtpId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";

  const router = useRouter();
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  // Extract minutes from "5 min" format
  const extractMinutes = (timeString: string): number => {
    const match = timeString.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  // Start countdown timer
  const startTimer = (minutes: number) => {
    const totalSeconds = minutes * 60;
    setTimeLeft(totalSeconds);
    setIsTimerActive(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsTimerActive(false);
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Format time display (MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const { mutate: resendOTP, isPending: isResending } = usePost(
    "/auth/otp/resend/",
    {
      onSuccess: (response: { data?: { expires_in_minutes?: string; otp_id?: string }; otp_id?: string }) => {
        message.success("OTP kod yuborildi");
        const id = response.data?.otp_id ?? response.otp_id;
        if (id) setOtpId(id);
        if (response.data?.expires_in_minutes) {
          const minutes = extractMinutes(response.data.expires_in_minutes);
          startTimer(minutes);
        }
      },
      onError: (error) => {
        message.error(error.message || "OTP yuborishda xatolik yuz berdi");
      },
    }
  );

  const { mutate: register, isPending: isRegistering } = usePost(
    "/auth/register/",
    {
      onSuccess: (response: { data?: { expires_in_minutes?: string; otp_id?: string }; otp_id?: string }) => {
        setCurrentStep(1);
        message.success("OTP kod yuborildi");
        const id = response.data?.otp_id ?? response.otp_id;
        if (id) setOtpId(id);
        if (response.data?.expires_in_minutes) {
          const minutes = extractMinutes(response.data.expires_in_minutes);
          startTimer(minutes);
        }
      },
      onError: (error) => {
        message.error(error.message || "Ro‘yxatdan o‘tishda xatolik yuz berdi");
      },
    }
  );

  const { mutate: verifyOTP, isPending: isVerifying } = usePost(
    "/auth/register/verify/",
    {
      onSuccess: () => {
        setCurrentStep(2);
        message.success("OTP tasdiqlandi");
      },
      onError: (error) => {
        message.error(error.message || "OTP tasdiqlashda xatolik yuz berdi");
      },
    }
  );

  const { mutate: completeRegistration, isPending: isCompleting } = usePost(
    "/auth/register/complete/",
    {
      onSuccess: (res: { tokens: { access: string; refresh: string }; user: User }) => {
        tokenStorage.setTokens(res.tokens.access, res.tokens.refresh);
        localStorage.setItem("user", JSON.stringify(res.user));
        queryClient.invalidateQueries({ queryKey: ["/auth/me/"] });
        message.success("Ro‘yxatdan o‘tildi");
        router.push("/dashboard");
      },
      onError: (error) => {
        message.error(error.message || "Ro‘yxatdan o‘tishni yakunlashda xatolik yuz berdi");
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
            Ro‘yxatdan o‘tish
          </h1>
          <p
            className="text-center mb-6"
            style={{ color: isDark ? "#9CA3AF" : "#6B7280" }}
          >
            Yangi hisob yarating
          </p>

          <Steps
            current={currentStep}
            className="mb-8"
            items={[
              { title: "Telefon", icon: <PhoneOutlined /> },
              { title: "OTP", icon: <SafetyOutlined /> },
              { title: "Ma’lumotlar", icon: <UserOutlined /> },
            ]}
          />

          {/* STEP CONTENT */}
          {currentStep === 0 && (
            <Form
              layout="vertical"
              onFinish={(v) => {
                setPhoneNumber(v.phone_number);
                register(v);
              }}
            >
              
              <Form.Item
                name="phone_number"
                rules={[
                  { required: true, message: "Telefon raqamni kiriting" },
                ]}
              >
                <Input
                  // addonBefore="+998" 
                  placeholder="Telefon raqamni kiriting" />
              </Form.Item>

              <Form.Item className="mb-4" colon={false}>
                <Checkbox
                  checked={acceptedPrivacy}
                  onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                >
                  Shaxsiy ma&apos;lumotlarim qayta ishlatilishiga roziman
                </Checkbox>
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={isRegistering}
                block
                disabled={!acceptedPrivacy}
              >
                Davom etish
              </Button>
            </Form>
          )}

          {currentStep === 1 && (
            <Form
              layout="vertical"
              onFinish={(v) =>
                verifyOTP({
                  phone_number: phoneNumber,
                  otp_code: v.otp_code,
                  purpose: "REGISTRATION",
                  ...(otpId && { otp_id: otpId }),
                })
              }
            >
              <Form.Item name="otp_code" rules={[{ len: 6 }]}>
                <Input
                  placeholder="123456"
                  maxLength={6}
                  style={{ textAlign: "center", letterSpacing: 4 }}
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
                {isTimerActive ? (
                  <div className="text-sm" style={{ color: isDark ? "#9CA3AF" : "#6B7280" }}>
                    OTP qayta yuborish: <span className="font-mono font-semibold text-[#5B5BEA]">{formatTime(timeLeft)}</span>
                  </div>
                ) : (
                  <Button 
                    type="link" 
                    onClick={() => resendOTP({ phone_number: phoneNumber })} 
                    loading={isResending}
                  >
                    OTP qayta yuborish
                  </Button>
                )}
              </div>
            </Form>
          )}

          {currentStep === 2 && (
            <>
              <Alert
                type="warning"
                showIcon
                className="mb-4!"
                message="Diqqat!"
                description="Maʼlumotlarni toʻldirishda imloviy xatoga yoʻl qoʻymang va barcha maydonlarni passport bo‘yicha toʻldiring."
              />
              <Form
                layout="vertical"
                onFinish={completeRegistration}
              >
              <Form.Item name="phone_number" initialValue={phoneNumber} hidden>
                <Input />
              </Form.Item>

              <Form.Item
                name="first_name"
                rules={[{ required: true, message: "Ismni kiriting" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Ism" />
              </Form.Item>

              <Form.Item
                name="last_name"
                rules={[{ required: true, message: "Familiyani kiriting" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Familiya" />
              </Form.Item>
              <Form.Item
                name="middle_name"
                rules={[{ required: true, message: "Otasining ismini kiriting" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Otasining ismi" />
              </Form.Item>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Email manzilini kiriting" },
                  { type: "email", message: "To'g'ri email manzil kiriting" },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Email" />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Parolni kiriting" },
                  { min: 5, message: "Parol kamida 5 ta belgidan iborat bo'lishi kerak" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Parol"
                />
              </Form.Item>

                <Form.Item
                  name="confirm_password"
                  dependencies={["password"]}
                  rules={[
                    { required: true, message: "Parolni tasdiqlang" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("Parol va tasdiqlash paroli bir xil bo'lishi kerak")
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Parolni tasdiqlang"
                  />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isCompleting}
                  block
                >
                  Ro‘yxatdan o‘tish
                </Button>
              </Form>
            </>
          )}

          <div className="text-center mt-6 text-sm">
            Hisobingiz bormi?{" "}
            <Link href="/login" style={{ color: "#5B5BEA" }}>
              Kirish
            </Link>
          </div>
        </Card>
      </div>
    </ConfigProvider>
  );
}
