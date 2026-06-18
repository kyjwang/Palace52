"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCurrentUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

const palaceSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(240).optional()
});

const locationSchema = z.object({
  palaceId: z.string().min(1),
  name: z.string().min(2).max(80),
  description: z.string().max(240).optional(),
  cue: z.string().max(240).optional()
});

export async function createPalace(formData: FormData) {
  const user = await requireCurrentUser();
  const parsed = palaceSchema.parse({
    name: formData.get("name"),
    description: formData.get("description") || undefined
  });

  await getPrisma().palace.create({
    data: {
      userId: user.id,
      name: parsed.name,
      description: parsed.description
    }
  });

  revalidatePath("/palaces");
}

export async function addPalaceLocation(formData: FormData) {
  const user = await requireCurrentUser();
  const parsed = locationSchema.parse({
    palaceId: formData.get("palaceId"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    cue: formData.get("cue") || undefined
  });

  const db = getPrisma();
  const palace = await db.palace.findFirst({
    where: { id: parsed.palaceId, userId: user.id },
    include: { locations: { select: { order: true } } }
  });

  if (!palace) throw new Error("Palace not found");

  const nextOrder = Math.max(0, ...palace.locations.map((location) => location.order)) + 1;

  await db.palaceLocation.create({
    data: {
      palaceId: parsed.palaceId,
      order: nextOrder,
      name: parsed.name,
      description: parsed.description,
      cue: parsed.cue
    }
  });

  revalidatePath("/palaces");
  revalidatePath("/training");
}
