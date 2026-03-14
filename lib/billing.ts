import { z } from "zod";
import type {
  BillingLineItem,
  BillingRecord,
  Encounter,
  Patient,
} from "@/types";

type SupabaseLike = Awaited<
  ReturnType<typeof import("@/lib/supabase/server").createClient>
>;

const optionalCurrency = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? Number(trimmed) : null;
  }

  return value;
}, z.number().nonnegative().nullable());

export const billingLineItemSchema = z.object({
  id: z.string().trim().optional(),
  cpt_code: z.string().trim().optional().or(z.literal("")),
  description: z.string().trim().min(1, "Description is required."),
  quantity: z.preprocess((value) => Number(value), z.number().int().positive()),
  unit_price: z.preprocess((value) => Number(value), z.number().nonnegative()),
});

export const billingRecordPatchSchema = z.object({
  claim_status: z.enum(["draft", "submitted", "paid", "denied"]),
  payer: z.string().trim().optional().or(z.literal("")),
  reimbursement_rate: z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) {
      return 0;
    }

    return Number(value);
  }, z.number().min(0).max(100)),
  notes: z.string().trim().optional().or(z.literal("")),
  line_items: z.array(billingLineItemSchema).min(1, "At least one line item is required."),
  submitted_at: z.string().datetime().nullable().optional(),
  total_charges: optionalCurrency.optional(),
  expected_reimbursement: optionalCurrency.optional(),
  patient_responsibility: optionalCurrency.optional(),
});

export interface BillingListItem extends BillingRecord {
  patient_name: string;
  patient_mrn: string;
  encounter_date: string | null;
}

export interface BillingSummary {
  total_billed: number;
  collected: number;
  outstanding: number;
  denied_amount: number;
  denied_count: number;
  draft_count: number;
  submitted_count: number;
}

export interface BillingDetail {
  record: BillingRecord;
  patient: Patient | null;
  encounter: Encounter | null;
  line_items: BillingLineItem[];
}

export const cptSuggestions = [
  { code: "99213", description: "Office visit established (moderate)", unit_price: 175 },
  { code: "99214", description: "Office visit established (high)", unit_price: 240 },
  { code: "99221", description: "Initial hospital care", unit_price: 850 },
  { code: "99222", description: "Initial hospital care moderate", unit_price: 1200 },
  { code: "85025", description: "CBC with differential", unit_price: 125 },
  { code: "80053", description: "Comprehensive metabolic panel", unit_price: 160 },
  { code: "71046", description: "Chest X-Ray 2 views", unit_price: 220 },
  { code: "93000", description: "EKG with interpretation", unit_price: 275 },
  { code: "99232", description: "Subsequent hospital care", unit_price: 325 },
  { code: "99238", description: "Hospital discharge", unit_price: 410 },
] as const;

export async function getBillingDashboardData(
  supabase: SupabaseLike,
): Promise<{ records: BillingListItem[]; summary: BillingSummary }> {
  const { data: records, error } = await supabase
    .from("billing_records")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const billingRecords = (records ?? []) as BillingRecord[];
  const patientIds = Array.from(new Set(billingRecords.map((record) => record.patient_id)));
  const encounterIds = Array.from(new Set(billingRecords.map((record) => record.encounter_id)));

  const [
    { data: patients, error: patientsError },
    { data: encounters, error: encountersError },
  ] = await Promise.all([
    patientIds.length
      ? supabase
          .from("patients")
          .select("id, mrn, first_name, last_name")
          .in("id", patientIds)
      : Promise.resolve({ data: [], error: null }),
    encounterIds.length
      ? supabase
          .from("encounters")
          .select("id, admission_date")
          .in("id", encounterIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (patientsError) {
    throw new Error(patientsError.message);
  }

  if (encountersError) {
    throw new Error(encountersError.message);
  }

  const patientMap = new Map(
    (patients ?? []).map((patient) => [
      patient.id,
      {
        name: `${patient.first_name} ${patient.last_name}`.trim(),
        mrn: patient.mrn,
      },
    ]),
  );
  const encounterMap = new Map(
    (encounters ?? []).map((encounter) => [encounter.id, encounter.admission_date]),
  );

  const summary = billingRecords.reduce<BillingSummary>(
    (accumulator, record) => {
      accumulator.total_billed += record.total_charges;

      if (record.claim_status === "paid") {
        accumulator.collected += record.total_charges;
      }

      if (record.claim_status === "submitted") {
        accumulator.outstanding += record.total_charges;
        accumulator.submitted_count += 1;
      }

      if (record.claim_status === "denied") {
        accumulator.denied_amount += record.total_charges;
        accumulator.denied_count += 1;
      }

      if (record.claim_status === "draft") {
        accumulator.draft_count += 1;
      }

      return accumulator;
    },
    {
      total_billed: 0,
      collected: 0,
      outstanding: 0,
      denied_amount: 0,
      denied_count: 0,
      draft_count: 0,
      submitted_count: 0,
    },
  );

  return {
    records: billingRecords.map((record) => ({
      ...record,
      patient_name: patientMap.get(record.patient_id)?.name ?? "Unknown patient",
      patient_mrn: patientMap.get(record.patient_id)?.mrn ?? "MRN unavailable",
      encounter_date: encounterMap.get(record.encounter_id) ?? null,
    })),
    summary,
  };
}

export async function getBillingDetail(
  supabase: SupabaseLike,
  billingRecordId: string,
): Promise<BillingDetail | null> {
  const { data: record, error } = await supabase
    .from("billing_records")
    .select("*")
    .eq("id", billingRecordId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!record) {
    return null;
  }

  const [patientResult, encounterResult, lineItemsResult] = await Promise.all([
    supabase.from("patients").select("*").eq("id", record.patient_id).maybeSingle(),
    supabase.from("encounters").select("*").eq("id", record.encounter_id).maybeSingle(),
    supabase
      .from("billing_line_items")
      .select("*")
      .eq("billing_record_id", record.id)
      .order("description"),
  ]);

  if (patientResult.error) {
    throw new Error(patientResult.error.message);
  }

  if (encounterResult.error) {
    throw new Error(encounterResult.error.message);
  }

  if (lineItemsResult.error) {
    throw new Error(lineItemsResult.error.message);
  }

  return {
    record: record as BillingRecord,
    patient: (patientResult.data as Patient | null) ?? null,
    encounter: (encounterResult.data as Encounter | null) ?? null,
    line_items: (lineItemsResult.data ?? []) as BillingLineItem[],
  };
}

export async function updateBillingRecord(
  supabase: SupabaseLike,
  billingRecordId: string,
  payload: z.infer<typeof billingRecordPatchSchema>,
) {
  const normalizedLineItems = payload.line_items.map((item) => ({
    cpt_code: item.cpt_code || null,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total: Number((item.quantity * item.unit_price).toFixed(2)),
  }));

  const totalCharges = Number(
    normalizedLineItems.reduce((sum, item) => sum + item.total, 0).toFixed(2),
  );
  const expectedReimbursement = Number(
    (totalCharges * (payload.reimbursement_rate / 100)).toFixed(2),
  );
  const patientResponsibility = Number(
    (totalCharges - expectedReimbursement).toFixed(2),
  );

  const recordPatch: Partial<BillingRecord> = {
    claim_status: payload.claim_status,
    payer: payload.payer || null,
    notes: payload.notes || null,
    total_charges: totalCharges,
    expected_reimbursement: expectedReimbursement,
    patient_responsibility: patientResponsibility,
    submitted_at:
      payload.claim_status === "submitted"
        ? payload.submitted_at ?? new Date().toISOString()
        : payload.claim_status === "draft"
          ? null
          : payload.submitted_at ?? null,
  };

  const { data: updatedRecord, error: recordError } = await supabase
    .from("billing_records")
    .update(recordPatch)
    .eq("id", billingRecordId)
    .select("*")
    .single();

  if (recordError) {
    throw new Error(recordError.message);
  }

  const { error: deleteError } = await supabase
    .from("billing_line_items")
    .delete()
    .eq("billing_record_id", billingRecordId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  const { data: lineItems, error: insertError } = await supabase
    .from("billing_line_items")
    .insert(
      normalizedLineItems.map((item) => ({
        billing_record_id: billingRecordId,
        ...item,
      })),
    )
    .select("*");

  if (insertError) {
    throw new Error(insertError.message);
  }

  return {
    record: updatedRecord as BillingRecord,
    line_items: (lineItems ?? []) as BillingLineItem[],
  };
}

export function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export async function createBillingRecord(
  supabase: SupabaseLike,
  payload: {
    encounter_id: string;
    patient_id: string;
    payer?: string | null;
  },
) {
  const { data, error } = await supabase
    .from("billing_records")
    .insert({
      encounter_id: payload.encounter_id,
      patient_id: payload.patient_id,
      payer: payload.payer ?? null,
      claim_status: "draft",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as BillingRecord;
}
