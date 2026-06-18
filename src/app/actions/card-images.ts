"use server";

import { revalidatePath } from "next/cache";
import { Rank, Suit } from "@prisma/client";
import { z } from "zod";
import { requireCurrentUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

const cardImageSchema = z.object({
  rank: z.nativeEnum(Rank),
  suit: z.nativeEnum(Suit),
  person: z.string().max(80).optional(),
  action: z.string().max(80).optional(),
  object: z.string().max(80).optional(),
  imagePrompt: z.string().max(500).optional(),
  notes: z.string().max(500).optional()
});

export async function upsertCardImage(formData: FormData) {
  const user = await requireCurrentUser();
  const parsed = cardImageSchema.parse({
    rank: formData.get("rank"),
    suit: formData.get("suit"),
    person: formData.get("person") || undefined,
    action: formData.get("action") || undefined,
    object: formData.get("object") || undefined,
    imagePrompt: formData.get("imagePrompt") || undefined,
    notes: formData.get("notes") || undefined
  });

  await getPrisma().cardImage.upsert({
    where: {
      userId_rank_suit: {
        userId: user.id,
        rank: parsed.rank,
        suit: parsed.suit
      }
    },
    update: parsed,
    create: {
      userId: user.id,
      ...parsed
    }
  });

  revalidatePath("/cards");
  revalidatePath("/training");
}
