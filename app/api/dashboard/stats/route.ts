import { NextResponse } from "next/server";
import { requireApiRoles } from "@/lib/api-auth";
import { getDashboardStats } from "@/lib/dashboard";

export async function GET() {
  const context = await requireApiRoles([
    "admin",
    "physician",
    "nurse",
    "billing",
    "receptionist",
  ]);

  if ("error" in context) {
    return context.error;
  }

  const stats = await getDashboardStats(
    context.supabase,
    context.profile.org_id ?? "",
  );

  return NextResponse.json({ stats, role: context.profile.role });
}
