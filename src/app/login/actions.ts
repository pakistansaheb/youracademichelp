"use server";

import { redirect } from "next/navigation";
import { signIn } from "@/auth";

export async function requestMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!email) return;

  await signIn("resend", { email, redirect: false });
  redirect("/login/check-email");
}
