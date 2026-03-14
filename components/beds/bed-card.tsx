"use client";

import Link from "next/link";
import { BedDouble, BrushCleaning, Stethoscope, Wrench } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { BedBoardItem } from "@/types";

export function BedCard({
  bed,
  patientQueryId,
}: {
  bed: BedBoardItem;
  patientQueryId?: string | null;
}) {
  const tone = bedTone[bed.status];
  const Icon = tone.icon;
  const admitHref = patientQueryId
    ? `/beds?admit=${bed.id}&patient=${patientQueryId}`
    : `/beds?admit=${bed.id}`;
  const dischargeHref = `/beds?discharge=${bed.id}`;

  return (
    <article
      className={`rounded-[1.75rem] border p-5 shadow-sm transition ${tone.cardClassName}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            {bed.department_code}
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">
            {bed.bed_number}
          </h3>
        </div>
        <div className={`rounded-2xl p-3 ${tone.iconClassName}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.badgeClassName}`}>
          {tone.label}
        </span>
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
          {bed.bed_type}
        </span>
      </div>

      {bed.status === "occupied" ? (
        <div className="mt-5 space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
            <p className="text-sm font-semibold text-slate-950">
              {bed.patient_name ?? "Unknown patient"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {bed.patient_mrn ?? "MRN unavailable"}
            </p>
          </div>
          <div className="space-y-1 text-sm text-slate-600">
            <p>
              Admitted{" "}
              {bed.admission_date
                ? formatDistanceToNow(new Date(bed.admission_date), {
                    addSuffix: true,
                  })
                : "recently"}
            </p>
            <p>{bed.attending_physician_name ?? "Physician not assigned"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {bed.patient_id ? (
              <Link
                href={`/patients/${bed.patient_id}/chart`}
                className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
              >
                View Chart
              </Link>
            ) : null}
            <Link
              href={dischargeHref}
              className="rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
            >
              Discharge
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <p className="text-sm leading-6 text-slate-600">
            {bed.status === "available"
              ? "Ready for admission. Select this bed to assign a registered patient."
              : bed.status === "housekeeping"
                ? "Bed is turning over after discharge."
                : "Bed is unavailable until maintenance clears it."}
          </p>
          {bed.status === "available" ? (
            <Link
              href={admitHref}
              className="rounded-full bg-sky-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-sky-700"
            >
              Admit Patient
            </Link>
          ) : null}
        </div>
      )}
    </article>
  );
}

const bedTone = {
  available: {
    label: "Available",
    cardClassName: "border-emerald-200 bg-emerald-50/60",
    badgeClassName: "bg-emerald-100 text-emerald-700",
    iconClassName: "bg-emerald-100 text-emerald-700",
    icon: BedDouble,
  },
  occupied: {
    label: "Occupied",
    cardClassName: "border-rose-200 bg-rose-50/60",
    badgeClassName: "bg-rose-100 text-rose-700",
    iconClassName: "bg-rose-100 text-rose-700",
    icon: Stethoscope,
  },
  housekeeping: {
    label: "Housekeeping",
    cardClassName: "border-amber-200 bg-amber-50/60",
    badgeClassName: "bg-amber-100 text-amber-700",
    iconClassName: "bg-amber-100 text-amber-700",
    icon: BrushCleaning,
  },
  maintenance: {
    label: "Maintenance",
    cardClassName: "border-slate-300 bg-slate-100/80",
    badgeClassName: "bg-slate-200 text-slate-700",
    iconClassName: "bg-slate-200 text-slate-700",
    icon: Wrench,
  },
} satisfies Record<
  BedBoardItem["status"],
  {
    label: string;
    cardClassName: string;
    badgeClassName: string;
    iconClassName: string;
    icon: typeof BedDouble;
  }
>;
