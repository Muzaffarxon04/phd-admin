"use client";

import { Suspense, useState } from "react";
import { Form, Input, Button, App, Checkbox, Alert } from "antd";
import { ArrowRightOutlined, PhoneOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { usePost } from "@/lib/hooks";
import { tokenStorage } from "@/lib/utils";
import { getErrorMessage } from "@/lib/applicant/errors";
import { formatMMSS, useCountdown } from "@/lib/hooks/useCountdown";
import { AuthLayout } from "@/components/applicant/auth/AuthLayout";
import { PhoneInput, phoneRules, formatNational, nationalDigits } from "@/components/applicant/auth/PhoneInput";
import { WizardProgress } from "@/components/applicant/tsmu-id/WizardProgress";
import type { User } from "@/types";

const loginFooter = (
  <>
    Akkauntingiz bormi?{" "}
    <Link href="/login" className="font-medium text-primary hover:underline">
      Kirish
    </Link>
  </>
);

/* ------------------------------------------------------------------ */
/* Method choice                                                       */
/* ------------------------------------------------------------------ */

function MethodChoice() {
  const option =
    "group relative flex w-full items-start gap-4 rounded-xl border bg-surface p-4 text-left transition-colors sm:p-5";
  return (
    <AuthLayout
      title="Ro'yxatdan o'tish"
      subtitle="Akkaunt yaratish usulini tanlang."
      footer={loginFooter}
    >
      <div className="flex flex-col gap-3">
        <Link href="/register/tsmu-id" className={`${option} border-primary/40 hover:border-primary`}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-lg text-primary">
            <SafetyCertificateOutlined />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-[15px] font-semibold text-text">TSMU ID orqali</span>
              <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-on-primary">
                Tavsiya etiladi
              </span>
            </span>
            <span className="mt-1 block text-[13px] leading-5 text-muted">
              JSHSHIR, yuz tekshiruvi va SMS. Shaxsiy ma&apos;lumotlaringiz davlat bazasidan avtomatik olinadi va
              ariza topshirishga darhol tayyor bo&apos;lasiz.
            </span>
          </span>
          <ArrowRightOutlined className="mt-3 shrink-0 text-xs text-muted transition-transform group-hover:translate-x-0.5" />
        </Link>

        <Link href="/register?method=phone" className={`${option} border-border hover:border-border-strong`}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-lg text-muted">
            <PhoneOutlined />
          </span>
          <span className="min-w-0 flex-1">
            <span className="text-[15px] font-semibold text-text">Telefon orqali</span>
            <span className="mt-1 block text-[13px] leading-5 text-muted">
              Telefon raqam va SMS kod. Ariza topshirishdan oldin shaxsingizni TSMU ID orqali tasdiqlashingiz kerak
              bo&apos;ladi.
            </span>
          </span>
          <ArrowRightOutlined className="mt-3 shrink-0 text-xs text-muted transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </AuthLayout>
  );
}

/* ------------------------------------------------------------------ */
/* Phone registration (existing 3-step flow, endpoints unchanged)      */
/* ------------------------------------------------------------------ */

function PhoneRegistration() {
  const [currentStep, setCurrentStep] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpId, setOtpId] = useState<string | null>(null);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const timer = useCountdown();

  const router = useRouter();
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  // Extract minutes from "5 min" format
  const extractMinutes = (timeString: string): number => {
    const match = timeString.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const handleOtpSent = (response: { data?: { expires_in_minutes?: string; otp_id?: string }; otp_id?: string }) => {
    const id = response.data?.otp_id ?? response.otp_id;
    if (id) setOtpId(id);
    if (response.data?.expires_in_minutes) {
      timer.start(extractMinutes(response.data.expires_in_minutes) * 60);
    }
  };

  const { mutate: resendOTP, isPending: isResending } = usePost("/auth/otp/resend/", {
    onSuccess: (response: { data?: { expires_in_minutes?: string; otp_id?: string }; otp_id?: string }) => {
      message.success("OTP kod yuborildi");
      handleOtpSent(response);
    },
    onError: (error) => {
      message.error(getErrorMessage(error, "OTP yuborishda xatolik yuz berdi"));
    },
  });

  const { mutate: register, isPending: isRegistering } = usePost("/auth/register/", {
    onSuccess: (response: { data?: { expires_in_minutes?: string; otp_id?: string }; otp_id?: string }) => {
      setCurrentStep(1);
      message.success("OTP kod yuborildi");
      handleOtpSent(response);
    },
    onError: (error) => {
      message.error(getErrorMessage(error, "Ro'yxatdan o'tishda xatolik yuz berdi"));
    },
  });

  const { mutate: verifyOTP, isPending: isVerifying } = usePost("/auth/register/verify/", {
    onSuccess: () => {
      setCurrentStep(2);
      message.success("OTP tasdiqlandi");
    },
    onError: (error) => {
      message.error(getErrorMessage(error, "OTP tasdiqlashda xatolik yuz berdi"));
    },
  });

  const { mutate: completeRegistration, isPending: isCompleting } = usePost("/auth/register/complete/", {
    onSuccess: (res: {
      tokens?: { access: string; refresh: string };
      user?: User;
      data?: { tokens: { access: string; refresh: string }; user: User };
    }) => {
      const tokens = res.tokens ?? res.data?.tokens;
      const user = res.user ?? res.data?.user;
      if (tokens) tokenStorage.setTokens(tokens.access, tokens.refresh);
      if (user) localStorage.setItem("user", JSON.stringify(user));
      queryClient.invalidateQueries({ queryKey: ["/auth/me/"] });
      message.success("Ro'yxatdan o'tildi");
      router.push("/dashboard");
    },
    onError: (error) => {
      message.error(getErrorMessage(error, "Ro'yxatdan o'tishni yakunlashda xatolik yuz berdi"));
    },
  });

  const subtitles = [
    "Telefon raqamingizga SMS kod yuboramiz.",
    `Kod +998 ${formatNational(nationalDigits(phoneNumber))} raqamiga yuborildi.`,
    "Ma'lumotlarni pasportdagidek kiriting va parol o'rnating.",
  ];

  return (
    <AuthLayout
      title="Telefon orqali ro'yxatdan o'tish"
      subtitle={subtitles[currentStep]}
      footer={loginFooter}
      top={
        <>
          <Link
            href="/register"
            className="mb-6 inline-flex text-[13px] font-medium text-muted transition-colors hover:text-text"
          >
            ← Boshqa usul
          </Link>
          <WizardProgress steps={["Telefon", "SMS kod", "Ma'lumotlar"]} current={currentStep} />
        </>
      }
    >
      {currentStep === 0 && (
        <Form
          layout="vertical"
          size="large"
          requiredMark={false}
          onFinish={(v) => {
            setPhoneNumber(v.phone_number);
            register(v);
          }}
        >
          <Form.Item name="phone_number" label="Telefon raqam" rules={phoneRules}>
            <PhoneInput autoFocus />
          </Form.Item>

          <Form.Item className="!mb-6">
            <Checkbox checked={acceptedPrivacy} onChange={(e) => setAcceptedPrivacy(e.target.checked)}>
              <span className="text-[13px] text-muted">Shaxsiy ma&apos;lumotlarim qayta ishlanishiga roziman</span>
            </Checkbox>
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={isRegistering} block disabled={!acceptedPrivacy}>
            Davom etish
          </Button>
        </Form>
      )}

      {currentStep === 1 && (
        <Form
          layout="vertical"
          size="large"
          requiredMark={false}
          onFinish={(v) =>
            verifyOTP({
              phone_number: phoneNumber,
              otp_code: v.otp_code,
              purpose: "REGISTRATION",
              ...(otpId && { otp_id: otpId }),
            })
          }
        >
          <Form.Item
            name="otp_code"
            label="SMS kod"
            rules={[{ required: true, len: 6, message: "6 xonali kodni kiriting" }]}
          >
            <Input.OTP length={6} autoFocus inputMode="numeric" className="otp-input" />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={isVerifying} block>
            Tasdiqlash
          </Button>

          <div className="mt-4 flex items-center justify-between text-[13px]">
            <button
              type="button"
              className="font-medium text-muted hover:text-text"
              onClick={() => setCurrentStep(0)}
            >
              Raqamni o&apos;zgartirish
            </button>
            {timer.active ? (
              <span className="tabular text-muted">Qayta yuborish: {formatMMSS(timer.secondsLeft)}</span>
            ) : (
              <Button
                type="link"
                size="small"
                className="!px-0"
                onClick={() => resendOTP({ phone_number: phoneNumber })}
                loading={isResending}
              >
                Kodni qayta yuborish
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
            className="!mb-6"
            message="Ma'lumotlarni pasport bo'yicha, imloviy xatolarsiz to'ldiring."
          />
          <Form layout="vertical" size="large" requiredMark={false} onFinish={completeRegistration}>
            <Form.Item name="phone_number" initialValue={phoneNumber} hidden>
              <Input />
            </Form.Item>

            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              <Form.Item name="last_name" label="Familiya" rules={[{ required: true, message: "Familiyani kiriting" }]}>
                <Input autoComplete="family-name" />
              </Form.Item>
              <Form.Item name="first_name" label="Ism" rules={[{ required: true, message: "Ismni kiriting" }]}>
                <Input autoComplete="given-name" />
              </Form.Item>
            </div>
            <Form.Item
              name="middle_name"
              label="Otasining ismi"
              rules={[{ required: true, message: "Otasining ismini kiriting" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Email manzilini kiriting" },
                { type: "email", message: "To'g'ri email manzil kiriting" },
              ]}
            >
              <Input inputMode="email" autoComplete="email" placeholder="siz@example.com" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Parol"
              rules={[
                { required: true, message: "Parolni kiriting" },
                { min: 5, message: "Parol kamida 5 ta belgidan iborat bo'lishi kerak" },
              ]}
            >
              <Input.Password autoComplete="new-password" />
            </Form.Item>

            <Form.Item
              name="confirm_password"
              label="Parolni tasdiqlang"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Parolni tasdiqlang" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Parol va tasdiqlash paroli bir xil bo'lishi kerak"));
                  },
                }),
              ]}
            >
              <Input.Password autoComplete="new-password" />
            </Form.Item>

            <Button type="primary" htmlType="submit" loading={isCompleting} block className="!mt-2">
              Ro&apos;yxatdan o&apos;tish
            </Button>
          </Form>
        </>
      )}
    </AuthLayout>
  );
}

function RegisterRouter() {
  const searchParams = useSearchParams();
  return searchParams.get("method") === "phone" ? <PhoneRegistration /> : <MethodChoice />;
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterRouter />
    </Suspense>
  );
}
