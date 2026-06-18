import Link from "next/link";
import { CalendarDays, Pencil, Route, Target, Timer, UserRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { InlineStat, MetricCard, PageHeader } from "@/components/ui/product";
import { requireCurrentUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { formatDuration, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireCurrentUser();
  const db = getPrisma();

  const [totalSessions, averageAccuracy, bestFullDeck, paoCards, routesCreated] = await Promise.all([
    db.trainingSession.count({ where: { userId: user.id, status: "COMPLETED" } }),
    db.trainingSession.aggregate({
      where: { userId: user.id, status: "COMPLETED" },
      _avg: { accuracy: true }
    }),
    db.trainingSession.findFirst({
      where: {
        userId: user.id,
        status: "COMPLETED",
        mode: "FULL_DECK",
        totalTimeMs: { not: null }
      },
      orderBy: { totalTimeMs: "asc" },
      select: { totalTimeMs: true, score: true, accuracy: true }
    }),
    db.cardImage.count({ where: { userId: user.id } }),
    db.palace.count({ where: { userId: user.id } })
  ]);

  const profile = user.profile;
  const displayName = profile?.displayName || user.username;
  const paoCompletion = Math.min(1, paoCards / 52);

  return (
    <div className="space-y-6">
      <PageHeader
        label="Profile"
        title={displayName}
        description="Your Palace52 identity and private training summary."
        action={
          <ButtonLink href="/profile/edit" className="h-11">
            <Pencil className="size-4" />
            Edit profile
          </ButtonLink>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Sessions" value={totalSessions.toString()} helper="completed attempts" icon={<Target className="size-5" />} />
        <MetricCard label="Average accuracy" value={formatPercent(averageAccuracy._avg.accuracy ?? 0)} helper="across completed sessions" icon={<Target className="size-5" />} />
        <MetricCard label="Best full deck" value={bestFullDeck?.totalTimeMs ? formatDuration(bestFullDeck.totalTimeMs) : "No run"} helper={bestFullDeck ? `${bestFullDeck.score}/52 latest best` : "complete a full deck"} icon={<Timer className="size-5" />} tone="accent" />
        <MetricCard label="PAO completion" value={formatPercent(paoCompletion)} helper={`${paoCards}/52 cards`} icon={<Route className="size-5" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="size-5 text-[var(--accent)]" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InlineStat label="Username" value={user.username} />
            <InlineStat label="Display name" value={displayName} />
            <InlineStat label="Joined" value={user.createdAt.toLocaleDateString()} />
            <InlineStat label="Profile visibility" value={profile?.isPublic ? "Public" : "Private"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="size-5 text-[var(--accent)]" />
              Training identity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="flex size-16 items-center justify-center rounded-lg text-2xl font-semibold text-white"
              style={{ backgroundColor: profile?.avatarColor ?? "#0e765c" }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
            <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
              {profile?.bio || "Add a short note about your memory training goals, route style, or current deck target."}
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <InlineStat label="Routes created" value={routesCreated.toString()} />
              <InlineStat label="Best full deck accuracy" value={bestFullDeck ? formatPercent(bestFullDeck.accuracy) : "No run"} />
            </div>
            <Link href="/settings" className="inline-flex text-sm font-semibold text-[var(--accent)]">
              Review account settings
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
