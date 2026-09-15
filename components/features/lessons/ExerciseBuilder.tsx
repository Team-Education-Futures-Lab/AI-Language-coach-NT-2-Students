"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowDown,
  ArrowUp,
  Bot,
  Check,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import type { ExerciseType } from "@/types";
import { EXERCISE_TYPE_LABELS } from "@/types";
import {
  exerciseEditorSchema,
  aiGenerateExercisesSchema,
  type ExerciseEditorInput,
} from "@/lib/validations/lesson";
import {
  createExerciseAction,
  updateExerciseAction,
  deleteExerciseAction,
  reorderExercisesAction,
  aiGenerateExercisesAction,
} from "@/app/(dashboard)/lessons/actions";
import { useTranslatedPayload } from "@/lib/i18n/useTranslatedPayload";

type PersistedExercise = {
  id: string;
  type: ExerciseType;
  title: string;
  description: string | null;
  difficulty: number;
  xpReward: number;
  order: number;
  hint: string | null;
  content: Record<string, unknown>;
};

type Props = {
  lessonId: string;
  initialExercises: PersistedExercise[];
};

export function ExerciseBuilder({ lessonId, initialExercises }: Props) {
  const router = useRouter();
  const [exercises, setExercises] = useState<PersistedExercise[]>(
    [...initialExercises].sort((a, b) => a.order - b.order),
  );
  const [isPending, startTransition] = useTransition();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: string } | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiPending, setAiPending] = useState(false);
  const [reorderPending, setReorderPending] = useState(false);
  const translated = useTranslatedPayload(
    {
      title: "Oefeningen",
      emptyDesc:
        "Nog geen oefeningen. Voeg er handmatig één toe of laat de AI ze genereren.",
      filledDesc:
        `${initialExercises.length} oefening(en) — sleep of gebruik de pijlen om de volgorde te wijzigen.`,
      savingOrder: "Volgorde opslaan...",
      aiGenerate: "AI genereer oefeningen",
      aiGenerateTitle: "AI oefeningen genereren",
      aiGenerateDesc:
        "Op basis van categorie, niveau en thema maakt de AI in één keer meerdere oefeningen voor je. Werkt ook zonder OpenAI key (offline templates).",
      newExercise: "Nieuwe oefening",
      editExercise: "Oefening bewerken",
      newExerciseTitle: "Nieuwe oefening",
      sheetDesc: "Stel het type, de vraag en de moeilijkheid in.",
      deleteFailed: "Verwijderen mislukt.",
      deleted: "Oefening verwijderd.",
      reorderFailed: "Volgorde niet opgeslagen.",
      aiFailed: "AI-generatie mislukt.",
      added: "Oefeningen toegevoegd!",
      saveFailed: "Opslaan mislukt.",
      saved: "Oefening opgeslagen.",
      emptyTitle: "Geen oefeningen gevonden",
      emptyCardDesc:
        "Start met de AI-generator om snel een setje op te zetten, of voeg handmatig je eerste oefening toe.",
      generateFive: "Genereer 5 oefeningen",
      addManually: "Handmatig toevoegen",
      editAria: "Bewerken",
      deleteAria: "Verwijderen",
      moveUp: "Naar boven",
      moveDown: "Naar beneden",
      difficultyLabel: "Moeilijkheid",
      noDescription: "Geen beschrijving.",
    },
    { source: "auto" },
  );

  const sortedExercises = useMemo(
    () => [...exercises].sort((a, b) => a.order - b.order),
    [exercises],
  );

  useEffect(() => {
    setExercises([...initialExercises].sort((a, b) => a.order - b.order));
  }, [initialExercises]);

  function openCreate() {
    setEditing(null);
    setSheetOpen(true);
  }

  function openEdit(exc: PersistedExercise) {
    setEditing({ id: exc.id });
    setSheetOpen(true);
  }

  function handleDelete(exc: PersistedExercise) {
    if (!confirm(`Oefening "${exc.title}" definitief verwijderen?`)) return;
    startTransition(async () => {
      const res = await deleteExerciseAction(lessonId, exc.id);
      if (!res.ok) {
        toast.error(res.error ?? translated.deleteFailed);
        return;
      }
      setExercises((prev) => prev.filter((e) => e.id !== exc.id));
      toast.success(res.message ?? translated.deleted);
      router.refresh();
    });
  }

  function move(idx: number, dir: -1 | 1) {
    const list = [...sortedExercises];
    const target = idx + dir;
    if (target < 0 || target >= list.length) return;
    [list[idx], list[target]] = [list[target], list[idx]];
    const ordered = list.map((e, i) => ({ ...e, order: i }));
    setExercises(ordered);
    persistReorder(ordered.map((e) => e.id));
  }

  function persistReorder(ids: string[]) {
    setReorderPending(true);
    startTransition(async () => {
      const res = await reorderExercisesAction(lessonId, ids);
      setReorderPending(false);
      if (!res.ok) {
        toast.error(res.error ?? translated.reorderFailed);
        return;
      }
      router.refresh();
    });
  }

  const defaultEditorValues = (
    base?: PersistedExercise,
  ): ExerciseEditorInput => ({
    id: base?.id,
    type: base?.type ?? "MULTIPLE_CHOICE",
    title: base?.title ?? "",
    description: base?.description ?? "",
    difficulty: base?.difficulty ?? 1,
    xpReward: base?.xpReward ?? 10,
    order: base?.order ?? exercises.length,
    hint: base?.hint ?? "",
    content:
      base && base.content && typeof base.content === "object"
        ? (base.content as any)
        : getDefaultContentForType(base?.type ?? "MULTIPLE_CHOICE"),
  });

  const editingExercise = editing
    ? sortedExercises.find((e) => e.id === editing.id)
    : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            🧩 {translated.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {sortedExercises.length === 0
              ? translated.emptyDesc
              : translated.filledDesc.replace(
                  `${initialExercises.length}`,
                  `${sortedExercises.length}`,
                )}
            {reorderPending && (
              <Badge variant="sand" className="ml-2">
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                {translated.savingOrder}
              </Badge>
            )}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Sheet open={aiModalOpen} onOpenChange={setAiModalOpen}>
            <SheetTrigger asChild>
              <Button variant="sand" onClick={() => setAiModalOpen(true)}>
                <Sparkles className="h-4 w-4" />
                🤖 {translated.aiGenerate}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="sm:max-w-xl sm:mx-auto sm:my-8 sm:rounded-2xl">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-cozy-teal" />
                  {translated.aiGenerateTitle}
                </SheetTitle>
                <SheetDescription>
                  {translated.aiGenerateDesc}
                </SheetDescription>
              </SheetHeader>
              <AIGenerateForm
                lessonId={lessonId}
                disabled={aiPending}
                onClose={() => setAiModalOpen(false)}
                onSubmit={async (values) => {
                  setAiPending(true);
                  try {
                    const res = await aiGenerateExercisesAction({
                      lessonId: values.lessonId,
                      count: values.count,
                      topicOverride: values.topicOverride,
                      typeHint: values.typeHint,
                    });
                    if (!res.ok) {
                      toast.error(res.error ?? translated.aiFailed);
                      return;
                    }
                    toast.success(res.message ?? translated.added);
                    setAiModalOpen(false);
                    router.refresh();
                  } finally {
                    setAiPending(false);
                  }
                }}
              />
            </SheetContent>
          </Sheet>

          <Button variant="sunset" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            {translated.newExercise}
          </Button>
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingExercise ? translated.editExercise : translated.newExerciseTitle}
            </SheetTitle>
            <SheetDescription>
              {translated.sheetDesc}
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <ExerciseEditorSheet
              lessonId={lessonId}
              initial={editingExercise ? defaultEditorValues(editingExercise) : undefined}
              existingCount={exercises.length}
              disabled={isPending}
              onClose={() => setSheetOpen(false)}
              onSubmit={(values) => {
                startTransition(async () => {
                  let res: any;
                  if (editingExercise) {
                    res = await updateExerciseAction(
                      lessonId,
                      editingExercise.id,
                      values as any,
                    );
                  } else {
                    res = await createExerciseAction(lessonId, values as any);
                  }
                  if (!res.ok) {
                    toast.error(res.error ?? translated.saveFailed);
                    return;
                  }
                  toast.success(res.message ?? translated.saved);
                  setSheetOpen(false);
                  router.refresh();
                });
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      {sortedExercises.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">
              {translated.emptyTitle}
            </CardTitle>
            <CardDescription>
              {translated.emptyCardDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button size="sm" variant="sand" onClick={() => setAiModalOpen(true)}>
              <Sparkles className="mr-1 h-4 w-4" />
              🤖 {translated.generateFive}
            </Button>
            <Button size="sm" variant="sunset" onClick={openCreate}>
              <Plus className="mr-1 h-4 w-4" />
              {translated.addManually}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedExercises.map((e, idx) => (
            <Card key={e.id} className="group">
              <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-3">
                <div className="mt-1 flex flex-col items-center gap-0.5 text-muted-foreground">
                  <span className="inline-flex items-center gap-1 text-xs font-medium opacity-70">
                    <GripVertical className="h-4 w-4" /> #{idx + 1}
                  </span>
                  <div className="flex flex-col">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      aria-label={translated.moveUp}
                      disabled={idx === 0}
                      onClick={() => move(idx, -1)}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      aria-label={translated.moveDown}
                      disabled={idx === sortedExercises.length - 1}
                      onClick={() => move(idx, 1)}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base">{e.title}</CardTitle>
                    <Badge variant="sand">{EXERCISE_TYPE_LABELS[e.type] ?? e.type}</Badge>
                    <Badge variant="success">+{e.xpReward} XP</Badge>
                    <Badge variant="outline">
                      {translated.difficultyLabel} {e.difficulty}/5
                    </Badge>
                  </div>
                  <CardDescription className="mt-1 line-clamp-2">
                    {e.description || translated.noDescription}
                  </CardDescription>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openEdit(e)}
                    aria-label={translated.editAria}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-cozy-terracotta hover:text-cozy-terracotta hover:bg-cozy-terracotta/10"
                    onClick={() => handleDelete(e)}
                    aria-label={translated.deleteAria}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function getDefaultContentForType(type: ExerciseType): Record<string, unknown> {
  switch (type) {
    case "MULTIPLE_CHOICE":
      return {
        question: "",
        options: ["", "", "", ""],
        correctIndex: 0,
      };
    case "FILL_IN_BLANK":
      return {
        sentence: "Vandaag ___ (gaan) ik naar school.",
        answers: ["ga"],
        caseSensitive: false,
      };
    case "TRANSLATION":
      return {
        sourceText: "",
        sourceLanguage: "nl",
        targetLanguage: "en",
        acceptedAnswers: [""],
      };
    case "VOCABULARY":
      return {
        word: "",
        definition: "",
        exampleSentence: "",
        synonyms: [],
      };
    case "SENTENCE_CORRECTION":
      return {
        wrongSentence: "Ik ga naar huis gisteren.",
        correctSentence: "Ik ging gisteren naar huis.",
        explanation: "",
      };
    case "CONVERSATION":
      return {
        scenario: "",
        userPrompt: "",
        hints: [],
      };
    default:
      return {};
  }
}

function ExerciseEditorSheet({
  lessonId: _lessonId,
  initial,
  existingCount,
  disabled,
  onClose,
  onSubmit,
}: {
  lessonId: string;
  initial?: ExerciseEditorInput;
  existingCount: number;
  disabled: boolean;
  onClose: () => void;
  onSubmit: (values: ExerciseEditorInput) => void;
}) {
  const form = useForm<ExerciseEditorInput>({
    resolver: zodResolver(exerciseEditorSchema as any),
    defaultValues:
      initial ?? ({
        type: "MULTIPLE_CHOICE",
        title: "",
        description: "",
        difficulty: 1,
        xpReward: 10,
        order: existingCount,
        hint: "",
        content: getDefaultContentForType("MULTIPLE_CHOICE"),
      } as ExerciseEditorInput),
  });

  const currentType = form.watch("type") as ExerciseType;

  useEffect(() => {
    form.setValue("content", getDefaultContentForType(currentType));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentType]);

  const content = form.watch("content") ?? {};

  function setContent<K extends string>(key: K, value: unknown) {
    form.setValue("content", { ...(content as any), [key]: value } as any);
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
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type oefening</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={disabled}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(EXERCISE_TYPE_LABELS).map(([k, label]) => (
                      <SelectItem key={k} value={k}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titel</FormLabel>
                <FormControl>
                  <Input
                    disabled={disabled}
                    placeholder="Bijv. De/het kies je zo"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moeilijkheid (1–5)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    disabled={disabled}
                    {...field}
                    value={field.value ?? 1}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="xpReward"
            render={({ field }) => (
              <FormItem>
                <FormLabel>XP-beloning</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={500}
                    disabled={disabled}
                    {...field}
                    value={field.value ?? 10}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Korte omschrijving</FormLabel>
              <FormControl>
                <Textarea
                  rows={2}
                  disabled={disabled}
                  placeholder="Wat moet de student doen in deze oefening?"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <div className="space-y-3">
          <h3 className="text-sm font-semibold tracking-tight">
            Inhoud ({EXERCISE_TYPE_LABELS[currentType] ?? currentType})
          </h3>
          <TypeSpecificContentEditor
            type={currentType}
            content={content as any}
            setContent={setContent}
            disabled={disabled}
          />
        </div>

        <FormField
          control={form.control}
          name="hint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hint (optioneel)</FormLabel>
              <FormControl>
                <Input
                  disabled={disabled}
                  placeholder="Bijv. Denk aan de tijd: onvoltooid verleden"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                Zichtbaar voor student als ze vastlopen.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <SheetFooter className="sm:justify-end">
          <SheetClose asChild>
            <Button type="button" variant="ghost" onClick={onClose} disabled={disabled}>
              Annuleren
            </Button>
          </SheetClose>
          <Button type="submit" variant="sunset" disabled={disabled}>
            {disabled ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Bezig...
              </>
            ) : initial?.id ? (
              <>
                <Check className="mr-1 h-4 w-4" />
                Wijzigingen opslaan
              </>
            ) : (
              <>
                <Plus className="mr-1 h-4 w-4" />
                Toevoegen
              </>
            )}
          </Button>
        </SheetFooter>
      </form>
    </Form>
  );
}

function TypeSpecificContentEditor({
  type,
  content,
  setContent,
  disabled,
}: {
  type: ExerciseType;
  content: Record<string, any>;
  setContent: <K extends string>(k: K, v: unknown) => void;
  disabled: boolean;
}) {
  switch (type) {
    case "MULTIPLE_CHOICE": {
      const options: string[] = Array.isArray(content.options) ? content.options : ["", "", "", ""];
      const correct = Number(content.correctIndex) || 0;
      return (
        <div className="space-y-3">
          <div>
            <Label>Vraag / stelling</Label>
            <Textarea
              rows={2}
              disabled={disabled}
              value={content.question ?? ""}
              onChange={(e) => setContent("question", e.target.value)}
              placeholder="Welke zin is correct?"
            />
          </div>
          <div className="space-y-2">
            <Label>Opties (vink het juiste antwoord aan)</Label>
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant={i === correct ? "sunset" : "ghost"}
                  disabled={disabled}
                  onClick={() => setContent("correctIndex", i)}
                  aria-label={`Optie ${i + 1} als juist aanmerken`}
                >
                  {i === correct ? <Check className="h-3.5 w-3.5" /> : <span className="text-xs">{i + 1}</span>}
                </Button>
                <Input
                  disabled={disabled}
                  placeholder={`Optie ${i + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const copy = [...options];
                    copy[i] = e.target.value;
                    setContent("options", copy);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={disabled || options.length <= 2}
                  onClick={() => {
                    const copy = options.filter((_, idx) => idx !== i);
                    setContent("options", copy);
                    if (correct >= copy.length) {
                      setContent("correctIndex", copy.length - 1);
                    }
                  }}
                  aria-label="Optie verwijderen"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled || options.length >= 8}
              onClick={() => setContent("options", [...options, ""])}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Optie toevoegen
            </Button>
          </div>
        </div>
      );
    }
    case "FILL_IN_BLANK": {
      const answers: string[] = Array.isArray(content.answers) ? content.answers : [""];
      return (
        <div className="space-y-3">
          <div>
            <Label>Zin met ___</Label>
            <Textarea
              rows={2}
              disabled={disabled}
              value={content.sentence ?? ""}
              onChange={(e) => setContent("sentence", e.target.value)}
              placeholder="Gebruik ___ voor het invoervak. Bijv: Ik ___ graag een broodje."
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Gebruik <code>___</code> (drie underscores) om het invulvak te markeren.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Geaccepteerde antwoord(en)</Label>
            {answers.map((a, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  disabled={disabled}
                  placeholder="Bijv. wil"
                  value={a}
                  onChange={(e) => {
                    const copy = [...answers];
                    copy[i] = e.target.value;
                    setContent("answers", copy);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={disabled || answers.length <= 1}
                  onClick={() =>
                    setContent(
                      "answers",
                      answers.filter((_, idx) => idx !== i),
                    )
                  }
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled}
              onClick={() => setContent("answers", [...answers, ""])}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Extra correct antwoord
            </Button>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={Boolean(content.caseSensitive)}
                onChange={(e) => setContent("caseSensitive", e.target.checked)}
                disabled={disabled}
              />
              Hoofdlettergevoelig
            </label>
          </div>
        </div>
      );
    }
    case "TRANSLATION": {
      const accepted: string[] = Array.isArray(content.acceptedAnswers)
        ? content.acceptedAnswers
        : [""];
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Brontaal</Label>
              <Input
                disabled={disabled}
                value={content.sourceLanguage ?? "nl"}
                onChange={(e) => setContent("sourceLanguage", e.target.value)}
              />
            </div>
            <div>
              <Label>Doeltaal</Label>
              <Input
                disabled={disabled}
                value={content.targetLanguage ?? "en"}
                onChange={(e) => setContent("targetLanguage", e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>Brontekst</Label>
            <Textarea
              rows={2}
              disabled={disabled}
              value={content.sourceText ?? ""}
              onChange={(e) => setContent("sourceText", e.target.value)}
              placeholder="Ik wil graag een koffie."
            />
          </div>
          <div className="space-y-2">
            <Label>Geaccepteerde vertalingen</Label>
            {accepted.map((a, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  disabled={disabled}
                  placeholder="I would like a coffee."
                  value={a}
                  onChange={(e) => {
                    const copy = [...accepted];
                    copy[i] = e.target.value;
                    setContent("acceptedAnswers", copy);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={disabled || accepted.length <= 1}
                  onClick={() =>
                    setContent(
                      "acceptedAnswers",
                      accepted.filter((_, idx) => idx !== i),
                    )
                  }
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled}
              onClick={() => setContent("acceptedAnswers", [...accepted, ""])}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Extra vertaling toestaan
            </Button>
          </div>
        </div>
      );
    }
    case "VOCABULARY": {
      const syns: string[] = Array.isArray(content.synonyms) ? content.synonyms : [];
      return (
        <div className="space-y-3">
          <div>
            <Label>Woord</Label>
            <Input
              disabled={disabled}
              value={content.word ?? ""}
              onChange={(e) => setContent("word", e.target.value)}
              placeholder="de bakkerij"
            />
          </div>
          <div>
            <Label>Betekenis / definitie</Label>
            <Textarea
              rows={2}
              disabled={disabled}
              value={content.definition ?? ""}
              onChange={(e) => setContent("definition", e.target.value)}
              placeholder="Waar je brood en gebak koopt."
            />
          </div>
          <div>
            <Label>Voorbeeldzin</Label>
            <Textarea
              rows={2}
              disabled={disabled}
              value={content.exampleSentence ?? ""}
              onChange={(e) => setContent("exampleSentence", e.target.value)}
              placeholder="Ik ga elke zaterdag naar de bakkerij."
            />
          </div>
          <div className="space-y-2">
            <Label>Synoniemen (optioneel)</Label>
            {syns.length === 0 && (
              <p className="text-xs text-muted-foreground">Nog geen synoniemen toegevoegd.</p>
            )}
            {syns.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  disabled={disabled}
                  value={s}
                  onChange={(e) => {
                    const copy = [...syns];
                    copy[i] = e.target.value;
                    setContent("synonyms", copy);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={disabled}
                  onClick={() =>
                    setContent(
                      "synonyms",
                      syns.filter((_, idx) => idx !== i),
                    )
                  }
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled}
              onClick={() => setContent("synonyms", [...syns, ""])}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Synoniem toevoegen
            </Button>
          </div>
        </div>
      );
    }
    case "SENTENCE_CORRECTION":
      return (
        <div className="space-y-3">
          <div>
            <Label>Foutieve zin</Label>
            <Textarea
              rows={2}
              disabled={disabled}
              value={content.wrongSentence ?? ""}
              onChange={(e) => setContent("wrongSentence", e.target.value)}
              placeholder="Ik eet gisteren een appel."
            />
          </div>
          <div>
            <Label>Verbeterde zin</Label>
            <Textarea
              rows={2}
              disabled={disabled}
              value={content.correctSentence ?? ""}
              onChange={(e) => setContent("correctSentence", e.target.value)}
              placeholder="Ik heb gisteren een appel gegeten."
            />
          </div>
          <div>
            <Label>Uitleg (optioneel)</Label>
            <Textarea
              rows={3}
              disabled={disabled}
              value={content.explanation ?? ""}
              onChange={(e) => setContent("explanation", e.target.value)}
              placeholder="Gisteren is verleden tijd, dus gebruik het voltooid deelwoord: hebben + gegeten."
            />
          </div>
        </div>
      );
    case "CONVERSATION": {
      const hints: string[] = Array.isArray(content.hints) ? content.hints : [];
      return (
        <div className="space-y-3">
          <div>
            <Label>Scenario</Label>
            <Textarea
              rows={2}
              disabled={disabled}
              value={content.scenario ?? ""}
              onChange={(e) => setContent("scenario", e.target.value)}
              placeholder="Je staat bij de bakker en wilt een brood en twee croissants bestellen."
            />
          </div>
          <div>
            <Label>Prompt / opdracht voor de student</Label>
            <Textarea
              rows={2}
              disabled={disabled}
              value={content.userPrompt ?? ""}
              onChange={(e) => setContent("userPrompt", e.target.value)}
              placeholder="Schrijf je gesprek met de bakker. Begin met een begroeting."
            />
          </div>
          <div className="space-y-2">
            <Label>Hints / steekwoorden</Label>
            {hints.length === 0 && (
              <p className="text-xs text-muted-foreground">Nog geen hints toegevoegd.</p>
            )}
            {hints.map((h, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  disabled={disabled}
                  value={h}
                  onChange={(e) => {
                    const copy = [...hints];
                    copy[i] = e.target.value;
                    setContent("hints", copy);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={disabled}
                  onClick={() =>
                    setContent(
                      "hints",
                      hints.filter((_, idx) => idx !== i),
                    )
                  }
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled}
              onClick={() => setContent("hints", [...hints, ""])}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Hint toevoegen
            </Button>
          </div>
        </div>
      );
    }
    default:
      return (
        <div className="text-sm text-muted-foreground">
          Geen specifieke velden voor dit type — je kunt vrij veld hieronder invoeren.
          <RawJsonEditor content={content} setContent={setContent} disabled={disabled} />
        </div>
      );
  }
}

function RawJsonEditor({
  content,
  setContent,
  disabled,
}: {
  content: Record<string, any>;
  setContent: <K extends string>(k: K, v: unknown) => void;
  disabled: boolean;
}) {
  const [str, setStr] = useState(() => JSON.stringify(content, null, 2));
  const [err, setErr] = useState<string | null>(null);
  function apply() {
    try {
      const parsed = JSON.parse(str);
      setErr(null);
      Object.keys(content).forEach((k) => {
        if (!(k in parsed)) delete (content as any)[k];
      });
      Object.entries(parsed).forEach(([k, v]) => setContent(k as any, v));
    } catch (e: any) {
      setErr(e?.message ?? "Ongeldige JSON");
    }
  }
  return (
    <div className="space-y-2 mt-3">
      <Textarea
        rows={8}
        className="font-mono text-xs"
        disabled={disabled}
        value={str}
        onChange={(e) => setStr(e.target.value)}
        placeholder='{"question": "", "options": []}'
      />
      {err && <p className="text-xs text-cozy-terracotta">{err}</p>}
      <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={apply}>
        JSON toepassen
      </Button>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`mb-1 block text-sm font-medium text-foreground ${className ?? ""}`}>
      {children}
    </p>
  );
}

function AIGenerateForm({
  lessonId,
  disabled,
  onSubmit,
  onClose: _onClose,
}: {
  lessonId: string;
  disabled: boolean;
  onClose: () => void;
  onSubmit: (values: { lessonId: string; count: number; typeHint?: ExerciseType; topicOverride?: string }) => void;
}) {
  const form = useForm({
    resolver: zodResolver(aiGenerateExercisesSchema as any),
    defaultValues: {
      lessonId,
      count: 5,
      typeHint: undefined as ExerciseType | undefined,
      topicOverride: "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit as any)}
        noValidate
        className="space-y-4 py-4"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aantal oefeningen (1–15)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={15}
                    disabled={disabled}
                    {...field}
                    value={field.value ?? 5}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="typeHint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type voorkeur (optioneel)</FormLabel>
                <Select
                  value={field.value ?? ""}
                  onValueChange={(v) => field.onChange(v === "" ? undefined : v)}
                  disabled={disabled}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Gemengd" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Gemengd</SelectItem>
                    {Object.entries(EXERCISE_TYPE_LABELS).map(([k, label]) => (
                      <SelectItem key={k} value={k}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="topicOverride"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thema (optioneel, overschrijft les-thema)</FormLabel>
              <FormControl>
                <Input
                  disabled={disabled}
                  placeholder="Bijv. sollicitatiegesprek, boodschappen doen..."
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                Laat leeg om het thema en de categorie van de les te gebruiken.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <SheetFooter className="sm:justify-end pt-2">
          <SheetClose asChild>
            <Button type="button" variant="ghost" disabled={disabled}>
              Annuleren
            </Button>
          </SheetClose>
          <Button type="submit" variant="sunset" disabled={disabled}>
            {disabled ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                AI is aan het werk...
              </>
            ) : (
              <>
                <Sparkles className="mr-1 h-4 w-4" />
                Genereer oefeningen
              </>
            )}
          </Button>
        </SheetFooter>
      </form>
    </Form>
  );
}
