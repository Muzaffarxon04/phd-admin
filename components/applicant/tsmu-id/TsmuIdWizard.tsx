"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Spin } from "antd";
import { tsmuIdApi } from "@/lib/api/tsmuId";
import { mergeStoredUser, saveSession } from "@/lib/applicant/session";
import type { TsmuLookupResponse } from "@/types";
import { StepLookup } from "./StepLookup";
import { StepFace } from "./StepFace";
import { StepPhone } from "./StepPhone";
import { StepPassword } from "./StepPassword";
import { StepDone } from "./StepDone";
import { WizardProgress } from "./WizardProgress";
import { tsmuError } from "./errors";

type Step = "lookup" | "face" | "attach" | "phone" | "password" | "done";

export interface WizardFrame {
  title: string;
  subtitle?: string;
  progress: React.ReactNode;
  body: React.ReactNode;
}

interface TsmuIdWizardProps {
  /** register: public sign-up; verify: attach identity to the logged-in account */
  mode: "register" | "verify";
  /** Where to go when finished (verify mode). */
  next?: string;
  children: (frame: WizardFrame) => React.ReactNode;
}

const REGISTER_STEPS: Step[] = ["lookup", "face", "phone", "password", "done"];
const REGISTER_LABELS = ["Ma'lumot", "Yuz", "Telefon", "Parol", "Tayyor"];
const VERIFY_STEPS: Step[] = ["lookup", "face", "done"];
const VERIFY_LABELS = ["Ma'lumot", "Yuz", "Tayyor"];

export function TsmuIdWizard({ mode, next = "/dashboard", children }: TsmuIdWizardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const authenticated = mode === "verify";

  const [step, setStep] = useState<Step>("lookup");
  const [session, setSession] = useState<TsmuLookupResponse | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [attachError, setAttachError] = useState<string | null>(null);
  // remount key so steps start clean after a restart
  const [round, setRound] = useState(0);

  const restart = useCallback((message: string) => {
    setSession(null);
    setNotice(message);
    setAttachError(null);
    setStep("lookup");
    setRound((r) => r + 1);
  }, []);

  const attach = useCallback(
    async (verificationId: string) => {
      setStep("attach");
      setAttachError(null);
      try {
        const res = await tsmuIdApi.attach(verificationId);
        if (res?.user) mergeStoredUser(res.user);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["/applicant/profile/"] }),
          queryClient.invalidateQueries({ queryKey: ["/auth/me/"] }),
        ]);
        setStep("done");
      } catch (err) {
        const info = tsmuError(err, { authenticated: true });
        if (info.action === "restart") restart(info.message);
        else setAttachError(info.message);
      }
    },
    [queryClient, restart]
  );

  const finish = useCallback(() => {
    router.push(mode === "verify" ? next : "/dashboard");
  }, [mode, next, router]);

  const steps = mode === "register" ? REGISTER_STEPS : VERIFY_STEPS;
  const labels = mode === "register" ? REGISTER_LABELS : VERIFY_LABELS;
  const progressIndex = Math.max(0, steps.indexOf(step === "attach" ? "face" : step));
  const progress = <WizardProgress steps={labels} current={progressIndex} />;

  let title = "";
  let subtitle: string | undefined;
  let body: React.ReactNode = null;

  switch (step) {
    case "lookup":
      title = mode === "register" ? "TSMU ID orqali ro'yxatdan o'tish" : "Shaxsingizni tasdiqlang";
      subtitle =
        "JSHSHIR va tug'ilgan sanangizni kiriting. Shaxsiy ma'lumotlaringiz davlat bazasidan xavfsiz olinadi.";
      body = (
        <StepLookup
          key={round}
          authenticated={authenticated}
          notice={notice}
          onFound={(res) => {
            setSession(res);
            setNotice(null);
            setStep("face");
          }}
        />
      );
      break;

    case "face":
      title = "Yuz tekshiruvi";
      subtitle = "Kamera orqali pasport rasmingiz bilan solishtiramiz. Bu taxminan 30 soniya vaqt oladi.";
      body = session && (
        <StepFace
          key={round}
          verificationId={session.verification_id}
          maskedName={session.masked_name}
          authenticated={authenticated}
          onRestart={restart}
          onPassed={() => {
            if (mode === "register") setStep("phone");
            else void attach(session.verification_id);
          }}
        />
      );
      break;

    case "attach":
      title = "Ma'lumotlar biriktirilmoqda";
      subtitle = "Tasdiqlangan ma'lumotlar akkauntingizga yozilmoqda.";
      body = attachError ? (
        <div>
          <Alert type="error" showIcon message={attachError} />
          <Button
            type="primary"
            block
            size="large"
            className="!mt-4"
            onClick={() => session && void attach(session.verification_id)}
          >
            Qayta urinish
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-border bg-surface px-4 py-10 text-sm text-muted">
          <Spin size="small" /> Iltimos, kuting…
        </div>
      );
      break;

    case "phone":
      title = "Telefon raqam";
      subtitle = "Akkauntga kirish uchun telefon raqamingizni SMS orqali tasdiqlang.";
      body = session && (
        <StepPhone
          verificationId={session.verification_id}
          maskedName={session.masked_name}
          onRestart={restart}
          onVerified={() => setStep("password")}
        />
      );
      break;

    case "password":
      title = "Parol o'rnating";
      subtitle = "Keyingi safar telefon raqamingiz va shu parol bilan kirasiz.";
      body = session && (
        <StepPassword
          verificationId={session.verification_id}
          onRestart={restart}
          onComplete={(res) => {
            saveSession(res.tokens, res.user);
            void queryClient.invalidateQueries({ queryKey: ["/auth/me/"] });
            setStep("done");
          }}
        />
      );
      break;

    case "done":
      title = "";
      body =
        mode === "register" ? (
          <StepDone
            title="Akkaunt yaratildi"
            description="Shaxsingiz TSMU ID orqali tasdiqlandi. Endi ariza topshirishingiz mumkin."
            actionLabel="Kabinetga o'tish"
            onAction={finish}
          />
        ) : (
          <StepDone
            title="Shaxsingiz tasdiqlandi"
            description="Ma'lumotlaringiz profilingizga biriktirildi. Endi ariza topshirishingiz mumkin."
            actionLabel="Davom etish"
            onAction={finish}
          />
        );
      break;
  }

  return <>{children({ title, subtitle, progress, body })}</>;
}
