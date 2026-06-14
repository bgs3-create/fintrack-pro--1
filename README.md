# 💰 FinTrack Pro — Aplikasi Pembukuan Keuangan Modern

Aplikasi pembukuan keuangan fullstack berbasis web dengan desain premium, analitik real-time, manajemen anggaran, target tabungan, dan laporan keuangan lengkap.

---

## 🚀 Fitur Utama

- **Dashboard** — Ringkasan saldo, pemasukan, pengeluaran, profit/rugi, grafik 6 bulan
- **Manajemen Transaksi** — Tambah, edit, hapus, filter, search, sortir, paginasi
- **Anggaran (Budget)** — Target pengeluaran per kategori + peringatan otomatis
- **Target Tabungan** — Saving goals dengan progress tracking & deadline
- **Laporan** — Cashflow harian, breakdown kategori, export CSV
- **Multi Akun** — Kas, Bank, E-Wallet, akun custom
- **Kategori Custom** — Buat & kelola kategori sendiri
- **Dark Mode** — Default gelap, bisa toggle terang
- **Responsive** — Mobile-first, berjalan di semua ukuran layar
- **Auth Aman** — JWT + httpOnly cookie, register & login
- **Seed Data** — Data dummy realistis siap pakai

---

## 🛠️ Teknologi

| Layer       | Teknologi                        |
|-------------|----------------------------------|
| Frontend    | Next.js 14, React 18, TypeScript |
| Styling     | Tailwind CSS, Framer Motion      |
| Backend     | Next.js API Routes (App Router)  |
| Database    | SQLite (file lokal)              |
| ORM         | Prisma                           |
| Auth        | JWT (jose) + bcryptjs            |
| Charts      | Recharts                         |
| Forms       | React Hook Form + Zod            |
| State       | React State + SWR pattern        |

---

## 📁 Struktur Folder

```
fintrack-pro/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data dummy
├── public/
│   └── manifest.json          # PWA manifest
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # login, register, logout, me
│   │   │   ├── transactions/  # CRUD transaksi
│   │   │   ├── accounts/      # CRUD akun
│   │   │   ├── categories/    # CRUD kategori
│   │   │   ├── budgets/       # CRUD anggaran
│   │   │   ├── saving-goals/  # CRUD target tabungan
│   │   │   ├── dashboard/     # Data dashboard
│   │   │   └── reports/       # Data laporan
│   │   ├── dashboard/
│   │   │   ├── layout.tsx     # Sidebar + navbar layout
│   │   │   ├── page.tsx       # Dashboard utama
│   │   │   ├── transactions/  # Halaman transaksi
│   │   │   ├── budgets/       # Halaman anggaran
│   │   │   ├── savings/       # Halaman target tabungan
│   │   │   ├── reports/       # Halaman laporan
│   │   │   ├── accounts/      # Halaman akun
│   │   │   └── categories/    # Halaman kategori
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout + ThemeProvider
│   │   └── page.tsx           # Halaman login/register
│   ├── components/
│   │   └── TransactionModal.tsx  # Modal tambah/edit transaksi
│   ├── lib/
│   │   ├── auth.ts            # JWT utils
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── utils.ts           # Helper functions
│   │   └── validations.ts     # Zod schemas
│   └── middleware.ts          # Auth middleware (route protection)
├── .env                       # Environment variables
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## ⚙️ Cara Install & Jalankan

### Prasyarat
- Node.js v18 atau lebih baru
- npm atau yarn

### Langkah 1 — Clone / Download Project

```bash
cd fintrack-pro
```

### Langkah 2 — Install Dependencies

```bash
npm install
```

### Langkah 3 — Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Buat tabel database
npm run db:push

# Isi data dummy (opsional tapi disarankan)
npm run db:seed
```

### Langkah 4 — Jalankan Development Server

```bash
npm run dev
```

### Langkah 5 — Buka di Browser

```
http://localhost:3000
```

---

## 🎯 Akun Demo

Setelah seed database, login dengan:

```
Email    : demo@fintrack.id
Password : password123
```

---

## 🔧 Satu Perintah Setup (All-in-one)

```bash
npm run setup
```

Perintah ini akan otomatis: install deps → generate prisma → push DB → seed data.

---


```

> ⚠️ **Ganti JWT_SECRET & NEXTAUTH_SECRET** dengan string random panjang sebelum deploy ke production!

---

## 🗄️ Database

SQLite disimpan di `prisma/dev.db` (dibuat otomatis).

```bash
# Buka Prisma Studio (database GUI)
npm run db:studio

# Reset database + seed ulang
npm run db:reset
```

---

## 📦 Scripts

| Script            | Fungsi                              |
|-------------------|-------------------------------------|
| `npm run dev`     | Jalankan development server         |
| `npm run build`   | Build untuk production              |
| `npm run start`   | Jalankan production server          |
| `npm run db:generate` | Generate Prisma client          |
| `npm run db:push` | Push schema ke database             |
| `npm run db:seed` | Isi data dummy                      |
| `npm run db:studio` | Buka Prisma Studio              |
| `npm run db:reset` | Reset + seed ulang                 |
| `npm run setup`   | Install + setup lengkap             |

---

## 🚢 Deploy ke VPS/Server

### Build Production
```bash
npm run build
npm run start
```

### Dengan PM2
```bash
npm install -g pm2
npm run build
pm2 start npm --name "fintrack" -- start
pm2 save
pm2 startup
```

### Ganti ke PostgreSQL (opsional)
Di `prisma/schema.prisma`, ubah provider:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
Dan ubah `DATABASE_URL` di `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/fintrack"
```

---

## 🎨 Customisasi

- **Warna tema**: Edit `tailwind.config.js` → `colors.brand`
- **Font**: Edit `src/app/globals.css` → `@import`
- **Currency default**: Edit seed di `prisma/seed.ts`
- **Kategori default**: Edit array `DEFAULT_CATEGORIES` di `src/app/api/auth/register/route.ts`

---

## 📱 Mobile Support

Aplikasi sudah responsive dan bisa diakses dari HP. Untuk PWA:
1. Buka di Chrome mobile → ketuk ikon "Add to Home Screen"
2. Aplikasi berjalan seperti native app

---

## 🔒 Keamanan

- Password di-hash dengan bcrypt (cost factor 12)
- JWT disimpan di httpOnly cookie (tidak bisa diakses JavaScript)
- Semua API route diproteksi middleware auth
- Setiap query memverifikasi `userId` agar data antar user tidak bocor

---

*Dibuat dengan ❤️ menggunakan Next.js, Prisma, dan Tailwind CSS*
