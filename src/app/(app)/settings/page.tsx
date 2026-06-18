import { Settings, ShieldCheck, UserRound } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, InlineStat } from "@/components/ui/product";
import { requireCurrentUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { hasRequiredAppConfig } from "@/lib/runtime-config";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  if (!hasRequiredAppConfig()) return null;

  const user = await requireCurrentUser();
  const [routesCreated, cardImages, sessions] = await Promise.all([
    getPrisma().palace.count({ where: { userId: user.id } }),
    getPrisma().cardImage.count({ where: { userId: user.id } }),
    getPrisma().trainingSession.count({ where: { userId: user.id } })
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        label="Settings"
        title="Profile and training preferences"
        description="Keep account status visible and make the training defaults easy to audit before each session."
        action={<ButtonLink href="/profile/edit" className="h-11">Edit profile</ButtonLink>}
      />

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="size-5 text-[var(--accent)]" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InlineStat label="Username" value={user.username} />
            <InlineStat label="Display name" value={user.profile?.displayName ?? user.username} />
            <InlineStat label="Account source" value="Palace52 credentials" />
            <InlineStat label="Visibility" value={user.profile?.isPublic ? "Public" : "Private"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="size-5 text-[var(--accent)]" />
              Training defaults
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <InlineStat label="Full PAO route" value="18 loci" />
            <InlineStat label="Deck system" value="52 cards" />
            <InlineStat label="Recall method" value="Ordered deck" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-[var(--accent)]" />
            Safety
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <InlineStat label="Routes owned" value={routesCreated.toString()} />
          <InlineStat label="PAO cards owned" value={`${cardImages}/52`} />
          <InlineStat label="Sessions owned" value={sessions.toString()} />
        </CardContent>
      </Card>
    </div>
  );
}
