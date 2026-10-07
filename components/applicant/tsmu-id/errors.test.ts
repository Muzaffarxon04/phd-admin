import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/hooks/useUniversalFetch";
import { MSG, faceReasonHint, faceReasonMessage, tsmuError } from "@/components/applicant/tsmu-id/errors";

const api = (status: number, code?: string, message = "backend text") => new ApiError(status, message, { code, message });

describe("tsmuError → action table", () => {
  it("restarts the wizard on INVALID_STATE / SESSION_EXPIRED / FORBIDDEN / ATTEMPTS_EXHAUSTED", () => {
    for (const code of ["INVALID_STATE", "SESSION_EXPIRED", "FORBIDDEN", "ATTEMPTS_EXHAUSTED"]) {
      expect(tsmuError(api(409, code)).action).toBe("restart");
    }
  });
  it("offers login on PINFL_TAKEN for anonymous users only", () => {
    expect(tsmuError(api(409, "PINFL_TAKEN"))).toMatchObject({ action: "login", message: MSG.pinflTaken });
    expect(tsmuError(api(409, "PINFL_TAKEN"), { authenticated: true })).toMatchObject({ message: MSG.pinflTakenAuthed });
    expect(tsmuError(api(409, "PINFL_TAKEN"), { authenticated: true }).action).toBeUndefined();
  });
  it("offers sign-up on ACCOUNT_NOT_FOUND (password reset for an unknown JSHSHIR)", () => {
    expect(tsmuError(api(404, "ACCOUNT_NOT_FOUND"))).toEqual({
      code: "ACCOUNT_NOT_FOUND",
      message: "Bu ma'lumotlar bilan akkaunt topilmadi",
      action: "register",
    });
  });
  it("maps the documented codes to their Uzbek messages", () => {
    expect(tsmuError(api(404, "DOCREST_NOT_FOUND")).message).toBe(MSG.notFound);
    expect(tsmuError(api(503, "DOCREST_UNAVAILABLE")).message).toBe(MSG.unavailable);
    expect(tsmuError(api(409, "PHONE_TAKEN")).message).toBe(MSG.phoneTaken);
    expect(tsmuError(api(400, "INVALID_OTP")).message).toBe(MSG.invalidOtp);
    expect(tsmuError(api(429, "RATE_LIMITED")).message).toBe(MSG.rateLimited);
  });
  it("restarts the reset flow when the password/reset session is stale", () => {
    expect(tsmuError(api(409, "INVALID_STATE"))).toMatchObject({ message: MSG.expired, action: "restart" });
    expect(tsmuError(api(410, "SESSION_EXPIRED"))).toMatchObject({ message: MSG.expired, action: "restart" });
  });
  it("shows the backend's own text for VALIDATION_ERROR", () => {
    expect(tsmuError(api(400, "VALIDATION_ERROR", "Parol kamida 8 ta belgi")).message).toBe("Parol kamida 8 ta belgi");
  });
  it("keeps the backend's own message for other 503s (SMS / face service), not the docrest text", () => {
    expect(tsmuError(api(503, "SMS_FAILED", "SMS yuborishda xatolik yuz berdi.")).message).toBe("SMS yuborishda xatolik yuz berdi.");
    expect(tsmuError(api(503, "FACE_SERVICE_UNAVAILABLE", "Yuzni tekshirish xizmati vaqtincha ishlamayapti")).message).toBe(
      "Yuzni tekshirish xizmati vaqtincha ishlamayapti"
    );
  });
  it("falls back to the docrest text for a bare 503 without a message", () => {
    expect(tsmuError(new ApiError(503, "Service Unavailable", {})).message).toBe(MSG.unavailable);
  });
  it("uses status fallbacks for unknown codes", () => {
    expect(tsmuError(api(410)).action).toBe("restart");
    expect(tsmuError(api(429)).message).toBe(MSG.rateLimited);
  });
  it("reports network errors", () => {
    expect(tsmuError(new Error("Network error: Failed to fetch")).message).toBe(MSG.network);
  });
});

describe("user-facing copy", () => {
  it("never says where the data or photo comes from", () => {
    for (const text of Object.values(MSG)) {
      expect(text).not.toMatch(/davlat|pasport|docrest/i);
    }
    expect(MSG.unavailable).toBe("Xizmat vaqtincha ishlamayapti, keyinroq urinib ko'ring");
  });
});

describe("face check messages", () => {
  it("uses the plain verdicts from the backend", () => {
    expect(MSG.identified).toBe("Shaxs tasdiqlandi");
    expect(MSG.notIdentified).toBe("Shaxs aniqlanmadi");
  });
  it("says only 'Shaxs aniqlanmadi' for LOW_SIMILARITY — no score, no detail", () => {
    expect(faceReasonHint("LOW_SIMILARITY", 2)).toBeNull();
    expect(faceReasonHint(null, 2)).toBeNull();
    expect(faceReasonMessage("LOW_SIMILARITY", 1)).toBe(MSG.notIdentified);
    expect(faceReasonMessage("LOW_SIMILARITY", 1)).not.toMatch(/%|\d/);
  });
  it("keeps helpful hints for capture problems", () => {
    expect(faceReasonMessage("NO_FACE", 2)).toBe(MSG.noFace);
    expect(faceReasonMessage("MULTIPLE_FACES", 2)).toBe(MSG.noFace);
    expect(faceReasonMessage("LIVENESS_FAILED", 1)).toBe(MSG.liveness);
    expect(faceReasonMessage("POSE_MISMATCH", 1)).toBe(MSG.poseMismatch);
  });
  it("reports exhausted attempts regardless of the reason", () => {
    expect(faceReasonMessage("LOW_SIMILARITY", 0)).toBe(MSG.exhausted);
    expect(faceReasonHint("NO_FACE", 0)).toBe(MSG.exhausted);
  });
});
