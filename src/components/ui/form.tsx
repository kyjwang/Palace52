import type { InputHTMLAttributes, LabelHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium text-[var(--foreground)]", className)} {...props} />;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-[var(--border)] bg-[var(--control)] px-3 text-sm text-[var(--foreground)] shadow-[inset_0_1px_0_rgb(255_255_255/0.16)] outline-none backdrop-blur-xl transition placeholder:text-[var(--muted)] focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--accent)]/20",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-md border border-[var(--border)] bg-[var(--control)] px-3 py-2 text-sm text-[var(--foreground)] shadow-[inset_0_1px_0_rgb(255_255_255/0.16)] outline-none backdrop-blur-xl transition placeholder:text-[var(--muted)] focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--accent)]/20",
        className
      )}
      {...props}
    />
  );
}
