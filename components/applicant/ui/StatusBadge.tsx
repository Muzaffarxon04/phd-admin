import { cn, getApplicationStatusLabel } from "@/lib/utils";

export type Tone = "neutral" | "info" | "warning" | "success" | "danger";

export const toneClass: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted",
  info: "bg-primary-soft text-primary",
  warning: "bg-warning-soft text-warning",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
};

const submissionTone: Record<string, Tone> = {
  DRAFT: "warning",
  SUBMITTED: "info",
  UNDER_REVIEW: "info",
  APPROVED: "success",
  REJECTED: "danger",
  WITHDRAWN: "neutral",
  PUBLISHED: "success",
  CLOSED: "neutral",
  ARCHIVED: "neutral",
};

export const paymentLabel: Record<string, string> = {
  PENDING: "Kutilmoqda",
  PAID: "To'langan",
  FAILED: "Xatolik",
  REFUNDED: "Qaytarilgan",
};

const paymentTone: Record<string, Tone> = {
  PENDING: "warning",
  PAID: "success",
  FAILED: "danger",
  REFUNDED: "neutral",
};

interface StatusBadgeProps {
  status?: string | null;
  kind?: "submission" | "payment";
  tone?: Tone;
  children?: React.ReactNode;
  className?: string;
}

export function StatusBadge({ status, kind = "submission", tone, children, className }: StatusBadgeProps) {
  const key = (status || "").toUpperCase();
  const resolvedTone: Tone = tone ?? (kind === "payment" ? paymentTone[key] : submissionTone[key]) ?? "neutral";
  const label =
    children ??
    (kind === "payment" ? paymentLabel[key] || status || "—" : getApplicationStatusLabel(status || "DRAFT"));

  return (
    <span
      className={cn(
        "inline-flex h-6 max-w-full items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs font-medium",
        toneClass[resolvedTone],
        className
      )}
    >
      <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-80" />
      <span className="truncate">{label}</span>
    </span>
  );
}
