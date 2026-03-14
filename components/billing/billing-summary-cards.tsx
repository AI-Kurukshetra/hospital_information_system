"use client";

import { AlertTriangle, CircleDollarSign, HandCoins, ReceiptText } from "lucide-react";
import { currency, type BillingSummary } from "@/lib/billing";

export function BillingSummaryCards({ summary }: { summary: BillingSummary }) {
  const cards = [
    {
      label: "Total Billed",
      value: currency(summary.total_billed),
      tone: "bg-sky-100 text-sky-700",
      icon: ReceiptText,
    },
    {
      label: "Collected",
      value: currency(summary.collected),
      tone: "bg-emerald-100 text-emerald-700",
      icon: HandCoins,
    },
    {
      label: "Outstanding",
      value: currency(summary.outstanding),
      tone: "bg-amber-100 text-amber-700",
      icon: CircleDollarSign,
    },
    {
      label: "Denied Claims",
      value: `${summary.denied_count} · ${currency(summary.denied_amount)}`,
      tone: "bg-rose-100 text-rose-700",
      icon: AlertTriangle,
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
