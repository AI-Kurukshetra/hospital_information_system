"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { ChartNote } from "@/lib/clinical";

export function NotesSection({
  encounterId,
  notes,
  canCreate,
  onCreated,
}: {
  encounterId: string;
  notes: ChartNote[];
  canCreate: boolean;
  onCreated: (note: ChartNote) => void;
}) {
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    note_type: "progress_note",
    content: "",
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    const response = await fetch(`/api/encounters/${encounterId}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = (await response.json()) as { note?: ChartNote; error?: string };

    if (!response.ok || !data.note) {
      toast.error("Unable to save note.", {
        description: data.error ?? "Unexpected response.",
      });
      setPending(false);
      return;
    }

    onCreated(data.note);
    setForm({
      note_type: "progress_note",
      content: "",
    });
    toast.success("Note added.");
    setPending(false);
  }

  return (
    <div className="space-y-6">
      {canCreate ? (
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-base font-semibold text-slate-950">Add note</p>
          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <select
              value={form.note_type}
              onChange={(event) =>
                setForm((current) => ({ ...current, note_type: event.target.value }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            >
              <option value="progress_note">Progress note</option>
              <option value="physician_note">Physician note</option>
              <option value="nursing_assessment">Nursing assessment</option>
              <option value="discharge_summary">Discharge summary</option>
            </select>
            <textarea
              value={form.content}
              onChange={(event) =>
                setForm((current) => ({ ...current, content: event.target.value }))
              }
              rows={5}
              placeholder="Clinical note content"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            />
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {pending ? "Saving..." : "Add Note"}
            </button>
          </form>
        </section>
      ) : null}

      <section className="space-y-4">
        {notes.map((note) => (
          <article
            key={note.id}
            className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {note.note_type.replaceAll("_", " ")}
              </span>
              <span className="text-xs uppercase tracking-[0.16em] text-slate-400">
                {format(new Date(note.created_at), "MMM d, h:mm a")}
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-700">{note.content}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.16em] text-slate-400">
              {note.author_name ?? "Clinical staff"}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
