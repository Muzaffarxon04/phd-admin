"use client";

import type { Key, ReactNode } from "react";
import { Empty, Pagination, Skeleton, Table, type TableProps } from "antd";
import { useAdminBreakpoint } from "./useAdminBreakpoint";
import "./admin-ui.css";

export interface ResponsiveTableProps<T extends object> extends TableProps<T> {
  /** Renders one record as a card in the mobile list. */
  renderCard: (record: T, index: number) => ReactNode;
  /**
   * Below which breakpoint the card list replaces the table:
   * "mobile" (< 640px, default) or "tablet" (< 1024px).
   */
  cardsBelow?: "mobile" | "tablet";
  /** Text shown when there is no data. */
  emptyText?: ReactNode;
}

/**
 * antd Table on larger screens, a stacked card list on small ones.
 *
 * - Table mode: forwards every Table prop; defaults `scroll={{ x: "max-content" }}`
 *   so wide tables scroll inside their container instead of the page.
 * - Card mode: uses `dataSource`, `rowKey`, `loading` and an object `pagination`
 *   (current / pageSize / total / onChange / showTotal) to render an antd
 *   <Pagination> under the list. `pagination={false}` renders all records.
 */
export function ResponsiveTable<T extends object>({
  renderCard,
  cardsBelow = "mobile",
  emptyText,
  ...tableProps
}: ResponsiveTableProps<T>) {
  const { isMobile, isDesktop } = useAdminBreakpoint();
  const useCards = cardsBelow === "tablet" ? !isDesktop : isMobile;

  if (!useCards) {
    return (
      <div className="admin-table-wrap">
        <Table<T>
          scroll={{ x: "max-content" }}
          locale={emptyText ? { emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} /> } : undefined}
          {...tableProps}
        />
      </div>
    );
  }

  const { dataSource, rowKey, loading, pagination } = tableProps;
  const rows = (dataSource ?? []) as readonly T[];
  const isLoading = typeof loading === "object" ? Boolean(loading?.spinning) : Boolean(loading);

  const keyOf = (record: T, index: number): Key => {
    if (typeof rowKey === "function") return rowKey(record, index) as Key;
    if (typeof rowKey === "string") return (record as Record<string, unknown>)[rowKey] as Key;
    const fallback = (record as { key?: Key }).key;
    return fallback ?? index;
  };

  const pg = pagination && typeof pagination === "object" ? pagination : null;

  return (
    <div className="p-3">
      {isLoading && rows.length === 0 ? (
        <div className="space-y-2.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="admin-list-card">
              <Skeleton active avatar paragraph={{ rows: 2 }} />
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="py-8">
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText ?? "Ma'lumotlar mavjud emas"} />
        </div>
      ) : (
        <div className={isLoading ? "opacity-60 transition-opacity" : undefined} aria-busy={isLoading}>
          {rows.map((record, index) => (
            <div key={keyOf(record, index)} className="admin-list-card">
              {renderCard(record, index)}
            </div>
          ))}
        </div>
      )}

      {pg && (pg.total ?? rows.length) > (pg.pageSize ?? 10) ? (
        <div className="mt-4 flex flex-col items-center gap-2">
          <Pagination
            className="admin-pagination"
            current={pg.current}
            pageSize={pg.pageSize}
            total={pg.total}
            onChange={pg.onChange}
            showSizeChanger={false}
            simple
          />
          {pg.showTotal && pg.total != null ? (
            <div className="admin-muted text-xs">
              {pg.showTotal(pg.total, [
                ((pg.current ?? 1) - 1) * (pg.pageSize ?? 10) + 1,
                Math.min((pg.current ?? 1) * (pg.pageSize ?? 10), pg.total),
              ])}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
