"use client";

import { useState } from "react";
import { toast } from "sonner";
import { OrderCard } from "@/components/orders/order-card";
import type { OrdersQueueItem } from "@/lib/clinical";
import type { Order } from "@/types";

export function OrdersQueue({ initialOrders }: { initialOrders: OrdersQueueItem[] }) {
  const [orders, setOrders] = useState(initialOrders);

  async function handleStatusChange(orderId: string, status: Order["status"]) {
    const response = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    const data = (await response.json()) as { order?: Order; error?: string };

    if (!response.ok || !data.order) {
      toast.error("Unable to update order.", {
        description: data.error ?? "Unexpected response.",
      });
      return;
    }

    setOrders((current) =>
      current
        .map((order) =>
          order.id === data.order?.id ? { ...order, ...data.order } : order,
        )
        .filter((order) => ["pending", "in_progress"].includes(order.status)),
    );
    toast.success(`Order marked ${status.replace("_", " ")}.`);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Sprint 2
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-950">
              Active Orders Queue
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Pending and in-progress clinical orders across active encounters,
              with STAT work highlighted first.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-sm text-slate-500">Open orders</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{orders.length}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onStatusChange={handleStatusChange}
          />
        ))}
      </section>
    </div>
  );
}
