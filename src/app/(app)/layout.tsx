import type { ReactNode } from "react";
import { AppShell } from "@/components/app/app-shell";
import { requireCurrentUser } from "@/lib/auth";
import { hasRequiredAppConfig } from "@/lib/runtime-config";

export default async function AppLayout({ children }: { children: ReactNode }) {
  if (!hasRequiredAppConfig()) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow)]">
          <p className="text-sm font-medium text-[var(--accent)]">Local setup required</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Configure the database to use protected app routes</h1>
          <p className="mt-3 text-[var(--muted)]">
            Palace52 can render public pages, but private routes need a database connection before they can store users,
            profiles, PAO cards, routes, sessions, and review data.
          </p>
          <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-md bg-[var(--card-muted)] p-3">
              <p className="font-semibold">Database</p>
              <p className="mt-1 font-mono text-xs text-[var(--muted)]">DATABASE_URL</p>
            </div>
            <div className="rounded-md bg-[var(--card-muted)] p-3">
              <p className="font-semibold">Auth secret</p>
              <p className="mt-1 font-mono text-xs text-[var(--muted)]">AUTH_SECRET</p>
            </div>
          </div>
          <p className="mt-5 text-sm text-[var(--muted)]">
            Copy `.env.example` to `.env.local`, fill development values, run the Prisma migration, then reload.
          </p>
        </div>
      </AppShell>
    );
  }

  const user = await requireCurrentUser();

  return (
    <AppShell
      user={{
        username: user.username,
        displayName: user.profile?.displayName,
        avatarColor: user.profile?.avatarColor
      }}
    >
      {children}
    </AppShell>
  );
}
