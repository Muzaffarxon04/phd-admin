"use client";

import { useEffect } from "react";
import { useGet } from "@/lib/hooks";
import { mergeStoredUser } from "@/lib/applicant/session";
import { PROFILE_ENDPOINT, unwrapProfile } from "@/lib/applicant/profile";

const SYNCED_KEYS = ["is_verified", "photo_url", "identity_verified_at", "first_name", "last_name", "middle_name"];

/** GET /applicant/profile/ and keep the stored user's name + verification flags in sync. */
export function useApplicantProfile() {
  const query = useGet<unknown>(PROFILE_ENDPOINT);
  const profile = unwrapProfile(query.data);

  useEffect(() => {
    if (!profile) return;
    const patch: Record<string, unknown> = {};
    for (const k of SYNCED_KEYS) {
      if (k in profile && profile[k] !== undefined) patch[k] = profile[k];
    }
    if (Object.keys(patch).length) mergeStoredUser(patch);
  }, [profile]);

  return { ...query, profile };
}
