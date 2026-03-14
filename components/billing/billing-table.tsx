"use client";

import Link from "next/link";
import { format } from "date-fns";
import { currency, type BillingListItem } from "@/lib/billing";

export function BillingTable({ records }: { records: BillingListItem[] }) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-3 py-3 font-medium">Patient</th>
              <th className="px-3 py-3 font-medium">MRN</th>
              <th className="px-3 py-3 font-medium">Encounter</th>
              <th className="px-3 py-3 font-medium">Payer</th>
              <th className="px-3 py-3 font-medium">Charges</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-b border-slate-100">
                <td className="px-3 py-4 font-medium text-slate-950">
                  {record.patient_name}
                </td>
                <td className="px-3 py-4 text-slate-600">{record.patient_mrn}</td>
                <td className="px-3 py-4 text-slate-600">
                  {record.encounter_date
                    ? format(new Date(record.encounter_date), "MMM d, yyyy")
                    : "Unknown"}
                </td>
                <td className="px-3 py-4 text-slate-600">
                  {record.payer ?? "Unassigned"}
                </td>
                <td className="px-3 py-4 text-slate-950">
                  {currency(record.total_charges)}
                </td>
                <td className="px-3 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[record.claim_status]}`}>
                    {record.claim_status}
                  </span>
                </td>
                <td className="px-3 py-4">
                  <Link
                    href={`/billing/${record.id}`}
                    className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Open
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

const statusTone = {
  draft: "bg-slate-100 text-slate-700",
  submitted: "bg-sky-100 text-sky-700",
  paid: "bg-emerald-100 text-emerald-700",
  denied: "bg-rose-100 text-rose-700",
} as const;
