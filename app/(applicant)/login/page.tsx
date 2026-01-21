"use client";

import { Form, Input, Button, Card, App } from "antd";
import { PhoneOutlined, LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { usePost } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { tokenStorage } from "@/lib/utils";
import Link from "next/link";

interface LoginData {
  phone_number: string;
  password: string;
}

interface User {
  id: number;
  phone_number: string;
  email?: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  full_name: string;
  role: string;
  is_verified: boolean;
  photo?: string | null;
  profile_completion: number;
  date_joined: string;
  last_login: string;
}

interface LoginResponse {
  data: {
    user: User;
    tokens: {
      refresh: string;
      access: string;
    };
  };
  message: string;
  status: number;
}

function getRedirectPath(role: string): string {
  const roleUpper = role.toUpperCase();
  
  if (roleUpper === "ADMIN" || roleUpper === "SUPER_ADMIN" || roleUpper === "SUPERADMIN") {
    return "/admin-panel";
  }
  
  return "/dashboard";
}

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  
  const { mutate: login, isPending } = usePost<LoginResponse, LoginData>("/auth/login/", {
    onSuccess: (response) => {
      // Save tokens
      tokenStorage.setTokens(response.data.tokens.access, response.data.tokens.refresh);
      
      // Save user data to localStorage if needed
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/auth/me/"] });
      
      // Get redirect path based on user role
      const redirectPath = getRedirectPath(response.data.user.role);
      
      message.success(response.message || "Muvaffaqiyatli kirildi!");
      router.push(redirectPath);
    },
    onError: (error) => {
      message.error(error.message || "Login xatosi");
    },
  });

  const onFinish = (values: LoginData) => {
    login(values);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">PhD Imtihonlar Tizimi</h1>
          <p className="text-gray-600">Hisobingizga kiring</p>
        </div>

        <Form name="login" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item
            name="phone_number"
            label="Telefon raqam"
            rules={[
              { required: true, message: "Telefon raqamni kiriting!" },
              { pattern: /^\+998\d{9}$/, message: "Telefon raqam formati: +998901234567" },
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="+998901234567" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Parol"
            rules={[{ required: true, message: "Parolni kiriting!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Parolingizni kiriting" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isPending} block className="h-12">
              Kirish
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-4">
          <p className="text-gray-600">
            Hisobingiz yo&apos;qmi?{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              Ro&apos;yxatdan o&apos;tish
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
