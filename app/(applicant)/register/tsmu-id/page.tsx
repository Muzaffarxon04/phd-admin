"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { tokenStorage } from "@/lib/utils";
import { AuthLayout } from "@/components/applicant/auth/AuthLayout";
import { TsmuIdWizard } from "@/components/applicant/tsmu-id/TsmuIdWizard";
import type { User } from "@/types";

export default function TsmuIdRegisterPage() {
  const router = useRouter();

  // Already signed in: send to identity verification (or the cabinet if already verified).
  useEffect(() => {
    if (!tokenStorage.getAccessToken()) return;
    const user = tokenStorage.getUser() as User | null;
    if (user?.role === "SUPER_ADMIN") return;
    router.replace(user?.is_verified ? "/dashboard" : "/verify-identity?next=/dashboard");
  }, [router]);

  return (
    <TsmuIdWizard mode="register">
      {({ title, subtitle, progress, body }) => (
        <AuthLayout
          wide
          title={title}
          subtitle={subtitle}
          top={
            <>
              <Link
                href="/register"
                className="mb-6 inline-flex text-[13px] font-medium text-muted transition-colors hover:text-text"
              >
                ← Boshqa usul
              </Link>
              {progress}
            </>
          }
          footer={
            <>
              Akkauntingiz bormi?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Kirish
              </Link>
            </>
          }
        >
          {body}
        </AuthLayout>
      )}
    </TsmuIdWizard>
  );
}
