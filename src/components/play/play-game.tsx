"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import {
  BadgeCheck,
  Brain,
  Castle,
  CheckCircle2,
  Crosshair,
  Flame,
  Gauge,
  Layers3,
  RotateCcw,
  Send,
  Timer,
  Trophy,
  Zap
} from "lucide-react";
import { savePlaySessionResult } from "@/app/actions/sessions";
import { Button } from "@/components/ui/button";
import { MetricCard, Panel } from "@/components/ui/product";
import { cardFromCode, type PlayingCard } from "@/lib/cards";
import {
  buildPlaySessionResult,
  gradePaoAnswer,
  normalizeCardCode,
  prepareModeDeck,
  toTrainingSessionPayload,
  type PaoFlashcardGrade,
  type PaoPart,
  type PaoVariant,
  type PlayMode,
  type PlaySessionResult,
  type SpeedDifficulty,
  type SuitName
} from "@/lib/play-modes";
import { sampleUserPalaces, type StarterPao } from "@/lib/sample-palace";
import { formatPercent } from "@/lib/utils";

type Phase = "setup" | "memorize" | "recall" | "flashcards" | "score";
type Hint = "palace" | "pao" | null;
type SaveState = "idle" | "saving" | "saved" | "local";
export type PlayPaoDeckOption = {
  id: string;
  name: string;
  description: string;
  deck: StarterPao[];
  customCount?: number;
};

const emptyPaoDeck: StarterPao[] = [];
const cardCounts = [10, 20, 26, 32, 40, 52];
const suitCounts = [5, 10, 13];
const flashcardCounts = [8, 16, 24, 52];
const positionQuestionCounts = [5, 10, 15, 20];
const speedDifficulties: SpeedDifficulty[] = ["Relaxed", "Competitive", "Elite"];
const suits: Array<{ value: SuitName; label: string; tone: string }> = [
  { value: "HEARTS", label: "Hearts", tone: "text-red-600" },
  { value: "SPADES", label: "Spades", tone: "text-zinc-900 dark:text-zinc-100" },
  { value: "DIAMONDS", label: "Diamonds", tone: "text-red-600" },
  { value: "CLUBS", label: "Clubs", tone: "text-zinc-900 dark:text-zinc-100" }
];
const paoVariants: Array<{ value: PaoVariant; label: string; helper: string }> = [
  { value: "CARD_TO_PAO", label: "Card to PAO", helper: "See a card, recall person-action-object." },
  { value: "PAO_TO_CARD", label: "PAO to Card", helper: "See an image cue, name the card." },
  { value: "MISSING_PART", label: "Missing Part", helper: "Fill the missing person, action, or object." },
  { value: "RAPID_REVIEW", label: "Rapid Review", helper: "Fast association checks with hard marking." }
];

const modeCards: Array<{
  mode: PlayMode;
  title: string;
  short: string;
  icon: typeof Timer;
}> = [
  { mode: "FULL_DECK", title: "Classic", short: "Memorize as many cards as you can.", icon: Castle },
  { mode: "SPEED", title: "Speed", short: "Train faster while keeping answers correct.", icon: Gauge },
  { mode: "SUIT_FOCUS", title: "Suit Focus", short: "Practice one suit at a time.", icon: Crosshair },
  { mode: "PAO_FLASHCARD", title: "PAO Flashcards", short: "Practice your card images.", icon: Brain },
  { mode: "RANDOM_POSITION", title: "Random Position", short: "Guess cards from random spots.", icon: Layers3 }
];

export function PlayGame({ paoDeckOptions = [] }: { paoDeckOptions?: PlayPaoDeckOption[] }) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [mode, setMode] = useState<PlayMode>("FULL_DECK");
  const [count, setCount] = useState(10);
  const [suitCount, setSuitCount] = useState(10);
  const [selectedSuit, setSelectedSuit] = useState<SuitName>("HEARTS");
  const [difficulty, setDifficulty] = useState<SpeedDifficulty>("Relaxed");
  const [paoVariant, setPaoVariant] = useState<PaoVariant>("CARD_TO_PAO");
  const [selectedPaoDeckId, setSelectedPaoDeckId] = useState(paoDeckOptions[0]?.id ?? "");
  const [flashcardCount, setFlashcardCount] = useState(16);
  const [questionCount, setQuestionCount] = useState(10);
  const [palace, setPalace] = useState(sampleUserPalaces[0].name);
  const [sessionDeck, setSessionDeck] = useState<StarterPao[]>([]);
  const [questionPositions, setQuestionPositions] = useState<number[]>([]);
  const [index, setIndex] = useState(0);
  const [recall, setRecall] = useState<string[]>([]);
  const [flashcardAnswer, setFlashcardAnswer] = useState("");
  const [flashcardGrades, setFlashcardGrades] = useState<PaoFlashcardGrade[]>([]);
  const [studyStartedAt, setStudyStartedAt] = useState(0);
  const [recallStartedAt, setRecallStartedAt] = useState(0);
  const [responseStartedAt, setResponseStartedAt] = useState(0);
  const [memorizationMs, setMemorizationMs] = useState(0);
  const [recallMs, setRecallMs] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [activeHint, setActiveHint] = useState<Hint>(null);
  const [result, setResult] = useState<PlaySessionResult | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [isPending, startTransition] = useTransition();
  const ignoreNextClickRef = useRef(false);

  const availablePaoDecks = paoDeckOptions;
  const selectedPaoDeck = useMemo(
    () => availablePaoDecks.find((item) => item.id === selectedPaoDeckId) ?? availablePaoDecks[0] ?? null,
    [availablePaoDecks, selectedPaoDeckId]
  );
  const sourcePaoDeck = selectedPaoDeck?.deck ?? emptyPaoDeck;
  const deck = useMemo(() => (sessionDeck.length > 0 ? sessionDeck : sourcePaoDeck.slice(0, count)), [count, sessionDeck, sourcePaoDeck]);
  const hasPaoDeck = sourcePaoDeck.length > 0;
  const selectedPalace = useMemo(
    () => sampleUserPalaces.find((item) => item.name === palace) ?? sampleUserPalaces[0],
    [palace]
  );
  const current = deck[index];
  const currentPromptPosition = questionPositions[index];
  const currentPromptCard = mode === "RANDOM_POSITION" ? deck[(currentPromptPosition ?? 1) - 1] : current;
  const score = result ? Math.round(result.accuracy * (mode === "RANDOM_POSITION" ? result.questionPositions.length : result.deckSize)) : 0;
  const hardCount = flashcardGrades.filter((grade) => grade.outcome === "hard").length;
  const wrongFlashcards = flashcardGrades.filter((grade) => grade.outcome === "wrong").length;
  const currentRouteIndex = Math.floor(index / 3) % selectedPalace.locations.length;
  const currentRouteLocation = selectedPalace.locations[currentRouteIndex];
  const modeTitle = modeCards.find((item) => item.mode === mode)?.title ?? "Classic";

  function start(startedAtMs: number) {
    if (!hasPaoDeck) return;

    const nextDeck = buildSessionDeck(mode);
    const positions =
      mode === "RANDOM_POSITION" ? shuffleNumbers(nextDeck.length).slice(0, Math.min(questionCount, nextDeck.length)) : [];

    setSessionDeck(nextDeck);
    setQuestionPositions(positions);
    setIndex(0);
    setRecall(Array.from({ length: mode === "RANDOM_POSITION" ? positions.length : nextDeck.length }, () => ""));
    setFlashcardAnswer("");
    setFlashcardGrades([]);
    setStudyStartedAt(startedAtMs);
    setRecallStartedAt(0);
    setResponseStartedAt(startedAtMs);
    setMemorizationMs(0);
    setRecallMs(0);
    setResult(null);
    setSaveState("idle");
    setActiveHint(null);
    setPhase(mode === "PAO_FLASHCARD" ? "flashcards" : "memorize");
  }

  function buildSessionDeck(nextMode: PlayMode) {
    if (nextMode === "SUIT_FOCUS") {
      return shuffleEntries(prepareModeDeck({ mode: nextMode, sourceDeck: sourcePaoDeck, deckSize: suitCount, selectedSuit }));
    }

    if (nextMode === "PAO_FLASHCARD") {
      return shuffleEntries(sourcePaoDeck).slice(0, flashcardCount);
    }

    return shuffleEntries(sourcePaoDeck).slice(0, count);
  }

  function beginRecall(eventTime: number) {
    setMemorizationMs(eventTime - studyStartedAt);
    setRecallStartedAt(eventTime);
    setIndex(0);
    setActiveHint(null);
    setPhase("recall");
  }

  function nextCard() {
    if (index + 1 >= deck.length) return;
    setIndex(index + 1);
    setActiveHint(null);
  }

  function previousCard() {
    setIndex((currentIndex) => Math.max(0, currentIndex - 1));
    setActiveHint(null);
  }

  function handleSwipe(endX: number) {
    if (touchStartX === null) return;
    const delta = endX - touchStartX;
    setTouchStartX(null);

    if (delta <= -40) {
      ignoreNextClickRef.current = true;
      nextCard();
    }

    if (delta >= 40) {
      ignoreNextClickRef.current = true;
      previousCard();
    }
  }

  function handleCardClick(clientX: number, currentTarget: HTMLButtonElement) {
    if (ignoreNextClickRef.current) {
      ignoreNextClickRef.current = false;
      return;
    }

    const bounds = currentTarget.getBoundingClientRect();
    if (clientX >= bounds.left + bounds.width / 2) nextCard();
    else previousCard();
  }

  function updateRecallGuess(nextGuess: string) {
    const next = [...recall];
    next[index] = normalizeCardCode(nextGuess);
    setRecall(next);
  }

  function advanceRecall(finishedAt: number) {
    if (index + 1 >= recall.length) {
      finishRecall(finishedAt);
      return;
    }

    setIndex(index + 1);
  }

  function finishRecall(finishedAt: number) {
    const finalRecallMs = finishedAt - recallStartedAt;
    const routeLocations = selectedPalace.locations;
    const personalBestTotalTime = readPersonalBest(modeBestKey());
    const nextResult =
      mode === "RANDOM_POSITION"
        ? buildPlaySessionResult({
            mode,
            deck: deck.map((entry) => entry.card),
            questionPositions,
            userAnswers: recall,
            routeLocations,
            memorizationTime: memorizationMs,
            recallTime: finalRecallMs,
            personalBestTotalTime
          })
        : buildPlaySessionResult({
            mode,
            deck: deck.map((entry) => entry.card),
            userRecall: recall,
            selectedSuit: mode === "SUIT_FOCUS" ? selectedSuit : undefined,
            difficulty: mode === "SPEED" ? difficulty : undefined,
            memorizationTime: memorizationMs,
            recallTime: finalRecallMs,
            personalBestTotalTime
          });

    setRecallMs(finalRecallMs);
    completeWithResult(nextResult);
  }

  function submitFlashcard(outcome: "typed" | "correct" | "wrong" | "hard", finishedAt: number) {
    if (!current) return;

    const answer =
      outcome === "correct"
        ? getVisiblePaoExpected()
        : outcome === "wrong"
          ? ""
          : flashcardAnswer;
    const grade = gradePaoAnswer({
      variant: paoVariant,
      entry: current,
      answer,
      missingPart: getMissingPart(index),
      markedHard: outcome === "hard",
      responseTime: finishedAt - responseStartedAt
    });
    const nextGrades = [...flashcardGrades, outcome === "wrong" ? { ...grade, isCorrect: false, outcome: "wrong" as const } : grade];
    setFlashcardGrades(nextGrades);
    setFlashcardAnswer("");

    if (index + 1 >= deck.length) {
      const totalResponseTime = nextGrades.reduce((sum, item) => sum + item.responseTime, 0);
      const personalBestTotalTime = readPersonalBest(modeBestKey());
      const correctGrades = nextGrades.filter((item) => item.outcome === "correct");
      const mistakes = nextGrades
        .map((item, gradeIndex) => ({ item, gradeIndex }))
        .filter(({ item }) => item.outcome !== "correct")
        .map(({ item, gradeIndex }) => ({
          position: gradeIndex + 1,
          expected: item.cardCode,
          answer: item.answer,
          type: "WRONG_CARD" as const,
          feedback: `${item.cardCode}: expected ${item.expected}, answered ${item.answer || "nothing"}.`
        }));
      const nextResult: PlaySessionResult = {
        mode,
        deckSize: deck.length,
        difficulty: undefined,
        generatedDeck: deck.map((entry) => entry.card.code),
        userRecall: nextGrades.map((item) => (item.outcome === "correct" ? item.cardCode : "")),
        questionPositions: [],
        userAnswers: nextGrades.map((item) => item.answer),
        accuracy: deck.length === 0 ? 0 : correctGrades.length / deck.length,
        memorizationTime: 0,
        recallTime: totalResponseTime,
        totalTime: totalResponseTime,
        mistakes,
        isValidRun: true,
        isPersonalBest: personalBestTotalTime === undefined || totalResponseTime < personalBestTotalTime,
        weakRanks: mistakes.map((mistake) => deck[mistake.position - 1]?.card.rank).filter(Boolean),
        correctPositions: 0,
        wrongPositions: [],
        weakLoci: []
      };

      setRecallMs(totalResponseTime);
      completeWithResult(nextResult);
      return;
    }

    setIndex(index + 1);
    setResponseStartedAt(finishedAt);
  }

  function completeWithResult(nextResult: PlaySessionResult) {
    setResult(nextResult);
    setPhase("score");

    if (nextResult.isPersonalBest) {
      writePersonalBest(modeBestKey(), nextResult.totalTime);
    }

    startTransition(async () => {
      try {
        setSaveState("saving");
        await savePlaySessionResult(toTrainingSessionPayload(nextResult));
        setSaveState("saved");
      } catch {
        setSaveState("local");
      }
    });
  }

  function reset() {
    setPhase("setup");
    setIndex(0);
    setRecall([]);
    setSessionDeck([]);
    setQuestionPositions([]);
    setFlashcardAnswer("");
    setFlashcardGrades([]);
    setActiveHint(null);
    setResult(null);
    setSaveState("idle");
  }

  function modeBestKey() {
    return `palace52:best:${selectedPaoDeck?.id ?? "no-pao"}:${mode}:${mode === "SPEED" ? difficulty : mode === "SUIT_FOCUS" ? selectedSuit : paoVariant}`;
  }

  function getVisiblePaoExpected() {
    if (!current) return "";
    if (paoVariant === "PAO_TO_CARD") return current.card.code;
    if (paoVariant === "MISSING_PART") return current[getMissingPart(index)];
    return `${current.person} ${current.action} ${current.object}`;
  }

  return (
    <div className="space-y-5">
      {phase === "setup" && (
        <section className="grid gap-4 lg:grid-cols-[1fr_380px]">
          <Panel className="p-5 md:p-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--accent)]">Play mode</p>
                <h1 className="mt-2 max-w-4xl text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
                  Choose the pressure, then train the deck
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                  Classic is the default route recall game. The other modes isolate speed, suits, PAO fluency, or position recall.
                </p>
              </div>
              <div className="rounded-md border border-[var(--border)] bg-[var(--card-muted)] px-3 py-2 font-mono text-sm text-[var(--muted)]">
                {modeTitle}
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-5">
              {modeCards.map((item) => {
                const Icon = item.icon;
                const active = item.mode === mode;
                return (
                  <button
                    key={item.mode}
                    type="button"
                    onClick={() => setMode(item.mode)}
                    className={`rounded-lg border p-3 text-left transition active:translate-y-px ${
                      active
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] shadow-[var(--shadow)]"
                        : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--border-strong)]"
                    }`}
                  >
                    <Icon className={active ? "size-5 text-[var(--accent)]" : "size-5 text-[var(--muted)]"} />
                    <p className="mt-3 text-sm font-semibold">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{item.short}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-[var(--foreground)]">Memory palace</span>
                <select value={palace} onChange={(event) => setPalace(event.target.value)} className="h-11 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm">
                  {sampleUserPalaces.map((item) => (
                    <option key={item.name} value={item.name}>{item.name}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-[var(--foreground)]">PAO deck</span>
                <select
                  value={selectedPaoDeckId}
                  onChange={(event) => {
                    setSelectedPaoDeckId(event.target.value);
                    setSessionDeck([]);
                    setActiveHint(null);
                  }}
                  disabled={!hasPaoDeck}
                  className="h-11 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm"
                >
                  {hasPaoDeck ? (
                    availablePaoDecks.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}{typeof item.customCount === "number" ? ` (${item.customCount}/52)` : ""}
                      </option>
                    ))
                  ) : (
                    <option value="">No saved PAO deck yet</option>
                  )}
                </select>
                <span className="block text-xs leading-5 text-[var(--muted)]">
                  {selectedPaoDeck?.description ?? "Create PAO card images first, then come back to train with your saved deck."}
                </span>
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {mode === "SPEED" ? (
                <label className="space-y-2">
                  <span className="text-sm font-medium text-[var(--foreground)]">Difficulty</span>
                  <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as SpeedDifficulty)} className="h-11 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm">
                    {speedDifficulties.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </label>
              ) : mode === "SUIT_FOCUS" ? (
                <label className="space-y-2">
                  <span className="text-sm font-medium text-[var(--foreground)]">Cards</span>
                  <select value={suitCount} onChange={(event) => setSuitCount(Number(event.target.value))} className="h-11 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm">
                    {suitCounts.map((item) => (
                      <option key={item} value={item}>{item} cards</option>
                    ))}
                  </select>
                </label>
              ) : mode === "PAO_FLASHCARD" ? (
                <label className="space-y-2">
                  <span className="text-sm font-medium text-[var(--foreground)]">Cards</span>
                  <select value={flashcardCount} onChange={(event) => setFlashcardCount(Number(event.target.value))} className="h-11 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm">
                    {flashcardCounts.map((item) => (
                      <option key={item} value={item}>{item} prompts</option>
                    ))}
                  </select>
                </label>
              ) : mode === "RANDOM_POSITION" ? (
                <label className="space-y-2">
                  <span className="text-sm font-medium text-[var(--foreground)]">Questions</span>
                  <select value={questionCount} onChange={(event) => setQuestionCount(Number(event.target.value))} className="h-11 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm">
                    {positionQuestionCounts.map((item) => (
                      <option key={item} value={item}>{item} positions</option>
                    ))}
                  </select>
                </label>
              ) : (
                <label className="space-y-2">
                  <span className="text-sm font-medium text-[var(--foreground)]">Cards</span>
                  <select value={count} onChange={(event) => setCount(Number(event.target.value))} className="h-11 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm">
                    {cardCounts.map((item) => (
                      <option key={item} value={item}>{item} cards</option>
                    ))}
                  </select>
                </label>
              )}
            </div>

            {mode === "SUIT_FOCUS" && (
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {suits.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setSelectedSuit(item.value)}
                    className={`h-11 rounded-md border text-sm font-semibold transition active:translate-y-px ${
                      selectedSuit === item.value ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border)] bg-[var(--card-muted)]"
                    }`}
                  >
                    <span className={item.tone}>{item.label}</span>
                  </button>
                ))}
              </div>
            )}

            {mode === "PAO_FLASHCARD" && (
              <div className="mt-4 grid gap-2 md:grid-cols-4">
                {paoVariants.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setPaoVariant(item.value)}
                    className={`rounded-md border p-3 text-left transition active:translate-y-px ${
                      paoVariant === item.value ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border)] bg-[var(--card-muted)]"
                    }`}
                  >
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{item.helper}</p>
                  </button>
                ))}
              </div>
            )}

            <Button onClick={(event) => start(event.timeStamp)} disabled={!hasPaoDeck} className="mt-6 h-12 w-full md:w-auto">
              <Timer className="size-4" />
              Start {modeTitle}
            </Button>
          </Panel>

          <Panel className="border-black bg-black p-5 text-white md:p-6">
            <p className="text-sm text-white/55">Mode rules</p>
            <div className="mt-5 space-y-3">
              {getModeRules(mode, difficulty, selectedSuit).map((step, stepIndex) => (
                <div key={step} className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-md bg-white/10 font-mono text-sm">{stepIndex + 1}</span>
                  <span className="text-sm leading-5">{step}</span>
                </div>
              ))}
            </div>
          </Panel>
        </section>
      )}

      {phase === "memorize" && current && (
        <section className="mx-auto flex min-h-[calc(100dvh-160px)] max-w-xl flex-col items-center justify-center gap-4">
          <div className="w-full max-w-[420px] rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 shadow-[var(--shadow)]">
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-sm font-semibold text-[var(--accent)]">
                {modeTitle} / Card {index + 1} of {deck.length}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveHint((hint) => (hint === "palace" ? null : "palace"))}
                  className="inline-flex size-9 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card-muted)] text-[var(--accent)] transition hover:border-[var(--border-strong)] active:translate-y-px"
                  aria-label="Show current memory palace location"
                  aria-pressed={activeHint === "palace"}
                >
                  <Castle className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveHint((hint) => (hint === "pao" ? null : "pao"))}
                  className="inline-flex size-9 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card-muted)] text-[var(--accent)] transition hover:border-[var(--border-strong)] active:translate-y-px"
                  aria-label="Show current card PAO hint"
                  aria-pressed={activeHint === "pao"}
                >
                  <Brain className="size-4" />
                </button>
              </div>
            </div>

            {activeHint === "palace" && (
              <div className="mt-3 rounded-md bg-[var(--accent-soft)] p-3 text-sm leading-6">
                <p className="font-semibold text-[var(--foreground)]">{selectedPalace.name}</p>
                <p className="text-[var(--muted)]">
                  Location {currentRouteIndex + 1} of {selectedPalace.locations.length}: {currentRouteLocation}
                </p>
              </div>
            )}

            {activeHint === "pao" && (
              <div className="mt-3 rounded-md bg-[var(--card-muted)] p-3 text-sm leading-6">
                <p className="font-semibold text-[var(--foreground)]">{current.card.label}</p>
                <p className="mb-2 text-xs text-[var(--muted)]">PAO deck: {selectedPaoDeck?.name ?? "No saved PAO deck"}</p>
                <p><strong className="font-semibold">P:</strong> {current.person}</p>
                <p><strong className="font-semibold">A:</strong> {current.action}</p>
                <p><strong className="font-semibold">O:</strong> {current.object}</p>
              </div>
            )}
          </div>

          <button
            onPointerDown={(event) => setTouchStartX(event.clientX)}
            onPointerUp={(event) => handleSwipe(event.clientX)}
            onClick={(event) => handleCardClick(event.clientX, event.currentTarget)}
            className="group w-full max-w-[320px] touch-pan-y select-none transition active:scale-[0.99] md:max-w-[380px]"
            aria-label={`${current.card.label}. Swipe left or click right half for next card. Swipe right or click left half for previous card.`}
          >
            <PlayingCardFace card={current.card} />
          </button>

          <div className="flex w-full max-w-[420px] gap-2">
            <Button onClick={previousCard} variant="secondary" disabled={index === 0} className="flex-1">
              Previous
            </Button>
            {index + 1 >= deck.length ? (
              <Button onClick={(event) => beginRecall(event.timeStamp)} className="flex-1">
                <Zap className="size-4" />
                Start recall
              </Button>
            ) : (
              <Button onClick={nextCard} className="flex-1">
                Next
              </Button>
            )}
          </div>
        </section>
      )}

      {phase === "recall" && currentPromptCard && (
        <section className="mx-auto flex min-h-[calc(100dvh-160px)] max-w-3xl flex-col justify-center gap-4">
          <div className="rounded-lg border border-[#dfe3d7] bg-white p-5 dark:border-[var(--border)] dark:bg-[var(--card)]">
            <p className="text-sm font-medium text-[#0f7a5f] dark:text-[var(--accent)]">Recall mode</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              {mode === "RANDOM_POSITION" ? `What was card #${currentPromptPosition}?` : "Enter the card at this position"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#6f7468] dark:text-[var(--muted)]">
              Use A, 2-10, J, Q, K with H, D, C, S. Press Enter to lock the answer and move on.
            </p>
          </div>

          <div className="rounded-lg border border-[#dfe3d7] bg-white p-4 shadow-sm md:p-5 dark:border-[var(--border)] dark:bg-[var(--card)]">
            <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <p className="font-mono text-sm font-semibold text-[#0f7a5f] dark:text-[var(--accent)]">
                  Question {index + 1} of {recall.length}
                </p>
                <p className="mt-1 text-sm text-[#6f7468] dark:text-[var(--muted)]">
                  {mode === "RANDOM_POSITION"
                    ? `Route cue: ${selectedPalace.locations[((currentPromptPosition ?? 1) - 1) % selectedPalace.locations.length]}`
                    : `Route location ${currentRouteIndex + 1}: ${currentRouteLocation}`}
                </p>
              </div>
              <p className="text-sm font-semibold text-[#6f7468] dark:text-[var(--muted)]">
                {recall[index] ? "Answer ready" : "Type your best guess"}
              </p>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-[#394037] dark:text-[var(--foreground)]">Your card code</span>
              <input
                autoFocus
                value={recall[index] ?? ""}
                onChange={(event) => updateRecallGuess(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    advanceRecall(event.timeStamp);
                  }
                }}
                placeholder="2H"
                className="h-12 w-full rounded-md border border-[#dfe3d7] bg-[#fbfcf8] px-3 font-mono text-base uppercase outline-none transition focus:border-[#0f7a5f] focus:ring-2 focus:ring-[#0f7a5f]/15 dark:border-[var(--border)] dark:bg-[var(--card-muted)]"
              />
            </label>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button onClick={() => updateRecallGuess(currentPromptCard.card.code)} variant="secondary">
                Mark correct
              </Button>
              <Button onClick={(event) => advanceRecall(event.timeStamp)}>
                <Send className="size-4" />
                {index + 1 >= recall.length ? "Score run" : "Next question"}
              </Button>
            </div>
          </div>
        </section>
      )}

      {phase === "flashcards" && current && (
        <section className="mx-auto flex min-h-[calc(100dvh-160px)] max-w-3xl flex-col justify-center gap-4">
          <Panel className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-sm font-semibold text-[var(--accent)]">
                  Prompt {index + 1} of {deck.length}
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight">{paoVariants.find((item) => item.value === paoVariant)?.label}</h1>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <InlineCounter label="Correct" value={flashcardGrades.filter((grade) => grade.outcome === "correct").length} />
                <InlineCounter label="Wrong" value={wrongFlashcards} />
                <InlineCounter label="Hard" value={hardCount} />
              </div>
            </div>
          </Panel>

          <Panel className="p-5 md:p-7">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card-muted)] p-5">
              <p className="text-sm font-medium text-[var(--muted)]">Prompt</p>
              <div className="mt-3 text-2xl font-semibold leading-snug">{renderPaoPrompt(current, paoVariant, getMissingPart(index))}</div>
            </div>
            <label className="mt-5 block space-y-2">
              <span className="text-sm font-medium">Answer</span>
              <input
                autoFocus
                value={flashcardAnswer}
                onChange={(event) => setFlashcardAnswer(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    submitFlashcard("typed", event.timeStamp);
                  }
                }}
                placeholder={paoVariant === "PAO_TO_CARD" ? "AH" : "Person Action Object"}
                className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-base outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15"
              />
            </label>
            <div className="mt-4 rounded-md bg-[var(--accent-soft)] p-3 text-sm leading-6 text-[var(--foreground)]">
              Expected: <span className="font-semibold">{getVisiblePaoExpected()}</span>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              <Button onClick={(event) => submitFlashcard("wrong", event.timeStamp)} variant="secondary">
                Wrong
              </Button>
              <Button onClick={(event) => submitFlashcard("hard", event.timeStamp)} variant="secondary">
                Hard
              </Button>
              <Button onClick={(event) => submitFlashcard("correct", event.timeStamp)}>
                <CheckCircle2 className="size-4" />
                Correct
              </Button>
            </div>
          </Panel>
        </section>
      )}

      {phase === "score" && result && (
        <section className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Accuracy" value={formatPercent(result.accuracy)} helper={`${score} correct`} tone="accent" />
            <MetricCard label="Memorize" value={formatMs(result.memorizationTime)} helper={mode === "PAO_FLASHCARD" ? "flashcard mode" : "study time"} />
            <MetricCard label="Recall" value={formatMs(result.recallTime)} helper="answer time" />
            <MetricCard
              label="Run"
              value={result.isPersonalBest ? "PB" : result.isValidRun ? "Valid" : "Invalid"}
              helper={saveState === "saved" ? "Saved to history" : saveState === "saving" || isPending ? "Saving" : saveState === "local" ? "Stored locally only" : "Ready"}
              icon={result.isPersonalBest ? <Trophy className="size-4" /> : <BadgeCheck className="size-4" />}
            />
          </div>

          <Panel className="p-4">
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-semibold">{modeTitle} feedback</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">{resultSummary(result, mode, difficulty)}</p>
              </div>
              <Button onClick={reset} variant="secondary">
                <RotateCcw className="size-4" />
                New game
              </Button>
            </div>

            {result.mistakes.length === 0 ? (
              <div className="flex gap-3 rounded-md bg-[#eef8f3] p-4 text-sm dark:bg-[var(--accent-soft)]">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#0f7a5f] dark:text-[var(--accent)]" />
                Clean run. Repeat it once more, then increase pressure.
              </div>
            ) : (
              <div className="grid gap-2 md:grid-cols-2">
                {result.mistakes.slice(0, 12).map((mistake) => (
                  <div key={`${mistake.position}-${mistake.expected}-${mistake.answer}`} className="rounded-md bg-[#fbfcf8] p-3 text-sm dark:bg-[var(--card-muted)]">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono">#{mistake.position}</span>
                      <span className="text-xs font-semibold text-red-600 dark:text-[var(--danger)]">{mistake.type.replace("_", " ")}</span>
                    </div>
                    <p className="mt-2 text-[var(--foreground)]">{mistake.feedback}</p>
                  </div>
                ))}
              </div>
            )}

            {mode === "SUIT_FOCUS" && result.weakRanks.length > 0 && (
              <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--card-muted)] p-3 text-sm">
                Weak ranks: <span className="font-semibold">{result.weakRanks.join(", ")}</span>
              </div>
            )}

            {mode === "RANDOM_POSITION" && result.weakLoci.length > 0 && (
              <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--card-muted)] p-3 text-sm">
                Weak loci: <span className="font-semibold">{result.weakLoci.join(", ")}</span>
              </div>
            )}
          </Panel>
        </section>
      )}
    </div>
  );
}

function InlineCounter({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--card-muted)] px-3 py-2">
      <p className="font-mono text-base font-semibold">{value}</p>
      <p className="text-[var(--muted)]">{label}</p>
    </div>
  );
}

function PlayingCardFace({ card }: { card: PlayingCard }) {
  const rank = getRankMark(card);
  const suit = getSuitMark(card);
  const tone = getCardTone(card);
  const pipCount = getPipCount(card);
  const isFace = card.rank === "JACK" || card.rank === "QUEEN" || card.rank === "KING";

  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[22px] border border-[#b99548] bg-[#fff8e8] p-4 text-[#21172c] shadow-[0_24px_70px_rgb(5_3_12/0.38),inset_0_0_0_8px_rgb(255_248_232/0.72),inset_0_0_0_10px_rgb(185_149_72/0.24)]">
      <div className="pointer-events-none absolute inset-3 rounded-[17px] border border-[#d2b66a]/70" />
      <div className="pointer-events-none absolute inset-6 rounded-[13px] border border-[#21172c]/10" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d4af37]/10 blur-2xl" />

      <CardIndex rank={rank} suit={suit} tone={tone} />
      <CardIndex rank={rank} suit={suit} tone={tone} flipped />

      <div className="relative flex h-full items-center justify-center px-7 py-8">
        {isFace ? (
          <FaceCourtCard card={card} rank={rank} suit={suit} tone={tone} />
        ) : pipCount === 1 ? (
          <div className={`flex flex-col items-center ${tone}`}>
            <span className="font-mono text-3xl font-bold tracking-tight">{rank}</span>
            <span className="mt-3 text-[8.5rem] leading-none drop-shadow-sm">{suit}</span>
          </div>
        ) : (
          <div className={`grid h-full w-full grid-cols-3 grid-rows-5 items-center justify-items-center ${tone}`}>
            {getPipPositions(pipCount).map((position) => (
              <span
                key={`${card.code}-${position}`}
                className={`text-4xl leading-none md:text-5xl ${position >= 7 ? "rotate-180" : ""}`}
                style={{ gridColumn: (position % 3) + 1, gridRow: Math.floor(position / 3) + 1 }}
              >
                {suit}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CardIndex({ rank, suit, tone, flipped = false }: { rank: string; suit: string; tone: string; flipped?: boolean }) {
  return (
    <div className={`absolute ${flipped ? "bottom-4 right-4 rotate-180" : "left-4 top-4"} z-10 flex flex-col items-center font-mono font-bold ${tone}`}>
      <span className="text-2xl leading-none">{rank}</span>
      <span className="text-2xl leading-none">{suit}</span>
    </div>
  );
}

function FaceCourtCard({ card, rank, suit, tone }: { card: PlayingCard; rank: string; suit: string; tone: string }) {
  const title = card.rank === "JACK" ? "Knight" : card.rank === "QUEEN" ? "Queen" : "King";
  const crown = card.rank === "QUEEN" ? "Q" : card.rank === "KING" ? "K" : "J";

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-between rounded-xl border border-[#b99548]/45 bg-[linear-gradient(145deg,#fffaf0,#f0dfba)] px-5 py-6 shadow-[inset_0_0_28px_rgb(185_149_72/0.18)]">
      <div className="absolute inset-3 rounded-lg border border-[#21172c]/10" />
      <div className={`relative flex size-24 items-center justify-center rounded-full border border-[#b99548] bg-[#21172c] ${tone}`}>
        <span className="absolute -top-4 font-mono text-2xl text-[#b99548]">{crown}</span>
        <span className="text-6xl leading-none">{suit}</span>
      </div>
      <div className="relative text-center">
        <p className="font-mono text-5xl font-bold tracking-tight text-[#21172c]">{rank}</p>
        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#8a6518]">{title}</p>
      </div>
      <div className={`relative flex items-center gap-3 ${tone}`}>
        <span className="rotate-180 text-4xl leading-none">{suit}</span>
        <span className="text-4xl leading-none">{suit}</span>
      </div>
    </div>
  );
}

function getRankMark(card: PlayingCard) {
  if (card.rank === "ACE") return "A";
  if (card.rank === "JACK") return "J";
  if (card.rank === "QUEEN") return "Q";
  if (card.rank === "KING") return "K";
  return card.shortLabel.replace(/[^\d]/g, "");
}

function getSuitMark(card: PlayingCard) {
  return card.shortLabel.replace(/[A-Z0-9]/g, "");
}

function getCardTone(card: PlayingCard) {
  return card.color === "red" ? "text-[#9f1d2e]" : "text-[#21172c]";
}

function getPipCount(card: PlayingCard) {
  if (card.rank === "ACE") return 1;
  if (card.rank === "TWO") return 2;
  if (card.rank === "THREE") return 3;
  if (card.rank === "FOUR") return 4;
  if (card.rank === "FIVE") return 5;
  if (card.rank === "SIX") return 6;
  if (card.rank === "SEVEN") return 7;
  if (card.rank === "EIGHT") return 8;
  if (card.rank === "NINE") return 9;
  if (card.rank === "TEN") return 10;
  return 0;
}

function getPipPositions(count: number) {
  const positions: Record<number, number[]> = {
    2: [1, 13],
    3: [1, 7, 13],
    4: [0, 2, 12, 14],
    5: [0, 2, 7, 12, 14],
    6: [0, 2, 6, 8, 12, 14],
    7: [0, 2, 4, 6, 8, 12, 14],
    8: [0, 2, 4, 6, 8, 10, 12, 14],
    9: [0, 2, 3, 5, 7, 9, 11, 12, 14],
    10: [0, 2, 3, 5, 6, 8, 9, 11, 12, 14]
  };

  return positions[count] ?? [7];
}

function shuffleEntries<T>(entries: T[]) {
  return [...entries].sort(() => Math.random() - 0.5);
}

function shuffleNumbers(count: number) {
  return Array.from({ length: count }, (_, index) => index + 1).sort(() => Math.random() - 0.5);
}

function formatMs(ms: number) {
  const seconds = Math.round(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

function getModeRules(mode: PlayMode, difficulty: SpeedDifficulty, selectedSuit: SuitName) {
  if (mode === "SPEED") {
    return [
      "Memorize as fast as possible.",
      "Recall immediately after the final card.",
      difficulty === "Elite" ? "Elite requires 100% accuracy." : difficulty === "Competitive" ? "Competitive requires 90%+ accuracy." : "Relaxed keeps the run valid at any accuracy.",
      "Personal bests compare valid total time."
    ];
  }

  if (mode === "SUIT_FOCUS") {
    return [`Train only ${selectedSuit.toLowerCase()}.`, "Choose 5, 10, or 13 cards.", "Feedback highlights weak ranks.", "Repeat until the suit feels automatic."];
  }

  if (mode === "PAO_FLASHCARD") {
    return ["Choose a flashcard direction.", "Answer with card codes or PAO text.", "Mark hard prompts explicitly.", "Weak cards appear in session feedback."];
  }

  if (mode === "RANDOM_POSITION") {
    return ["Memorize the shuffled deck.", "Answer random position questions.", "Feedback marks wrong positions.", "Weak loci appear when route cues exist."];
  }

  return ["Choose palace", "Shuffle deck", "Swipe through cards", "Recall by palace location", "Score time and mistakes"];
}

function renderPaoPrompt(entry: StarterPao, variant: PaoVariant, missingPart: PaoPart) {
  if (variant === "PAO_TO_CARD") return `${entry.person} ${entry.action} ${entry.object}`;
  if (variant === "MISSING_PART") {
    const visible = {
      person: missingPart === "person" ? "____" : entry.person,
      action: missingPart === "action" ? "____" : entry.action,
      object: missingPart === "object" ? "____" : entry.object
    };
    return `${entry.card.label}: ${visible.person} ${visible.action} ${visible.object}`;
  }
  return entry.card.label;
}

function getMissingPart(index: number): PaoPart {
  return (["person", "action", "object"] as const)[index % 3];
}

function resultSummary(result: PlaySessionResult, mode: PlayMode, difficulty: SpeedDifficulty) {
  if (mode === "SPEED" && !result.isValidRun) return `${difficulty} threshold missed. Slow down until accuracy clears the gate.`;
  if (mode === "RANDOM_POSITION") return `${result.correctPositions} positions correct, ${result.wrongPositions.length} need another route pass.`;
  if (mode === "SUIT_FOCUS") return result.weakRanks.length > 0 ? "Target the listed ranks before changing suits." : "Suit lane is clean.";
  if (mode === "PAO_FLASHCARD") return `${result.mistakes.length} associations need review. Hard cards count as weak cards.`;
  return "Classic route recall scored with position-level mistakes.";
}

function readPersonalBest(key: string) {
  if (typeof window === "undefined") return undefined;
  const value = window.localStorage.getItem(key);
  return value ? Number(value) : undefined;
}

function writePersonalBest(key: string, value: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, String(value));
}

function isRecallCorrectLabel(code: string | undefined) {
  return code ? cardFromCode(code)?.label ?? code : "nothing";
}
