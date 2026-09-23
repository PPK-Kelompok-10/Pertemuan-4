"use client";
// src/app/(auth)/register/page.tsx  -> route: /register
import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type ActionState } from "@/app/actions/auth";

const initialState: ActionState = {};

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-6 text-2xl font-semibold">Daftar Akun</h1>

      <form action={formAction} className="flex flex-col gap-4" noValidate>
        <div>
          <label htmlFor="nama" className="mb-1 block text-sm font-medium">
            Nama
          </label>
          <input
            id="nama"
            name="nama"
            type="text"
            required
            className="w-full rounded border px-3 py-2"
          />
          {state.fieldErrors?.nama && (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.nama}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded border px-3 py-2"
          />
          {state.fieldErrors?.email && (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full rounded border px-3 py-2"
          />
          {state.fieldErrors?.password && (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.password}</p>
          )}
        </div>

        <div>
          <label htmlFor="konfirmasiPassword" className="mb-1 block text-sm font-medium">
            Konfirmasi Password
          </label>
          <input
            id="konfirmasiPassword"
            name="konfirmasiPassword"
            type="password"
            required
            minLength={8}
            className="w-full rounded border px-3 py-2"
          />
          {state.fieldErrors?.konfirmasiPassword && (
            <p className="mt-1 text-sm text-red-600">
              {state.fieldErrors.konfirmasiPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {isPending ? "Memproses..." : "Daftar"}
        </button>
      </form>

      <p className="mt-4 text-sm">
        Sudah punya akun?{" "}
        <Link href="/login" className="underline">
          Login
        </Link>
      </p>
    </main>
  );
}
