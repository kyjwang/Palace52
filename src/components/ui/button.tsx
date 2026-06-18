import Link from "next/link";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-sm shadow-black/15 hover:bg-[var(--accent-strong)]",
  secondary:
    "border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] shadow-sm shadow-black/5 hover:border-[var(--border-strong)] hover:bg-[var(--card-muted)]",
  ghost: "text-[var(--foreground)] hover:bg-[var(--accent-soft)]"
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: keyof typeof variants;
};

export function ButtonLink({ className, variant = "primary", href, ...props }: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition active:translate-y-px",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
