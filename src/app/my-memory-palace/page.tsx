import { MyMemoryPalaceClient } from "@/components/app/my-memory-palace-client";
import { getCurrentUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export default async function MyMemoryPalacePage() {
  const user = await getCurrentUser();
  const palaces = user
    ? await getPrisma().palace.findMany({
        where: { userId: user.id },
        include: { locations: { orderBy: { order: "asc" }, select: { name: true } } },
        orderBy: { createdAt: "asc" }
      })
    : [];
  const initialPalaces = palaces.map((palace) => ({
    name: palace.name,
    locations: palace.locations.map((location) => location.name),
    cards: 52,
    strength: Math.min(100, Math.round((palace.locations.length / 18) * 100))
  }));

  return (
    <MyMemoryPalaceClient
      initialPalaces={initialPalaces}
      headerUser={
        user
          ? {
              username: user.username,
              displayName: user.profile?.displayName,
              avatarColor: user.profile?.avatarColor
            }
          : null
      }
    />
  );
}
