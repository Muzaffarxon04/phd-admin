# PhD Imtihonlar Tizimi - Frontend

Mazkur axborot tizimi oliy ta'lim tizimida malakaviy imtihonlar uchun hujjatarni to'liq onlayn qabul qilish, tekshirish va boshqarishga mo'ljallangan.

## 🚀 Texnologiyalar

- **Next.js 16** - React framework (App Router)
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Zustand** - State management
- **React 19** - UI library

## 📁 Loyiha Strukturasi

```
phd-client/
├── app/                        # Next.js App Router
│   ├── (applicant)/           # Talabgor route guruhlari
│   ├── (admin)/               # Admin route guruhlari
│   ├── (SUPER_ADMIN)/         # Super Admin route guruhlari
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── components/                # React komponentlar
├── lib/
│   ├── api/                   # API client (backend uchun tayyor)
│   │   └── client.ts          # API funksiyalari
│   ├── stores/                # Zustand stores
│   │   ├── authStore.ts       # Authentication store
│   │   └── applicationStore.ts # Application store
│   ├── data.ts                # Mock/Static data
│   └── utils.ts               # Utility funksiyalar
├── types/
│   └── index.ts               # TypeScript types va interfaces
└── public/                    # Static files
```

## 🎯 Foydalanuvchi Rollari

### 1. Talabgor
- OneID orqali autentifikatsiya
- Shaxsiy kabinet (ma'lumotlarni tahrirlash)
- Settings (texnik yordam, to'lov, muddatlar)
- Ariza topshirish (hujjatlarni yuklash)
- Mutaxassislik tanlash
- To'lov qilish (Click, Payme)
- Natijalarni ko'rish
- FAQ

### 2. Admin
- Talabgor hujjatlarini ko'rish va tekshirish
- Imtihon yaratish
- To'lov ma'lumotlarini tekshirish
- Mutaxassislik qo'shish
- Hisobotlar (kunlik/oylik statistika)
- Xabarnomalar boshqaruvi

### 3. Super Admin
- Tizimni to'liq boshqarish
- Global settings
- Integratsiyalar (OneID, Click, Payme, SMS, Telegram, Email)
- Audit va nazorat
- Ma'lumotlar xavfsizligi
- Arxiv va yopilgan jarayonlar

## 📦 O'rnatish va Ishga Tushirish

```bash
# Dependencies o'rnatish
npm install

# Development server ishga tushirish
npm run dev

# Production build
npm run build
npm start
```

Sayt `http://localhost:3000` da ochiladi.

## 🔌 API Integratsiyasi

Frontend allaqachon API bilan to'liq integratsiya qilingan. Swagger docs: https://api-doktarant.tashmeduni.uz/swagger/

### API Struktura

Loyiha uchta API sektordan iborat:

**1. Auth API (`lib/api/auth.ts`)**
- Login / Logout
- Register (telefon orqali)
- OTP tasdiqlash
- Parolni tiklash
- Profilni tahrirlash

**2. Applicant API (`lib/api/applicant.ts`)**
- Arizalarni olish
- Ariza topshirish
- Hujjatlarni yuklash
- Arizani ko'rib chiqish

**3. Admin API (`lib/api/admin.ts`)**
- Arizalarni boshqarish
- Ariza yaratish / o'zgartirish / o'chirish
- Ariza maydonlarini boshqarish
- Arizalarni tasdiqlash / rad etish

### Konfiguratsiya

`.env.local` faylida API URL ni o'rnating:
   ```env
NEXT_PUBLIC_API_URL=https://api-doktarant.tashmeduni.uz/api/v1
   ```

### Hozirgi holat:

- ✅ API servislari to'liq integratsiya qilingan
- ✅ TypeScript types tayyor
- ✅ AuthStore real API'dan foydalanadi
- ✅ ApplicationStore real API'dan foydalanadi
- ✅ Token refresh avtomatik
- ✅ Error handling tayyor
- ✅ File upload qo'llab-quvvatlanadi

### Foydalanish Misollari

```typescript
// Auth
import { authApi } from "@/lib/api";

// Login
const response = await authApi.login({
  username: "user@example.com",
  password: "password123"
});

// Get current user
const user = await authApi.getMe();

// Applicant
import { applicantApi } from "@/lib/api";

// Get applications
const apps = await applicantApi.getApplications();

// Create submission
const submission = await applicantApi.createSubmission({
  application_id: "app-123"
});

// Upload document
const formData = new FormData();
formData.append("file", file);
await applicantApi.uploadDocument(submissionId, formData);

// Admin
import { adminApi } from "@/lib/api";

// Get all submissions
const response = await adminApi.getSubmissions(1, 20);

// Approve submission
await adminApi.approveSubmission(submissionId);
```

### Batafsil ma'lumot

Batafsil API integratsiya bo'yicha ma'lumot uchun `API_INTEGRATION.md` faylini o'qing.

## 📝 Static/Mock Data

Hozircha `lib/data.ts` da mock ma'lumotlar ishlatilmoqda:

- 28 ta mutaxassislik
- FAQ savollar
- Mock exam ma'lumotlari
- Document type labels

Backend tayyor bo'lganda, bu ma'lumotlar API'dan keladi.

## 🗂️ TypeScript Types

Barcha types `types/index.ts` da belgilangan:

- `Applicant` - Talabgor
- `Application` - Ariza
- `Specialization` - Mutaxassislik
- `Exam` - Imtihon
- `Payment` - To'lov
- `Document` - Hujjat
- va boshqalar...

## 🔐 Authentication

OneID orqali autentifikatsiya qo'llab-quvvatlanadi. `useAuthStore` hook'i orqali foydalanish:

```typescript
import { useAuthStore } from "@/lib/stores/authStore";

const { user, isAuthenticated, login, logout } = useAuthStore();
```

## 📄 Keyingi Qadamlar

1. ✅ Asosiy struktura va types
2. ✅ API client tayyor
3. ✅ Store'lar (mock data bilan)
4. ⏳ UI komponentlar yaratish
5. ⏳ Talabgor sahifalari
6. ⏳ Admin sahifalari
7. ⏳ Super Admin sahifalari
8. ⏳ Backend integratsiyasi

## 📞 Texnik Yordam

Savollar bo'lsa, FAQ bo'limini yoki texnik yordamga murojaat qiling.

---

**Ishlab chiquvchi:** Development Team
