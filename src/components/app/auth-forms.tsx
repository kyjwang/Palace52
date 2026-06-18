"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import {
  loginAction,
  registerAction,
  updateProfileAction,
  type AuthActionState
} from "@/app/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/form";

const initialState: AuthActionState = { ok: false };

export function LoginForm({
  callbackUrl,
  registered
}: {
  callbackUrl?: string;
  registered?: boolean;
}) {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="space-y-4">
      {registered ? (
        <div className="flex gap-2 rounded-md border border-[var(--border)] bg-[var(--accent-soft)] p-3 text-sm text-[var(--accent)]">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          Account created. Log in to start training.
        </div>
      ) : null}
      {state.message ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{state.message}</div>
      ) : null}
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? "/dashboard"} />
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" name="username" autoComplete="username" required minLength={3} maxLength={20} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <Button type="submit" className="h-11 w-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
        Log in
      </Button>
      <p className="text-center text-sm text-[var(--muted)]">
        New to Palace52?{" "}
        <Link href="/register" className="font-semibold text-[var(--accent)]">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initialState);

  return (
    <form action={action} className="space-y-4">
      {state.message ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{state.message}</div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" name="username" autoComplete="username" required minLength={3} maxLength={20} />
        <FieldError messages={state.fieldErrors?.username} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
        <FieldError messages={state.fieldErrors?.password} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} />
        <FieldError messages={state.fieldErrors?.confirmPassword} />
      </div>
      <Button type="submit" className="h-11 w-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
        Create account
      </Button>
      <p className="text-center text-sm text-[var(--muted)]">
        Already training?{" "}
        <Link href="/login" className="font-semibold text-[var(--accent)]">
          Log in
        </Link>
      </p>
    </form>
  );
}

export function ProfileEditForm({
  profile
}: {
  profile: {
    displayName?: string | null;
    bio?: string | null;
    avatarColor?: string | null;
    isPublic?: boolean | null;
  };
}) {
  const [state, action, pending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={action} className="space-y-4">
      {state.message ? (
        <div
          className={
            state.ok
              ? "rounded-md border border-[var(--border)] bg-[var(--accent-soft)] p-3 text-sm text-[var(--accent)]"
              : "rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          }
        >
          {state.message}
        </div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="displayName">Display name</Label>
        <Input id="displayName" name="displayName" defaultValue={profile.displayName ?? ""} maxLength={80} />
        <FieldError messages={state.fieldErrors?.displayName} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" defaultValue={profile.bio ?? ""} maxLength={280} />
        <FieldError messages={state.fieldErrors?.bio} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="avatarColor">Avatar color</Label>
        <Input id="avatarColor" name="avatarColor" type="color" defaultValue={profile.avatarColor ?? "#0e765c"} />
        <FieldError messages={state.fieldErrors?.avatarColor} />
      </div>
      <label className="flex items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--card-muted)] p-3 text-sm">
        <input name="isPublic" type="checkbox" defaultChecked={Boolean(profile.isPublic)} className="size-4 accent-[var(--accent)]" />
        Make profile public
      </label>
      <Button type="submit" className="h-11 w-full sm:w-auto" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
        Save profile
      </Button>
    </form>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="text-xs text-red-600">{messages[0]}</p>;
}
