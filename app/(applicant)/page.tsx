"use client";

import Link from "next/link";
import { FileTextOutlined, RocketOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";

export default function ApplicantHome() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center p-6 md:p-24">
      <div className="text-center max-w-5xl w-full">
        {/* Hero Section */}
        <div className="mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            PhD Imtihonlar Tizimi
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-4 font-medium">
            Oliy ta&apos;lim tizimida malakaviy imtihonlar uchun
          </p>
          <p className="text-lg text-gray-600">
            Hujjatlarni onlayn topshirish va boshqarish
          </p>
        </div>

        {/* Main Action Card */}
        <div className="max-w-2xl mx-auto">
          <div className="group relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            {/* Decorative gradient overlay */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            
            <div className="p-8 md:p-10">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FileTextOutlined className="text-3xl text-white" />
                </div>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
                Ariza Topshirish
              </h2>
              
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Yangi ariza yaratish va hujjatlarni yuklash. Boshlang&apos;ichdan yakunigacha barcha jarayonlarni boshqaring.
              </p>

              <Link
                href="/applications"
                className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
              >
                <RocketOutlined />
                <span>Boshlash</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <CheckCircleOutlined className="text-2xl text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Oson Jarayon</h3>
            <p className="text-sm text-gray-600">
              Qadam-baqadam ko&apos;rsatmalar bilan ariza to&apos;ldirish
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <ClockCircleOutlined className="text-2xl text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">24/7 Mavjud</h3>
            <p className="text-sm text-gray-600">
              Har qanday vaqtda ariza topshirish imkoniyati
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <FileTextOutlined className="text-2xl text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Xavfsiz</h3>
            <p className="text-sm text-gray-600">
              Barcha ma&apos;lumotlaringiz xavfsiz saqlanadi
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </main>
  );
}
