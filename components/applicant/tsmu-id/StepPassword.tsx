"use client";

import { useState } from "react";
import { Alert, Button, Form, Input } from "antd";
import { tsmuIdApi } from "@/lib/api/tsmuId";
import { cn } from "@/lib/utils";
import type { TsmuCompleteResponse } from "@/types";
import { tsmuError } from "./errors";

type StepPasswordProps = {
  verificationId: string;
  onRestart: (message: string) => void;
} & (
  | { /** register: creates the account and returns tokens */ mode?: "register"; onComplete: (res: TsmuCompleteResponse) => void }
  | { /** reset: sets a new password on the existing account */ mode: "reset"; onComplete: () => void }
);

export function passwordScore(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) score++;
  return pw.length < 8 ? Math.min(score, 1) : score;
}

const LEVELS = [
  { label: "Juda zaif", bar: "bg-danger", text: "text-danger" },
  { label: "Zaif", bar: "bg-danger", text: "text-danger" },
  { label: "O'rtacha", bar: "bg-warning", text: "text-warning" },
  { label: "Yaxshi", bar: "bg-success", text: "text-success" },
  { label: "Kuchli", bar: "bg-success", text: "text-success" },
];

function StrengthMeter({ password }: { password: string }) {
  const score = passwordScore(password);
  const level = LEVELS[score];
  return (
    <div className="-mt-2 mb-5" aria-live="polite">
      <div className="grid grid-cols-4 gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn("h-1 rounded-full transition-colors", password && i < Math.max(score, 1) ? level.bar : "bg-surface-2")}
          />
        ))}
      </div>
      <p className="mt-2 flex justify-between text-xs text-muted">
        <span>Kamida 8 belgi, harf va raqam</span>
        {password && <span className={cn("font-medium", level.text)}>{level.label}</span>}
      </p>
    </div>
  );
}

export function StepPassword(props: StepPasswordProps) {
  const { verificationId, onRestart } = props;
  const reset = props.mode === "reset";
  const [form] = Form.useForm<{ password: string; confirm_password: string }>();
  const password = Form.useWatch("password", form) ?? "";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (v: { password: string; confirm_password: string }) => {
    setLoading(true);
    setError(null);
    try {
      if (props.mode === "reset") {
        await tsmuIdApi.resetPassword(verificationId, v.password, v.confirm_password);
        props.onComplete();
      } else {
        const res = await tsmuIdApi.complete(verificationId, v.password, v.confirm_password);
        props.onComplete(res);
      }
    } catch (err) {
      const info = tsmuError(err);
      if (info.action === "restart") onRestart(info.message);
      else setError(info.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <Alert type="error" showIcon className="!mb-6" message={error} />}
      <Form form={form} layout="vertical" size="large" requiredMark={false} onFinish={submit}>
        <Form.Item
          name="password"
          label={reset ? "Yangi parol" : "Parol"}
          rules={[
            { required: true, message: "Parolni kiriting" },
            { min: 8, message: "Parol kamida 8 ta belgidan iborat bo'lishi kerak" },
            {
              validator: (_, v: string) =>
                !v || (/[A-Za-z]/.test(v) && /\d/.test(v))
                  ? Promise.resolve()
                  : Promise.reject(new Error("Parolda harf va raqam bo'lishi kerak")),
            },
          ]}
        >
          <Input.Password autoComplete="new-password" autoFocus />
        </Form.Item>
        <StrengthMeter password={password} />
        <Form.Item
          name="confirm_password"
          label="Parolni tasdiqlang"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Parolni qayta kiriting" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) return Promise.resolve();
                return Promise.reject(new Error("Parollar bir xil emas"));
              },
            }),
          ]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={loading} className="!mt-2">
          {reset ? "Parolni saqlash" : "Akkaunt yaratish"}
        </Button>
      </Form>
    </div>
  );
}
