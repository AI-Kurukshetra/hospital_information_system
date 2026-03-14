"use client";

import { BedDouble, ClipboardList, DollarSign, UserMinus, UserPlus, Users } from "lucide-react";
import type { DashboardStats } from "@/lib/dashboard";

export function KpiCards({ stats }: { stats: DashboardStats }) {
  const cards = [
    {
      label: "Current Census",
      value: String(stats.census),
      tone: "bg-sky-100 text-sky-700",
      icon: Users,
    },
    {
      label: "Bed Occupancy",
      value: `${stats.occupancy_pct}%`,
      tone:
        stats.occupancy_pct > 90
          ? "bg-rose-100 text-rose-700"
          : stats.occupancy_pct >= 80
            ? "bg-amber-100 text-amber-700"
            : "bg-emerald-100 text-emerald-700",
      icon: BedDouble,
    },
    {
      label: "Pending Orders",
      value: String(stats.pending_orders),
      tone: "bg-amber-100 text-amber-700",
      icon: ClipboardList,
    },
    {
      label: "Today's Admissions",
      value: String(stats.todays_admissions),
      tone: "bg-indigo-100 text-indigo-700",
      icon: UserPlus,
    },
    {
      label: "Today's Discharges",
      value: String(stats.todays_discharges),
      tone: "bg-slate-100 text-slate-700",
      icon: UserMinus,
    },
    {
      label: "Draft Billing",
      value: String(stats.draft_billing_records),
      tone: "bg-rose-100 text-rose-700",
      icon: DollarSign,
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">
                {card.value}
              </p>
            </div>
            <div className={`rounded-2xl p-3 ${card.tone}`}>
              <card.icon className="h-5 w-5" />
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
