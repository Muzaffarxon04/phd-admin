"use client";

import { useState } from "react";
import Link from "next/link";
import { Alert, Button, Checkbox, Form, Input } from "antd";
import { tsmuIdApi } from "@/lib/api/tsmuId";
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

export function StepLookup({ authenticated, purpose, notice, onFound }: StepLookupProps) {
  const [form] = Form.useForm<{ pinfl: string; birth_date: string; consent: boolean }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<TsmuErrorInfo | null>(null);
  const pinfl = Form.useWatch("pinfl", form) ?? "";

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
    <div>
      {notice && !error && <Alert type="warning" showIcon className="!mb-6" message={notice} />}
      {error && (
        <Alert
          type="error"
          showIcon
          className="!mb-6"
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

      <Form form={form} layout="vertical" size="large" requiredMark={false} onFinish={submit}>
        <Form.Item
          name="pinfl"
          label="JSHSHIR (PINFL)"
          normalize={(v: string) => (v || "").replace(/\D/g, "").slice(0, 14)}
          rules={[
            { required: true, message: "JSHSHIR ni kiriting" },
            { pattern: /^\d{14}$/, message: "JSHSHIR 14 ta raqamdan iborat" },
          ]}
          extra={
            <span className="flex justify-between gap-4 text-xs">
              <span>Pasport yoki ID-kartadagi 14 xonali shaxsiy raqam</span>
              <span className="tabular shrink-0">{String(pinfl).length}/14</span>
            </span>
          }
        >
          <Input
            inputMode="numeric"
            autoComplete="off"
            placeholder="30101900000000"
            className="tabular tracking-[0.08em]"
            maxLength={14}
            autoFocus
          />
        </Form.Item>

        <Form.Item
          name="birth_date"
          label="Tug'ilgan sana"
          normalize={(v: string) => maskDate(v || "")}
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

        <Form.Item
          name="consent"
          valuePropName="checked"
          className="!mb-6"
          rules={[
            {
              validator: (_, v) =>
                v ? Promise.resolve() : Promise.reject(new Error("Davom etish uchun rozilik bering")),
            },
          ]}
        >
          <Checkbox>
            <span className="text-[13px] leading-5 text-muted">
              Shaxsimni tasdiqlash uchun ma&apos;lumotlarim qayta ishlanishiga roziman
            </span>
          </Checkbox>
        </Form.Item>

        <Button type="primary" htmlType="submit" block loading={loading}>
          Davom etish
        </Button>
      </Form>
    </div>
  );
}
