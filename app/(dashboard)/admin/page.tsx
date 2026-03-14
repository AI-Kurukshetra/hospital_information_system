import { AccessDenied } from "@/components/layout/access-denied";
import { requireRole } from "@/lib/auth";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getDashboardStats } from "@/lib/dashboard";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const [access, supabase] = await Promise.all([
    requireRole(["admin"]),
    createClient(),
  ]);
  const { unauthorized } = access;

  if (unauthorized) {
    return (
      <AccessDenied description="System administration, metrics, and deployment controls are limited to the admin role." />
    );
  }

  const stats = await getDashboardStats(supabase, access.profile.org_id ?? "");

  return (
    <DashboardClient
      role={access.profile.role}
      fullName={access.profile.full_name}
      initialStats={stats}
    />
  );
}
