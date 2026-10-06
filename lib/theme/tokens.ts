import type { ThemeConfig } from "antd";

/**
 * Single source of truth for the applicant design system.
 * The same values are mirrored as CSS custom properties in app/globals.css
 * (`--color-*` on :root and .dark) so Tailwind utilities and antd agree.
 */

export type ThemeMode = "light" | "dark";

export interface Palette {
  bg: string;
  surface: string;
  surface2: string;
  border: string;
  text: string;
  muted: string;
  primary: string;
  primaryHover: string;
  primarySoft: string;
  success: string;
  warning: string;
  danger: string;
}

export const palette: Record<ThemeMode, Palette> = {
  light: {
    bg: "#fafafa",
    surface: "#ffffff",
    surface2: "#f4f4f5",
    border: "#e4e4e7",
    text: "#18181b",
    muted: "#71717a",
    primary: "#4f46e5",
    primaryHover: "#4338ca",
    primarySoft: "#eef2ff",
    success: "#16a34a",
    warning: "#d97706",
    danger: "#dc2626",
  },
  dark: {
    bg: "#09090b",
    surface: "#18181b",
    surface2: "#27272a",
    border: "#27272a",
    text: "#fafafa",
    muted: "#a1a1aa",
    primary: "#6366f1",
    primaryHover: "#818cf8",
    primarySoft: "#1e1b4b",
    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
  },
};

export const radius = {
  card: 12,
  control: 8,
} as const;

export const controlHeight = {
  desktop: 40,
  mobile: 44,
} as const;

export const fontFamily =
  "var(--font-inter), Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

interface AntdThemeOptions {
  mode: ThemeMode;
  isMobile?: boolean;
  reducedMotion?: boolean;
}

/** antd theme for the applicant-facing app, derived from the palette above. */
export function getApplicantAntdTheme({
  mode,
  isMobile = false,
  reducedMotion = false,
}: AntdThemeOptions): ThemeConfig {
  const c = palette[mode];
  const height = isMobile ? controlHeight.mobile : controlHeight.desktop;
  const focusRing = mode === "dark" ? "0 0 0 3px rgba(99,102,241,0.28)" : "0 0 0 3px rgba(79,70,229,0.14)";

  return {
    cssVar: false,
    hashed: true,
    token: {
      colorPrimary: c.primary,
      colorInfo: c.primary,
      colorSuccess: c.success,
      colorWarning: c.warning,
      colorError: c.danger,
      colorLink: c.primary,
      colorLinkHover: c.primaryHover,
      colorBgLayout: c.bg,
      colorBgContainer: c.surface,
      colorBgElevated: c.surface,
      colorBgSpotlight: mode === "dark" ? "#3f3f46" : "#18181b",
      colorFillAlter: c.surface2,
      colorFillTertiary: c.surface2,
      colorFillSecondary: c.surface2,
      colorBorder: mode === "dark" ? "#3f3f46" : "#d4d4d8",
      colorBorderSecondary: c.border,
      colorSplit: c.border,
      colorText: c.text,
      colorTextHeading: c.text,
      colorTextSecondary: c.muted,
      colorTextTertiary: c.muted,
      colorTextDescription: c.muted,
      colorTextPlaceholder: mode === "dark" ? "#71717a" : "#a1a1aa",
      colorTextDisabled: mode === "dark" ? "#52525b" : "#a1a1aa",
      colorBgMask: mode === "dark" ? "rgba(0,0,0,0.65)" : "rgba(9,9,11,0.45)",
      fontFamily,
      fontSize: 14,
      lineHeight: 1.55,
      borderRadius: radius.control,
      borderRadiusLG: radius.card,
      borderRadiusSM: 6,
      controlHeight: height,
      controlHeightLG: height + 4,
      controlHeightSM: 32,
      boxShadow: mode === "dark" ? "0 8px 24px rgba(0,0,0,0.5)" : "0 8px 24px rgba(24,24,27,0.08)",
      boxShadowSecondary:
        mode === "dark" ? "0 12px 32px rgba(0,0,0,0.55)" : "0 12px 32px rgba(24,24,27,0.10)",
      wireframe: false,
      motion: !reducedMotion,
      motionDurationMid: "0.18s",
      motionDurationSlow: "0.24s",
    },
    components: {
      Button: {
        fontWeight: 500,
        primaryShadow: "none",
        defaultShadow: "none",
        dangerShadow: "none",
        paddingInline: 16,
        defaultBorderColor: mode === "dark" ? "#3f3f46" : "#e4e4e7",
      },
      Input: {
        activeShadow: focusRing,
        errorActiveShadow: "0 0 0 3px rgba(220,38,38,0.14)",
        paddingInline: 12,
      },
      InputNumber: { activeShadow: focusRing },
      Select: { optionSelectedBg: c.primarySoft, optionSelectedFontWeight: 500 },
      DatePicker: { activeShadow: focusRing },
      Card: { headerFontSize: 15, paddingLG: 20 },
      Table: {
        headerBg: c.surface2,
        headerColor: c.muted,
        headerSplitColor: "transparent",
        rowHoverBg: c.surface2,
        borderColor: c.border,
        cellPaddingBlock: 12,
        cellPaddingInline: 16,
        headerBorderRadius: radius.card,
      },
      Modal: { contentBg: c.surface, headerBg: c.surface, titleFontSize: 16 },
      Drawer: { colorBgElevated: c.surface },
      Tag: { defaultBg: c.surface2, defaultColor: c.text },
      Segmented: {
        trackBg: c.surface2,
        itemSelectedBg: c.surface,
        itemColor: c.muted,
        itemSelectedColor: c.text,
      },
      Steps: { dotSize: 8 },
      Tooltip: { colorBgSpotlight: mode === "dark" ? "#3f3f46" : "#18181b" },
      Form: { labelColor: c.text, labelFontSize: 13, verticalLabelPadding: "0 0 6px", itemMarginBottom: 20 },
      Dropdown: { paddingBlock: 8 },
      Menu: { itemBorderRadius: radius.control },
      Alert: { withDescriptionPadding: "14px 16px" },
      Upload: { actionsColor: c.muted },
    },
  };
}
