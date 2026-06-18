# Custom Credentials Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Clerk with username/password authentication for the Palace52 MVP.

**Architecture:** Use Auth.js Credentials with JWT sessions, Prisma for users/profiles, bcryptjs for password hashing, and zod for validation. Keep existing Palace52 ownership fields and make `requireCurrentUser()` the single server-side gate for user-owned reads and writes.

**Tech Stack:** Next.js App Router, Auth.js/NextAuth, Prisma, PostgreSQL, bcryptjs, zod, Tailwind.

---

### Task 1: Schema And Dependencies

**Files:**
- Modify: `package.json`
- Modify: `prisma/schema.prisma`
- Modify: `src/lib/prisma.ts`

- [ ] Add `next-auth` and `bcryptjs`.
- [ ] Replace Clerk-only user fields with `username` and `passwordHash`.
- [ ] Add `Profile` relation with public profile fields.
- [ ] Keep all existing user-owned Palace52 relations on `User`.

### Task 2: Auth Core

**Files:**
- Create: `src/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/types/next-auth.d.ts`
- Modify: `src/lib/auth.ts`
- Modify: `src/proxy.ts`

- [ ] Configure Credentials provider with generic login errors.
- [ ] Compare password with bcrypt.
- [ ] Store only `id` and `username` in JWT/session.
- [ ] Protect app routes through Auth.js middleware.

### Task 3: Registration, Login, Logout

**Files:**
- Create: `src/app/actions/auth-actions.ts`
- Create: `src/components/app/logout-button.tsx`
- Create: `src/app/login/page.tsx`
- Create: `src/app/register/page.tsx`
- Modify: `src/components/app/app-shell.tsx`
- Modify: `src/components/app/public-shell.tsx`

- [ ] Validate and normalize username.
- [ ] Block reserved usernames.
- [ ] Hash passwords before storage.
- [ ] Redirect registration to `/login?registered=1`.
- [ ] Redirect successful login to `/dashboard`.

### Task 4: Profile And Settings

**Files:**
- Create: `src/app/profile/page.tsx`
- Create: `src/app/profile/edit/page.tsx`
- Modify: `src/app/(app)/settings/page.tsx`
- Modify: `src/app/(app)/dashboard/page.tsx`
- Delete/replace: Clerk sign-in and sign-up routes.

- [ ] Show username, profile fields, joined date, and training stats.
- [ ] Allow editing display name, bio, avatar color, and public visibility.
- [ ] Do not allow username editing.

### Task 5: Verification And Docs

**Files:**
- Create: `AUTH_FLOW.md`

- [ ] Run Prisma migration/generation.
- [ ] Run typecheck, lint, and build.
- [ ] Document auth flow, protected routes, and manual test steps.
