import { RegisterForm } from "@/components/features/auth/register-form";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <section className="container flex min-h-[calc(100dvh-12rem)] items-center justify-center py-12">
      <RegisterForm />
    </section>
  );
}
