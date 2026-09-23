// src/middleware.ts
// FR-AUTH-07/08: proteksi /dashboard, /transactions, /settings.
// Taruh file ini di src/middleware.ts (sejajar dengan src/app), Next.js
// otomatis mendeteksinya berdasarkan nama file, bukan lokasi di dalam app/.
import { NextResponse, type NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/session";

const PROTECTED_PREFIXES = ["/dashboard", "/transactions", "/settings"];
const GUEST_ONLY_PATHS = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(
    request,
    response,
    sessionOptions
  );

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isGuestOnly = GUEST_ONLY_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected && !session.userId) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Kalau sudah login, tidak perlu lagi ke /login atau /register.
  if (isGuestOnly && session.userId) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/transactions/:path*", "/settings/:path*", "/login", "/register"],
};
