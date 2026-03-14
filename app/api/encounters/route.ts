import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { postgresUuidField } from "@/lib/validation";

const createEncounterSchema = z.object({
  patient_id: postgresUuidField,
  bed_id: postgresUuidField,
  attending_physician_id: postgresUuidField,
  dept_id: postgresUuidField,
  chief_complaint: z.string().trim().optional().or(z.literal("")),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("org_id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (
    !profile?.org_id ||
    !["admin", "physician", "nurse", "receptionist"].includes(profile.role)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = createEncounterSchema.safeParse(await request.json());

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      {
        error: issue
          ? `${issue.path.join(".") || "payload"}: ${issue.message}`
          : "Invalid payload.",
      },
      { status: 400 },
    );
  }

  const payload = parsed.data;
  const { data: encounterId, error: rpcError } = await supabase.rpc("admit_patient", {
    p_patient_id: payload.patient_id,
    p_bed_id: payload.bed_id,
    p_org_id: profile.org_id,
    p_dept_id: payload.dept_id,
    p_attending_physician_id: payload.attending_physician_id,
    p_chief_complaint: payload.chief_complaint ?? null,
  });

  if (rpcError || !encounterId) {
    return NextResponse.json(
      { error: rpcError?.message ?? "Unable to complete admission workflow." },
      { status: 500 },
    );
  }

  const { data: encounter, error: encounterError } = await supabase
    .from("encounters")
    .select("*")
    .eq("id", encounterId)
    .single();

  if (encounterError) {
    return NextResponse.json({ error: encounterError.message }, { status: 500 });
  }

  return NextResponse.json({ encounter }, { status: 201 });
}
