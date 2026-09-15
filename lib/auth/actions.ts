"use server";

import { redirect } from "next/navigation";
import { registerUser, signIn } from "@/auth";

export async function registerAction(formData: FormData) {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };

  const result = await registerUser(raw);

  if (!result.success) {
    const errors = result.error;
    const query = new URLSearchParams();
    query.set(
      "error",
      errors?.formErrors?.[0] ?? "Controleer je gegevens en probeer het opnieuw.",
    );
    redirect(`/register?${query.toString()}`);
  }

  await signIn("credentials", {
    email: raw.email,
    password: raw.password,
    redirectTo: "/dashboard",
  });
}
