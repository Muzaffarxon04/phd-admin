import { describe, expect, it } from "vitest";
import { displayValue, nationalDigits, nextValue, valueToDigits } from "./phone";

/** Simulates typing into the controlled field: value -> shown text -> + key -> new value. */
function type(keys: string, start = ""): string {
  let value = start;
  for (const key of keys) value = nextValue(displayValue(value) + key);
  return value;
}

describe("PhoneInput value round-trip", () => {
  it("keeps each typed digit (regression: '+9989' was read back as '9989')", () => {
    expect(nextValue("9")).toBe("+9989");
    expect(displayValue("+9989")).toBe("9");
    expect(type("90")).toBe("+99890");
    expect(type("901234567")).toBe("+998901234567");
    expect(displayValue(type("901234567"))).toBe("90 123 45 67");
  });

  it("stops at 9 national digits", () => {
    expect(type("9012345678")).toBe("+998901234567");
  });

  it("deletes digits", () => {
    expect(nextValue("90 123 4")).toBe("+998901234");
    expect(nextValue("")).toBe("");
  });

  it("accepts pasted full numbers", () => {
    expect(nextValue("+998 90 123 45 67")).toBe("+998901234567");
    expect(nextValue("998901234567")).toBe("+998901234567");
  });

  it("reads stored values", () => {
    expect(valueToDigits("+998901234567")).toBe("901234567");
    expect(valueToDigits("998901234567")).toBe("901234567");
    expect(valueToDigits(undefined)).toBe("");
    expect(nationalDigits("+998 (90) 123-45-67")).toBe("901234567");
  });
});
