"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckOutlined } from "@ant-design/icons";
import { ThemeToggle } from "@/components/applicant/shell/ThemeToggle";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Wider form column (wizard). */
  wide?: boolean;
  /** Optional element above the title (e.g. progress). */
  top?: React.ReactNode;
}

const POINTS = [
  "Shaxsingizni TSMU ID orqali bir marta tasdiqlang",
  "Arizani onlayn to'ldiring va hujjatlarni yuklang",
  "Ko'rib chiqish holatini real vaqtda kuzating",
];

function BrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-[#09090b] text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at 30% 20%, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at 30% 20%, black 20%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-32 h-[420px] w-[420px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.35), transparent 65%)" }}
      />

      <Link href="/" className="relative flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
          <Image src="/logo.png" alt="" width={28} height={28} />
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-semibold">TSMU Doktorantura</span>
          <span className="block text-xs text-zinc-400">ilm.tashmeduni.uz</span>
        </span>
      </Link>

      <div className="relative max-w-md">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.14em] text-indigo-300">PhD · DSc qabul tizimi</p>
        <h2 className="text-[34px] font-semibold leading-[1.15] tracking-tight text-white">
          Doktoranturaga hujjat topshirish — bir joyda.
        </h2>
        <ul className="mt-8 flex flex-col gap-3.5">
          {POINTS.map((p) => (
            <li key={p} className="flex items-start gap-3 text-sm text-zinc-300">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] text-indigo-300">
                <CheckOutlined />
              </span>
              {p}
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-xs text-zinc-500">© Toshkent davlat tibbiyot universiteti</p>
    </aside>
  );
}

export function AuthLayout({ title, subtitle, children, footer, wide, top }: AuthLayoutProps) {
  return (
    <div className="applicant-app grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <BrandPanel />
      <div className="flex min-w-0 flex-col">
        <header className="flex h-16 items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 lg:invisible" aria-label="Bosh sahifa">
            <Image src="/logo.png" alt="" width={28} height={28} />
            <span className="text-sm font-semibold text-text">TSMU Doktorantura</span>
          </Link>
          <ThemeToggle />
        </header>
        <main className="flex flex-1 justify-center px-4 pb-12 pt-4 sm:px-8 sm:pt-10 lg:items-center lg:pt-0">
          <div className={cn("w-full animate-enter", wide ? "max-w-[480px]" : "max-w-[400px]")}>
            {top}
            <h1 className="text-2xl font-semibold tracking-tight text-text">{title}</h1>
            {subtitle && <p className="mt-2 text-sm leading-6 text-muted">{subtitle}</p>}
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-8 text-center text-sm text-muted">{footer}</div>}
          </div>
        </main>
      </div>
    </div>
  );
}
