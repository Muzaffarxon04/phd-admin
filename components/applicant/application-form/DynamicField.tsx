"use client";

import { Checkbox, DatePicker, Input, InputNumber, Radio, Select, Upload, type UploadFile } from "antd";
import { EyeOutlined, PaperClipOutlined, UploadOutlined } from "@ant-design/icons";
import type { ApplicationField } from "@/lib/applicant/applications";
import type { PreviewFile } from "./FilePreview";

interface DynamicFieldProps {
  field: ApplicationField;
  onPreview?: (file: PreviewFile) => void;
  /** Injected by antd Form.Item */
  value?: unknown;
  onChange?: (value: unknown) => void;
  /** Injected for FILE fields (valuePropName="fileList") */
  fileList?: UploadFile[];
}

/** Input matching the backend `field_type`; all values are controlled by the surrounding Form.Item. */
export function DynamicField({ field, onPreview, value, onChange, fileList }: DynamicFieldProps) {
  const options = (field.options ?? []).map((o) => ({ value: o, label: o }));
  const common = { placeholder: field.placeholder, size: "large" as const };

  switch (field.field_type) {
    case "TEXTAREA":
      return (
        <Input.TextArea
          {...common}
          rows={4}
          value={value as string}
          onChange={(e) => onChange?.(e.target.value)}
          maxLength={field.max_length || undefined}
          showCount={!!field.max_length}
        />
      );
    case "EMAIL":
      return <Input {...common} type="email" inputMode="email" value={value as string} onChange={(e) => onChange?.(e.target.value)} placeholder={field.placeholder || "ism@misol.uz"} />;
    case "PHONE":
      return <Input {...common} type="tel" inputMode="tel" value={value as string} onChange={(e) => onChange?.(e.target.value)} placeholder={field.placeholder || "+998 90 123 45 67"} />;
    case "URL":
      return <Input {...common} type="url" inputMode="url" value={value as string} onChange={(e) => onChange?.(e.target.value)} placeholder={field.placeholder || "https://"} />;
    case "NUMBER":
      return (
        <InputNumber
          {...common}
          className="!w-full"
          value={value as number}
          onChange={(v) => onChange?.(v)}
          min={field.min_value ? parseFloat(field.min_value) : undefined}
          max={field.max_value ? parseFloat(field.max_value) : undefined}
        />
      );
    case "DATE":
      return <DatePicker {...common} className="w-full" format="DD.MM.YYYY" value={value as never} onChange={(v) => onChange?.(v)} />;
    case "SELECT":
      return <Select {...common} className="w-full" options={options} value={value as string} onChange={(v) => onChange?.(v)} placeholder={field.placeholder || "Tanlang"} />;
    case "RADIO":
      return (
        <Radio.Group value={value} onChange={(e) => onChange?.(e.target.value)} className="flex flex-col gap-2">
          {options.map((o) => (
            <Radio key={o.value} value={o.value}>
              {o.label}
            </Radio>
          ))}
        </Radio.Group>
      );
    case "CHECKBOX":
      return (
        <Checkbox.Group value={value as string[]} onChange={(v) => onChange?.(v)} className="flex flex-col gap-2">
          {options.map((o) => (
            <Checkbox key={o.value} value={o.value}>
              {o.label}
            </Checkbox>
          ))}
        </Checkbox.Group>
      );
    case "FILE":
      return (
        <Upload
          fileList={fileList}
          onChange={(info) => onChange?.(info.fileList)}
          beforeUpload={() => false}
          maxCount={1}
          accept={field.allowed_file_types?.map((t) => `.${t}`).join(",")}
          onPreview={(f) => {
            const file = f.originFileObj as File | undefined;
            if (file && onPreview) onPreview({ name: f.name, file });
          }}
          showUploadList={{ showPreviewIcon: true, showRemoveIcon: true, previewIcon: <EyeOutlined /> }}
          className="block w-full [&_.ant-upload-select]:block"
        >
          <div className="flex h-11 w-full cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-surface px-3 text-sm text-muted hover:border-primary/50">
            <UploadOutlined className="text-primary" />
            <span className="min-w-0 flex-1 truncate">Faylni tanlang</span>
            <PaperClipOutlined />
          </div>
        </Upload>
      );
    case "TEXT":
    default:
      return (
        <Input
          {...common}
          value={value as string}
          onChange={(e) => onChange?.(e.target.value)}
          maxLength={field.max_length || undefined}
        />
      );
  }
}
