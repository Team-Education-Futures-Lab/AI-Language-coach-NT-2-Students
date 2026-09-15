import type { Metadata } from "next";
import { LessonsClient } from "./_LessonsClient";

export const metadata: Metadata = {
  title: "Lessen & Modules",
  description: "Alle NT2 lessen, modules en leerpaden per vakgebied en ERK niveau.",
};

export default function LessonsPage() {
  return <LessonsClient />;
}
