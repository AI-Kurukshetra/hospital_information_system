import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const dischargeSchema = z.object({
  action: z.literal("discharge"),
});

export async function PATCH(
  request: Request,
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

  const parsed = dischargeSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const { data: encounterId, error: rpcError } = await supabase.rpc(
    "discharge_encounter",
    {
      p_encounter_id: id,
      p_org_id: profile.org_id,
    },
  );

  if (rpcError || !encounterId) {
    return NextResponse.json(
      { error: rpcError?.message ?? "Unable to discharge encounter." },
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

  return NextResponse.json({ encounter });
}
