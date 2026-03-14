import { differenceInYears, format } from "date-fns";
import type { Patient } from "@/types";

export function PatientCard({ patient }: { patient: Patient }) {
  const age = patient.date_of_birth
    ? differenceInYears(new Date(), new Date(patient.date_of_birth))
    : null;

  return (
    <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Patient
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-950">
            {patient.first_name} {patient.last_name}
          </h2>
          <p className="mt-2 text-sm text-slate-500">{patient.mrn}</p>
        </div>
        <span className={statusClassName(patient.status)}>{patient.status}</span>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <Detail label="DOB">
          {patient.date_of_birth
            ? `${format(new Date(patient.date_of_birth), "MMM d, yyyy")}${age !== null ? ` (${age} y)` : ""}`
            : "Not entered"}
        </Detail>
        <Detail label="Gender">{patient.gender ?? "Not entered"}</Detail>
        <Detail label="Phone">{patient.phone ?? "Not entered"}</Detail>
        <Detail label="Insurance">
          {patient.insurance_payer ?? "Not entered"}
        </Detail>
      </dl>
    </article>
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

export function statusClassName(status: Patient["status"]) {
  if (status === "admitted") {
    return "inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700";
  }

  if (status === "discharged") {
    return "inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700";
  }

  return "inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700";
}
