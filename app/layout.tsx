import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AntdProvider from "@/components/AntdProvider";
import QueryProvider from "@/components/QueryProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PhD Imtihonlar Tizimi",
  description: "Oliy ta'lim tizimida malakaviy imtihonlar uchun hujjatlarni onlayn topshirish",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body className={`${inter.variable} antialiased`}>
        <QueryProvider>
          <AntdProvider>{children}</AntdProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
