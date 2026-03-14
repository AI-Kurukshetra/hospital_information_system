import { NextResponse } from "next/server";
import { requireApiRoles } from "@/lib/api-auth";
import {
  billingRecordPatchSchema,
  getBillingDetail,
  updateBillingRecord,
} from "@/lib/billing";
import { encounterParamSchema } from "@/lib/clinical";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const context = await requireApiRoles(["admin", "billing"]);

  if ("error" in context) {
    return context.error;
  }

  const parsedParams = encounterParamSchema.safeParse(await params);

  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid billing record id." }, { status: 400 });
  }

  const detail = await getBillingDetail(context.supabase, parsedParams.data.id);

  if (!detail) {
    return NextResponse.json({ error: "Billing record not found." }, { status: 404 });
  }

  return NextResponse.json(detail);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const context = await requireApiRoles(["admin", "billing"]);

  if ("error" in context) {
    return context.error;
  }

  const [parsedParams, parsedBody] = await Promise.all([
    encounterParamSchema.safeParseAsync(await params),
    billingRecordPatchSchema.safeParseAsync(await request.json()),
  ]);

  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid billing record id." }, { status: 400 });
  }

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: parsedBody.error.issues[0]?.message ?? "Invalid payload." },
      { status: 400 },
    );
  }

  const updated = await updateBillingRecord(
    context.supabase,
    parsedParams.data.id,
    parsedBody.data,
  );

  return NextResponse.json(updated);
}
