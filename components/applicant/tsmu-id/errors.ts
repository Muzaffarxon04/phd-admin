import { getErrorCode, getErrorMessage, getErrorStatus, isNetworkError } from "@/lib/applicant/errors";
import { ApiError } from "@/lib/hooks/useUniversalFetch";
import type { ApiErrorBody, FaceFailReason } from "@/types";

/** restart → back to step 1; login → show login link; register → show sign-up link */
export type TsmuErrorAction = "restart" | "login" | "register";

export interface TsmuErrorInfo {
  code?: string;
  message: string;
  action?: TsmuErrorAction;
}

export const MSG = {
  notFound: "JSHSHIR yoki tug'ilgan sana noto'g'ri",
  unavailable: "Xizmat vaqtincha ishlamayapti, keyinroq urinib ko'ring",
  pinflTaken: "Bu JSHSHIR bilan akkaunt mavjud — telefon va parol bilan kiring",
  pinflTakenAuthed: "Bu JSHSHIR boshqa akkauntga bog'langan",
  accountNotFound: "Bu ma'lumotlar bilan akkaunt topilmadi",
  /** Face check verdicts — the only thing the user learns about the comparison. */
  identified: "Shaxs tasdiqlandi",
  notIdentified: "Shaxs aniqlanmadi",
  noFace: "Kadrda faqat siz bo'lishingiz kerak, yorug' joyda turing",
  liveness: "Boshingizni ko'rsatilgandek buring",
  poseMismatch: "Boshingizni ko'rsatilgan tartibda buring — har urinishda tartib yangilanadi",
  exhausted: "Urinishlar tugadi, 30 daqiqadan keyin qaytadan boshlang",
  phoneTaken: "Bu raqam boshqa akkauntga bog'langan",
  expired: "Sessiya tugadi",
  rateLimited: "Juda ko'p urinish, keyinroq",
  invalidOtp: "SMS kod noto'g'ri yoki muddati o'tgan",
  forbidden: "Bu tasdiqlash sessiyasi sizga tegishli emas. Qaytadan boshlang",
  network: "Tarmoq bilan bog'lanib bo'lmadi. Internet aloqasini tekshiring.",
};

/** Map a TSMU ID API error to its Uzbek message and follow-up action. */
export function tsmuError(error: unknown, opts: { authenticated?: boolean } = {}): TsmuErrorInfo {
  if (isNetworkError(error)) return { message: MSG.network };
  const code = getErrorCode(error);
  const status = getErrorStatus(error);

  switch (code) {
    case "DOCREST_NOT_FOUND":
      return { code, message: MSG.notFound };
    case "DOCREST_UNAVAILABLE":
      return { code, message: MSG.unavailable };
    case "PINFL_TAKEN":
      return opts.authenticated
        ? { code, message: MSG.pinflTakenAuthed }
        : { code, message: MSG.pinflTaken, action: "login" };
    case "ACCOUNT_NOT_FOUND":
      return { code, message: MSG.accountNotFound, action: "register" };
    case "RATE_LIMITED":
      return { code, message: MSG.rateLimited };
    case "INVALID_STATE":
    case "SESSION_EXPIRED":
      return { code, message: MSG.expired, action: "restart" };
    case "ATTEMPTS_EXHAUSTED":
      return { code, message: MSG.exhausted, action: "restart" };
    case "PHONE_TAKEN":
      return { code, message: MSG.phoneTaken };
    case "INVALID_OTP":
      return { code, message: MSG.invalidOtp };
    case "FORBIDDEN":
      return { code, message: MSG.forbidden, action: "restart" };
    case "VALIDATION_ERROR":
      return { code, message: getErrorMessage(error, "Ma'lumotlar noto'g'ri kiritilgan") };
  }

  if (status === 429) return { code, message: MSG.rateLimited };
  if (status === 410) return { code, message: MSG.expired, action: "restart" };
  if (status === 503) {
    // SMS_FAILED / FACE_SERVICE_UNAVAILABLE carry their own Uzbek text; only a bare 503 means docrest.
    const body = error instanceof ApiError ? (error.data as ApiErrorBody | undefined) : undefined;
    const own = typeof body?.message === "string" && body.message.trim() ? body.message : undefined;
    return { code, message: own ?? MSG.unavailable };
  }
  return { code, message: getErrorMessage(error, "Xatolik yuz berdi, qaytadan urinib ko'ring") };
}

/**
 * Practical hint for a failed face check, or null when there is nothing to add to the
 * "Shaxs aniqlanmadi" verdict (LOW_SIMILARITY: no score or other detail is ever shown).
 */
export function faceReasonHint(reason: FaceFailReason | null, attemptsLeft: number): string | null {
  if (attemptsLeft <= 0) return MSG.exhausted;
  switch (reason) {
    case "NO_FACE":
    case "MULTIPLE_FACES":
      return MSG.noFace;
    case "LIVENESS_FAILED":
      return MSG.liveness;
    case "POSE_MISMATCH":
      return MSG.poseMismatch;
    default:
      return null;
  }
}

/** One-line message for a failed face check. */
export function faceReasonMessage(reason: FaceFailReason | null, attemptsLeft: number): string {
  return faceReasonHint(reason, attemptsLeft) ?? MSG.notIdentified;
}
