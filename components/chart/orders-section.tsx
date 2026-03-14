"use client";

import { useState } from "react";
import { toast } from "sonner";
import { NewOrderForm } from "@/components/orders/new-order-form";
import { OrderCard } from "@/components/orders/order-card";
import type { ChartOrder } from "@/lib/clinical";
import type { Order } from "@/types";

export function OrdersSection({
  encounterId,
  orders,
  canCreate,
  canUpdate,
  onCreated,
  onUpdated,
}: {
  encounterId: string;
  orders: ChartOrder[];
  canCreate: boolean;
  canUpdate: boolean;
  onCreated: (order: ChartOrder) => void;
  onUpdated: (order: Order) => void;
}) {
  const [pending, setPending] = useState(false);

  async function handleCreate(payload: Record<string, string>) {
    setPending(true);

    const response = await fetch(`/api/encounters/${encounterId}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as { order?: ChartOrder; error?: string };

    if (!response.ok || !data.order) {
      toast.error("Unable to create order.", {
        description: data.error ?? "Unexpected response.",
      });
      setPending(false);
      return;
    }

    onCreated(data.order);
    toast.success("Order created.");
    setPending(false);
  }

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

    onUpdated(data.order);
    toast.success(`Order marked ${status.replace("_", " ")}.`);
  }

  return (
    <div className="space-y-6">
      {canCreate ? (
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-base font-semibold text-slate-950">New order</p>
          <p className="mt-2 text-sm text-slate-500">
            Physician order entry for medications, labs, imaging, and other tasks.
          </p>
          <div className="mt-5">
            <NewOrderForm pending={pending} onSubmit={handleCreate} />
          </div>
        </section>
      ) : null}

      <section className="grid gap-4">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onStatusChange={canUpdate ? handleStatusChange : undefined}
          />
        ))}
      </section>
    </div>
  );
}
