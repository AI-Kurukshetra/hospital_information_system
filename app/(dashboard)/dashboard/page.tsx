import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireSession } from "@/lib/auth";

export default async function DashboardPage() {
  const { profile } = await requireSession();

  return <DashboardShell role={profile.role} fullName={profile.full_name} />;
}
