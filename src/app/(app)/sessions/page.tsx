import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/product";
import { requireCurrentUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { hasRequiredAppConfig } from "@/lib/runtime-config";
import { formatDuration, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SessionsPage() {
  if (!hasRequiredAppConfig()) return null;

  const user = await requireCurrentUser();
  const sessions = await getPrisma().trainingSession.findMany({
    where: { userId: user.id, status: "COMPLETED" },
    include: { cardResults: { orderBy: { expectedIndex: "asc" } }, palace: true },
    orderBy: { completedAt: "desc" },
    take: 30
  });

  return (
    <div className="space-y-6">
      <PageHeader
        label="Session history"
        title="Review previous deck attempts"
        description="Each completed session stores score, timing, palace, and card-level mistakes."
      />
      <div className="space-y-4">
        {sessions.length === 0 ? (
          <Card>
            <CardContent className="text-sm text-[var(--muted)]">No completed sessions yet. Start with a full-deck training session.</CardContent>
          </Card>
        ) : (
          sessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div>
                    <CardTitle>{modeLabel(session.mode)} · {session.score}/{session.deckSize ?? (Array.isArray(session.deck) ? session.deck.length : 52)}</CardTitle>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {session.palace?.name ?? modeDetail(session)} · {session.completedAt?.toLocaleDateString()} · {formatPercent(session.accuracy)} accuracy
                    </p>
                  </div>
                  <div className="font-mono text-sm text-[var(--foreground)]">
                    Study {formatDuration(session.memorizationMs)} · Recall {formatDuration(session.recallMs)}
                    {session.isPersonalBest ? <span className="ml-2 rounded-md bg-[var(--accent-soft)] px-2 py-1 text-[var(--accent)]">PB</span> : null}
                    {!session.isValidRun ? <span className="ml-2 rounded-md bg-red-50 px-2 py-1 text-red-700">Invalid run</span> : null}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 md:grid-cols-2">
                  {session.cardResults.filter((result) => !result.isCorrect).slice(0, 8).map((result) => (
                    <div key={result.id} className="flex gap-3 rounded-md bg-[var(--card-muted)] p-3 text-sm">
                      <XCircle className="mt-0.5 size-4 shrink-0 text-red-500" />
                      <span>{result.feedback}</span>
                    </div>
                  ))}
                  {session.cardResults.length > 0 && session.cardResults.every((result) => result.isCorrect) && (
                    <div className="flex gap-3 rounded-md bg-[var(--accent-soft)] p-3 text-sm">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--accent)]" />
                      Perfect recall. Keep the route fresh with another timed run.
                    </div>
                  )}
                  {session.cardResults.length === 0 &&
                    readSessionMistakes(session.mistakes).slice(0, 8).map((mistake) => (
                      <div key={`${mistake.position}-${mistake.expected}`} className="flex gap-3 rounded-md bg-[var(--card-muted)] p-3 text-sm">
                        <XCircle className="mt-0.5 size-4 shrink-0 text-red-500" />
                        <span>{mistake.feedback}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function modeLabel(mode: string) {
  if (mode === "FULL_DECK") return "Classic";
  return mode
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function modeDetail(session: { selectedSuit: string | null; difficulty: string | null; mode: string }) {
  if (session.selectedSuit) return `${session.selectedSuit.toLowerCase()} focus`;
  if (session.difficulty) return `${session.difficulty} run`;
  if (session.mode === "PAO_FLASHCARD") return "PAO associations";
  if (session.mode === "RANDOM_POSITION") return "Position recall";
  return "No palace";
}

function readSessionMistakes(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is { position: number; expected: string; feedback: string } =>
      typeof item === "object" &&
      item !== null &&
      "position" in item &&
      "expected" in item &&
      "feedback" in item
  );
}
