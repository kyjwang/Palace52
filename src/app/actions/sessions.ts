"use server";

import { revalidatePath } from "next/cache";
import { MistakeType, SessionMode, Suit } from "@prisma/client";
import { z } from "zod";
import { requireCurrentUser } from "@/lib/auth";
import { fullDeck, shuffleDeck, type CardCode } from "@/lib/cards";
import { getPrisma } from "@/lib/prisma";
import { scoreRecall } from "@/lib/scoring";
import { gradeFromRecall, nextReviewState } from "@/lib/spaced-repetition";

const createSessionSchema = z.object({
  palaceId: z.string().optional(),
  mode: z.nativeEnum(SessionMode).default("FULL_DECK")
});

const completeSessionSchema = z.object({
  sessionId: z.string().min(1),
  recalledCodes: z.array(z.string()).max(52),
  memorizationMs: z.number().int().nonnegative(),
  recallMs: z.number().int().nonnegative()
});

const playMistakeSchema = z.object({
  position: z.number().int().positive(),
  expected: z.string(),
  answer: z.string(),
  type: z.enum(["WRONG_CARD", "WRONG_POSITION", "MISSING"]),
  feedback: z.string()
});

const roundedMsSchema = z.number().nonnegative().transform((value) => Math.round(value));

const savePlaySessionSchema = z.object({
  mode: z.nativeEnum(SessionMode),
  deckSize: z.number().int().positive().max(52),
  selectedSuit: z.nativeEnum(Suit).optional(),
  difficulty: z.string().optional(),
  generatedDeck: z.array(z.string()).max(52),
  userRecall: z.array(z.string()).max(52).default([]),
  questionPositions: z.array(z.number().int().positive()).max(52).default([]),
  userAnswers: z.array(z.string()).max(52).default([]),
  accuracy: z.number().min(0).max(1),
  memorizationTime: roundedMsSchema,
  recallTime: roundedMsSchema,
  totalTime: roundedMsSchema,
  mistakes: z.array(playMistakeSchema).max(52),
  isValidRun: z.boolean(),
  isPersonalBest: z.boolean()
});

export async function createTrainingSession(input: { palaceId?: string; mode?: SessionMode }) {
  const user = await requireCurrentUser();
  const parsed = createSessionSchema.parse(input);
  const deck = parsed.mode === "HALF_DECK" ? shuffleDeck().slice(0, 26) : shuffleDeck();

  const session = await getPrisma().trainingSession.create({
    data: {
      userId: user.id,
      palaceId: parsed.palaceId,
      mode: parsed.mode,
      deck: deck.map((card) => card.code)
    }
  });

  revalidatePath("/training");
  return { sessionId: session.id, deck };
}

export async function completeTrainingSession(input: {
  sessionId: string;
  recalledCodes: CardCode[];
  memorizationMs: number;
  recallMs: number;
}) {
  const user = await requireCurrentUser();
  const parsed = completeSessionSchema.parse(input);
  const db = getPrisma();

  const session = await db.trainingSession.findFirst({
    where: { id: parsed.sessionId, userId: user.id }
  });

  if (!session) throw new Error("Session not found");

  const expectedCodes = z.array(z.string()).parse(session.deck);
  const expectedDeck = expectedCodes
    .map((code) => fullDeck.find((card) => card.code === code))
    .filter((card): card is (typeof fullDeck)[number] => Boolean(card));
  const summary = scoreRecall(expectedDeck, parsed.recalledCodes);
  const now = new Date();

  await db.$transaction(async (tx) => {
    await tx.sessionCardResult.deleteMany({ where: { sessionId: session.id } });

    await tx.trainingSession.update({
      where: { id: session.id },
      data: {
        status: "COMPLETED",
        recall: parsed.recalledCodes,
        score: summary.score,
        accuracy: summary.accuracy,
        memorizationMs: parsed.memorizationMs,
        recallMs: parsed.recallMs,
        totalTimeMs: parsed.memorizationMs + parsed.recallMs,
        completedAt: now
      }
    });

    await tx.sessionCardResult.createMany({
      data: summary.results.map((result) => ({
        sessionId: session.id,
        expectedRank: result.expected.rank,
        expectedSuit: result.expected.suit,
        recalledRank: result.recalled?.rank,
        recalledSuit: result.recalled?.suit,
        expectedIndex: result.expectedIndex,
        recalledIndex: result.recalledIndex,
        isCorrect: result.isCorrect,
        mistakeType: result.mistakeType,
        feedback: result.feedback
      }))
    });

    for (const result of summary.results) {
      if (result.isCorrect) continue;

      const existing = await tx.reviewCard.findUnique({
        where: {
          userId_rank_suit: {
            userId: user.id,
            rank: result.expected.rank,
            suit: result.expected.suit
          }
        }
      });

      const next = nextReviewState(
        existing,
        gradeFromRecall(false, result.mistakeType === "WRONG_POSITION"),
        now
      );

      await tx.reviewCard.upsert({
        where: {
          userId_rank_suit: {
            userId: user.id,
            rank: result.expected.rank,
            suit: result.expected.suit
          }
        },
        update: next,
        create: {
          userId: user.id,
          rank: result.expected.rank,
          suit: result.expected.suit,
          ...next
        }
      });
    }

    await tx.leaderboardEntry.upsert({
      where: { sessionId: session.id },
      update: {
        mode: session.mode,
        score: summary.score,
        accuracy: summary.accuracy,
        memorizationMs: parsed.memorizationMs,
        recallMs: parsed.recallMs,
        totalTimeMs: parsed.memorizationMs + parsed.recallMs
      },
      create: {
        userId: user.id,
        sessionId: session.id,
        mode: session.mode,
        score: summary.score,
        accuracy: summary.accuracy,
        memorizationMs: parsed.memorizationMs,
        recallMs: parsed.recallMs,
        totalTimeMs: parsed.memorizationMs + parsed.recallMs
      }
    });
  });

  revalidatePath("/dashboard");
  revalidatePath("/sessions");
  revalidatePath("/reviews");
  revalidatePath("/leaderboard");

  return summary;
}

export async function savePlaySessionResult(input: z.input<typeof savePlaySessionSchema>) {
  const user = await requireCurrentUser();
  const parsed = savePlaySessionSchema.parse(input);
  const db = getPrisma();
  const now = new Date();
  const answerCount = parsed.questionPositions.length || parsed.generatedDeck.length || parsed.deckSize;
  const score = Math.max(0, answerCount - parsed.mistakes.length);

  const session = await db.$transaction(async (tx) => {
    const created = await tx.trainingSession.create({
      data: {
        userId: user.id,
        mode: parsed.mode,
        status: "COMPLETED",
        deck: parsed.generatedDeck,
        deckSize: parsed.deckSize,
        selectedSuit: parsed.selectedSuit,
        difficulty: parsed.difficulty,
        generatedDeck: parsed.generatedDeck,
        userRecall: parsed.userRecall,
        questionPositions: parsed.questionPositions,
        userAnswers: parsed.userAnswers,
        recall: parsed.userRecall.length > 0 ? parsed.userRecall : parsed.userAnswers,
        score,
        accuracy: parsed.accuracy,
        memorizationMs: parsed.memorizationTime,
        recallMs: parsed.recallTime,
        totalTimeMs: parsed.totalTime,
        mistakes: parsed.mistakes,
        isValidRun: parsed.isValidRun,
        isPersonalBest: parsed.isPersonalBest,
        completedAt: now
      }
    });

    const cardResults = parsed.generatedDeck
      .map((code, index) => {
        const expected = fullDeck.find((card) => card.code === code);
        if (!expected) return null;
        const recalledCode = parsed.userRecall[index] || parsed.userAnswers[index] || "";
        const recalled = fullDeck.find((card) => card.code === recalledCode);
        const mistake = parsed.mistakes.find((item) => item.position === index + 1);

        return {
          sessionId: created.id,
          expectedRank: expected.rank,
          expectedSuit: expected.suit,
          recalledRank: recalled?.rank,
          recalledSuit: recalled?.suit,
          expectedIndex: index,
          recalledIndex: recalled ? parsed.generatedDeck.indexOf(recalled.code) : undefined,
          isCorrect: !mistake && Boolean(recalledCode),
          mistakeType: (mistake?.type ?? "CORRECT") as MistakeType,
          feedback: mistake?.feedback ?? "Correct image and location."
        };
      })
      .filter((result): result is NonNullable<typeof result> => Boolean(result));

    if (cardResults.length > 0) {
      await tx.sessionCardResult.createMany({ data: cardResults });
    }

    if (parsed.isValidRun) {
      await tx.leaderboardEntry.create({
        data: {
          userId: user.id,
          sessionId: created.id,
          mode: parsed.mode,
          score,
          accuracy: parsed.accuracy,
          memorizationMs: parsed.memorizationTime,
          recallMs: parsed.recallTime,
          totalTimeMs: parsed.totalTime
        }
      });
    }

    return created;
  });

  revalidatePath("/dashboard");
  revalidatePath("/sessions");
  revalidatePath("/reviews");
  revalidatePath("/leaderboard");

  return { sessionId: session.id };
}

export async function clearTrainingHistory() {
  const user = await requireCurrentUser();

  await getPrisma().trainingSession.deleteMany({
    where: {
      userId: user.id,
      status: "COMPLETED"
    }
  });

  revalidatePath("/profile");
  revalidatePath("/sessions");
  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");
}
