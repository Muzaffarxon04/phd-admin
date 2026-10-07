"use client";

import { Suspense, useState } from "react";
import { Form, Input, Button, App, Checkbox } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { usePost } from "@/lib/hooks";
import { safeNext, saveSession } from "@/lib/applicant/session";
import { getErrorMessage } from "@/lib/applicant/errors";
import { AuthLayout } from "@/components/applicant/auth/AuthLayout";
import { PhoneInput, phoneRules } from "@/components/applicant/auth/PhoneInput";
import type { AuthTokens, User } from "@/types";

interface LoginResponse {
  data: {
    tokens: AuthTokens;
    user: User;
  };
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const { mutate: login, isPending } = usePost("/auth/login/", {
    onSuccess: (response: LoginResponse) => {
      saveSession(response.data.tokens, response.data.user);
      queryClient.invalidateQueries({ queryKey: ["/auth/me/"] });
      message.success("Muvaffaqiyatli kirildi!");
      if (response.data.user.role === "SUPER_ADMIN") {
        router.push("/admin-panel");
      } else {
        router.push(safeNext(searchParams.get("next")));
      }
    },
    onError: (error: Error) => {
      message.error(getErrorMessage(error, "Telefon raqam yoki parol noto'g'ri"));
    },
  });

  return (
    <AuthLayout
      title="Tizimga kirish"
      subtitle="Telefon raqamingiz va parolingiz bilan kiring."
      footer={
        <>
          Akkauntingiz yo&apos;qmi?{" "}
          <Link href="/register" className="inline-flex min-h-11 items-center font-medium text-primary hover:underline">
            TSMU ID orqali ro&apos;yxatdan o&apos;tish
          </Link>
        </>
      }
    >
      <Form layout="vertical" onFinish={login} requiredMark={false} size="large">
        <Form.Item name="phone_number" label="Telefon raqam" rules={phoneRules}>
          <PhoneInput autoFocus />
        </Form.Item>

        <Form.Item
          name="password"
          className="!mb-1"
          rules={[{ required: true, message: "Parolni kiriting" }]}
          label="Parol"
        >
          <Input.Password
            placeholder="Parolingiz"
            autoComplete="current-password"
            prefix={<LockOutlined className="text-muted" />}
          />
        </Form.Item>
        <div className="mb-3 flex justify-end">
          <Link
            href="/forgot-password"
            className="inline-flex min-h-11 items-center text-[13px] font-medium text-primary hover:underline"
          >
            Parolni unutdingizmi?
          </Link>
        </div>

        <Form.Item className="!mb-6">
          <Checkbox checked={acceptedPrivacy} onChange={(e) => setAcceptedPrivacy(e.target.checked)}>
            <span className="text-[13px] leading-5 text-muted">Shaxsiy ma&apos;lumotlarim qayta ishlanishiga roziman</span>
          </Checkbox>
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={isPending} disabled={!acceptedPrivacy} block>
          Kirish
        </Button>
      </Form>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
