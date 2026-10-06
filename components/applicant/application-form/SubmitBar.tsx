"use client";

import { Button } from "antd";
import { SendOutlined } from "@ant-design/icons";

interface SubmitBarProps {
  loading: boolean;
  disabled?: boolean;
  hint?: React.ReactNode;
}

/**
 * Submit row. On mobile it sticks just above the bottom tab bar (64px + safe area);
 * on ≥768px it is a normal row at the end of the form.
 */
export function SubmitBar({ loading, disabled, hint }: SubmitBarProps) {
  return (
    <div className="sticky bottom-[calc(64px+env(safe-area-inset-bottom))] z-20 -mx-4 border-t border-border bg-bg/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-0">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <p className="text-[13px] leading-5 text-muted">
          {hint ?? "Ariza avval qoralama sifatida saqlanadi — uni \"Mening arizalarim\" bo'limidan yuborasiz."}
        </p>
        <Button
          type="primary"
          size="large"
          htmlType="submit"
          icon={<SendOutlined />}
          loading={loading}
          disabled={disabled}
          className="w-full md:w-auto"
        >
          Arizani yaratish
        </Button>
      </div>
    </div>
  );
}
