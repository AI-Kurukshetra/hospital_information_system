import { ModulePlaceholder } from "@/components/dashboard/module-placeholder";
import { AccessDenied } from "@/components/layout/access-denied";
import { requireRole } from "@/lib/auth";

export default async function AdminPage() {
  const { unauthorized } = await requireRole(["admin"]);

  if (unauthorized) {
    return (
      <AccessDenied description="System administration, metrics, and deployment controls are limited to the admin role." />
    );
  }

  return (
    <ModulePlaceholder
      title="Admin Dashboard"
      summary="Sprint 4 will replace this page with KPI cards, census, occupancy breakdowns, and recent activity for the full demo path."
      bullets={[
        "Census, occupancy, admissions, discharges, and billing draft metrics",
        "Recent activity feed across admissions and discharges",
        "Department bed occupancy visualization",
        "Demo-readiness checklist before Vercel deployment",
      ]}
    />
  );
}
