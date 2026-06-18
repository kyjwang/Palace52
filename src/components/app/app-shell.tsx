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
    <div className="min-h-[100dvh] bg-[var(--background)] pb-20 text-[var(--foreground)] md:pb-0">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-md bg-[var(--accent)] font-mono text-sm font-bold text-[var(--accent-foreground)] shadow-sm">
              52
            </span>
            <span>
              <span className="block text-sm font-semibold leading-4">Palace52</span>
              <span className="hidden text-xs text-[var(--muted)] sm:block">Cognitive deck training</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium transition",
                    active
                      ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
                      : "text-[var(--muted)] hover:bg-[var(--card)] hover:text-[var(--foreground)]"
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <div className="hidden items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] shadow-sm lg:flex">
              <BarChart3 className="size-4 text-[var(--accent)]" />
              <span className="font-mono">43/52</span>
              <span className="text-[var(--muted)]">latest</span>
            </div>
            <Link
              href="/profile"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-medium text-[var(--foreground)] shadow-sm transition hover:border-[var(--border-strong)]"
            >
              <span
                className="flex size-6 items-center justify-center rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: user?.avatarColor ?? "#8a6518" }}
              >
                {displayName.charAt(0).toUpperCase()}
              </span>
              <span className="hidden max-w-28 truncate lg:inline">{displayName}</span>
            </Link>
            <LogoutButton compact />
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/profile"
              className="flex size-9 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] shadow-sm"
              aria-label="Profile"
            >
              <span
                className="flex size-6 items-center justify-center rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: user?.avatarColor ?? "#8a6518" }}
              >
                {displayName.charAt(0).toUpperCase()}
              </span>
            </Link>
            <LogoutButton compact />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-8">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[var(--border)] bg-[var(--card)] md:hidden">
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
