import { describe, expect, it } from "vitest";
import {
  EDITABLE_FIELDS,
  genderLabel,
  isFieldLocked,
  profileSections,
  unwrapProfile,
} from "@/lib/applicant/profile";
import type { ApplicantProfile } from "@/types";

const verified: ApplicantProfile = {
  first_name: "Mirazizbek",
  last_name: "Maxmudjonov",
  middle_name: "Baxtiyor o'g'li",
  phone_number: "+998901234567",
  email: "a@b.uz",
  birth_date: "1999-05-14",
  birth_place: "Toshkent",
  citizen: "O'zbekiston",
  nation: "O'zbek",
  gender: "MALE",
  pinfl: "31405990000001",
  passport_seria: "AE",
  passport_number: "7515765",
  organization: "TTA",
  permanent_address: "Toshkent sh.",
  is_verified: true,
  locked_fields: [
    "first_name", "last_name", "middle_name", "birth_date", "birth_place",
    "citizen", "nation", "pinfl", "passport_seria", "passport_number",
  ],
};

const unverified: ApplicantProfile = { ...verified, is_verified: false, locked_fields: [] };

describe("unwrapProfile", () => {
  it("unwraps the {data} envelope", () => {
    expect(unwrapProfile({ data: { email: "x" } })).toEqual({ email: "x" });
  });
  it("returns a bare profile object as-is", () => {
    expect(unwrapProfile({ email: "x" })).toEqual({ email: "x" });
  });
  it("returns undefined for nullish input", () => {
    expect(unwrapProfile(undefined)).toBeUndefined();
    expect(unwrapProfile(null)).toBeUndefined();
  });
});

describe("isFieldLocked", () => {
  it("locks fields listed by the backend", () => {
    expect(isFieldLocked(verified, "pinfl")).toBe(true);
  });
  it("resolves aliases (nationality ↔ nation, passport_series ↔ passport_seria)", () => {
    expect(isFieldLocked(verified, "nationality")).toBe(true);
    expect(isFieldLocked(verified, "passport_series")).toBe(true);
  });
  it("phone number is always read-only", () => {
    expect(isFieldLocked(unverified, "phone_number")).toBe(true);
  });
  it("does not lock identity fields for an unverified profile", () => {
    expect(isFieldLocked(unverified, "pinfl")).toBe(false);
    expect(isFieldLocked(unverified, "email")).toBe(false);
  });
  it("never locks email/organization/address even when verified", () => {
    expect(isFieldLocked(verified, "email")).toBe(false);
    expect(isFieldLocked(verified, "organization")).toBe(false);
    expect(isFieldLocked(verified, "permanent_address")).toBe(false);
  });
});

describe("genderLabel", () => {
  it("maps backend codes to Uzbek labels", () => {
    expect(genderLabel("MALE")).toBe("Erkak");
    expect(genderLabel("FEMALE")).toBe("Ayol");
    expect(genderLabel(null)).toBeUndefined();
  });
});

describe("profileSections", () => {
  it("builds the three sections in order", () => {
    expect(profileSections(verified).map((s) => s.title)).toEqual(["Shaxsiy", "Pasport", "Aloqa va ish joyi"]);
  });
  it("marks TSMU ID fields as locked for a verified profile", () => {
    const personal = profileSections(verified)[0];
    const pinfl = profileSections(verified)[1].items.find((i) => i.key === "pinfl");
    expect(personal.items.find((i) => i.key === "birth_date")?.locked).toBe(true);
    expect(pinfl?.locked).toBe(true);
    expect(pinfl?.value).toBe("31405990000001");
  });
  it("leaves fields unlocked for an unverified profile", () => {
    const all = profileSections(unverified).flatMap((s) => s.items);
    expect(all.filter((i) => i.key !== "phone_number").every((i) => !i.locked)).toBe(true);
  });
  it("formats gender and falls back across aliases", () => {
    const all = profileSections({ ...verified, nation: null, nationality: "Qozoq" }).flatMap((s) => s.items);
    expect(all.find((i) => i.key === "gender")?.value).toBe("Erkak");
    expect(all.find((i) => i.key === "nation")?.value).toBe("Qozoq");
  });
});

describe("EDITABLE_FIELDS", () => {
  it("only email, organization and address are editable in the profile sheet", () => {
    expect(EDITABLE_FIELDS).toEqual(["email", "organization", "permanent_address"]);
  });
});
