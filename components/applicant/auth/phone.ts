/** Uzbek mobile number helpers shared by PhoneInput and the auth forms. */

/** Extract the 9 national digits from any user input / stored value. */
export function nationalDigits(raw: string | undefined | null): string {
  let d = String(raw ?? "").replace(/\D/g, "");
  if (d.length > 9 && d.startsWith("998")) d = d.slice(3);
  return d.slice(0, 9);
}

/**
 * National digits of a PhoneInput value. The value is "+998" + the digits typed so far, so the
 * country code is stripped by prefix — not by length — or a partial number like "+9989" would be
 * read back as "9989" and every keystroke would garble the field.
 */
export function valueToDigits(value: string | undefined | null): string {
  const s = String(value ?? "");
  if (s.startsWith("+998")) return s.slice(4).replace(/\D/g, "").slice(0, 9);
  return nationalDigits(s);
}

/** "901234567" -> "90 123 45 67" */
export function formatNational(d: string): string {
  const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
  return parts.join(" ");
}

/** What the field shows for a value. */
export function displayValue(value: string | undefined | null): string {
  return formatNational(valueToDigits(value));
}

/** New value for whatever the user typed or pasted into the (national-part) field. */
export function nextValue(typed: string): string {
  const d = nationalDigits(typed);
  return d ? `+998${d}` : "";
}

export const PHONE_PATTERN = /^\+998\d{9}$/;
