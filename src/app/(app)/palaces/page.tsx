import { ensureStarterContent } from "@/app/actions/onboarding";
import { MyMemoryPalaceClient } from "@/components/app/my-memory-palace-client";
import { requireCurrentUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { getPaoDeckOptions } from "@/lib/pao-decks";
import { hasRequiredAppConfig } from "@/lib/runtime-config";

export const dynamic = "force-dynamic";

export default async function PalacesPage() {
  if (!hasRequiredAppConfig()) return null;

  await ensureStarterContent();
  const user = await requireCurrentUser();
  const db = getPrisma();
  const [palaces, cardImages] = await Promise.all([
    db.palace.findMany({
      where: { userId: user.id },
      include: { locations: { orderBy: { order: "asc" }, select: { name: true } } },
      orderBy: { createdAt: "asc" }
    }),
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
    })
  ]);
  const initialPalaces = palaces.map((palace) => ({
    name: palace.name,
    locations: palace.locations.map((location) => location.name),
    cards: 52,
    strength: Math.min(100, Math.round((palace.locations.length / 18) * 100))
  }));
  const paoDeckOptions = getPaoDeckOptions(cardImages);

  return (
    <div className="space-y-8">
      <MyMemoryPalaceClient embedded initialPalaces={initialPalaces} paoDeckOptions={paoDeckOptions} />
    </div>
  );
}
