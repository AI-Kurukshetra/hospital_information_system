"use client";

import { useState } from "react";
import type { VitalsPayload } from "@/lib/clinical";

const initialState: Record<keyof VitalsPayload, string> = {
  bp_systolic: "",
  bp_diastolic: "",
  heart_rate: "",
  temperature: "",
  o2_saturation: "",
  respiratory_rate: "",
  weight_kg: "",
};

export function VitalsForm({
  pending,
  onSubmit,
}: {
  pending: boolean;
  onSubmit: (payload: Record<keyof VitalsPayload, string>) => Promise<void>;
}) {
  const [form, setForm] = useState(initialState);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(form);
    setForm(initialState);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Field
        label="BP Systolic"
        value={form.bp_systolic}
        onChange={(value) => setForm((current) => ({ ...current, bp_systolic: value }))}
      />
      <Field
        label="BP Diastolic"
        value={form.bp_diastolic}
        onChange={(value) => setForm((current) => ({ ...current, bp_diastolic: value }))}
      />
      <Field
        label="Heart Rate"
        value={form.heart_rate}
        onChange={(value) => setForm((current) => ({ ...current, heart_rate: value }))}
      />
      <Field
        label="Temperature"
        value={form.temperature}
        onChange={(value) => setForm((current) => ({ ...current, temperature: value }))}
      />
      <Field
        label="O2 Sat"
        value={form.o2_saturation}
        onChange={(value) =>
          setForm((current) => ({ ...current, o2_saturation: value }))
        }
      />
      <Field
        label="Respiratory Rate"
        value={form.respiratory_rate}
        onChange={(value) =>
          setForm((current) => ({ ...current, respiratory_rate: value }))
        }
      />
      <Field
        label="Weight (kg)"
        value={form.weight_kg}
        onChange={(value) => setForm((current) => ({ ...current, weight_kg: value }))}
      />

      <div className="flex items-end">
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving..." : "Record Vitals"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
        inputMode="decimal"
      />
    </label>
  );
}
