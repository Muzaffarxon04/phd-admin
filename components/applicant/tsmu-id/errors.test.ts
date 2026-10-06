import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/hooks/useUniversalFetch";
import { MSG, faceReasonMessage, tsmuError } from "@/components/applicant/tsmu-id/errors";

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
  it("maps the spec §3 codes to their Uzbek messages", () => {
    expect(tsmuError(api(404, "DOCREST_NOT_FOUND")).message).toBe(MSG.notFound);
    expect(tsmuError(api(503, "DOCREST_UNAVAILABLE")).message).toBe(MSG.unavailable);
    expect(tsmuError(api(409, "PHONE_TAKEN")).message).toBe(MSG.phoneTaken);
    expect(tsmuError(api(400, "INVALID_OTP")).message).toBe(MSG.invalidOtp);
    expect(tsmuError(api(429, "RATE_LIMITED")).message).toBe(MSG.rateLimited);
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

describe("faceReasonMessage", () => {
  it("explains each reason and the attempts left", () => {
    expect(faceReasonMessage("NO_FACE", 2)).toBe(MSG.noFace);
    expect(faceReasonMessage("MULTIPLE_FACES", 2)).toBe(MSG.noFace);
    expect(faceReasonMessage("LIVENESS_FAILED", 1)).toBe(MSG.liveness);
    expect(faceReasonMessage("LOW_SIMILARITY", 1)).toBe(MSG.lowSimilarity(1));
    expect(faceReasonMessage("LOW_SIMILARITY", 0)).toBe(MSG.exhausted);
  });
});
