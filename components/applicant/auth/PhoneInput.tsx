"use client";

import { Input } from "antd";
import { forwardRef } from "react";
import type { InputRef } from "antd";
import { PHONE_PATTERN, displayValue, nextValue } from "./phone";

export { PHONE_PATTERN, formatNational, nationalDigits, valueToDigits } from "./phone";

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
      value={displayValue(value)}
      onChange={(e) => onChange?.(nextValue(e.target.value))}
    />
  );
});
