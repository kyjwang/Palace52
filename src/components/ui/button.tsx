import Link from "next/link";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "border border-white/20 bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))] text-[var(--accent-foreground)] shadow-[0_16px_38px_rgb(47_111_255/0.24),inset_0_1px_0_rgb(255_255_255/0.34)] hover:brightness-105",
  secondary:
    "border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] shadow-[var(--shadow)] backdrop-blur-2xl hover:border-[var(--border-strong)] hover:bg-[var(--card-muted)]",
  ghost: "text-[var(--foreground)] hover:bg-[var(--accent-soft)]"
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition duration-200 active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
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
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition duration-200 active:translate-y-px",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
