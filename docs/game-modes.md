# Palace52 Game Modes

This document describes the Play mode architecture added for the Palace52 memory training app. The goal is to keep the existing Classic game intact while adding focused practice modes that reuse the same deck, PAO, palace route, scoring, session history, and leaderboard concepts.

## Modes

### Classic

Classic is the default mode and maps to `FULL_DECK` in the database for backwards compatibility. The player chooses a palace and card count, memorizes a shuffled deck, then recalls cards in order.

Tracked result data:
- Generated deck
- User recall
- Accuracy
- Memorization time
- Recall time
- Total time
- Position-level mistakes

### Speed Mode

Speed mode is a timed deck run. It uses the same memorize and recall loop as Classic, but result validity depends on the selected difficulty.

Difficulty gates:
- Relaxed: any accuracy is a valid run
- Competitive: requires 90%+ accuracy
- Elite: requires 100% accuracy

Tracked result data:
- Memorization time
- Recall time
- Total time
- Accuracy
- Valid or invalid run
- Local personal best for valid runs
- Session history and leaderboard entry for valid saved runs

### Suit Focus Mode

Suit Focus trains a single suit: Hearts, Spades, Diamonds, or Clubs. The player chooses 5, 10, or 13 cards from the selected suit.

Tracked result data:
- Selected suit
- Deck size
- Suit-specific accuracy
- Weak ranks from missed cards
- Session history feedback

### PAO Flashcard Mode

PAO Flashcards train card associations without the full memorize phase. Variants:
- Card to PAO
- PAO to Card
- Missing Part
- Rapid Review

Tracked result data:
- Correct prompts
- Wrong prompts
- Hard prompts
- Response time
- Weak cards
- User answers

### Random Position Mode

Random Position mode asks questions after memorization, such as "What was card #17?". The player studies a shuffled deck and then answers randomly selected position prompts.

Tracked result data:
- Question positions
- User answers
- Correct positions
- Wrong positions
- Response time
- Weak loci when route data exists

## Code Architecture

### Pure Mode Engine

`src/lib/play-modes.ts` contains mode-level logic that is independent of React:
- `prepareModeDeck` filters and sizes decks for mode setup.
- `buildPlaySessionResult` scores Classic, Speed, Suit Focus, and Random Position runs.
- `gradePaoAnswer` grades PAO flashcard prompts.
- `toTrainingSessionPayload` shapes a completed client result for persistence.

The pure logic is covered by `src/lib/play-modes.test.mjs` using Node's built-in test runner.

### Play UI

`src/components/play/play-game.tsx` is now a mode-driven client state machine:
- `setup`: choose mode and mode-specific options
- `memorize`: focused card study screen for deck modes
- `recall`: keyboard-friendly recall for deck and position modes
- `flashcards`: PAO association prompts
- `score`: visual feedback, mistakes, weak ranks, weak loci, PB state, save state

Classic remains the default selected mode.

### Persistence

`prisma/schema.prisma` extends `TrainingSession` with fields for richer play mode results:
- `mode`
- `deckSize`
- `selectedSuit`
- `difficulty`
- `generatedDeck`
- `userRecall`
- `questionPositions`
- `userAnswers`
- `accuracy`
- `memorizationMs`
- `recallMs`
- `totalTimeMs`
- `mistakes`
- `isValidRun`
- `isPersonalBest`

`src/app/actions/sessions.ts` adds `savePlaySessionResult`, which creates a completed training session, writes card result rows when possible, and creates a leaderboard row for valid runs.

### History

`src/app/(app)/sessions/page.tsx` now renders mode labels, metadata, personal-best badges, invalid-run labels, and JSON mistake feedback when a mode stores richer result data.

## Next Improvements

- Move the large Play component into smaller mode components once the UX stabilizes.
- Store personal bests server-side instead of relying on local storage for the Play page badge.
- Add authenticated route data to `/play` so Random Position weak loci can use the user's real palaces.
- Add richer PAO answer matching, including accepted aliases and partial matching.
- Add browser-level tests for the full mode flows after a test framework is chosen.
