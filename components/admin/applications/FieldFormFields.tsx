"use client";

import { Form, Input, InputNumber, Select, Switch, Button } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { getFieldTypeLabel } from "@/lib/utils";

/**
 * Inputs of the "Yangi Maydon Qoshish / Maydonni Tahrirlash" modal.
 * Must be rendered inside the field <Form>; `fieldType` is the watched
 * `field_type` value of that form.
 */
export function FieldFormFields({ fieldType }: { fieldType?: string }) {
  const form = Form.useFormInstance();

  return (
    <>
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <Form.Item name="label" label="Maydon nomi" rules={[{ required: true, message: "Maydon nomini kiriting!" }]}>
          <Input placeholder="Masalan: Research Topic" />
        </Form.Item>

        <Form.Item name="field_type" label="Maydon turi" rules={[{ required: true, message: "Maydon turini tanlang!" }]}>
          <Select
            placeholder="Maydon turini tanlang"
            onChange={(value) => {
              // Clear options_list if field type is not SELECT, RADIO, or CHECKBOX
              if (value !== "SELECT" && value !== "RADIO" && value !== "CHECKBOX") {
                form.setFieldValue("options_list", undefined);
              } else if (!form.getFieldValue("options_list") || form.getFieldValue("options_list").length === 0) {
                form.setFieldValue("options_list", [{ value: "" }]);
              }
            }}
          >
            <Select.Option value="TEXT">{getFieldTypeLabel("TEXT")}</Select.Option>
            <Select.Option value="TEXTAREA">{getFieldTypeLabel("TEXTAREA")}</Select.Option>
            <Select.Option value="EMAIL">{getFieldTypeLabel("EMAIL")}</Select.Option>
            <Select.Option value="PHONE">{getFieldTypeLabel("PHONE")}</Select.Option>
            <Select.Option value="NUMBER">{getFieldTypeLabel("NUMBER")}</Select.Option>
            <Select.Option value="DATE">{getFieldTypeLabel("DATE")}</Select.Option>
            <Select.Option value="SELECT">{getFieldTypeLabel("SELECT")}</Select.Option>
            <Select.Option value="RADIO">{getFieldTypeLabel("RADIO")}</Select.Option>
            <Select.Option value="CHECKBOX">{getFieldTypeLabel("CHECKBOX")}</Select.Option>
            <Select.Option value="FILE">{getFieldTypeLabel("FILE")}</Select.Option>
            <Select.Option value="URL">{getFieldTypeLabel("URL")}</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="placeholder" label="Placeholder">
          <Input placeholder="Placeholder matni" />
        </Form.Item>

        <Form.Item name="required" label="Majburiy" valuePropName="checked" initialValue={false}>
          <Switch checkedChildren="Ha" unCheckedChildren="Yoq" />
        </Form.Item>
      </div>

      <Form.Item name="help_text" label="Yordam matni">
        <Input.TextArea rows={2} placeholder="Foydalanuvchiga korsatma" />
      </Form.Item>

      {fieldType === "FILE" && (
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Form.Item
            name="allowed_file_types_input"
            label="Ruxsat etilgan fayl formatlari"
            help="Formatlarni vergul bilan ajrating. Masalan: pdf, doc, docx, jpg"
          >
            <Input placeholder="pdf, doc, docx, jpg, png" />
          </Form.Item>
          <Form.Item
            name="max_file_size"
            label="Maksimal fayl hajmi (MB)"
            rules={[{ type: "number", min: 1, message: "Fayl hajmi kamida 1 MB bolishi kerak!" }]}
          >
            <InputNumber className="w-full" placeholder="Masalan: 10" min={1} addonAfter="MB" />
          </Form.Item>
        </div>
      )}

      {fieldType === "NUMBER" && (
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Form.Item name="min_value" label="Minimal qiymat">
            <InputNumber className="w-full" placeholder="Minimal qiymat" />
          </Form.Item>
          <Form.Item name="max_value" label="Maksimal qiymat">
            <InputNumber className="w-full" placeholder="Maksimal qiymat" />
          </Form.Item>
        </div>
      )}

      {(fieldType === "SELECT" || fieldType === "RADIO" || fieldType === "CHECKBOX") && (
        <Form.Item label="Variantlar (Options)">
          <Form.List name="options_list" initialValue={[{ value: "" }]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="mb-2 flex items-start gap-2">
                    <Form.Item
                      {...restField}
                      name={[name, "value"]}
                      rules={[{ required: true, message: "Variant qiymatini kiriting!" }]}
                      className="mb-0! min-w-0 flex-1"
                    >
                      <Input placeholder="Variant qiymati" />
                    </Form.Item>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        aria-label="Variantni olib tashlash"
                        onClick={() => remove(name)}
                        className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-base text-[#ff4d4f] hover:bg-red-500/10 sm:h-10 sm:w-10"
                      >
                        <MinusCircleOutlined />
                      </button>
                    )}
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} className="min-h-[44px] sm:min-h-0">
                  Variant qo&apos;shish
                </Button>
              </>
            )}
          </Form.List>
        </Form.Item>
      )}

      {(fieldType === "TEXT" ||
        fieldType === "TEXTAREA" ||
        fieldType === "EMAIL" ||
        fieldType === "PHONE" ||
        fieldType === "URL") && (
        <div className="grid grid-cols-2 gap-x-4">
          <Form.Item name="min_length" label="Minimal uzunlik">
            <InputNumber className="w-full" placeholder="Minimal uzunlik" min={0} />
          </Form.Item>
          <Form.Item name="max_length" label="Maksimal uzunlik">
            <InputNumber className="w-full" placeholder="Maksimal uzunlik" min={0} />
          </Form.Item>
        </div>
      )}
    </>
  );
}
