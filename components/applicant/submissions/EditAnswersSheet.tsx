"use client";

import { useEffect } from "react";
import { Button, Form } from "antd";
import type { ApplicationField } from "@/lib/applicant/applications";
import { editInitialValues, type SubmissionAnswer } from "@/lib/applicant/submissions";
import { Sheet } from "@/components/applicant/ui/Sheet";
import { DynamicField } from "@/components/applicant/application-form/DynamicField";
import type { PreviewFile } from "@/components/applicant/application-form/FilePreview";

interface EditAnswersSheetProps {
  open: boolean;
  fields: ApplicationField[];
  answers: SubmissionAnswer[];
  resolve: (path: string) => string | null;
  saving: boolean;
  onClose: () => void;
  onSave: (values: Record<string, unknown>) => void;
  onPreview: (file: PreviewFile) => void;
}

/** Edit a draft's answers; reuses the same field renderer as the application form. */
export function EditAnswersSheet({ open, fields, answers, resolve, saving, onClose, onSave, onPreview }: EditAnswersSheetProps) {
  const [form] = Form.useForm();
  const sorted = [...fields].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  useEffect(() => {
    if (open) form.setFieldsValue(editInitialValues(answers, fields, resolve));
  }, [open, answers, fields, resolve, form]);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Javoblarni tahrirlash"
      width={720}
      footer={
        <div className="flex gap-2 sm:justify-end">
          <Button onClick={onClose} disabled={saving} className="flex-1 sm:flex-none">
            Bekor qilish
          </Button>
          <Button type="primary" onClick={() => form.submit()} loading={saving} className="flex-1 sm:flex-none">
            Saqlash
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" onFinish={onSave} className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
        {sorted.map((field) => {
          const isFile = field.field_type === "FILE";
          return (
            <Form.Item
              key={field.id}
              name={`field_${field.id}`}
              label={<span className="break-words">{field.label}</span>}
              required={field.required}
              rules={[{ required: field.required, message: `"${field.label}" to'ldirilishi shart` }]}
              valuePropName={isFile ? "fileList" : "value"}
              getValueFromEvent={isFile ? (e) => (Array.isArray(e) ? e : e?.fileList) : undefined}
              className={field.field_type === "TEXTAREA" ? "sm:col-span-2" : undefined}
            >
              <DynamicField field={field} onPreview={onPreview} />
            </Form.Item>
          );
        })}
      </Form>
    </Sheet>
  );
}
