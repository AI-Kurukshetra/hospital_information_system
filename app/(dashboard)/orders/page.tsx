import { AccessDenied } from "@/components/layout/access-denied";
import { ModulePlaceholder } from "@/components/dashboard/module-placeholder";
import { requireRole } from "@/lib/auth";

export default async function OrdersPage() {
  const { unauthorized } = await requireRole(["admin", "physician", "nurse"]);

  if (unauthorized) {
    return (
      <AccessDenied description="Orders are limited to clinical and administrator roles." />
    );
  }

  return (
    <ModulePlaceholder
      title="Orders Queue"
      summary="Sprint 2 will convert this route into the cross-patient active orders queue for nurses and physicians."
      bullets={[
        "Priority-first queue for pending and in-progress orders",
        "Department and order-type filtering",
        "Quick status transitions on active orders",
        "Links back to the patient chart for context",
      ]}
    />
  );
}
