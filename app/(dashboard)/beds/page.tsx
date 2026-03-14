import { AccessDenied } from "@/components/layout/access-denied";
import { ModulePlaceholder } from "@/components/dashboard/module-placeholder";
import { requireRole } from "@/lib/auth";

export default async function BedsPage() {
  const { unauthorized } = await requireRole([
    "admin",
    "physician",
    "nurse",
    "receptionist",
  ]);

  if (unauthorized) {
    return (
      <AccessDenied description="Bed management is not available to billing users." />
    );
  }

  return (
    <ModulePlaceholder
      title="Bed Management"
      summary="Sprint 1 will replace this placeholder with the live bed grid, admission dialogs, and discharge workflow connected to Supabase Realtime."
      bullets={[
        "Department-scoped bed grid with occupancy stats",
        "Realtime bed status updates from Supabase",
        "Admit flow creates encounters and updates patient status",
        "Discharge flow moves beds to housekeeping and closes the encounter",
      ]}
    />
  );
}
