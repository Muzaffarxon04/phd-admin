#!/usr/bin/env node
/**
 * Responsive smoke check for the applicant UI.
 *
 * Visits every client page at 375 / 768 / 1280 px with the backend mocked
 * (route interception + fixtures), asserts there is no horizontal overflow
 * (document.scrollWidth <= innerWidth), checks the identity gate, and saves
 * full-page screenshots.
 *
 *   npm run build && npx next start -p 3100   # in one terminal
 *   BASE_URL=http://localhost:3100 npm run ui:check
 *
 * Env: BASE_URL (default http://localhost:3000), OUT_DIR (default ui-screenshots),
 *      PW_CHROMIUM (chrome.exe path; defaults to the newest ms-playwright chromium).
 */
import { chromium } from "playwright-core";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import os from "node:os";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const OUT_DIR = process.env.OUT_DIR || "ui-screenshots";
const WIDTHS = [375, 768, 1280];

/* ------------------------------------------------------------------ */
/* Fixtures (shapes mirror project4 responses)                         */
/* ------------------------------------------------------------------ */

const LONG_NAME = "Abdurahmonova Gulnoza Abdurashidovna-Qodirova";
const profile = {
  first_name: "Gulnoza",
  last_name: "Abdurahmonova",
  middle_name: "Abdurashidovna-Qodirova",
  full_name: LONG_NAME,
  phone_number: "+998901234567",
  email: "gulnoza@example.uz",
  birth_date: "1996-04-12",
  birth_place: "Toshkent shahri, Yunusobod tumani",
  citizen: "O'zbekiston Respublikasi",
  nation: "O'zbek",
  gender: "FEMALE",
  pinfl: "31204969000011",
  passport_seria: "AE",
  passport_number: "7515765",
  organization: "Toshkent tibbiyot akademiyasi, Biokimyo kafedrasi",
  permanent_address: "Toshkent sh., Yunusobod t., 4-mavze, 12-uy, 45-xonadon",
  is_verified: true,
  identity_verified_at: "2026-10-07T08:00:00Z",
  photo_url: null,
  locked_fields: ["first_name", "last_name", "middle_name", "birth_date", "birth_place", "citizen", "nation", "pinfl", "passport_seria", "passport_number"],
  role: "applicant",
};

const fields = [
  { id: 1, label: "Ilmiy ish mavzusi (to'liq nomi, uzun bo'lishi mumkin)", field_type: "TEXTAREA", required: true, order: 1, max_length: 500 },
  { id: 2, label: "Ilmiy rahbar", field_type: "TEXT", required: true, order: 2 },
  { id: 3, label: "Chet tili", field_type: "SELECT", required: false, order: 3, options: ["Ingliz", "Nemis", "Fransuz"] },
  { id: 4, label: "Diplom nusxasi", field_type: "FILE", required: true, order: 4, allowed_file_types: ["pdf", "jpg"], max_file_size: 5 },
  { id: 5, label: "Tug'ilgan sana (tasdiq)", field_type: "DATE", required: false, order: 5 },
];
const specialities = [
  { id: 11, code: "03.00.01", name: "Biokimyo", is_foreign: false, comment: "Tavsiyanoma shart", file: null },
  { id: 12, code: "14.00.05", name: "Ichki kasalliklar — juda uzun mutaxassislik nomi sinov uchun", is_foreign: false },
  { id: 21, code: "10.02.04", name: "German tillari", is_foreign: true },
];
const application = {
  id: 1,
  title: "2026/2027 o'quv yili uchun tayanch doktorantura va doktoranturaga qabul e'loni (kuzgi)",
  description: "Toshkent tibbiyot akademiyasi tayanch doktorantura (PhD) va doktorantura (DSc) bo'yicha qabul e'lon qiladi.\nHujjatlar onlayn qabul qilinadi.",
  start_date: "2026-09-01T09:00:00Z",
  end_date: "2026-10-09T23:59:00Z",
  exam_date: "2026-11-15T10:00:00Z",
  application_fee: "500000.00",
  can_apply: true,
  can_apply_message: null,
  instructions: "Diplom nusxasi PDF ko'rinishida bo'lishi shart.",
  user_submission_count: 1,
  fields,
  specialities,
};
const applications = [
  application,
  { ...application, id: 2, title: "Stajyor-tadqiqotchi uchun qabul", end_date: "2026-12-20T23:59:00Z", exam_date: null, user_submission_count: 0, can_apply: false, can_apply_message: "Siz allaqachon ariza topshirgansiz" },
  { ...application, id: 3, title: "Yopilgan e'lon", end_date: "2026-09-30T23:59:00Z" },
];

const snapshot = { ...profile, passport_series: "AE", nationality: "O'zbek", citizenship: "O'zbekiston", captured_at: "2026-10-07T09:00:00Z" };
const submissionDetail = {
  id: 1,
  submission_number: "TMA-2026-000123",
  application: { id: 1, title: application.title, application_fee: "500000.00", end_date: application.end_date },
  status: "UNDER_REVIEW",
  payment_status: "PAID",
  review_notes: null,
  education_form: "TAYANCH_DOKTORANTURA_PHD",
  speciality: { id: 11, name: "Biokimyo", code: "03.00.01" },
  answers: [
    { id: 1, field: 1, field_label: fields[0].label, field_type: "TEXTAREA", answer: "Qandli diabetning 2-turi bilan og'rigan bemorlarda oksidlanish stressining biokimyoviy markerlari" },
    { id: 2, field: 2, field_label: "Ilmiy rahbar", field_type: "TEXT", answer: "prof. A. Karimov" },
    { id: 3, field: 3, field_label: "Chet tili", field_type: "SELECT", answer_text: "Ingliz" },
    { id: 4, field: 4, field_label: "Diplom nusxasi", field_type: "FILE", answer: "/media/answers/diplom.pdf" },
  ],
  documents: [{ id: 1, document_type: "Diplom", file: "/media/docs/diplom.pdf", status: "APPROVED", uploaded_at: "2026-10-05T10:00:00Z" }],
  applicant_snapshot: snapshot,
  can_edit: true,
  can_submit: false,
  created_at: "2026-10-05T09:30:00Z",
  submitted_at: "2026-10-05T12:00:00Z",
  updated_at: "2026-10-06T08:00:00Z",
};
const submissions = [
  { id: 1, submission_number: "TMA-2026-000123", application_title: application.title, status: "UNDER_REVIEW", payment_status: "PAID", education_form: "TAYANCH_DOKTORANTURA_PHD", created_at: "2026-10-05T09:30:00Z", submitted_at: "2026-10-05T12:00:00Z" },
  { id: 2, submission_number: "TMA-2026-000124", application_title: "Stajyor-tadqiqotchi uchun qabul", status: "DRAFT", payment_status: "PENDING", education_form: "STAJYOR_TADQIQOTCHI", created_at: "2026-10-06T09:30:00Z" },
];

function mockResponse(url, verified) {
  const p = new URL(url).pathname.replace(/\/+$/, "");
  const ok = (data) => ({ status: 200, body: data });
  if (p.endsWith("/applicant/profile")) return ok({ data: { ...profile, is_verified: verified, locked_fields: verified ? profile.locked_fields : [] } });
  if (p.endsWith("/auth/me")) return ok({ data: { ...profile, is_verified: verified } });
  if (p.endsWith("/applicant/applications")) return ok({ data: { data: applications } });
  if (/\/applicant\/applications\/\d+$/.test(p)) return ok({ data: application });
  if (p.endsWith("/applicant/my-submissions")) return ok({ data: { data: submissions } });
  if (/\/applicant\/my-submissions\/\d+$/.test(p)) return ok({ data: submissionDetail });
  if (p.includes("/related-foreign")) return ok({ data: { foreign_specialities: [specialities[2]], other_specialities: [specialities[0]] } });
  return { status: 404, body: { code: "NOT_FOUND", message: "mock: no fixture for " + p } };
}

/* ------------------------------------------------------------------ */
/* Pages                                                               */
/* ------------------------------------------------------------------ */

const PUBLIC_PAGES = ["/", "/login", "/register", "/register?method=phone", "/register/tsmu-id", "/forgot-password"];
const AUTH_PAGES = ["/dashboard", "/applications", "/applications/1", "/my-submissions", "/my-submissions/1", "/verify-identity"];

function slug(route) {
  return route.replace(/^\//, "").replace(/[/?=&]+/g, "_") || "landing";
}

function findChromium() {
  if (process.env.PW_CHROMIUM) return process.env.PW_CHROMIUM;
  const root = path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local"), "ms-playwright");
  if (!existsSync(root)) return undefined;
  const dirs = readdirSync(root).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => Number(b.split("-")[1]) - Number(a.split("-")[1]));
  for (const d of dirs) {
    for (const rel of ["chrome-win64/chrome.exe", "chrome-win/chrome.exe", "chrome-linux/chrome", "chrome-mac/Chromium.app/Contents/MacOS/Chromium"]) {
      const exe = path.join(root, d, rel);
      if (existsSync(exe)) return exe;
    }
  }
  return undefined;
}

async function run() {
  const executablePath = findChromium();
  const browser = await chromium.launch({ executablePath, headless: true });
  const results = [];
  let failures = 0;

  for (const width of WIDTHS) {
    for (const auth of [false, true]) {
      const pages = auth ? AUTH_PAGES : PUBLIC_PAGES;
      const context = await browser.newContext({ viewport: { width, height: width < 768 ? 760 : 900 }, deviceScaleFactor: 1, locale: "uz-UZ" });
      await context.route("**/api/v1/**", async (route) => {
        const { status, body } = mockResponse(route.request().url(), true);
        await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
      });
      if (auth) {
        await context.addInitScript((user) => {
          localStorage.setItem("access_token", "test-access");
          localStorage.setItem("refresh_token", "test-refresh");
          localStorage.setItem("user", JSON.stringify(user));
        }, { ...profile, id: 1 });
      }
      for (const route of pages) {
        const page = await context.newPage();
        const errors = [];
        page.on("pageerror", (e) => errors.push(String(e.message || e)));
        try {
          await page.goto(BASE_URL + route, { waitUntil: "networkidle", timeout: 45000 });
          await page.waitForTimeout(400);
          const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth, title: document.title }));
          const overflow = m.sw > m.iw;
          const dir = path.join(OUT_DIR, String(width));
          mkdirSync(dir, { recursive: true });
          await page.screenshot({ path: path.join(dir, `${slug(route)}.png`), fullPage: true });
          const ok = !overflow && errors.length === 0;
          if (!ok) failures++;
          results.push({ width, route, scrollWidth: m.sw, innerWidth: m.iw, overflow, errors: errors.length, ok });
        } catch (e) {
          failures++;
          results.push({ width, route, overflow: null, errors: 1, ok: false, note: String(e.message || e).split("\n")[0] });
        } finally {
          await page.close();
        }
      }
      await context.close();
    }
  }

  // Identity gate: an unverified user must see the gate, a verified one the form.
  for (const verified of [false, true]) {
    const context = await browser.newContext({ viewport: { width: 375, height: 760 } });
    await context.route("**/api/v1/**", async (route) => {
      const { status, body } = mockResponse(route.request().url(), verified);
      await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
    });
    await context.addInitScript((user) => {
      localStorage.setItem("access_token", "t");
      localStorage.setItem("refresh_token", "r");
      localStorage.setItem("user", JSON.stringify(user));
    }, { ...profile, is_verified: verified });
    const page = await context.newPage();
    await page.goto(BASE_URL + "/applications/1", { waitUntil: "networkidle", timeout: 45000 });
    const gate = await page.getByText("Avval shaxsingizni tasdiqlang").count();
    const form = await page.getByText("Ta'lim shakli", { exact: false }).count();
    const ok = verified ? gate === 0 && form > 0 : gate > 0 && form === 0;
    if (!ok) failures++;
    results.push({ width: 375, route: `/applications/1 (${verified ? "verified" : "unverified"})`, gate, form, ok });
    mkdirSync(path.join(OUT_DIR, "gate"), { recursive: true });
    await page.screenshot({ path: path.join(OUT_DIR, "gate", `${verified ? "verified" : "unverified"}.png`), fullPage: true });
    await context.close();
  }

  await browser.close();
  console.table(results.map(({ ok, width, route, scrollWidth, innerWidth, errors, gate, form, note }) => ({ ok: ok ? "✓" : "✗", width, route, scrollWidth, innerWidth, errors, gate, form, note })));
  console.log(`${results.length - failures}/${results.length} checks passed. Screenshots: ${path.resolve(OUT_DIR)}`);
  process.exit(failures ? 1 : 0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
