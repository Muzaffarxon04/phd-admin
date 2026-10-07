"use client";

import { Form, Input, DatePicker, Select } from "antd";
import { getApplicationStatusLabel } from "@/lib/utils";

/**
 * Fields of the "Arizani Tahrirlash" modal (title, description, dates, status).
 * Shared by the applications list and the application detail page. Must be
 * rendered inside an antd <Form>; the exam-date guard reads that form's
 * `end_date` exactly as before.
 */
export function ApplicationEditFields() {
  const form = Form.useFormInstance();

  return (
    <>
      <Form.Item name="title" label="Ariza nomi" rules={[{ required: true, message: "Ariza nomini kiriting!" }]}>
        <Input placeholder="Ariza nomi" />
      </Form.Item>

      <Form.Item name="description" label="Tavsif" rules={[{ required: true, message: "Tavsifni kiriting!" }]}>
        <Input.TextArea rows={4} placeholder="Ariza tavsifi" />
      </Form.Item>

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <Form.Item
          name="start_date"
          label="Boshlanish sanasi"
          rules={[{ required: true, message: "Boshlanish sanasini tanlang!" }]}
        >
          <DatePicker className="w-full" format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item
          name="end_date"
          label="Tugash sanasi"
          rules={[{ required: true, message: "Tugash sanasini tanlang!" }]}
        >
          <DatePicker className="w-full" format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item name="exam_date" label="Imtihon sanasi">
          <DatePicker
            className="w-full"
            format="YYYY-MM-DD"
            disabledDate={(current) =>
              current && form.getFieldValue("end_date")
                ? current.isBefore(form.getFieldValue("end_date"), "day")
                : false
            }
          />
        </Form.Item>

        <Form.Item name="status" label="Holati" rules={[{ required: true, message: "Holatni tanlang!" }]}>
          <Select placeholder="Holatni tanlang">
            <Select.Option value="DRAFT">{getApplicationStatusLabel("DRAFT")}</Select.Option>
            <Select.Option value="PUBLISHED">{getApplicationStatusLabel("PUBLISHED")}</Select.Option>
            <Select.Option value="CLOSED">{getApplicationStatusLabel("CLOSED")}</Select.Option>
            <Select.Option value="ARCHIVED">{getApplicationStatusLabel("ARCHIVED")}</Select.Option>
          </Select>
        </Form.Item>
      </div>
    </>
  );
}
