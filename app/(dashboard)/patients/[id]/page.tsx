import Link from "next/link";
import { format } from "date-fns";
import { AccessDenied } from "@/components/layout/access-denied";
import { PatientCard } from "@/components/patients/patient-card";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Encounter, Patient } from "@/types";

export default async function PatientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [access, { id }, supabase] = await Promise.all([
    requireRole(["admin", "physician", "nurse", "receptionist"]),
    params,
    createClient(),
  ]);

  if (access.unauthorized) {
    return (
      <AccessDenied description="Only intake and care roles can open patient profiles." />
    );
  }

  const { profile } = access;

  const [{ data: patient, error: patientError }, { data: encounters, error: encounterError }] =
    await Promise.all([
      supabase
        .from("patients")
        .select("*")
        .eq("id", id)
        .eq("org_id", profile.org_id)
        .single(),
      supabase
        .from("encounters")
        .select("*")
        .eq("patient_id", id)
        .order("created_at", { ascending: false }),
    ]);

  if (patientError) {
    throw new Error(patientError.message);
  }

  if (encounterError) {
    throw new Error(encounterError.message);
  }

  const typedPatient = patient as Patient;

  return (
    <div className="space-y-6">
      <PatientCard patient={typedPatient} />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">Demographics</h2>
          <dl className="mt-6 grid gap-4 md:grid-cols-2">
            <Detail label="Address">
              {typedPatient.address_line1 ?? "Not entered"}
            </Detail>
            <Detail label="City / State / ZIP">
              {[typedPatient.city, typedPatient.state, typedPatient.zip]
                .filter(Boolean)
                .join(", ") || "Not entered"}
            </Detail>
            <Detail label="Email">{typedPatient.email ?? "Not entered"}</Detail>
            <Detail label="SSN Last 4">
              {typedPatient.ssn_last4 ?? "Not entered"}
            </Detail>
          </dl>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">
            Insurance and Contacts
          </h2>
          <dl className="mt-6 grid gap-4">
            <Detail label="Insurance Payer">
              {typedPatient.insurance_payer ?? "Not entered"}
            </Detail>
            <Detail label="Policy Number">
              {typedPatient.policy_number ?? "Not entered"}
            </Detail>
            <Detail label="Emergency Contact">
              {typedPatient.emergency_contact_name ?? "Not entered"}
            </Detail>
            <Detail label="Emergency Phone">
              {typedPatient.emergency_contact_phone ?? "Not entered"}
            </Detail>
          </dl>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">Patient Actions</h2>
            <p className="mt-2 text-sm text-slate-600">
              Move directly into admission or the chart depending on current
              patient status.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {typedPatient.status === "registered" ? (
              <Link
                href={`/beds?patient=${typedPatient.id}`}
                className="rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                Admit Patient
              </Link>
            ) : null}
            {typedPatient.status === "admitted" ? (
              <Link
                href={`/patients/${typedPatient.id}/chart`}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                View Chart
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-950">Recent Encounters</h2>
        <div className="mt-6 grid gap-4">
          {(encounters as Encounter[]).length ? (
            (encounters as Encounter[]).map((encounter) => (
              <article
                key={encounter.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {encounter.status === "active" ? "Active encounter" : "Closed encounter"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Admitted{" "}
                      {format(new Date(encounter.admission_date), "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                    {encounter.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  {encounter.chief_complaint ?? "Chief complaint not entered."}
                </p>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              No encounters recorded yet for this patient.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</dt>
      <dd className="mt-2 text-sm font-medium text-slate-900">{children}</dd>
    </div>
  );
}
