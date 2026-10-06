"use client";

import { useEffect } from "react";
import { Button, Form, Input } from "antd";
import { EDITABLE_FIELDS, type EditableField } from "@/lib/applicant/profile";
import { Sheet } from "@/components/applicant/ui/Sheet";
import type { ApplicantProfile } from "@/types";

export type EditProfileValues = Partial<Record<EditableField, string>>;

interface EditProfileSheetProps {
  open: boolean;
  profile: ApplicantProfile | undefined;
  saving: boolean;
  onClose: () => void;
  onSave: (values: EditProfileValues) => void;
}

const LABELS: Record<EditableField, string> = {
  email: "Elektron pochta",
  organization: "Tashkilot (ish joyi)",
  permanent_address: "Doimiy yashash manzili",
};

/** Only the fields that do not come from TSMU ID are editable. */
export function EditProfileSheet({ open, profile, saving, onClose, onSave }: EditProfileSheetProps) {
  const [form] = Form.useForm<EditProfileValues>();

  useEffect(() => {
    if (!open || !profile) return;
    const values: EditProfileValues = {};
    for (const f of EDITABLE_FIELDS) values[f] = (profile[f] as string | null | undefined) ?? "";
    form.setFieldsValue(values);
  }, [open, profile, form]);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Profilni tahrirlash"
      width={480}
      footer={
        <div className="flex gap-2 sm:justify-end">
          <Button onClick={onClose} className="flex-1 sm:flex-none" disabled={saving}>
            Bekor qilish
          </Button>
          <Button type="primary" onClick={() => form.submit()} loading={saving} className="flex-1 sm:flex-none">
            Saqlash
          </Button>
        </div>
      }
    >
      <p className="mb-4 text-[13px] leading-5 text-muted">
        Ism, pasport va tug&apos;ilgan sana kabi ma&apos;lumotlar TSMU ID orqali olinadi va bu yerda
        o&apos;zgartirilmaydi.
      </p>
      <Form form={form} layout="vertical" onFinish={onSave} requiredMark={false}>
        <Form.Item name="email" label={LABELS.email} rules={[{ type: "email", message: "Elektron pochta noto'g'ri" }]}>
          <Input inputMode="email" autoComplete="email" placeholder="ism@misol.uz" />
        </Form.Item>
        <Form.Item name="organization" label={LABELS.organization}>
          <Input placeholder="Toshkent tibbiyot akademiyasi" />
        </Form.Item>
        <Form.Item name="permanent_address" label={LABELS.permanent_address} className="!mb-0">
          <Input.TextArea rows={3} placeholder="Viloyat, tuman, ko'cha, uy" />
        </Form.Item>
      </Form>
    </Sheet>
  );
}
