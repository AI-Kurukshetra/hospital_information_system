import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { postgresUuidField } from "@/lib/validation";

const bedUpdateSchema = z.object({
  status: z.enum(["available", "occupied", "housekeeping", "maintenance"]),
  patient_id: postgresUuidField.nullable().optional(),
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

  const parsed = bedUpdateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const { data: bed, error: bedError } = await supabase
    .from("beds")
    .update(parsed.data)
    .eq("id", id)
    .select("*")
    .single();

  if (bedError) {
    return NextResponse.json({ error: bedError.message }, { status: 500 });
  }

  return NextResponse.json({ bed });
}
