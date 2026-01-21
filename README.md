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

Frontend allaqachon API integratsiyasi uchun tayyorlangan. `lib/api/client.ts` faylida API client mavjud.

### Backend tayyor bo'lganda:

1. `.env.local` faylida `NEXT_PUBLIC_API_URL` o'rnating:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

2. `lib/stores/` da mock funksiyalarni API chaqiruvlari bilan almashtiring

3. `lib/api/client.ts` da API endpoints'larni to'g'ri sozlang

### Hozirgi holat:

- ✅ API client struktura tayyor
- ✅ Mock data bilan ishlaydi
- ✅ Store'lar mock funksiyalar bilan ishlaydi
- ✅ API ready bo'lganda osonlik bilan ulash mumkin

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
