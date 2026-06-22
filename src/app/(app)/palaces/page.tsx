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
  const cardImages = await db.cardImage.findMany({
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
  });
  const paoDeckOptions = getPaoDeckOptions(cardImages);

  return (
    <div className="space-y-8">
      <MyMemoryPalaceClient embedded paoDeckOptions={paoDeckOptions} />
    </div>
  );
}
