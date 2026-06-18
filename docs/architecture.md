# Palace52 Architecture

Palace52 is a full-stack Next.js App Router project for learning full-deck card memorization with memory palaces.

## Stack

- Next.js, React, TypeScript, Tailwind CSS
- Clerk for account creation, sign-in, protected routes, and user profile sync
- PostgreSQL with Prisma models in `prisma/schema.prisma`
- Server actions for product mutations: palaces, card images, sessions, and review grading
- Vercel deployment with a managed Postgres provider such as Neon, Supabase, or Vercel Marketplace Postgres

## Main Routes

- `/` marketing entry
- `/dashboard` progress overview, trends, weak cards, and due reviews
- `/palaces` memory palace and ordered location builder
- `/cards` 52-card personal image mapping system
- `/training` shuffled deck study, recall, scoring, and mistake analysis
- `/sessions` completed session history
- `/reviews` spaced repetition queue for weak cards
- `/leaderboard` public score table

## Domain Logic

- `src/lib/cards.ts` defines the 52-card deck and deterministic shuffle helper.
- `src/lib/scoring.ts` compares expected and recalled cards by position, marks missing cards, wrong cards, and misplaced cards, then returns score and feedback.
- `src/lib/spaced-repetition.ts` uses an SM-2-inspired scheduler. Wrong cards reset to a 1-day interval, misplaced cards count as hard recalls, and easy reviews extend the interval by ease factor.
- `src/app/actions/sessions.ts` persists completed sessions, card-level results, leaderboard entries, and review cards in one transaction.

## Deployment

1. Install dependencies with `npm install`.
2. Create a Clerk application and fill the Clerk keys from `.env.example`.
3. Provision a PostgreSQL database and set `DATABASE_URL`.
4. Run `npm run prisma:migrate` locally to create the schema.
5. Push to GitHub and import the project into Vercel.
6. Add the same environment variables in Vercel.
7. Use `npm run build` as the build command. It runs `prisma generate` before `next build`.
