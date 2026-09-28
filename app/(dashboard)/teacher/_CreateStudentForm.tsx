"use client";

import { useState, useTransition } from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createStudentAction } from "./actions";

export function CreateStudentForm() {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [languageLevel, setLanguageLevel] = useState("A1");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await createStudentAction({
        name,
        email,
        password,
        languageLevel,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      setName("");
      setEmail("");
      setPassword("");
      setLanguageLevel("A1");
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="student-name">Naam student</Label>
        <Input
          id="student-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Bijv. Fatima El Amrani"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="student-email">E-mailadres</Label>
        <Input
          id="student-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="fatima@school.nl"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="student-password">Tijdelijk wachtwoord</Label>
        <Input
          id="student-password"
          type="password"
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Minimaal 8 tekens"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="student-level">Startniveau</Label>
        <select
          id="student-level"
          value={languageLevel}
          onChange={(event) => setLanguageLevel(event.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {["A1", "A2", "B1", "B2", "C1", "C2"].map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>
      <Button type="submit" disabled={isPending} className="sm:col-span-2 w-full">
        <UserPlus className="h-4 w-4" />
        {isPending ? "Account aanmaken..." : "Student toevoegen"}
      </Button>
    </form>
  );
}
