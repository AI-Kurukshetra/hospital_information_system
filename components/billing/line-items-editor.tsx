"use client";

import { useState } from "react";
import { cptSuggestions } from "@/lib/billing";
import type { BillingLineItem } from "@/types";

export interface EditableLineItem {
  id?: string;
  cpt_code: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export function LineItemsEditor({
  items,
  onChange,
}: {
  items: EditableLineItem[];
  onChange: (items: EditableLineItem[]) => void;
}) {
  const [selectedCode, setSelectedCode] = useState<string>(
    cptSuggestions[0]?.code ?? "",
  );

  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-base font-semibold text-slate-950">Line items</p>
          <p className="mt-2 text-sm text-slate-500">
            CPT-aligned billing items with automatic total calculation.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedCode}
            onChange={(event) => setSelectedCode(event.target.value)}
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
          >
            {cptSuggestions.map((suggestion) => (
              <option key={suggestion.code} value={suggestion.code}>
                {suggestion.code} · {suggestion.description}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              const suggestion = cptSuggestions.find((item) => item.code === selectedCode);
              onChange([
                ...items,
                {
                  cpt_code: suggestion?.code ?? "",
                  description: suggestion?.description ?? "",
                  quantity: 1,
                  unit_price: suggestion?.unit_price ?? 0,
                },
              ]);
            }}
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Add Line Item
          </button>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-3 py-3 font-medium">CPT</th>
              <th className="px-3 py-3 font-medium">Description</th>
              <th className="px-3 py-3 font-medium">Qty</th>
              <th className="px-3 py-3 font-medium">Unit Price</th>
              <th className="px-3 py-3 font-medium">Total</th>
              <th className="px-3 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={`${item.cpt_code}-${index}`} className="border-b border-slate-100">
                <td className="px-3 py-3">
                  <input
                    value={item.cpt_code}
                    onChange={(event) =>
                      update(items, index, { cpt_code: event.target.value }, onChange)
                    }
                    className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                  />
                </td>
                <td className="px-3 py-3">
                  <input
                    value={item.description}
                    onChange={(event) =>
                      update(items, index, { description: event.target.value }, onChange)
                    }
                    className="w-full min-w-64 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                  />
                </td>
                <td className="px-3 py-3">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(event) =>
                      update(
                        items,
                        index,
                        { quantity: Number(event.target.value || "1") },
                        onChange,
                      )
                    }
                    className="w-20 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                  />
                </td>
                <td className="px-3 py-3">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(event) =>
                      update(
                        items,
                        index,
                        { unit_price: Number(event.target.value || "0") },
                        onChange,
                      )
                    }
                    className="w-28 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                  />
                </td>
                <td className="px-3 py-3 font-medium text-slate-950">
                  ${(item.quantity * item.unit_price).toFixed(2)}
                </td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    onClick={() =>
                      onChange(items.filter((_, itemIndex) => itemIndex !== index))
                    }
                    className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function update(
  items: EditableLineItem[],
  index: number,
  patch: Partial<EditableLineItem>,
  onChange: (items: EditableLineItem[]) => void,
) {
  onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
}

export function mapLineItems(items: BillingLineItem[]): EditableLineItem[] {
  return items.map((item) => ({
    id: item.id,
    cpt_code: item.cpt_code ?? "",
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
  }));
}
