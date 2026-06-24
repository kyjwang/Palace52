import { cn } from "@/lib/utils";

type PipPosition = {
  x: number;
  y: number;
  flip?: boolean;
};

const suitGlyphs: Record<string, string> = {
  S: "♠",
  H: "♥",
  D: "♦",
  C: "♣"
};

const suitTone: Record<string, string> = {
  "♥": "text-[#d81218]",
  "♦": "text-[#d81218]",
  "♣": "text-[#101010]",
  "♠": "text-[#101010]"
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
  const tone = suitTone[suit] ?? (color === "red" ? "text-[#d81218]" : "text-[#101010]");
  const pipPositions = getPipPositions(rank);
  const isFace = rank === "J" || rank === "Q" || rank === "K";
  const usePips = pipPositions.length > 0;
  const faceAccent = color === "red" ? "#d81218" : "#101010";

  return (
    <span
      className={cn(
        "relative inline-flex aspect-[3/4] h-[76px] min-w-[54px] shrink-0 items-center justify-center overflow-hidden rounded-[5px] border border-[#d6d8de] bg-[#fffef9] font-serif font-bold shadow-[0_10px_22px_rgb(5_3_12/0.2),inset_0_0_0_1px_rgb(255_255_255/0.95)]",
        tone,
        className
      )}
      aria-label={label}
    >
      <span className="pointer-events-none absolute inset-[2px] rounded-[3px] border border-[#1d2430]/8" />
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgb(255_255_255/0.96),transparent_48%,rgb(226_229_235/0.16))]" />

      <CardCorner rank={rank} suit={suit} className="left-[4px] top-[4px]" />
      <CardCorner rank={rank} suit={suit} className="right-[4px] top-[4px]" />

      {usePips ? (
        <span className="absolute inset-x-[9px] inset-y-[14px]">
          {pipPositions.map((position) => (
            <span
              key={`${label}-${position.x}-${position.y}-${position.flip ? "flip" : "up"}`}
              className={cn("absolute -translate-x-1/2 -translate-y-1/2 text-[14px] leading-none", position.flip && "rotate-180")}
              style={{ left: `${position.x}%`, top: `${position.y}%` }}
            >
              {suit}
            </span>
          ))}
        </span>
      ) : isFace ? (
        <span className="relative flex h-[49px] w-[32px] items-center justify-center overflow-hidden rounded-[3px] border border-[#d8b35c] bg-[#fff7d7] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.75)]">
          <span className="absolute inset-x-0 top-0 h-1/2 bg-[linear-gradient(135deg,#f8d76c_0%,#f8d76c_26%,#ffffff_27%,#ffffff_40%,#c82435_41%,#c82435_58%,#ffffff_59%,#ffffff_72%,#ecb847_73%,#ecb847_100%)]" />
          <span className="absolute inset-x-0 bottom-0 h-1/2 rotate-180 bg-[linear-gradient(135deg,#f8d76c_0%,#f8d76c_26%,#ffffff_27%,#ffffff_40%,#c82435_41%,#c82435_58%,#ffffff_59%,#ffffff_72%,#ecb847_73%,#ecb847_100%)]" />
          <span className="absolute left-1/2 top-1/2 h-[43px] w-px -translate-x-1/2 -translate-y-1/2 bg-[#8b6a2c]/42" />
          <span className="absolute inset-y-1 left-[8px] w-px bg-[#c82435]/55" />
          <span className="absolute inset-y-1 right-[8px] w-px bg-[#c82435]/55" />
          <span className="relative z-10 flex size-[18px] items-center justify-center rounded-full border border-[#d4a843] bg-[#fffef9] text-[11px] leading-none text-[#101010]">
            {rank}
          </span>
          <span className="absolute left-[3px] top-[3px] text-[8px] leading-none" style={{ color: faceAccent }}>
            {suit}
          </span>
          <span className="absolute bottom-[3px] right-[3px] rotate-180 text-[8px] leading-none" style={{ color: faceAccent }}>
            {suit}
          </span>
        </span>
      ) : (
        <span className="flex flex-col items-center justify-center leading-none">
          <span className="text-[2rem]">{suit || rank}</span>
        </span>
      )}

      <CardCorner rank={rank} suit={suit} className="bottom-[4px] left-[4px] rotate-180" />
      <CardCorner rank={rank} suit={suit} className="bottom-[4px] right-[4px] rotate-180" />
    </span>
  );
}

function CardCorner({ rank, suit, className }: { rank: string; suit: string; className: string }) {
  return (
    <span className={cn("absolute z-10 flex flex-col items-center leading-none", className)}>
      <span className={cn("text-[10px]", rank === "10" && "text-[8px]")}>{rank}</span>
      <span className="text-[8px]">{suit}</span>
    </span>
  );
}

function getPipPositions(rank: string) {
  if (rank === "A") return [];
  if (rank === "2") return [{ x: 50, y: 18 }, { x: 50, y: 82, flip: true }];
  if (rank === "3") return [{ x: 50, y: 18 }, { x: 50, y: 50 }, { x: 50, y: 82, flip: true }];
  if (rank === "4") return [{ x: 30, y: 20 }, { x: 70, y: 20 }, { x: 30, y: 80, flip: true }, { x: 70, y: 80, flip: true }];
  if (rank === "5") return [{ x: 30, y: 20 }, { x: 70, y: 20 }, { x: 50, y: 50 }, { x: 30, y: 80, flip: true }, { x: 70, y: 80, flip: true }];
  if (rank === "6") return [{ x: 30, y: 18 }, { x: 70, y: 18 }, { x: 30, y: 50 }, { x: 70, y: 50 }, { x: 30, y: 82, flip: true }, { x: 70, y: 82, flip: true }];
  if (rank === "7") return [{ x: 30, y: 16 }, { x: 70, y: 16 }, { x: 50, y: 33 }, { x: 30, y: 50 }, { x: 70, y: 50 }, { x: 30, y: 84, flip: true }, { x: 70, y: 84, flip: true }];
  if (rank === "8") return [{ x: 30, y: 15 }, { x: 70, y: 15 }, { x: 50, y: 32 }, { x: 30, y: 48 }, { x: 70, y: 48 }, { x: 50, y: 68, flip: true }, { x: 30, y: 85, flip: true }, { x: 70, y: 85, flip: true }];
  if (rank === "9") return [{ x: 30, y: 14 }, { x: 70, y: 14 }, { x: 30, y: 34 }, { x: 70, y: 34 }, { x: 50, y: 50 }, { x: 30, y: 66, flip: true }, { x: 70, y: 66, flip: true }, { x: 30, y: 86, flip: true }, { x: 70, y: 86, flip: true }];
  if (rank === "10") return [{ x: 30, y: 12 }, { x: 70, y: 12 }, { x: 50, y: 27 }, { x: 30, y: 39 }, { x: 70, y: 39 }, { x: 30, y: 61, flip: true }, { x: 70, y: 61, flip: true }, { x: 50, y: 73, flip: true }, { x: 30, y: 88, flip: true }, { x: 70, y: 88, flip: true }];
  return [];
}
