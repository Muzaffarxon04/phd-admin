"use client";

import { useSyncExternalStore } from "react";
import { tokenStorage } from "@/lib/utils";
import type { AuthTokens, User } from "@/types";

const USER_EVENT = "applicant:user-updated";

/** Persist tokens + user exactly like the login page does. */
export function saveSession(tokens: AuthTokens, user: User) {
  tokenStorage.setTokens(tokens.access, tokens.refresh);
  setStoredUser(user);
}

export function setStoredUser(user: User) {
  try {
    localStorage.setItem("user", JSON.stringify(user));
  } catch {
    /* storage unavailable */
  }
  if (typeof window !== "undefined") window.dispatchEvent(new Event(USER_EVENT));
}

/** Merge fields into the stored user (e.g. after profile refresh). */
export function mergeStoredUser(patch: Partial<User>) {
  const current = readUser() ?? {};
  setStoredUser({ ...current, ...patch });
}

export function clearSession() {
  tokenStorage.removeTokens();
  if (typeof window !== "undefined") window.dispatchEvent(new Event(USER_EVENT));
}

let cachedRaw: string | null | undefined;
let cachedUser: User | null = null;

function readUser(): User | null {
  if (typeof window === "undefined") return null;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem("user");
  } catch {
    raw = null;
  }
  if (raw === cachedRaw) return cachedUser;
  cachedRaw = raw;
  try {
    cachedUser = raw ? (JSON.parse(raw) as User) : null;
  } catch {
    cachedUser = null;
  }
  return cachedUser;
}

function subscribe(onChange: () => void) {
  window.addEventListener(USER_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(USER_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Reactive view of the user object stored in localStorage. `null` on the server. */
export function useStoredUser(): User | null {
  return useSyncExternalStore(subscribe, readUser, () => null);
}

export function displayName(user: Partial<User> | null | undefined): string {
  if (!user) return "Foydalanuvchi";
  const composed = [user.last_name, user.first_name, user.middle_name].filter(Boolean).join(" ").trim();
  return (user.full_name as string) || composed || "Foydalanuvchi";
}

export function initials(user: Partial<User> | null | undefined): string {
  const name = displayName(user);
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "F";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

/**
 * Only allow same-origin relative redirects (prevents open redirects via ?next=).
 *
 * Browsers strip ASCII tab/newline and treat "\" as "/" before parsing, so a naive
 * prefix check lets "/\t/evil.com" become "//evil.com". We reject any whitespace,
 * backslash or percent-encoded control character outright, then let the WHATWG URL
 * parser decide whether the result is still same-origin.
 */
export function safeNext(next: string | null | undefined, fallback = "/dashboard"): string {
  if (!next || !next.startsWith("/")) return fallback;
  if (/[\s\\]/.test(next) || /%[01][0-9a-f]/i.test(next)) return fallback;
  try {
    const base = "http://same-origin.invalid";
    const url = new URL(next, base);
    // Dot-segment normalisation can turn "/..//evil.com" into the pathname "//evil.com",
    // which a later router.push would treat as protocol-relative — check the *normalised* path.
    if (url.origin !== base || !url.pathname.startsWith("/") || url.pathname.startsWith("//")) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export const HELP_TELEGRAM_URL = "https://t.me/ScientificDepartment_TMA";
