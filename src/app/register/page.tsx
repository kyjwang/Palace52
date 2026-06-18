import { redirect } from "next/navigation";
import { KeyRound, UserRound } from "lucide-react";
import { RegisterForm } from "@/components/app/auth-forms";
import { PublicShell } from "@/components/app/public-shell";
import { Panel } from "@/components/ui/product";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <PublicShell>
      <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[1fr_420px]">
        <Panel className="bg-black p-6 text-white md:p-8">
          <p className="text-sm font-semibold text-[var(--accent)]">Start training</p>
          <h1 className="mt-3 max-w-xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            Create your memory account.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/64">
            Palace52 only needs a username and password for the MVP. Add your profile details after registration.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-white/10 bg-white/[0.06] p-4">
              <UserRound className="size-5 text-[var(--accent)]" />
              <p className="mt-3 text-sm font-semibold">Username only</p>
              <p className="mt-1 text-xs leading-5 text-white/55">No email is required to build your PAO system.</p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.06] p-4">
              <KeyRound className="size-5 text-[var(--accent)]" />
              <p className="mt-3 text-sm font-semibold">Bcrypt hashing</p>
              <p className="mt-1 text-xs leading-5 text-white/55">Your raw password is never stored in the database.</p>
            </div>
          </div>
        </Panel>

        <Panel className="p-5 md:p-6">
          <h2 className="text-2xl font-semibold tracking-tight">Register</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Choose a lowercase username and a strong password.</p>
          <div className="mt-6">
            <RegisterForm />
          </div>
        </Panel>
      </div>
    </PublicShell>
  );
}
