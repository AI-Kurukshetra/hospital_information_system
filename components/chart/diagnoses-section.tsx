"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Diagnosis } from "@/types";

export function DiagnosesSection({
  encounterId,
  diagnoses,
  canEdit,
  onCreated,
}: {
  encounterId: string;
  diagnoses: Diagnosis[];
  canEdit: boolean;
  onCreated: (diagnosis: Diagnosis) => void;
}) {
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    icd10_code: "",
    description: "",
    diagnosis_type: "primary",
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    const response = await fetch(`/api/encounters/${encounterId}/diagnoses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = (await response.json()) as { diagnosis?: Diagnosis; error?: string };

    if (!response.ok || !data.diagnosis) {
      toast.error("Unable to save diagnosis.", {
        description: data.error ?? "Unexpected response.",
      });
      setPending(false);
      return;
    }

    onCreated(data.diagnosis);
    setForm({
      icd10_code: "",
      description: "",
      diagnosis_type: "primary",
    });
    toast.success("Diagnosis added.");
    setPending(false);
  }

  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-base font-semibold text-slate-950">Diagnoses</p>
          <p className="mt-2 text-sm text-slate-500">
            Problem list with ICD-10 coding and diagnosis type.
          </p>
        </div>
        {canEdit ? (
          <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-3 lg:max-w-3xl">
            <input
              value={form.icd10_code}
              onChange={(event) =>
                setForm((current) => ({ ...current, icd10_code: event.target.value }))
              }
              placeholder="ICD-10 code"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            />
            <input
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="Diagnosis description"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm md:col-span-2"
            />
            <select
              value={form.diagnosis_type}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  diagnosis_type: event.target.value as "primary" | "secondary",
                }))
              }
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
            </select>
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {pending ? "Saving..." : "Add Diagnosis"}
            </button>
          </form>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4">
        {diagnoses.map((diagnosis) => (
          <article
            key={diagnosis.id}
            className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                {diagnosis.icd10_code}
              </span>
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                {diagnosis.diagnosis_type}
              </span>
            </div>
            <p className="mt-3 text-base font-semibold text-slate-950">
              {diagnosis.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
