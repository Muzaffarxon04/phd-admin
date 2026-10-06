import { describe, expect, it } from "vitest";
import { displayName, initials, safeNext } from "@/lib/applicant/session";

describe("safeNext", () => {
  it("accepts same-origin relative paths", () => {
    expect(safeNext("/applications/1")).toBe("/applications/1");
    expect(safeNext("/my-submissions?x=1")).toBe("/my-submissions?x=1");
  });
  it("rejects open-redirect shapes", () => {
    expect(safeNext("//evil.com")).toBe("/dashboard");
    expect(safeNext("/\\evil.com")).toBe("/dashboard");
    expect(safeNext("https://evil.com")).toBe("/dashboard");
    expect(safeNext("javascript:alert(1)")).toBe("/dashboard");
  });
  it("falls back when empty", () => {
    expect(safeNext(null)).toBe("/dashboard");
    expect(safeNext("", "/x")).toBe("/x");
  });
});

describe("displayName / initials", () => {
  it("prefers full_name, then composes last+first+middle", () => {
    expect(displayName({ full_name: "Ali Valiyev" })).toBe("Ali Valiyev");
    expect(displayName({ last_name: "Valiyev", first_name: "Ali" })).toBe("Valiyev Ali");
    expect(displayName(null)).toBe("Foydalanuvchi");
  });
  it("builds two-letter initials", () => {
    expect(initials({ last_name: "Valiyev", first_name: "Ali" })).toBe("VA");
    expect(initials(null)).toBe("F");
  });
});
