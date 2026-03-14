import { AccessDenied } from "@/components/layout/access-denied";
import { requireRole } from "@/lib/auth";
import { getOrdersQueueData } from "@/lib/clinical";
import { OrdersQueue } from "@/components/orders/orders-queue";
import { createClient } from "@/lib/supabase/server";

export default async function OrdersPage() {
  const [access, supabase] = await Promise.all([
    requireRole(["admin", "physician", "nurse"]),
    createClient(),
  ]);
  const { unauthorized } = access;

  if (unauthorized) {
    return (
      <AccessDenied description="Orders are limited to clinical and administrator roles." />
    );
  }

  const orders = await getOrdersQueueData(supabase, access.profile.org_id ?? "");

  return <OrdersQueue initialOrders={orders} />;
}
