import { describe, expect, it } from "vitest";
import {
  answerDisplay,
  buildUpdateFormData,
  canEditSubmission,
  editInitialValues,
  educationFormLabel,
  resolveFileUrl,
  timelineSteps,
  type SubmissionAnswer,
} from "@/lib/applicant/submissions";
import type { ApplicationField } from "@/lib/applicant/applications";

describe("timelineSteps", () => {
  it("has four steps: Qoralama → Yuborildi → Ko'rib chiqilmoqda → Natija", () => {
    expect(timelineSteps("DRAFT").map((s) => s.title)).toEqual(["Qoralama", "Yuborildi", "Ko'rib chiqilmoqda", "Natija"]);
  });
  it("marks the current step and everything before it", () => {
    expect(timelineSteps("UNDER_REVIEW").map((s) => s.state)).toEqual(["done", "done", "current", "upcoming"]);
  });
  it("DRAFT is the first, current step", () => {
    expect(timelineSteps("DRAFT").map((s) => s.state)).toEqual(["current", "upcoming", "upcoming", "upcoming"]);
  });
  it("APPROVED completes the timeline with a success result", () => {
    const steps = timelineSteps("APPROVED");
    expect(steps[3]).toMatchObject({ title: "Qabul qilindi", state: "done", tone: "success" });
  });
  it("REJECTED completes the timeline with a danger result", () => {
    expect(timelineSteps("REJECTED")[3]).toMatchObject({ title: "Rad etildi", state: "done", tone: "danger" });
  });
  it("WITHDRAWN points back to the draft step with a warning", () => {
    const steps = timelineSteps("WITHDRAWN");
    expect(steps[3]).toMatchObject({ title: "Qaytarildi", state: "done", tone: "warning" });
  });
});

describe("canEditSubmission", () => {
  it("is editable until a decision is made", () => {
    expect(canEditSubmission("DRAFT")).toBe(true);
    expect(canEditSubmission("WITHDRAWN")).toBe(true);
    expect(canEditSubmission("APPROVED")).toBe(false);
    expect(canEditSubmission("REJECTED")).toBe(false);
  });
});

describe("educationFormLabel", () => {
  it("maps codes to labels and passes unknown values through", () => {
    expect(educationFormLabel("TAYANCH_DOKTORANTURA_PHD")).toBe("Tayanch doktorantura (PhD)");
    expect(educationFormLabel("X")).toBe("X");
    expect(educationFormLabel(null)).toBeUndefined();
  });
});

describe("resolveFileUrl", () => {
  it("keeps absolute urls and joins relative paths to the API origin", () => {
    expect(resolveFileUrl("https://x/y.pdf", "https://api.tsmu.uz/api/v1")).toBe("https://x/y.pdf");
    expect(resolveFileUrl("/media/a.pdf", "https://api.tsmu.uz/api/v1")).toBe("https://api.tsmu.uz/media/a.pdf");
    expect(resolveFileUrl("media/a.pdf", "https://api.tsmu.uz/api/v1/")).toBe("https://api.tsmu.uz/media/a.pdf");
    expect(resolveFileUrl("", "https://api.tsmu.uz/api/v1")).toBeNull();
  });
});

describe("answerDisplay", () => {
  it("prefers answer_text for SELECT/RADIO and answer otherwise", () => {
    expect(answerDisplay({ id: 1, field: 1, field_label: "a", field_type: "SELECT", answer_text: "A", answer: "B" })).toBe("A");
    expect(answerDisplay({ id: 1, field: 1, field_label: "a", field_type: "TEXT", answer_text: "A", answer: "B" })).toBe("B");
  });
  it("joins arrays and shows a dash for empty", () => {
    expect(answerDisplay({ id: 1, field: 1, field_label: "a", field_type: "CHECKBOX", answer: ["EN", "DE"] })).toBe("EN, DE");
    expect(answerDisplay({ id: 1, field: 1, field_label: "a", field_type: "TEXT" })).toBe("—");
  });
});

const fields: ApplicationField[] = [
  { id: 1, label: "Ism", field_type: "TEXT", required: true },
  { id: 2, label: "Sana", field_type: "DATE", required: false },
  { id: 3, label: "Tillar", field_type: "CHECKBOX", required: false, options: ["EN", "DE"] },
  { id: 4, label: "Fayl", field_type: "FILE", required: false },
];

const answers: SubmissionAnswer[] = [
  { id: 10, field: 1, field_label: "Ism", field_type: "TEXT", answer: "Ali" },
  { id: 11, field: 2, field_label: "Sana", field_type: "DATE", answer: "2026-01-02" },
  { id: 12, field: 3, field_label: "Tillar", field_type: "CHECKBOX", answer: "EN, DE" },
  { id: 13, field: 4, field_label: "Fayl", field_type: "FILE", answer: "/media/diplom.pdf" },
];

describe("editInitialValues", () => {
  const values = editInitialValues(answers, fields, (p) => `https://api${p}`);
  it("fills text values", () => {
    expect(values.field_1).toBe("Ali");
  });
  it("parses dates into a dayjs instance", () => {
    expect((values.field_2 as { format: (f: string) => string }).format("YYYY-MM-DD")).toBe("2026-01-02");
  });
  it("splits checkbox strings into arrays", () => {
    expect(values.field_3).toEqual(["EN", "DE"]);
  });
  it("turns an uploaded file path into a done upload entry with a resolved url", () => {
    expect(values.field_4).toEqual([{ uid: "file-4", name: "diplom.pdf", status: "done", url: "https://api/media/diplom.pdf" }]);
  });
});

describe("buildUpdateFormData", () => {
  it("sends answers JSON and only newly chosen files", () => {
    const file = new File(["x"], "new.pdf");
    const fd = buildUpdateFormData(fields, {
      field_1: "Vali",
      field_2: { format: () => "2026-02-03" },
      field_3: ["DE"],
      field_4: [{ uid: "n", name: "new.pdf", originFileObj: file }],
    });
    expect(fd.get("field_4_file")).toBe(file);
    expect(JSON.parse(String(fd.get("answers")))).toEqual([
      { field_id: 1, answer_text: "Vali" },
      { field_id: 2, answer_text: "2026-02-03" },
      { field_id: 3, answer_text: "DE" },
      { field_id: 4, answer_text: "" },
    ]);
  });
  it("does not re-upload an existing remote file", () => {
    const fd = buildUpdateFormData(fields, { field_4: [{ uid: "file-4", name: "diplom.pdf", status: "done", url: "https://api/x.pdf" }] });
    expect(fd.get("field_4_file")).toBeNull();
  });
});
