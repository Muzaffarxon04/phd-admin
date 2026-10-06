import type { ApplicantProfile } from "@/types";

export const PROFILE_ENDPOINT = "/applicant/profile/";

/** Fields the applicant may change in the profile sheet (everything else is either TSMU ID data or the login phone). */
export const EDITABLE_FIELDS = ["email", "organization", "permanent_address"] as const;
export type EditableField = (typeof EDITABLE_FIELDS)[number];

/** Backend and frontend use two spellings for a few fields; a lock on one locks the other. */
const ALIASES: Record<string, string[]> = {
  nation: ["nationality"],
  nationality: ["nation"],
  citizen: ["citizenship"],
  citizenship: ["citizen"],
  passport_seria: ["passport_series"],
  passport_series: ["passport_seria"],
};

/** Is `field` read-only for this profile? Uses the backend's `locked_fields`; the login phone is always locked. */
export function isFieldLocked(profile: ApplicantProfile | null | undefined, field: string): boolean {
  if (field === "phone_number") return true;
  if (!profile) return false;
  const locked = new Set<string>(profile.locked_fields ?? []);
  return locked.has(field) || (ALIASES[field] ?? []).some((a) => locked.has(a));
}

/** Accepts both `{data: profile}` and a bare profile. */
export function unwrapProfile(data: unknown): ApplicantProfile | undefined {
  if (!data || typeof data !== "object") return undefined;
  const inner = (data as { data?: unknown }).data;
  if (inner && typeof inner === "object" && !Array.isArray(inner)) return inner as ApplicantProfile;
  return data as ApplicantProfile;
}

export function genderLabel(g: unknown): string | undefined {
  const v = String(g ?? "").toUpperCase();
  if (v === "MALE" || v === "1" || v === "M") return "Erkak";
  if (v === "FEMALE" || v === "2" || v === "F") return "Ayol";
  return g ? String(g) : undefined;
}

export interface ProfileItem {
  key: string;
  label: string;
  value?: string | null;
  locked: boolean;
  mono?: boolean;
  span?: 1 | 2;
}

export interface ProfileSection {
  key: "personal" | "passport" | "contact";
  title: string;
  items: ProfileItem[];
}

function first(...values: unknown[]): string | undefined {
  for (const v of values) if (v !== undefined && v !== null && v !== "") return String(v);
  return undefined;
}

/** Shaxsiy / Pasport / Aloqa va ish joyi — the data rows of the profile page. */
export function profileSections(p: ApplicantProfile): ProfileSection[] {
  const item = (
    key: string,
    label: string,
    value: string | undefined,
    extra: Partial<Pick<ProfileItem, "mono" | "span">> = {}
  ): ProfileItem => ({ key, label, value, locked: isFieldLocked(p, key), ...extra });

  return [
    {
      key: "personal",
      title: "Shaxsiy",
      items: [
        item("last_name", "Familiya", first(p.last_name)),
        item("first_name", "Ism", first(p.first_name)),
        item("middle_name", "Otasining ismi", first(p.middle_name)),
        item("birth_date", "Tug'ilgan sana", first(p.birth_date), { mono: true }),
        item("birth_place", "Tug'ilgan joyi", first(p.birth_place)),
        item("gender", "Jinsi", genderLabel(p.gender)),
        item("nation", "Millati", first(p.nation, p.nationality)),
        item("citizen", "Fuqaroligi", first(p.citizen, p.citizenship)),
      ],
    },
    {
      key: "passport",
      title: "Pasport",
      items: [
        item("pinfl", "JSHSHIR (PINFL)", first(p.pinfl), { mono: true }),
        item("passport_seria", "Seriya", first(p.passport_seria, p.passport_series), { mono: true }),
        item("passport_number", "Raqam", first(p.passport_number), { mono: true }),
        item("passport_issued_by", "Kim tomonidan berilgan", first(p.passport_issued_by), { span: 2 }),
        item("passport_issued_date", "Berilgan sana", first(p.passport_issued_date), { mono: true }),
        item("passport_expiry_date", "Amal qilish muddati", first(p.passport_expiry_date), { mono: true }),
      ],
    },
    {
      key: "contact",
      title: "Aloqa va ish joyi",
      items: [
        item("phone_number", "Telefon", first(p.phone_number), { mono: true }),
        item("email", "Elektron pochta", first(p.email)),
        item("organization", "Tashkilot", first(p.organization), { span: 2 }),
        item("permanent_address", "Doimiy yashash manzili", first(p.permanent_address), { span: 2 }),
      ],
    },
  ];
}
