import { SafetyCertificateFilled } from "@ant-design/icons";
import { cn } from "@/lib/utils";

export function VerifiedBadge({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full bg-success-soft px-2.5 text-xs font-medium text-success",
        className
      )}
      title="Shaxs TSMU ID orqali tasdiqlangan"
    >
      <SafetyCertificateFilled className="text-[12px]" />
      {compact ? "Tasdiqlangan" : "TSMU ID orqali tasdiqlangan"}
    </span>
  );
}
