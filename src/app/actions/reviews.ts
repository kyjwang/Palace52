"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCurrentUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { nextReviewState, type ReviewGrade } from "@/lib/spaced-repetition";

const reviewSchema = z.object({
  reviewCardId: z.string().min(1),
  grade: z.number().min(0).max(5)
});

export async function gradeReviewCard(formData: FormData) {
  const user = await requireCurrentUser();
  const parsed = reviewSchema.parse({
    reviewCardId: formData.get("reviewCardId"),
    grade: Number(formData.get("grade"))
  });

  const db = getPrisma();
  const reviewCard = await db.reviewCard.findFirst({
    where: { id: parsed.reviewCardId, userId: user.id }
  });

  if (!reviewCard) throw new Error("Review card not found");

  await db.reviewCard.update({
    where: { id: reviewCard.id },
    data: nextReviewState(reviewCard, parsed.grade as ReviewGrade)
  });

  revalidatePath("/reviews");
  revalidatePath("/dashboard");
}
