import { cn } from "@/lib/utils";

export function CardBadge({
  label,
  color,
  className
}: {
  label: string;
  color: "red" | "black";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-12 min-w-10 items-center justify-center rounded-md border bg-white px-2 font-mono text-base font-bold shadow-sm",
        color === "red" ? "border-red-200 text-red-600" : "border-zinc-300 text-zinc-900",
        className
      )}
    >
      {label}
    </span>
  );
}
