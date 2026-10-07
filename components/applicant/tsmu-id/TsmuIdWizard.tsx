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

export type WizardStep = "lookup" | "face" | "attach" | "phone" | "password" | "done";

export interface WizardFrame {
  step: WizardStep;
  title: string;
  subtitle?: string;
  progress: React.ReactNode;
  body: React.ReactNode;
}

export type TsmuWizardMode = "register" | "verify" | "reset";

interface TsmuIdWizardProps {
  /**
   * register: public sign-up (identity → phone → password);
   * verify: attach identity to the logged-in account;
   * reset: public password reset confirmed by the face check.
   */
  mode: TsmuWizardMode;
  /** Where to go when finished (verify mode). */
  next?: string;
  children: (frame: WizardFrame) => React.ReactNode;
}

const REGISTER_STEPS: WizardStep[] = ["lookup", "face", "phone", "password", "done"];
const REGISTER_LABELS = ["Ma'lumot", "Yuz", "Telefon", "Parol", "Tayyor"];
const VERIFY_STEPS: WizardStep[] = ["lookup", "face", "done"];
const VERIFY_LABELS = ["Ma'lumot", "Yuz", "Tayyor"];
const RESET_STEPS: WizardStep[] = ["lookup", "face", "password", "done"];
const RESET_LABELS = ["Ma'lumot", "Yuz", "Yangi parol", "Tayyor"];

const STEPS: Record<TsmuWizardMode, { steps: WizardStep[]; labels: string[] }> = {
  register: { steps: REGISTER_STEPS, labels: REGISTER_LABELS },
  verify: { steps: VERIFY_STEPS, labels: VERIFY_LABELS },
  reset: { steps: RESET_STEPS, labels: RESET_LABELS },
};

export function TsmuIdWizard({ mode, next = "/dashboard", children }: TsmuIdWizardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const authenticated = mode === "verify";

  const [step, setStep] = useState<WizardStep>("lookup");
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
    router.push(mode === "verify" ? next : mode === "reset" ? "/login" : "/dashboard");
  }, [mode, next, router]);

  const { steps, labels } = STEPS[mode];
  const progressIndex = Math.max(0, steps.indexOf(step === "attach" ? "face" : step));
  const progress = <WizardProgress steps={labels} current={progressIndex} />;

  let title = "";
  let subtitle: string | undefined;
  let body: React.ReactNode = null;

  switch (step) {
    case "lookup":
      title =
        mode === "register"
          ? "TSMU ID orqali ro'yxatdan o'tish"
          : mode === "reset"
            ? "Parolni tiklash"
            : "Shaxsingizni tasdiqlang";
      subtitle =
        mode === "reset"
          ? "JSHSHIR va tug'ilgan sanangizni kiriting, so'ng yuz tekshiruvidan o'tib yangi parol o'rnatasiz."
          : "JSHSHIR va tug'ilgan sanangizni kiriting, so'ng kamera orqali shaxsingizni tasdiqlaysiz.";
      body = (
        <StepLookup
          key={round}
          authenticated={authenticated}
          purpose={mode === "reset" ? "password_reset" : mode === "register" ? "registration" : undefined}
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
      subtitle = "Kamera ko'rsatmalariga amal qilib, boshingizni aytilgan tomonga buring. Bu taxminan 30 soniya vaqt oladi.";
      body = session && (
        <StepFace
          key={round}
          verificationId={session.verification_id}
          challenge={session.challenge}
          authenticated={authenticated}
          onRestart={restart}
          onPassed={() => {
            if (mode === "register") setStep("phone");
            else if (mode === "reset") setStep("password");
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
          onRestart={restart}
          onVerified={() => setStep("password")}
        />
      );
      break;

    case "password":
      if (mode === "reset") {
        title = "Yangi parol o'rnating";
        subtitle = "Shaxsingiz tasdiqlandi. Endi telefon raqamingiz va yangi parol bilan kirasiz.";
        body = session && (
          <StepPassword
            mode="reset"
            verificationId={session.verification_id}
            onRestart={restart}
            onComplete={() => setStep("done")}
          />
        );
        break;
      }
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
        mode === "reset" ? (
          <StepDone
            title="Parol yangilandi"
            description="Parolingiz muvaffaqiyatli yangilandi. Endi telefon raqamingiz va yangi parol bilan kiring."
            actionLabel="Kirish sahifasiga o'tish"
            onAction={finish}
          />
        ) : mode === "register" ? (
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

  return <>{children({ step, title, subtitle, progress, body })}</>;
}
