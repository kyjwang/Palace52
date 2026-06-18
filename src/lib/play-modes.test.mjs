import assert from "node:assert/strict";
import test from "node:test";

const modes = await import("./play-modes.ts");

const deck = [
  { code: "AH", rank: "ACE", suit: "HEARTS", label: "Ace of Hearts", shortLabel: "A♥", color: "red" },
  { code: "2H", rank: "TWO", suit: "HEARTS", label: "Two of Hearts", shortLabel: "2♥", color: "red" },
  { code: "KS", rank: "KING", suit: "SPADES", label: "King of Spades", shortLabel: "K♠", color: "black" },
  { code: "QC", rank: "QUEEN", suit: "CLUBS", label: "Queen of Clubs", shortLabel: "Q♣", color: "black" }
];

const paoDeck = deck.map((card, index) => ({
  card,
  location: `Location ${index + 1}`,
  person: `Person ${index + 1}`,
  action: `Action ${index + 1}`,
  object: `Object ${index + 1}`,
  image: `Person ${index + 1} Action ${index + 1} Object ${index + 1}`
}));

test("speed mode validates competitive and elite accuracy thresholds", () => {
  const competitive = modes.buildPlaySessionResult({
    mode: "SPEED",
    deck,
    userRecall: ["AH", "2H", "KS", "wrong"],
    difficulty: "Competitive",
    memorizationTime: 9000,
    recallTime: 6000
  });
  const elite = modes.buildPlaySessionResult({
    mode: "SPEED",
    deck,
    userRecall: ["AH", "2H", "KS", "wrong"],
    difficulty: "Elite",
    memorizationTime: 9000,
    recallTime: 6000
  });

  assert.equal(competitive.accuracy, 0.75);
  assert.equal(competitive.isValidRun, false);
  assert.equal(elite.isValidRun, false);
  assert.equal(competitive.totalTime, 15000);
  assert.deepEqual(competitive.mistakes.map((mistake) => mistake.expected), ["QC"]);
});

test("suit focus filters selected cards and reports weak ranks", () => {
  const focused = modes.prepareModeDeck({
    mode: "SUIT_FOCUS",
    sourceDeck: paoDeck,
    deckSize: 2,
    selectedSuit: "HEARTS"
  });
  const result = modes.buildPlaySessionResult({
    mode: "SUIT_FOCUS",
    deck: focused.map((entry) => entry.card),
    userRecall: ["AH", "KS"],
    selectedSuit: "HEARTS",
    memorizationTime: 5000,
    recallTime: 3000
  });

  assert.deepEqual(focused.map((entry) => entry.card.code), ["AH", "2H"]);
  assert.deepEqual(result.weakRanks, ["TWO"]);
  assert.equal(result.mode, "SUIT_FOCUS");
});

test("pao flashcards grade card and missing-part prompts", () => {
  const cardPrompt = modes.gradePaoAnswer({
    variant: "CARD_TO_PAO",
    entry: paoDeck[0],
    answer: "Person 1 Action 1 Object 1",
    responseTime: 1200
  });
  const missingPrompt = modes.gradePaoAnswer({
    variant: "MISSING_PART",
    missingPart: "object",
    entry: paoDeck[1],
    answer: "Object 1",
    responseTime: 2400
  });

  assert.equal(cardPrompt.isCorrect, true);
  assert.equal(cardPrompt.outcome, "correct");
  assert.equal(missingPrompt.isCorrect, false);
  assert.equal(missingPrompt.outcome, "wrong");
});

test("random position mode scores asked positions and weak loci", () => {
  const result = modes.buildPlaySessionResult({
    mode: "RANDOM_POSITION",
    deck,
    questionPositions: [1, 3, 4],
    userAnswers: ["AH", "QC", "2H"],
    routeLocations: ["Door", "Mirror", "Sofa", "Sink"],
    memorizationTime: 7000,
    recallTime: 8000
  });

  assert.equal(result.correctPositions, 1);
  assert.deepEqual(result.wrongPositions, [3, 4]);
  assert.deepEqual(result.weakLoci, ["Sofa", "Sink"]);
  assert.equal(result.totalTime, 15000);
});

test("session payload stores mode metadata and generated deck", () => {
  const result = modes.buildPlaySessionResult({
    mode: "SPEED",
    deck,
    userRecall: ["AH", "2H", "KS", "QC"],
    difficulty: "Elite",
    memorizationTime: 1000,
    recallTime: 2000,
    personalBestTotalTime: 4000
  });
  const payload = modes.toTrainingSessionPayload(result);

  assert.equal(payload.mode, "SPEED");
  assert.equal(payload.deckSize, 4);
  assert.equal(payload.difficulty, "Elite");
  assert.deepEqual(payload.generatedDeck, ["AH", "2H", "KS", "QC"]);
  assert.equal(payload.isPersonalBest, true);
  assert.equal(payload.isValidRun, true);
});
