// src/lib/session.ts
// Session login (FR-AUTH-05, FR-AUTH-06, FR-SESS-01..03).
// Memakai iron-session: data session dienkripsi & disimpan di dalam cookie
// itu sendiri (bukan tabel `sessions` terpisah), tapi secara perilaku sama
// seperti session server-side: browser hanya menyimpan token terenkripsi,
// tidak bisa dibaca/diubah oleh client.
import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";

export interface SessionData {
  userId?: string;
  email?: string;
  nama?: string;
}

const SEVEN_DAYS_IN_SECONDS = 60 * 60 * 24 * 7;

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: "expenses_tracker_session",
  ttl: SEVEN_DAYS_IN_SECONDS, // FR-SESS-03: masa berlaku 7 hari
  cookieOptions: {
    httpOnly: true, // FR-SESS-02
    sameSite: "lax", // FR-SESS-02
    secure: process.env.NODE_ENV === "production", // FR-SESS-02
    path: "/",
    maxAge: SEVEN_DAYS_IN_SECONDS,
  },
};

if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  // Gagal cepat kalau lupa isi .env.local dengan benar.
  console.warn(
    "[session] SESSION_SECRET belum diisi atau kurang dari 32 karakter. Set di .env.local."
  );
}

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

/** Ambil userId dari session. Return null kalau belum login. */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getSession();
  return session.userId ?? null;
}
