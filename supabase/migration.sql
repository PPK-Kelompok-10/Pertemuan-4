-- supabase/migration.sql
-- Jalankan di Supabase SQL Editor (Project > SQL Editor > New query)
-- Berisi: tabel users, transactions, index, dan RLS policy.
--
-- PENTING (baca juga README bagian "Koordinasi Tim"):
-- Project ini TIDAK memakai Supabase Auth (auth.users). Autentikasi dibuat
-- manual dengan Prisma + bcrypt + cookie session sesuai SRS. Karena itu,
-- Next.js server (lewat Prisma) mengakses Postgres pakai DIRECT connection,
-- BUKAN via Supabase client anon/authenticated key. Jadi enforcement utama
-- keamanan ada di level aplikasi (WHERE user_id = session user).
--
-- RLS tetap diaktifkan di sini sebagai lapisan pertahanan tambahan (defense
-- in depth): kalau ada anggota tim lain yang mengakses tabel ini lewat
-- Supabase client (anon/authenticated key) dari sisi frontend langsung,
-- policy di bawah akan MENOLAK semua akses tersebut. Semua akses wajib
-- lewat backend Next.js kita.
--
-- Kalau nanti tim sepakat pindah ke Supabase Auth asli, policy ini perlu
-- diganti memakai auth.uid() = user_id. Koordinasikan dulu sebelum ubah.

create extension if not exists "pgcrypto";

-- =========================================================
-- Tabel users
-- =========================================================
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- =========================================================
-- Tabel transactions
-- =========================================================
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount numeric(14,2) not null check (amount > 0),
  category text,
  note text,
  transaction_date date not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_transactions_user on public.transactions(user_id);
create index if not exists idx_transactions_date on public.transactions(transaction_date);

-- =========================================================
-- Row Level Security
-- =========================================================
alter table public.users enable row level security;
alter table public.transactions enable row level security;

-- Tidak ada policy select/insert/update/delete dibuat untuk role
-- 'anon' maupun 'authenticated' -> default Postgres/Supabase adalah DENY
-- semua kalau RLS aktif dan tidak ada policy yang match.
-- Ini sengaja: akses HANYA lewat backend Next.js (Prisma, direct connection,
-- yang berjalan sebagai role database biasa / postgres role, bukan
-- anon/authenticated), sehingga tidak terikat oleh RLS di atas.
--
-- Kalau butuh mengizinkan akses langsung dari Supabase client
-- (misal untuk anggota tim lain yang pakai supabase-js di frontend),
-- diskusikan dulu dengan saya karena itu mengubah asumsi keamanan
-- seluruh modul auth & transaksi ini.

comment on table public.users is
  'Dikelola oleh modul Auth (bagian solo developer). Akses hanya lewat backend Next.js/Prisma, bukan Supabase client langsung.';
comment on table public.transactions is
  'Dikelola oleh modul Transaksi (bagian solo developer). Kolom user_id WAJIB diisi dari session, jangan dari input client lain.';
