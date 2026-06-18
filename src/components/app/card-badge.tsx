import { cn } from "@/lib/utils";

const suitGlyphs: Record<string, string> = {
  S: "♠",
  H: "♥",
  D: "♦",
  C: "♣"
};

function splitCardLabel(label: string) {
  const glyph = label.match(/[♣♦♥♠]/)?.[0];

  if (glyph) {
    return {
      rank: label.replace(/[♣♦♥♠]/g, ""),
      suit: glyph
    };
  }

  const maybeSuit = label.slice(-1).toUpperCase();

  return {
    rank: label.slice(0, -1) || label,
    suit: suitGlyphs[maybeSuit] ?? ""
  };
}

export function CardBadge({
  label,
  color,
  className
}: {
  label: string;
  color: "red" | "black";
  className?: string;
}) {
  const { rank, suit } = splitCardLabel(label);
  const tone = color === "red" ? "text-[#9f1d2e]" : "text-[#21172c]";

  return (
    <span
      className={cn(
        "relative inline-flex aspect-[3/4] h-12 min-w-10 shrink-0 items-center justify-center overflow-hidden rounded-[7px] border border-[#b99548] bg-[#fff8e8] p-1 font-mono font-bold shadow-[0_8px_18px_rgb(5_3_12/0.18),inset_0_0_0_3px_rgb(185_149_72/0.12)]",
        tone,
        className
      )}
      aria-label={label}
    >
      <span className="absolute left-1 top-1 flex flex-col items-center leading-none">
        <span className="text-[10px]">{rank}</span>
        <span className="text-[11px]">{suit}</span>
      </span>
      <span className="text-[1.35rem] leading-none">{suit || rank}</span>
      <span className="absolute bottom-1 right-1 flex rotate-180 flex-col items-center leading-none">
        <span className="text-[10px]">{rank}</span>
        <span className="text-[11px]">{suit}</span>
      </span>
    </span>
  );
}
