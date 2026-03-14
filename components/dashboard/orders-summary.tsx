"use client";

import type { DashboardStats } from "@/lib/dashboard";

export function OrdersSummary({
  items,
}: {
  items: DashboardStats["order_summary"];
}) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-base font-semibold text-slate-950">Pending Orders by Type</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <article
            key={item.type}
            className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4"
          >
            <p className="text-sm capitalize text-slate-500">{item.type}</p>
            <p className="mt-3 text-2xl font-semibold text-slate-950">{item.pending}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
