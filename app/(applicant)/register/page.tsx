"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { tokenStorage } from "@/lib/utils";
import { AuthLayout } from "@/components/applicant/auth/AuthLayout";
import { TsmuIdWizard } from "@/components/applicant/tsmu-id/TsmuIdWizard";
import type { User } from "@/types";

/**
 * Registration is TSMU ID only: JSHSHIR + birth date → face check → phone (SMS) → password.
 * The old phone-only sign-up (`/register?method=phone`, `auth/register/*`) is gone.
 */
export default function RegisterPage() {
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
          top={progress}
          footer={
            <>
              Akkauntingiz bormi?{" "}
              <Link href="/login" className="inline-flex min-h-11 items-center font-medium text-primary hover:underline">
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
