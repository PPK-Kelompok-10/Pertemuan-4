// src/app/dashboard/layout.tsx
// Layout ini dipakai untuk /dashboard. Pasang layout yang sama (atau pindah
// jadi src/app/(protected)/layout.tsx dibagikan) untuk /transactions.
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { logoutAction } from "@/app/actions/auth";
import { getPreferences } from "@/app/actions/preferences";
import ThemeToggle from "@/components/ThemeToggle";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session.userId) {
    redirect("/login"); // lapisan kedua selain middleware (defense in depth)
  }
  const { theme } = await getPreferences();

  return (
    <div data-theme={theme} className="min-h-screen bg-white text-black data-[theme=dark]:bg-neutral-900 data-[theme=dark]:text-white">
      <nav className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-4">
          <span className="font-semibold">Expense Tracker</span>
          <Link href="/dashboard" className="text-sm hover:underline">
            Dashboard
          </Link>
          <Link href="/transactions" className="text-sm hover:underline">
            Transaksi
          </Link>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <ThemeToggle currentTheme={theme} />
          <span>{session.nama ?? session.email}</span>
          <form action={logoutAction}>
            <button type="submit" className="rounded border px-3 py-1 hover:bg-neutral-100">
              Logout
            </button>
          </form>
        </div>
      </nav>
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
    </div>
  );
}
