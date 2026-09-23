// prisma/seed.ts
// Aplikasi ini TIDAK punya actor admin (semua aktor adalah "User" biasa yang
// bisa daftar sendiri lewat /register, sesuai SRS bagian 1.4). Jadi tidak
// wajib ada akun default. Skrip ini disediakan supaya dosen/anggota tim lain
// bisa langsung punya 1 akun contoh untuk demo, tanpa perlu register manual.
//
// Jalankan dengan: pnpm seed
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@example.com";
  const plainPassword = "password123"; // hanya untuk demo, JANGAN dipakai di production

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`User demo (${email}) sudah ada, dilewati.`);
    return;
  }

  const passwordHash = await bcrypt.hash(plainPassword, 12);
  const user = await prisma.user.create({
    data: {
      nama: "User Demo",
      email,
      passwordHash,
    },
  });

  await prisma.transaction.createMany({
    data: [
      {
        userId: user.id,
        type: "income",
        amount: 5_000_000,
        category: "Gaji",
        note: "Gaji bulan ini",
        transactionDate: new Date(),
      },
      {
        userId: user.id,
        type: "expense",
        amount: 150_000,
        category: "Makan",
        note: "Makan siang & kopi",
        transactionDate: new Date(),
      },
    ],
  });

  console.log(`Akun demo dibuat: ${email} / ${plainPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
