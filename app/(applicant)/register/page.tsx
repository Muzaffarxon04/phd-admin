"use client";

import { useState } from "react";
import { Form, Input, Button, Card, Steps, App } from "antd";
import { PhoneOutlined, LockOutlined, UserOutlined, MailOutlined, SafetyOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { usePost } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { tokenStorage } from "@/lib/utils";
import Link from "next/link";

const { Step } = Steps;

interface RegisterData {
  phone_number: string;
}

interface VerifyOTPData {
  phone_number: string;
  otp_code: string;
  purpose?: "REGISTRATION" | "LOGIN" | "PASSWORD_RESET" | "PHONE_VERIFICATION";
}

interface CompleteRegistrationData {
  phone_number: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  email?: string;
  password: string;
  confirm_password: string;
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

interface RegisterResponse {
  user: User;
  tokens: {
    refresh: string;
    access: string;
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

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  // Step 1: Register
  const { mutate: register, isPending: isRegistering } = usePost<unknown, RegisterData>("/auth/register/", {
    onSuccess: () => {
      setCurrentStep(1);
      message.success("OTP kod telefon raqamingizga yuborildi!");
    },
    onError: (error) => {
      message.error(error.message || "Xatolik yuz berdi");
    },
  });

  // Step 2: Verify OTP
  const { mutate: verifyOTP, isPending: isVerifying } = usePost<unknown, VerifyOTPData>("/auth/register/verify/", {
    onSuccess: () => {
      setCurrentStep(2);
      message.success("OTP tasdiqlandi!");
    },
    onError: (error) => {
      message.error(error.message || "OTP xato yoki muddati o&apos;tgan");
    },
  });

  // Step 3: Complete registration
  const { mutate: completeRegistration, isPending: isCompleting } = usePost<RegisterResponse, CompleteRegistrationData>("/auth/register/complete/", {
    onSuccess: (response) => {
      // Save tokens
      tokenStorage.setTokens(response.tokens.access, response.tokens.refresh);
      
      // Save user data to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(response.user));
      }
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/auth/me/"] });
      
      // Get redirect path based on user role
      const redirectPath = getRedirectPath(response.user.role);
      
      message.success(response.message || "Muvaffaqiyatli ro&apos;yxatdan o&apos;tdingiz!");
      router.push(redirectPath);
    },
    onError: (error) => {
      message.error(error.message || "Ro&apos;yxatdan o&apos;tishda xatolik");
    },
  });

  const onPhoneSubmit = (values: RegisterData) => {
    setPhoneNumber(values.phone_number);
    register(values);
  };

  const onOTPSubmit = (values: { otp_code: string }) => {
    verifyOTP({
      phone_number: phoneNumber,
      otp_code: values.otp_code,
      purpose: "REGISTRATION",
    });
  };

  const onCompleteSubmit = (values: CompleteRegistrationData) => {
    if (values.password !== values.confirm_password) {
      message.error("Parollar mos kelmadi!");
      return;
    }
    completeRegistration(values);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">Ro&apos;yxatdan o&apos;tish</h1>
          <p className="text-gray-600">Yangi hisob yarating</p>
        </div>

        <Steps current={currentStep} className="mb-8">
          <Step title="Telefon" />
          <Step title="Tasdiqlash" />
          <Step title="Ma&apos;lumotlar" />
        </Steps>

        {currentStep === 0 && (
          <Form name="register_phone" onFinish={onPhoneSubmit} layout="vertical" size="large">
            <Form.Item
              name="phone_number"
              label="Telefon raqam"
              rules={[
                { required: true, message: "Telefon raqamni kiriting!" },
                { pattern: /^\+998\d{9}$/, message: "Telefon raqam formati: +998901234567" },
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="+998901234567" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={isRegistering} block className="h-12">
                Davom etish
              </Button>
            </Form.Item>

            <div className="text-center mt-4">
              <p className="text-gray-600">
                Allaqachon hisobingiz bormi?{" "}
                <Link href="/login" className="text-blue-600 hover:underline">
                  Kirish
                </Link>
              </p>
            </div>
          </Form>
        )}

        {currentStep === 1 && (
          <Form name="verify_otp" onFinish={onOTPSubmit} layout="vertical" size="large">
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">
                OTP kod <strong>{phoneNumber}</strong> raqamiga yuborildi.
              </p>
            </div>

            <Form.Item
              name="otp_code"
              label="OTP kod"
              rules={[
                { required: true, message: "OTP kodni kiriting!" },
                { len: 6, message: "OTP kod 6 raqamdan iborat bo&apos;lishi kerak!" },
              ]}
            >
              <Input prefix={<SafetyOutlined />} placeholder="123456" maxLength={6} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={isVerifying} block className="h-12">
                Tasdiqlash
              </Button>
            </Form.Item>

            <div className="text-center mt-4">
              <Button type="link" onClick={() => setCurrentStep(0)}>
                Orqaga
              </Button>
            </div>
          </Form>
        )}

        {currentStep === 2 && (
          <Form name="complete_registration" onFinish={onCompleteSubmit} layout="vertical" size="large">
            <Form.Item name="phone_number" initialValue={phoneNumber} hidden>
              <Input />
            </Form.Item>

            <Form.Item
              name="first_name"
              label="Ism"
              rules={[{ required: true, message: "Ismingizni kiriting!" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Ismingiz" />
            </Form.Item>

            <Form.Item
              name="last_name"
              label="Familiya"
              rules={[{ required: true, message: "Familiyangizni kiriting!" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Familiyangiz" />
            </Form.Item>

            <Form.Item name="middle_name" label="Otasining ismi">
              <Input prefix={<UserOutlined />} placeholder="Otasining ismi" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[{ type: "email", message: "Email formati noto&apos;g&apos;ri!" }]}
            >
              <Input prefix={<MailOutlined />} placeholder="email@example.com" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Parol"
              rules={[
                { required: true, message: "Parolni kiriting!" },
                { min: 8, message: "Parol kamida 8 belgidan iborat bo&apos;lishi kerak!" },
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Parol" />
            </Form.Item>

            <Form.Item
              name="confirm_password"
              label="Parolni tasdiqlang"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Parolni tasdiqlang!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Parollar mos kelmadi!"));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Parolni qayta kiriting" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={isCompleting} block className="h-12">
                Ro&apos;yxatdan o&apos;tish
              </Button>
            </Form.Item>

            <div className="text-center mt-4">
              <Button type="link" onClick={() => setCurrentStep(1)}>
                Orqaga
              </Button>
            </div>
          </Form>
        )}
      </Card>
    </div>
  );
}
