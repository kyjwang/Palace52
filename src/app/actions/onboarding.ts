"use server";

import { getPrisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/auth";
import { starterCardImages, starterLocations } from "@/lib/defaults";

export async function ensureStarterContent() {
  const user = await requireCurrentUser();
  const db = getPrisma();

  const [palaceCount, imageCount] = await Promise.all([
    db.palace.count({ where: { userId: user.id } }),
    db.cardImage.count({ where: { userId: user.id } })
  ]);

  if (palaceCount === 0) {
    await db.palace.create({
      data: {
        userId: user.id,
        name: "Home Palace",
        description: "A starter route through familiar household locations.",
        isDefault: true,
        locations: {
          create: starterLocations.map((name, index) => ({
            name,
            order: index + 1,
            cue: `Imagine location ${index + 1} with exaggerated color, sound, and movement.`
          }))
        }
      }
    });
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
