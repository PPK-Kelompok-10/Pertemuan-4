"use server";
// src/app/actions/transactions.ts
// FR-TRX-01..11, FR-DASH-01..08. Aturan penting: user_id SELALU dari session,
// TIDAK PERNAH dari input form/client (mencegah user A memasukkan/menghapus
// data milik user B).
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { transactionSchema, filterSchema } from "@/lib/validation";

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

async function requireUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("UNAUTHENTICATED");
  }
  return userId;
}

export async function addTransactionAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const userId = await requireUserId();

  const raw = {
    type: String(formData.get("type") ?? ""),
    amount: String(formData.get("amount") ?? ""),
    category: String(formData.get("category") ?? ""),
    note: String(formData.get("note") ?? ""),
    transactionDate: String(formData.get("transactionDate") ?? ""),
  };

  const parsed = transactionSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as string;
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { fieldErrors };
  }

  const { type, amount, category, note, transactionDate } = parsed.data;

  await prisma.transaction.create({
    data: {
      userId, // dari session, bukan dari formData
      type,
      amount,
      category: category || null,
      note: note || null,
      transactionDate: new Date(transactionDate),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  return { success: true };
}

export async function deleteTransactionAction(transactionId: string) {
  const userId = await requireUserId();

  // FR-TRX-07: hapus wajib cek id DAN user_id, agar user tidak bisa
  // menghapus transaksi milik user lain walau tahu id-nya.
  const result = await prisma.transaction.deleteMany({
    where: { id: transactionId, userId },
  });

  if (result.count === 0) {
    throw new Error("Transaksi tidak ditemukan atau bukan milik Anda");
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
}

export type TransactionFilter = {
  type?: "all" | "income" | "expense";
  startDate?: string;
  endDate?: string;
};

export async function getTransactions(filter: TransactionFilter = {}) {
  const userId = await requireUserId();
  const parsed = filterSchema.safeParse(filter);
  const { type, startDate, endDate } = parsed.success
    ? parsed.data
    : { type: "all" as const, startDate: "", endDate: "" };

  return prisma.transaction.findMany({
    where: {
      userId, // FR-TRX-07 / NFR-12: isolasi data per user
      ...(type !== "all" ? { type } : {}),
      ...(startDate || endDate
        ? {
            transactionDate: {
              ...(startDate ? { gte: new Date(startDate) } : {}),
              ...(endDate ? { lte: new Date(endDate) } : {}),
            },
          }
        : {}),
    },
    orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
  });
}

export async function getDashboardSummary() {
  const userId = await requireUserId();

  const [incomeAgg, expenseAgg, recent] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: "income" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: "expense" },
      _sum: { amount: true },
    }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
      take: 5,
    }),
  ]);

  const totalIncome = Number(incomeAgg._sum.amount ?? 0);
  const totalExpense = Number(expenseAgg._sum.amount ?? 0);

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    recentTransactions: recent,
  };
}
