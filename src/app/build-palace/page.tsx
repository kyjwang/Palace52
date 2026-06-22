import { PublicShell } from "@/components/app/public-shell";
import { PalaceBuilder } from "@/components/build-palace/palace-builder";
import { requireCurrentUser } from "@/lib/auth";

export default async function BuildPalacePage() {
  const user = await requireCurrentUser();

  return (
    <PublicShell
      user={{
        username: user.username,
        displayName: user.profile?.displayName,
        avatarColor: user.profile?.avatarColor
      }}
    >
      <PalaceBuilder />
    </PublicShell>
  );
}
