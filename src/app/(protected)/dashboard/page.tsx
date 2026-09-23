// src/app/(protected)/dashboard/page.tsx -> route: /dashboard
// FR-DASH-01..08
import Link from "next/link";
import { getDashboardSummary } from "@/app/actions/transactions";
import DeleteTransactionButton from "@/components/DeleteTransactionButton";

function formatIDR(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function DashboardPage() {
  const { totalIncome, totalExpense, balance, recentTransactions } =
    await getDashboardSummary();

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded border p-4">
          <p className="text-sm text-neutral-500">Total Pemasukan</p>
          <p className="text-xl font-semibold text-green-600">{formatIDR(totalIncome)}</p>
        </div>
        <div className="rounded border p-4">
          <p className="text-sm text-neutral-500">Total Pengeluaran</p>
          <p className="text-xl font-semibold text-red-600">{formatIDR(totalExpense)}</p>
        </div>
        <div className="rounded border p-4">
          <p className="text-sm text-neutral-500">Saldo</p>
          <p className="text-xl font-semibold">{formatIDR(balance)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Transaksi Terbaru</h2>
        <Link
          href="/transactions"
          className="rounded bg-black px-3 py-1.5 text-sm text-white"
        >
          + Tambah Transaksi
        </Link>
      </div>

      {recentTransactions.length === 0 ? (
        <p className="rounded border border-dashed p-6 text-center text-neutral-500">
          Belum ada transaksi. Tambahkan transaksi pertama Anda.
        </p>
      ) : (
        <ul className="divide-y rounded border">
          {recentTransactions.map((trx) => (
            <li key={trx.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium">{trx.category || "(Tanpa kategori)"}</p>
                <p className="text-sm text-neutral-500">
                  {new Date(trx.transactionDate).toLocaleDateString("id-ID")}
                  {trx.note ? ` · ${trx.note}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={
                    trx.type === "income" ? "font-semibold text-green-600" : "font-semibold text-red-600"
                  }
                >
                  {trx.type === "income" ? "+" : "-"}
                  {formatIDR(Number(trx.amount))}
                </span>
                <DeleteTransactionButton transactionId={trx.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
