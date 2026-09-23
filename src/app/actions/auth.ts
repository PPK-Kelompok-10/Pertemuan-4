"use server";
// src/app/actions/auth.ts
// FR-AUTH-01..09: register, login, logout, session.
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { registerSchema, loginSchema } from "@/lib/validation";

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

const GENERIC_LOGIN_ERROR = "Email atau password salah";

export async function registerAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    nama: String(formData.get("nama") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    konfirmasiPassword: String(formData.get("konfirmasiPassword") ?? ""),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as string;
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { fieldErrors };
  }

  const { nama, email, password } = parsed.data;

  // FR-AUTH-02: email harus unik
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { fieldErrors: { email: "Email sudah digunakan" } };
  }

  // FR-AUTH-03: hash bcrypt
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: { nama, email, passwordHash },
  });

  redirect("/login?registered=1");
}

export async function loginAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: GENERIC_LOGIN_ERROR };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  // NFR-09: pesan error generik, jangan bocorkan apakah email terdaftar atau tidak
  if (!user) {
    return { error: GENERIC_LOGIN_ERROR };
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return { error: GENERIC_LOGIN_ERROR };
  }

  // FR-AUTH-05: buat session, simpan userId
  const session = await getSession();
  session.userId = user.id;
  session.email = user.email;
  session.nama = user.nama;
  await session.save();

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  // FR-AUTH-09: hapus session & cookie session
  const session = await getSession();
  session.destroy();
  redirect("/login");
}
