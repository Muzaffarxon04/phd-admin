import Link from "next/link";
import { Button } from "antd";
import { SafetyCertificateOutlined } from "@ant-design/icons";

interface VerifyIdentityGateProps {
  /** Where to come back after verification (same-origin path). */
  next: string;
}

/** Shown instead of the application form when the user's identity is not TSMU ID verified. */
export function VerifyIdentityGate({ next }: VerifyIdentityGateProps) {
  const href = `/verify-identity?next=${encodeURIComponent(next)}`;
  return (
    <section className="rounded-xl border border-border bg-surface p-6 text-center sm:p-10">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-warning-soft text-2xl text-warning">
        <SafetyCertificateOutlined />
      </span>
      <h2 className="mt-5 text-lg font-semibold text-text">Avval shaxsingizni tasdiqlang</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
        Ariza yuborish faqat TSMU ID orqali tasdiqlangan foydalanuvchilarga ochiq. JSHSHIR, tug&apos;ilgan sana va
        kamera orqali yuzni tekshirish 2 daqiqa oladi. Tasdiqlashdan so&apos;ng shu sahifaga qaytasiz.
      </p>
      <ol className="mx-auto mt-5 flex max-w-md flex-col gap-2 text-left text-[13px] text-muted sm:flex-row sm:justify-center sm:gap-6">
        <li className="flex items-center gap-2">
          <span className="tabular flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold text-text">1</span>
          JSHSHIR va tug&apos;ilgan sana
        </li>
        <li className="flex items-center gap-2">
          <span className="tabular flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold text-text">2</span>
          Kamera orqali yuz tekshiruvi
        </li>
        <li className="flex items-center gap-2">
          <span className="tabular flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold text-text">3</span>
          Ariza formasi ochiladi
        </li>
      </ol>
      <Link href={href} className="mt-6 inline-block w-full sm:w-auto">
        <Button type="primary" size="large" block>
          Shaxsni tasdiqlash
        </Button>
      </Link>
    </section>
  );
}
