/**
 * Shared admin-panel UI building blocks (responsive, theme-aware).
 * Styles and `--admin-*` tokens live in ./admin-ui.css (imported by each component).
 *
 *   PageHeader         page title / subtitle / breadcrumb / actions (stack on phones)
 *   AdminCard          surface card with optional header (title, icon, extra)
 *   StatCard/StatGrid  KPI tiles; grid is 1 col (<640) / 2 (640-1023) / N (>=1024)
 *   ResponsiveModal    antd Modal that becomes a bottom sheet on phones
 *   ResponsiveTable    antd Table from 640px, card list + pagination below
 *   DonutChart / HorizontalBarChart  recharts wrappers with breakpoint-aware sizing
 *   useAdminBreakpoint { isMobile, isTablet, isDesktop }
 */
export { PageHeader, type PageHeaderProps } from "./PageHeader";
export { AdminCard, type AdminCardProps } from "./AdminCard";
export { StatCard, StatGrid, type StatCardProps, type StatGridProps } from "./StatCard";
export { ResponsiveModal, type ResponsiveModalProps } from "./ResponsiveModal";
export { ResponsiveTable, type ResponsiveTableProps } from "./ResponsiveTable";
export {
  DonutChart,
  HorizontalBarChart,
  ADMIN_CHART_COLORS,
  adminChartTooltipStyle,
  type DonutChartProps,
  type DonutDatum,
  type HorizontalBarChartProps,
  type BarDatum,
} from "./charts";
export { useAdminBreakpoint, type AdminBreakpoint } from "./useAdminBreakpoint";
