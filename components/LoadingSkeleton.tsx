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

export function ApplicationCardSkeleton() {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        background: isDark ? "rgb(40, 48, 70)" : "rgba(255, 255, 255, 0.98)",
        border: isDark ? "1px solid rgb(59, 66, 83)" : "1px solid rgb(235, 233, 241)",
      }}
    >
      {/* Header */}
      <div className="p-6 flex justify-between items-center border-b" style={{ borderColor: isDark ? "rgb(59, 66, 83)" : "rgb(235, 233, 241)" }}>
        <Skeleton.Input active size="small" style={{ width: 140 }} />
        <Skeleton.Button active size="small" shape="round" style={{ width: 80 }} />
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">
        <Skeleton.Button active size="small" shape="round" style={{ width: 100, marginBottom: 8 }} />
        <Skeleton active paragraph={{ rows: 2 }} title={false} />

        <div className="space-y-3 mt-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between items-center py-1 border-b" style={{ borderColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)" }}>
              <Skeleton.Input active size="small" style={{ width: 80, height: 16 }} />
              <Skeleton.Input active size="small" style={{ width: 100, height: 16 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-5 border-t" style={{ background: isDark ? "rgba(0, 0, 0, 0.1)" : "rgba(0, 0, 0, 0.02)", borderColor: isDark ? "rgb(59, 66, 83)" : "rgb(235, 233, 241)" }}>
        <div className="flex justify-between items-center mb-3">
          <Skeleton.Input active size="small" style={{ width: 50, height: 12 }} />
          <Skeleton.Input active size="small" style={{ width: 30, height: 12 }} />
        </div>
        <Skeleton.Button active block style={{ height: 8, borderRadius: 4, marginBottom: 16 }} />
        <Skeleton.Button active block style={{ height: 40, borderRadius: 8 }} />
      </div>
    </div>
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
