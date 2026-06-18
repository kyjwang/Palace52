# Palace52

Palace52 is a full-stack memory-training web app for learning to memorize a full deck of cards with the memory palace technique. It is designed as a portfolio-grade Next.js project with real auth, database models, server actions, analytics, spaced repetition, and leaderboard foundations.

## Features

- Account creation and protected app routes with Clerk
- Memory palace builder with ordered locations
- Personal image mapping for all 52 cards using person/action/object and custom prompts
- Shuffled deck training with study and recall phases
- Position-level scoring, mistake classification, and feedback
- Session history with score, accuracy, timing, and card-level mistakes
- Weak-card review queue using spaced repetition
- Dashboard metrics: best score, average accuracy, completed sessions, due reviews, weakest cards, and trends
- Leaderboard ranked by score, then speed

## Tech Stack

- Next.js App Router, React, TypeScript
- Tailwind CSS
- PostgreSQL and Prisma
- Clerk authentication
- Vercel deployment

No Docker or Kubernetes are required.

## Recommended Folder Structure

```txt
src/
  app/
    (app)/                 Protected product routes
    (auth)/                Clerk sign-in and sign-up pages
    actions/               Server actions for mutations
    globals.css            Tailwind and product theme
    layout.tsx             Root Clerk provider and fonts
    page.tsx               Public landing page
  components/
    app/                   App shell, charts, card display pieces
    training/              Client training cockpit
    ui/                    Small reusable UI primitives
  lib/
    auth.ts                Clerk-to-database user sync
    cards.ts               Deck definitions and shuffle
    dashboard.ts           Aggregate metrics
    defaults.ts            Starter palace and card images
    prisma.ts              Lazy Prisma singleton
    scoring.ts             Recall scoring and mistake analysis
    spaced-repetition.ts   Review scheduler
prisma/
  schema.prisma            PostgreSQL schema and Prisma models
docs/
  architecture.md          Build and deployment notes
```

## Database Schema

Core Prisma models live in `prisma/schema.prisma`:

- `User`: local profile keyed to `clerkUserId`
- `Palace`: a user-owned memory palace
- `PalaceLocation`: ordered route points inside a palace
- `CardImage`: one personal image system entry per user/card
- `TrainingSession`: generated deck, recall payload, score, timing, and status
- `SessionCardResult`: card-by-card scoring output and feedback
- `ReviewCard`: spaced repetition state for weak cards
- `LeaderboardEntry`: public ranked score rows linked to completed sessions

Enums cover card `Suit`, `Rank`, `SessionMode`, `SessionStatus`, and `MistakeType`.

## App Routes

- `/` public landing page
- `/sign-in` and `/sign-up` Clerk auth screens
- `/dashboard` polished progress overview
- `/palaces` palace and location builder
- `/cards` 52-card image mapping system
- `/training` deck memorization and recall mode
- `/sessions` session history and mistake review
- `/reviews` spaced repetition queue
- `/leaderboard` ranked completed sessions

## Server Actions

- `ensureStarterContent`: creates a starter palace and starter 52-card image system
- `createPalace`, `addPalaceLocation`: palace builder mutations
- `upsertCardImage`: card-image mapping updates
- `createTrainingSession`: generates and persists a shuffled deck
- `completeTrainingSession`: scores recall, stores card results, updates reviews, and writes leaderboard entry
- `gradeReviewCard`: advances spaced repetition state after a review

## Scoring Logic

`src/lib/scoring.ts` compares the expected deck against recalled card codes by position:

- correct card in correct position: `CORRECT`
- blank answer: `MISSING`
- card exists elsewhere in the recalled deck: `WRONG_POSITION`
- different card in the slot: `WRONG_CARD`

The result includes score, accuracy, per-card feedback, missed cards, misplaced cards, and correct streaks.

## Spaced Repetition Logic

`src/lib/spaced-repetition.ts` uses an SM-2-inspired scheduler:

- forgotten cards reset to a 1-day interval and add a lapse
- hard or misplaced recalls keep the card close in the queue
- easy recalls grow the interval by ease factor
- ease factor is bounded so difficult cards do not disappear too quickly

## Dashboard and Leaderboard Design

The dashboard is designed for repeated training:

- top metric strip for score, accuracy, sessions, and due reviews
- trend chart for improvement history
- weakest-card list from accumulated card-level mistakes
- direct entry into training

The leaderboard stores one row per completed session and ranks by score first, then faster total time.

## Local Setup

This project uses pnpm. On a normal machine with Node installed:

```bash
pnpm install
cp .env.example .env.local
pnpm prisma:migrate
pnpm dev
```

Fill `.env.local` with:

- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- Clerk redirect URL variables from `.env.example`

Use [docs/local-testing.md](/Users/kevin/Desktop/Palace52/docs/local-testing.md) as the pre-deployment checklist. The app should be tested locally through sign-up, palace setup, card image edits, training, scoring, reviews, history, and leaderboard before any Vercel work.

## Vercel Deployment

1. Create a PostgreSQL database with Neon, Supabase, or a Vercel Marketplace Postgres provider.
2. Create a Clerk app and configure allowed redirect URLs for your Vercel domain.
3. Add all environment variables in Vercel Project Settings.
4. Import the GitHub repository into Vercel.
5. Keep the build command as `pnpm build`.
6. Run Prisma migrations against production before first launch.
