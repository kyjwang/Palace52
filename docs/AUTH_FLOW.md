# Palace52 Custom Auth Flow

Palace52 now uses custom username/password authentication for the MVP.

## Stack

- Next.js App Router
- Auth.js / NextAuth Credentials provider
- Prisma
- PostgreSQL
- bcryptjs
- zod

## Account Model

Users register with:

- `username`
- `password`
- `confirm password`

No email is required.

The `User` table stores:

- `id`
- `username`
- `passwordHash`
- timestamps
- user-owned Palace52 relations

The `Profile` table stores:

- `displayName`
- `bio`
- `avatarColor`
- `isPublic`

Plain text passwords are never stored. Login only compares the submitted password with the stored bcrypt hash.

## Registration

Registration lives at `/register`.

Validation rules:

- username is trimmed and lowercased
- username must be 3-20 characters
- username can only contain lowercase letters, numbers, and underscore
- reserved usernames are blocked: `admin`, `root`, `null`, `undefined`, `palace52`, `support`, `system`
- password must be at least 8 characters
- confirm password must match

Successful registration creates both `User` and `Profile`, then redirects to:

```txt
/login?registered=1
```

## Login

Login lives at `/login`.

Auth.js Credentials provider checks:

1. normalized username
2. submitted password
3. bcrypt comparison against `passwordHash`

Login errors are intentionally generic:

```txt
Invalid username or password.
```

This avoids revealing whether a username exists.

Successful login redirects to `/dashboard` unless a safe protected `callbackUrl` was provided.

## Session

Auth.js uses JWT session strategy.

The session exposes only:

- user id
- username

`passwordHash` is selected only inside the credentials authorization check and is never sent to the client.

## Logout

Logout uses Auth.js `signOut` through `logoutAction()` and redirects to `/`.

The authenticated app shell shows:

- profile link
- username/display name
- logout button

## Protected Routes

Protected by `src/proxy.ts`:

- `/dashboard`
- `/training`
- `/play`
- `/pao`
- `/cards`
- `/routes`
- `/palaces`
- `/my-memory-palace`
- `/build-palace`
- `/history`
- `/sessions`
- `/leaderboard`
- `/leaderboard-dashboard`
- `/reviews`
- `/profile`
- `/settings`

Compatibility aliases:

- `/pao` redirects to `/cards`
- `/routes` redirects to `/palaces`
- `/history` redirects to `/sessions`
- `/leaderboard-dashboard` redirects to `/dashboard`

## Ownership

Server-side data access uses `requireCurrentUser()`.

User-owned queries filter by the current session user's database id:

- PAO card images
- palaces and route locations
- training sessions
- review cards
- profile
- settings

## Local Setup

Configure:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/palace52?sslmode=require"
AUTH_SECRET="replace-with-a-long-random-secret"
```

Then run:

```bash
pnpm install
pnpm prisma:migrate
pnpm dev
```

Manual flow:

1. Visit `/register`.
2. Create a username/password account.
3. Confirm redirect to `/login?registered=1`.
4. Log in.
5. Confirm redirect to `/dashboard`.
6. Open `/profile`.
7. Edit profile at `/profile/edit`.
8. Log out from the app shell.
9. Visit `/dashboard` and confirm it redirects to `/login`.
