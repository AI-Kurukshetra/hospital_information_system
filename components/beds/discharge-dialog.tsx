"use client";

import { toast } from "sonner";
import type { BedBoardItem } from "@/types";
import { DialogShell } from "@/components/beds/admit-patient-dialog";

export function DischargeDialog({
  bed,
  onClose,
  onDischarged,
}: {
  bed: BedBoardItem | null;
  onClose: () => void;
  onDischarged: () => Promise<void> | void;
}) {
  if (!bed?.encounter_id) {
    return null;
  }

  const targetBed: BedBoardItem = bed;
  const encounterId = bed.encounter_id;

  async function handleDischarge() {
    const response = await fetch(`/api/encounters/${encounterId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "discharge",
      }),
    });

    const payload = (await response.json()) as
      | { encounter: { id: string } }
      | { error: string };

    if (!response.ok) {
      toast.error("Unable to discharge patient", {
        description: "error" in payload ? payload.error : "Unexpected response.",
      });
      return;
    }

    toast.success("Patient discharged. Bed moved to housekeeping.");
    await onDischarged();
    onClose();
  }

  return (
    <DialogShell
      title={`Discharge ${targetBed.patient_name ?? "patient"}`}
      onClose={onClose}
    >
      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-950">{targetBed.patient_name}</p>
          <p className="mt-1">
            Bed {targetBed.bed_number} · {targetBed.department_name}
          </p>
          <p className="mt-1">
            {targetBed.chief_complaint ?? "No chief complaint recorded."}
          </p>
        </div>
        <p className="text-sm leading-6 text-slate-600">
          This will mark the encounter as discharged, update the patient status
          to discharged, and move the bed to housekeeping.
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDischarge}
            className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            Confirm Discharge
          </button>
        </div>
      </div>
    </DialogShell>
  );
}
