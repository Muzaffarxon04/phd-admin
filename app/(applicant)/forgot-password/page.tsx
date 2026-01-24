"use client";

import { useState } from "react";
import { Form, Input, Button, Card, Steps, App } from "antd";
import { PhoneOutlined, LockOutlined, SafetyOutlined, ArrowLeftOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { usePost } from "@/lib/hooks";
// import { useAuthStore } from "@/lib/stores/authStore";
import Link from "next/link";

// const { Step } = Steps;

interface RequestResetData {
  phone_number: string;
}

interface VerifyOTPResponse {
  data: {
    verified: boolean;
  };
  message?: string;
  status: number;
}

interface VerifyOTPData {
  phone_number: string;
  otp_code: string;
}

interface ResetPasswordData {
  phone_number: string;
  otp_code: string;
  new_password: string;
  confirm_password: string;
}

interface ResetPasswordResponse {
  message: string;
  status: number;
}

export default function ForgotPasswordPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isOTPVerified, setIsOTPVerified] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const router = useRouter();
  const { message } = App.useApp();

  // Step 1: Request password reset
  const { mutate: requestReset, isPending: isRequesting } = usePost<unknown, RequestResetData>("/auth/password/reset/", {
    onSuccess: () => {
      setCurrentStep(1);
      message.success("OTP kod telefon raqamingizga yuborildi!");
    },
    onError: (error) => {
      let errorMessage = error.message || "Xatolik yuz berdi";
      
      if (Array.isArray((error ).data)) {
        errorMessage = (error).data.join(", ");
      }
      
      message.error(errorMessage);
    },
  });

  // Step 2: Verify OTP
  const { mutate: verifyOTP, isPending: isVerifying } = usePost<VerifyOTPResponse, VerifyOTPData>("/auth/password/reset/verify/", {
    onSuccess: (response) => {
      if (response?.data?.verified) {
        setIsOTPVerified(true);
        setCurrentStep(2);
        message.success(response?.message || "OTP tasdiqlandi!");
      } else {
        message.error("OTP kod noto'g'ri!");
      }
    },
    onError: (error) => {
      let errorMessage = error.message || "Xatolik yuz berdi";
      
      if (Array.isArray((error ).data)) {
        errorMessage = (error ).data.join(", ");
      }
      
      message.error(errorMessage);
    },
  });

  // Step 3: Reset password
  const { mutate: resetPassword, isPending: isResetting } = usePost<ResetPasswordResponse, ResetPasswordData>("/auth/password/reset/confirm/", {
    onSuccess: (response) => {
      message.success(response.message || "Parol muvaffaqiyatli o'zgartirildi!");
      router.push("/login");
    },
    onError: (error) => {
      let errorMessage = error.message || "Xatolik yuz berdi";
      
      if (Array.isArray((error ).data)) {
        errorMessage = (error ).data.join(", ");
      }
      
      message.error(errorMessage);
    },
  });

  const onRequestSubmit = (values: RequestResetData) => {
    setPhoneNumber(values.phone_number);
    requestReset(values);
  };

  const onOTPSubmit = (values: { otp_code: string }) => {
    setOtpCode(values.otp_code);
    verifyOTP({
      phone_number: phoneNumber,
      otp_code: values.otp_code,
    });
  };

  const onResetSubmit = (values: ResetPasswordData) => {
    if (values.new_password !== values.confirm_password) {
      message.error("Parollar mos kelmadi!");
      return;
    }
    
    resetPassword({
      phone_number: phoneNumber,
      otp_code: otpCode,
      new_password: values.new_password,
      confirm_password: values.confirm_password,
    });
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
          background: "rgba(255,255,255,0.98)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "20px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="text-center mb-8">
          <Link 
            href="/login" 
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "#667eea",
              fontWeight: 600,
              marginBottom: "24px",
              textDecoration: "none",
            }}
          >
            <ArrowLeftOutlined />
            Orqaga
          </Link>
          
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
            🔐
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
            Parolni Tiklash
          </h1>
          <p className="text-gray-600" style={{ fontSize: "15px" }}>
            Parolni unutdingizmi? Tiklashish uchun quyidagi amallarni bajaring
          </p>
        </div>

        <Steps 
          current={currentStep} 
          className="mb-8"
          style={{ marginBottom: "32px" }}
          items={[
            { title: "Telefon", icon: <PhoneOutlined /> },
            { title: "Tasdiqlash", icon: <CheckCircleOutlined /> },
            { title: "Yangi parol", icon: <LockOutlined /> },
          ]}
        />

        {currentStep === 0 && (
          <Form name="request_reset" onFinish={onRequestSubmit} layout="vertical" size="large">
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

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={isRequesting} 
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
                Davom etish
              </Button>
            </Form.Item>

            <div className="text-center mt-6">
              <p className="text-gray-600" style={{ fontSize: "14px" }}>
                Hisobingiz bormi?{" "}
                <Link 
                  href="/login" 
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
                  Kirish
                </Link>
              </p>
            </div>
          </Form>
        )}

        {currentStep === 1 && (
          <Form name="verify_otp" onFinish={onOTPSubmit} layout="vertical" size="large">
            <div 
              className="mb-6 p-4 rounded-lg"
              style={{
                background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                border: "1px solid rgba(102, 126, 234, 0.2)",
              }}
            >
              <p className="text-sm" style={{ color: "#667eea", fontWeight: 500 }}>
                OTP kod <strong style={{ color: "#764ba2" }}>{phoneNumber}</strong> raqamiga yuborildi.
              </p>
            </div>

            <Form.Item
              name="otp_code"
              label={<span style={{ fontWeight: 600 }}>OTP kod</span>}
              rules={[
                { required: true, message: "OTP kodni kiriting!" },
                { len: 6, message: "OTP kod 6 raqamdan iborat bo'lishi kerak!" },
              ]}
            >
              <Input 
                prefix={<SafetyOutlined style={{ color: "#667eea" }} />} 
                placeholder="123456" 
                maxLength={6}
                style={{ borderRadius: "8px", fontSize: "18px", letterSpacing: "4px", textAlign: "center" }}
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={isVerifying} 
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
                Tasdiqlash
              </Button>
            </Form.Item>

            <div className="text-center mt-4">
              <Button 
                type="link" 
                onClick={() => setCurrentStep(0)}
                style={{ color: "#667eea", fontWeight: 500 }}
              >
                ← Orqaga
              </Button>
            </div>
          </Form>
        )}

        {currentStep === 2 && (
          <Form name="reset_password" onFinish={onResetSubmit} layout="vertical" size="large">
            {isOTPVerified && (
              <div 
                className="mb-6 p-4 rounded-lg"
                style={{
                  background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)",
                  border: "1px solid rgba(34, 197, 94, 0.2)",
                }}
              >
                <p className="text-sm" style={{ color: "#22c55e", fontWeight: 500, display: "flex", alignItems: "center", gap: "8px" }}>
                  <CheckCircleOutlined style={{ fontSize: "18px" }} />
                  OTP kod tasdiqlandi! Endi yangi parol kiriting.
                </p>
              </div>
            )}

            <Form.Item name="otp_code" initialValue={phoneNumber} hidden>
              <Input />
            </Form.Item>

            <Form.Item
              name="new_password"
              label={<span style={{ fontWeight: 600 }}>Yangi parol</span>}
              rules={[
                { required: true, message: "Yangi parolni kiriting!" },
                { min: 8, message: "Parol kamida 8 belgidan iborat bo'lishi kerak!" },
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: "#667eea" }} />} 
                placeholder="Yangi parol"
                style={{ borderRadius: "8px" }}
              />
            </Form.Item>

            <Form.Item
              name="confirm_password"
              label={<span style={{ fontWeight: 600 }}>Parolni tasdiqlang</span>}
              dependencies={["new_password"]}
              rules={[
                { required: true, message: "Parolni tasdiqlang!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("new_password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Parollar mos kelmadi!"));
                  },
                }),
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: "#667eea" }} />} 
                placeholder="Parolni qayta kiriting"
                style={{ borderRadius: "8px" }}
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={isResetting} 
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
                Parolni o&apos;zgartirish
              </Button>
            </Form.Item>

            <div className="text-center mt-4">
              <Button 
                type="link" 
                onClick={() => {
                  setCurrentStep(1);
                  setIsOTPVerified(false);
                }}
                style={{ color: "#667eea", fontWeight: 500 }}
              >
                ← Orqaga
              </Button>
            </div>
          </Form>
        )}
      </Card>
    </div>
  );
}
