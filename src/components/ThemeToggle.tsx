"use client";
// src/components/ThemeToggle.tsx
// FR-PREF-01: toggle theme light/dark, langsung tersimpan ke cookie.
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setThemeAction } from "@/app/actions/preferences";

export default function ThemeToggle({ currentTheme }: { currentTheme: "light" | "dark" }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = currentTheme === "light" ? "dark" : "light";
    startTransition(async () => {
      await setThemeAction(next);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      className="rounded border px-3 py-1"
      aria-label="Toggle theme"
    >
      {currentTheme === "light" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}
