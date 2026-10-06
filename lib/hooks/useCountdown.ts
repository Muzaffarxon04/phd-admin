"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Simple seconds countdown used for OTP resend timers. */
export function useCountdown() {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);

  const start = useCallback(
    (seconds: number) => {
      stop();
      setSecondsLeft(seconds);
      timer.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            stop();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [stop]
  );

  useEffect(() => stop, [stop]);

  return { secondsLeft, active: secondsLeft > 0, start, stop };
}

export function formatMMSS(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
