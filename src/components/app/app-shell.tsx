"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { BarChart3, Castle, GraduationCap, Hammer, Play } from "lucide-react";
import { LogoutButton } from "@/components/app/logout-button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/palaces", label: "My palace", icon: Castle },
  { href: "/training-academy", label: "Academy", icon: GraduationCap },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/play", label: "Play", icon: Play },
  { href: "/build-palace", label: "Build", icon: Hammer }
];

export function AppShell({
  children,
  user
}: {
  children: ReactNode;
  user?: {
    username: string;
    displayName?: string | null;
    avatarColor?: string | null;
  };
}) {
  const pathname = usePathname();
  const displayName = user?.displayName || user?.username || "athlete";

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] pb-20 text-[var(--foreground)] lg:pb-0">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--chrome)] shadow-[0_12px_50px_rgb(18_24_38/0.08)] backdrop-blur-2xl">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-2 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-md border border-white/25 bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))] text-[var(--accent-foreground)] shadow-[0_14px_34px_rgb(47_111_255/0.28),inset_0_1px_0_rgb(255_255_255/0.36)]">
              <Castle className="size-5" strokeWidth={2.2} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-semibold leading-4">Palace52</span>
              <span className="hidden text-xs text-[var(--muted)] sm:block">Deck memorization training</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium transition duration-200",
                    active
                      ? "border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] shadow-[var(--shadow)] backdrop-blur-2xl"
                      : "text-[var(--muted)] hover:bg-[var(--card-muted)] hover:text-[var(--foreground)]"
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <div className="hidden items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card-muted)] px-3 py-2 text-sm text-[var(--foreground)] shadow-[var(--shadow)] backdrop-blur-2xl lg:flex">
              <BarChart3 className="size-4 text-[var(--accent)]" />
              <span className="font-mono">43/52</span>
              <span className="text-[var(--muted)]">latest</span>
            </div>
            <Link
              href="/profile"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-medium text-[var(--foreground)] shadow-[var(--shadow)] backdrop-blur-2xl transition hover:border-[var(--border-strong)]"
            >
              <span
                className="flex size-6 items-center justify-center rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: user?.avatarColor ?? "#2f6fff" }}
              >
                {displayName.charAt(0).toUpperCase()}
              </span>
              <span className="max-w-[18rem] whitespace-normal break-words leading-tight">{displayName}</span>
            </Link>
            <LogoutButton compact />
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/profile"
              className="flex min-h-9 min-w-0 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1.5 text-sm font-medium shadow-[var(--shadow)] backdrop-blur-2xl"
              aria-label="Profile"
            >
              <span
                className="flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: user?.avatarColor ?? "#2f6fff" }}
              >
                {displayName.charAt(0).toUpperCase()}
              </span>
              <span className="max-w-[42vw] whitespace-normal break-words text-left leading-tight">{displayName}</span>
            </Link>
            <LogoutButton compact />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-8">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[var(--border)] bg-[var(--chrome)] shadow-[0_-18px_50px_rgb(18_24_38/0.1)] backdrop-blur-2xl lg:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium transition",
                active ? "text-[var(--accent)]" : "text-[var(--muted)]"
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/leaderboard-dashboard";
  if (href === "/palaces") return pathname === "/palaces" || pathname === "/my-memory-palace";
  return pathname === href || pathname.startsWith(`${href}/`);
}
