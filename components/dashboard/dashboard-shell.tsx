import { Activity, BedDouble, ClipboardList, DollarSign, Users } from "lucide-react";
import type { UserRole } from "@/types";

interface DashboardShellProps {
  role: UserRole;
  fullName: string;
}

const roleCopy: Record<UserRole, { eyebrow: string; summary: string }> = {
  admin: {
    eyebrow: "Operational command",
    summary:
      "System-wide census, throughput, orders, and revenue are centralized here for the hackathon MVP.",
  },
  physician: {
    eyebrow: "Clinical command",
    summary:
      "Prioritize active patients, urgent orders, and recent chart activity from a single physician view.",
  },
  nurse: {
    eyebrow: "Unit command",
    summary:
      "Track bed turns, new vitals, and nursing actions without bouncing between disconnected screens.",
  },
  billing: {
    eyebrow: "Revenue command",
    summary:
      "Follow active claims, draft encounters, and reimbursement risk with direct billing access.",
  },
  receptionist: {
    eyebrow: "Front desk command",
    summary:
      "Monitor incoming registrations, bed availability, and admission readiness for the day shift.",
  },
};

const metrics = [
  {
    label: "Current Census",
    value: "3 active",
    icon: Users,
    tone: "bg-sky-100 text-sky-700",
  },
  {
    label: "Occupancy",
    value: "12%",
    icon: BedDouble,
    tone: "bg-emerald-100 text-emerald-700",
  },
  {
    label: "Pending Orders",
    value: "6 items",
    icon: ClipboardList,
    tone: "bg-amber-100 text-amber-700",
  },
  {
    label: "Draft Billing",
    value: "3 claims",
    icon: DollarSign,
    tone: "bg-rose-100 text-rose-700",
  },
];

export function DashboardShell({ role, fullName }: DashboardShellProps) {
  const content = roleCopy[role];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-8 bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,transparent_36%),linear-gradient(135deg,#ffffff_0%,#f8fafc_60%,#e0f2fe_100%)] px-8 py-10 lg:grid-cols-[1.45fr_0.9fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-slate-500">
              {content.eyebrow}
            </p>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight text-slate-950">
              {fullName}, Sprint 0 is now framing the full hospital workflow.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              {content.summary}
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.4)] backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">MVP Gate Status</p>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Foundation Active
              </span>
            </div>
            <div className="mt-6 space-y-4 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <Activity className="mt-0.5 h-4 w-4 text-sky-600" />
                <p>Schema, RLS, and role-aware navigation are being established first.</p>
              </div>
              <div className="flex items-start gap-3">
                <Activity className="mt-0.5 h-4 w-4 text-sky-600" />
                <p>Patient, bed, chart, order, billing, and dashboard modules will land on this shell next.</p>
              </div>
              <div className="flex items-start gap-3">
                <Activity className="mt-0.5 h-4 w-4 text-sky-600" />
                <p>Security gates remain explicit: org scoping everywhere, billing limited to admin and billing roles.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">{metric.label}</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">
                  {metric.value}
                </p>
              </div>
              <div className={`rounded-2xl p-3 ${metric.tone}`}>
                <metric.icon className="h-5 w-5" />
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
