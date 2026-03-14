"use client";

import Link from "next/link";
import { format } from "date-fns";
import type { ChartEncounterSummary } from "@/lib/clinical";
import type { Patient, UserRole } from "@/types";

export function ChartHeader({
  patient,
  encounter,
  role,
}: {
  patient: Patient;
  encounter: ChartEncounterSummary | null;
  role: UserRole;
}) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-8 bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,transparent_32%),linear-gradient(135deg,#ffffff_0%,#f8fafc_60%,#e0f2fe_100%)] px-8 py-8 lg:grid-cols-[1.45fr_0.85fr]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
              Patient Chart
            </span>
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
              {patient.status}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {role}
            </span>
          </div>

          <h1 className="mt-5 text-4xl font-semibold text-slate-950">
            {patient.first_name} {patient.last_name}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            MRN {patient.mrn} · DOB{" "}
            {patient.date_of_birth
              ? format(new Date(patient.date_of_birth), "MMM d, yyyy")
              : "Not recorded"}{" "}
            · {patient.gender ?? "Gender not recorded"}
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-2">
              Phone {patient.phone ?? "Unavailable"}
            </span>
            <span className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-2">
              Payer {patient.insurance_payer ?? "Self-pay"}
            </span>
            <span className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-2">
              Emergency {patient.emergency_contact_name ?? "Not recorded"}
            </span>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.4)] backdrop-blur">
          <p className="text-sm font-semibold text-slate-900">Active encounter</p>
          <div className="mt-5 space-y-3 text-sm text-slate-600">
            <Metric label="Bed" value={encounter?.bed_number ?? "Not assigned"} />
            <Metric
              label="Department"
              value={encounter?.department_name ?? "Not assigned"}
            />
            <Metric
              label="Attending"
              value={encounter?.attending_physician_name ?? "Not assigned"}
            />
            <Metric
              label="Admitted"
              value={
                encounter?.admission_date
                  ? format(new Date(encounter.admission_date), "MMM d, yyyy h:mm a")
                  : "No active encounter"
              }
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/patients/${patient.id}`}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Patient profile
            </Link>
            <Link
              href="/orders"
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Orders queue
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-950">{value}</span>
    </div>
  );
}
