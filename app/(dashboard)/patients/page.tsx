import Link from "next/link";
import { AccessDenied } from "@/components/layout/access-denied";
import { PatientList } from "@/components/patients/patient-list";
import { requireRole } from "@/lib/auth";
import { patientStatuses } from "@/lib/patients";
import { createClient } from "@/lib/supabase/server";
import type { Patient } from "@/types";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
}) {
  const [access, params, supabase] = await Promise.all([
    requireRole(["admin", "physician", "nurse", "receptionist"]),
    searchParams,
    createClient(),
  ]);

  if (access.unauthorized) {
    return (
      <AccessDenied description="Patient registration and directory access are limited to admin, physician, nurse, and receptionist roles." />
    );
  }

  const { profile } = access;
  const search = params.q?.trim() ?? "";
  const statusFilter =
    params.status && patientStatuses.includes(params.status as never)
      ? params.status
      : "all";
  const page = Number(params.page ?? "1");
  const pageSize = 20;
  const offset = Math.max(page - 1, 0) * pageSize;

  let query = supabase
    .from("patients")
    .select("*")
    .eq("org_id", profile.org_id)
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,mrn.ilike.%${search}%,phone.ilike.%${search}%`,
    );
  }

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Sprint 1
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-950">
              Patient Registration and Directory
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Reception, nursing, and admin teams can search patients, filter by
              admission status, and move directly into intake or chart actions.
            </p>
          </div>

          <Link
            href="/patients/new"
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Register New Patient
          </Link>
        </div>

        <form className="mt-8 grid gap-4 md:grid-cols-[1fr_220px_auto]">
          <input
            type="search"
            name="q"
            defaultValue={search}
            placeholder="Search by name, MRN, or phone"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
          <select
            name="status"
            defaultValue={statusFilter}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
          >
            <option value="all">All statuses</option>
            {patientStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Apply filters
          </button>
        </form>
      </section>

      <PatientList
        patients={(data ?? []) as Patient[]}
        page={page}
        pageSize={pageSize}
      />
    </div>
  );
}
