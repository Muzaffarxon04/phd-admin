"use client";

import { Suspense, useState } from "react";
import { Form, Input, Button, App, Checkbox } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { usePost } from "@/lib/hooks";
import { tokenStorage } from "@/lib/utils";
import { safeNext } from "@/lib/applicant/session";
import { getErrorMessage } from "@/lib/applicant/errors";
import { AuthLayout } from "@/components/applicant/auth/AuthLayout";
import { PhoneInput, phoneRules } from "@/components/applicant/auth/PhoneInput";
import type { User } from "@/types";

interface LoginResponse {
  data: {
    tokens: {
      access: string;
      refresh: string;
    };
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
      tokenStorage.setTokens(response.data.tokens.access, response.data.tokens.refresh);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      queryClient.invalidateQueries({ queryKey: ["/auth/me/"] });
      message.success("Muvaffaqiyatli kirildi!");
      if (response.data.user.role === "SUPER_ADMIN") {
        router.push("/admin-panel");
      } else {
        router.push(safeNext(searchParams.get("next")));
      }
    },
    onError: (error: Error) => {
      message.error(getErrorMessage(error, "Login xatosi"));
    },
  });

  return (
    <AuthLayout
      title="Tizimga kirish"
      subtitle="Telefon raqamingiz va parolingiz bilan kiring."
      footer={
        <>
          Akkauntingiz yo&apos;qmi?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Ro&apos;yxatdan o&apos;tish
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
          className="!mb-2"
          rules={[{ required: true, message: "Parolni kiriting" }]}
          label="Parol"
        >
          <Input.Password placeholder="Parolingiz" autoComplete="current-password" />
        </Form.Item>
        <div className="mb-5 flex justify-end">
          <Link href="/forgot-password" className="text-[13px] font-medium text-primary hover:underline">
            Parolni unutdingizmi?
          </Link>
        </div>

        <Form.Item className="!mb-6">
          <Checkbox checked={acceptedPrivacy} onChange={(e) => setAcceptedPrivacy(e.target.checked)}>
            <span className="text-[13px] text-muted">Shaxsiy ma&apos;lumotlarim qayta ishlanishiga roziman</span>
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
