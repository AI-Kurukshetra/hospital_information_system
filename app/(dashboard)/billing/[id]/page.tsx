import { notFound } from "next/navigation";
import { BillingDetailClient } from "@/components/billing/billing-detail-client";
import { AccessDenied } from "@/components/layout/access-denied";
import { requireRole } from "@/lib/auth";
import { getBillingDetail } from "@/lib/billing";
import { createClient } from "@/lib/supabase/server";

export default async function BillingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [access, { id }, supabase] = await Promise.all([
    requireRole(["admin", "billing"]),
    params,
    createClient(),
  ]);
  const { unauthorized } = access;

  if (unauthorized) {
    return (
      <AccessDenied description="Billing records are restricted to billing staff and administrators." />
    );
  }

  const detail = await getBillingDetail(supabase, id);

  if (!detail) {
    notFound();
  }

  return <BillingDetailClient detail={detail} />;
}
