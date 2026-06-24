import { ArrowRight, Brain, CheckCircle2, Dumbbell, Target, Trophy } from "lucide-react";
import { ensureStarterContent } from "@/app/actions/onboarding";
import { CardBadge } from "@/components/app/card-badge";
import { ProgressChart } from "@/components/app/progress-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { MetricCard, PageHeader } from "@/components/ui/product";
import { requireCurrentUser } from "@/lib/auth";
import { fullDeck } from "@/lib/cards";
import { calculateDashboardStats } from "@/lib/dashboard";
import { getLeaderboardPreview } from "@/lib/leaderboard";
import { getPrisma } from "@/lib/prisma";
import { hasRequiredAppConfig } from "@/lib/runtime-config";
import { formatFriendlyDuration, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!hasRequiredAppConfig()) return null;

  await ensureStarterContent();
  const user = await requireCurrentUser();
  const sessions = await getPrisma().trainingSession.findMany({
    where: { userId: user.id },
    include: { cardResults: true },
    orderBy: { createdAt: "desc" },
    take: 30
  });
  const dueReviews = await getPrisma().reviewCard.count({
    where: { userId: user.id, dueAt: { lte: new Date() } }
  });
  const leaderboard = await getLeaderboardPreview(user.id);
  const stats = calculateDashboardStats(sessions);
  const cardByLabel = new Map(fullDeck.map((card) => [card.label, card]));

  const metrics = [
    { label: "Best score", value: `${stats.bestScore}/52`, icon: Target },
    { label: "Average accuracy", value: formatPercent(stats.averageAccuracy), icon: CheckCircle2 },
    { label: "Sessions", value: stats.completedSessions.toString(), icon: Dumbbell },
    { label: "Due reviews", value: dueReviews.toString(), icon: Brain }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        label="Training dashboard"
        title={<>Welcome back, {user.profile?.displayName ?? user.username}</>}
        description="Use your palace route, strengthen card images, and turn mistakes into review cards."
        action={<ButtonLink href="/training" className="h-11">Start session</ButtonLink>}
      />

      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <MetricCard key={metric.label} label={metric.label} value={metric.value} icon={<Icon className="size-5" />} />
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Improvement history</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressChart data={stats.trend} />
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weakest cards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.weakestCards.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">No mistakes yet. Complete a recall session to discover weak cards.</p>
              ) : (
                stats.weakestCards.map((card) => {
                  const playingCard = cardByLabel.get(card.label);

                  return (
                    <div key={card.label} className="flex items-center justify-between gap-3 rounded-md bg-[var(--card-muted)] px-3 py-2 text-sm">
                      <div className="flex min-w-0 items-center gap-3">
                        {playingCard && <CardBadge label={playingCard.shortLabel} color={playingCard.color} />}
                        <span className="min-w-0 truncate">{card.label}</span>
                      </div>
                      <span className="font-mono text-[var(--accent)]">{card.count}</span>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="size-5 text-[var(--accent)]" />
                  Leaderboard
                </CardTitle>
                <ButtonLink href="/leaderboard" variant="ghost" className="h-9 px-2.5">
                  <span className="sr-only">View full leaderboard</span>
                  <ArrowRight className="size-4" />
                </ButtonLink>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {leaderboard.topEntries.length === 0 ? (
                <div className="rounded-md border border-dashed border-[var(--border)] bg-[var(--card-muted)] px-3 py-4 text-sm leading-6 text-[var(--muted)]">
                  No completed sessions yet. Be the first to set a score.
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboard.topEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="grid grid-cols-[2.25rem_1fr_auto] items-center gap-3 rounded-md bg-[var(--card-muted)] px-3 py-2.5 text-sm"
                    >
                      <span className="font-mono text-base font-semibold text-[var(--accent)]">#{entry.rank}</span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[var(--foreground)]">{entry.username}</p>
                        <p className="text-xs text-[var(--muted)]">{formatPercent(entry.accuracy)} accuracy</p>
                      </div>
                      <div className="text-right font-mono">
                        <p className="font-semibold text-[var(--foreground)]">{entry.score}/{entry.deckSize}</p>
                        <p className="text-xs text-[var(--muted)]">{formatFriendlyDuration(entry.totalTimeMs)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid gap-2 border-t border-[var(--border)] pt-4 text-sm sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2">
                  <p className="text-xs text-[var(--muted)]">Your rank</p>
                  <p className="mt-1 font-mono font-semibold text-[var(--foreground)]">
                    {leaderboard.currentUserEntry ? `#${leaderboard.currentUserEntry.rank}` : "Not ranked"}
                  </p>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2">
                  <p className="text-xs text-[var(--muted)]">Your best</p>
                  <p className="mt-1 font-mono font-semibold text-[var(--foreground)]">
                    {leaderboard.currentUserEntry
                      ? `${leaderboard.currentUserEntry.score}/${leaderboard.currentUserEntry.deckSize} in ${formatFriendlyDuration(leaderboard.currentUserEntry.totalTimeMs)}`
                      : "No eligible run yet"}
                  </p>
                </div>
              </div>

              <ButtonLink href="/leaderboard" variant="secondary" className="w-full">
                View full leaderboard
                <ArrowRight className="size-4" />
              </ButtonLink>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
