"use client";

import { Empty } from "antd";
import { useThemeStore } from "@/lib/stores/themeStore";

interface EmptyStateProps {
  description?: string;
  image?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ description, image, action }: EmptyStateProps) {
  const { theme } = useThemeStore();

  return (
    <div
      style={{
        padding: "48px 24px",
        textAlign: "center",
        background: theme === "dark" ? "#252836" : "#ffffff",
        borderRadius: "12px",
        border: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.06)",
      }}
    >
      <Empty
        description={
          <span style={{ color: theme === "dark" ? "#8b8b8b" : "#666" }}>
            {description || "Ma'lumotlar mavjud emas"}
          </span>
        }
        image={image || Empty.PRESENTED_IMAGE_SIMPLE}
        imageStyle={{
          height: 120,
          opacity: theme === "dark" ? 0.5 : 0.8,
        }}
      >
        {action}
      </Empty>
    </div>
  );
}
