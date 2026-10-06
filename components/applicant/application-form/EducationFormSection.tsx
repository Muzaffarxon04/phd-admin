"use client";

import { Form, Radio } from "antd";
import { EDUCATION_FORMS } from "@/lib/applicant/applications";
import { Card } from "@/components/applicant/ui/Card";

/** Ta'lim shakli — one required radio group, stored in the form as `education_form`. */
export function EducationFormSection() {
  return (
    <Card title="Ta'lim shakli" description="Qaysi shakl bo'yicha hujjat topshirayotganingizni tanlang">
      <Form.Item
        name="education_form"
        rules={[{ required: true, message: "Iltimos, ta'lim shaklini tanlang!" }]}
        className="!mb-0"
      >
        <Radio.Group className="flex w-full flex-col gap-2">
          {EDUCATION_FORMS.map((o) => (
            <Radio
              key={o.value}
              value={o.value}
              className="!m-0 w-full rounded-lg border border-border px-3 py-2.5 hover:border-primary/40 [&.ant-radio-wrapper-checked]:border-primary [&.ant-radio-wrapper-checked]:bg-primary-soft/40"
            >
              <span className="text-sm text-text">{o.label}</span>
            </Radio>
          ))}
        </Radio.Group>
      </Form.Item>
    </Card>
  );
}
