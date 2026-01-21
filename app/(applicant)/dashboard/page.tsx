export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Shaxsiy Kabinet</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-2">Ma'lumotlarim</h2>
          <p className="text-gray-600 mb-4">Shaxsiy ma'lumotlarni ko'rish va tahrirlash</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Ko'rish
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-2">Arizalarim</h2>
          <p className="text-gray-600 mb-4">Topshirilgan arizalarni ko'rish</p>
          <a
            href="/applications"
            className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Ko'rish
          </a>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-2">To'lovlar</h2>
          <p className="text-gray-600 mb-4">To'lov tarixini ko'rish</p>
          <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
            Ko'rish
          </button>
        </div>
      </div>
    </div>
  );
}
