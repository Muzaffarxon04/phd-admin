export default function ApplicationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Arizalarim</h1>
        <a
          href="/applications/new"
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Yangi Ariza
        </a>
      </div>
      <div className="bg-white rounded-lg shadow-md border p-6">
        <p className="text-gray-600 text-center py-8">
          Hozircha hech qanday ariza topilmadi. Yangi ariza yaratish uchun "Yangi Ariza" tugmasini bosing.
        </p>
      </div>
    </div>
  );
}
