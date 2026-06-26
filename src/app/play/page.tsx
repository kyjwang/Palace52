import { PublicShell } from "@/components/app/public-shell";
import { PlayGame } from "@/components/play/play-game";
import { requireCurrentUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { getPaoDeckOptions } from "@/lib/pao-decks";

export const dynamic = "force-dynamic";

export default async function PlayPage() {
  const user = await requireCurrentUser();
  const db = getPrisma();
  const [savedImages, palaces] = await Promise.all([
    db.cardImage.findMany({
      where: { userId: user.id },
      select: {
        rank: true,
        suit: true,
        person: true,
        action: true,
        object: true,
        imagePrompt: true,
        notes: true,
        createdAt: true,
        updatedAt: true
      }
    }),
    db.palace.findMany({
      where: { userId: user.id },
      include: { locations: { orderBy: { order: "asc" }, select: { name: true } } },
      orderBy: { createdAt: "asc" }
    })
  ]);
  const initialPalaces = palaces.map((palace) => ({
    name: palace.name,
    locations: palace.locations.map((location) => location.name),
    cards: 52,
    strength: Math.min(100, Math.round((palace.locations.length / 18) * 100))
  }));
  const paoDeckOptions = getPaoDeckOptions(savedImages);

  return (
    <PublicShell
      user={{
        username: user.username,
        displayName: user.profile?.displayName,
        avatarColor: user.profile?.avatarColor
      }}
    >
      <PlayGame initialPalaces={initialPalaces} paoDeckOptions={paoDeckOptions} />
    </PublicShell>
  );
}
