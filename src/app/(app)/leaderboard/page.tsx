import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/product";
import { getPrisma } from "@/lib/prisma";
import { hasRequiredAppConfig } from "@/lib/runtime-config";
import { formatDuration, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  if (!hasRequiredAppConfig()) return null;

  const entries = await getPrisma().leaderboardEntry.findMany({
    include: { user: { include: { profile: true } } },
    orderBy: [{ score: "desc" }, { totalTimeMs: "asc" }],
    take: 50
  });

  return (
    <div className="space-y-6">
      <PageHeader
        label="Leaderboard"
        title="Top public training scores"
        description="Ranks favor higher score first, then faster total memorization and recall time."
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="size-5 text-[#0f7a5f]" />
            Full platform rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-[#edf0e8] text-[#6f7468]">
                <tr>
                  <th className="py-3 pr-4 font-medium">Rank</th>
                  <th className="py-3 pr-4 font-medium">Athlete</th>
                  <th className="py-3 pr-4 font-medium">Mode</th>
                  <th className="py-3 pr-4 font-medium">Score</th>
                  <th className="py-3 pr-4 font-medium">Accuracy</th>
                  <th className="py-3 pr-4 font-medium">Total time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf0e8]">
                {entries.map((entry, index) => (
                  <tr key={entry.id} className={index < 3 ? "bg-[var(--card-muted)]" : ""}>
                    <td className="py-3 pr-4 font-mono font-semibold">{index + 1}</td>
                    <td className="py-3 pr-4 font-medium">{entry.user.profile?.displayName ?? entry.user.username}</td>
                    <td className="py-3 pr-4">{entry.mode.replace("_", " ")}</td>
                    <td className="py-3 pr-4 font-mono">{entry.score}</td>
                    <td className="py-3 pr-4 font-mono">{formatPercent(entry.accuracy)}</td>
                    <td className="py-3 pr-4 font-mono">{formatDuration(entry.totalTimeMs)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {entries.length === 0 && <p className="py-8 text-center text-sm text-[#6f7468]">No leaderboard entries yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
