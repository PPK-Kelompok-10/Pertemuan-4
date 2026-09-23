"use client";
// src/components/AddTransactionForm.tsx
// FR-TRX-01..04
import { useActionState, useRef, useEffect } from "react";
import { addTransactionAction, type ActionState } from "@/app/actions/transactions";

const initialState: ActionState = {};

export default function AddTransactionForm() {
  const [state, formAction, isPending] = useActionState(addTransactionAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid grid-cols-1 gap-3 rounded border p-4 sm:grid-cols-2"
      noValidate
    >
      <div>
        <label htmlFor="type" className="mb-1 block text-sm font-medium">
          Tipe
        </label>
        <select id="type" name="type" required className="w-full rounded border px-3 py-2">
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        {state.fieldErrors?.type && (
          <p className="mt-1 text-sm text-red-600">{state.fieldErrors.type}</p>
        )}
      </div>

      <div>
        <label htmlFor="amount" className="mb-1 block text-sm font-medium">
          Nominal (Rp)
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          min="1"
          step="1"
          required
          className="w-full rounded border px-3 py-2"
        />
        {state.fieldErrors?.amount && (
          <p className="mt-1 text-sm text-red-600">{state.fieldErrors.amount}</p>
        )}
      </div>

      <div>
        <label htmlFor="transactionDate" className="mb-1 block text-sm font-medium">
          Tanggal
        </label>
        <input
          id="transactionDate"
          name="transactionDate"
          type="date"
          required
          defaultValue={today}
          className="w-full rounded border px-3 py-2"
        />
        {state.fieldErrors?.transactionDate && (
          <p className="mt-1 text-sm text-red-600">{state.fieldErrors.transactionDate}</p>
        )}
      </div>

      <div>
        <label htmlFor="category" className="mb-1 block text-sm font-medium">
          Kategori (opsional)
        </label>
        <input
          id="category"
          name="category"
          type="text"
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="note" className="mb-1 block text-sm font-medium">
          Catatan (opsional)
        </label>
        <input id="note" name="note" type="text" className="w-full rounded border px-3 py-2" />
      </div>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {isPending ? "Menyimpan..." : "Simpan Transaksi"}
        </button>
      </div>
    </form>
  );
}
