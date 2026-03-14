import type {
  Bed,
  BedBoardItem,
  Department,
  Encounter,
  Patient,
  PatientLookup,
  PhysicianLookup,
  UserProfile,
} from "@/types";

type SupabaseLike = Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>;

export async function getBedBoardData(supabase: SupabaseLike, orgId: string) {
  const [
    { data: departments, error: departmentsError },
    { data: patients, error: patientsError },
    { data: physicians, error: physiciansError },
    { data: encounters, error: encountersError },
  ] = await Promise.all([
    supabase
      .from("departments")
      .select("id, org_id, name, code, floor, created_at")
      .eq("org_id", orgId)
      .order("name"),
    supabase
      .from("patients")
      .select("id, first_name, last_name, mrn, status, insurance_payer")
      .eq("org_id", orgId)
      .order("last_name"),
    supabase
      .from("user_profiles")
      .select("id, full_name, department_id")
      .eq("org_id", orgId)
      .eq("role", "physician")
      .order("full_name"),
    supabase
      .from("encounters")
      .select(
        "id, patient_id, bed_id, org_id, dept_id, attending_physician_id, admission_date, discharge_date, status, chief_complaint, created_at",
      )
      .eq("org_id", orgId)
      .eq("status", "active"),
  ]);

  if (departmentsError) {
    throw new Error(departmentsError.message);
  }

  if (patientsError) {
    throw new Error(patientsError.message);
  }

  if (physiciansError) {
    throw new Error(physiciansError.message);
  }

  if (encountersError) {
    throw new Error(encountersError.message);
  }

  const deptIds = (departments ?? []).map((department) => department.id);
  const bedsQuery = supabase
    .from("beds")
    .select("id, dept_id, bed_number, status, bed_type, patient_id, created_at, updated_at")
    .order("bed_number");
  const { data: beds, error: bedsError } = deptIds.length
    ? await bedsQuery.in("dept_id", deptIds)
    : await bedsQuery.limit(0);

  if (bedsError) {
    throw new Error(bedsError.message);
  }

  const departmentMap = new Map(
    ((departments ?? []) as Department[]).map((department) => [department.id, department]),
  );
  const patientMap = new Map(
    ((patients ?? []) as Partial<Patient>[]).map((patient) => [
      patient.id,
      patient,
    ]),
  );
  const physicianMap = new Map(
    ((physicians ?? []) as Partial<UserProfile>[]).map((physician) => [
      physician.id,
      physician,
    ]),
  );
  const encounterByBedId = new Map(
    ((encounters ?? []) as Encounter[])
      .filter((encounter) => encounter.bed_id)
      .map((encounter) => [encounter.bed_id as string, encounter]),
  );

  const boardBeds: BedBoardItem[] = ((beds ?? []) as Bed[]).map((bed) => {
    const department = departmentMap.get(bed.dept_id);
    const encounter = encounterByBedId.get(bed.id);
    const patient = encounter?.patient_id ? patientMap.get(encounter.patient_id) : null;
    const physician = encounter?.attending_physician_id
      ? physicianMap.get(encounter.attending_physician_id)
      : null;

    return {
      id: bed.id,
      dept_id: bed.dept_id,
      department_name: department?.name ?? "Unknown Department",
      department_code: department?.code ?? "UNK",
      bed_number: bed.bed_number,
      bed_type: bed.bed_type,
      status: bed.status,
      patient_id: encounter?.patient_id ?? null,
      patient_name: patient
        ? `${patient.first_name ?? ""} ${patient.last_name ?? ""}`.trim()
        : null,
      patient_mrn: patient?.mrn ?? null,
      encounter_id: encounter?.id ?? null,
      admission_date: encounter?.admission_date ?? null,
      attending_physician_id: encounter?.attending_physician_id ?? null,
      attending_physician_name: physician?.full_name ?? null,
      chief_complaint: encounter?.chief_complaint ?? null,
    };
  });

  return {
    beds: boardBeds,
    departments: ((departments ?? []) as Department[]).map((department) => ({
      id: department.id,
      name: department.name,
      code: department.code,
    })),
    patients: ((patients ?? []) as Patient[])
      .filter((patient) => patient.status === "registered")
      .map(
        (patient): PatientLookup => ({
          id: patient.id,
          full_name: `${patient.first_name} ${patient.last_name}`,
          mrn: patient.mrn,
          status: patient.status,
        }),
      ),
    physicians: ((physicians ?? []) as UserProfile[]).map(
      (physician): PhysicianLookup => ({
        id: physician.id,
        full_name: physician.full_name,
        department_id: physician.department_id,
      }),
    ),
  };
}
