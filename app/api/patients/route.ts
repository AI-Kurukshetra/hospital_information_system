import { NextResponse } from "next/server";
import { patientFormSchema } from "@/lib/patients";
import { createClient } from "@/lib/supabase/server";

async function getProfileContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("org_id, role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  return {
    supabase,
    user,
    profile,
  };
}

export async function GET(request: Request) {
  const { supabase, profile } = await getProfileContext();

  if (
    !profile?.org_id ||
    !["admin", "physician", "nurse", "receptionist"].includes(profile.role)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q")?.trim() ?? "";
  const status = searchParams.get("status")?.trim();
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "20");
  const from = Math.max(page - 1, 0) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("patients")
    .select("*")
    .eq("org_id", profile.org_id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,mrn.ilike.%${search}%,phone.ilike.%${search}%`,
    );
  }

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ patients: data ?? [] });
}

export async function POST(request: Request) {
  const { supabase, profile } = await getProfileContext();

  if (
    !profile?.org_id ||
    !["admin", "physician", "nurse", "receptionist"].includes(profile.role)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = patientFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload." },
      { status: 400 },
    );
  }

  const payload = parsed.data;
  const { data, error } = await supabase
    .from("patients")
    .insert({
      ...payload,
      mrn: "",
      org_id: profile.org_id,
    })
    .select("id, mrn")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ patient: data }, { status: 201 });
}
