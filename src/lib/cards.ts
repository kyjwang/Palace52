import type { Rank, Suit } from "@prisma/client";

export type CardCode =
  | "AC"
  | "2C"
  | "3C"
  | "4C"
  | "5C"
  | "6C"
  | "7C"
  | "8C"
  | "9C"
  | "10C"
  | "JC"
  | "QC"
  | "KC"
  | "AD"
  | "2D"
  | "3D"
  | "4D"
  | "5D"
  | "6D"
  | "7D"
  | "8D"
  | "9D"
  | "10D"
  | "JD"
  | "QD"
  | "KD"
  | "AH"
  | "2H"
  | "3H"
  | "4H"
  | "5H"
  | "6H"
  | "7H"
  | "8H"
  | "9H"
  | "10H"
  | "JH"
  | "QH"
  | "KH"
  | "AS"
  | "2S"
  | "3S"
  | "4S"
  | "5S"
  | "6S"
  | "7S"
  | "8S"
  | "9S"
  | "10S"
  | "JS"
  | "QS"
  | "KS";

export type PlayingCard = {
  code: CardCode;
  rank: Rank;
  suit: Suit;
  label: string;
  shortLabel: string;
  color: "red" | "black";
};

const ranks: Array<{ rank: Rank; short: string; label: string }> = [
  { rank: "ACE", short: "A", label: "Ace" },
  { rank: "TWO", short: "2", label: "Two" },
  { rank: "THREE", short: "3", label: "Three" },
  { rank: "FOUR", short: "4", label: "Four" },
  { rank: "FIVE", short: "5", label: "Five" },
  { rank: "SIX", short: "6", label: "Six" },
  { rank: "SEVEN", short: "7", label: "Seven" },
  { rank: "EIGHT", short: "8", label: "Eight" },
  { rank: "NINE", short: "9", label: "Nine" },
  { rank: "TEN", short: "10", label: "Ten" },
  { rank: "JACK", short: "J", label: "Jack" },
  { rank: "QUEEN", short: "Q", label: "Queen" },
  { rank: "KING", short: "K", label: "King" }
];

const suits: Array<{ suit: Suit; short: string; symbol: string; label: string; color: "red" | "black" }> = [
  { suit: "CLUBS", short: "C", symbol: "♣", label: "Clubs", color: "black" },
  { suit: "DIAMONDS", short: "D", symbol: "♦", label: "Diamonds", color: "red" },
  { suit: "HEARTS", short: "H", symbol: "♥", label: "Hearts", color: "red" },
  { suit: "SPADES", short: "S", symbol: "♠", label: "Spades", color: "black" }
];

export const fullDeck: PlayingCard[] = suits.flatMap((suit) =>
  ranks.map((rank) => ({
    code: `${rank.short}${suit.short}` as CardCode,
    rank: rank.rank,
    suit: suit.suit,
    label: `${rank.label} of ${suit.label}`,
    shortLabel: `${rank.short}${suit.symbol}`,
    color: suit.color
  }))
);

export function cardFromCode(code: string) {
  return fullDeck.find((card) => card.code === code);
}

export function shuffleDeck(seed = crypto.randomUUID()) {
  const deck = [...fullDeck];
  let state = hashSeed(seed);

  for (let i = deck.length - 1; i > 0; i -= 1) {
    state = (state * 1664525 + 1013904223) % 4294967296;
    const j = Math.floor((state / 4294967296) * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

function hashSeed(seed: string) {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
}
