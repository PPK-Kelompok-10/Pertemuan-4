"use server";
// src/app/actions/preferences.ts
// FR-PREF-01..05: cookie preferensi theme & transactionView, persisten (Max-Age 1 tahun).
import { cookies } from "next/headers";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export async function setThemeAction(value: "light" | "dark") {
  const cookieStore = await cookies();
  cookieStore.set("theme", value, {
    maxAge: ONE_YEAR_IN_SECONDS,
    path: "/",
    sameSite: "lax",
    httpOnly: false, // dibaca oleh client script untuk toggle instan, tidak sensitif
  });
}

export async function setTransactionViewAction(value: "list" | "grid") {
  const cookieStore = await cookies();
  cookieStore.set("transactionView", value, {
    maxAge: ONE_YEAR_IN_SECONDS,
    path: "/",
    sameSite: "lax",
    httpOnly: false,
  });
}

export async function getPreferences() {
  const cookieStore = await cookies();
  const theme = (cookieStore.get("theme")?.value as "light" | "dark") ?? "light";
  const transactionView =
    (cookieStore.get("transactionView")?.value as "list" | "grid") ?? "list";
  return { theme, transactionView };
}
