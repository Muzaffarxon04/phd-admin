"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CSSProperties } from "react";
import { useAdminBreakpoint } from "./useAdminBreakpoint";
import "./admin-ui.css";

/** Categorical palette used by admin charts (legacy admin brand colors). */
export const ADMIN_CHART_COLORS = ["#7367f0", "#52c41a", "#ff9f43", "#ea5455", "#00cfe8", "#28c76f", "#8b5cf6", "#06b6d4"];

/** Recharts tooltip `contentStyle` that follows the admin theme tokens. */
export const adminChartTooltipStyle: CSSProperties = {
  borderRadius: 10,
  border: "1px solid var(--admin-border)",
  boxShadow: "var(--admin-shadow-lg)",
  background: "var(--admin-surface)",
  color: "var(--admin-text)",
  fontSize: 13,
  padding: "8px 12px",
};

const tooltipItemStyle: CSSProperties = { color: "var(--admin-text)" };
const tooltipLabelStyle: CSSProperties = { color: "var(--admin-heading)", fontWeight: 600, marginBottom: 2 };

const fmt = (v: unknown) => (typeof v === "number" ? v : Number(v) || 0).toLocaleString();

/* ------------------------------------------------------------------ */
/* Donut                                                               */
/* ------------------------------------------------------------------ */

export interface DonutDatum {
  name: string;
  value: number;
  /** Optional slice color; otherwise ADMIN_CHART_COLORS[index]. */
  color?: string;
}

export interface DonutChartProps {
  data: DonutDatum[];
  /** Number in the middle. Defaults to the sum of values. */
  total?: number;
  /** Caption under the center number. Default "Jami". */
  centerLabel?: string;
  /** Series name in the tooltip. Default "Son". */
  valueLabel?: string;
  /** Outside "name 42%" slice labels; only rendered from 640px up. Default false. */
  showSliceLabels?: boolean;
  /** Formats the outside slice label (default: `${name} ${percent}%`). */
  sliceLabel?: (name: string, percent: number) => string;
  /**
   * Legend: "inline" (wrapping chips under the chart), "list" (bordered rows
   * with values, 1 col on phones / 2 cols from sm), "side" (list to the right
   * of the chart from lg up) or "none". Default "inline".
   */
  legend?: "inline" | "list" | "side" | "none";
  /** "md" (about 240px) or "lg" (about 280px). Phones get a smaller variant automatically. */
  size?: "md" | "lg";
}

/** Responsive donut with a total in the middle and a legend with values. */
export function DonutChart({
  data,
  total,
  centerLabel = "Jami",
  valueLabel = "Son",
  showSliceLabels = false,
  sliceLabel,
  legend = "inline",
  size = "md",
}: DonutChartProps) {
  const { isMobile } = useAdminBreakpoint();
  const colored = data.map((d, i) => ({ ...d, color: d.color ?? ADMIN_CHART_COLORS[i % ADMIN_CHART_COLORS.length] }));
  const sum = total ?? colored.reduce((s, d) => s + d.value, 0);

  const dims =
    size === "lg"
      ? isMobile
        ? { h: 220, inner: 60, outer: 90 }
        : { h: 280, inner: 70, outer: 105 }
      : isMobile
        ? { h: 200, inner: 54, outer: 82 }
        : { h: 240, inner: 60, outer: 90 };
  const labels = showSliceLabels && !isMobile;
  const formatLabel = sliceLabel ?? ((name: string, percent: number) => `${name} ${(percent * 100).toFixed(0)}%`);

  const chart = (
    <div className="admin-chart" style={{ height: dims.h }}>
      <ResponsiveContainer width="100%" height={dims.h}>
        <PieChart>
          <Pie
            data={colored}
            cx="50%"
            cy="50%"
            innerRadius={dims.inner}
            outerRadius={dims.outer}
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
            label={labels ? ({ name, percent }) => formatLabel(String(name ?? ""), percent ?? 0) : false}
            labelLine={labels}
            isAnimationActive={!isMobile}
          >
            {colored.map((d, i) => (
              <Cell key={i} fill={d.color} stroke="none" />
            ))}
          </Pie>
          <RechartsTooltip
            contentStyle={adminChartTooltipStyle}
            itemStyle={tooltipItemStyle}
            labelStyle={tooltipLabelStyle}
            formatter={(v) => [fmt(v), valueLabel]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div
            className={`admin-heading admin-tabular font-bold leading-tight ${size === "lg" ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"}`}
          >
            {sum.toLocaleString()}
          </div>
          <div className="admin-muted mt-0.5 text-xs font-medium">{centerLabel}</div>
        </div>
      </div>
    </div>
  );

  if (legend === "none") return chart;

  if (legend === "inline") {
    return (
      <div>
        {chart}
        <ul className="m-0 mt-3 flex list-none flex-wrap justify-center gap-x-4 gap-y-2 p-0">
          {colored.map((item) => (
            <li key={item.name} className="flex min-w-0 items-center gap-2 text-[13px]">
              <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ background: item.color }} />
              <span className="admin-muted">{item.name}:</span>
              <span className="admin-heading admin-tabular font-semibold">{item.value.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const list = (
    <ul
      className={`m-0 grid list-none grid-cols-1 gap-2 p-0 ${legend === "list" ? "mt-4 sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"}`}
    >
      {colored.map((item) => (
        <li key={item.name} className="admin-legend-item">
          <span className="flex min-w-0 items-center gap-2">
            <span className="h-3 w-3 flex-none rounded-full" style={{ background: item.color }} />
            <span className="truncate text-[13px] font-medium" title={item.name}>
              {item.name}
            </span>
          </span>
          <span className="admin-heading admin-tabular text-base font-bold">{item.value.toLocaleString()}</span>
        </li>
      ))}
    </ul>
  );

  if (legend === "list") {
    return (
      <div>
        {chart}
        {list}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-2 lg:gap-8">
      <div className="min-w-0">{chart}</div>
      <div className="min-w-0">{list}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Horizontal bars                                                     */
/* ------------------------------------------------------------------ */

export interface BarDatum {
  /** Axis label (can be pre-truncated). */
  name: string;
  /** Full label shown in the tooltip; falls back to `name`. */
  fullName?: string;
  value: number;
}

export interface HorizontalBarChartProps {
  data: BarDatum[];
  /** Bar color. Default admin primary. */
  color?: string;
  /** Series name in the tooltip, e.g. "Ekspertlar soni". */
  valueLabel?: string;
  /** Max chart height in px (it grows with the number of rows up to this). Default 420. */
  maxHeight?: number;
}

/**
 * Horizontal bar chart for ranked categories with long names. The category
 * axis width and label truncation adapt to the breakpoint so the chart never
 * overflows a phone screen; the full name is always in the tooltip.
 */
export function HorizontalBarChart({ data, color = "#7367f0", valueLabel = "Son", maxHeight = 420 }: HorizontalBarChartProps) {
  const { isMobile, isDesktop } = useAdminBreakpoint();
  const axisWidth = isMobile ? 104 : isDesktop ? 200 : 150;
  const maxChars = Math.floor(axisWidth / 6.4);
  const rowH = isMobile ? 34 : 36;
  const height = Math.min(maxHeight, 64 + data.length * rowH);
  const truncate = (s: string) => (s.length > maxChars ? `${s.slice(0, Math.max(1, maxChars - 1))}…` : s);

  return (
    <div className="admin-chart" style={{ height }}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: isMobile ? 28 : 40, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--admin-border)" />
          <XAxis
            type="number"
            tick={{ fill: "var(--admin-muted)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={axisWidth}
            tick={{ fill: "var(--admin-muted)", fontSize: isMobile ? 10.5 : 11 }}
            tickFormatter={(v: unknown) => truncate(String(v ?? ""))}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <RechartsTooltip
            cursor={{ fill: "var(--admin-surface-hover)" }}
            contentStyle={adminChartTooltipStyle}
            itemStyle={tooltipItemStyle}
            labelStyle={tooltipLabelStyle}
            formatter={(v) => [fmt(v), valueLabel]}
            labelFormatter={(_, payload) => {
              const p = payload?.[0]?.payload as BarDatum | undefined;
              return p?.fullName ?? p?.name ?? "";
            }}
          />
          <Bar dataKey="value" fill={color} radius={[0, 6, 6, 0]} barSize={isMobile ? 16 : 18} isAnimationActive={!isMobile}>
            <LabelList
              dataKey="value"
              position="right"
              formatter={(v: unknown) => (v != null && v !== "" ? String(v) : "")}
              style={{ fill: "var(--admin-text)", fontSize: 12, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
