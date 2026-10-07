"use client";

import { Button, Popconfirm, Tooltip } from "antd";
import type { ReactNode } from "react";
import { EditOutlined, DeleteOutlined, LineChartOutlined, ProjectOutlined } from "@ant-design/icons";
import { useAdminSurface } from "@/components/admin/submissions/AdminUi";

const TONES = {
  primary: "115, 103, 240",
  blue: "59, 130, 246",
  purple: "168, 85, 247",
  red: "239, 68, 68",
} as const;

function IconAction({
  tone,
  icon,
  label,
  onClick,
  size,
}: {
  tone: keyof typeof TONES;
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  size: number;
}) {
  const { isDark } = useAdminSurface();
  const rgb = TONES[tone];
  const rest = `rgba(${rgb}, ${isDark ? 0.2 : 0.1})`;
  return (
    <Tooltip title={label}>
      <Button
        aria-label={label}
        onClick={onClick}
        icon={icon}
        className="!flex shrink-0 items-center justify-center !rounded-xl !border-0 shadow-sm transition-all duration-200 hover:!text-white"
        style={{ width: size, height: size, fontSize: 18, background: rest, color: `rgb(${rgb})` }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `rgb(${rgb})`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = rest;
        }}
      />
    </Tooltip>
  );
}

/** Edit / statistics / workload / delete actions for an examiner row or card. */
export function ExaminerRowActions({
  onEdit,
  onStats,
  onWorkload,
  onDelete,
  size = 40,
  className = "flex items-center justify-center gap-2 py-2",
}: {
  onEdit: () => void;
  onStats: () => void;
  onWorkload: () => void;
  onDelete: () => void;
  size?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <IconAction tone="primary" icon={<EditOutlined />} label="Tahrirlash" onClick={onEdit} size={size} />
      <IconAction tone="blue" icon={<LineChartOutlined />} label="Statistika" onClick={onStats} size={size} />
      <IconAction tone="purple" icon={<ProjectOutlined />} label="Yuklama" onClick={onWorkload} size={size} />
      <Popconfirm
        title="O&apos;chirish"
        description="Haqiqatan ham o&apos;chirmoqchimisiz?"
        onConfirm={onDelete}
        okText="Ha"
        cancelText="Yo&apos;q"
        overlayClassName="premium-popconfirm"
      >
        <span>
          <IconAction tone="red" icon={<DeleteOutlined />} label="O'chirish" size={size} />
        </span>
      </Popconfirm>
    </div>
  );
}
