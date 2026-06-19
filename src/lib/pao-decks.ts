import { fullDeck } from "@/lib/cards";
import { beginnerPaoDeck, paoDeckPresets, type StarterPao } from "@/lib/sample-palace";

const starterImageNote = "Starter image. Replace this with a personal association when it becomes familiar.";

export type PaoDeckOption = {
  id: string;
  name: string;
  description: string;
  deck: StarterPao[];
  customCount?: number;
};

export type SavedCardImageForDeck = {
  rank: StarterPao["card"]["rank"];
  suit: StarterPao["card"]["suit"];
  person: string | null;
  action: string | null;
  object: string | null;
  imagePrompt: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function getPresetPaoDeckOptions(): PaoDeckOption[] {
  return paoDeckPresets.map((preset, index) => ({
    id: `preset-${index}`,
    name: preset.name,
    description: preset.description,
    deck: preset.deck
  }));
}

export function getPaoDeckOptions(savedImages: SavedCardImageForDeck[]): PaoDeckOption[] {
  const customDeck = getCustomPaoDeckOption(savedImages);
  const presets = getPresetPaoDeckOptions();

  return customDeck ? [customDeck, ...presets] : presets;
}

function getCustomPaoDeckOption(savedImages: SavedCardImageForDeck[]): PaoDeckOption | null {
  const customCount = savedImages.filter(isUserEditedCardImage).length;

  if (customCount === 0) return null;

  const imageByCard = new Map(savedImages.map((image) => [`${image.rank}-${image.suit}`, image]));
  const fallbackByCode = new Map(beginnerPaoDeck.map((entry) => [entry.card.code, entry]));
  const customDeck: StarterPao[] = fullDeck.map((card) => {
    const image = imageByCard.get(`${card.rank}-${card.suit}`);
    const fallback = fallbackByCode.get(card.code) ?? beginnerPaoDeck[0];
    const person = image?.person?.trim() || fallback.person;
    const action = image?.action?.trim() || fallback.action;
    const object = image?.object?.trim() || fallback.object;

    return {
      card,
      location: fallback.location,
      person,
      action,
      object,
      image: image?.imagePrompt?.trim() || `${person} ${action} with ${object} at the ${fallback.location.toLowerCase()}`
    };
  });

  return {
    id: "user-pao",
    name: "My custom PAO",
    description: `${customCount}/52 cards edited by you. Missing cards use the beginner PAO fallback.`,
    deck: customDeck,
    customCount
  };
}

function isUserEditedCardImage(image: SavedCardImageForDeck) {
  const hasContent = Boolean(image.person?.trim() || image.action?.trim() || image.object?.trim() || image.imagePrompt?.trim());
  const changedAfterSeed = image.updatedAt.getTime() > image.createdAt.getTime() + 1000;
  const hasCustomNote = Boolean(image.notes?.trim() && image.notes.trim() !== starterImageNote);

  return hasContent && (changedAfterSeed || hasCustomNote);
}
