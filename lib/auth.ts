import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserProfile, UserRole } from "@/types";

const DEFAULT_ROLE: UserRole = "receptionist";

function normalizeRole(role: string | null | undefined): UserRole {
  if (
    role === "admin" ||
    role === "physician" ||
    role === "nurse" ||
    role === "billing" ||
    role === "receptionist"
  ) {
    return role;
  }

  return DEFAULT_ROLE;
}

export const getCurrentSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("id, org_id, role, full_name, npi, department_id")
    .eq("id", user.id)
    .maybeSingle();

  const missingProfile =
    error?.code === "PGRST205" ||
    error?.message?.toLowerCase().includes("user_profiles");

  const safeProfile: UserProfile = {
    id: user.id,
    org_id:
      profile?.org_id ??
      (typeof user.user_metadata?.org_id === "string"
        ? user.user_metadata.org_id
        : null),
    role: normalizeRole(profile?.role ?? user.user_metadata?.role),
    full_name:
      profile?.full_name ??
      user.user_metadata?.full_name ??
      user.email?.split("@")[0] ??
      "Healthland User",
    npi: profile?.npi ?? null,
    department_id: profile?.department_id ?? null,
    email: user.email ?? null,
  };

  if (error && !missingProfile) {
    throw new Error(error.message);
  }

  return {
    user,
    profile: safeProfile,
  };
});

export async function requireSession() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireSession();

  if (!allowedRoles.includes(session.profile.role)) {
    return {
      ...session,
      unauthorized: true as const,
    };
  }

  return {
    ...session,
    unauthorized: false as const,
  };
}

export function isAdmin(role: UserRole) {
  return role === "admin";
}

export function canAccessBilling(role: UserRole) {
  return role === "admin" || role === "billing";
}

export function getRoleHome(role: UserRole) {
  if (role === "billing") {
    return "/billing";
  }

  return "/dashboard";
}
