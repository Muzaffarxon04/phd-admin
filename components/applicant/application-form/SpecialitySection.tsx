"use client";

import { Button, Checkbox, Select } from "antd";
import { EyeOutlined, FileTextOutlined } from "@ant-design/icons";
import { useGet } from "@/lib/hooks";
import type { SpecialitySelection } from "@/lib/applicant/applications";
import type { Speciality } from "@/types";
import { Card } from "@/components/applicant/ui/Card";
import { downloadFile, type PreviewFile } from "./FilePreview";

interface RelatedSpeciality {
  id: number;
  name: string;
  code: string;
}

interface SpecialitySectionProps {
  applicationId: number;
  specialities: Speciality[];
  value: SpecialitySelection;
  onChange: (next: SpecialitySelection) => void;
  onPreview: (file: PreviewFile) => void;
  /** Shown under the card when the user tried to submit without a speciality. */
  error?: string | null;
}

function specialityLabel(spec: Speciality): string {
  const withParent = spec as unknown as { parent?: { name?: string }; parent_name?: string };
  const parent = withParent.parent?.name || withParent.parent_name || "";
  const base = `${spec.code} - ${spec.name}`;
  return parent ? `${base} => (${parent})` : base;
}

/** Related list for a speciality: `{foreign_specialities}` or `{other_specialities}`. */
function useRelated<K extends "foreign_specialities" | "other_specialities">(
  key: K,
  specialityId: string | number | null,
  applicationId: number
): RelatedSpeciality[] {
  const { data } = useGet<{ data?: Partial<Record<K, RelatedSpeciality[]>> }>(
    `/speciality/specialities/${specialityId}/related-foreign/?application_id=${applicationId}`,
    { enabled: !!specialityId, staleTime: 60_000 }
  );
  return specialityId ? (data?.data?.[key] ?? EMPTY) : EMPTY;
}

const EMPTY: RelatedSpeciality[] = [];

/**
 * Main speciality select + foreign-language speciality checkboxes.
 * Choosing a main speciality narrows the foreign list; choosing a foreign one narrows the main list.
 */
export function SpecialitySection({ applicationId, specialities, value, onChange, onPreview, error }: SpecialitySectionProps) {
  const foreignFromApi = useRelated("foreign_specialities", value.speciality, applicationId);
  const otherFromApi = useRelated("other_specialities", value.foreign[0] ?? null, applicationId);

  const foreignOptions: RelatedSpeciality[] = value.speciality
    ? foreignFromApi
    : specialities.filter((s) => s.is_foreign).map((s) => ({ id: Number(s.id), name: s.name, code: s.code }));

  const mainOptions =
    value.foreign.length > 0
      ? otherFromApi.map((s) => ({ value: String(s.id), label: `${s.code} - ${s.name}` }))
      : specialities.filter((s) => !s.is_foreign).map((s) => ({ value: String(s.id), label: specialityLabel(s) }));

  const selected = specialities.find((s) => String(s.id) === String(value.speciality));

  return (
    <Card title="Mutaxassislik" description="Asosiy mutaxassislikni va kerak bo'lsa chet tili mutaxassisligini tanlang">
      <label className="mb-1.5 block text-[13px] font-medium text-text" htmlFor="speciality-select">
        Mutaxassislik <span className="text-danger">*</span>
      </label>
      <Select
        id="speciality-select"
        allowClear
        showSearch
        size="large"
        className="w-full"
        placeholder="Mutaxassislikni tanlang"
        value={value.speciality === null ? undefined : String(value.speciality)}
        onChange={(v) => onChange({ ...value, speciality: v ?? null })}
        optionFilterProp="label"
        options={mainOptions}
        status={error ? "error" : undefined}
      />
      {error && <p className="mt-1.5 text-[13px] text-danger">{error}</p>}

      {foreignOptions.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[13px] font-medium text-text">Chet tili mutaxassisligi</p>
          <Checkbox.Group
            className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2"
            value={value.foreign}
            onChange={(vals) => onChange({ ...value, foreign: vals as Array<number | string> })}
          >
            {foreignOptions.map((rf) => (
              <label
                key={rf.id}
                className="flex min-w-0 cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2.5 hover:border-primary/40"
              >
                <Checkbox value={rf.id} />
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted">{rf.code}</span>
                  <span className="block break-words text-sm text-text">{rf.name}</span>
                </span>
              </label>
            ))}
          </Checkbox.Group>
        </div>
      )}

      {selected && (selected.comment || selected.file) && (
        <div className="mt-4 rounded-lg border border-dashed border-border bg-surface-2 px-3.5 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Qo&apos;llanma</p>
          {selected.comment && <p className="mt-1 break-words text-sm leading-6 text-text">{selected.comment}</p>}
          {selected.file && (
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                size="small"
                icon={<FileTextOutlined />}
                onClick={() => downloadFile({ name: selected.name, url: selected.file! })}
              >
                Yuklab olish
              </Button>
              <Button
                size="small"
                type="link"
                icon={<EyeOutlined />}
                onClick={() => onPreview({ name: selected.file!.split("/").pop() || selected.name, url: selected.file! })}
              >
                Ko&apos;rish
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
