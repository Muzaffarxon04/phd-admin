import type {
  Specialization,
  FAQ,
  Exam,
  DocumentType,
} from "@/types";

// Mock Specializations (Mutaxassisliklar)
export const mockSpecializations: Specialization[] = [
  { id: "1", code: "03.00.01", name: "Biokimyo", isActive: true },
  { id: "2", code: "03.00.04", name: "Mikrobiologiya va virusologiya", isActive: true },
  { id: "3", code: "13.00.02", name: "Ta'lim tarbiya nazariyasi va metodikasi", isActive: true },
  { id: "4", code: "14.00.01", name: "Akusherlik va ginekologiya", isActive: true },
  { id: "5", code: "14.00.02", name: "Morfoligiya", isActive: true },
  { id: "6", code: "14.00.03", name: "Endokrinologiya", isActive: true },
  { id: "7", code: "14.00.04", name: "Otorinolaringologiya", isActive: true },
  { id: "8", code: "14.00.05", name: "Ichki kasalliklar", isActive: true },
  { id: "9", code: "14.00.07", name: "Gigiyena", isActive: true },
  { id: "10", code: "14.00.09", name: "Pediatriya", isActive: true },
  { id: "11", code: "14.00.10", name: "Yuqumli kasalliklar", isActive: true },
  { id: "12", code: "14.00.11", name: "Dermatovenerologiya", isActive: true },
  { id: "13", code: "14.00.13", name: "Nevrologiya", isActive: true },
  { id: "14", code: "14.00.14", name: "Onkologiya", isActive: true },
  { id: "15", code: "14.00.15", name: "Patologik anatomiya", isActive: true },
  { id: "16", code: "14.00.16", name: "Normal va patologik fiziologiya", isActive: true },
  { id: "17", code: "14.00.17", name: "Farmakologiya va klinik farmakologiya", isActive: true },
  { id: "18", code: "14.00.19", name: "Klinik radiologiya", isActive: true },
  { id: "19", code: "14.00.21", name: "Stomatologiya", isActive: true },
  { id: "20", code: "14.00.24", name: "Sud tibbiyoti", isActive: true },
  { id: "21", code: "14.00.25", name: "Klinik laborator va funksional diagnostika", isActive: true },
  { id: "22", code: "14.00.26", name: "Ftiziatriya va pulmanologiya", isActive: true },
  { id: "23", code: "14.00.27", name: "Xirurgiya", isActive: true },
  { id: "24", code: "14.00.29", name: "Gematologiya va transfuziologiya", isActive: true },
  { id: "25", code: "14.00.30", name: "Epidemiologiya", isActive: true },
  { id: "26", code: "14.00.31", name: "Urologiya", isActive: true },
  { id: "27", code: "14.00.34", name: "Yurak-qon tomir xirurgiyasi", isActive: true },
  { id: "28", code: "19.00.04", name: "Tibbiy va maxsus psixologiya", isActive: true },
];

// Mock FAQ
export const mockFAQ: FAQ[] = [
  {
    id: "1",
    question: "Ariza topshirish muddati qachon tugaydi?",
    answer: "Ariza topshirish muddati har bir imtihon uchun alohida belgilanadi. Batafsil ma'lumotni 'Imtihon qoidalari' bolimida korishingiz mumkin.",
    category: "general",
    order: 1,
    isActive: true,
  },
  {
    id: "2",
    question: "Qanday tolov usullari mavjud?",
    answer: "Hozirgi vaqtda Click va Payme orqali tolov qilish mumkin.",
    category: "payment",
    order: 2,
    isActive: true,
  },
  {
    id: "3",
    question: "Hujjatlarni qayerdan yuklash mumkin?",
    answer: "Hujjatlarni 'Ariza topshirish' bolimida 'Yuklash' tugmasi orqali yuklashingiz mumkin. Faqat PDF, DOC, DOCX formatlari qabul qilinadi.",
    category: "documents",
    order: 3,
    isActive: true,
  },
  {
    id: "4",
    question: "Arizam rad etilganda nima qilish kerak?",
    answer: "Agar arizangiz rad etilgan bolsa, sababini korishingiz va tavsiya qilingan ozgartirishlarni amalga oshirib, qayta topshirishingiz mumkin.",
    category: "application",
    order: 4,
    isActive: true,
  },
  {
    id: "5",
    question: "Imtihon natijalarini qayerdan korish mumkin?",
    answer: "Imtihon natijalari Telegram guruh va bot orqali e'lon qilinadi. Shuningdek, shaxsiy kabinetingizda ham korishingiz mumkin.",
    category: "results",
    order: 5,
    isActive: true,
  },
];

// Mock Exams
export const mockExams: Exam[] = [
  {
    id: "1",
    name: "PhD imtihoni 2026-yil",
    description: "2026-yil uchun PhD imtihoni",
    examDate: "2026-06-15",
    examTime: "09:00",
    examLocation: "Toshkent, Navoiy kochasi, 1",
    announcement: "Imtihon 2026-yil 15-iyun kuni soat 09:00 da boshlanadi. Barcha qatnashchilar imtihon joyiga oz vaqtida kelishlari soraladi.",
    requiredDocuments: [
      "ilmiy_kengash_nusxasi",
      "diplom",
      "shakl_3_4",
      "annotatsiya",
    ],
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

// Document type labels
export const documentTypeLabels: Record<DocumentType, string> = {
  ilmiy_kengash_nusxasi: "Ilmiy kengash nusxasi yoki OAK (BAK) jurnali Byulleten nusxasi",
  yollanma_xat: "Yollanma xat va Mustaqil izlanuvchi yoki Tayanch doktoranturaga oqishga qabul qilganlik tog'risida buyrug'i",
  diplom: "Bakalavr va magistratura diplom nusxasi",
  shakl_3_4: "3-4 shakl",
  annotatsiya: "Annotatsiya",
};

// Foreign language labels
export const foreignLanguageLabels: Record<string, string> = {
  english: "Ingliz tili",
  german: "Nemis tili",
  french: "Fransuz tili",
};

// Helper function to get mock delay (simulate API call)
export const delay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));
