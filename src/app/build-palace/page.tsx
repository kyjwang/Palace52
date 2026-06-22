import { PublicShell } from "@/components/app/public-shell";
import { PalaceBuilder } from "@/components/build-palace/palace-builder";
import { requireCurrentUser } from "@/lib/auth";

export default async function BuildPalacePage() {
  await requireCurrentUser();

  return (
    <PublicShell>
      <PalaceBuilder />
    </PublicShell>
  );
}
