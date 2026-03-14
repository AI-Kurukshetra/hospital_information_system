"use client";

import { useEffect, useState } from "react";
import { BedDouble, DollarSign, Users } from "lucide-react";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { CensusTable } from "@/components/dashboard/census-table";
import { BedOccupancyChart } from "@/components/dashboard/bed-occupancy-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { OrdersSummary } from "@/components/dashboard/orders-summary";
import { currency } from "@/lib/billing";
import type { DashboardStats } from "@/lib/dashboard";
import type { UserRole } from "@/types";

export function DashboardClient({
  initialStats,
  role,
  fullName,
}: {
  initialStats: DashboardStats;
  role: UserRole;
  fullName: string;
}) {
  const [stats, setStats] = useState(initialStats);

  useEffect(() => {
    const interval = window.setInterval(async () => {
      const response = await fetch("/api/dashboard/stats", { cache: "no-store" });
      const payload = (await response.json()) as { stats?: DashboardStats };

      if (response.ok && payload.stats) {
        setStats(payload.stats);
      }
    }, 60000);

    return () => window.clearInterval(interval);
  }, []);

  if (role === "billing") {
    return (
      <div className="space-y-8">
        <Hero
          eyebrow="Revenue command"
          title={`${fullName}, billing records and claim tracking are live.`}
          summary="Track draft claims, submitted balances, and billing throughput from a single operational view."
        />
        <section className="grid gap-4 md:grid-cols-3">
          <Panel
            label="Draft Billing"
            value={String(stats.draft_billing_records)}
            icon={DollarSign}
          />
          <Panel
            label="Submitted Claims"
            value={String(stats.submitted_billing_records)}
            icon={Users}
          />
          <Panel
            label="Outstanding"
            value={currency(stats.total_outstanding)}
            icon={BedDouble}
          />
        </section>
      </div>
    );
  }

  if (role === "receptionist") {
    return (
      <div className="space-y-8">
        <Hero
          eyebrow="Front desk command"
          title={`${fullName}, registrations and bed readiness are visible now.`}
          summary="Focus on front-door throughput with availability and same-day operational signals."
        />
        <section className="grid gap-4 md:grid-cols-3">
          <Panel label="Available Beds" value={String(stats.available_beds)} icon={BedDouble} />
          <Panel label="Today's Admissions" value={String(stats.todays_admissions)} icon={Users} />
          <Panel label="Current Census" value={String(stats.census)} icon={DollarSign} />
        </section>
        <RecentActivity items={stats.recent_activity} />
      </div>
    );
  }

  if (role === "physician" || role === "nurse") {
    return (
      <div className="space-y-8">
        <Hero
          eyebrow={role === "physician" ? "Clinical command" : "Unit command"}
          title={`${fullName}, current clinical operations are in one place.`}
          summary="Review the active census, pending orders, and recent patient movement without leaving the dashboard."
        />
        <KpiCards stats={stats} />
        <CensusTable rows={stats.census_rows} />
        <OrdersSummary items={stats.order_summary} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Hero
        eyebrow="Operational command"
        title={`${fullName}, your hospital operations dashboard is ready.`}
        summary="Census, occupancy, orders, admissions, discharges, and revenue indicators are centralized in one view."
      />
      <KpiCards stats={stats} />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <CensusTable rows={stats.census_rows} />
        <RecentActivity items={stats.recent_activity} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <BedOccupancyChart data={stats.bed_occupancy_by_department} />
        <OrdersSummary items={stats.order_summary} />
      </div>
    </div>
  );
}

function Hero({
  eyebrow,
  title,
  summary,
}: {
  eyebrow: string;
  title: string;
  summary: string;
}) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-8 bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,transparent_32%),linear-gradient(135deg,#ffffff_0%,#f8fafc_60%,#e0f2fe_100%)] px-8 py-10 lg:grid-cols-[1.45fr_0.85fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-slate-500">{eyebrow}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-slate-950">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            {summary}
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.4)] backdrop-blur">
          <p className="text-sm font-semibold text-slate-900">System Status</p>
          <div className="mt-5 space-y-3 text-sm text-slate-600">
            <p>Registration, admission, clinical charting, and orders are working.</p>
            <p>Billing is now available to admin and billing roles only.</p>
            <p>Dashboard refreshes from live data every 60 seconds.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Panel({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Users;
}) {
  return (
    <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
        </div>
        <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}
