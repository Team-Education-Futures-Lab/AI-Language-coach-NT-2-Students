import { LoginForm } from "@/components/features/auth/login-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <section className="container flex min-h-[calc(100dvh-12rem)] items-center justify-center py-12">
      <LoginForm />
    </section>
  );
}
