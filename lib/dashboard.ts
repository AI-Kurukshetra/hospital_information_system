import { getBillingDashboardData } from "@/lib/billing";
import type { Bed, Encounter, Order, UserProfile } from "@/types";

type SupabaseLike = Awaited<
  ReturnType<typeof import("@/lib/supabase/server").createClient>
>;

export interface DashboardStats {
  census: number;
  occupancy_pct: number;
  pending_orders: number;
  todays_admissions: number;
  todays_discharges: number;
  draft_billing_records: number;
  total_beds: number;
  available_beds: number;
  submitted_billing_records: number;
  total_outstanding: number;
  bed_occupancy_by_department: {
    department: string;
    available: number;
    occupied: number;
    other: number;
  }[];
  census_rows: {
    encounter_id: string;
    patient_id: string;
    patient_name: string;
    patient_mrn: string;
    bed_number: string | null;
    department_name: string | null;
    attending_name: string | null;
    admission_date: string;
    chief_complaint: string | null;
    los_days: number;
  }[];
  recent_activity: {
    encounter_id: string;
    patient_name: string;
    bed_number: string | null;
    type: "admission" | "discharge";
    timestamp: string;
  }[];
  order_summary: {
    type: Order["order_type"];
    pending: number;
  }[];
}

export async function getDashboardStats(
  supabase: SupabaseLike,
  orgId: string,
): Promise<DashboardStats> {
  const [
    { data: encounters, error: encountersError },
    { data: orders, error: ordersError },
    { data: beds, error: bedsError },
    { data: departments, error: departmentsError },
    { data: patients, error: patientsError },
    { data: profiles, error: profilesError },
    billingData,
  ] = await Promise.all([
    supabase
      .from("encounters")
      .select("*")
      .eq("org_id", orgId)
      .order("admission_date", { ascending: false }),
    supabase.from("orders").select("*"),
    supabase
      .from("beds")
      .select("id, dept_id, bed_number, status, bed_type, patient_id, created_at, updated_at"),
    supabase.from("departments").select("id, name, code"),
    supabase.from("patients").select("id, first_name, last_name, mrn"),
    supabase
      .from("user_profiles")
      .select("id, full_name, role"),
    getBillingDashboardData(supabase),
  ]);

  if (encountersError) {
    throw new Error(encountersError.message);
  }

  if (ordersError) {
    throw new Error(ordersError.message);
  }

  if (bedsError) {
    throw new Error(bedsError.message);
  }

  if (departmentsError) {
    throw new Error(departmentsError.message);
  }

  if (patientsError) {
    throw new Error(patientsError.message);
  }

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  const allEncounters = (encounters ?? []) as Encounter[];
  const allOrders = (orders ?? []) as Order[];
  const allBeds = (beds ?? []) as Bed[];
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const departmentMap = new Map((departments ?? []).map((department) => [department.id, department.name]));
  const patientMap = new Map(
    (patients ?? []).map((patient) => [
      patient.id,
      {
        name: `${patient.first_name} ${patient.last_name}`.trim(),
        mrn: patient.mrn,
      },
    ]),
  );
  const profileMap = new Map(
    ((profiles ?? []) as Pick<UserProfile, "id" | "full_name">[]).map((profile) => [
      profile.id,
      profile.full_name,
    ]),
  );
  const bedMap = new Map(allBeds.map((bed) => [bed.id, bed]));

  const activeEncounters = allEncounters.filter((encounter) => encounter.status === "active");
  const totalBeds = allBeds.length;
  const occupiedBeds = allBeds.filter((bed) => bed.status === "occupied").length;
  const availableBeds = allBeds.filter((bed) => bed.status === "available").length;

  const bed_occupancy_by_department = Array.from(
    new Set(allBeds.map((bed) => bed.dept_id)),
  ).map((deptId) => {
    const departmentBeds = allBeds.filter((bed) => bed.dept_id === deptId);
    return {
      department: departmentMap.get(deptId) ?? "Unknown",
      available: departmentBeds.filter((bed) => bed.status === "available").length,
      occupied: departmentBeds.filter((bed) => bed.status === "occupied").length,
      other: departmentBeds.filter((bed) => !["available", "occupied"].includes(bed.status))
        .length,
    };
  });

  const census_rows = activeEncounters.map((encounter) => {
    const patient = patientMap.get(encounter.patient_id);
    const bed = encounter.bed_id ? bedMap.get(encounter.bed_id) ?? null : null;
    const losMilliseconds = Date.now() - new Date(encounter.admission_date).getTime();

    return {
      encounter_id: encounter.id,
      patient_id: encounter.patient_id,
      patient_name: patient?.name ?? "Unknown patient",
      patient_mrn: patient?.mrn ?? "MRN unavailable",
      bed_number: bed?.bed_number ?? null,
      department_name: encounter.dept_id ? departmentMap.get(encounter.dept_id) ?? null : null,
      attending_name: encounter.attending_physician_id
        ? profileMap.get(encounter.attending_physician_id) ?? null
        : null,
      admission_date: encounter.admission_date,
      chief_complaint: encounter.chief_complaint,
      los_days: Math.max(1, Math.floor(losMilliseconds / (1000 * 60 * 60 * 24))),
    };
  });

  const recent_activity = allEncounters
    .flatMap((encounter) => {
      const patient = patientMap.get(encounter.patient_id);
      const bed = encounter.bed_id ? bedMap.get(encounter.bed_id) ?? null : null;
      const items: DashboardStats["recent_activity"] = [
        {
          encounter_id: encounter.id,
          patient_name: patient?.name ?? "Unknown patient",
          bed_number: bed?.bed_number ?? null,
          type: "admission" as const,
          timestamp: encounter.admission_date,
        },
      ];

      if (encounter.discharge_date) {
        items.push({
          encounter_id: encounter.id,
          patient_name: patient?.name ?? "Unknown patient",
          bed_number: bed?.bed_number ?? null,
          type: "discharge" as const,
          timestamp: encounter.discharge_date,
        });
      }

      return items;
    })
    .sort(
      (left, right) =>
        new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
    )
    .slice(0, 10);

  const orderSummaryMap = new Map<Order["order_type"], number>([
    ["medication", 0],
    ["lab", 0],
    ["imaging", 0],
    ["other", 0],
  ]);

  allOrders
    .filter((order) => order.status === "pending")
    .forEach((order) => {
      orderSummaryMap.set(order.order_type, (orderSummaryMap.get(order.order_type) ?? 0) + 1);
    });

  return {
    census: activeEncounters.length,
    occupancy_pct: totalBeds ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
    pending_orders: allOrders.filter((order) => order.status === "pending").length,
    todays_admissions: allEncounters.filter(
      (encounter) => new Date(encounter.admission_date) >= startOfToday,
    ).length,
    todays_discharges: allEncounters.filter(
      (encounter) =>
        encounter.discharge_date && new Date(encounter.discharge_date) >= startOfToday,
    ).length,
    draft_billing_records: billingData.summary.draft_count,
    total_beds: totalBeds,
    available_beds: availableBeds,
    submitted_billing_records: billingData.summary.submitted_count,
    total_outstanding: billingData.summary.outstanding,
    bed_occupancy_by_department,
    census_rows,
    recent_activity,
    order_summary: Array.from(orderSummaryMap.entries()).map(([type, pending]) => ({
      type,
      pending,
    })),
  };
}
