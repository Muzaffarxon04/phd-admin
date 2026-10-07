"use client";

import Link from "next/link";
import Image from "next/image";
import { useSyncExternalStore } from "react";
import {
  ArrowRightOutlined,
  CheckOutlined,
  FileDoneOutlined,
  SafetyCertificateOutlined,
  ScanOutlined,
  LineChartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { tokenStorage } from "@/lib/utils";
import { HELP_TELEGRAM_URL } from "@/lib/applicant/session";
import { ThemeToggle } from "@/components/applicant/shell/ThemeToggle";

const noopSubscribe = () => () => {};

function useSessionInfo() {
  const isLoggedIn = useSyncExternalStore(noopSubscribe, () => !!tokenStorage.getAccessToken(), () => false);
  const role = useSyncExternalStore(
    noopSubscribe,
    () => (tokenStorage.getUser() as { role?: string } | null)?.role ?? "applicant",
    () => "applicant"
  );
  return { isLoggedIn, cabinetHref: role === "SUPER_ADMIN" ? "/admin-panel" : "/dashboard" };
}

const STEPS = [
  {
    icon: <ScanOutlined />,
    title: "Shaxsni tasdiqlang",
    text: "JSHSHIR va tug'ilgan sanangizni kiriting, kamera orqali yuz tekshiruvidan o'ting. Telefon raqamingizni SMS orqali tasdiqlab, parol o'rnating.",
  },
  {
    icon: <FileDoneOutlined />,
    title: "Arizani to'ldiring",
    text: "Mutaxassislik va ta'lim shaklini tanlang, kerakli hujjatlarni yuklang. Shaxsiy ma'lumotlar avtomatik biriktiriladi.",
  },
  {
    icon: <LineChartOutlined />,
    title: "Holatini kuzating",
    text: "Komissiya ko'rib chiqish jarayonini shaxsiy kabinetingizda real vaqtda kuzatib boring.",
  },
];

function ProductPreview() {
  const rows = [
    { label: "Qoralama", done: true },
    { label: "Yuborildi", done: true },
    { label: "Ko'rib chiqilmoqda", current: true },
    { label: "Natija" },
  ];
  return (
    <div className="relative mx-auto w-full max-w-[420px]" aria-hidden>
      <div className="absolute -inset-6 -z-10 rounded-[28px] bg-[radial-gradient(closest-side,var(--color-primary-soft),transparent)] opacity-80" />
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
            <UserOutlined />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-text">Shaxsiy kabinet</p>
            <p className="text-xs text-muted">TSMU ID</p>
          </div>
          <span className="inline-flex h-6 items-center gap-1 rounded-full bg-success-soft px-2 text-[11px] font-medium text-success">
            <SafetyCertificateOutlined /> Tasdiqlangan
          </span>
        </div>
        <div className="my-5 h-px bg-border" />
        <p className="text-xs font-medium text-muted">Ariza #2026-0148</p>
        <p className="mt-1 text-[15px] font-semibold text-text">Tayanch doktorantura (PhD) — 2026</p>
        <ol className="mt-5 flex flex-col gap-3">
          {rows.map((r) => (
            <li key={r.label} className="flex items-center gap-3 text-sm">
              <span
                className={
                  r.done
                    ? "flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-on-primary"
                    : r.current
                      ? "h-5 w-5 rounded-full border-2 border-primary bg-primary-soft"
                      : "h-5 w-5 rounded-full border border-border-strong"
                }
              >
                {r.done && <CheckOutlined />}
              </span>
              <span className={r.current ? "font-medium text-text" : r.done ? "text-text" : "text-muted"}>
                {r.label}
              </span>
              {r.current && (
                <span className="ml-auto rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-medium text-primary">
                  Hozir
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default function ApplicantHome() {
  const { isLoggedIn, cabinetHref } = useSessionInfo();

  return (
    <div className="applicant-app min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <Image src="/logo.png" alt="" width={30} height={30} />
            <span className="truncate text-sm font-semibold text-text">TSMU Doktorantura</span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <a
              href="#how-it-works"
              className="hidden rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-text md:inline-flex"
            >
              Qanday ishlaydi
            </a>
            <ThemeToggle />
            {isLoggedIn ? (
              <Link
                href={cabinetHref}
                className="inline-flex h-11 items-center rounded-lg bg-primary px-4 sm:h-10 text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover"
              >
                Kabinet
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex h-11 items-center rounded-lg border border-border bg-surface px-4 sm:h-10 text-sm font-medium text-text transition-colors hover:bg-surface-2"
              >
                Kirish
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-[1200px] items-center gap-12 overflow-x-clip px-4 pb-16 pt-10 sm:gap-14 sm:px-6 sm:pb-20 sm:pt-14 md:pt-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:px-8 lg:pb-28 lg:pt-24">
          <div className="animate-enter">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              PhD va DSc qabuli · onlayn
            </span>
            <h1 className="mt-6 text-[34px] font-semibold leading-[1.1] tracking-tight text-text sm:text-5xl lg:text-[56px]">
              Doktoranturaga hujjat topshirish —{" "}
              <span className="text-primary">tez, xavfsiz va shaffof.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg">
              Toshkent davlat tibbiyot universiteti malakaviy imtihonlari uchun arizani onlayn topshiring. Shaxsingiz
              TSMU ID orqali bir marta tasdiqlanadi — qolgani bir necha daqiqa.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {isLoggedIn ? (
                <Link
                  href={cabinetHref}
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-[15px] font-medium text-on-primary transition-colors hover:bg-primary-hover"
                >
                  Kabinetga o&apos;tish
                  <ArrowRightOutlined className="text-xs transition-transform group-hover:translate-x-0.5" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="group inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-[15px] font-medium text-on-primary transition-colors hover:bg-primary-hover"
                  >
                    <SafetyCertificateOutlined />
                    TSMU ID orqali boshlash
                    <ArrowRightOutlined className="text-xs transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-surface px-6 text-[15px] font-medium text-text transition-colors hover:bg-surface-2"
                  >
                    Kirish
                  </Link>
                </>
              )}
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-muted">
              {["TSMU ID orqali tasdiqlash", "Yuz tekshiruvi", "SMS tasdiq"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckOutlined className="text-[11px] text-primary" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <ProductPreview />
        </section>

        <section id="how-it-works" className="border-t border-border bg-surface">
          <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">Qanday ishlaydi</p>
            <h2 className="mt-3 max-w-xl text-[28px] font-semibold leading-tight tracking-tight text-text sm:text-4xl">
              Uch qadamda ariza topshiring
            </h2>
            <ol className="mt-10 grid gap-4 sm:mt-12 md:grid-cols-3 md:gap-6">
              {STEPS.map((s, i) => (
                <li key={s.title} className="rounded-xl border border-border bg-bg p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-lg text-primary">
                      {s.icon}
                    </span>
                    <span className="tabular text-sm font-medium text-muted">0{i + 1}</span>
                  </div>
                  <h3 className="mt-6 text-base font-semibold text-text">{s.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-4 py-8 text-[13px] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Toshkent davlat tibbiyot universiteti</p>
          <a href={HELP_TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-text">
            Xato topdingizmi? Telegram orqali yozing
          </a>
        </div>
      </footer>
    </div>
  );
}
