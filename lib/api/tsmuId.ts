import { API_BASE_URL, ApiError, apiRequest, apiUpload } from "@/lib/hooks/useUniversalFetch";
import type {
  FaceVerifyResponse,
  TsmuCompleteResponse,
  TsmuLookupResponse,
  TsmuPasswordResetResponse,
  TsmuPhoneResponse,
  TsmuPurpose,
  User,
} from "@/types";

/**
 * TSMU ID identity verification — /api/v1/auth/tsmu-id/
 *
 * `authenticated: true` (the /verify-identity flow) sends the Bearer token so the backend
 * records `initiated_by`; the public registration and password-reset flows send no token at
 * all, so a stale token in storage can never trigger the refresh/redirect logic of `apiRequest`.
 *
 * No endpoint returns personal data: lookup gives an opaque session id + pose challenge,
 * face gives pass/fail only.
 */

const BASE = "/auth/tsmu-id";

interface Envelope<T> {
  data: T;
  message?: string;
}

async function publicFetch<T>(endpoint: string, body: BodyInit, json: boolean): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      cache: "no-store",
      headers: json ? { "Content-Type": "application/json" } : undefined,
      body,
    });
  } catch (error) {
    throw new Error(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
  const text = await response.text();
  let data: unknown = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }
  if (!response.ok) {
    const d = data as { message?: string; error?: string };
    throw new ApiError(response.status, d?.message || d?.error || response.statusText, data);
  }
  return data as T;
}

function postJson<T>(endpoint: string, payload: unknown, authenticated: boolean): Promise<T> {
  if (authenticated) {
    return apiRequest<T>(endpoint, { method: "POST", body: JSON.stringify(payload) });
  }
  return publicFetch<T>(endpoint, JSON.stringify(payload), true);
}

function postForm<T>(endpoint: string, form: FormData, authenticated: boolean): Promise<T> {
  if (authenticated) return apiUpload(endpoint, form, "POST") as Promise<T>;
  return publicFetch<T>(endpoint, form, false);
}

export interface TsmuCallOptions {
  authenticated?: boolean;
}

export interface TsmuLookupOptions extends TsmuCallOptions {
  /** Left out in the authenticated /verify-identity flow (backend defaults to "registration"). */
  purpose?: TsmuPurpose;
}

export const tsmuIdApi = {
  /** pinfl: 14 digits, birthDate: YYYY-MM-DD */
  async lookup(pinfl: string, birthDate: string, opts: TsmuLookupOptions = {}): Promise<TsmuLookupResponse> {
    const res = await postJson<Envelope<TsmuLookupResponse>>(
      `${BASE}/lookup/`,
      { pinfl, birth_date: birthDate, ...(opts.purpose ? { purpose: opts.purpose } : {}) },
      !!opts.authenticated
    );
    return res.data;
  },

  /** Sends exactly three JPEG frames as repeated `frames` fields. */
  async face(verificationId: string, frames: Blob[], opts: TsmuCallOptions = {}): Promise<FaceVerifyResponse> {
    const form = new FormData();
    form.append("verification_id", verificationId);
    frames.forEach((blob, i) => form.append("frames", blob, `frame-${i + 1}.jpg`));
    const res = await postForm<Envelope<FaceVerifyResponse>>(`${BASE}/face/`, form, !!opts.authenticated);
    return res.data;
  },

  /** phone: "+998901234567" */
  async phone(verificationId: string, phoneNumber: string): Promise<TsmuPhoneResponse> {
    const res = await postJson<Envelope<TsmuPhoneResponse>>(
      `${BASE}/phone/`,
      { verification_id: verificationId, phone_number: phoneNumber },
      false
    );
    return res.data;
  },

  async phoneVerify(verificationId: string, otpCode: string): Promise<{ verified: boolean }> {
    const res = await postJson<Envelope<{ verified: boolean }>>(
      `${BASE}/phone/verify/`,
      { verification_id: verificationId, otp_code: otpCode },
      false
    );
    return res.data;
  },

  async complete(verificationId: string, password: string, confirmPassword: string): Promise<TsmuCompleteResponse> {
    const res = await postJson<Envelope<TsmuCompleteResponse>>(
      `${BASE}/complete/`,
      { verification_id: verificationId, password, confirm_password: confirmPassword },
      false
    );
    return res.data;
  },

  /** Public: sets a new password once a `password_reset` session has passed the face check. */
  async resetPassword(
    verificationId: string,
    password: string,
    confirmPassword: string
  ): Promise<TsmuPasswordResetResponse> {
    const res = await postJson<Envelope<TsmuPasswordResetResponse>>(
      `${BASE}/password/reset/`,
      { verification_id: verificationId, password, confirm_password: confirmPassword },
      false
    );
    return res.data;
  },

  /** Authenticated: binds the verified identity to the current user. */
  async attach(verificationId: string): Promise<{ user: User }> {
    const res = await apiRequest<Envelope<{ user: User }>>(`${BASE}/attach/`, {
      method: "POST",
      body: JSON.stringify({ verification_id: verificationId }),
    });
    return res.data;
  },
};
