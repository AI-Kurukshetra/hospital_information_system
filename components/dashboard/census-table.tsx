"use client";

import Link from "next/link";
import type { DashboardStats } from "@/lib/dashboard";

export function CensusTable({
  rows,
}: {
  rows: DashboardStats["census_rows"];
}) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-slate-950">Current Census</p>
          <p className="mt-2 text-sm text-slate-500">
            All active encounters with direct chart access.
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-3 py-3 font-medium">Patient</th>
              <th className="px-3 py-3 font-medium">MRN</th>
              <th className="px-3 py-3 font-medium">Bed</th>
              <th className="px-3 py-3 font-medium">Department</th>
              <th className="px-3 py-3 font-medium">Attending</th>
              <th className="px-3 py-3 font-medium">LOS</th>
              <th className="px-3 py-3 font-medium">Chief Complaint</th>
              <th className="px-3 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.encounter_id} className="border-b border-slate-100">
                <td className="px-3 py-4 font-medium text-slate-950">{row.patient_name}</td>
                <td className="px-3 py-4 text-slate-600">{row.patient_mrn}</td>
                <td className="px-3 py-4 text-slate-600">{row.bed_number ?? "Unassigned"}</td>
                <td className="px-3 py-4 text-slate-600">{row.department_name ?? "Unknown"}</td>
                <td className="px-3 py-4 text-slate-600">{row.attending_name ?? "Unknown"}</td>
                <td className="px-3 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      row.los_days > 3
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {row.los_days}d
                  </span>
                </td>
                <td className="px-3 py-4 text-slate-600">
                  {row.chief_complaint ?? "Not documented"}
                </td>
                <td className="px-3 py-4">
                  <Link
                    href={`/patients/${row.patient_id}/chart`}
                    className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Open Chart
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
