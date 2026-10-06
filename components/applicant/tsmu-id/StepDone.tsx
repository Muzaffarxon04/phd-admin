"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "antd";
import { CheckOutlined } from "@ant-design/icons";

interface StepDoneProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  /** Auto-continue after N seconds (0 disables). */
  autoSeconds?: number;
}

export function StepDone({ title, description, actionLabel, onAction, autoSeconds = 4 }: StepDoneProps) {
  const [left, setLeft] = useState(autoSeconds);
  const fired = useRef(false);
  const fire = () => {
    if (fired.current) return;
    fired.current = true;
    onAction();
  };

  useEffect(() => {
    if (!autoSeconds) return;
    const id = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [autoSeconds]);

  useEffect(() => {
    if (autoSeconds && left === 0 && !fired.current) {
      fired.current = true;
      onAction();
    }
  }, [left, autoSeconds, onAction]);

  return (
    <div className="animate-enter text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-2xl text-success">
        <CheckOutlined />
      </span>
      <h2 className="mt-6 text-xl font-semibold text-text">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">{description}</p>
      <Button type="primary" size="large" block className="!mt-8" onClick={fire}>
        {actionLabel}
      </Button>
      {autoSeconds > 0 && left > 0 && (
        <p className="tabular mt-3 text-xs text-muted">{left} soniyadan so&apos;ng avtomatik o&apos;tiladi</p>
      )}
    </div>
  );
}
