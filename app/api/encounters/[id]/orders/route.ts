import { NextResponse } from "next/server";
import { requireApiRoles } from "@/lib/api-auth";
import { encounterParamSchema, orderPayloadSchema } from "@/lib/clinical";

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
    .from("orders")
    .select("*")
    .eq("encounter_id", parsedParams.data.id)
    .order("ordered_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: data ?? [] });
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

  const parsedBody = orderPayloadSchema.safeParse(await request.json());

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: parsedBody.error.issues[0]?.message ?? "Invalid payload." },
      { status: 400 },
    );
  }

  const { data, error } = await context.supabase
    .from("orders")
    .insert({
      encounter_id: parsedParams.data.id,
      ordered_by: context.profile.id,
      ...parsedBody.data,
      frequency: parsedBody.data.frequency || null,
      notes: parsedBody.data.notes || null,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      order: {
        ...data,
        ordered_by_name: context.profile.full_name,
      },
    },
    { status: 201 },
  );
}
