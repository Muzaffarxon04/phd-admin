"use client";

import { useState } from "react";
import { Form, Input, Button, App } from "antd";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePost } from "@/lib/hooks";
import { getErrorMessage } from "@/lib/applicant/errors";
import { AuthLayout } from "@/components/applicant/auth/AuthLayout";
import { PhoneInput, phoneRules, formatNational, nationalDigits } from "@/components/applicant/auth/PhoneInput";
import { WizardProgress } from "@/components/applicant/tsmu-id/WizardProgress";

export default function ForgotPasswordPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpId, setOtpId] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");

  const router = useRouter();
  const { message } = App.useApp();

  const { mutate: requestReset, isPending: isRequesting } = usePost("/auth/password/reset/", {
    onSuccess: (response: { data?: { otp_id?: string }; otp_id?: string }) => {
      setCurrentStep(1);
      message.success("OTP kod yuborildi");
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
      message.success("OTP tasdiqlandi");
    },
    onError: (error) => {
      message.error(getErrorMessage(error, "OTP tasdiqlashda xatolik yuz berdi"));
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
    "Akkauntingizga bog'langan telefon raqamni kiriting.",
    `Kod +998 ${formatNational(nationalDigits(phoneNumber))} raqamiga yuborildi.`,
    "Yangi parol o'rnating.",
  ];

  return (
    <AuthLayout
      title="Parolni tiklash"
      subtitle={subtitles[currentStep]}
      top={<WizardProgress steps={["Telefon", "SMS kod", "Yangi parol"]} current={currentStep} />}
      footer={
        <Link href="/login" className="font-medium text-primary hover:underline">
          Kirish sahifasiga qaytish
        </Link>
      }
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
            Davom etish
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
          <button
            type="button"
            className="mt-4 text-[13px] font-medium text-muted hover:text-text"
            onClick={() => setCurrentStep(0)}
          >
            ← Orqaga
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
            <Input.Password autoComplete="new-password" />
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
            Parolni o&apos;zgartirish
          </Button>
          <button
            type="button"
            className="mt-4 text-[13px] font-medium text-muted hover:text-text"
            onClick={() => setCurrentStep(1)}
          >
            ← Orqaga
          </button>
        </Form>
      )}
    </AuthLayout>
  );
}
