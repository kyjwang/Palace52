import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  label,
  title,
  description,
  action,
  className
}: {
  label?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow)] backdrop-blur-2xl md:p-7",
        className
      )}
    >
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div className="min-w-0">
          {label ? <p className="text-sm font-semibold text-[var(--accent)]">{label}</p> : null}
          <h1 className="mt-2 max-w-4xl text-3xl font-semibold leading-tight tracking-tight text-[var(--foreground)] md:text-5xl">
            {title}
          </h1>
          {description ? <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted)]">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </section>
  );
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className={cn("rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)] backdrop-blur-2xl", className)}>
      {children}
    </section>
  );
}

export function MetricCard({
  label,
  value,
  helper,
  icon,
  tone = "default"
}: {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
  icon?: ReactNode;
  tone?: "default" | "accent" | "dark";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4 shadow-[var(--shadow)]",
        tone === "dark"
          ? "border-white/10 bg-[var(--ink)]/88 text-white backdrop-blur-2xl"
          : tone === "accent"
            ? "border-[var(--border-strong)] bg-[var(--accent-soft)] text-[var(--foreground)] backdrop-blur-2xl"
            : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] backdrop-blur-2xl"
      )}
    >
      <div className={cn("flex items-center justify-between gap-4 text-sm", tone === "dark" ? "text-white/65" : "text-[var(--muted)]")}>
        <span>{label}</span>
        {icon ? <span className={tone === "dark" ? "text-white" : "text-[var(--accent)]"}>{icon}</span> : null}
      </div>
      <p className="mt-3 font-mono text-3xl font-semibold tracking-tight">{value}</p>
      {helper ? <p className={cn("mt-2 text-xs leading-5", tone === "dark" ? "text-white/65" : "text-[var(--muted)]")}>{helper}</p> : null}
    </div>
  );
}

export function InlineStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--card-muted)] px-3 py-2 backdrop-blur-2xl">
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="mt-1 font-mono text-sm font-semibold text-[var(--foreground)]">{value}</p>
    </div>
  );
}
