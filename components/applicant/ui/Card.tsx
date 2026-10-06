import { cn } from "@/lib/utils";

interface CardProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Remove body padding (e.g. for edge-to-edge lists/tables). */
  flush?: boolean;
  id?: string;
}

/** Surface container: 12px radius, 1px border, no shadow. */
export function Card({ title, description, actions, children, className, bodyClassName, flush, id }: CardProps) {
  const hasHeader = title || description || actions;
  return (
    <section id={id} className={cn("min-w-0 rounded-xl border border-border bg-surface", className)}>
      {hasHeader && (
        <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b border-border px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            {title && <h2 className="text-[15px] font-semibold leading-6 text-text">{title}</h2>}
            {description && <p className="mt-0.5 text-[13px] leading-5 text-muted">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn(!flush && "p-4 sm:p-5", bodyClassName)}>{children}</div>
    </section>
  );
}
