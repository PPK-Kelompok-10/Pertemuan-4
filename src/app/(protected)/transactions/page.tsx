// src/app/(protected)/transactions/page.tsx -> route: /transactions
// FR-TRX-01..09
import { getTransactions, type TransactionFilter } from "@/app/actions/transactions";
import AddTransactionForm from "@/components/AddTransactionForm";
import TransactionFilters from "@/components/TransactionFilters";
import DeleteTransactionButton from "@/components/DeleteTransactionButton";

function formatIDR(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; startDate?: string; endDate?: string }>;
}) {
  const params = await searchParams;
  const filter: TransactionFilter = {
    type: (params.type as TransactionFilter["type"]) ?? "all",
    startDate: params.startDate ?? "",
    endDate: params.endDate ?? "",
  };

  const transactions = await getTransactions(filter);
  const filteredTotal = transactions.reduce((sum, t) => {
    const amount = Number(t.amount);
    return t.type === "income" ? sum + amount : sum - amount;
  }, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="mb-3 text-lg font-semibold">Tambah Transaksi</h1>
        <AddTransactionForm />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Daftar Transaksi</h2>
        <TransactionFilters currentFilter={filter} />

        {transactions.length === 0 ? (
          <p className="mt-4 rounded border border-dashed p-6 text-center text-neutral-500">
            Tidak ada transaksi untuk filter ini.
          </p>
        ) : (
          <>
            <ul className="mt-4 divide-y rounded border">
              {transactions.map((trx) => (
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
                        trx.type === "income"
                          ? "font-semibold text-green-600"
                          : "font-semibold text-red-600"
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
            <p className="mt-3 text-right text-sm text-neutral-600">
              Total terfilter: <span className="font-semibold">{formatIDR(filteredTotal)}</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
