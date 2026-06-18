import { TrainingCockpit } from "@/components/training/training-cockpit";
import { PageHeader } from "@/components/ui/product";
import { ensureStarterContent } from "@/app/actions/onboarding";
import { requireCurrentUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { hasRequiredAppConfig } from "@/lib/runtime-config";

export const dynamic = "force-dynamic";

export default async function TrainingPage() {
  if (!hasRequiredAppConfig()) return null;

  await ensureStarterContent();
  const user = await requireCurrentUser();
  const db = getPrisma();
  const [palaces, cardImages] = await Promise.all([
    db.palace.findMany({
      where: { userId: user.id },
      include: { locations: { orderBy: { order: "asc" }, select: { id: true, name: true, order: true } } },
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
        imagePrompt: true
      }
    })
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        label="Deck memorization mode"
        title="Study, place, recall, analyze"
        description="Generate a shuffled deck, place images into palace locations, then enter the order from memory."
      />
      <TrainingCockpit palaces={palaces} cardImages={cardImages} />
    </div>
  );
}
