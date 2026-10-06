"use client";

import { Table, Pagination } from "antd";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface RTColumn<T> {
  key: string;
  title: string;
  render: (record: T, index: number) => React.ReactNode;
  width?: number | string;
  align?: "left" | "right" | "center";
  /**
   * Mobile card role:
   * - "title": main line of the card
   * - "badge": shown top-right next to the title
   * - "meta": label/value row (default)
   * - "hidden": not shown on mobile
   */
  mobile?: "title" | "badge" | "meta" | "hidden";
  className?: string;
}

interface ResponsiveTableProps<T> {
  columns: RTColumn<T>[];
  data: T[];
  rowKey: (record: T) => string | number;
  onRowClick?: (record: T) => void;
  rowClassName?: (record: T) => string;
  pageSize?: number;
  loading?: boolean;
  /** Extra content at the bottom of each mobile card (e.g. hint). */
  mobileFooter?: (record: T) => React.ReactNode;
}

/**
 * Table on ≥768px, stacked cards on mobile. Both are rendered and toggled with CSS
 * so there is no layout flash during hydration.
 */
export function ResponsiveTable<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  rowClassName,
  pageSize = 10,
  loading,
  mobileFooter,
}: ResponsiveTableProps<T>) {
  const [page, setPage] = useState(1);
  const titleCol = columns.find((c) => c.mobile === "title");
  const badgeCol = columns.find((c) => c.mobile === "badge");
  const metaCols = columns.filter((c) => !c.mobile || c.mobile === "meta");
  const pageData = data.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface md:block">
        <Table<T>
          loading={loading}
          dataSource={data}
          rowKey={(r) => String(rowKey(r))}
          size="middle"
          tableLayout="fixed"
          rowClassName={(r) => cn(onRowClick && "cursor-pointer", rowClassName?.(r))}
          onRow={(record) => ({ onClick: onRowClick ? () => onRowClick(record) : undefined })}
          pagination={
            data.length > pageSize
              ? { pageSize, showSizeChanger: false, className: "!px-4", hideOnSinglePage: true }
              : false
          }
          columns={columns.map((c) => ({
            key: c.key,
            title: c.title,
            width: c.width,
            align: c.align,
            className: c.className,
            render: (_: unknown, record: T, index: number) => c.render(record, index),
          }))}
        />
      </div>

      <ul className="flex flex-col gap-3 md:hidden">
        {pageData.map((record, i) => (
          <li key={String(rowKey(record))}>
            <div
              role={onRowClick ? "button" : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onClick={onRowClick ? () => onRowClick(record) : undefined}
              onKeyDown={
                onRowClick
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onRowClick(record);
                      }
                    }
                  : undefined
              }
              className={cn(
                "rounded-xl border border-border bg-surface p-4 transition-colors",
                onRowClick && "cursor-pointer active:bg-surface-2",
                rowClassName?.(record)
              )}
            >
              {(titleCol || badgeCol) && (
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0 text-sm font-medium text-text">{titleCol?.render(record, i)}</div>
                  {badgeCol && <div className="shrink-0">{badgeCol.render(record, i)}</div>}
                </div>
              )}
              <dl className="flex flex-col gap-2">
                {metaCols.map((c) => (
                  <div key={c.key} className="flex items-center justify-between gap-4 text-[13px]">
                    <dt className="shrink-0 text-muted">{c.title}</dt>
                    <dd className="min-w-0 truncate text-right text-text">{c.render(record, i)}</dd>
                  </div>
                ))}
              </dl>
              {mobileFooter?.(record)}
            </div>
          </li>
        ))}
        {data.length > pageSize && (
          <li className="flex justify-center pt-2">
            <Pagination simple current={page} pageSize={pageSize} total={data.length} onChange={setPage} />
          </li>
        )}
      </ul>
    </>
  );
}
