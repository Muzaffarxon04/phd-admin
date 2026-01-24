"use client";

import { Result, Button, Card } from "antd";
import { useThemeStore } from "@/lib/stores/themeStore";
import { ReloadOutlined } from "@ant-design/icons";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryText?: string;
}

export function ErrorState({ 
  title = "Xatolik yuz berdi", 
  description, 
  onRetry,
  retryText = "Qayta urinish"
}: ErrorStateProps) {
  const { theme } = useThemeStore();
  
  return (
    <Card
      style={{
        background: theme === "dark" ? "#252836" : "#ffffff",
        border: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.06)",
        borderRadius: "12px",
        padding: "48px 24px",
      }}
    >
      <Result
        status="error"
        title={
          <span style={{ color: theme === "dark" ? "#ffffff" : "#1a1a1a" }}>
            {title}
          </span>
        }
        subTitle={
          <span style={{ color: theme === "dark" ? "#8b8b8b" : "#666" }}>
            {description || "Iltimos, keyinroq qayta urinib ko'ring"}
          </span>
        }
        extra={
          onRetry && (
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={onRetry}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
              }}
            >
              {retryText}
            </Button>
          )
        }
      />
    </Card>
  );
}
