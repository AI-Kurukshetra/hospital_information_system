"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { genderOptions, patientFormSchema, planTypes, usStates, type PatientFormValues } from "@/lib/patients";

export function PatientForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      date_of_birth: "",
      gender: "",
      ssn_last4: "",
      phone: "",
      email: "",
      address_line1: "",
      city: "",
      state: "",
      zip: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      emergency_contact_relationship: "",
      insurance_payer: "",
      policy_number: "",
      group_number: "",
      plan_type: "",
    },
  });

  async function onSubmit(values: PatientFormValues) {
    setPending(true);

    const response = await fetch("/api/patients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const payload = (await response.json()) as
      | { patient: { id: string; mrn: string } }
      | { error: string };

    if (!response.ok || !("patient" in payload)) {
      toast.error("Unable to register patient", {
        description:
          "error" in payload ? payload.error : "Unexpected server response.",
      });
      setPending(false);
      return;
    }

    toast.success(`Patient registered successfully - MRN: ${payload.patient.mrn}`);
    router.push(`/patients/${payload.patient.id}`);
    router.refresh();
  }

  const { errors } = form.formState;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm"
    >
      <section className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Demographics
          </p>
        </div>
        <InputField label="First Name*" error={errors.first_name?.message}>
          <input {...form.register("first_name")} className={inputClassName} />
        </InputField>
        <InputField label="Last Name*" error={errors.last_name?.message}>
          <input {...form.register("last_name")} className={inputClassName} />
        </InputField>
        <InputField label="Date of Birth*" error={errors.date_of_birth?.message}>
          <input
            type="date"
            {...form.register("date_of_birth")}
            className={inputClassName}
          />
        </InputField>
        <InputField label="Gender*" error={errors.gender?.message}>
          <select {...form.register("gender")} className={inputClassName}>
            <option value="">Select gender</option>
            {genderOptions.map((gender) => (
              <option key={gender} value={gender}>
                {gender}
              </option>
            ))}
          </select>
        </InputField>
        <InputField label="SSN Last 4" error={errors.ssn_last4?.message}>
          <input
            maxLength={4}
            {...form.register("ssn_last4")}
            className={inputClassName}
          />
        </InputField>
        <InputField label="Phone*" error={errors.phone?.message}>
          <input {...form.register("phone")} className={inputClassName} />
        </InputField>
        <InputField label="Email" error={errors.email?.message}>
          <input
            type="email"
            {...form.register("email")}
            className={inputClassName}
          />
        </InputField>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Address
          </p>
        </div>
        <div className="md:col-span-2">
          <InputField label="Address Line 1" error={errors.address_line1?.message}>
            <input
              {...form.register("address_line1")}
              className={inputClassName}
            />
          </InputField>
        </div>
        <InputField label="City" error={errors.city?.message}>
          <input {...form.register("city")} className={inputClassName} />
        </InputField>
        <InputField label="State" error={errors.state?.message}>
          <select {...form.register("state")} className={inputClassName}>
            <option value="">Select state</option>
            {usStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </InputField>
        <InputField label="ZIP" error={errors.zip?.message}>
          <input {...form.register("zip")} className={inputClassName} />
        </InputField>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Emergency Contact
          </p>
        </div>
        <InputField
          label="Contact Name"
          error={errors.emergency_contact_name?.message}
        >
          <input
            {...form.register("emergency_contact_name")}
            className={inputClassName}
          />
        </InputField>
        <InputField
          label="Contact Phone"
          error={errors.emergency_contact_phone?.message}
        >
          <input
            {...form.register("emergency_contact_phone")}
            className={inputClassName}
          />
        </InputField>
        <InputField
          label="Relationship"
          error={errors.emergency_contact_relationship?.message}
        >
          <input
            {...form.register("emergency_contact_relationship")}
            className={inputClassName}
          />
        </InputField>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Insurance
          </p>
        </div>
        <InputField label="Payer Name*" error={errors.insurance_payer?.message}>
          <input
            {...form.register("insurance_payer")}
            className={inputClassName}
          />
        </InputField>
        <InputField label="Policy Number*" error={errors.policy_number?.message}>
          <input
            {...form.register("policy_number")}
            className={inputClassName}
          />
        </InputField>
        <InputField label="Group Number" error={errors.group_number?.message}>
          <input {...form.register("group_number")} className={inputClassName} />
        </InputField>
        <InputField label="Plan Type*" error={errors.plan_type?.message}>
          <select {...form.register("plan_type")} className={inputClassName}>
            <option value="">Select plan type</option>
            {planTypes.map((plan) => (
              <option key={plan} value={plan}>
                {plan}
              </option>
            ))}
          </select>
        </InputField>
      </section>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/patients")}
          className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Registering..." : "Register Patient"}
        </button>
      </div>
    </form>
  );
}

function InputField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100";
