import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { UserProfile, UserRole } from "@/types";

export async function requireApiRoles(allowedRoles: UserRole[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("id, org_id, role, full_name, npi, department_id")
    .eq("id", user.id)
    .maybeSingle();

  if (
    !profile?.org_id ||
    !allowedRoles.includes(profile.role as UserRole)
  ) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return {
    supabase,
    profile: profile as UserProfile,
  };
}
