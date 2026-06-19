import { PublicShell } from "@/components/app/public-shell";
import { PlayGame, type PlayPaoDeckOption } from "@/components/play/play-game";
import { fullDeck } from "@/lib/cards";
import { requireCurrentUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { beginnerPaoDeck, type StarterPao } from "@/lib/sample-palace";

export const dynamic = "force-dynamic";

type SavedCardImage = {
  rank: StarterPao["card"]["rank"];
  suit: StarterPao["card"]["suit"];
  person: string | null;
  action: string | null;
  object: string | null;
  imagePrompt: string | null;
};

export default async function PlayPage() {
  const user = await requireCurrentUser();
  const savedImages = await getPrisma().cardImage.findMany({
    where: { userId: user.id },
    select: {
      rank: true,
      suit: true,
      person: true,
      action: true,
      object: true,
      imagePrompt: true
    }
  });
  const paoDeckOptions = buildPaoDeckOptions(savedImages);

  return (
    <PublicShell>
      <PlayGame paoDeckOptions={paoDeckOptions} />
    </PublicShell>
  );
}

function buildPaoDeckOptions(savedImages: SavedCardImage[]): PlayPaoDeckOption[] {
  const customCount = savedImages.filter((image) => image.person || image.action || image.object || image.imagePrompt).length;

  if (customCount === 0) return [];

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

  return [
    {
      id: "user-pao",
      name: "My saved PAO",
      description: `${customCount}/52 cards use your saved PAO fields. Missing cards use the beginner fallback.`,
      deck: customDeck,
      customCount
    }
  ];
}
