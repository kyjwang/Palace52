export type PlayMode = "FULL_DECK" | "SPEED" | "SUIT_FOCUS" | "PAO_FLASHCARD" | "RANDOM_POSITION";
export type SpeedDifficulty = "Relaxed" | "Competitive" | "Elite";
export type SuitName = "CLUBS" | "DIAMONDS" | "HEARTS" | "SPADES";
export type PaoVariant = "CARD_TO_PAO" | "PAO_TO_CARD" | "MISSING_PART" | "RAPID_REVIEW";
export type PaoPart = "person" | "action" | "object";

export type ModeCard = {
  code: string;
  rank: string;
  suit: string;
  label: string;
  shortLabel: string;
  color: "red" | "black";
};

export type ModePaoEntry = {
  card: ModeCard;
  location: string;
  person: string;
  action: string;
  object: string;
  image: string;
};

export type PlayMistake = {
  position: number;
  expected: string;
  answer: string;
  type: "WRONG_CARD" | "WRONG_POSITION" | "MISSING";
  feedback: string;
};

export type PaoFlashcardGrade = {
  variant: PaoVariant;
  cardCode: string;
  answer: string;
  expected: string;
  isCorrect: boolean;
  outcome: "correct" | "wrong" | "hard";
  responseTime: number;
};

export type PlaySessionResult = {
  mode: PlayMode;
  deckSize: number;
  selectedSuit?: SuitName;
  difficulty?: SpeedDifficulty;
  generatedDeck: string[];
  userRecall: string[];
  questionPositions: number[];
  userAnswers: string[];
  accuracy: number;
  memorizationTime: number;
  recallTime: number;
  totalTime: number;
  mistakes: PlayMistake[];
  isValidRun: boolean;
  isPersonalBest: boolean;
  weakRanks: string[];
  correctPositions: number;
  wrongPositions: number[];
  weakLoci: string[];
};

export type BuildPlaySessionInput = {
  mode: PlayMode;
  deck: ModeCard[];
  userRecall?: string[];
  questionPositions?: number[];
  userAnswers?: string[];
  selectedSuit?: SuitName;
  difficulty?: SpeedDifficulty;
  routeLocations?: string[];
  memorizationTime: number;
  recallTime: number;
  personalBestTotalTime?: number;
};

export function prepareModeDeck<T extends ModePaoEntry>({
  mode,
  sourceDeck,
  deckSize,
  selectedSuit
}: {
  mode: PlayMode;
  sourceDeck: T[];
  deckSize: number;
  selectedSuit?: SuitName;
}) {
  const filtered = mode === "SUIT_FOCUS" && selectedSuit ? sourceDeck.filter((entry) => entry.card.suit === selectedSuit) : sourceDeck;
  return filtered.slice(0, deckSize);
}

export function buildPlaySessionResult(input: BuildPlaySessionInput): PlaySessionResult {
  const generatedDeck = input.deck.map((card) => card.code);
  const questionPositions = input.questionPositions ?? generatedDeck.map((_, index) => index + 1);
  const rawAnswers = input.userAnswers ?? input.userRecall ?? [];
  const userRecall = input.userRecall ?? rawAnswers;
  const userAnswers = input.userAnswers ?? userRecall;
  const totalTime = input.memorizationTime + input.recallTime;

  const checks =
    input.mode === "RANDOM_POSITION"
      ? questionPositions.map((position, answerIndex) => {
          const expectedCard = input.deck[position - 1];
          return {
            position,
            expected: expectedCard,
            answer: normalizeCardCode(userAnswers[answerIndex] ?? "")
          };
        })
      : input.deck.map((expected, index) => ({
          position: index + 1,
          expected,
          answer: normalizeCardCode(userRecall[index] ?? "")
        }));

  const mistakes = checks
    .filter((check) => normalizeCardCode(check.expected?.code ?? "") !== check.answer)
    .map((check) => buildMistake(check.position, check.expected, check.answer, generatedDeck));
  const correctCount = checks.length - mistakes.length;
  const accuracy = checks.length === 0 ? 0 : correctCount / checks.length;
  const isValidRun = getRunValidity(input.mode, input.difficulty, accuracy);
  const weakRanks = mistakes.map((mistake) => input.deck[mistake.position - 1]?.rank).filter(isPresent);
  const wrongPositions = input.mode === "RANDOM_POSITION" ? mistakes.map((mistake) => mistake.position) : [];
  const weakLoci =
    input.mode === "RANDOM_POSITION"
      ? wrongPositions.map((position) => input.routeLocations?.[position - 1]).filter(isPresent)
      : [];

  return {
    mode: input.mode,
    deckSize: input.deck.length,
    selectedSuit: input.selectedSuit,
    difficulty: input.difficulty,
    generatedDeck,
    userRecall,
    questionPositions,
    userAnswers,
    accuracy,
    memorizationTime: input.memorizationTime,
    recallTime: input.recallTime,
    totalTime,
    mistakes,
    isValidRun,
    isPersonalBest: isValidRun && (input.personalBestTotalTime === undefined || totalTime < input.personalBestTotalTime),
    weakRanks: Array.from(new Set(weakRanks)),
    correctPositions: input.mode === "RANDOM_POSITION" ? correctCount : 0,
    wrongPositions,
    weakLoci
  };
}

export function gradePaoAnswer({
  variant,
  entry,
  answer,
  responseTime,
  missingPart,
  markedHard = false
}: {
  variant: PaoVariant;
  entry: ModePaoEntry;
  answer: string;
  responseTime: number;
  missingPart?: PaoPart;
  markedHard?: boolean;
}): PaoFlashcardGrade {
  const expected = getPaoExpectedAnswer(variant, entry, missingPart);
  const isCorrect = normalizeText(answer) === normalizeText(expected);

  return {
    variant,
    cardCode: entry.card.code,
    answer,
    expected,
    isCorrect,
    outcome: markedHard ? "hard" : isCorrect ? "correct" : "wrong",
    responseTime
  };
}

export function getPaoExpectedAnswer(variant: PaoVariant, entry: ModePaoEntry, missingPart?: PaoPart) {
  if (variant === "PAO_TO_CARD") return entry.card.code;
  if (variant === "MISSING_PART") return missingPart ? entry[missingPart] : entry.object;
  return `${entry.person} ${entry.action} ${entry.object}`;
}

export function toTrainingSessionPayload(result: PlaySessionResult) {
  return {
    mode: result.mode,
    deckSize: result.deckSize,
    selectedSuit: result.selectedSuit,
    difficulty: result.difficulty,
    generatedDeck: result.generatedDeck,
    userRecall: result.userRecall,
    questionPositions: result.questionPositions,
    userAnswers: result.userAnswers,
    accuracy: result.accuracy,
    memorizationTime: result.memorizationTime,
    recallTime: result.recallTime,
    totalTime: result.totalTime,
    mistakes: result.mistakes,
    isValidRun: result.isValidRun,
    isPersonalBest: result.isPersonalBest
  };
}

export function normalizeCardCode(value: string) {
  const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const suit = cleaned.slice(-1);
  const rawRank = cleaned.slice(0, -1);
  const rank = rawRank === "T" ? "10" : rawRank;
  const validRanks = new Set(["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]);
  const validSuits = new Set(["H", "D", "C", "S"]);

  if (validRanks.has(rank) && validSuits.has(suit)) return `${rank}${suit}`;
  return cleaned;
}

function buildMistake(position: number, expected: ModeCard | undefined, answer: string, generatedDeck: string[]): PlayMistake {
  const type = answer ? (generatedDeck.includes(answer) ? "WRONG_POSITION" : "WRONG_CARD") : "MISSING";
  const expectedLabel = expected?.label ?? `Position ${position}`;

  return {
    position,
    expected: expected?.code ?? "",
    answer,
    type,
    feedback:
      type === "MISSING"
        ? `${expectedLabel} was missing at position ${position}.`
        : type === "WRONG_POSITION"
          ? `${expectedLabel} was linked to the wrong position.`
          : `Expected ${expectedLabel}, answered ${answer || "nothing"}.`
  };
}

function getRunValidity(mode: PlayMode, difficulty: SpeedDifficulty | undefined, accuracy: number) {
  if (mode !== "SPEED") return true;
  if (difficulty === "Elite") return accuracy === 1;
  if (difficulty === "Competitive") return accuracy >= 0.9;
  return true;
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function isPresent<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}
