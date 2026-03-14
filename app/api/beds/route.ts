import { NextResponse } from "next/server";
import { getBedBoardData } from "@/lib/beds";
import { createClient } from "@/lib/supabase/server";

async function getAuthorizedContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, profile: null };
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("org_id, role")
    .eq("id", user.id)
    .maybeSingle();

  return { supabase, profile };
}

export async function GET() {
  const { supabase, profile } = await getAuthorizedContext();

  if (
    !profile?.org_id ||
    !["admin", "physician", "nurse", "receptionist"].includes(profile.role)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getBedBoardData(supabase, profile.org_id);
  return NextResponse.json({ beds: data.beds });
}
