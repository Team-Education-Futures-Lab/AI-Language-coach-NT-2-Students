"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Tag, X } from "lucide-react";
import type { LanguageLevel } from "@/types";
import { profileUpdateSchema, type ProfileUpdateInput } from "@/lib/validations/profile";
import { updateProfileAction } from "@/app/(dashboard)/profile/actions";

type FormValues = ProfileUpdateInput;

type Props = {
  initial: {
    languageLevel: LanguageLevel;
    nativeLanguage: string | null;
    interests: string[];
    learningGoals: string[];
    weakAreas: string[];
    strongAreas: string[];
  };
};

export function ProfileEditor({ initial }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(profileUpdateSchema as any),
    defaultValues: {
      languageLevel: initial.languageLevel ?? "A1",
      nativeLanguage: initial.nativeLanguage ?? "",
      interests: initial.interests ?? [],
      learningGoals: initial.learningGoals ?? [],
      weakAreas: initial.weakAreas ?? [],
      strongAreas: initial.strongAreas ?? [],
    },
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const res = await updateProfileAction(values);
      if (!res.ok) {
        toast.error(res.error ?? "Opslaan mislukt.");
        return;
      }
      toast.success("Profiel opgeslagen. Jouw voorkeuren worden meegenomen in je oefeningen.");
      router.refresh();
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="languageLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Taalniveau (ERK)</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Kies een niveau" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="A1">A1 — Beginner</SelectItem>
                    <SelectItem value="A2">A2 — Elementair</SelectItem>
                    <SelectItem value="B1">B1 — Onafhankelijk</SelectItem>
                    <SelectItem value="B2">B2 — Vloeiend</SelectItem>
                    <SelectItem value="C1">C1 — Gevorderd</SelectItem>
                    <SelectItem value="C2">C2 — Vaardig</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Het huidige niveau van je Nederlands. Ongeveer weten is
                  genoeg — het wordt na verloop van tijd automatisch bijgesteld.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nativeLanguage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moedertaal</FormLabel>
                <FormControl>
                  <Input
                    disabled={isPending}
                    placeholder="Bijv. Engels, Turks, Arabisch, Spaans..."
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription>
                  Optioneel — helpt de AI om vertalingen en uitleg beter af te
                  stemmen.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <TagListField
          control={form.control}
          name="learningGoals"
          label="Leerdoelen"
          description="Wat wil je bereiken? Bijv. sollicitatie, stage, examen, Nederlands op de werkvloer."
          placeholder="Bijv. Staatsexamen I halen"
        />
        <TagListField
          control={form.control}
          name="interests"
          label="Interesses"
          description="Onderwerpen die je leuk vindt; de AI kan hier meer voorbeelden bij zoeken."
          placeholder="Bijv. voetbal, koken, technologie"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TagListField
            control={form.control}
            name="weakAreas"
            label="Zwakke punten"
            description="Waar wil je extra op oefenen? Bijv. de/het, werkwoorden, uitspraak."
            placeholder="Bijv. inversie"
          />
          <TagListField
            control={form.control}
            name="strongAreas"
            label="Sterke punten"
            description="Waar ben je al goed in? Dan slaan we die sneller over."
            placeholder="Bijv. vocabulaire"
          />
        </div>

        <div className="flex flex-col items-stretch gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Je gegevens blijven privé en worden alleen gebruikt voor de
            personalisatie van je leerervaring.
          </p>
          <Button type="submit" disabled={isPending} className="sm:w-auto">
            {isPending ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Opslaan...
              </>
            ) : (
              <>
                <Save className="mr-1 h-4 w-4" />
                Profiel opslaan
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function TagListField({
  control,
  name,
  label,
  description,
  placeholder,
}: {
  control: any;
  name: "learningGoals" | "interests" | "weakAreas" | "strongAreas";
  label: string;
  description?: string;
  placeholder?: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-1">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            {label}
          </FormLabel>
          <TagEditor
            values={field.value ?? []}
            onChange={field.onChange}
            placeholder={placeholder}
            name={name}
          />
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function TagEditor({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  name: string;
}) {
  const [draft, setDraft] = useState("");

  function addTag(v?: string) {
    const value = (v ?? draft).trim();
    if (!value) return;
    if (values.includes(value)) {
      setDraft("");
      return;
    }
    if (value.includes(",")) {
      const parts = value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      onChange(Array.from(new Set([...values, ...parts])).slice(0, 30));
      setDraft("");
      return;
    }
    onChange([...values, value].slice(0, 30));
    setDraft("");
  }

  function removeTag(idx: number) {
    onChange(values.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-2">
      {values.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {values.map((v, i) => (
            <Badge key={`${v}-${i}`} variant="secondary" className="gap-1">
              {v}
              <button
                type="button"
                onClick={() => removeTag(i)}
                className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-foreground/10"
                aria-label={`${v} verwijderen`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <div className="flex items-stretch gap-2">
        <Input
          type="text"
          placeholder={placeholder ?? "Druk op Enter of gebruik komma's tussen tags"}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag();
            } else if (
              e.key === "Backspace" &&
              draft === "" &&
              values.length > 0
            ) {
              removeTag(values.length - 1);
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => addTag()}
          className="whitespace-nowrap"
        >
          Toevoegen
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Komma = meerdere tags tegelijk.
      </p>
    </div>
  );
}
