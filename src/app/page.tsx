// src/app/page.tsx -> route: /
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/session";

export default async function RootPage() {
  const userId = await getCurrentUserId();
  redirect(userId ? "/dashboard" : "/login");
}
