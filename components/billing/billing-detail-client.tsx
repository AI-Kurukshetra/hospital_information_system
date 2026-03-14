"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { currency, type BillingDetail } from "@/lib/billing";
import {
  LineItemsEditor,
  mapLineItems,
  type EditableLineItem,
} from "@/components/billing/line-items-editor";

export function BillingDetailClient({ detail }: { detail: BillingDetail }) {
  const [record, setRecord] = useState(detail.record);
  const [lineItems, setLineItems] = useState<EditableLineItem[]>(
    mapLineItems(detail.line_items),
  );
  const [notes, setNotes] = useState(detail.record.notes ?? "");
  const [payer, setPayer] = useState(detail.record.payer ?? "");
  const [claimStatus, setClaimStatus] = useState(detail.record.claim_status);
  const [reimbursementRate, setReimbursementRate] = useState(() => {
    if (!detail.record.total_charges) {
      return 0;
    }

    return Math.round(
      (detail.record.expected_reimbursement / detail.record.total_charges) * 100,
    );
  });
  const [pending, setPending] = useState(false);

  const totalCharges = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0,
  );
  const expectedReimbursement = totalCharges * (reimbursementRate / 100);
  const patientResponsibility = totalCharges - expectedReimbursement;

  async function handleSave() {
    setPending(true);

    const submittedAt =
      claimStatus === "submitted" && !record.submitted_at
        ? new Date().toISOString()
        : record.submitted_at;

    const response = await fetch(`/api/billing/${record.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        claim_status: claimStatus,
        payer,
        reimbursement_rate: reimbursementRate,
        notes,
        submitted_at: submittedAt,
        line_items: lineItems,
      }),
    });

    const payload = (await response.json()) as {
      record?: BillingDetail["record"];
      error?: string;
    };

    if (!response.ok || !payload.record) {
      toast.error("Unable to update billing record.", {
        description: payload.error ?? "Unexpected response.",
      });
      setPending(false);
      return;
    }

    setRecord(payload.record);
    toast.success(
      claimStatus === "submitted"
        ? "Claim submitted."
        : "Billing record updated.",
    );
    setPending(false);
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-8 bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,transparent_32%),linear-gradient(135deg,#ffffff_0%,#f8fafc_60%,#e0f2fe_100%)] px-8 py-8 lg:grid-cols-[1.35fr_0.9fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Billing Detail
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-950">
              {detail.patient?.first_name} {detail.patient?.last_name}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              MRN {detail.patient?.mrn ?? "Unknown"} · Encounter{" "}
              {detail.encounter?.admission_date
                ? format(new Date(detail.encounter.admission_date), "MMM d, yyyy")
                : "Unknown"}
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.4)] backdrop-blur">
            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Claim Status</span>
                <select
                  value={claimStatus}
                  onChange={(event) =>
                    setClaimStatus(
                      event.target.value as "draft" | "submitted" | "paid" | "denied",
                    )
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="paid">Paid</option>
                  <option value="denied">Denied</option>
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Payer</span>
                <input
                  value={payer}
                  onChange={(event) => setPayer(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                />
              </label>
            </div>
          </div>
        </div>
      </section>

      <LineItemsEditor items={lineItems} onChange={setLineItems} />

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-base font-semibold text-slate-950">Financial Summary</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Metric label="Total Charges" value={currency(totalCharges)} />
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Expected Reimbursement %</p>
              <input
                type="number"
                min="0"
                max="100"
                value={reimbursementRate}
                onChange={(event) =>
                  setReimbursementRate(Number(event.target.value || "0"))
                }
                className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              />
              <p className="mt-3 text-xl font-semibold text-slate-950">
                {currency(expectedReimbursement)}
              </p>
            </div>
            <Metric
              label="Patient Responsibility"
              value={currency(patientResponsibility)}
            />
          </div>
        </div>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-base font-semibold text-slate-950">Billing Notes</p>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={8}
            className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            placeholder="Billing notes"
          />
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={pending}
            className="mt-5 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {pending ? "Saving..." : "Save Billing Record"}
          </button>
        </section>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
