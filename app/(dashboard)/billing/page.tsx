import { ModulePlaceholder } from "@/components/dashboard/module-placeholder";
import { AccessDenied } from "@/components/layout/access-denied";
import { requireRole } from "@/lib/auth";

export default async function BillingPage() {
  const { unauthorized } = await requireRole(["admin", "billing"]);

  if (unauthorized) {
    return (
      <AccessDenied description="Billing records are restricted to billing staff and administrators by the MVP security gate." />
    );
  }

  return (
    <ModulePlaceholder
      title="Billing"
      summary="Sprint 3 will implement claim records, line items, financial summaries, and status transitions on this route."
      bullets={[
        "Encounter-linked billing records with draft, submitted, paid, and denied states",
        "Editable CPT-based line items and automatic totals",
        "Summary cards for billed, collected, outstanding, and denied claims",
        "Route remains role-restricted to billing staff and administrators",
      ]}
    />
  );
}
