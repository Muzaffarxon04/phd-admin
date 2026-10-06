"use client";

/* eslint-disable @next/next/no-img-element -- local blob previews */
import { useEffect, useRef, useState } from "react";
import { Alert, Button, Spin } from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  BulbOutlined,
  CameraOutlined,
  CheckCircleFilled,
  CheckOutlined,
  CloseCircleFilled,
  EyeOutlined,
  LockOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { tsmuIdApi } from "@/lib/api/tsmuId";
import { cn } from "@/lib/utils";
import type { FaceVerifyResponse } from "@/types";
import { faceReasonMessage, MSG, tsmuError } from "./errors";
import {
  type CameraError,
  type CapturedFrame,
  fileToJpeg,
  POSE_INSTRUCTION,
  POSES,
  useHeadPoseCapture,
} from "./useHeadPoseCapture";

interface StepFaceProps {
  verificationId: string;
  maskedName?: string;
  authenticated?: boolean;
  onPassed: (result: FaceVerifyResponse) => void;
  /** Session is no longer usable — go back to step 1 with a message. */
  onRestart: (message: string) => void;
}

const CAMERA_ERROR_TEXT: Record<CameraError, { title: string; text: string }> = {
  insecure: {
    title: "Kamera xavfsiz ulanishni talab qiladi",
    text: "Kamera faqat https orqali ochilgan sahifada ishlaydi. Saytni https:// manzili orqali oching.",
  },
  unsupported: {
    title: "Brauzer kamerani qo'llab-quvvatlamaydi",
    text: "Chrome, Safari yoki Edge brauzerining so'nggi versiyasidan foydalaning. Ilova ichidagi brauzer (Telegram, Instagram) kamerani bermasligi mumkin.",
  },
  denied: {
    title: "Kameraga ruxsat berilmadi",
    text: "Brauzer manzil satridagi kamera belgisini bosib, ushbu sayt uchun kameraga ruxsat bering, so'ng qayta urinib ko'ring.",
  },
  "not-found": {
    title: "Kamera topilmadi",
    text: "Qurilmangizda old kamera topilmadi. Kamerasi bor telefon yoki kompyuterdan foydalaning.",
  },
  busy: {
    title: "Kamera band",
    text: "Kamera boshqa ilova tomonidan ishlatilmoqda. Boshqa ilovalarni yoping va qayta urinib ko'ring.",
  },
  unknown: {
    title: "Kamerani ishga tushirib bo'lmadi",
    text: "Sahifani yangilab, qayta urinib ko'ring.",
  },
};

const TIPS = [
  { icon: <BulbOutlined />, text: "Yorug' joyda turing, yuzingizga soya tushmasin" },
  { icon: <EyeOutlined />, text: "Ko'zoynak, niqob va bosh kiyimni yeching" },
  { icon: <TeamOutlined />, text: "Kadrda faqat siz bo'lishingiz kerak" },
];

function OvalOverlay({ active, progress }: { active: boolean; progress: number }) {
  // ellipse in a 100x100 viewBox, preserveAspectRatio none keeps it relative to the frame
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <mask id="face-oval-mask">
          <rect width="100" height="100" fill="white" />
          <ellipse cx="50" cy="46" rx="29" ry="34" fill="black" />
        </mask>
      </defs>
      <rect width="100" height="100" fill="rgba(9,9,11,0.55)" mask="url(#face-oval-mask)" />
      <ellipse
        cx="50"
        cy="46"
        rx="29"
        ry="34"
        fill="none"
        vectorEffect="non-scaling-stroke"
        strokeWidth={3}
        stroke={progress > 0 ? "#22c55e" : active ? "#a5b4fc" : "rgba(255,255,255,0.7)"}
        className={active && progress === 0 ? "face-oval-active" : undefined}
      />
    </svg>
  );
}

function YawGauge({ yaw }: { yaw: number | null }) {
  // Preview is mirrored: a turn to the user's left (positive yaw) moves left on screen.
  const pos = yaw == null ? 50 : 50 - Math.max(-1, Math.min(1, yaw / 40)) * 50;
  return (
    <div className="relative h-1.5 w-28 rounded-full bg-white/25" aria-hidden>
      <span className="absolute left-1/2 top-1/2 h-3 w-px -translate-y-1/2 bg-white/60" />
      <span
        className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white transition-[left] duration-150"
        style={{ left: `${pos}%`, opacity: yaw == null ? 0.3 : 1 }}
      />
    </div>
  );
}

function FrameSlots({ frames, className }: { frames: CapturedFrame[]; className?: string }) {
  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      {POSES.map((pose, i) => {
        const f = frames[i];
        return (
          <div key={pose} className="min-w-0">
            <div
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg border",
                f ? "border-success/50" : "border-dashed border-border bg-surface-2"
              )}
            >
              {f ? (
                <>
                  <img src={f.url} alt="" className="face-video h-full w-full object-cover" />
                  <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-success text-[10px] text-white">
                    <CheckOutlined />
                  </span>
                </>
              ) : (
                <span className="tabular absolute inset-0 flex items-center justify-center text-sm text-muted">
                  {i + 1}
                </span>
              )}
            </div>
            <p className="mt-1.5 truncate text-center text-[11px] text-muted">{POSE_INSTRUCTION[pose]}</p>
          </div>
        );
      })}
    </div>
  );
}

/** No-camera fallback: take/pick 3 photos with the native camera app. */
function FilePicker({ onDone }: { onDone: (blobs: Blob[]) => void }) {
  const [blobs, setBlobs] = useState<Blob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const next = POSES[blobs.length];

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-sm font-medium text-text">Telefon kamerasi orqali suratga olish</p>
      <p className="mt-1 text-[13px] leading-5 text-muted">
        3 ta selfi oling: avval to&apos;g&apos;riga qarab, so&apos;ng boshingizni chapga, keyin o&apos;ngga burib.
      </p>
      {next && (
        <label className="mt-4 flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-surface-2 text-sm font-medium text-text transition-colors hover:border-border-strong">
          <CameraOutlined />
          {blobs.length + 1}/3: {POSE_INSTRUCTION[next]}
          <input
            type="file"
            accept="image/*"
            capture="user"
            className="sr-only"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              try {
                const jpeg = await fileToJpeg(file);
                const list = [...blobs, jpeg];
                setBlobs(list);
                setError(null);
                if (list.length === POSES.length) onDone(list);
              } catch {
                setError("Rasmni o'qib bo'lmadi, qayta urinib ko'ring");
              }
            }}
          />
        </label>
      )}
      {error && <p className="mt-2 text-[13px] text-danger">{error}</p>}
    </div>
  );
}

export function StepFace({ verificationId, maskedName, authenticated, onPassed, onRestart }: StepFaceProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cap = useHeadPoseCapture(videoRef);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<FaceVerifyResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [exhausted, setExhausted] = useState(false);
  const uploadedFor = useRef<CapturedFrame[] | null>(null);

  const { status, frames, currentPose } = cap;
  const cameraVisible = status === "starting" || status === "loading-model" || status === "capturing" || status === "manual";

  const upload = async (list: CapturedFrame[]) => {
    setUploading(true);
    setApiError(null);
    try {
      const res = await tsmuIdApi.face(
        verificationId,
        list.map((f) => f.blob),
        { authenticated }
      );
      setResult(res);
      if (!res.passed && res.attempts_left <= 0) setExhausted(true);
    } catch (err) {
      const info = tsmuError(err, { authenticated });
      if (info.code === "ATTEMPTS_EXHAUSTED") {
        setExhausted(true);
        setApiError(MSG.exhausted);
      } else if (info.action === "restart") {
        onRestart(info.message);
      } else {
        setApiError(info.message);
      }
    } finally {
      setUploading(false);
    }
  };

  // Upload exactly once per completed set of frames.
  useEffect(() => {
    if (status !== "done" || frames.length < POSES.length || uploadedFor.current === frames) return;
    uploadedFor.current = frames;
    const id = setTimeout(() => void upload(frames), 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- upload is stable enough for a one-shot trigger
  }, [status, frames]);

  const retry = () => {
    setResult(null);
    setApiError(null);
    uploadedFor.current = null;
    cap.reset();
    void cap.start({ manual: cap.modelFailed });
  };

  const instruction = POSE_INSTRUCTION[currentPose];
  const stepNo = Math.min(frames.length + 1, POSES.length);

  /* ---------------- result ---------------- */
  if (result && !uploading) {
    if (result.passed) {
      return (
        <div className="animate-enter">
          <div className="flex flex-col items-center rounded-xl border border-border bg-surface px-6 py-10 text-center">
            <CheckCircleFilled className="text-[40px] text-success" />
            <p className="mt-4 text-lg font-semibold text-text">Yuz tasdiqlandi</p>
            <p className="tabular mt-1 text-sm text-muted">
              O&apos;xshashlik: {Math.round(result.similarity_pct)}%
            </p>
          </div>
          <Button type="primary" block size="large" className="!mt-6" onClick={() => onPassed(result)}>
            Davom etish
          </Button>
        </div>
      );
    }
    return (
      <div className="animate-enter">
        <div className="flex flex-col items-center rounded-xl border border-border bg-surface px-6 py-10 text-center">
          <CloseCircleFilled className="text-[40px] text-danger" />
          <p className="mt-4 text-lg font-semibold text-text">Tekshiruvdan o&apos;tmadi</p>
          <p className="mt-1 max-w-sm text-sm leading-6 text-muted">
            {faceReasonMessage(result.reason, result.attempts_left)}
          </p>
          {!exhausted && (
            <p className="tabular mt-3 rounded-full bg-surface-2 px-3 py-1 text-xs text-muted">
              Qolgan urinishlar: {result.attempts_left}
            </p>
          )}
        </div>
        <FrameSlots frames={frames} className="mt-4" />
        {exhausted ? (
          <Button block size="large" className="!mt-6" onClick={() => onRestart(MSG.exhausted)}>
            Boshidan boshlash
          </Button>
        ) : (
          <Button type="primary" block size="large" className="!mt-6" onClick={retry}>
            Qayta urinish
          </Button>
        )}
      </div>
    );
  }

  /* ---------------- uploading / api error after capture ---------------- */
  if (status === "done") {
    return (
      <div className="animate-enter">
        <FrameSlots frames={frames} />
        {uploading ? (
          <div className="mt-6 flex items-center justify-center gap-3 rounded-xl border border-border bg-surface px-4 py-6 text-sm text-muted">
            <Spin size="small" /> Yuz solishtirilmoqda…
          </div>
        ) : (
          apiError && (
            <>
              <Alert type="error" showIcon className="!mt-6" message={apiError} />
              {exhausted ? (
                <Button block size="large" className="!mt-4" onClick={() => onRestart(MSG.exhausted)}>
                  Boshidan boshlash
                </Button>
              ) : (
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="primary"
                    size="large"
                    className="flex-1"
                    onClick={() => {
                      uploadedFor.current = frames;
                      void upload(frames);
                    }}
                  >
                    Qayta yuborish
                  </Button>
                  <Button size="large" className="flex-1" onClick={retry}>
                    Qaytadan suratga olish
                  </Button>
                </div>
              )}
            </>
          )
        )}
      </div>
    );
  }

  /* ---------------- intro / camera / errors ---------------- */
  return (
    <div>
      {status === "idle" && (
        <div className="animate-enter">
          {maskedName && (
            <p className="mb-4 text-sm text-muted">
              Shaxs: <span className="font-medium text-text">{maskedName}</span>
            </p>
          )}
          <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <LockOutlined />
              </span>
              <p className="text-[13px] leading-5 text-muted">
                Kamera faqat shaxsingizni tasdiqlash uchun ishlatiladi. Uchta kadr olinib, pasport rasmingiz bilan
                solishtiriladi. Suratlar serverda <span className="font-medium text-text">saqlanmaydi</span>.
              </p>
            </div>
            <ul className="mt-4 flex flex-col gap-2.5 border-t border-border pt-4">
              {TIPS.map((t) => (
                <li key={t.text} className="flex items-center gap-3 text-sm text-text">
                  <span className="text-muted">{t.icon}</span>
                  {t.text}
                </li>
              ))}
            </ul>
          </div>
          <Button
            type="primary"
            size="large"
            block
            icon={<CameraOutlined />}
            className="!mt-6"
            onClick={() => void cap.start()}
          >
            Kamerani yoqish
          </Button>
        </div>
      )}

      {status === "error" && cap.cameraError && (
        <div className="animate-enter">
          <Alert
            type="warning"
            showIcon
            message={CAMERA_ERROR_TEXT[cap.cameraError].title}
            description={CAMERA_ERROR_TEXT[cap.cameraError].text}
          />
          {cap.cameraError !== "insecure" && (
            <Button size="large" block className="!mt-4" onClick={() => void cap.start()}>
              Qayta urinish
            </Button>
          )}
          <div className="mt-4">
            <FilePicker onDone={(blobs) => cap.setExternalFrames(blobs)} />
          </div>
        </div>
      )}

      {/* Camera stage — the <video> stays mounted so the stream can attach before it is shown */}
      <div className={cn(!cameraVisible && "hidden")}>
        <div className="relative mx-auto aspect-[3/4] w-full max-w-[420px] overflow-hidden rounded-2xl bg-black sm:aspect-[4/3] sm:max-w-none">
          <video
            ref={videoRef}
            className="face-video absolute inset-0 h-full w-full object-cover"
            playsInline
            muted
            autoPlay
          />
          <OvalOverlay active={status === "capturing"} progress={cap.holdProgress} />

          {/* instruction */}
          <div className="absolute inset-x-0 top-0 flex flex-col items-center gap-1.5 p-4 text-center">
            {(status === "capturing" || status === "manual") && (
              <>
                <span className="tabular rounded-full bg-black/50 px-2.5 py-0.5 text-[11px] font-medium text-white/80">
                  {stepNo} / {POSES.length}
                </span>
                <p className="text-xl font-semibold text-white drop-shadow sm:text-2xl">{instruction}</p>
                {status === "capturing" && cap.hint && <p className="text-sm text-white/85">{cap.hint}</p>}
              </>
            )}
          </div>

          {/* direction cue (preview is mirrored, so the user's left is screen-left) */}
          {(status === "capturing" || status === "manual") && currentPose !== "front" && (
            <div
              className={cn(
                "absolute top-1/2 -translate-y-1/2 text-3xl text-white/90 drop-shadow",
                currentPose === "left" ? "left-3" : "right-3"
              )}
              aria-hidden
            >
              {currentPose === "left" ? <ArrowLeftOutlined /> : <ArrowRightOutlined />}
            </div>
          )}

          {(status === "starting" || status === "loading-model") && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40 text-sm text-white">
              <Spin />
              {status === "starting" ? "Kamera ishga tushirilmoqda…" : "Yuz aniqlash moduli yuklanmoqda…"}
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 p-4">
            {status === "capturing" && <YawGauge yaw={cap.yaw} />}
            {status === "manual" && (
              <button
                type="button"
                onClick={cap.captureManual}
                aria-label="Suratga olish"
                className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/80 bg-white/20 backdrop-blur transition-transform active:scale-95"
              >
                <span className="h-11 w-11 rounded-full bg-white" />
              </button>
            )}
          </div>
        </div>

        {status === "manual" && (
          <p className="mt-3 text-center text-[13px] leading-5 text-muted">
            {cap.modelFailed
              ? "Avtomatik aniqlash ishlamadi. "
              : ""}
            Ko&apos;rsatmaga amal qiling va har safar tugmani bosing: to&apos;g&apos;riga qarab, so&apos;ng chapga va
            o&apos;ngga burilib.
          </p>
        )}

        <FrameSlots frames={frames} className="mt-4" />

        {status === "capturing" && (
          <button
            type="button"
            onClick={cap.switchToManual}
            className="mx-auto mt-4 block text-[13px] font-medium text-muted hover:text-text"
          >
            Avtomatik ishlamayaptimi? Qo&apos;lda suratga olish
          </button>
        )}
      </div>
    </div>
  );
}
