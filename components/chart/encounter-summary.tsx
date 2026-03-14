"use client";

import { Activity, ClipboardList, NotebookPen, Waves } from "lucide-react";
import { format } from "date-fns";
import type { ChartEncounterSummary, ChartNote, ChartOrder } from "@/lib/clinical";
import type { Vitals } from "@/types";

export function EncounterSummary({
  encounter,
  latestVital,
  orders,
  notes,
}: {
  encounter: ChartEncounterSummary | null;
  latestVital: Vitals | null;
  orders: ChartOrder[];
  notes: ChartNote[];
}) {
  const activeOrders = orders.filter((order) =>
    ["pending", "in_progress"].includes(order.status),
  ).length;
  const latestNote = notes[0] ?? null;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">Encounter summary</p>
            <p className="text-sm text-slate-500">
              Status, chief complaint, and current location.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <SummaryCard label="Encounter status" value={encounter?.status ?? "No encounter"} />
          <SummaryCard label="Bed status" value={encounter?.bed_status ?? "Unavailable"} />
          <SummaryCard
            label="Chief complaint"
            value={encounter?.chief_complaint ?? "Not documented"}
          />
          <SummaryCard
            label="Admitted"
            value={
              encounter?.admission_date
                ? format(new Date(encounter.admission_date), "MMM d, yyyy h:mm a")
                : "Not admitted"
            }
          />
        </div>
      </section>

      <div className="space-y-6">
        <OverviewCard
          icon={Waves}
          title="Latest vitals"
          description={
            latestVital
              ? formatVitalSummary(latestVital)
              : "No vitals recorded yet for this encounter."
          }
        />
        <OverviewCard
          icon={ClipboardList}
          title="Active orders"
          description={`${activeOrders} open orders requiring attention.`}
        />
        <OverviewCard
          icon={NotebookPen}
          title="Recent note"
          description={
            latestNote
              ? `${latestNote.note_type.replaceAll("_", " ")} · ${truncate(
                  latestNote.content,
                  110,
                )}`
              : "No notes recorded yet."
          }
        />
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-base font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function OverviewCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Activity;
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-semibold text-slate-950">{title}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>
    </section>
  );
}

function formatVitalSummary(vital: Vitals) {
  const parts = [
    vital.bp_systolic && vital.bp_diastolic
      ? `BP ${vital.bp_systolic}/${vital.bp_diastolic}`
      : null,
    vital.heart_rate ? `HR ${vital.heart_rate}` : null,
    vital.temperature ? `Temp ${vital.temperature}` : null,
    vital.o2_saturation ? `O2 ${vital.o2_saturation}%` : null,
  ].filter(Boolean);

  return parts.join(" · ");
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}...`;
}
