import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { requireSession } from "@/lib/auth";
import { getDashboardStats } from "@/lib/dashboard";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const [{ profile }, supabase] = await Promise.all([
    requireSession(),
    createClient(),
  ]);
  const stats = await getDashboardStats(supabase, profile.org_id ?? "");

  return (
    <DashboardClient
      role={profile.role}
      fullName={profile.full_name}
      initialStats={stats}
    />
  );
}
