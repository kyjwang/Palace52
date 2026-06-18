import { UserRound } from "lucide-react";
import { ProfileEditForm } from "@/components/app/auth-forms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/product";
import { requireCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function EditProfilePage() {
  const user = await requireCurrentUser();

  return (
    <div className="space-y-6">
      <PageHeader
        label="Edit profile"
        title="Tune your Palace52 identity"
        description="Username changes are disabled for the MVP. You can update public profile fields and visual identity."
      />

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="size-5 text-[var(--accent)]" />
              Locked account fields
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md bg-[var(--card-muted)] p-3">
              <p className="text-xs text-[var(--muted)]">Username</p>
              <p className="mt-1 font-mono text-sm font-semibold">{user.username}</p>
            </div>
            <p className="text-sm leading-6 text-[var(--muted)]">
              Usernames are stable identifiers for this MVP, so they cannot be edited yet.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile fields</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileEditForm profile={user.profile ?? {}} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
