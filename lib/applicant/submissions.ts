import dayjs from "dayjs";
import { EDUCATION_FORMS, type ApplicationField } from "@/lib/applicant/applications";
import type { Tone } from "@/components/applicant/ui/StatusBadge";
import type { ApplicantSnapshot } from "@/types";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type SubmissionStatus = "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

/** Row of GET /applicant/my-submissions/ */
export interface SubmissionRow {
  id: number;
  submission_number: string;
  application_title: string;
  application_end_date?: string | null;
  status: SubmissionStatus;
  payment_status: PaymentStatus;
  education_form?: string | null;
  created_at: string;
  submitted_at?: string | null;
  can_edit?: boolean;
  can_submit?: boolean;
}

export interface SubmissionAnswer {
  id: number;
  field: number;
  field_label: string;
  field_type: string;
  answer_text?: string | null;
  answer?: unknown;
}

export interface SubmissionDocument {
  id: number;
  document_type: string;
  file: string;
  file_name?: string | null;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  uploaded_at: string;
}

/** GET /applicant/my-submissions/:id/ → data */
export interface SubmissionDetail {
  id: number;
  submission_number: string;
  application: { id: number; title: string; description?: string; end_date?: string; application_fee?: string };
  status: SubmissionStatus;
  payment_status: PaymentStatus;
  payment_reference?: string | null;
  review_notes?: string | null;
  reviewed_by_name?: string | null;
  reviewed_at?: string | null;
  education_form?: string | null;
  speciality?: { id: number; name: string; code: string } | null;
  answers: SubmissionAnswer[];
  documents: SubmissionDocument[];
  applicant_snapshot?: ApplicantSnapshot | null;
  can_edit?: boolean;
  can_submit?: boolean;
  created_at: string;
  submitted_at?: string | null;
  updated_at?: string | null;
}

/* ------------------------------------------------------------------ */
/* Status helpers                                                      */
/* ------------------------------------------------------------------ */

export type StepState = "done" | "current" | "upcoming";

export interface TimelineStep {
  key: string;
  title: string;
  state: StepState;
  tone?: Tone;
}

const ORDER: Record<SubmissionStatus, number> = {
  DRAFT: 0,
  WITHDRAWN: 0,
  SUBMITTED: 1,
  UNDER_REVIEW: 2,
  APPROVED: 3,
  REJECTED: 3,
};

const RESULT: Partial<Record<SubmissionStatus, { title: string; tone: Tone }>> = {
  APPROVED: { title: "Qabul qilindi", tone: "success" },
  REJECTED: { title: "Rad etildi", tone: "danger" },
  WITHDRAWN: { title: "Qaytarildi", tone: "warning" },
};

/** Qoralama → Yuborildi → Ko'rib chiqilmoqda → Natija, with the final step named by the outcome. */
export function timelineSteps(status: SubmissionStatus | string): TimelineStep[] {
  const s = status as SubmissionStatus;
  const idx = ORDER[s] ?? 0;
  const result = RESULT[s];
  const stateAt = (i: number): StepState => (i < idx ? "done" : i === idx ? "current" : "upcoming");
  return [
    { key: "draft", title: "Qoralama", state: stateAt(0) },
    { key: "submitted", title: "Yuborildi", state: stateAt(1) },
    { key: "review", title: "Ko'rib chiqilmoqda", state: stateAt(2) },
    result
      ? { key: "result", title: result.title, state: "done", tone: result.tone }
      : { key: "result", title: "Natija", state: stateAt(3) },
  ];
}

export function canEditSubmission(status: SubmissionStatus | string): boolean {
  return status !== "APPROVED" && status !== "REJECTED";
}

export function educationFormLabel(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  return EDUCATION_FORMS.find((f) => f.value === value)?.label ?? value;
}

/* ------------------------------------------------------------------ */
/* Files & answers                                                     */
/* ------------------------------------------------------------------ */

/** Media paths come back relative to the API host (without the /api/v1 prefix). */
export function resolveFileUrl(path: string | null | undefined, apiBaseUrl: string): string | null {
  const p = (path ?? "").trim();
  if (!p || p === "/") return null;
  if (/^https?:\/\//i.test(p)) return p;
  const origin = apiBaseUrl.replace(/\/+$/, "").replace(/\/api\/v\d+$/, "");
  return `${origin}${p.startsWith("/") ? "" : "/"}${p}`;
}

export function fileNameFromPath(path: string): string {
  return path.split("?")[0].split("/").pop() || "fayl";
}

export function answerRaw(answer: SubmissionAnswer): unknown {
  if (answer.field_type === "SELECT" || answer.field_type === "RADIO") return answer.answer_text ?? answer.answer;
  return answer.answer ?? answer.answer_text;
}

export function answerDisplay(answer: SubmissionAnswer): string {
  const val = answerRaw(answer);
  if (val === undefined || val === null || val === "") return "—";
  if (Array.isArray(val)) return val.join(", ");
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

/* ------------------------------------------------------------------ */
/* Edit form                                                           */
/* ------------------------------------------------------------------ */

type UploadEntry = { uid: string; name: string; status?: string; url?: string; originFileObj?: File | Blob };

/** Initial antd Form values for editing a draft, keyed `field_<id>`. */
export function editInitialValues(
  answers: SubmissionAnswer[],
  fields: ApplicationField[],
  resolve: (path: string) => string | null
): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const ans of answers) {
    const def = fields.find((f) => f.id === ans.field);
    if (!def) continue;
    const raw = answerRaw(ans);
    const key = `field_${ans.field}`;
    switch (def.field_type) {
      case "FILE": {
        const path = typeof raw === "string" ? raw : "";
        const url = path ? resolve(path) : null;
        if (url) values[key] = [{ uid: `file-${ans.field}`, name: fileNameFromPath(path), status: "done", url } satisfies UploadEntry];
        break;
      }
      case "DATE": {
        const d = typeof raw === "string" && raw ? dayjs(raw) : null;
        values[key] = d && d.isValid() ? d : undefined;
        break;
      }
      case "CHECKBOX":
        values[key] = Array.isArray(raw) ? raw : typeof raw === "string" && raw ? raw.split(",").map((s) => s.trim()) : [];
        break;
      default:
        values[key] = raw === undefined || raw === null ? "" : Array.isArray(raw) ? raw : String(raw);
    }
  }
  return values;
}

/** Multipart body for PATCH /applicant/submissions/:id/update/ — `answers` JSON + new files only. */
export function buildUpdateFormData(fields: ApplicationField[], values: Record<string, unknown>): FormData {
  const fd = new FormData();
  const answers: Array<{ field_id: number; answer_text: string }> = [];
  for (const field of fields) {
    const value = values[`field_${field.id}`];
    if (field.field_type === "FILE") {
      const entry = Array.isArray(value) ? (value[0] as UploadEntry | undefined) : undefined;
      if (entry?.originFileObj) fd.append(`field_${field.id}_file`, entry.originFileObj);
      answers.push({ field_id: field.id, answer_text: "" });
      continue;
    }
    let text = "";
    if (value !== undefined && value !== null) {
      if (field.field_type === "DATE" && typeof (value as { format?: unknown }).format === "function") {
        text = (value as { format: (f: string) => string }).format("YYYY-MM-DD");
      } else if (Array.isArray(value)) {
        text = value.join(", ");
      } else {
        text = String(value);
      }
    }
    if (text) answers.push({ field_id: field.id, answer_text: text });
  }
  fd.append("answers", JSON.stringify(answers));
  return fd;
}
