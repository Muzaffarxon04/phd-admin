import { LockOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import { cn } from "@/lib/utils";

export interface DataItem {
  key: string;
  label: string;
  value?: React.ReactNode;
  locked?: boolean;
  mono?: boolean;
  span?: 1 | 2;
}

/** Label/value pairs: two columns on ≥sm, stacked on mobile. */
export function DataList({ items, className }: { items: DataItem[]; className?: string }) {
  return (
    <dl
      className={cn(
        "-my-3 grid grid-cols-1 gap-x-8 sm:grid-cols-2",
        "[&>div:last-child]:border-b-0 sm:[&>div:nth-last-child(2):nth-child(odd)]:border-b-0",
        className
      )}
    >
      {items.map((item) => {
        const empty = item.value === undefined || item.value === null || item.value === "";
        return (
          <div
            key={item.key}
            className={cn("min-w-0 border-b border-border py-3", item.span === 2 && "sm:col-span-2")}
          >
            <dt className="flex items-center gap-1.5 text-xs font-medium text-muted">
              {item.label}
              {item.locked && (
                <Tooltip title="TSMU ID orqali olingan — o'zgartirib bo'lmaydi">
                  <LockOutlined className="text-[11px]" aria-label="O'zgartirib bo'lmaydi" />
                </Tooltip>
              )}
            </dt>
            <dd className={cn("mt-1 break-words text-sm text-text", item.mono && "tabular", empty && "text-muted")}>
              {empty ? "Kiritilmagan" : item.value}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
