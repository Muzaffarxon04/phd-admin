"use client";

import { Input } from "antd";
import { forwardRef } from "react";
import type { InputRef } from "antd";

/** Extract the 9 national digits from any user input / stored value. */
export function nationalDigits(raw: string | undefined | null): string {
  let d = String(raw ?? "").replace(/\D/g, "");
  if (d.length > 9 && d.startsWith("998")) d = d.slice(3);
  return d.slice(0, 9);
}

/** "901234567" -> "90 123 45 67" */
export function formatNational(d: string): string {
  const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
  return parts.join(" ");
}

export const PHONE_PATTERN = /^\+998\d{9}$/;

export const phoneRules = [
  { required: true, message: "Telefon raqamni kiriting" },
  { pattern: PHONE_PATTERN, message: "Raqamni to'liq kiriting: +998 90 123 45 67" },
];

interface PhoneInputProps {
  /** "+998901234567" (may be partial while typing) */
  value?: string;
  onChange?: (value: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  id?: string;
  status?: "error" | "warning";
}

/** Uzbek mobile number input with a fixed +998 prefix. Emits "+998XXXXXXXXX". */
export const PhoneInput = forwardRef<InputRef, PhoneInputProps>(function PhoneInput(
  { value, onChange, autoFocus, disabled, id, status },
  ref
) {
  const digits = nationalDigits(value);
  return (
    <Input
      ref={ref}
      id={id}
      status={status}
      disabled={disabled}
      autoFocus={autoFocus}
      inputMode="tel"
      autoComplete="tel-national"
      className="tabular"
      prefix={<span className="tabular select-none pr-1 text-muted">+998</span>}
      placeholder="90 123 45 67"
      value={formatNational(digits)}
      onChange={(e) => {
        const d = nationalDigits(e.target.value);
        onChange?.(d ? `+998${d}` : "");
      }}
    />
  );
});
