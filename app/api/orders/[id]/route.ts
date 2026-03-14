import { NextResponse } from "next/server";
import { requireApiRoles } from "@/lib/api-auth";
import { encounterParamSchema, orderStatusPayloadSchema } from "@/lib/clinical";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const context = await requireApiRoles(["admin", "physician", "nurse"]);

  if ("error" in context) {
    return context.error;
  }

  const parsedParams = encounterParamSchema.safeParse(await params);

  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid order id." }, { status: 400 });
  }

  const parsedBody = orderStatusPayloadSchema.safeParse(await request.json());

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: parsedBody.error.issues[0]?.message ?? "Invalid payload." },
      { status: 400 },
    );
  }

  const nextStatus = parsedBody.data.status;
  const { data, error } = await context.supabase
    .from("orders")
    .update({
      status: nextStatus,
      completed_at:
        nextStatus === "completed" ? new Date().toISOString() : null,
    })
    .eq("id", parsedParams.data.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ order: data });
}
