import { Brain, CheckCircle2 } from "lucide-react";
import { gradeReviewCard } from "@/app/actions/reviews";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/product";
import { requireCurrentUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { hasRequiredAppConfig } from "@/lib/runtime-config";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  if (!hasRequiredAppConfig()) return null;

  const user = await requireCurrentUser();
  const reviewCards = await getPrisma().reviewCard.findMany({
    where: { userId: user.id },
    include: {
      user: { select: { id: true } }
    },
    orderBy: [{ dueAt: "asc" }, { lapses: "desc" }],
    take: 40
  });

  const images = await getPrisma().cardImage.findMany({
    where: { userId: user.id }
  });
  const imageByCard = new Map(images.map((image) => [`${image.rank}-${image.suit}`, image]));
  const now = new Date();

  return (
    <div className="space-y-6">
      <PageHeader
        label="Spaced repetition"
        title="Practice cards that cost you points"
        description="Wrong and misplaced cards enter this review queue. Grade each image from forgotten to effortless."
      />

      {reviewCards.length === 0 ? (
        <Card>
          <CardContent className="flex items-center gap-3 text-sm text-[#6f7468]">
            <CheckCircle2 className="size-5 text-[#0f7a5f]" />
            No review cards yet. Mistakes from training sessions will appear here.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {reviewCards.map((reviewCard) => {
            const image = imageByCard.get(`${reviewCard.rank}-${reviewCard.suit}`);
            const due = reviewCard.dueAt <= now;
            return (
              <Card key={reviewCard.id} className={due ? "border-[#0f7a5f]" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{reviewCard.rank} of {reviewCard.suit}</CardTitle>
                      <p className="mt-1 text-sm text-[#6f7468]">{image?.imagePrompt ?? "No custom image prompt yet."}</p>
                    </div>
                    <Brain className="size-5 text-[#0f7a5f]" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="rounded-md bg-[#f6f7f3] p-3">
                      <p className="text-[#6f7468]">Interval</p>
                      <p className="font-mono font-semibold">{reviewCard.intervalDays}d</p>
                    </div>
                    <div className="rounded-md bg-[#f6f7f3] p-3">
                      <p className="text-[#6f7468]">Lapses</p>
                      <p className="font-mono font-semibold">{reviewCard.lapses}</p>
                    </div>
                    <div className="rounded-md bg-[#f6f7f3] p-3">
                      <p className="text-[#6f7468]">Due</p>
                      <p className="font-mono font-semibold">{due ? "Now" : reviewCard.dueAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <form action={gradeReviewCard} className="flex flex-wrap gap-2">
                    <input type="hidden" name="reviewCardId" value={reviewCard.id} />
                    {[1, 3, 5].map((grade) => (
                      <Button key={grade} name="grade" value={grade} type="submit" variant={grade === 5 ? "primary" : "secondary"}>
                        {grade === 1 ? "Forgot" : grade === 3 ? "Hard" : "Easy"}
                      </Button>
                    ))}
                  </form>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
