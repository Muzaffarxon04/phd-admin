"use client";

import type { DragEvent } from "react";
import { Input, InputNumber, DatePicker, Select, Radio, Checkbox, Upload, Button, Tag } from "antd";
import { EditOutlined, DeleteOutlined, HolderOutlined, ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { getFieldTypeLabel } from "@/lib/utils";
import { IconAction, InfoItem, useAdminSurface } from "./ui";

export type ApplicationFieldType =
  | "TEXT"
  | "TEXTAREA"
  | "EMAIL"
  | "PHONE"
  | "NUMBER"
  | "DATE"
  | "SELECT"
  | "RADIO"
  | "CHECKBOX"
  | "FILE"
  | "URL";

export interface ApplicationField {
  id: number;
  label: string;
  field_type: ApplicationFieldType;
  help_text?: string;
  placeholder?: string;
  required?: boolean;
  options?: unknown;
  min_length?: number;
  max_length?: number;
  min_value?: string;
  max_value?: string;
  allowed_file_types?: string[];
  max_file_size?: number;
  order?: number;
}

/** Read-only preview of how the field will look for applicants. */
export const renderFieldInput = (field: ApplicationField) => {
  const options = Array.isArray(field.options) ? field.options : [];

  switch (field.field_type) {
    case "TEXT":
      return <Input placeholder={field.placeholder || "Matn kiriting"} readOnly className="w-full" />;

    case "TEXTAREA":
      return <Input.TextArea placeholder={field.placeholder || "Matn kiriting"} rows={4} readOnly className="w-full" />;

    case "EMAIL":
      return <Input type="email" placeholder={field.placeholder || "email@example.com"} readOnly className="w-full" />;

    case "PHONE":
      return <Input type="tel" placeholder={field.placeholder || "+998901234567"} className="w-full" />;

    case "NUMBER":
      return (
        <InputNumber
          placeholder={field.placeholder || "Raqam kiriting"}
          className="w-full"
          min={field.min_value ? parseFloat(field.min_value) : undefined}
          max={field.max_value ? parseFloat(field.max_value) : undefined}
        />
      );

    case "DATE":
      return <DatePicker placeholder={field.placeholder || "Sanani tanlang"} className="w-full" />;

    case "SELECT":
      return (
        <Select
          placeholder={field.placeholder || "Tanlang"}
          className="w-full"
          options={options.map((opt: string) => ({ label: opt, value: opt }))}
        />
      );

    case "RADIO":
      return (
        <Radio.Group className="flex flex-wrap gap-y-2">
          {options.map((opt: string, index: number) => (
            <Radio key={index} value={opt}>
              {opt}
            </Radio>
          ))}
        </Radio.Group>
      );

    case "CHECKBOX":
      return (
        <Checkbox.Group className="flex flex-wrap gap-y-2">
          {options.map((opt: string, index: number) => (
            <Checkbox key={index} value={opt}>
              {opt}
            </Checkbox>
          ))}
        </Checkbox.Group>
      );

    case "FILE":
      return (
        <Upload>
          <Button>Fayl yuklash</Button>
        </Upload>
      );

    case "URL":
      return <Input type="url" placeholder={field.placeholder || "https://example.com"} className="w-full" />;

    default:
      return <Input placeholder={field.placeholder || "Qiymat kiriting"} className="w-full" />;
  }
};

interface ApplicationFieldCardProps {
  field: ApplicationField;
  isDragOver: boolean;
  onDragStart: () => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: DragEvent<HTMLDivElement>) => void;
  onDrop: () => void;
  onEdit: () => void;
  onDelete: () => void;
  /** Touch-friendly reordering (drag & drop does not work on phones). */
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export function ApplicationFieldCard({
  field,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: ApplicationFieldCardProps) {
  const s = useAdminSurface();

  const details: Array<[string, string | number]> = [];
  if (field.help_text) details.push(["Yordamchi matn", field.help_text]);
  if (field.placeholder) details.push(["O'rnib", field.placeholder]);
  if (field.min_length !== null && field.min_length !== undefined) details.push(["Minimal uzunlik", field.min_length]);
  if (field.max_length !== null && field.max_length !== undefined) details.push(["Maksimal uzunlik", field.max_length]);
  if (field.min_value) details.push(["Minimal qiymat", field.min_value]);
  if (field.max_value) details.push(["Maksimal qiymat", field.max_value]);
  if (field.allowed_file_types && field.allowed_file_types.length > 0)
    details.push(["Ruxsat etilgan fayl turlari", field.allowed_file_types.join(", ")]);
  if (field.max_file_size !== null && field.max_file_size !== undefined)
    details.push(["Maksimal fayl hajmi", `${field.max_file_size} MB`]);
  if (Array.isArray(field.options) && field.options.length > 0)
    details.push(["Variantlar", (field.options as string[]).map(String).join(", ")]);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className="cursor-move rounded-xl p-4 transition-colors"
      style={{
        background: s.subtleBg,
        border: `1px ${isDragOver ? "dashed" : "solid"} ${isDragOver ? "#7367f0" : s.subtleBorder}`,
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-2">
          <HolderOutlined
            className="mt-1 hidden sm:inline-flex"
            style={{ cursor: "grab", fontSize: 18, color: "#9ca3af" }}
          />
          <div className="min-w-0">
            <div className="break-words text-base font-semibold" style={{ color: s.heading }}>
              {field.label}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-y-1">
              {field.required && <Tag color="red">Majburiy</Tag>}
              <Tag>{getFieldTypeLabel(field.field_type)}</Tag>
              {field.order !== undefined && field.order !== null && <Tag color="blue">Tartib: {field.order}</Tag>}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          {(onMoveUp || onMoveDown) && (
            <div className="flex gap-2 sm:hidden">
              <IconAction tone="neutral" icon={<ArrowUpOutlined />} label="Yuqoriga" onClick={onMoveUp} />
              <IconAction tone="neutral" icon={<ArrowDownOutlined />} label="Pastga" onClick={onMoveDown} />
            </div>
          )}
          <IconAction tone="primary" icon={<EditOutlined />} label="Tahrirlash" onClick={onEdit} />
          <IconAction tone="danger" icon={<DeleteOutlined />} label="O'chirish" onClick={onDelete} />
        </div>
      </div>

      {details.length > 0 && (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {details.map(([label, value]) => (
            <InfoItem key={label} label={label}>
              {value}
            </InfoItem>
          ))}
        </div>
      )}

      <div className="mt-3 max-w-xl">{renderFieldInput(field)}</div>
    </div>
  );
}
