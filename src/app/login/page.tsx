import { redirect } from "next/navigation";
import { LoginForm } from "@/components/app/auth-forms";
import { PublicShell } from "@/components/app/public-shell";
import { Panel } from "@/components/ui/product";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ callbackUrl?: string; registered?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  const params = await searchParams;

  return (
    <PublicShell>
      <div className="mx-auto max-w-xl">
        <Panel className="p-5 md:p-6">
          <h2 className="text-2xl font-semibold tracking-tight">Log in</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Use your username and password.</p>
          <div className="mt-6">
            <LoginForm callbackUrl={params.callbackUrl} registered={params.registered === "1"} />
          </div>
        </Panel>
      </div>
    </PublicShell>
  );
}
