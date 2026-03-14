import { AccessDenied } from "@/components/layout/access-denied";
import { ModulePlaceholder } from "@/components/dashboard/module-placeholder";
import { requireRole } from "@/lib/auth";

export default async function PatientChartPlaceholderPage() {
  const { unauthorized } = await requireRole(["admin", "physician", "nurse"]);

  if (unauthorized) {
    return (
      <AccessDenied description="Clinical chart access is limited to physicians, nurses, and administrators." />
    );
  }

  return (
    <ModulePlaceholder
      title="Patient Chart"
      summary="Sprint 2 will expand this route into the full EHR view with encounter overview, vitals, diagnoses, orders, notes, and billing handoff."
      bullets={[
        "Encounter header with attending physician, bed, and status",
        "Vitals history with abnormal highlighting",
        "Orders and notes tabs for physician and nursing workflows",
        "Billing handoff link for the encounter record",
      ]}
    />
  );
}
