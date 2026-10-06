import { cn } from "@/lib/utils";

interface WizardProgressProps {
  steps: string[];
  current: number;
  className?: string;
}

/** Segmented progress: all labels on ≥sm, "Qadam N / M · label" on mobile. */
export function WizardProgress({ steps, current, className }: WizardProgressProps) {
  return (
    <div className={cn("mb-8", className)} aria-label={`Qadam ${current + 1} / ${steps.length}`}>
      <div className="mb-2.5 flex items-baseline justify-between text-xs sm:hidden">
        <span className="font-medium text-text">{steps[current]}</span>
        <span className="tabular text-muted">
          {current + 1} / {steps.length}
        </span>
      </div>
      <ol className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        {steps.map((label, i) => (
          <li key={label} className="min-w-0">
            <div
              className={cn(
                "h-1 rounded-full transition-colors duration-300",
                i <= current ? "bg-primary" : "bg-surface-2"
              )}
            />
            <span
              className={cn(
                "mt-2 hidden truncate text-xs sm:block",
                i === current ? "font-medium text-text" : i < current ? "text-muted" : "text-muted/70"
              )}
              aria-current={i === current ? "step" : undefined}
            >
              {label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
