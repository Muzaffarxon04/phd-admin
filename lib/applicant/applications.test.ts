import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/hooks/useUniversalFetch";
import {
  buildSubmissionFormData,
  deadlineInfo,
  extractCreatedId,
  isIdentityNotVerified,
  unwrapApplications,
  type ApplicationField,
  type ApplicationDetail,
} from "@/lib/applicant/applications";

const apps = [{ id: 1, title: "A" }, { id: 2, title: "B" }];

describe("unwrapApplications", () => {
  it("accepts a bare array", () => {
    expect(unwrapApplications(apps)).toHaveLength(2);
  });
  it("accepts {data: [...]}", () => {
    expect(unwrapApplications({ data: apps })).toHaveLength(2);
  });
  it("accepts the paginated {data: {data: [...]}} envelope", () => {
    expect(unwrapApplications({ data: { data: apps } })).toHaveLength(2);
  });
  it("returns [] for anything else", () => {
    expect(unwrapApplications(undefined)).toEqual([]);
    expect(unwrapApplications({ data: "x" })).toEqual([]);
  });
});

describe("deadlineInfo", () => {
  const now = new Date("2026-10-07T10:00:00");
  it("counts whole days left and stays neutral when far away", () => {
    expect(deadlineInfo("2026-10-20T23:59:00", now)).toEqual({ daysLeft: 13, label: "13 kun qoldi", tone: "neutral" });
  });
  it("warns when 3 days or fewer remain", () => {
    expect(deadlineInfo("2026-10-09T23:59:00", now)).toMatchObject({ daysLeft: 2, tone: "warning" });
  });
  it("marks the last day", () => {
    expect(deadlineInfo("2026-10-07T23:59:00", now)).toMatchObject({ daysLeft: 0, label: "Bugun oxirgi kun", tone: "warning" });
  });
  it("marks an expired deadline", () => {
    expect(deadlineInfo("2026-10-01T23:59:00", now)).toMatchObject({ daysLeft: -6, label: "Muddati tugagan", tone: "danger" });
  });
  it("handles a missing date", () => {
    expect(deadlineInfo(null, now)).toMatchObject({ daysLeft: null, label: "Muddat belgilanmagan", tone: "neutral" });
  });
});

describe("extractCreatedId", () => {
  it("reads the id from any of the known response shapes", () => {
    expect(extractCreatedId({ data: { id: 5 } })).toBe(5);
    expect(extractCreatedId({ data: { submission: { id: 6 } } })).toBe(6);
    expect(extractCreatedId({ submission_id: 7 })).toBe(7);
    expect(extractCreatedId({ id: 8 })).toBe(8);
    expect(extractCreatedId({})).toBeNull();
  });
});

describe("isIdentityNotVerified", () => {
  it("is true only for the IDENTITY_NOT_VERIFIED code", () => {
    expect(isIdentityNotVerified(new ApiError(403, "Forbidden", { code: "IDENTITY_NOT_VERIFIED" }))).toBe(true);
    expect(isIdentityNotVerified(new ApiError(403, "Forbidden", { code: "FORBIDDEN" }))).toBe(false);
    expect(isIdentityNotVerified(new Error("x"))).toBe(false);
  });
});

describe("buildSubmissionFormData", () => {
  const fields: ApplicationField[] = [
    { id: 10, label: "Ism", field_type: "TEXT", required: true },
    { id: 11, label: "Sana", field_type: "DATE", required: false },
    { id: 12, label: "Tillar", field_type: "CHECKBOX", required: false, options: ["EN", "DE"] },
    { id: 13, label: "Fayl", field_type: "FILE", required: true },
    { id: 14, label: "Ixtiyoriy", field_type: "TEXT", required: false },
  ];
  const application = { id: 42, title: "PhD", fields } as unknown as ApplicationDetail;
  const file = new File(["x"], "diplom.pdf", { type: "application/pdf" });

  const values = {
    education_form: "TAYANCH_DOKTORANTURA_PHD",
    field_10: "Ali",
    field_11: { format: (f: string) => (f === "YYYY-MM-DD" ? "2026-01-02" : "") },
    field_12: ["EN", "DE"],
    field_13: [{ originFileObj: file }],
    field_14: undefined,
  };

  it("rejects when no speciality is chosen", () => {
    const r = buildSubmissionFormData(application, values, { speciality: null, foreign: [] });
    expect(r).toEqual({ ok: false, error: "Iltimos, mutaxassislikni tanlang!" });
  });

  it("rejects when education form is missing", () => {
    const r = buildSubmissionFormData(application, { ...values, education_form: undefined }, { speciality: "3", foreign: [] });
    expect(r).toEqual({ ok: false, error: "Iltimos, ta'lim shaklini tanlang!" });
  });

  it("builds the exact multipart shape the backend expects", () => {
    const r = buildSubmissionFormData(application, values, { speciality: "3", foreign: [7, "8"] });
    if (!r.ok) throw new Error(r.error);
    const fd = r.formData;
    expect(fd.get("application")).toBe("42");
    expect(fd.get("specialities")).toBe("[3,7,8]");
    expect(fd.get("education_form")).toBe("TAYANCH_DOKTORANTURA_PHD");
    expect(fd.get("field_13_file")).toBe(file);
    const answers = JSON.parse(String(fd.get("answers")));
    expect(answers).toEqual([
      { field_id: 10, answer_text: "Ali", answer_number: null, answer_date: null, answer_json: {} },
      { field_id: 11, answer_text: "2026-01-02", answer_number: null, answer_date: null, answer_json: {} },
      { field_id: 12, answer_text: "EN, DE", answer_number: null, answer_date: null, answer_json: {} },
      { field_id: 13, answer_text: "", answer_number: null, answer_date: null, answer_json: {} },
    ]);
  });

  it("skips empty optional fields but keeps empty required ones", () => {
    const r = buildSubmissionFormData(
      application,
      { ...values, field_10: undefined, field_14: undefined },
      { speciality: "3", foreign: [] }
    );
    if (!r.ok) throw new Error(r.error);
    const ids = JSON.parse(String(r.formData.get("answers"))).map((a: { field_id: number }) => a.field_id);
    expect(ids).toContain(10);
    expect(ids).not.toContain(14);
  });
});
