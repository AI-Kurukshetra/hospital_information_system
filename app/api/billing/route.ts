import { NextResponse } from "next/server";
import { requireApiRoles } from "@/lib/api-auth";
import { createBillingRecord, getBillingDashboardData } from "@/lib/billing";
import { postgresUuidField } from "@/lib/validation";
import { z } from "zod";

const createBillingRecordSchema = z.object({
  encounter_id: postgresUuidField,
  patient_id: postgresUuidField,
  payer: z.string().trim().optional().or(z.literal("")),
});

export async function GET() {
  const context = await requireApiRoles(["admin", "billing"]);

  if ("error" in context) {
    return context.error;
  }

  const data = await getBillingDashboardData(context.supabase);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const context = await requireApiRoles(["admin", "billing"]);

  if ("error" in context) {
    return context.error;
  }

  const parsed = createBillingRecordSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload." },
      { status: 400 },
    );
  }

  const record = await createBillingRecord(context.supabase, {
    encounter_id: parsed.data.encounter_id,
    patient_id: parsed.data.patient_id,
    payer: parsed.data.payer || null,
  });

  return NextResponse.json({ record }, { status: 201 });
}
