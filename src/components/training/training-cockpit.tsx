"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { CheckCircle2, Clock3, Eye, MapPin, RotateCcw, Send, Timer } from "lucide-react";
import { createTrainingSession, completeTrainingSession } from "@/app/actions/sessions";
import { CardBadge } from "@/components/app/card-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fullDeck, type CardCode, type PlayingCard } from "@/lib/cards";
import type { ScoreSummary } from "@/lib/scoring";
import { formatDuration, formatPercent } from "@/lib/utils";

type PalaceOption = {
  id: string;
  name: string;
  locations: Array<{ id: string; name: string; order: number }>;
};

type CardImageOption = {
  rank: string;
  suit: string;
  person: string | null;
  action: string | null;
  object: string | null;
  imagePrompt: string | null;
};

type Phase = "setup" | "study" | "recall" | "results";

const phases: Array<{ key: Phase; label: string }> = [
  { key: "setup", label: "Setup" },
  { key: "study", label: "Study" },
  { key: "recall", label: "Recall" },
  { key: "results", label: "Results" }
];

export function TrainingCockpit({
  palaces,
  cardImages
}: {
  palaces: PalaceOption[];
  cardImages: CardImageOption[];
}) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [selectedPalaceId, setSelectedPalaceId] = useState(palaces[0]?.id ?? "");
  const [mode, setMode] = useState<"FULL_DECK" | "HALF_DECK" | "SPEED">("FULL_DECK");
  const [deck, setDeck] = useState<PlayingCard[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [studyStartedAt, setStudyStartedAt] = useState<number | null>(null);
  const [recallStartedAt, setRecallStartedAt] = useState<number | null>(null);
  const [memorizationMs, setMemorizationMs] = useState(0);
  const [recallMs, setRecallMs] = useState(0);
  const [activeStudyIndex, setActiveStudyIndex] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [recall, setRecall] = useState<string[]>([]);
  const [summary, setSummary] = useState<ScoreSummary | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedPalace = palaces.find((palace) => palace.id === selectedPalaceId);
  const activeStudyCardNumber = deck.length === 0 ? 0 : Math.min(activeStudyIndex + 1, deck.length);
  const selectedLocationCount = selectedPalace?.locations.length ?? 0;
  const activeLocationNumber =
    selectedLocationCount === 0 || deck.length === 0 ? 0 : (activeStudyIndex % selectedLocationCount) + 1;
  const answeredCount = recall.filter(Boolean).length;
  const nextRecallIndex = recall.findIndex((code) => !code);
  const activeRecallCardNumber = deck.length === 0 ? 0 : (nextRecallIndex === -1 ? deck.length : nextRecallIndex + 1);
  const studyElapsedMs = phase === "study" && studyStartedAt ? now - studyStartedAt : memorizationMs;
  const recallElapsedMs = phase === "recall" && recallStartedAt ? now - recallStartedAt : recallMs;

  const imageByCard = useMemo(() => {
    const map = new Map<string, CardImageOption>();
    cardImages.forEach((image) => map.set(`${image.rank}-${image.suit}`, image));
    return map;
  }, [cardImages]);

  useEffect(() => {
    if (phase !== "study" && phase !== "recall") return;

    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  function startSession() {
    startTransition(async () => {
      const result = await createTrainingSession({
        palaceId: selectedPalaceId || undefined,
        mode
      });
      setSessionId(result.sessionId);
      setDeck(result.deck);
      setRecall(Array.from({ length: result.deck.length }, () => ""));
      setActiveStudyIndex(0);
      setMemorizationMs(0);
      setRecallMs(0);
      setSummary(null);
      const startedAt = Date.now();
      setNow(startedAt);
      setStudyStartedAt(startedAt);
      setPhase("study");
    });
  }

  function startRecall() {
    const startedAt = Date.now();
    setNow(startedAt);
    setMemorizationMs(studyStartedAt ? startedAt - studyStartedAt : 0);
    setRecallStartedAt(startedAt);
    setPhase("recall");
  }

  function submitRecall() {
    startTransition(async () => {
      const finalRecallMs = recallStartedAt ? Date.now() - recallStartedAt : 0;
      setRecallMs(finalRecallMs);
      const result = await completeTrainingSession({
        sessionId,
        recalledCodes: recall as CardCode[],
        memorizationMs,
        recallMs: finalRecallMs
      });
      setSummary(result);
      setPhase("results");
    });
  }

  function reset() {
    setPhase("setup");
    setDeck([]);
    setSessionId("");
    setSummary(null);
    setRecall([]);
    setStudyStartedAt(null);
    setRecallStartedAt(null);
    setMemorizationMs(0);
    setRecallMs(0);
    setActiveStudyIndex(0);
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--accent)]">Current phase</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">{phaseLabel(phase)}</h2>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:min-w-[420px]">
              {phases.map((item) => (
                <div
                  key={item.key}
                  className={`rounded-md border px-3 py-2 text-center text-sm font-semibold ${
                    item.key === phase
                      ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "border-[var(--border)] bg-[var(--card-muted)] text-[var(--muted)]"
                  }`}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatusTile
              label={phase === "recall" ? "Recall timer" : "Memorization timer"}
              value={phase === "recall" ? formatDuration(recallElapsedMs) : formatDuration(studyElapsedMs)}
              helper={phase === "setup" ? "Starts when a deck is generated" : phase === "results" ? "Final recorded time" : "Live"}
              icon={<Clock3 className="size-4" />}
            />
            <StatusTile
              label={phase === "recall" ? "Recall progress" : "Card progress"}
              value={
                phase === "recall"
                  ? `${answeredCount} of ${deck.length || selectedDeckSize(mode)}`
                  : `${activeStudyCardNumber || 0} of ${deck.length || selectedDeckSize(mode)}`
              }
              helper={phase === "recall" ? `Current card ${activeRecallCardNumber || 0}` : "Current study card"}
              icon={<Timer className="size-4" />}
            />
            <StatusTile
              label="Location progress"
              value={`${activeLocationNumber || 0} of ${selectedLocationCount || 0}`}
              helper={selectedPalace?.name ?? "Select a palace route"}
              icon={<MapPin className="size-4" />}
            />
            <StatusTile
              label="Mode"
              value={mode.replace("_", " ")}
              helper={phase === "setup" ? "Ready to generate" : `${deck.length} cards loaded`}
            />
          </div>
        </CardContent>
      </Card>

      {phase === "setup" && (
        <Card>
          <CardHeader>
            <CardTitle>Start a deck session</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#394037]" htmlFor="palace">
                Palace route
              </label>
              <select
                id="palace"
                value={selectedPalaceId}
                onChange={(event) => setSelectedPalaceId(event.target.value)}
                className="h-10 w-full rounded-md border border-[#dfe3d7] bg-white px-3 text-sm"
              >
                {palaces.map((palace) => (
                  <option key={palace.id} value={palace.id}>
                    {palace.name} ({palace.locations.length} locations)
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#394037]" htmlFor="mode">
                Mode
              </label>
              <select
                id="mode"
                value={mode}
                onChange={(event) => setMode(event.target.value as "FULL_DECK" | "HALF_DECK" | "SPEED")}
                className="h-10 w-full rounded-md border border-[#dfe3d7] bg-white px-3 text-sm"
              >
                <option value="FULL_DECK">Full deck</option>
                <option value="HALF_DECK">Half deck</option>
                <option value="SPEED">Speed deck</option>
              </select>
            </div>
            <Button onClick={startSession} disabled={isPending || !selectedPalaceId}>
              <Timer className="size-4" />
              Generate deck
            </Button>
          </CardContent>
        </Card>
      )}

      {phase === "study" && (
        <div className="space-y-4">
          <div className="flex flex-col justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)] md:flex-row md:items-center">
            <div>
              <p className="text-sm text-[var(--muted)]">Study phase</p>
              <h2 className="text-xl font-semibold">Walk through {selectedPalace?.name}</h2>
              <p className="mt-1 text-sm text-[#6f7468]">
                Card {activeStudyCardNumber} of {deck.length}. Location {activeLocationNumber || 0} of {selectedLocationCount || 0}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={() => setActiveStudyIndex((index) => Math.max(0, index - 1))}
                variant="secondary"
                disabled={activeStudyIndex === 0}
              >
                Previous
              </Button>
              <Button
                onClick={() => setActiveStudyIndex((index) => Math.min(deck.length - 1, index + 1))}
                variant="secondary"
                disabled={activeStudyIndex >= deck.length - 1}
              >
                Next card
              </Button>
              <Button onClick={startRecall}>
                <Eye className="size-4" />
                Start recall
              </Button>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {deck.map((card, index) => {
              const location = selectedPalace?.locations[index % (selectedPalace.locations.length || 1)];
              const image = imageByCard.get(`${card.rank}-${card.suit}`);
              return (
                <Card
                  key={`${card.code}-${index}`}
                  className={index === activeStudyIndex ? "border-[#0f7a5f] ring-2 ring-[#bcebdc]" : ""}
                >
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <CardBadge label={card.shortLabel} color={card.color} />
                      <button
                        type="button"
                        onClick={() => setActiveStudyIndex(index)}
                        className="rounded-md px-2 py-1 font-mono text-sm text-[#6f7468] hover:bg-[#eef2e8]"
                        aria-label={`Set current study card to ${index + 1}`}
                      >
                        #{index + 1}
                      </button>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{location?.name ?? `Location ${index + 1}`}</p>
                      <p className="mt-1 text-sm text-[#6f7468]">{image?.imagePrompt ?? `${image?.person ?? card.label} ${image?.action ?? ""} ${image?.object ?? ""}`}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {phase === "recall" && (
        <div className="space-y-4">
          <div className="flex flex-col justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)] md:flex-row md:items-center">
            <div>
              <p className="text-sm text-[var(--muted)]">Recall phase</p>
              <h2 className="text-xl font-semibold">Enter the deck in order from memory</h2>
              <p className="mt-1 text-sm text-[#6f7468]">
                Answered {answeredCount} of {deck.length}. Current card {activeRecallCardNumber} of {deck.length}
              </p>
            </div>
            <Button onClick={submitRecall} disabled={isPending}>
              <Send className="size-4" />
              Score recall
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {deck.map((_, index) => (
              <label key={index} className="space-y-2 rounded-lg border border-[#dfe3d7] bg-white p-3">
                <span className="text-sm font-medium text-[#394037]">Position {index + 1}</span>
                <select
                  value={recall[index] ?? ""}
                  onChange={(event) => {
                    const next = [...recall];
                    next[index] = event.target.value;
                    setRecall(next);
                  }}
                  className="h-10 w-full rounded-md border border-[#dfe3d7] bg-[#fbfcf8] px-3 text-sm"
                >
                  <option value="">No answer</option>
                  {fullDeck.map((card) => (
                    <option key={card.code} value={card.code}>
                      {card.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </div>
      )}

      {phase === "results" && summary && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardContent>
                <p className="text-sm text-[#6f7468]">Score</p>
                <p className="mt-2 text-4xl font-semibold">{summary.score}/{deck.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <p className="text-sm text-[#6f7468]">Accuracy</p>
                <p className="mt-2 text-4xl font-semibold">{formatPercent(summary.accuracy)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <p className="text-sm text-[#6f7468]">Study time</p>
                <p className="mt-2 text-4xl font-semibold">{formatDuration(memorizationMs)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <p className="text-sm text-[#6f7468]">Recall time</p>
                <p className="mt-2 text-4xl font-semibold">{formatDuration(recallMs)}</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Mistake analysis</CardTitle>
                <Button onClick={reset} variant="secondary">
                  <RotateCcw className="size-4" />
                  New session
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {summary.results.map((result) => (
                <div key={result.expectedIndex} className="grid gap-3 rounded-md border border-[#edf0e8] p-3 md:grid-cols-[80px_1fr_1fr] md:items-center">
                  <div className="flex items-center gap-2">
                    {result.isCorrect ? <CheckCircle2 className="size-4 text-[#0f7a5f]" /> : <span className="size-4 rounded-full bg-red-500" />}
                    <span className="font-mono text-sm">#{result.expectedIndex + 1}</span>
                  </div>
                  <p className="text-sm">
                    Expected <strong>{result.expected.label}</strong>
                    {result.recalled ? (
                      <>
                        , recalled <strong>{result.recalled.label}</strong>
                      </>
                    ) : (
                      ", no answer"
                    )}
                  </p>
                  <p className="text-sm text-[#6f7468]">{result.feedback}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function phaseLabel(phase: Phase) {
  return phases.find((item) => item.key === phase)?.label ?? "Setup";
}

function selectedDeckSize(mode: "FULL_DECK" | "HALF_DECK" | "SPEED") {
  return mode === "HALF_DECK" ? 26 : 52;
}

function StatusTile({
  label,
  value,
  helper,
  icon
}: {
  label: string;
  value: string;
  helper: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-md border border-[var(--border)] bg-[var(--card-muted)] p-3">
      <div className="flex items-center justify-between gap-3 text-sm text-[var(--muted)]">
        <span>{label}</span>
        {icon ? <span className="shrink-0 text-[var(--accent)]">{icon}</span> : null}
      </div>
      <p className="mt-2 truncate font-mono text-2xl font-semibold text-[var(--foreground)]">{value}</p>
      <p className="mt-1 truncate text-xs text-[var(--muted)]">{helper}</p>
    </div>
  );
}
