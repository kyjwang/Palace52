import { getPrisma } from "@/lib/prisma";

type LeaderboardSession = {
  deck: unknown;
  deckSize: number | null;
  generatedDeck: unknown;
  questionPositions: unknown;
};

type LeaderboardUser = {
  username: string;
  profile: {
    displayName: string | null;
  } | null;
};

type LeaderboardEntryRecord = {
  id: string;
  userId: string;
  mode: string;
  score: number;
  accuracy: number;
  totalTimeMs: number | null;
  createdAt: Date;
  user: LeaderboardUser;
  session: LeaderboardSession;
};

export type RankedLeaderboardEntry = {
  id: string;
  rank: number;
  userId: string;
  username: string;
  mode: string;
  score: number;
  accuracy: number;
  totalTimeMs: number | null;
  deckSize: number;
};

export async function getLeaderboardRankings() {
  const entries = await getPrisma().leaderboardEntry.findMany({
    where: {
      session: {
        status: "COMPLETED",
        isValidRun: true
      }
    },
    include: {
      user: { include: { profile: true } },
      session: {
        select: {
          deck: true,
          deckSize: true,
          generatedDeck: true,
          questionPositions: true
        }
      }
    },
    orderBy: [
      { score: "desc" },
      { accuracy: "desc" },
      { totalTimeMs: { sort: "asc", nulls: "last" } },
      { createdAt: "asc" }
    ]
  });

  const bestEntryByUser = new Map<string, LeaderboardEntryRecord>();

  for (const entry of entries) {
    if (!bestEntryByUser.has(entry.userId)) {
      bestEntryByUser.set(entry.userId, entry);
    }
  }

  return Array.from(bestEntryByUser.values()).map((entry, index) => ({
    id: entry.id,
    rank: index + 1,
    userId: entry.userId,
    username: entry.user.profile?.displayName ?? entry.user.username,
    mode: entry.mode,
    score: entry.score,
    accuracy: entry.accuracy,
    totalTimeMs: entry.totalTimeMs,
    deckSize: getLeaderboardDeckSize(entry.session)
  }));
}

export async function getLeaderboardPreview(userId: string) {
  const rankings = await getLeaderboardRankings();

  return {
    topEntries: rankings.slice(0, 3),
    currentUserEntry: rankings.find((entry) => entry.userId === userId) ?? null
  };
}

function getLeaderboardDeckSize(session: LeaderboardSession) {
  if (Array.isArray(session.questionPositions) && session.questionPositions.length > 0) {
    return session.questionPositions.length;
  }

  if (Array.isArray(session.generatedDeck) && session.generatedDeck.length > 0) {
    return session.generatedDeck.length;
  }

  if (typeof session.deckSize === "number" && session.deckSize > 0) {
    return session.deckSize;
  }

  if (Array.isArray(session.deck) && session.deck.length > 0) {
    return session.deck.length;
  }

  return 52;
}
