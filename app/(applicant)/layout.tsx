"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Spin } from "antd";
import { tokenStorage } from "@/lib/utils";
import { AppShell } from "@/components/applicant/shell/AppShell";

/** Routes rendered without the app shell and without auth. */
const PUBLIC_ROUTES = ["/", "/login", "/register", "/register/tsmu-id", "/forgot-password", "/reset-password"];

/** Routes that require an access token. */
const PROTECTED_PREFIXES = ["/dashboard", "/applications", "/my-submissions", "/verify-identity"];

function isPublic(pathname: string) {
  return PUBLIC_ROUTES.includes(pathname);
}

export default function ApplicantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const publicRoute = isPublic(pathname);

  useEffect(() => {
    // requestAnimationFrame avoids a synchronous setState inside the effect
    const checkAuth = () => {
      if (publicRoute) {
        setIsChecking(false);
        return;
      }
      const accessToken = tokenStorage.getAccessToken();
      const isProtected = PROTECTED_PREFIXES.some((route) => pathname.startsWith(route));
      if (isProtected && !accessToken) {
        const next = encodeURIComponent(window.location.pathname + window.location.search);
        router.replace(`/login?next=${next}`);
        return;
      }
      setIsChecking(false);
    };
    const id = requestAnimationFrame(checkAuth);
    return () => cancelAnimationFrame(id);
  }, [pathname, router, publicRoute]);

  if (publicRoute) {
    return <>{children}</>;
  }

  if (isChecking) {
    return (
      <div className="applicant-app flex min-h-dvh items-center justify-center">
        <Spin />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
