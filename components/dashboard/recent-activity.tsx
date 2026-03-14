"use client";

import { ArrowLeftFromLine, ArrowRightToLine } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { DashboardStats } from "@/lib/dashboard";

export function RecentActivity({
  items,
}: {
  items: DashboardStats["recent_activity"];
}) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-base font-semibold text-slate-950">Recent Activity</p>
      <div className="mt-5 space-y-4">
        {items.map((item) => {
          const isAdmission = item.type === "admission";
          return (
            <div
              key={`${item.encounter_id}-${item.type}-${item.timestamp}`}
              className="flex items-start gap-4 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4"
            >
              <div
                className={`rounded-2xl p-3 ${
                  isAdmission
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {isAdmission ? (
                  <ArrowRightToLine className="h-4 w-4" />
                ) : (
                  <ArrowLeftFromLine className="h-4 w-4" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-950">
                  {item.patient_name}{" "}
                  {isAdmission ? "admitted" : "discharged"}
                  {item.bed_number ? ` ${isAdmission ? "to" : "from"} ${item.bed_number}` : ""}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
