import { cn } from "@/lib/utils";

const suitGlyphs: Record<string, string> = {
  S: "♠",
  H: "♥",
  D: "♦",
  C: "♣"
};

const suitTone: Record<string, string> = {
  "♥": "text-[#d8344f]",
  "♦": "text-[#e24f55]",
  "♣": "text-[#171420]",
  "♠": "text-[#171420]"
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
  const tone = suitTone[suit] ?? (color === "red" ? "text-[#d8344f]" : "text-[#171420]");
  const pipPositions = getPipPositions(rank);
  const isFace = rank === "J" || rank === "Q" || rank === "K";
  const usePips = pipPositions.length > 0;

  return (
    <span
      className={cn(
        "relative inline-flex aspect-[3/4] h-14 min-w-11 shrink-0 items-center justify-center overflow-hidden rounded-[7px] border border-[#d9dbe2] bg-[#fffdf7] p-1 font-mono font-bold shadow-[0_10px_22px_rgb(5_3_12/0.18),inset_0_0_0_1px_rgb(255_255_255/0.92)]",
        tone,
        className
      )}
      aria-label={label}
    >
      <span className="pointer-events-none absolute inset-[3px] rounded-[5px] border border-[#1d2430]/10" />
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgb(255_255_255/0.9),transparent_50%)]" />

      <span className="absolute left-[5px] top-[5px] z-10 flex flex-col items-center leading-none">
        <span className="text-[10px]">{rank}</span>
        <span className="mt-px text-[10px]">{suit}</span>
      </span>

      {usePips ? (
        <span className="grid h-full w-full grid-cols-3 grid-rows-5 items-center justify-items-center px-2.5 py-4">
          {pipPositions.map((position) => (
            <span
              key={`${label}-${position}`}
              className={cn("text-[13px] leading-none", position >= 7 && "rotate-180")}
              style={{ gridColumn: (position % 3) + 1, gridRow: Math.floor(position / 3) + 1 }}
            >
              {suit}
            </span>
          ))}
        </span>
      ) : isFace ? (
        <span className="flex h-[58%] w-[52%] items-center justify-center overflow-hidden rounded-[4px] border border-[#d8b35c]/70 bg-[linear-gradient(135deg,#f7df93_0%,#fff6d6_34%,#c42e3c_35%,#c42e3c_48%,#fff6d6_49%,#f3c66c_100%)] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.55)]">
          <span className="rounded-full bg-[#fffdf7]/85 px-1 text-[14px] leading-none text-[#171420]">{rank}</span>
        </span>
      ) : (
        <span className="flex flex-col items-center justify-center leading-none">
          <span className="text-[1.65rem]">{suit || rank}</span>
        </span>
      )}

      <span className="absolute bottom-[5px] right-[5px] z-10 flex rotate-180 flex-col items-center leading-none">
        <span className="text-[10px]">{rank}</span>
        <span className="mt-px text-[10px]">{suit}</span>
      </span>
    </span>
  );
}

function getPipPositions(rank: string) {
  if (rank === "A") return [];
  if (rank === "2") return [1, 13];
  if (rank === "3") return [1, 7, 13];
  if (rank === "4") return [0, 2, 12, 14];
  if (rank === "5") return [0, 2, 7, 12, 14];
  if (rank === "6") return [0, 2, 6, 8, 12, 14];
  if (rank === "7") return [0, 2, 4, 6, 8, 12, 14];
  if (rank === "8") return [0, 2, 4, 6, 8, 10, 12, 14];
  if (rank === "9") return [0, 2, 3, 5, 7, 9, 11, 12, 14];
  if (rank === "10") return [0, 2, 3, 5, 6, 8, 9, 11, 12, 14];
  return [];
}
