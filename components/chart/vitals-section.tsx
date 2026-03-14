"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { VitalsForm } from "@/components/chart/vitals-form";
import type { Vitals } from "@/types";

export function VitalsSection({
  encounterId,
  vitals,
  canRecord,
  onCreated,
}: {
  encounterId: string;
  vitals: Vitals[];
  canRecord: boolean;
  onCreated: (vital: Vitals) => void;
}) {
  const [pending, setPending] = useState(false);
  const latestVital = vitals[0] ?? null;

  async function handleCreate(payload: Record<string, string>) {
    setPending(true);

    const response = await fetch(`/api/encounters/${encounterId}/vitals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as { vital?: Vitals; error?: string };

    if (!response.ok || !data.vital) {
      toast.error("Unable to record vitals.", {
        description: data.error ?? "Unexpected response.",
      });
      setPending(false);
      return;
    }

    onCreated(data.vital);
    toast.success("Vitals recorded.");
    setPending(false);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-base font-semibold text-slate-950">Latest vitals</p>
            <p className="mt-2 text-sm text-slate-500">
              Current physiologic snapshot with abnormal values highlighted.
            </p>
          </div>
          {canRecord ? (
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 lg:max-w-xl">
              <VitalsForm pending={pending} onSubmit={handleCreate} />
            </div>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <VitalCard
            label="Blood Pressure"
            value={
              latestVital?.bp_systolic && latestVital.bp_diastolic
                ? `${latestVital.bp_systolic}/${latestVital.bp_diastolic}`
                : "Not recorded"
            }
            abnormal={
              latestVital?.bp_systolic != null &&
              latestVital.bp_diastolic != null &&
              (latestVital.bp_systolic >= 180 || latestVital.bp_diastolic >= 110)
            }
          />
          <VitalCard
            label="Heart Rate"
            value={latestVital?.heart_rate ? `${latestVital.heart_rate} bpm` : "Not recorded"}
            abnormal={Boolean(latestVital?.heart_rate && latestVital.heart_rate >= 120)}
          />
          <VitalCard
            label="Temperature"
            value={
              latestVital?.temperature ? `${latestVital.temperature.toFixed(1)} F` : "Not recorded"
            }
            abnormal={Boolean(latestVital?.temperature && latestVital.temperature >= 100.4)}
          />
          <VitalCard
            label="O2 Saturation"
            value={
              latestVital?.o2_saturation ? `${latestVital.o2_saturation}%` : "Not recorded"
            }
            abnormal={Boolean(latestVital?.o2_saturation && latestVital.o2_saturation <= 92)}
          />
          <VitalCard
            label="Respiratory Rate"
            value={
              latestVital?.respiratory_rate
                ? `${latestVital.respiratory_rate}/min`
                : "Not recorded"
            }
            abnormal={Boolean(latestVital?.respiratory_rate && latestVital.respiratory_rate >= 24)}
          />
          <VitalCard
            label="Weight"
            value={latestVital?.weight_kg ? `${latestVital.weight_kg} kg` : "Not recorded"}
            abnormal={false}
          />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-base font-semibold text-slate-950">Vitals history</p>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-3 py-3 font-medium">Recorded</th>
                <th className="px-3 py-3 font-medium">BP</th>
                <th className="px-3 py-3 font-medium">HR</th>
                <th className="px-3 py-3 font-medium">Temp</th>
                <th className="px-3 py-3 font-medium">O2</th>
                <th className="px-3 py-3 font-medium">RR</th>
                <th className="px-3 py-3 font-medium">Weight</th>
              </tr>
            </thead>
            <tbody>
              {vitals.map((vital) => (
                <tr key={vital.id} className="border-b border-slate-100">
                  <td className="px-3 py-3 text-slate-600">
                    {format(new Date(vital.recorded_at), "MMM d, h:mm a")}
                  </td>
                  <td className="px-3 py-3 text-slate-950">
                    {vital.bp_systolic && vital.bp_diastolic
                      ? `${vital.bp_systolic}/${vital.bp_diastolic}`
                      : "-"}
                  </td>
                  <td className="px-3 py-3 text-slate-950">{vital.heart_rate ?? "-"}</td>
                  <td className="px-3 py-3 text-slate-950">{vital.temperature ?? "-"}</td>
                  <td className="px-3 py-3 text-slate-950">{vital.o2_saturation ?? "-"}</td>
                  <td className="px-3 py-3 text-slate-950">
                    {vital.respiratory_rate ?? "-"}
                  </td>
                  <td className="px-3 py-3 text-slate-950">{vital.weight_kg ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function VitalCard({
  label,
  value,
  abnormal,
}: {
  label: string;
  value: string;
  abnormal: boolean;
}) {
  return (
    <article
      className={`rounded-[1.5rem] border p-4 ${
        abnormal
          ? "border-rose-200 bg-rose-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-3 text-2xl font-semibold ${abnormal ? "text-rose-700" : "text-slate-950"}`}>
        {value}
      </p>
    </article>
  );
}
