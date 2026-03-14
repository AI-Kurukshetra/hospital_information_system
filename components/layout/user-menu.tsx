"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface UserMenuProps {
  fullName: string;
  role: string;
  email?: string | null;
}

export function UserMenu({ fullName, role, email }: UserMenuProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-700">
          {fullName
            .split(" ")
            .slice(0, 2)
            .map((chunk) => chunk[0])
            .join("")
            .toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {fullName}
          </p>
          <p className="truncate text-xs text-slate-500">
            {email ?? "No email loaded"}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium capitalize text-sky-700">
          {role}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut className="h-3.5 w-3.5" />
          {pending ? "Signing out" : "Sign out"}
        </button>
      </div>
    </div>
  );
}
