import type { Metadata } from "next";
import { getCurrentUser } from "@/auth";
import { DashboardClient } from "./_DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Je persoonlijke NT2-dashboard.",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  return <DashboardClient userName={user?.name ?? "Amira"} />;
}
