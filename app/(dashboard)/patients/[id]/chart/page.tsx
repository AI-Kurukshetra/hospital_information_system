import { AccessDenied } from "@/components/layout/access-denied";
import { PatientChartClient } from "@/components/chart/patient-chart-client";
import { requireRole } from "@/lib/auth";
import { getPatientChartData } from "@/lib/clinical";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function PatientChartPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [access, { id }, supabase] = await Promise.all([
    requireRole(["admin", "physician", "nurse"]),
    params,
    createClient(),
  ]);
  const { unauthorized } = access;

  if (unauthorized) {
    return (
      <AccessDenied description="Clinical chart access is limited to physicians, nurses, and administrators." />
    );
  }

  const data = await getPatientChartData(supabase, access.profile.org_id ?? "", id);

  if (!data) {
    notFound();
  }

  return <PatientChartClient data={data} role={access.profile.role} />;
}
