"use client";

import { useRef, useState } from "react";
import { Alert, Button, Form, Input } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { tsmuIdApi } from "@/lib/api/tsmuId";
import { formatMMSS, useCountdown } from "@/lib/hooks/useCountdown";
import { PhoneInput, phoneRules, formatNational, nationalDigits } from "@/components/applicant/auth/PhoneInput";
import { tsmuError } from "./errors";

interface StepPhoneProps {
  verificationId: string;
  maskedName: string;
  onVerified: (phone: string) => void;
  onRestart: (message: string) => void;
}

const RESEND_SECONDS = 60;

export function StepPhone({ verificationId, maskedName, onVerified, onRestart }: StepPhoneProps) {
  const [stage, setStage] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [expiresIn, setExpiresIn] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpForm] = Form.useForm<{ otp_code: string }>();
  const timer = useCountdown();
  const verifying = useRef(false);

  const sendCode = async (number: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await tsmuIdApi.phone(verificationId, number);
      setPhone(number);
      setExpiresIn(res.expires_in ?? null);
      setStage("otp");
      timer.start(RESEND_SECONDS);
    } catch (err) {
      const info = tsmuError(err);
      if (info.action === "restart") onRestart(info.message);
      else setError(info.message);
    } finally {
      setLoading(false);
    }
  };

  const verify = async (code: string) => {
    if (verifying.current) return;
    verifying.current = true;
    setLoading(true);
    setError(null);
    try {
      await tsmuIdApi.phoneVerify(verificationId, code);
      onVerified(phone);
    } catch (err) {
      const info = tsmuError(err);
      if (info.action === "restart") onRestart(info.message);
      else {
        setError(info.message);
        otpForm.resetFields();
      }
    } finally {
      verifying.current = false;
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
          <UserOutlined />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted">Shaxs tasdiqlandi</p>
          <p className="truncate text-[15px] font-semibold tracking-wide text-text">Siz: {maskedName}</p>
        </div>
      </div>

      {error && <Alert type="error" showIcon className="!mb-6" message={error} />}

      {stage === "phone" ? (
        <Form layout="vertical" size="large" requiredMark={false} onFinish={(v) => void sendCode(v.phone_number)}>
          <Form.Item
            name="phone_number"
            label="Telefon raqam"
            rules={phoneRules}
            extra="Ushbu raqam akkauntga kirish uchun ishlatiladi. Unga SMS kod yuboramiz."
          >
            <PhoneInput autoFocus />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            SMS kod yuborish
          </Button>
        </Form>
      ) : (
        <Form
          form={otpForm}
          layout="vertical"
          size="large"
          requiredMark={false}
          onFinish={(v) => void verify(v.otp_code)}
        >
          <p className="mb-4 text-sm text-muted">
            Kod <span className="tabular font-medium text-text">+998 {formatNational(nationalDigits(phone))}</span>{" "}
            raqamiga yuborildi
            {expiresIn ? ` va ${Math.round(expiresIn / 60)} daqiqa amal qiladi` : ""}.
          </p>
          <Form.Item
            name="otp_code"
            label="SMS kod"
            rules={[{ required: true, len: 6, message: "6 xonali kodni kiriting" }]}
          >
            <Input.OTP
              length={6}
              autoFocus
              inputMode="numeric"
              className="otp-input"
              onChange={(v) => {
                if (v && v.length === 6) void verify(v);
              }}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Tasdiqlash
          </Button>
          <div className="mt-4 flex items-center justify-between text-[13px]">
            <button
              type="button"
              className="font-medium text-muted hover:text-text"
              onClick={() => {
                setStage("phone");
                setError(null);
              }}
            >
              Raqamni o&apos;zgartirish
            </button>
            {timer.active ? (
              <span className="tabular text-muted">Qayta yuborish: {formatMMSS(timer.secondsLeft)}</span>
            ) : (
              <Button type="link" size="small" className="!px-0" disabled={loading} onClick={() => void sendCode(phone)}>
                Kodni qayta yuborish
              </Button>
            )}
          </div>
        </Form>
      )}
    </div>
  );
}
