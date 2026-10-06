"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { safeNext } from "@/lib/applicant/session";
import { TsmuIdWizard } from "@/components/applicant/tsmu-id/TsmuIdWizard";

function VerifyIdentity() {
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));

  return (
    <TsmuIdWizard mode="verify" next={next}>
      {({ title, subtitle, progress, body }) => (
        <div className="mx-auto w-full max-w-[520px] md:pt-4">
          {progress}
          {title && <h1 className="text-[22px] font-semibold tracking-tight text-text sm:text-2xl">{title}</h1>}
          {subtitle && <p className="mt-2 text-sm leading-6 text-muted">{subtitle}</p>}
          <div className={title || subtitle ? "mt-8" : undefined}>{body}</div>
        </div>
      )}
    </TsmuIdWizard>
  );
}

export default function VerifyIdentityPage() {
  return (
    <Suspense fallback={null}>
      <VerifyIdentity />
    </Suspense>
  );
}
