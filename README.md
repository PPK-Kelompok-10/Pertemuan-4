# Expense Tracker — Bagian Saya (Auth, Session, Preferensi, Dashboard, Transaksi)

File-file di sini mengimplementasikan seluruh bagian tugas saya sesuai SRS:
Autentikasi & Akun, Session & Cookie Preferensi, Dashboard, dan Modul Transaksi.

## 1. Cara Setup

### 1.1 Salin file ke project Next.js Anda
Project Anda sudah dibuat dengan `pnpm create next-app@latest`. Salin folder
`src/`, `prisma/`, `supabase/`, dan `.env.local.example` di sini ke root
project Anda (timpa file yang sama namanya, seperti `src/app/page.tsx`).

### 1.2 Install dependency
Lihat `PACKAGE_JSON_ADDITIONS.md` — jalankan:

```bash
pnpm add @prisma/client bcryptjs iron-session zod
pnpm add -D prisma tsx @types/bcryptjs
```

Lalu tambahkan script `prisma:generate`, `prisma:migrate`, `seed` ke
`package.json` seperti dijelaskan di file tersebut.

### 1.3 Buat project Supabase
1. Buka https://supabase.com/dashboard → **New project**.
2. Catat password database yang Anda buat saat itu.
3. Masuk ke **Project Settings → Database → Connection string**:
   - Ambil string **Connection pooling** (port 6543, mode transaction) → jadi `DATABASE_URL`.
   - Ambil string **Direct connection** (port 5432) → jadi `DIRECT_URL`.

### 1.4 Buat `.env.local`
```bash
cp .env.local.example .env.local
```
Isi `DATABASE_URL`, `DIRECT_URL` dengan connection string dari langkah 1.3,
dan `SESSION_SECRET` dengan string acak panjang, contoh:

```bash
openssl rand -base64 32
```

### 1.5 Jalankan SQL migration & RLS policy
Buka **Supabase Dashboard → SQL Editor → New query**, tempel isi
`supabase/migration.sql`, lalu **Run**. Ini membuat tabel `users`,
`transactions`, index, dan mengaktifkan Row Level Security.

> Alternatif: karena project ini juga pakai Prisma, Anda bisa memakai
> `pnpm prisma:migrate` untuk membuat tabel dari `prisma/schema.prisma`
> langsung ke database Supabase (memakai `DIRECT_URL`). Kalau memilih jalur
> ini, tetap jalankan bagian **RLS** di `supabase/migration.sql` secara
> manual di SQL Editor, karena `prisma migrate` tidak menjalankan RLS.

### 1.6 Generate Prisma Client & seed data demo
```bash
pnpm prisma:generate
pnpm seed
```

### 1.7 Jalankan aplikasi
```bash
pnpm dev
```
Buka http://localhost:3000 — otomatis diarahkan ke `/login`.

---

## 2. Info Login per Actor

Sesuai SRS bagian 1.4, aplikasi ini hanya punya **2 aktor**: **Guest** dan
**User**. Tidak ada aktor admin/role khusus, dan tidak ada jalur registrasi
khusus admin — semua User mendaftar sendiri lewat `/register`.

| Actor | Cara dapat akun | Akses |
|---|---|---|
| Guest | — (belum login) | `/login`, `/register` |
| User  | Daftar mandiri di `/register`, **atau** pakai akun demo hasil seed | `/dashboard`, `/transactions`, `/settings` |

**Akun demo (dari `pnpm seed`)** — hanya untuk keperluan demo/testing, bukan
akun production:

| Email | Password |
|---|---|
| `demo@example.com` | `password123` |

Ganti/hapus akun ini sebelum deploy ke production, atau jalankan `pnpm seed`
hanya di database development.

---

## 3. Validasi Client-side vs Server-side

**Prinsip:** validasi client-side hanya untuk UX (feedback instan, mencegah
submit yang jelas salah). Validasi server-side adalah **satu-satunya sumber
kebenaran**, karena request bisa dikirim langsung ke server action tanpa
lewat UI (lewat devtools, curl, dsb).

| Lapisan | Lokasi | Contoh |
|---|---|---|
| Client-side | Atribut HTML (`required`, `minLength`, `type="email"`, `type="number" min="1"`) di setiap form (`register`, `login`, `AddTransactionForm`) | Mencegah submit form kosong, memberi format input yang benar (date picker, number input) |
| Server-side | `src/lib/validation.ts` (skema `zod`), dijalankan di setiap **Server Action** sebelum menyentuh database | `registerSchema`, `loginSchema`, `transactionSchema`, `filterSchema` |
| Otorisasi (bukan sekadar validasi) | `requireUserId()` di `src/app/actions/transactions.ts` + middleware `src/middleware.ts` | Memastikan `user_id` transaksi **selalu** diambil dari session, tidak pernah dari input form, dan halaman terproteksi tidak bisa diakses guest |

Detail per aturan bisnis (business rules SRS bagian 9) yang diterapkan di
kode:
- Email unik → dicek di `registerAction` sebelum `prisma.user.create`.
- Password ≥ 8 karakter & di-hash bcrypt → `registerSchema` + `bcrypt.hash(password, 12)`.
- `amount > 0` → dicek dua kali: constraint database (`CHECK (amount > 0)` di
  SQL & Prisma) **dan** `transactionSchema` (zod `.positive()`).
- Isolasi data user → semua query transaksi (`getTransactions`,
  `getDashboardSummary`, `deleteTransactionAction`) memakai
  `WHERE userId = <dari session>`, tidak pernah dari client.
- Pesan error login generik ("Email atau password salah") — tidak
  membocorkan apakah email terdaftar atau tidak (lihat NFR-09).

---

## 4. Koordinasi dengan Tim (PENTING — baca sebelum digabung ke project bersama)

Bagian saya membuat **tabel database, RLS policy, dan pola autentikasi** yang
kemungkinan besar akan dipakai/di-depend oleh fitur anggota tim lain. Mohon
koordinasikan hal berikut sebelum digabung:

1. **Skema tabel `users` & `transactions`** (`prisma/schema.prisma` dan
   `supabase/migration.sql`) adalah milik bersama. Kalau anggota lain perlu
   kolom tambahan (misal `avatar_url` di `users`, atau `receipt_url` di
   `transactions`), tolong diskusikan dulu — jangan langsung `ALTER TABLE`
   sendiri supaya tidak konflik dengan migration Prisma saya.
2. **Autentikasi dibuat manual** (bcrypt + `iron-session`), **bukan**
   Supabase Auth (`auth.users`). Kalau ada anggota tim yang berencana
   memakai fitur Supabase Auth (misalnya login Google/OAuth, atau
   Supabase Realtime yang butuh `auth.uid()`), itu **tidak akan otomatis
   kompatibel** dengan skema session ini — perlu didiskusikan dulu apakah
   seluruh tim pindah ke Supabase Auth, atau fitur itu tetap memakai session
   `userId` dari `iron-session` (lihat `src/lib/session.ts` →
   `getCurrentUserId()`, ini bisa dipakai fitur lain juga).
3. **RLS policy** di `supabase/migration.sql` sengaja **menolak semua akses
   langsung** dari `anon`/`authenticated` role Supabase client. Ini karena
   semua akses lewat backend Next.js (Prisma, direct connection). Kalau ada
   anggota tim yang mau akses tabel `users`/`transactions` langsung dari
   frontend pakai `supabase-js` client (bukan lewat Server Action saya),
   **itu akan diblokir RLS** — mereka perlu request lewat Server
   Action/Route Handler yang saya sediakan (`src/app/actions/transactions.ts`),
   atau kita diskusikan dulu untuk mengubah pendekatan RLS.
4. **`src/middleware.ts`** memproteksi prefix `/dashboard`, `/transactions`,
   `/settings`. Kalau anggota lain menambah route terproteksi baru (misal
   `/reports`), tambahkan prefix-nya ke `PROTECTED_PREFIXES` di file itu, dan
   ke `config.matcher` di file yang sama — beri tahu saya juga supaya tidak
   bentrok kalau saya sedang mengedit file yang sama.
5. **`src/app/(protected)/layout.tsx`** adalah navbar bersama untuk semua
   halaman yang butuh login. Kalau anggota lain menambah halaman baru yang
   perlu login, taruh di dalam folder `(protected)/` supaya otomatis dapat
   navbar & proteksi sesi yang sama — tidak perlu bikin layout terpisah.
6. **Environment variables** (`SESSION_SECRET`, `DATABASE_URL`,
   `DIRECT_URL`) sebaiknya sama untuk semua anggota tim yang menjalankan
   project ini secara lokal terhadap Supabase project yang sama, supaya
   session dari satu anggota tidak invalid saat dibuka anggota lain. Bagikan
   `.env.local` lewat kanal aman tim (jangan commit ke git — sudah ada di
   `.gitignore` bawaan `create-next-app`).

---

## 5. Struktur File yang Ditambahkan

```
prisma/
  schema.prisma
  seed.ts
supabase/
  migration.sql
src/
  middleware.ts
  lib/
    prisma.ts
    session.ts
    validation.ts
  app/
    page.tsx
    (auth)/
      login/page.tsx
      register/page.tsx
    (protected)/
      layout.tsx
      dashboard/page.tsx
      transactions/page.tsx
    actions/
      auth.ts
      preferences.ts
      transactions.ts
  components/
    ThemeToggle.tsx
    DeleteTransactionButton.tsx
    AddTransactionForm.tsx
    TransactionFilters.tsx
.env.local.example
PACKAGE_JSON_ADDITIONS.md
```
