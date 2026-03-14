import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [{ id }, { data: profile }] = await Promise.all([
    params,
    supabase
      .from("user_profiles")
      .select("org_id, role")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  if (
    !profile?.org_id ||
    !["admin", "physician", "nurse", "receptionist"].includes(profile.role)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [{ data: patient, error: patientError }, { data: encounters, error: encounterError }] =
    await Promise.all([
      supabase
        .from("patients")
        .select("*")
        .eq("id", id)
        .eq("org_id", profile.org_id)
        .single(),
      supabase
        .from("encounters")
        .select("*")
        .eq("patient_id", id)
        .order("created_at", { ascending: false }),
    ]);

  if (patientError) {
    return NextResponse.json({ error: patientError.message }, { status: 404 });
  }

  if (encounterError) {
    return NextResponse.json({ error: encounterError.message }, { status: 500 });
  }

  return NextResponse.json({
    patient,
    encounters: encounters ?? [],
  });
}
