"use client";
// src/app/(auth)/login/page.tsx -> route: /login
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginAction, type ActionState } from "@/app/actions/auth";

const initialState: ActionState = {};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-6 text-2xl font-semibold">Login</h1>

      {justRegistered && (
        <p className="mb-4 rounded bg-green-100 px-3 py-2 text-sm text-green-800">
          Akun berhasil dibuat. Silakan login.
        </p>
      )}

      {state.error && (
        <p className="mb-4 rounded bg-red-100 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      )}

      <form action={formAction} className="flex flex-col gap-4" noValidate>
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
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {isPending ? "Memproses..." : "Login"}
        </button>
      </form>

      <p className="mt-4 text-sm">
        Belum punya akun?{" "}
        <Link href="/register" className="underline">
          Daftar
        </Link>
      </p>
    </main>
  );
}
