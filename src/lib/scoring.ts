import type { MistakeType } from "@prisma/client";
import { cardFromCode, type PlayingCard } from "@/lib/cards";

export type RecallResult = {
  expected: PlayingCard;
  recalled?: PlayingCard;
  expectedIndex: number;
  recalledIndex?: number;
  isCorrect: boolean;
  mistakeType: MistakeType;
  feedback: string;
};

export type ScoreSummary = {
  score: number;
  accuracy: number;
  results: RecallResult[];
  correctRuns: number[];
  missedCards: PlayingCard[];
  misplacedCards: PlayingCard[];
};

export function scoreRecall(expectedDeck: PlayingCard[], recalledCodes: string[]): ScoreSummary {
  const recalledCards = recalledCodes.map((code) => cardFromCode(code));
  const recalledIndexByCode = new Map<string, number>();
  recalledCards.forEach((card, index) => {
    if (card) recalledIndexByCode.set(card.code, index);
  });

  const results = expectedDeck.map((expected, expectedIndex) => {
    const recalled = recalledCards[expectedIndex];
    const recalledIndex = recalledIndexByCode.get(expected.code);
    const isCorrect = recalled?.code === expected.code;
    const mistakeType = getMistakeType(expected.code, recalled?.code, recalledIndex);

    return {
      expected,
      recalled,
      expectedIndex,
      recalledIndex,
      isCorrect,
      mistakeType,
      feedback: getFeedback(expected, recalled, expectedIndex, recalledIndex, mistakeType)
    };
  });

  const score = results.filter((result) => result.isCorrect).length;
  const correctRuns = getCorrectRuns(results);

  return {
    score,
    accuracy: score / expectedDeck.length,
    results,
    correctRuns,
    missedCards: results.filter((result) => result.mistakeType === "MISSING").map((result) => result.expected),
    misplacedCards: results.filter((result) => result.mistakeType === "WRONG_POSITION").map((result) => result.expected)
  };
}

function getMistakeType(expectedCode: string, recalledCode: string | undefined, recalledIndex?: number): MistakeType {
  if (expectedCode === recalledCode) return "CORRECT";
  if (!recalledCode) return "MISSING";
  if (recalledIndex !== undefined) return "WRONG_POSITION";
  return "WRONG_CARD";
}

function getFeedback(
  expected: PlayingCard,
  recalled: PlayingCard | undefined,
  expectedIndex: number,
  recalledIndex: number | undefined,
  mistakeType: MistakeType
) {
  if (mistakeType === "CORRECT") return "Correct image and location.";
  if (mistakeType === "MISSING") return `${expected.label} was missing at position ${expectedIndex + 1}.`;
  if (mistakeType === "WRONG_POSITION" && recalledIndex !== undefined) {
    return `${expected.label} appeared at position ${recalledIndex + 1}; review the palace link for location ${expectedIndex + 1}.`;
  }
  return `Expected ${expected.label}, recalled ${recalled?.label ?? "nothing"}.`;
}

function getCorrectRuns(results: RecallResult[]) {
  const runs: number[] = [];
  let current = 0;

  for (const result of results) {
    if (result.isCorrect) {
      current += 1;
    } else if (current > 0) {
      runs.push(current);
      current = 0;
    }
  }

  if (current > 0) runs.push(current);
  return runs;
}
