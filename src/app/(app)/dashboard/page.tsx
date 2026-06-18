import { Brain, CheckCircle2, Dumbbell, Target } from "lucide-react";
import { ensureStarterContent } from "@/app/actions/onboarding";
import { ProgressChart } from "@/components/app/progress-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { MetricCard, PageHeader } from "@/components/ui/product";
import { requireCurrentUser } from "@/lib/auth";
import { calculateDashboardStats } from "@/lib/dashboard";
import { getPrisma } from "@/lib/prisma";
import { hasRequiredAppConfig } from "@/lib/runtime-config";
import { formatPercent } from "@/lib/utils";

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
  const stats = calculateDashboardStats(sessions);

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
        <Card>
          <CardHeader>
            <CardTitle>Weakest cards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.weakestCards.length === 0 ? (
              <p className="text-sm text-[#6f7468]">No mistakes yet. Complete a recall session to discover weak cards.</p>
            ) : (
              stats.weakestCards.map((card) => (
                <div key={card.label} className="flex items-center justify-between rounded-md bg-[#f6f7f3] px-3 py-2 text-sm">
                  <span>{card.label}</span>
                  <span className="font-mono text-[#0f7a5f]">{card.count}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
