"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { BarChart3, Castle, GraduationCap, Hammer, Play, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/palaces", label: "My palace", icon: Castle },
  { href: "/training-academy", label: "Academy", icon: GraduationCap },
  { href: "/dashboard", label: "Dashboard", icon: Trophy },
  { href: "/play", label: "Play", icon: Play },
  { href: "/build-palace", label: "Build", icon: Hammer }
];

export function PublicShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] pb-20 text-[var(--foreground)] lg:pb-0">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-md bg-[var(--accent)] text-[var(--accent-foreground)] shadow-sm">
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
              const active = pathname === item.href;
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
          <div className="hidden items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] shadow-sm lg:flex">
            <BarChart3 className="size-4 text-[var(--accent)]" />
            <span className="font-mono">52-card</span>
            <span className="text-[var(--muted)]">method</span>
          </div>
          <div className="hidden items-center gap-2 lg:flex">
            <Link
              href="/login"
              className="inline-flex h-10 items-center rounded-md px-3 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--card)] hover:text-[var(--foreground)]"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="inline-flex h-10 items-center rounded-md bg-[var(--accent)] px-3 text-sm font-semibold text-[var(--accent-foreground)] shadow-sm transition hover:bg-[var(--accent-strong)]"
            >
              Register
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-8">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[var(--border)] bg-[var(--card)] lg:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
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
