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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  BookOpen,
  Eye,
  Loader2,
  Save,
  Tag,
  X,
} from "lucide-react";
import Link from "next/link";
import type { LanguageLevel, LessonCategory } from "@/types";
import {
  LANGUAGE_LEVEL_LABELS,
  LESSON_CATEGORY_LABELS,
  LESSON_CATEGORY_DESCRIPTIONS,
} from "@/types";
import {
  lessonCreateSchema,
  type LessonCreateInput,
} from "@/lib/validations/lesson";
import {
  createLessonAction,
  updateLessonAction,
} from "@/app/(dashboard)/lessons/actions";
import { useTranslatedPayload } from "@/lib/i18n/useTranslatedPayload";

type Props = {
  modules?: { id: string; title: string }[];
  initialModuleId?: string;
} & (
  {
      mode: "create";
    }
  | {
      mode: "edit";
      lessonId: string;
      initial: {
        title: string;
        description: string | null;
        topic: string | null;
        category: LessonCategory;
        languageLevel: LanguageLevel;
        goals: string[];
        order: number;
        published: boolean;
        coverImage: string | null;
        moduleId?: string | null;
      };
    });

type FormValues = LessonCreateInput;

export function LessonEditor(props: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draftGoal, setDraftGoal] = useState("");

  const defaultValues: FormValues =
    props.mode === "edit"
      ? {
          moduleId: props.initial.moduleId ?? null,
          title: props.initial.title,
          description: props.initial.description ?? "",
          topic: props.initial.topic ?? "",
          category: props.initial.category,
          languageLevel: props.initial.languageLevel,
          goals: props.initial.goals ?? [],
          order: props.initial.order ?? 0,
          published: props.initial.published ?? false,
          coverImage: props.initial.coverImage ?? "",
        }
      : {
          moduleId: props.initialModuleId ?? null,
          title: "",
          description: "",
          topic: "",
          category: "OTHER",
          languageLevel: "A1",
          goals: [],
          order: 0,
          published: false,
          coverImage: "",
        };

  const schema = props.mode === "create" ? lessonCreateSchema : (lessonCreateSchema as any);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const category = form.watch("category");
  const goals = form.watch("goals") ?? [];
  const translated = useTranslatedPayload(
    {
      back: "Terug",
      createTitle: "Nieuwe les opzetten",
      editTitle: "Les bewerken",
      createSubtitle:
        "Vul de basisgegevens in en voeg daarna oefeningen toe.",
      published: "Gepubliceerd",
      draft: "Concept",
      lessonTitle: "Titel van de les",
      lessonTitlePlaceholder:
        "Bijv. Werkwoorden in de tegenwoordige tijd",
      lessonTitleDesc: "Een korte, duidelijke titel voor studenten.",
      category: "Categorie",
      chooseCategory: "Kies een categorie",
      level: "Taalniveau (ERK)",
      chooseLevel: "Kies een niveau",
      levelDesc: "Voor welk ERK-niveau is deze les bedoeld?",
      theme: "Thema",
      themePlaceholder: "Bijv. Familie, winkel, werk, vervoer...",
      themeDesc: "Optioneel — gebruikt de AI om oefeningen op af te stemmen.",
      order: "Volgorde",
      orderDesc: "Lager = verschijnt eerder in het overzicht.",
      cover: "Coverafbeelding (URL)",
      coverDesc: "Optioneel — een directe link naar een afbeelding.",
      description: "Beschrijving",
      descriptionPlaceholder:
        "Waar gaat deze les over? Wat kunnen studenten verwachten?",
      descriptionDesc:
        "Maximaal 4000 tekens. Wordt op de lespagina en in het overzicht getoond.",
      goals: "Leerdoelen",
      goalsDesc:
        "Wat moet de student na deze les kunnen? Maximaal 15 doelen. Komma = meerdere tegelijk.",
      goalPlaceholder: "Bijv. Ik kan de/het onderscheiden",
      addGoal: "Doel toevoegen",
      busy: "Bezig...",
      saveDraft: "Opslaan als concept",
      saveUnpublish: "Opslaan (depubliceren)",
      publish: "Publiceren",
      publishSave: "Publiceren (wijzigingen opslaan)",
    },
    { source: "auto" },
  );

  function onSubmitCommon(
    values: FormValues,
    opts: { publish: boolean },
  ) {
    const payload: any = {
      ...values,
      published: opts.publish,
    };

    startTransition(async () => {
      let res: any;
      if (props.mode === "create") {
        res = await createLessonAction(payload);
        if (!res.ok) {
          toast.error(res.error ?? "Les aanmaken mislukt.");
          if (res.fieldErrors) {
            Object.entries(res.fieldErrors).forEach(([k, v]: any) => {
              form.setError(k as any, { message: v?.[0] ?? "Ongeldig" });
            });
          }
          return;
        }
        toast.success(res.message ?? "Les aangemaakt!");
        router.push(`/lessons/${res.data.id}/edit`);
        router.refresh();
      } else {
        res = await updateLessonAction(props.lessonId, payload);
        if (!res.ok) {
          toast.error(res.error ?? "Opslaan mislukt.");
          if (res.fieldErrors) {
            Object.entries(res.fieldErrors).forEach(([k, v]: any) => {
              form.setError(k as any, { message: v?.[0] ?? "Ongeldig" });
            });
          }
          return;
        }
        toast.success(opts.publish ? "Les gepubliceerd!" : res.message ?? "Les opgeslagen.");
        router.refresh();
      }
    });
  }

  function addGoal(v?: string) {
    const value = (v ?? draftGoal).trim();
    if (!value) return;
    if (goals.includes(value)) {
      setDraftGoal("");
      return;
    }
    if (value.includes(",")) {
      const parts = value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      form.setValue(
        "goals",
        Array.from(new Set([...goals, ...parts])).slice(0, 15),
      );
      setDraftGoal("");
      return;
    }
    form.setValue("goals", [...goals, value].slice(0, 15));
    setDraftGoal("");
  }

  function removeGoal(idx: number) {
    form.setValue(
      "goals",
      goals.filter((_, i) => i !== idx),
    );
  }

  const isPublished = props.mode === "edit" ? props.initial.published : false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="-ml-2 text-white hover:bg-white/10">
            <Link href="/lesson-builder">
              <ArrowLeft className="h-4 w-4" /> {translated.back}
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl flex items-center gap-2 text-white">
              <BookOpen className="h-6 w-6 text-fuchsia-400" />
              {props.mode === "create" ? translated.createTitle : translated.editTitle}
            </h1>
            <p className="mt-1 text-sm text-white/70">
              {props.mode === "create"
                ? translated.createSubtitle
                : `Les: ${props.initial.title}`}
              {isPublished && (
                <Badge className="ml-2 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30 border-emerald-500/30">{translated.published}</Badge>
              )}
              {!isPublished && props.mode === "edit" && (
                <Badge className="ml-2 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30 border-amber-500/30">{translated.draft}</Badge>
              )}
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="space-y-8"
          noValidate
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField control={form.control} name="moduleId" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="text-white">Module</FormLabel>
                <FormControl>
                  <select className="min-h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-white backdrop-blur-md focus:ring-2 focus:ring-indigo-500/50" value={field.value ?? ""} disabled={isPending} onChange={(event) => field.onChange(event.target.value || null)}>
                    <option value="">Losse les (geen module)</option>
                    {props.modules?.map((module) => <option key={module.id} value={module.id}>{module.title}</option>)}
                  </select>
                </FormControl>
                <FormDescription className="text-white/50">Bundel deze les met andere lessen in een leerroute.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">{translated.lessonTitle}</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isPending}
                        placeholder={translated.lessonTitlePlaceholder}
                        {...field}
                        value={field.value ?? ""}
                        className="bg-black/40 border-white/10 text-white"
                      />
                    </FormControl>
                    <FormDescription className="text-white/50">
                      {translated.lessonTitleDesc}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">{translated.category}</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-black/40 border-white/10 text-white">
                        <SelectValue placeholder={translated.chooseCategory} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-black/90 border-white/10 text-white backdrop-blur-xl">
                      {Object.entries(LESSON_CATEGORY_LABELS).map(([k, label]) => (
                        <SelectItem key={k} value={k}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-white/50">
                    {LESSON_CATEGORY_DESCRIPTIONS[category as LessonCategory]}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="languageLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">{translated.level}</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-black/40 border-white/10 text-white">
                        <SelectValue placeholder={translated.chooseLevel} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-black/90 border-white/10 text-white backdrop-blur-xl">
                      {Object.entries(LANGUAGE_LEVEL_LABELS).map(([k, label]) => (
                        <SelectItem key={k} value={k}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-white/50">
                    {translated.levelDesc}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel className="text-white">{translated.theme}</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                        placeholder={translated.themePlaceholder}
                      {...field}
                      value={field.value ?? ""}
                      className="bg-black/40 border-white/10 text-white"
                    />
                  </FormControl>
                  <FormDescription className="text-white/50">
                    {translated.themeDesc}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel className="text-white">{translated.order}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      disabled={isPending}
                      {...field}
                      value={field.value ?? 0}
                      className="bg-black/40 border-white/10 text-white"
                    />
                  </FormControl>
                  <FormDescription className="text-white/50">
                    {translated.orderDesc}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coverImage"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-white">{translated.cover}</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      placeholder="https://..."
                      {...field}
                      value={field.value ?? ""}
                      className="bg-black/40 border-white/10 text-white"
                    />
                  </FormControl>
                  <FormDescription className="text-white/50">
                    {translated.coverDesc}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-white">{translated.description}</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      disabled={isPending}
                      placeholder={translated.descriptionPlaceholder}
                      {...field}
                      value={field.value ?? ""}
                      className="bg-black/40 border-white/10 text-white"
                    />
                  </FormControl>
                  <FormDescription className="text-white/50">
                    {translated.descriptionDesc}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-3">
            <FormLabel className="flex items-center gap-1 text-white">
              <Tag className="h-3.5 w-3.5 text-white/50" />
              {translated.goals}
            </FormLabel>
            <FormDescription className="text-white/50">
              {translated.goalsDesc}
            </FormDescription>
            <div className="space-y-2">
              {goals.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {goals.map((v, i) => (
                    <Badge key={`${v}-${i}`} className="gap-1 bg-white/10 text-white hover:bg-white/20 border-white/20">
                      {v}
                      <button
                        type="button"
                        onClick={() => removeGoal(i)}
                        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-white/20"
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
                  placeholder={translated.goalPlaceholder}
                  value={draftGoal}
                  onChange={(e) => setDraftGoal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addGoal();
                    } else if (
                      e.key === "Backspace" &&
                      draftGoal === "" &&
                      goals.length > 0
                    ) {
                      removeGoal(goals.length - 1);
                    }
                  }}
                  className="bg-black/40 border-white/10 text-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addGoal()}
                  className="whitespace-nowrap border-white/20 text-white hover:bg-white/10"
                >
                  {translated.addGoal}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onSubmitCommon(form.getValues(), { publish: false })
              }
              disabled={isPending}
              className="sm:w-auto border-white/20 text-white hover:bg-white/10"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  {translated.busy}
                </>
              ) : (
                <>
                  <Save className="mr-1 h-4 w-4" />
                  {props.mode === "create"
                    ? translated.saveDraft
                    : isPublished
                      ? translated.saveUnpublish
                      : translated.saveDraft}
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={() =>
                onSubmitCommon(form.getValues(), { publish: true })
              }
              disabled={isPending}
              className="sm:w-auto bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white hover:brightness-110 shadow-lg"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  {translated.busy}
                </>
              ) : (
                <>
                  <Eye className="mr-1 h-4 w-4" />
                  {props.mode === "create" || !isPublished
                    ? translated.publish
                    : translated.publishSave}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
