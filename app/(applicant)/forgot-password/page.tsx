"use client";

import { Suspense, useState } from "react";
import { Form, Input, Button, App } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { usePost } from "@/lib/hooks";
import { getErrorMessage } from "@/lib/applicant/errors";
import { AuthLayout } from "@/components/applicant/auth/AuthLayout";
import { PhoneInput, phoneRules, formatNational, nationalDigits } from "@/components/applicant/auth/PhoneInput";
import { TsmuIdWizard } from "@/components/applicant/tsmu-id/TsmuIdWizard";
import { WizardProgress } from "@/components/applicant/tsmu-id/WizardProgress";

const backToLogin = (
  <Link href="/login" className="inline-flex min-h-11 items-center font-medium text-primary hover:underline">
    Kirish sahifasiga qaytish
  </Link>
);

const linkButton = "inline-flex min-h-11 items-center text-[13px] font-medium text-muted hover:text-text";

/* ------------------------------------------------------------------ */
/* Primary: reset with TSMU ID (JSHSHIR + birth date → face → password) */
/* ------------------------------------------------------------------ */

function FaceReset() {
  return (
    <TsmuIdWizard mode="reset">
      {({ step, title, subtitle, progress, body }) => (
        <AuthLayout
          wide
          title={title}
          subtitle={subtitle}
          top={progress}
          footer={
            <div className="flex flex-col items-center gap-1">
              {step === "lookup" && (
                <div className="mb-4 w-full rounded-xl border border-border bg-surface px-4 py-3 text-left">
                  <p className="text-[13px] leading-5 text-muted">Akkauntingiz TSMU ID bilan tasdiqlanmaganmi?</p>
                  <Link
                    href="/forgot-password?method=sms"
                    className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    <MessageOutlined /> SMS orqali tiklash
                  </Link>
                </div>
              )}
              {step !== "done" && backToLogin}
            </div>
          }
        >
          {body}
        </AuthLayout>
      )}
    </TsmuIdWizard>
  );
}

/* ------------------------------------------------------------------ */
/* Fallback: SMS reset for accounts never verified with TSMU ID         */
/* ------------------------------------------------------------------ */

function SmsReset() {
  const [currentStep, setCurrentStep] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpId, setOtpId] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");

  const router = useRouter();
  const { message } = App.useApp();

  const { mutate: requestReset, isPending: isRequesting } = usePost("/auth/password/reset/", {
    onSuccess: (response: { data?: { otp_id?: string }; otp_id?: string }) => {
      setCurrentStep(1);
      message.success("SMS kod yuborildi");
      const id = response.data?.otp_id ?? response.otp_id;
      if (id) setOtpId(id);
    },
    onError: (error) => {
      message.error(getErrorMessage(error, "Parolni tiklash so'rovini yuborishda xatolik yuz berdi"));
    },
  });

  const { mutate: verifyOTP, isPending: isVerifying } = usePost("/auth/password/reset/verify/", {
    onSuccess: () => {
      setCurrentStep(2);
      message.success("Kod tasdiqlandi");
    },
    onError: (error) => {
      message.error(getErrorMessage(error, "Kodni tasdiqlashda xatolik yuz berdi"));
    },
  });

  const { mutate: resetPassword, isPending: isResetting } = usePost("/auth/password/reset/confirm/", {
    onSuccess: () => {
      message.success("Parol muvaffaqiyatli o'zgartirildi");
      router.push("/login");
    },
    onError: (error) => {
      message.error(getErrorMessage(error, "Parolni o'zgartirishda xatolik yuz berdi"));
    },
  });

  const subtitles = [
    "Akkauntingizga bog'langan telefon raqamni kiriting — unga tasdiqlash kodi yuboramiz.",
    `Kod +998 ${formatNational(nationalDigits(phoneNumber))} raqamiga yuborildi.`,
    "Yangi parol o'rnating.",
  ];

  return (
    <AuthLayout
      title="SMS orqali tiklash"
      subtitle={subtitles[currentStep]}
      top={
        <>
          <Link href="/forgot-password" className={`${linkButton} mb-2`}>
            ← TSMU ID orqali tiklash
          </Link>
          <WizardProgress steps={["Telefon", "SMS kod", "Yangi parol"]} current={currentStep} />
        </>
      }
      footer={backToLogin}
    >
      {currentStep === 0 && (
        <Form
          layout="vertical"
          size="large"
          requiredMark={false}
          onFinish={(v) => {
            setPhoneNumber(v.phone_number);
            requestReset(v);
          }}
        >
          <Form.Item name="phone_number" label="Telefon raqam" rules={phoneRules}>
            <PhoneInput autoFocus />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={isRequesting} block>
            SMS kod yuborish
          </Button>
        </Form>
      )}

      {currentStep === 1 && (
        <Form
          layout="vertical"
          size="large"
          requiredMark={false}
          onFinish={(v) => {
            setOtpCode(v.otp_code);
            verifyOTP({
              phone_number: phoneNumber,
              otp_code: v.otp_code,
              ...(otpId && { otp_id: otpId }),
            });
          }}
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
          <button type="button" className={`${linkButton} mt-2`} onClick={() => setCurrentStep(0)}>
            ← Raqamni o&apos;zgartirish
          </button>
        </Form>
      )}

      {currentStep === 2 && (
        <Form
          layout="vertical"
          size="large"
          requiredMark={false}
          onFinish={(v) =>
            resetPassword({
              phone_number: phoneNumber,
              otp_code: otpCode,
              new_password: v.new_password,
              confirm_password: v.confirm_password,
              ...(otpId && { otp_id: otpId }),
            })
          }
        >
          <Form.Item
            name="new_password"
            label="Yangi parol"
            rules={[
              { required: true, message: "Yangi parolni kiriting" },
              { min: 8, message: "Parol kamida 8 ta belgidan iborat bo'lishi kerak" },
            ]}
          >
            <Input.Password autoComplete="new-password" autoFocus />
          </Form.Item>
          <Form.Item
            name="confirm_password"
            label="Parolni tasdiqlang"
            dependencies={["new_password"]}
            rules={[
              { required: true, message: "Parolni tasdiqlang" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("new_password") === value) return Promise.resolve();
                  return Promise.reject(new Error("Parollar bir xil emas"));
                },
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={isResetting} block>
            Parolni saqlash
          </Button>
          <button type="button" className={`${linkButton} mt-2`} onClick={() => setCurrentStep(1)}>
            ← Orqaga
          </button>
        </Form>
      )}
    </AuthLayout>
  );
}

function ForgotPassword() {
  const method = useSearchParams().get("method");
  return method === "sms" ? <SmsReset /> : <FaceReset />;
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPassword />
    </Suspense>
  );
}
