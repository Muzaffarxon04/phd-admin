"use client";

import { Button, Tooltip } from "antd";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  EyeOutlined,
  CreditCardOutlined,
  CheckOutlined,
  CloseOutlined,
  RollbackOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useAdminSurface } from "./AdminUi";

export interface SubmissionActionTarget {
  id: number;
  status: string;
  mark?: { score?: number | null } | null;
}

interface Props {
  record: SubmissionActionTarget;
  detailHref: string;
  onPaymentCheck: () => void;
  onApprove: () => void;
  onReject: () => void;
  onReturn: () => void;
  onScore: () => void;
  /** `table` = compact icon row, `card` = touch-friendly row with a labelled "view" button. */
  variant?: "table" | "card";
}

const TONES = {
  primary: "115, 103, 240",
  blue: "59, 130, 246",
  green: "34, 197, 94",
  red: "239, 68, 68",
  orange: "249, 115, 22",
} as const;

type Tone = keyof typeof TONES;

function IconAction({
  tone,
  icon,
  label,
  onClick,
  size,
}: {
  tone: Tone;
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  size: number;
}) {
  const { isDark } = useAdminSurface();
  const rgb = TONES[tone];
  return (
    <Tooltip title={label}>
      <Button
        aria-label={label}
        title={label}
        onClick={onClick}
        icon={icon}
        className="!flex shrink-0 items-center justify-center !rounded-xl !border-0 shadow-sm transition-all duration-200 hover:!text-white"
        style={{
          width: size,
          height: size,
          fontSize: 18,
          background: `rgba(${rgb}, ${isDark ? 0.2 : 0.1})`,
          color: `rgb(${rgb})`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `rgb(${rgb})`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = `rgba(${rgb}, ${isDark ? 0.2 : 0.1})`;
        }}
      />
    </Tooltip>
  );
}

/**
 * Row actions for a submission. Visibility rules are identical to the
 * original inline implementation in app/admin-panel/submissions/page.tsx.
 */
export function SubmissionRowActions({
  record,
  detailHref,
  onPaymentCheck,
  onApprove,
  onReject,
  onReturn,
  onScore,
  variant = "table",
}: Props) {
  const size = variant === "card" ? 44 : 40;
  const canReview = record.status === "SUBMITTED" || record.status === "UNDER_REVIEW";
  const canReturn =
    record.status === "SUBMITTED" ||
    record.status === "UNDER_REVIEW" ||
    record.status === "APPROVED" ||
    record.status === "REJECTED";
  const canScore = record.status === "APPROVED" && !record?.mark?.score;

  const secondary = (
    <>
      <IconAction tone="blue" icon={<CreditCardOutlined />} label="Payme statusini tekshirish" onClick={onPaymentCheck} size={size} />
      {canReview && (
        <>
          <IconAction tone="green" icon={<CheckOutlined />} label="Tasdiqlash" onClick={onApprove} size={size} />
          <IconAction tone="red" icon={<CloseOutlined />} label="Rad etish" onClick={onReject} size={size} />
        </>
      )}
      {canReturn && (
        <IconAction tone="orange" icon={<RollbackOutlined />} label="Qaytarish" onClick={onReturn} size={size} />
      )}
      {canScore && <IconAction tone="green" icon={<StarOutlined />} label="Baho qo'yish" onClick={onScore} size={size} />}
    </>
  );

  if (variant === "card") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Link href={detailHref} className="min-w-[120px] flex-1">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            className="!h-11 w-full !rounded-xl !border-0 font-semibold"
            style={{ background: "#7367f0" }}
          >
            Ko&apos;rish
          </Button>
        </Link>
        {secondary}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 py-2">
      <Link href={detailHref} aria-label="Ko'rish">
        <IconAction tone="primary" icon={<EyeOutlined />} label="Ko'rish" size={size} />
      </Link>
      {secondary}
    </div>
  );
}
