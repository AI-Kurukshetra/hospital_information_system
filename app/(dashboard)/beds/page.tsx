import { AccessDenied } from "@/components/layout/access-denied";
import { BedGrid } from "@/components/beds/bed-grid";
import { getBedBoardData } from "@/lib/beds";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function BedsPage({
  searchParams,
}: {
  searchParams: Promise<{ patient?: string; admit?: string; discharge?: string }>;
}) {
  const [access, params, supabase] = await Promise.all([
    requireRole([
      "admin",
      "physician",
      "nurse",
      "receptionist",
    ]),
    searchParams,
    createClient(),
  ]);
  const { unauthorized } = access;

  if (unauthorized) {
    return (
      <AccessDenied description="Bed management is not available to billing users." />
    );
  }

  const bedBoard = await getBedBoardData(supabase, access.profile.org_id ?? "");

  return (
    <BedGrid
      initialBeds={bedBoard.beds}
      departments={bedBoard.departments}
      patients={bedBoard.patients}
      physicians={bedBoard.physicians}
      prefillPatientId={params.patient ?? null}
      initialAdmitBedId={params.admit ?? null}
      initialDischargeBedId={params.discharge ?? null}
    />
  );
}
