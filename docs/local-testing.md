# Local Testing Guide

Use this guide before any deployment work. The goal is to prove the full product loop locally: auth, database, palace setup, card image mapping, training, scoring, reviews, history, and leaderboard.

## 1. Install Local Tools

Required:

- Node.js 22 or newer
- pnpm
- PostgreSQL, either local or hosted development database

No Docker or Kubernetes are needed.

If you use Homebrew PostgreSQL on macOS:

```bash
brew install postgresql@16
brew services start postgresql@16
createdb palace52
```

Example local URL:

```env
DATABASE_URL="postgresql://kevin@localhost:5432/palace52"
```

If you do not want PostgreSQL installed locally, use a free development database from Neon or Supabase and put that connection string in `.env.local`.

## 2. Configure Clerk For Localhost

Create a Clerk application for development and add:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"
```

In Clerk, allow `http://localhost:3000` as a local development origin.

## 3. Install And Migrate

```bash
pnpm install
cp .env.example .env.local
pnpm prisma:migrate
pnpm dev
```

Open:

```txt
http://localhost:3000
```

Health check:

```txt
http://localhost:3000/api/health
```

The health route should return `ok: true` when Clerk keys and the database are configured.

## 4. Manual Product Test Checklist

- Sign up with a test account.
- Land on `/dashboard`; starter content should be created automatically.
- Open `/palaces`; confirm the Home Palace has ordered locations.
- Add a new location and refresh; the location should persist.
- Open `/cards`; edit at least one card image and save.
- Open `/training`; generate a half-deck session first for faster testing.
- Move from study to recall, enter several cards, and score the session.
- Confirm the result page shows score, accuracy, and mistake feedback.
- Open `/sessions`; confirm the completed session appears.
- Open `/reviews`; confirm wrong cards appear in the review queue.
- Grade a review card as Easy; confirm its due date/interval changes.
- Open `/leaderboard`; confirm the completed session appears.
- Re-run a full-deck session and confirm dashboard stats update.

## 5. Verification Commands

Run these before calling a local milestone complete:

```bash
pnpm prisma:generate
pnpm typecheck
pnpm lint
pnpm build
```

Or run the combined check:

```bash
pnpm verify
```

`pnpm build` may fetch Google font assets through `next/font/google`, so run it with normal network access.

## 6. Completion Bar For Local Testing

Do not deploy until these are true:

- `pnpm verify` passes.
- `/api/health` returns `ok: true`.
- A new account can complete onboarding.
- A user can create/edit palace locations and card images.
- A user can complete at least one half-deck and one full-deck session.
- Mistakes create review cards.
- Dashboard, session history, reviews, and leaderboard all reflect the completed sessions.
