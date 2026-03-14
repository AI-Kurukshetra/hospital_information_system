import { z } from "zod";
import { postgresUuidField } from "@/lib/validation";
import type {
  Bed,
  ClinicalNote,
  Department,
  Diagnosis,
  Encounter,
  Order,
  Patient,
  UserProfile,
  Vitals,
} from "@/types";

type SupabaseLike = Awaited<
  ReturnType<typeof import("@/lib/supabase/server").createClient>
>;

function optionalNumberField(config?: { integer?: boolean }) {
  return z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) {
      return null;
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed ? Number(trimmed) : null;
    }

    return value;
  }, (config?.integer ? z.number().int() : z.number()).nullable());
}

export const vitalsPayloadSchema = z.object({
  bp_systolic: optionalNumberField({ integer: true }),
  bp_diastolic: optionalNumberField({ integer: true }),
  heart_rate: optionalNumberField({ integer: true }),
  temperature: optionalNumberField(),
  o2_saturation: optionalNumberField({ integer: true }),
  respiratory_rate: optionalNumberField({ integer: true }),
  weight_kg: optionalNumberField(),
});

export const diagnosisPayloadSchema = z.object({
  icd10_code: z.string().trim().min(1, "ICD-10 code is required."),
  description: z.string().trim().min(1, "Description is required."),
  diagnosis_type: z.enum(["primary", "secondary"]),
});

export const orderPayloadSchema = z.object({
  order_type: z.enum(["medication", "lab", "imaging", "other"]),
  description: z.string().trim().min(1, "Description is required."),
  frequency: z.string().trim().optional().or(z.literal("")),
  priority: z.enum(["routine", "stat", "urgent"]),
  notes: z.string().trim().optional().or(z.literal("")),
});

export const orderStatusPayloadSchema = z.object({
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
});

export const clinicalNotePayloadSchema = z.object({
  note_type: z.enum([
    "nursing_assessment",
    "physician_note",
    "progress_note",
    "discharge_summary",
  ]),
  content: z.string().trim().min(1, "Note content is required."),
});

export const encounterParamSchema = z.object({
  id: postgresUuidField,
});

export type VitalsPayload = z.infer<typeof vitalsPayloadSchema>;
export type DiagnosisPayload = z.infer<typeof diagnosisPayloadSchema>;
export type OrderPayload = z.infer<typeof orderPayloadSchema>;
export type OrderStatusPayload = z.infer<typeof orderStatusPayloadSchema>;
export type ClinicalNotePayload = z.infer<typeof clinicalNotePayloadSchema>;

export interface ChartEncounterSummary extends Encounter {
  bed_number: string | null;
  bed_status: Bed["status"] | null;
  department_name: string | null;
  attending_physician_name: string | null;
}

export interface ChartOrder extends Order {
  ordered_by_name: string | null;
}

export interface ChartNote extends ClinicalNote {
  author_name: string | null;
}

export interface PatientChartData {
  patient: Patient;
  encounter: ChartEncounterSummary | null;
  vitals: Vitals[];
  diagnoses: Diagnosis[];
  orders: ChartOrder[];
  notes: ChartNote[];
}

export interface OrdersQueueItem extends Order {
  patient_id: string;
  patient_name: string;
  patient_mrn: string;
  encounter_status: Encounter["status"];
  department_name: string | null;
  bed_number: string | null;
  ordered_by_name: string | null;
}

const priorityRank: Record<Order["priority"], number> = {
  stat: 0,
  urgent: 1,
  routine: 2,
};

export async function getPatientChartData(
  supabase: SupabaseLike,
  orgId: string,
  patientId: string,
): Promise<PatientChartData | null> {
  const [{ data: patient, error: patientError }, { data: encounters, error: encounterError }] =
    await Promise.all([
      supabase
        .from("patients")
        .select("*")
        .eq("org_id", orgId)
        .eq("id", patientId)
        .maybeSingle(),
      supabase
        .from("encounters")
        .select("*")
        .eq("org_id", orgId)
        .eq("patient_id", patientId)
        .order("admission_date", { ascending: false }),
    ]);

  if (patientError) {
    throw new Error(patientError.message);
  }

  if (encounterError) {
    throw new Error(encounterError.message);
  }

  if (!patient) {
    return null;
  }

  const activeEncounter =
    (encounters as Encounter[] | null)?.find((encounter) => encounter.status === "active") ??
    (encounters?.[0] as Encounter | undefined) ??
    null;

  if (!activeEncounter) {
    return {
      patient: patient as Patient,
      encounter: null,
      vitals: [],
      diagnoses: [],
      orders: [],
      notes: [],
    };
  }

  const [
    { data: bed, error: bedError },
    { data: department, error: departmentError },
    { data: physician, error: physicianError },
    { data: vitals, error: vitalsError },
    { data: diagnoses, error: diagnosesError },
    { data: orders, error: ordersError },
    { data: notes, error: notesError },
  ] = await Promise.all([
    activeEncounter.bed_id
      ? supabase
          .from("beds")
          .select("id, dept_id, bed_number, status, bed_type, patient_id, created_at, updated_at")
          .eq("id", activeEncounter.bed_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    activeEncounter.dept_id
      ? supabase
          .from("departments")
          .select("id, org_id, name, code, floor, created_at")
          .eq("id", activeEncounter.dept_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    activeEncounter.attending_physician_id
      ? supabase
          .from("user_profiles")
          .select("id, org_id, role, full_name, npi, department_id")
          .eq("id", activeEncounter.attending_physician_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase
      .from("vitals")
      .select("*")
      .eq("encounter_id", activeEncounter.id)
      .order("recorded_at", { ascending: false }),
    supabase
      .from("diagnoses")
      .select("*")
      .eq("encounter_id", activeEncounter.id)
      .order("added_at", { ascending: false }),
    supabase
      .from("orders")
      .select("*")
      .eq("encounter_id", activeEncounter.id)
      .order("ordered_at", { ascending: false }),
    supabase
      .from("clinical_notes")
      .select("*")
      .eq("encounter_id", activeEncounter.id)
      .order("created_at", { ascending: false }),
  ]);

  if (bedError) {
    throw new Error(bedError.message);
  }

  if (departmentError) {
    throw new Error(departmentError.message);
  }

  if (physicianError) {
    throw new Error(physicianError.message);
  }

  if (vitalsError) {
    throw new Error(vitalsError.message);
  }

  if (diagnosesError) {
    throw new Error(diagnosesError.message);
  }

  if (ordersError) {
    throw new Error(ordersError.message);
  }

  if (notesError) {
    throw new Error(notesError.message);
  }

  const orderedByIds = Array.from(
    new Set(
      ((orders ?? []) as Order[])
        .map((order) => order.ordered_by)
        .filter((value): value is string => Boolean(value)),
    ),
  );
  const noteAuthorIds = Array.from(
    new Set(
      ((notes ?? []) as ClinicalNote[])
        .map((note) => note.author_id)
        .filter((value): value is string => Boolean(value)),
    ),
  );
  const profileIds = Array.from(new Set([...orderedByIds, ...noteAuthorIds]));

  const { data: profiles, error: profilesError } = profileIds.length
    ? await supabase
        .from("user_profiles")
        .select("id, full_name")
        .in("id", profileIds)
    : { data: [], error: null };

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  const profileMap = new Map(
    ((profiles ?? []) as Pick<UserProfile, "id" | "full_name">[]).map((profile) => [
      profile.id,
      profile.full_name,
    ]),
  );

  return {
    patient: patient as Patient,
    encounter: {
      ...(activeEncounter as Encounter),
      bed_number: (bed as Bed | null)?.bed_number ?? null,
      bed_status: (bed as Bed | null)?.status ?? null,
      department_name: (department as Department | null)?.name ?? null,
      attending_physician_name: (physician as UserProfile | null)?.full_name ?? null,
    },
    vitals: (vitals ?? []) as Vitals[],
    diagnoses: (diagnoses ?? []) as Diagnosis[],
    orders: ((orders ?? []) as Order[]).map((order) => ({
      ...order,
      ordered_by_name: order.ordered_by ? profileMap.get(order.ordered_by) ?? null : null,
    })),
    notes: ((notes ?? []) as ClinicalNote[]).map((note) => ({
      ...note,
      author_name: note.author_id ? profileMap.get(note.author_id) ?? null : null,
    })),
  };
}

export async function getOrdersQueueData(
  supabase: SupabaseLike,
  orgId: string,
): Promise<OrdersQueueItem[]> {
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .in("status", ["pending", "in_progress"])
    .order("priority", { ascending: false })
    .order("ordered_at", { ascending: true });

  if (ordersError) {
    throw new Error(ordersError.message);
  }

  const encounterIds = Array.from(
    new Set(((orders ?? []) as Order[]).map((order) => order.encounter_id)),
  );

  if (!encounterIds.length) {
    return [];
  }

  const { data: encounters, error: encountersError } = await supabase
    .from("encounters")
    .select("*")
    .eq("org_id", orgId)
    .in("id", encounterIds);

  if (encountersError) {
    throw new Error(encountersError.message);
  }

  const encounterMap = new Map(
    ((encounters ?? []) as Encounter[]).map((encounter) => [encounter.id, encounter]),
  );

  const patientIds = Array.from(
    new Set(
      ((encounters ?? []) as Encounter[]).map((encounter) => encounter.patient_id),
    ),
  );
  const departmentIds = Array.from(
    new Set(
      ((encounters ?? []) as Encounter[])
        .map((encounter) => encounter.dept_id)
        .filter((value): value is string => Boolean(value)),
    ),
  );
  const bedIds = Array.from(
    new Set(
      ((encounters ?? []) as Encounter[])
        .map((encounter) => encounter.bed_id)
        .filter((value): value is string => Boolean(value)),
    ),
  );
  const orderedByIds = Array.from(
    new Set(
      ((orders ?? []) as Order[])
        .map((order) => order.ordered_by)
        .filter((value): value is string => Boolean(value)),
    ),
  );

  const [
    { data: patients, error: patientsError },
    { data: departments, error: departmentsError },
    { data: beds, error: bedsError },
    { data: profiles, error: profilesError },
  ] = await Promise.all([
    patientIds.length
      ? supabase
          .from("patients")
          .select("id, mrn, first_name, last_name")
          .in("id", patientIds)
      : Promise.resolve({ data: [], error: null }),
    departmentIds.length
      ? supabase
          .from("departments")
          .select("id, name")
          .in("id", departmentIds)
      : Promise.resolve({ data: [], error: null }),
    bedIds.length
      ? supabase.from("beds").select("id, bed_number").in("id", bedIds)
      : Promise.resolve({ data: [], error: null }),
    orderedByIds.length
      ? supabase
          .from("user_profiles")
          .select("id, full_name")
          .in("id", orderedByIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (patientsError) {
    throw new Error(patientsError.message);
  }

  if (departmentsError) {
    throw new Error(departmentsError.message);
  }

  if (bedsError) {
    throw new Error(bedsError.message);
  }

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  const patientMap = new Map(
    (patients ?? []).map((patient) => [
      patient.id,
      `${patient.first_name} ${patient.last_name}`.trim(),
    ]),
  );
  const patientMrnMap = new Map((patients ?? []).map((patient) => [patient.id, patient.mrn]));
  const departmentMap = new Map((departments ?? []).map((department) => [department.id, department.name]));
  const bedMap = new Map((beds ?? []).map((bed) => [bed.id, bed.bed_number]));
  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile.full_name]));

  return ((orders ?? []) as Order[])
    .map((order) => {
      const encounter = encounterMap.get(order.encounter_id);

      if (!encounter) {
        return null;
      }

      return {
        ...order,
        patient_id: encounter.patient_id,
        patient_name: patientMap.get(encounter.patient_id) ?? "Unknown patient",
        patient_mrn: patientMrnMap.get(encounter.patient_id) ?? "MRN unavailable",
        encounter_status: encounter.status,
        department_name: encounter.dept_id
          ? departmentMap.get(encounter.dept_id) ?? null
          : null,
        bed_number: encounter.bed_id ? bedMap.get(encounter.bed_id) ?? null : null,
        ordered_by_name: order.ordered_by ? profileMap.get(order.ordered_by) ?? null : null,
      } satisfies OrdersQueueItem;
    })
    .filter((item): item is OrdersQueueItem => Boolean(item))
    .sort((left, right) => {
      const priorityDelta = priorityRank[left.priority] - priorityRank[right.priority];

      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      return (
        new Date(left.ordered_at).getTime() - new Date(right.ordered_at).getTime()
      );
    });
}
