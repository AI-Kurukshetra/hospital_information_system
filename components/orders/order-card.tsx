"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Activity, FlaskConical, Pill, ScanSearch, Ban } from "lucide-react";
import type { OrdersQueueItem } from "@/lib/clinical";
import type { Order } from "@/types";

type OrderLike = Order & {
  patient_id?: string;
  ordered_by_name?: string | null;
  patient_name?: string;
  patient_mrn?: string;
  department_name?: string | null;
  bed_number?: string | null;
};

export function OrderCard({
  order,
  onStatusChange,
}: {
  order: OrderLike;
  onStatusChange?: (orderId: string, status: Order["status"]) => Promise<void>;
}) {
  const Icon = iconByType[order.order_type];
  const isStat = order.priority === "stat";

  return (
    <article
      className={`rounded-[1.5rem] border p-5 shadow-sm ${
        isStat ? "border-rose-200 bg-rose-50/70" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <div
            className={`rounded-2xl p-3 ${
              isStat ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-base font-semibold text-slate-950">
                {order.description}
              </p>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isStat
                    ? "bg-rose-100 text-rose-700"
                    : "bg-sky-100 text-sky-700"
                }`}
              >
                {order.priority}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {order.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {order.order_type} · {order.frequency ?? "Once"} · Ordered{" "}
              {format(new Date(order.ordered_at), "MMM d, h:mm a")}
            </p>
            {order.patient_name ? (
              <p className="mt-2 text-sm text-slate-500">
                {order.patient_name} · {order.patient_mrn}
                {order.department_name ? ` · ${order.department_name}` : ""}
                {order.bed_number ? ` · ${order.bed_number}` : ""}
              </p>
            ) : null}
            {order.notes ? (
              <p className="mt-3 text-sm leading-6 text-slate-600">{order.notes}</p>
            ) : null}
            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">
              Ordered by {order.ordered_by_name ?? "Clinical team"}
            </p>
          </div>
        </div>

        {onStatusChange ? (
          <div className="flex flex-wrap gap-2">
            {order.patient_id ? (
              <Link
                href={`/patients/${order.patient_id}/chart`}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Open Chart
              </Link>
            ) : null}
            {order.status === "pending" ? (
              <button
                type="button"
                onClick={() => void onStatusChange(order.id, "in_progress")}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Start
              </button>
            ) : null}
            {["pending", "in_progress"].includes(order.status) ? (
              <button
                type="button"
                onClick={() => void onStatusChange(order.id, "completed")}
                className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
              >
                Mark Complete
              </button>
            ) : null}
            {order.status === "pending" ? (
              <button
                type="button"
                onClick={() => void onStatusChange(order.id, "cancelled")}
                className="rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
              >
                Cancel
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

const iconByType = {
  medication: Pill,
  lab: FlaskConical,
  imaging: ScanSearch,
  other: Activity,
} satisfies Record<OrdersQueueItem["order_type"], typeof Ban>;
