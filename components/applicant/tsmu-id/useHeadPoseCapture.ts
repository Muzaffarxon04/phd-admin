"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FaceLandmarker, FaceLandmarkerResult } from "@mediapipe/tasks-vision";
import type { FacePose } from "@/types";

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

const MP_VERSION = "1.1.0";
const WASM_BASES = [
  `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}/wasm`,
  `https://unpkg.com/@mediapipe/tasks-vision@${MP_VERSION}/wasm`,
];
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const MODEL_TIMEOUT_MS = 25000;

const MAX_SIDE = 1280;
const JPEG_QUALITY = 0.85;

/** Degrees. Server requires max(yaw) - min(yaw) ≥ 15°, we aim for ~2x that. */
const FRONT_MAX = 8;
const SIDE_MIN = 18;
const HOLD_MS = 350;
const PAUSE_AFTER_CAPTURE_MS = 700;
const DETECT_INTERVAL_MS = 70;

export type Pose = FacePose;
/** Fallback order when the server sent no challenge. */
export const POSES: Pose[] = ["front", "left", "right"];

/** The server-issued order is used only if it is exactly a permutation of the three poses. */
export function normalizeOrder(order: readonly string[] | null | undefined): Pose[] {
  if (!order || order.length !== POSES.length) return POSES;
  const sorted = [...order].sort();
  const expected = [...POSES].sort();
  return sorted.every((p, i) => p === expected[i]) ? (order as Pose[]) : POSES;
}

export const POSE_INSTRUCTION: Record<Pose, string> = {
  front: "To'g'riga qarang",
  left: "Chapga buriling",
  right: "O'ngga buriling",
};

export type CameraError = "insecure" | "unsupported" | "denied" | "not-found" | "busy" | "unknown";

export type CaptureStatus =
  | "idle"
  | "starting" // requesting camera
  | "loading-model"
  | "capturing" // auto (MediaPipe) mode running
  | "manual" // manual shutter mode
  | "done" // 3 frames captured
  | "error"; // camera error

export interface CapturedFrame {
  pose: Pose;
  blob: Blob;
  url: string;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function cameraErrorFrom(err: unknown): CameraError {
  const name = (err as { name?: string })?.name;
  switch (name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
    case "SecurityError":
      return "denied";
    case "NotFoundError":
    case "DevicesNotFoundError":
    case "OverconstrainedError":
      return "not-found";
    case "NotReadableError":
    case "TrackStartError":
    case "AbortError":
      return "busy";
    default:
      return "unknown";
  }
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      }
    );
  });
}

async function loadLandmarker(): Promise<FaceLandmarker> {
  const vision = await import("@mediapipe/tasks-vision");
  let lastError: unknown;
  for (const base of WASM_BASES) {
    try {
      const fileset = await vision.FilesetResolver.forVisionTasks(base);
      for (const delegate of ["GPU", "CPU"] as const) {
        try {
          return await vision.FaceLandmarker.createFromOptions(fileset, {
            baseOptions: { modelAssetPath: MODEL_URL, delegate },
            runningMode: "VIDEO",
            numFaces: 2,
            outputFaceBlendshapes: false,
            outputFacialTransformationMatrixes: true,
          });
        } catch (e) {
          lastError = e;
        }
      }
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError ?? new Error("MediaPipe load failed");
}

/**
 * Signed yaw in degrees. Positive = the user turned to *their* left.
 * Direction comes from landmarks (nose vs. cheeks in the un-mirrored image),
 * magnitude from the facial transformation matrix when available.
 */
export function estimateYaw(result: FaceLandmarkerResult): number | null {
  const lm = result.faceLandmarks?.[0];
  if (!lm || lm.length < 455) return null;
  const nose = lm[1];
  const a = lm[234];
  const b = lm[454];
  const left = Math.min(a.x, b.x);
  const width = Math.abs(b.x - a.x);
  if (width < 1e-3) return null;
  const r = (nose.x - left) / width; // 0.5 = frontal
  const lmYaw = (Math.asin(Math.max(-1, Math.min(1, (r - 0.5) * 2))) * 180) / Math.PI;

  const m = result.facialTransformationMatrixes?.[0]?.data;
  if (m && m.length >= 16) {
    // column-major 4x4; R[2][0] = -sin(yaw)
    const matYaw = Math.abs((Math.asin(Math.max(-1, Math.min(1, -m[2]))) * 180) / Math.PI);
    if (Math.abs(lmYaw) > 3) return Math.sign(lmYaw) * matYaw;
    return lmYaw;
  }
  return lmYaw;
}

function faceBox(result: FaceLandmarkerResult) {
  const lm = result.faceLandmarks?.[0];
  if (!lm) return null;
  let minX = 1,
    maxX = 0,
    minY = 1,
    maxY = 0;
  for (const p of lm) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return { w: maxX - minX, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
}

/** Draws the current (un-mirrored) video frame into a JPEG ≤ 1280px. */
export function grabFrame(video: HTMLVideoElement): Promise<Blob> {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return Promise.reject(new Error("Video not ready"));
  const scale = Math.min(1, MAX_SIDE / Math.max(vw, vh));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(vw * scale);
  canvas.height = Math.round(vh * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("Canvas unavailable"));
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/jpeg", JPEG_QUALITY)
  );
}

export function preflightCameraError(): CameraError | null {
  if (typeof window === "undefined") return null;
  if (!window.isSecureContext) return "insecure";
  if (!navigator.mediaDevices?.getUserMedia) return "unsupported";
  return null;
}

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

/**
 * Captures one frame per pose, in `order` (the server-issued liveness challenge).
 * Frames come only from the live camera — there is no file upload path.
 */
export function useHeadPoseCapture(videoRef: React.RefObject<HTMLVideoElement | null>, order: Pose[]) {
  const [status, setStatus] = useState<CaptureStatus>("idle");
  const [cameraError, setCameraError] = useState<CameraError | null>(null);
  const [modelFailed, setModelFailed] = useState(false);
  const [frames, setFrames] = useState<CapturedFrame[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const [yaw, setYaw] = useState<number | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);

  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const framesRef = useRef<CapturedFrame[]>([]);
  const holdStartRef = useRef<number | null>(null);
  const pausedUntilRef = useRef(0);
  const lastDetectRef = useRef(0);
  const busyRef = useRef(false);
  const aliveRef = useRef(true);
  const orderRef = useRef<Pose[]>(order);

  useEffect(() => {
    orderRef.current = order;
  }, [order]);

  const poseIndex = Math.min(frames.length, order.length - 1);
  const currentPose: Pose = order[poseIndex];

  const stopLoop = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const stopCamera = useCallback(() => {
    stopLoop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    const v = videoRef.current;
    if (v) v.srcObject = null;
  }, [stopLoop, videoRef]);

  const clearFrames = useCallback(() => {
    framesRef.current.forEach((f) => URL.revokeObjectURL(f.url));
    framesRef.current = [];
    setFrames([]);
  }, []);

  const pushFrame = useCallback(
    async (pose: Pose) => {
      const video = videoRef.current;
      if (!video || busyRef.current) return;
      busyRef.current = true;
      try {
        const blob = await grabFrame(video);
        const frame: CapturedFrame = { pose, blob, url: URL.createObjectURL(blob) };
        framesRef.current = [...framesRef.current, frame];
        setFrames(framesRef.current);
        if (framesRef.current.length >= orderRef.current.length) {
          stopCamera();
          setStatus("done");
        }
      } finally {
        busyRef.current = false;
      }
    },
    [stopCamera, videoRef]
  );

  const loop = useCallback(() => {
    if (!aliveRef.current) return;
    rafRef.current = requestAnimationFrame(loop);
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !landmarker || video.readyState < 2 || busyRef.current) return;

    const now = performance.now();
    if (now - lastDetectRef.current < DETECT_INTERVAL_MS) return;
    lastDetectRef.current = now;
    if (now < pausedUntilRef.current) return;

    let result: FaceLandmarkerResult;
    try {
      result = landmarker.detectForVideo(video, now);
    } catch {
      return;
    }

    const count = result.faceLandmarks?.length ?? 0;
    const pose = orderRef.current[framesRef.current.length];
    if (!pose) return;

    const resetHold = (msg: string | null) => {
      holdStartRef.current = null;
      setHoldProgress(0);
      setHint(msg);
    };

    if (count === 0) {
      setYaw(null);
      return resetHold("Yuzingizni ramka ichiga joylang");
    }
    if (count > 1) {
      setYaw(null);
      return resetHold("Kadrda faqat siz bo'lishingiz kerak");
    }

    const box = faceBox(result);
    if (box && box.w < 0.2) return resetHold("Kameraga yaqinroq keling");
    if (box && box.w > 0.8) return resetHold("Biroz uzoqroq turing");
    if (box && (box.cx < 0.25 || box.cx > 0.75 || box.cy < 0.2 || box.cy > 0.8)) {
      return resetHold("Yuzingizni ramka markaziga keltiring");
    }

    const y = estimateYaw(result);
    setYaw(y);
    if (y == null) return resetHold(null);

    const ok = pose === "front" ? Math.abs(y) <= FRONT_MAX : pose === "left" ? y >= SIDE_MIN : y <= -SIDE_MIN;

    if (!ok) {
      let msg: string | null = null;
      if (pose === "front") msg = "Boshingizni to'g'ri tuting";
      else if (Math.abs(y) < SIDE_MIN && Math.sign(y) === (pose === "left" ? 1 : -1)) msg = "Yana biroz buriling";
      return resetHold(msg);
    }

    if (holdStartRef.current == null) holdStartRef.current = now;
    const held = now - holdStartRef.current;
    setHint("Shunday turing…");
    setHoldProgress(Math.min(1, held / HOLD_MS));
    if (held >= HOLD_MS) {
      holdStartRef.current = null;
      setHoldProgress(0);
      setHint(null);
      pausedUntilRef.current = now + PAUSE_AFTER_CAPTURE_MS;
      void pushFrame(pose);
    }
  }, [pushFrame, videoRef]);

  /** Request the camera and (unless manual) load MediaPipe and start auto capture. */
  const start = useCallback(
    async (opts: { manual?: boolean } = {}) => {
      const pre = preflightCameraError();
      if (pre) {
        setCameraError(pre);
        setStatus("error");
        return;
      }
      setCameraError(null);
      clearFrames();
      setStatus("starting");

      try {
        if (!streamRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          });
          if (!aliveRef.current) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = stream;
        }
        const video = videoRef.current;
        if (video) {
          video.srcObject = streamRef.current;
          video.muted = true;
          video.playsInline = true;
          await video.play().catch(() => undefined);
        }
      } catch (err) {
        setCameraError(cameraErrorFrom(err));
        setStatus("error");
        return;
      }

      if (opts.manual) {
        setStatus("manual");
        return;
      }

      if (!landmarkerRef.current) {
        setStatus("loading-model");
        try {
          landmarkerRef.current = await withTimeout(loadLandmarker(), MODEL_TIMEOUT_MS);
        } catch {
          if (!aliveRef.current) return;
          setModelFailed(true);
          setStatus("manual");
          return;
        }
      }
      if (!aliveRef.current) return;
      holdStartRef.current = null;
      pausedUntilRef.current = performance.now() + 500;
      setHint(null);
      setStatus("capturing");
      stopLoop();
      rafRef.current = requestAnimationFrame(loop);
    },
    [clearFrames, loop, stopLoop, videoRef]
  );

  const captureManual = useCallback(() => {
    const pose = orderRef.current[framesRef.current.length];
    if (pose) void pushFrame(pose);
  }, [pushFrame]);

  const reset = useCallback(() => {
    stopCamera();
    clearFrames();
    setHint(null);
    setYaw(null);
    setHoldProgress(0);
    setStatus("idle");
  }, [clearFrames, stopCamera]);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
      framesRef.current.forEach((f) => URL.revokeObjectURL(f.url));
    };
  }, []);

  return {
    status,
    cameraError,
    modelFailed,
    frames,
    currentPose,
    hint,
    yaw,
    holdProgress,
    start,
    captureManual,
    reset,
    stopCamera,
  };
}
