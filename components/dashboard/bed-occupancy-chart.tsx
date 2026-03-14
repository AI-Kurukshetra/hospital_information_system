"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardStats } from "@/lib/dashboard";

export function BedOccupancyChart({
  data,
}: {
  data: DashboardStats["bed_occupancy_by_department"];
}) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-base font-semibold text-slate-950">Bed Occupancy</p>
      <p className="mt-2 text-sm text-slate-500">
        Available, occupied, and other states by department.
      </p>
      <div className="mt-6 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" />
            <YAxis dataKey="department" type="category" width={90} />
            <Tooltip />
            <Bar dataKey="available" stackId="beds" fill="#16a34a" radius={[0, 4, 4, 0]} />
            <Bar dataKey="occupied" stackId="beds" fill="#dc2626" radius={[0, 4, 4, 0]} />
            <Bar dataKey="other" stackId="beds" fill="#64748b" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
