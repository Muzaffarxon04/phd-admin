"use client";

import { useState } from "react";
import Link from "next/link";
import { Alert, Button, Checkbox, Form, Input } from "antd";
import {
  ArrowRightOutlined,
  CalendarOutlined,
  CameraOutlined,
  IdcardOutlined,
  KeyOutlined,
  MobileOutlined,
  QuestionCircleOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { tsmuIdApi } from "@/lib/api/tsmuId";
import { cn } from "@/lib/utils";
import type { TsmuLookupResponse, TsmuPurpose } from "@/types";
import { tsmuError, type TsmuErrorInfo } from "./errors";

interface StepLookupProps {
  authenticated?: boolean;
  /** Sent to lookup in the public flows; omitted in /verify-identity. */
  purpose?: TsmuPurpose;
  /** Message shown when the user was sent back here (e.g. session expired). */
  notice?: string | null;
  onFound: (res: TsmuLookupResponse) => void;
}

/** "12031990" -> "12.03.1990" while typing */
function maskDate(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}.${d.slice(2)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 4)}.${d.slice(4)}`;
}

/** "DD.MM.YYYY" -> "YYYY-MM-DD" or null if not a real past date. */
export function toIsoDate(value: string): string | null {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  const now = new Date();
  if (year < 1900 || date.getTime() > now.getTime()) return null;
  return `${yyyy}-${mm}-${dd}`;
}

/** "30101900000000" -> "3010 1900 0000 00" (display only) */
function groupPinfl(d: string): string {
  return d.replace(/(\d{4})(?=\d)/g, "$1 ");
}

const NEXT_STEPS: Record<"registration" | "password_reset" | "verify", { icon: React.ReactNode; text: string }[]> = {
  registration: [
    { icon: <CameraOutlined />, text: "Yuz tekshiruvi — taxminan 30 soniya" },
    { icon: <MobileOutlined />, text: "Telefon raqamni SMS orqali tasdiqlash" },
    { icon: <KeyOutlined />, text: "Parol o'rnatish" },
  ],
  password_reset: [
    { icon: <CameraOutlined />, text: "Yuz tekshiruvi — taxminan 30 soniya" },
    { icon: <KeyOutlined />, text: "Yangi parol o'rnatish" },
  ],
  verify: [{ icon: <CameraOutlined />, text: "Yuz tekshiruvi — taxminan 30 soniya" }],
};

function FieldLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2 font-medium text-text">
      <span className="text-muted">{icon}</span>
      {children}
    </span>
  );
}

export function StepLookup({ authenticated, purpose, notice, onFound }: StepLookupProps) {
  const [form] = Form.useForm<{ pinfl: string; birth_date: string; consent: boolean }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<TsmuErrorInfo | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const pinfl: string = Form.useWatch("pinfl", form) ?? "";
  const birthDate: string = Form.useWatch("birth_date", form) ?? "";
  const consent: boolean = Form.useWatch("consent", form) ?? false;

  const pinflDone = /^\d{14}$/.test(pinfl);
  const dateDone = !!toIsoDate(birthDate);
  const ready = pinflDone && dateDone && consent;
  const steps = NEXT_STEPS[purpose ?? "verify"];

  const submit = async (values: { pinfl: string; birth_date: string }) => {
    const iso = toIsoDate(values.birth_date);
    if (!iso) return;
    setLoading(true);
    setError(null);
    try {
      const res = await tsmuIdApi.lookup(values.pinfl, iso, { authenticated, purpose });
      onFound(res);
    } catch (err) {
      setError(tsmuError(err, { authenticated }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {notice && !error && <Alert type="warning" showIcon message={notice} />}
      {error && (
        <Alert
          type="error"
          showIcon
          message={error.message}
          description={
            error.action === "login" ? (
              <Link href="/login" className="inline-flex min-h-11 items-center font-medium text-primary hover:underline">
                Kirish sahifasiga o&apos;tish →
              </Link>
            ) : error.action === "register" ? (
              <Link href="/register" className="inline-flex min-h-11 items-center font-medium text-primary hover:underline">
                Ro&apos;yxatdan o&apos;tish →
              </Link>
            ) : undefined
          }
        />
      )}

      <Form
        form={form}
        layout="vertical"
        size="large"
        requiredMark={false}
        onFinish={submit}
        className="tsmu-lookup-form"
      >
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-6">
          <Form.Item
            name="pinfl"
            label={<FieldLabel icon={<IdcardOutlined />}>JSHSHIR (PINFL)</FieldLabel>}
            normalize={(v: string) => (v || "").replace(/\D/g, "").slice(0, 14)}
            rules={[
              { required: true, message: "JSHSHIR ni kiriting" },
              { pattern: /^\d{14}$/, message: "JSHSHIR 14 ta raqamdan iborat" },
            ]}
            extra={
              <span className="mt-1.5 flex items-center justify-between gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setShowHelp((v) => !v)}
                  className="inline-flex min-h-8 items-center gap-1.5 text-muted transition-colors hover:text-primary"
                  aria-expanded={showHelp}
                >
                  <QuestionCircleOutlined /> JSHSHIR qayerda yozilgan?
                </button>
                <span
                  className={cn(
                    "tabular shrink-0 rounded-full px-2 py-0.5 font-medium",
                    pinflDone ? "bg-success-soft text-success" : "bg-surface-2 text-muted"
                  )}
                >
                  {pinfl.length}/14
                </span>
              </span>
            }
          >
            <Input
              inputMode="numeric"
              autoComplete="off"
              placeholder="14 xonali raqam"
              className="tabular !tracking-[0.12em]"
              maxLength={14}
              autoFocus
              aria-describedby="pinfl-help"
            />
          </Form.Item>

          {showHelp && (
            <div
              id="pinfl-help"
              className="-mt-2 mb-5 rounded-xl bg-surface-2 p-3.5 text-[13px] leading-5 text-muted animate-enter"
            >
              <p>
                JSHSHIR — 14 xonali shaxsiy identifikatsiya raqami. U ID-kartaning orqa tomonida va biometrik
                pasportning ma&apos;lumotlar sahifasida yozilgan.
              </p>
              <p className="tabular mt-2 font-medium text-text">Masalan: {groupPinfl("30101900000000")}</p>
            </div>
          )}

          <Form.Item
            name="birth_date"
            label={<FieldLabel icon={<CalendarOutlined />}>Tug&apos;ilgan sana</FieldLabel>}
            normalize={(v: string) => maskDate(v || "")}
            className="!mb-0"
            rules={[
              { required: true, message: "Tug'ilgan sanani kiriting" },
              {
                validator: (_, v: string) =>
                  !v || toIsoDate(v) ? Promise.resolve() : Promise.reject(new Error("Sanani KK.OO.YYYY ko'rinishida kiriting")),
              },
            ]}
          >
            <Input inputMode="numeric" autoComplete="bday" placeholder="KK.OO.YYYY" className="tabular" maxLength={10} />
          </Form.Item>
        </div>

        <Form.Item
          name="consent"
          valuePropName="checked"
          className="!mb-0 !mt-4"
          rules={[
            {
              validator: (_, v) => (v ? Promise.resolve() : Promise.reject(new Error("Davom etish uchun rozilik bering"))),
            },
          ]}
        >
          <Checkbox
            className={cn(
              // `!` beats antd's .ant-checkbox-wrapper padding/margins so the whole card is the click target
              "!m-0 !flex w-full !items-start !gap-1 !rounded-xl !border !border-solid !px-4 !py-3.5 transition-colors",
              consent ? "!border-primary !bg-primary-soft" : "!border-border !bg-surface hover:!border-border-strong"
            )}
          >
            <span className="text-[13px] leading-5 text-text">
              Shaxsimni tasdiqlash uchun ma&apos;lumotlarim qayta ishlanishiga roziman
            </span>
          </Checkbox>
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          block
          loading={loading}
          className={cn("!mt-5 !h-12 !rounded-xl !font-medium", !ready && "opacity-90")}
          icon={<ArrowRightOutlined />}
          iconPosition="end"
        >
          Davom etish
        </Button>
      </Form>

      <div className="rounded-2xl border border-dashed border-border p-4">
        <p className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-muted">
          <SafetyCertificateOutlined /> Keyingi qadamlar
        </p>
        <ol className="flex flex-col gap-2.5">
          {steps.map((s, i) => (
            <li key={s.text} className="flex items-center gap-3 text-[13px] text-text">
              <span className="tabular flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[11px] font-semibold text-primary">
                {i + 1}
              </span>
              <span className="text-muted">{s.icon}</span>
              {s.text}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
