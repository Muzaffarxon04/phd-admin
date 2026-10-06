import { getErrorCode } from "@/lib/applicant/errors";
import type { Speciality } from "@/types";
import type { Tone } from "@/components/applicant/ui/StatusBadge";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type FieldType =
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
  field_type: FieldType;
  help_text?: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  min_length?: number | null;
  max_length?: number | null;
  min_value?: string | null;
  max_value?: string | null;
  allowed_file_types?: string[];
  max_file_size?: number | null;
  order?: number;
}

/** Row of GET /applicant/applications/ */
export interface AvailableApplication {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  exam_date?: string | null;
  application_fee: string;
  can_apply: boolean;
  can_apply_message?: string | null;
  requires_oneid_verification?: boolean;
  instructions?: string;
  user_submission_count?: number;
  status?: string;
}

/** GET /applicant/applications/:id/ → data */
export interface ApplicationDetail extends Omit<AvailableApplication, "can_apply"> {
  can_apply?: boolean | { can_apply: boolean; reason: string };
  fields: ApplicationField[];
  specialities: Speciality[];
}

export const EDUCATION_FORMS: Array<{ value: string; label: string }> = [
  { value: "DOKTORANTURA_DSC", label: "Doktorantura (DSc)" },
  { value: "TAYANCH_DOKTORANTURA_PHD", label: "Tayanch doktorantura (PhD)" },
  { value: "MUSTAQIL_TADQIQOTCHI_DSC", label: "Mustaqil tadqiqotchi (DSc)" },
  { value: "MUSTAQIL_TADQIQOTCHI_PHD", label: "Mustaqil tadqiqotchi (PhD)" },
  { value: "STAJYOR_TADQIQOTCHI", label: "Stajyor-tadqiqotchi" },
];

/* ------------------------------------------------------------------ */
/* Response helpers                                                    */
/* ------------------------------------------------------------------ */

/** The list endpoint has shipped three shapes: `[]`, `{data: []}` and `{data: {data: []}}`. */
export function unwrapApplications<T = AvailableApplication>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (!data || typeof data !== "object") return [];
  const inner = (data as { data?: unknown }).data;
  if (Array.isArray(inner)) return inner as T[];
  if (inner && typeof inner === "object") {
    const deep = (inner as { data?: unknown }).data;
    if (Array.isArray(deep)) return deep as T[];
  }
  return [];
}

export interface CreateSubmissionResponse {
  id?: number;
  submission_id?: number;
  submission?: { id?: number };
  data?: { id?: number; submission_id?: number; submission?: { id?: number } };
}

export function extractCreatedId(res: CreateSubmissionResponse | null | undefined): number | null {
  return (
    res?.data?.id ??
    res?.data?.submission_id ??
    res?.data?.submission?.id ??
    res?.submission_id ??
    res?.submission?.id ??
    res?.id ??
    null
  );
}

export function isIdentityNotVerified(error: unknown): boolean {
  return getErrorCode(error) === "IDENTITY_NOT_VERIFIED";
}

/* ------------------------------------------------------------------ */
/* Deadline                                                            */
/* ------------------------------------------------------------------ */

export interface DeadlineInfo {
  daysLeft: number | null;
  label: string;
  tone: Tone;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Whole calendar days between now and the deadline, with a human label. */
export function deadlineInfo(endDate: string | null | undefined, now: Date = new Date()): DeadlineInfo {
  if (!endDate) return { daysLeft: null, label: "Muddat belgilanmagan", tone: "neutral" };
  const end = new Date(endDate);
  if (isNaN(end.getTime())) return { daysLeft: null, label: "Muddat belgilanmagan", tone: "neutral" };
  const daysLeft = Math.round((startOfDay(end) - startOfDay(now)) / DAY_MS);
  if (daysLeft < 0) return { daysLeft, label: "Muddati tugagan", tone: "danger" };
  if (daysLeft === 0) return { daysLeft, label: "Bugun oxirgi kun", tone: "warning" };
  return { daysLeft, label: `${daysLeft} kun qoldi`, tone: daysLeft <= 3 ? "warning" : "neutral" };
}

/* ------------------------------------------------------------------ */
/* Submission payload                                                  */
/* ------------------------------------------------------------------ */

export interface SpecialitySelection {
  speciality: string | number | null;
  foreign: Array<string | number>;
}

interface Answer {
  field_id: number;
  answer_text: string;
  answer_number: null;
  answer_date: null;
  answer_json: Record<string, never>;
}

type DayjsLike = { format: (f: string) => string };
type UploadValue = Array<{ originFileObj?: File | Blob }>;

export type BuildResult = { ok: true; formData: FormData } | { ok: false; error: string };

function answerTextFor(field: ApplicationField, value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (field.field_type === "DATE") {
    const d = value as DayjsLike;
    return typeof d?.format === "function" ? d.format("YYYY-MM-DD") : undefined;
  }
  if (field.field_type === "CHECKBOX" && Array.isArray(value)) return value.join(", ");
  return String(value);
}

/**
 * Multipart body for POST /applicant/submissions/create/ — the wire shape is unchanged
 * from the previous form: `application`, `specialities` (JSON array of ids),
 * `education_form`, `answers` (JSON) and one `field_<id>_file` per uploaded file.
 */
export function buildSubmissionFormData(
  application: ApplicationDetail,
  values: Record<string, unknown>,
  selection: SpecialitySelection
): BuildResult {
  if (!selection.speciality && selection.foreign.length === 0) {
    return { ok: false, error: "Iltimos, mutaxassislikni tanlang!" };
  }
  const educationForm = values.education_form as string | undefined;
  if (!educationForm) return { ok: false, error: "Iltimos, ta'lim shaklini tanlang!" };

  const specialities = [
    ...(selection.speciality ? [Number(selection.speciality)] : []),
    ...selection.foreign.map(Number),
  ];

  const formData = new FormData();
  formData.append("application", String(application.id));
  formData.append("specialities", JSON.stringify(specialities));
  formData.append("education_form", educationForm);

  const answers: Answer[] = [];
  for (const field of application.fields ?? []) {
    const value = values[`field_${field.id}`];
    const base = { field_id: field.id, answer_number: null, answer_date: null, answer_json: {} } as const;

    if (field.field_type === "FILE") {
      const upload = value as UploadValue | undefined;
      const file = Array.isArray(upload) ? upload[0]?.originFileObj : undefined;
      if (file) formData.append(`field_${field.id}_file`, file);
      answers.push({ ...base, answer_text: "" });
      continue;
    }

    const text = answerTextFor(field, value);
    if (text || field.required) answers.push({ ...base, answer_text: text ?? "" });
  }

  formData.append("answers", JSON.stringify(answers));
  return { ok: true, formData };
}
