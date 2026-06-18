import type { ReviewCard } from "@prisma/client";

export type ReviewGrade = 0 | 1 | 2 | 3 | 4 | 5;

export function gradeFromRecall(isCorrect: boolean, wasMisplaced: boolean): ReviewGrade {
  if (isCorrect) return 5;
  if (wasMisplaced) return 3;
  return 1;
}

export function nextReviewState(
  card: Pick<ReviewCard, "easeFactor" | "intervalDays" | "repetitions" | "lapses"> | null,
  grade: ReviewGrade,
  now = new Date()
) {
  const previous = card ?? {
    easeFactor: 2.5,
    intervalDays: 0,
    repetitions: 0,
    lapses: 0
  };

  let repetitions = previous.repetitions;
  let intervalDays = previous.intervalDays;
  let lapses = previous.lapses;
  let easeFactor = Math.max(
    1.3,
    previous.easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
  );

  if (grade < 3) {
    repetitions = 0;
    intervalDays = 1;
    lapses += 1;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else {
    repetitions += 1;
    if (repetitions === 1) intervalDays = 1;
    else if (repetitions === 2) intervalDays = 3;
    else intervalDays = Math.round(intervalDays * easeFactor);
  }

  const dueAt = new Date(now);
  dueAt.setDate(now.getDate() + intervalDays);

  return {
    intervalDays,
    easeFactor,
    repetitions,
    lapses,
    dueAt,
    lastReviewedAt: now
  };
}
