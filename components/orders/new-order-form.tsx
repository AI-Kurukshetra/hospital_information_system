"use client";

import { useState } from "react";

const initialState = {
  order_type: "medication",
  description: "",
  frequency: "",
  priority: "routine",
  notes: "",
};

export function NewOrderForm({
  pending,
  onSubmit,
}: {
  pending: boolean;
  onSubmit: (payload: typeof initialState) => Promise<void>;
}) {
  const [form, setForm] = useState(initialState);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(form);
    setForm(initialState);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
      <select
        value={form.order_type}
        onChange={(event) =>
          setForm((current) => ({ ...current, order_type: event.target.value }))
        }
        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
      >
        <option value="medication">Medication</option>
        <option value="lab">Lab</option>
        <option value="imaging">Imaging</option>
        <option value="other">Other</option>
      </select>
      <select
        value={form.priority}
        onChange={(event) =>
          setForm((current) => ({ ...current, priority: event.target.value }))
        }
        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
      >
        <option value="routine">Routine</option>
        <option value="urgent">Urgent</option>
        <option value="stat">STAT</option>
      </select>
      <input
        value={form.description}
        onChange={(event) =>
          setForm((current) => ({ ...current, description: event.target.value }))
        }
        placeholder="Order description"
        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm md:col-span-2"
      />
      <input
        value={form.frequency}
        onChange={(event) =>
          setForm((current) => ({ ...current, frequency: event.target.value }))
        }
        placeholder="Frequency"
        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
      />
      <input
        value={form.notes}
        onChange={(event) =>
          setForm((current) => ({ ...current, notes: event.target.value }))
        }
        placeholder="Notes"
        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 md:col-span-2"
      >
        {pending ? "Saving..." : "Create Order"}
      </button>
    </form>
  );
}
