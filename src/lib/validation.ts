// src/lib/validation.ts
// Validasi dipakai DUA kali: di client (react-hook-form/HTML) untuk UX cepat,
// dan WAJIB lagi di server action (sumber kebenaran) karena client bisa
// dilewati/dimanipulasi. Skema zod ini dipakai di server actions.
import { z } from "zod";

export const registerSchema = z
  .object({
    nama: z.string().trim().min(1, "Nama wajib diisi").max(100),
    email: z.string().trim().toLowerCase().email("Format email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter").max(100),
    konfirmasiPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.konfirmasiPassword, {
    message: "Konfirmasi password tidak sama",
    path: ["konfirmasiPassword"],
  });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"], { message: "Tipe tidak valid" }),
  amount: z.coerce.number().positive("Nominal harus lebih dari 0"),
  category: z.string().trim().max(50).optional().or(z.literal("")),
  note: z.string().trim().max(255).optional().or(z.literal("")),
  transactionDate: z.string().min(1, "Tanggal wajib diisi"), // "YYYY-MM-DD"
});

export const filterSchema = z.object({
  type: z.enum(["all", "income", "expense"]).default("all"),
  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal("")),
});
