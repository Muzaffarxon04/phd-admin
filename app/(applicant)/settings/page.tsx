export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Sozlamalar</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-4">Profil Sozlamalari</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Ism</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded"
                placeholder="Ismingiz"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Telefon</label>
              <input
                type="tel"
                className="w-full px-4 py-2 border rounded"
                placeholder="+998901234567"
              />
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Saqlash
            </button>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-4">Yordam</h2>
          <div className="space-y-4">
            <a
              href="/settings/support"
              className="block px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              Texnik yordamga murojaat
            </a>
            <a
              href="/faq"
              className="block px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              Savol-Javob (FAQ)
            </a>
            <a
              href="/settings/payment"
              className="block px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              To'lov ma'lumotlari
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
