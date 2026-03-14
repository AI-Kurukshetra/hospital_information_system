import { AccessDenied } from "@/components/layout/access-denied";
import { BillingSummaryCards } from "@/components/billing/billing-summary-cards";
import { BillingTable } from "@/components/billing/billing-table";
import { requireRole } from "@/lib/auth";
import { getBillingDashboardData } from "@/lib/billing";
import { createClient } from "@/lib/supabase/server";

export default async function BillingPage() {
  const [access, supabase] = await Promise.all([
    requireRole(["admin", "billing"]),
    createClient(),
  ]);
  const { unauthorized } = access;

  if (unauthorized) {
    return (
      <AccessDenied description="Billing records are restricted to billing staff and administrators." />
    );
  }

  const data = await getBillingDashboardData(supabase);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-8 bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,transparent_32%),linear-gradient(135deg,#ffffff_0%,#f8fafc_60%,#e0f2fe_100%)] px-8 py-10 lg:grid-cols-[1.45fr_0.85fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Revenue Cycle
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-950">
              Billing & Revenue
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              Review encounter-linked claims, track reimbursement status, and
              edit CPT-based line items across the revenue cycle.
            </p>
          </div>
        </div>
      </section>

      <BillingSummaryCards summary={data.summary} />
      <BillingTable records={data.records} />
    </div>
  );
}
