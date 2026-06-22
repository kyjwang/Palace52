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

const paoDeckCardSchema = z.object({
  rank: z.nativeEnum(Rank),
  suit: z.nativeEnum(Suit),
  person: z.string().max(80).optional(),
  action: z.string().max(80).optional(),
  object: z.string().max(80).optional()
});

const paoDeckSchema = z.object({
  cards: z.array(paoDeckCardSchema).max(52)
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

  await saveCardImageForUser(user.id, parsed);

  revalidateCardImageViews();
}

export async function saveCardImage(input: z.input<typeof cardImageSchema>) {
  const user = await requireCurrentUser();
  const parsed = cardImageSchema.parse(input);

  await saveCardImageForUser(user.id, parsed);

  revalidateCardImageViews();
}

export async function savePaoDeck(input: z.input<typeof paoDeckSchema>) {
  const user = await requireCurrentUser();
  const parsed = paoDeckSchema.parse(input);
  const completedCards = parsed.cards.filter((card) => card.person?.trim() && card.action?.trim() && card.object?.trim());

  if (completedCards.length === 0) return;

  await getPrisma().$transaction(
    completedCards.map((card) =>
      getPrisma().cardImage.upsert({
        where: {
          userId_rank_suit: {
            userId: user.id,
            rank: card.rank,
            suit: card.suit
          }
        },
        update: {
          person: card.person?.trim(),
          action: card.action?.trim(),
          object: card.object?.trim(),
          imagePrompt: `${card.person?.trim()} ${card.action?.trim()} with ${card.object?.trim()}`,
          notes: "Custom PAO card image."
        },
        create: {
          userId: user.id,
          rank: card.rank,
          suit: card.suit,
          person: card.person?.trim(),
          action: card.action?.trim(),
          object: card.object?.trim(),
          imagePrompt: `${card.person?.trim()} ${card.action?.trim()} with ${card.object?.trim()}`,
          notes: "Custom PAO card image."
        }
      })
    )
  );

  revalidateCardImageViews();
}

async function saveCardImageForUser(userId: string, parsed: z.infer<typeof cardImageSchema>) {
  await getPrisma().cardImage.upsert({
    where: {
      userId_rank_suit: {
        userId,
        rank: parsed.rank,
        suit: parsed.suit
      }
    },
    update: parsed,
    create: {
      userId,
      ...parsed
    }
  });
}

function revalidateCardImageViews() {
  revalidatePath("/cards");
  revalidatePath("/training");
  revalidatePath("/build-palace");
  revalidatePath("/my-memory-palace");
  revalidatePath("/palaces");
  revalidatePath("/play");
}
