"use client";
// src/components/TransactionFilters.tsx
// FR-DASH-06 / FR-TRX-08/09: filter by type + rentang tanggal, lewat query string
// supaya hasil filter bisa di-refresh/dibagikan.
import { useRouter, usePathname } from "next/navigation";
import type { TransactionFilter } from "@/app/actions/transactions";

export default function TransactionFilters({
  currentFilter,
}: {
  currentFilter: TransactionFilter;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function updateFilter(patch: Partial<TransactionFilter>) {
    const next = { ...currentFilter, ...patch };
    const qs = new URLSearchParams();
    if (next.type && next.type !== "all") qs.set("type", next.type);
    if (next.startDate) qs.set("startDate", next.startDate);
    if (next.endDate) qs.set("endDate", next.endDate);
    const query = qs.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-sm font-medium">Tipe</label>
        <select
          value={currentFilter.type ?? "all"}
          onChange={(e) => updateFilter({ type: e.target.value as TransactionFilter["type"] })}
          className="rounded border px-3 py-2"
        >
          <option value="all">Semua</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Dari tanggal</label>
        <input
          type="date"
          value={currentFilter.startDate ?? ""}
          onChange={(e) => updateFilter({ startDate: e.target.value })}
          className="rounded border px-3 py-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Sampai tanggal</label>
        <input
          type="date"
          value={currentFilter.endDate ?? ""}
          onChange={(e) => updateFilter({ endDate: e.target.value })}
          className="rounded border px-3 py-2"
        />
      </div>
    </div>
  );
}
