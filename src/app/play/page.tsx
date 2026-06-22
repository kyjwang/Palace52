import { PublicShell } from "@/components/app/public-shell";
import { PlayGame } from "@/components/play/play-game";
import { requireCurrentUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { getPaoDeckOptions } from "@/lib/pao-decks";

export const dynamic = "force-dynamic";

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
      imagePrompt: true,
      notes: true,
      createdAt: true,
      updatedAt: true
    }
  });
  const paoDeckOptions = getPaoDeckOptions(savedImages);

  return (
    <PublicShell
      user={{
        username: user.username,
        displayName: user.profile?.displayName,
        avatarColor: user.profile?.avatarColor
      }}
    >
      <PlayGame paoDeckOptions={paoDeckOptions} />
    </PublicShell>
  );
}
