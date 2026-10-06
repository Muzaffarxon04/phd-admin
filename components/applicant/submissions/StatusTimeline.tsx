import { CheckOutlined } from "@ant-design/icons";
import { cn } from "@/lib/utils";
import { timelineSteps, type SubmissionStatus } from "@/lib/applicant/submissions";
import type { Tone } from "@/components/applicant/ui/StatusBadge";

const toneDot: Record<Tone, string> = {
  neutral: "bg-muted text-white",
  info: "bg-primary text-white",
  warning: "bg-warning text-white",
  success: "bg-success text-white",
  danger: "bg-danger text-white",
};

/** Qoralama → Yuborildi → Ko'rib chiqilmoqda → Natija. Horizontal on ≥640px, vertical on phones. */
export function StatusTimeline({ status }: { status: SubmissionStatus | string }) {
  const steps = timelineSteps(status);
  return (
    <ol className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-0">
      {steps.map((step, i) => {
        const done = step.state === "done";
        const current = step.state === "current";
        const dotClass = done
          ? toneDot[step.tone ?? "success"]
          : current
            ? "bg-primary text-white ring-4 ring-primary-soft"
            : "border border-border bg-surface text-muted";
        return (
          <li key={step.key} className="relative flex items-center gap-3 sm:flex-1 sm:flex-col sm:gap-2 sm:text-center">
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[13px] top-7 h-[calc(100%+4px)] w-px sm:left-[calc(50%+16px)] sm:top-[13px] sm:h-px sm:w-[calc(100%-32px)]",
                  done ? "bg-success/60" : "bg-border"
                )}
              />
            )}
            <span className={cn("tabular relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold", dotClass)}>
              {done ? <CheckOutlined /> : i + 1}
            </span>
            <span className={cn("text-[13px] leading-5", current || done ? "font-medium text-text" : "text-muted")}>{step.title}</span>
          </li>
        );
      })}
    </ol>
  );
}
