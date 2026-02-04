"use client";

import Link from "next/link";
import {
  RocketOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  ArrowRightOutlined,
  SunOutlined,
  MoonOutlined,
  LoginOutlined,
  DashboardOutlined
} from "@ant-design/icons";
import { useThemeStore } from "@/lib/stores/themeStore";
import { tokenStorage } from "@/lib/utils";
import { useEffect, useState } from "react";
import Image from "next/image";
export default function ApplicantHome() {
  const { theme, toggleTheme } = useThemeStore();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      setIsLoggedIn(!!tokenStorage.getAccessToken());
    };
    checkLogin();
  }, []);

  return (
    <main className={`min-h-screen transition-colors duration-300 flex flex-col items-center ${theme === "dark" ? "bg-[#0f172a] text-slate-100" : "bg-[#f8fafc] text-slate-900"
      }`}>
      {/* Landing Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${theme === "dark"
        ? "bg-[#1e293b]/80 border-slate-700/50 backdrop-blur-md"
        : "bg-white/80 border-slate-200/50 backdrop-blur-md"
        }`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image src="/logo.png" alt="Logo" width={35} height={35} />
            <span className={`text-xl font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-[#1d4ed8]"
              }`}>
              PhD System
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className={`text-sm font-medium transition-colors ${theme === "dark" ? "text-slate-400 hover:text-blue-400" : "text-slate-600 hover:text-blue-600"
              }`}>
              Afzalliklar
            </Link>
            <Link href="#how-it-works" className={`text-sm font-medium transition-colors ${theme === "dark" ? "text-slate-400 hover:text-blue-400" : "text-slate-600 hover:text-blue-600"
              }`}>
              Qo&apos;llanma
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border transition-all duration-300 ${theme === "dark"
                ? "bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-700"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
            >
              {theme === "dark" ? <SunOutlined /> : <MoonOutlined />}
            </button>

            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
              >
                <DashboardOutlined />
                Kabinet
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
              >
                <LoginOutlined />
                Kirish
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={`w-full relative overflow-hidden pt-32 pb-16 md:pt-48 md:pb-24 border-b transition-colors duration-300 ${theme === "dark" ? "bg-[#1e293b] border-slate-800" : "bg-white border-slate-200"
        }`}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">


            <h1 className={`text-4xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1] ${theme === "dark" ? "text-white" : "text-slate-900"
              }`}>
              Kelajak ilmini <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                biz bilan boshlang
              </span>
            </h1>

            <p className={`text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed ${theme === "dark" ? "text-slate-400" : "text-slate-600"
              }`}>
              Oliy ta&apos;lim tizimidagi malakaviy imtihonlar uchun hujjatlarni topshirishning eng qulay va tezkor platformasi.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link
                href={isLoggedIn ? "/applications" : "/login"}
                className={`group relative inline-flex items-center justify-center gap-3 px-10 py-4 font-bold rounded-2xl shadow-xl transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto ${theme === "dark"
                  ? "bg-white text-slate-900 hover:bg-slate-100 shadow-white/5"
                  : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200"
                  }`}
              >
                <RocketOutlined className="text-xl" />
                <span>Ariza topshirish</span>
                <ArrowRightOutlined className="text-sm opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </Link>


            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section id="features" className="w-full max-w-7xl mx-auto px-6 py-24">
        {/* Statistics or Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className={`p-8 rounded-[2rem] border transition-all duration-300 hover:shadow-2xl ${theme === "dark"
            ? "bg-[#1e293b] border-slate-800 shadow-none hover:bg-slate-800"
            : "bg-white border-slate-100 shadow-sm hover:shadow-blue-500/5"
            }`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${theme === "dark" ? "bg-blue-500/10" : "bg-blue-50"
              }`}>
              <CheckCircleOutlined className="text-3xl text-blue-500" />
            </div>
            <h3 className={`text-2xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
              To&apos;liq raqamlashgan
            </h3>
            <p className={`${theme === "dark" ? "text-slate-400" : "text-slate-600"} leading-relaxed text-lg`}>
              Barcha hujjatlar va jarayonlar 100% onlayn tarzda amalga oshiriladi. Ortiqcha qog&apos;ozbozlikka chek qo&apos;ying.
            </p>
          </div>

          <div className={`p-8 rounded-[2rem] border transition-all duration-300 hover:shadow-2xl ${theme === "dark"
            ? "bg-[#1e293b] border-slate-800 shadow-none hover:bg-slate-800"
            : "bg-white border-slate-100 shadow-sm hover:shadow-indigo-500/5"
            }`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${theme === "dark" ? "bg-indigo-500/10" : "bg-indigo-50"
              }`}>
              <SafetyCertificateOutlined className="text-3xl text-indigo-500" />
            </div>
            <h3 className={`text-2xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
              Xavfsiz va Ishonchli
            </h3>
            <p className={`${theme === "dark" ? "text-slate-400" : "text-slate-600"} leading-relaxed text-lg`}>
              Sizning barcha ma&apos;lumotlaringiz maxfiy saqlanadi va zamonaviy xavfsizlik protokollari bilan himoyalangan.
            </p>
          </div>

          <div className={`p-8 rounded-[2rem] border transition-all duration-300 hover:shadow-2xl ${theme === "dark"
            ? "bg-[#1e293b] border-slate-800 shadow-none hover:bg-slate-800"
            : "bg-white border-slate-100 shadow-sm hover:shadow-purple-500/5"
            }`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${theme === "dark" ? "bg-purple-500/10" : "bg-purple-50"
              }`}>
              <ClockCircleOutlined className="text-3xl text-purple-500" />
            </div>
            <h3 className={`text-2xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
              Real-vaqt monitoringi
            </h3>
            <p className={`${theme === "dark" ? "text-slate-400" : "text-slate-600"} leading-relaxed text-lg`}>
              Arizangiz holatini istalgan vaqtda shaxsiy kabinetingiz orqali kuzatib borishingiz mumkin.
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <div id="how-it-works" className="relative pt-32">
          <div className="text-center mb-20">
            <h2 className={`text-3xl md:text-5xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
              Qanday qilib topshiriladi?
            </h2>
            <p className={`text-lg ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
              Oddiy 3 qadamda PhD uchun hujjat topshirish
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold shadow-xl transition-all duration-500 group-hover:scale-110 ${theme === "dark" ? "bg-slate-800 text-blue-400 border border-slate-700" : "bg-white text-blue-600 border border-slate-100"
                }`}>
                1
              </div>
              <h4 className={`text-xl font-bold mt-8 mb-4 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                Ro&apos;yxatdan o&apos;tish
              </h4>
              <p className={`${theme === "dark" ? "text-slate-400" : "text-slate-600"} leading-relaxed`}>
                Tizimda shaxsiy kabinet yarating va kerakli ma&apos;lumotlarni kiring.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold shadow-xl transition-all duration-500 group-hover:scale-110 ${theme === "dark" ? "bg-slate-800 text-indigo-400 border border-slate-700" : "bg-white text-indigo-600 border border-slate-100"
                }`}>
                2
              </div>
              <h4 className={`text-xl font-bold mt-8 mb-4 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                Hujjatlarni yuklash
              </h4>
              <p className={`${theme === "dark" ? "text-slate-400" : "text-slate-600"} leading-relaxed`}>
                Kerakli sertifikatlar va ilmiy ishlaringiz nusxalarini tizimga yuklang.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold shadow-xl transition-all duration-500 group-hover:scale-110 ${theme === "dark" ? "bg-slate-800 text-purple-400 border border-slate-700" : "bg-white text-purple-600 border border-slate-100"
                }`}>
                3
              </div>
              <h4 className={`text-xl font-bold mt-8 mb-4 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                Ariza holatini kuzatish
              </h4>
              <p className={`${theme === "dark" ? "text-slate-400" : "text-slate-600"} leading-relaxed`}>
                Komissiya ko&apos;rib chiqish jarayonini onlayn kuzatib boring.
              </p>
            </div>

            {/* Connector Lines (Desktop) */}
            <div className={`hidden md:block absolute top-10 left-[20%] right-[20%] h-px border-t border-dashed -z-0 ${theme === "dark" ? "border-slate-700" : "border-slate-300"
              }`}></div>
          </div>
        </div>

        <div className="mt-48 relative overflow-hidden rounded-[3rem] p-1">
          {/* Animated Background Layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-800 animate-gradient-slow"></div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/30 rounded-full mix-blend-screen filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-screen filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

          <div className="relative z-10 p-8 md:p-20 flex flex-col items-center text-center">
            {/* Glass Box */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm border border-white/10 rounded-[2.9rem]"></div>

            <div className="relative z-20 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold mb-8 backdrop-blur-md">
                <RocketOutlined className="animate-bounce" />
                Sizning muvaffaqiyatingiz shu yerdan boshlanadi
              </div>

              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight drop-shadow-2xl">
                Ilmiy karyerangizni <br />
                <span className="text-blue-200">bugun boshlang</span>
              </h2>

              <p className="text-xl md:text-2xl text-blue-50/80 mb-12 leading-relaxed font-medium">
                Zamonaviy va shaffof tizim orqali PhD hujjatlarini topshirish endi juda oson. Bizning platforma sizga barcha bosqichlarda ko&apos;maklashadi.
              </p>

              <Link
                href={isLoggedIn ? "/dashboard" : "/register"}
                className="group relative inline-flex items-center justify-center gap-4 px-12 py-5 bg-white text-blue-700 font-extrabold text-xl rounded-2xl shadow-2xl hover:bg-blue-50 transition-all duration-500 transform hover:scale-105 active:scale-95 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-3 text-blue-700">
                  {isLoggedIn ? "Kabinetga o'tish" : "Hoziroq ro'yxatdan o'tish"}
                  <ArrowRightOutlined className="transition-transform duration-300 group-hover:translate-x-2" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </Link>

              <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-blue-100/60 text-sm font-medium">
                <div className="flex  items-center gap-2">
                  <CheckCircleOutlined className="text-blue-300" />
                  Bepul ro&apos;yxatdan o&apos;tish
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleOutlined className="text-blue-300" />
                  24/7 Qo&apos;llab-quvvatlash
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Minimal */}
      <footer className={`w-full py-6 border-t text-center text-sm transition-colors duration-300 ${theme === "dark" ? "bg-[#0f172a] border-slate-800 text-slate-500" : "bg-white border-slate-200 text-slate-500"
        }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 ">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Logo" width={45} height={45} />
              <span className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-[#1D4ED8]"}`}>PhD System</span>
            </Link>

          </div>
          <p>&copy; {new Date().getFullYear()} PhD Imtihonlar Tizimi. Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradient-slow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .animate-gradient-slow {
          background-size: 200% 200%;
          animation: gradient-slow 15s ease infinite;
        }
      `}</style>
    </main>
  );
}
