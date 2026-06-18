"use server";

import { getPrisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/auth";
import { starterCardImages, starterRoutes } from "@/lib/defaults";

export async function ensureStarterContent() {
  const user = await requireCurrentUser();
  const db = getPrisma();

  const [existingPalaces, imageCount] = await Promise.all([
    db.palace.findMany({ where: { userId: user.id }, select: { name: true } }),
    db.cardImage.count({ where: { userId: user.id } })
  ]);
  const existingPalaceNames = new Set(existingPalaces.map((palace) => palace.name));

  for (const route of starterRoutes) {
    if (!existingPalaceNames.has(route.name)) {
      await db.palace.create({
        data: {
          userId: user.id,
          name: route.name,
          description: route.description,
          isDefault: true,
          locations: {
            create: route.locations.map((name, index) => ({
              name,
              order: index + 1,
              cue: `Imagine location ${index + 1} with exaggerated color, sound, and movement.`
            }))
          }
        }
      });
    }
  }

  if (imageCount === 0) {
    await db.cardImage.createMany({
      data: starterCardImages().map((image) => ({
        userId: user.id,
        ...image
      })),
      skipDuplicates: true
    });
  }
}
