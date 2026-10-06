"use client";

import { Form } from "antd";
import type { ApplicationField } from "@/lib/applicant/applications";
import { Card } from "@/components/applicant/ui/Card";
import { DynamicField } from "./DynamicField";
import type { PreviewFile } from "./FilePreview";

interface DynamicFieldsSectionProps {
  fields: ApplicationField[];
  onPreview: (file: PreviewFile) => void;
}

function fileHint(field: ApplicationField): string | undefined {
  if (field.field_type !== "FILE") return undefined;
  const parts: string[] = [];
  if (field.allowed_file_types?.length) parts.push(field.allowed_file_types.map((t) => t.toUpperCase()).join(", "));
  if (field.max_file_size) {
    const mb = field.max_file_size >= 1024 * 1024 ? Math.round(field.max_file_size / (1024 * 1024)) : field.max_file_size;
    parts.push(`${mb} MB gacha`);
  }
  return parts.join(" · ") || undefined;
}

/** Announcement-specific questions and document uploads, two columns on ≥768px. */
export function DynamicFieldsSection({ fields, onPreview }: DynamicFieldsSectionProps) {
  const sorted = [...fields].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  if (sorted.length === 0) return null;

  return (
    <Card title="Ariza ma'lumotlari" description="Yulduzcha (*) bilan belgilangan maydonlar majburiy">
      <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
        {sorted.map((field) => {
          const isFile = field.field_type === "FILE";
          const wide = field.field_type === "TEXTAREA";
          const hint = [field.help_text, fileHint(field)].filter(Boolean).join(" · ");
          return (
            <Form.Item
              key={field.id}
              name={`field_${field.id}`}
              label={<span className="break-words">{field.label}</span>}
              required={field.required}
              extra={hint || undefined}
              rules={[{ required: field.required, message: `"${field.label}" maydonini to'ldirish majburiy` }]}
              valuePropName={isFile ? "fileList" : "value"}
              getValueFromEvent={isFile ? (e) => (Array.isArray(e) ? e : e?.fileList) : undefined}
              className={wide ? "md:col-span-2" : undefined}
            >
              <DynamicField field={field} onPreview={onPreview} />
            </Form.Item>
          );
        })}
      </div>
    </Card>
  );
}
