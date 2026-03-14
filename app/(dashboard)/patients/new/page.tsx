import { AccessDenied } from "@/components/layout/access-denied";
import { PatientForm } from "@/components/patients/patient-form";
import { requireRole } from "@/lib/auth";

export default async function NewPatientPage() {
  const { unauthorized } = await requireRole([
    "admin",
    "physician",
    "nurse",
    "receptionist",
  ]);

  if (unauthorized) {
    return (
      <AccessDenied description="Only intake and care roles can register new patients." />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Patient Registration
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">
          Register New Patient
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Capture demographics, address, emergency contact, and insurance in a
          single intake flow. MRN generation is handled by the database trigger.
        </p>
      </section>

      <PatientForm />
    </div>
  );
}
