"use client";

import { Skeleton, Card, Row, Col } from "antd";
import { useThemeStore } from "@/lib/stores/themeStore";

export function TableSkeleton() {
  const { theme } = useThemeStore();
  return (
    <Card
      style={{
        background: theme === "dark" ? "#252836" : "#ffffff",
        border: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.06)",
        borderRadius: "12px",
        padding: "24px",
      }}
    >
      <Skeleton active paragraph={{ rows: 8 }} />
    </Card>
  );
}

export function CardSkeleton() {
  const { theme } = useThemeStore();
  return (
    <Card
      style={{
        background: theme === "dark" ? "#252836" : "#ffffff",
        border: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.06)",
        borderRadius: "12px",
        padding: "24px",
      }}
    >
      <Skeleton active />
    </Card>
  );
}

export function DashboardSkeleton() {
  const { theme } = useThemeStore();
  return (
    <div>
      <Skeleton.Input active size="large" style={{ width: 200, height: 32, marginBottom: 24 }} />
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[1, 2, 3, 4].map((i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card
              style={{
                background: theme === "dark" ? "#252836" : "#ffffff",
                border: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.06)",
                borderRadius: "12px",
              }}
            >
              <Skeleton active paragraph={{ rows: 2 }} />
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            style={{
              background: theme === "dark" ? "#252836" : "#ffffff",
              border: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.06)",
              borderRadius: "12px",
            }}
          >
            <Skeleton active paragraph={{ rows: 4 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            style={{
              background: theme === "dark" ? "#252836" : "#ffffff",
              border: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.06)",
              borderRadius: "12px",
            }}
          >
            <Skeleton active paragraph={{ rows: 4 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
