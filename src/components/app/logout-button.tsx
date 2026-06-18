"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth-actions";
import { Button } from "@/components/ui/button";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="secondary" className={compact ? "h-9 px-3" : "h-10"}>
        <LogOut className="size-4" />
        {compact ? null : "Log out"}
      </Button>
    </form>
  );
}
