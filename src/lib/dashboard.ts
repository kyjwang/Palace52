import type { SessionCardResult, TrainingSession } from "@prisma/client";

export function calculateDashboardStats(
  sessions: Array<TrainingSession & { cardResults: SessionCardResult[] }>
) {
  const completed = sessions.filter((session) => session.status === "COMPLETED");
  const bestScore = completed.reduce((best, session) => Math.max(best, session.score), 0);
  const averageAccuracy =
    completed.length === 0
      ? 0
      : completed.reduce((sum, session) => sum + session.accuracy, 0) / completed.length;

  const mistakeCounts = new Map<string, { label: string; count: number }>();
  for (const session of completed) {
    for (const result of session.cardResults) {
      if (result.isCorrect) continue;
      const key = `${result.expectedRank}-${result.expectedSuit}`;
      const label = `${rankLabel(result.expectedRank)} of ${suitLabel(result.expectedSuit)}`;
      mistakeCounts.set(key, {
        label,
        count: (mistakeCounts.get(key)?.count ?? 0) + 1
      });
    }
  }

  return {
    completedSessions: completed.length,
    bestScore,
    averageAccuracy,
    weakestCards: [...mistakeCounts.values()].sort((a, b) => b.count - a.count).slice(0, 6),
    trend: completed
      .slice(0, 12)
      .reverse()
      .map((session, index) => ({
        name: `S${index + 1}`,
        score: session.score,
        accuracy: Math.round(session.accuracy * 100)
      }))
  };
}

function rankLabel(rank: string) {
  return rank.charAt(0) + rank.slice(1).toLowerCase();
}

function suitLabel(suit: string) {
  return suit.charAt(0) + suit.slice(1).toLowerCase();
}
