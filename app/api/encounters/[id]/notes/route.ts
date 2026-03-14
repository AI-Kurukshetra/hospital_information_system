import { NextResponse } from "next/server";
import { requireApiRoles } from "@/lib/api-auth";
import { clinicalNotePayloadSchema, encounterParamSchema } from "@/lib/clinical";

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
    .from("clinical_notes")
    .select("*")
    .eq("encounter_id", parsedParams.data.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ notes: data ?? [] });
}

export async function POST(
  request: Request,
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

  const parsedBody = clinicalNotePayloadSchema.safeParse(await request.json());

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: parsedBody.error.issues[0]?.message ?? "Invalid payload." },
      { status: 400 },
    );
  }

  const { data, error } = await context.supabase
    .from("clinical_notes")
    .insert({
      encounter_id: parsedParams.data.id,
      author_id: context.profile.id,
      ...parsedBody.data,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      note: {
        ...data,
        author_name: context.profile.full_name,
      },
    },
    { status: 201 },
  );
}
