"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { BedBoardItem, PatientLookup, PhysicianLookup } from "@/types";

export function AdmitPatientDialog({
  bed,
  patients,
  physicians,
  prefillPatientId,
  onClose,
  onAdmitted,
}: {
  bed: BedBoardItem | null;
  patients: PatientLookup[];
  physicians: PhysicianLookup[];
  prefillPatientId?: string | null;
  onClose: () => void;
  onAdmitted: (payload: { patientId: string }) => Promise<void> | void;
}) {
  if (!bed) {
    return null;
  }

  return (
    <AdmitPatientDialogInner
      key={`${bed.id}-${prefillPatientId ?? "none"}`}
      bed={bed}
      patients={patients}
      physicians={physicians}
      prefillPatientId={prefillPatientId}
      onClose={onClose}
      onAdmitted={onAdmitted}
    />
  );
}

function AdmitPatientDialogInner({
  bed,
  patients,
  physicians,
  prefillPatientId,
  onClose,
  onAdmitted,
}: {
  bed: BedBoardItem;
  patients: PatientLookup[];
  physicians: PhysicianLookup[];
  prefillPatientId?: string | null;
  onClose: () => void;
  onAdmitted: (payload: { patientId: string }) => Promise<void> | void;
}) {
  const [patientId, setPatientId] = useState(prefillPatientId ?? "");
  const [physicianId, setPhysicianId] = useState(physicians[0]?.id ?? "");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const resolvedPatientId =
      resolvePatientId(patientId, patients) ||
      resolvePatientId(prefillPatientId ?? "", patients);
    const resolvedPhysicianId =
      resolvePhysicianId(physicianId, physicians) ||
      resolvePhysicianId(physicians[0]?.id ?? "", physicians);

    if (!resolvedPatientId || !resolvedPhysicianId) {
      toast.error("Patient and physician are required.");
      return;
    }

    setPending(true);
    const response = await fetch("/api/encounters", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        patient_id: resolvedPatientId,
        bed_id: bed.id,
        attending_physician_id: resolvedPhysicianId,
        dept_id: bed.dept_id,
        chief_complaint: chiefComplaint.trim(),
      }),
    });

    const payload = (await response.json()) as
      | { encounter: { id: string } }
      | { error: string };

    if (!response.ok) {
      toast.error("Unable to admit patient", {
        description: "error" in payload ? payload.error : "Unexpected response.",
      });
      setPending(false);
      return;
    }

    toast.success("Patient admitted successfully.");
    await onAdmitted({ patientId: resolvedPatientId });
    setPending(false);
    onClose();
  }

  return (
    <DialogShell title={`Admit to ${bed.bed_number}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Patient">
          <select
            value={
              resolvePatientId(patientId, patients) ||
              resolvePatientId(prefillPatientId ?? "", patients)
            }
            onChange={(event) =>
              setPatientId(resolvePatientId(event.target.value, patients))
            }
            className={inputClassName}
          >
            <option value="">Select registered patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.full_name} · {patient.mrn}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Attending Physician">
          <select
            value={
              resolvePhysicianId(physicianId, physicians) ||
              resolvePhysicianId(physicians[0]?.id ?? "", physicians)
            }
            onChange={(event) =>
              setPhysicianId(resolvePhysicianId(event.target.value, physicians))
            }
            className={inputClassName}
          >
            <option value="">Select physician</option>
            {physicians.map((physician) => (
              <option key={physician.id} value={physician.id}>
                {physician.full_name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Department">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {bed.department_name}
          </div>
        </Field>

        <Field label="Chief Complaint">
          <textarea
            value={chiefComplaint}
            onChange={(event) => setChiefComplaint(event.target.value)}
            rows={4}
            className={inputClassName}
            placeholder="Reason for admission"
          />
        </Field>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Admitting..." : "Confirm Admission"}
          </button>
        </div>
      </form>
    </DialogShell>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

export function DialogShell({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
              Bed workflow
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string) {
  return uuidPattern.test(value);
}

function resolvePatientId(value: string, patients: PatientLookup[]) {
  const candidate = value.trim();

  if (!candidate) {
    return "";
  }

  if (isUuid(candidate) && patients.some((patient) => patient.id === candidate)) {
    return candidate;
  }

  const matchedPatient = patients.find(
    (patient) => `${patient.full_name} · ${patient.mrn}` === candidate,
  );

  return matchedPatient?.id ?? "";
}

function resolvePhysicianId(value: string, physicians: PhysicianLookup[]) {
  const candidate = value.trim();

  if (!candidate) {
    return "";
  }

  if (
    isUuid(candidate) &&
    physicians.some((physician) => physician.id === candidate)
  ) {
    return candidate;
  }

  const matchedPhysician = physicians.find(
    (physician) => physician.full_name === candidate,
  );

  return matchedPhysician?.id ?? "";
}
