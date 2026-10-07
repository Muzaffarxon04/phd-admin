"use client";

import type { ReactNode } from "react";
import { Form, Input, Select, Upload, Button } from "antd";
import { PlusOutlined, MinusCircleOutlined, UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import type { Speciality, Examiner } from "@/types";
import { getExaminerRoleLabel } from "@/lib/utils";
import { IconAction, useAdminSurface } from "./ui";

interface SpecialityExaminersListProps {
  /** Key used for the examiner list inside each speciality item (`examiners` on create, `examiner_ids` on update). */
  examinersKey: "examiners" | "examiner_ids";
  specialitiesList: Speciality[];
  examinersList: Examiner[];
  /** Optional extra content above the file input (e.g. link to the existing file). */
  renderBeforeFile?: (name: number) => ReactNode;
  /** Header text; omitted when the parent already renders a heading. */
  heading?: ReactNode;
}

/**
 * `Form.List name="specialities"` editor: speciality select, examiners with
 * roles, an optional file and a comment per speciality. Field names, rules and
 * value transforms are identical to the original inline implementations.
 */
export function SpecialityExaminersList({
  examinersKey,
  specialitiesList,
  examinersList,
  renderBeforeFile,
  heading,
}: SpecialityExaminersListProps) {
  const s = useAdminSurface();

  return (
    <Form.List name="specialities">
      {(fields, { add, remove }) => (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {heading ? (
              <span className="text-base font-semibold" style={{ color: s.heading }}>
                {heading}
              </span>
            ) : (
              <span className="text-sm" style={{ color: s.muted }}>
                {fields.length > 0 ? `${fields.length} ta mutaxassislik` : ""}
              </span>
            )}
            <Button
              type="dashed"
              onClick={() => add()}
              icon={<PlusOutlined />}
              className="min-h-[44px] w-full sm:min-h-0 sm:w-auto"
            >
              Mutaxassislik qo&apos;shish
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map(({ key, name, ...restField }, index) => (
              <div
                key={key}
                className="rounded-xl p-3 sm:p-4"
                style={{ background: s.subtleBg, border: `1px solid ${s.subtleBorder}` }}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span
                    className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold"
                    style={{ background: "rgba(115, 103, 240, 0.12)", color: "#7367f0" }}
                  >
                    #{index + 1}
                  </span>
                  <IconAction tone="danger" icon={<DeleteOutlined />} label="O'chirish" onClick={() => remove(name)} />
                </div>

                <Form.Item
                  {...restField}
                  name={[name, "speciality_id"]}
                  label="Mutaxassislik"
                  rules={[{ required: true, message: "Mutaxassislikni tanlang!" }]}
                >
                  <Select
                    placeholder="Mutaxassislikni tanlang"
                    showSearch
                    optionFilterProp="children"
                    className="premium-select"
                  >
                    {specialitiesList.map((sp: Speciality) => (
                      <Select.Option key={sp.id} value={sp.id}>
                        {sp.code} - {sp.name}
                        {sp.is_foreign ? " (Chet tili)" : ""}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  {...restField}
                  name={[name, examinersKey]}
                  label="Imtihonchilar va rollari"
                  rules={[{ required: true, message: "Imtihonchilarni va rollarini kiriting!" }]}
                >
                  <Form.List name={[name, examinersKey]}>
                    {(examinerFields, { add: addExaminer, remove: removeExaminer }) => (
                      <>
                        {examinerFields.map((examinerField) => {
                          const { key: fieldKey, ...restExaminerField } = examinerField;
                          return (
                            <div
                              key={fieldKey}
                              className="mb-2 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto]"
                            >
                              <Form.Item
                                {...restExaminerField}
                                name={[examinerField.name, "examiner_id"]}
                                rules={[{ required: true, message: "Imtihonchini tanlang!" }]}
                                className="mb-2! sm:mb-0!"
                              >
                                <Select
                                  className="w-full"
                                  placeholder="Imtihonchini tanlang"
                                  showSearch
                                  optionFilterProp="children"
                                >
                                  {examinersList.map((e: Examiner) => (
                                    <Select.Option key={e.id} value={e.id}>
                                      {e.full_name}
                                    </Select.Option>
                                  ))}
                                </Select>
                              </Form.Item>
                              <Form.Item
                                {...restExaminerField}
                                name={[examinerField.name, "role"]}
                                rules={[{ required: true, message: "Rolni tanlang!" }]}
                                className="col-start-1 row-start-2 mb-0! sm:col-start-auto sm:row-start-auto"
                              >
                                <Select className="w-full" placeholder="Rol">
                                  <Select.Option value="CHAIRMAN">{getExaminerRoleLabel("CHAIRMAN")}</Select.Option>
                                  <Select.Option value="PRE_CHAIRMAN">{getExaminerRoleLabel("PRE_CHAIRMAN")}</Select.Option>
                                  <Select.Option value="SECRETARY">{getExaminerRoleLabel("SECRETARY")}</Select.Option>
                                  <Select.Option value="MEMBER">{getExaminerRoleLabel("MEMBER")}</Select.Option>
                                </Select>
                              </Form.Item>
                              <button
                                type="button"
                                aria-label="Imtihonchini olib tashlash"
                                onClick={() => removeExaminer(examinerField.name)}
                                className="row-span-2 inline-flex h-11 w-11 cursor-pointer items-center justify-center self-center rounded-lg border-0 bg-transparent text-lg text-red-500 hover:bg-red-500/10 sm:row-span-1 sm:h-8 sm:w-8 sm:self-start"
                              >
                                <MinusCircleOutlined />
                              </button>
                              {/* visual separator between examiners on phones */}
                              <div className="col-span-2 mb-1 mt-2 h-px sm:hidden" style={{ background: s.subtleBorder }} />
                            </div>
                          );
                        })}
                        <Button
                          type="dashed"
                          onClick={() => addExaminer()}
                          block
                          icon={<PlusOutlined />}
                          className="min-h-[44px] sm:min-h-0"
                        >
                          Imtihonchi qo&apos;shish
                        </Button>
                      </>
                    )}
                  </Form.List>
                </Form.Item>

                {renderBeforeFile?.(name)}

                <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
                  <Form.Item
                    {...restField}
                    name={[name, "file"]}
                    label="Fayl (ixtiyoriy)"
                    getValueFromEvent={(e) => e?.fileList?.[0]?.originFileObj ?? undefined}
                    getValueProps={(value: File | undefined) => ({
                      fileList: value
                        ? [{ uid: "-1", name: value.name, status: "done" as const, originFileObj: value }]
                        : [],
                    })}
                    className="[&_.ant-upload-list-item-name]:break-all"
                  >
                    <Upload maxCount={1} beforeUpload={() => false} accept="*">
                      <Button icon={<UploadOutlined />} className="min-h-[44px] sm:min-h-0">
                        Fayl tanlash
                      </Button>
                    </Upload>
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "comment"]}
                    label="Izoh (ushbu mutaxassislik uchun)"
                    className="mb-0!"
                  >
                    <Input.TextArea rows={2} placeholder="Izoh (ixtiyoriy)" />
                  </Form.Item>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Form.List>
  );
}
