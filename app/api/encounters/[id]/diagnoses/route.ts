import { NextResponse } from "next/server";
import { requireApiRoles } from "@/lib/api-auth";
import { diagnosisPayloadSchema, encounterParamSchema } from "@/lib/clinical";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const context = await requireApiRoles(["admin", "physician", "nurse"]);

  if ("error" in context) {
    return context.error;
  }

  const parsedParams = encounterParamSchema.safeParse(await params);

  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid encounter id." }, { status: 400 });
  }

  const { data, error } = await context.supabase
    .from("diagnoses")
    .select("*")
    .eq("encounter_id", parsedParams.data.id)
    .order("added_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ diagnoses: data ?? [] });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const context = await requireApiRoles(["admin", "physician"]);

  if ("error" in context) {
    return context.error;
  }

  const parsedParams = encounterParamSchema.safeParse(await params);

  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid encounter id." }, { status: 400 });
  }

  const parsedBody = diagnosisPayloadSchema.safeParse(await request.json());

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: parsedBody.error.issues[0]?.message ?? "Invalid payload." },
      { status: 400 },
    );
  }

  const { data, error } = await context.supabase
    .from("diagnoses")
    .insert({
      encounter_id: parsedParams.data.id,
      added_by: context.profile.id,
      ...parsedBody.data,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ diagnosis: data }, { status: 201 });
}
