"use client";
// src/components/DeleteTransactionButton.tsx
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteTransactionAction } from "@/app/actions/transactions";

export default function DeleteTransactionButton({
  transactionId,
}: {
  transactionId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Hapus transaksi ini?")) return;
    startTransition(async () => {
      await deleteTransactionAction(transactionId);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      {isPending ? "Menghapus..." : "Hapus"}
    </button>
  );
}
