export default function ApplicantHome() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center max-w-4xl">
        <h1 className="text-5xl font-bold mb-6">PhD Imtihonlar Tizimi</h1>
        <p className="text-xl text-gray-600 mb-8">
          Oliy ta'lim tizimida malakaviy imtihonlar uchun hujjatlarni onlayn topshirish
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 bg-white rounded-lg shadow-md border">
            <h2 className="text-xl font-semibold mb-3">Ariza Topshirish</h2>
            <p className="text-gray-600 mb-4">
              Yangi ariza yaratish va hujjatlarni yuklash
            </p>
            <a
              href="/applications"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Boshlash
            </a>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md border">
            <h2 className="text-xl font-semibold mb-3">Shaxsiy Kabinet</h2>
            <p className="text-gray-600 mb-4">
              Ma'lumotlaringizni ko'rish va tahrirlash
            </p>
            <a
              href="/dashboard"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Kirish
            </a>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md border">
            <h2 className="text-xl font-semibold mb-3">Sozlamalar</h2>
            <p className="text-gray-600 mb-4">
              Profil sozlamalari va yordam
            </p>
            <a
              href="/settings"
              className="inline-block px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Sozlash
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
