import { getErrorCode, getErrorMessage, getErrorStatus, isNetworkError } from "@/lib/applicant/errors";
import { ApiError } from "@/lib/hooks/useUniversalFetch";
import type { ApiErrorBody, FaceFailReason } from "@/types";

export type TsmuErrorAction = "restart" | "login";

export interface TsmuErrorInfo {
  code?: string;
  message: string;
  /** restart → back to step 1; login → show login link */
  action?: TsmuErrorAction;
}

export const MSG = {
  notFound: "JSHSHIR yoki tug'ilgan sana noto'g'ri",
  unavailable: "Davlat xizmati vaqtincha javob bermayapti, keyinroq urinib ko'ring",
  pinflTaken: "Bu JSHSHIR bilan akkaunt mavjud — telefon va parol bilan kiring",
  pinflTakenAuthed: "Bu JSHSHIR boshqa akkauntga bog'langan",
  noFace: "Kadrda faqat siz bo'lishingiz kerak, yorug' joyda turing",
  lowSimilarity: (n: number) => `Yuz mos kelmadi (qolgan urinishlar: ${n})`,
  liveness: "Boshingizni ko'rsatilgandek buring",
  exhausted: "Urinishlar tugadi, 30 daqiqadan keyin qaytadan boshlang",
  phoneTaken: "Bu raqam boshqa akkauntga bog'langan",
  expired: "Sessiya tugadi",
  rateLimited: "Juda ko'p urinish, keyinroq",
  invalidOtp: "SMS kod noto'g'ri yoki muddati o'tgan",
  forbidden: "Bu tasdiqlash sessiyasi sizga tegishli emas. Qaytadan boshlang",
  network: "Tarmoq bilan bog'lanib bo'lmadi. Internet aloqasini tekshiring.",
};

/** Map a TSMU ID API error to the Uzbek message from the spec (§3). */
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

/** Message for a failed face check. */
export function faceReasonMessage(reason: FaceFailReason | null, attemptsLeft: number): string {
  if (attemptsLeft <= 0) return MSG.exhausted;
  switch (reason) {
    case "NO_FACE":
    case "MULTIPLE_FACES":
      return MSG.noFace;
    case "LIVENESS_FAILED":
      return MSG.liveness;
    case "LOW_SIMILARITY":
    default:
      return MSG.lowSimilarity(attemptsLeft);
  }
}
