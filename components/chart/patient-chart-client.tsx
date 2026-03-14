"use client";

import { useState } from "react";
import { ChartHeader } from "@/components/chart/chart-header";
import { DiagnosesSection } from "@/components/chart/diagnoses-section";
import { EncounterSummary } from "@/components/chart/encounter-summary";
import { NotesSection } from "@/components/chart/notes-section";
import { OrdersSection } from "@/components/chart/orders-section";
import { VitalsSection } from "@/components/chart/vitals-section";
import type { ChartBillingRecord, ChartNote, ChartOrder, PatientChartData } from "@/lib/clinical";
import type { Diagnosis, Order, UserRole, Vitals } from "@/types";

const tabs = ["overview", "vitals", "orders", "notes", "billing"] as const;
type ChartTab = (typeof tabs)[number];

export function PatientChartClient({
  data,
  role,
}: {
  data: PatientChartData;
  role: UserRole;
}) {
  const [activeTab, setActiveTab] = useState<ChartTab>("overview");
  const [vitals, setVitals] = useState(data.vitals);
  const [diagnoses, setDiagnoses] = useState(data.diagnoses);
  const [orders, setOrders] = useState(data.orders);
  const [notes, setNotes] = useState(data.notes);

  const canRecordVitals = role === "admin" || role === "physician" || role === "nurse";
  const canAddDiagnosis = role === "admin" || role === "physician";
  const canCreateOrders = role === "admin" || role === "physician";
  const canUpdateOrders = role === "admin" || role === "physician" || role === "nurse";
  const canCreateNotes = role === "admin" || role === "physician" || role === "nurse";

  return (
    <div className="space-y-8">
      <ChartHeader patient={data.patient} encounter={data.encounter} role={role} />

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {activeTab === "overview" ? (
        <div className="space-y-6">
          <EncounterSummary
            encounter={data.encounter}
            latestVital={vitals[0] ?? null}
            orders={orders}
            notes={notes}
          />
          <DiagnosesSection
            encounterId={data.encounter?.id ?? ""}
            diagnoses={diagnoses}
            canEdit={Boolean(data.encounter?.id) && canAddDiagnosis}
            onCreated={(diagnosis: Diagnosis) =>
              setDiagnoses((current) => [diagnosis, ...current])
            }
          />
        </div>
      ) : null}

      {activeTab === "vitals" && data.encounter ? (
        <VitalsSection
          encounterId={data.encounter.id}
          vitals={vitals}
          canRecord={canRecordVitals}
          onCreated={(vital: Vitals) => setVitals((current) => [vital, ...current])}
        />
      ) : null}

      {activeTab === "orders" && data.encounter ? (
        <OrdersSection
          encounterId={data.encounter.id}
          orders={orders}
          canCreate={canCreateOrders}
          canUpdate={canUpdateOrders}
          onCreated={(order: ChartOrder) => setOrders((current) => [order, ...current])}
          onUpdated={(updatedOrder: Order) =>
            setOrders((current) =>
              current.map((order) =>
                order.id === updatedOrder.id
                  ? { ...order, ...updatedOrder }
                  : order,
              ),
            )
          }
        />
      ) : null}

      {activeTab === "notes" && data.encounter ? (
        <NotesSection
          encounterId={data.encounter.id}
          notes={notes}
          canCreate={canCreateNotes}
          onCreated={(note: ChartNote) => setNotes((current) => [note, ...current])}
        />
      ) : null}

      {activeTab === "billing" ? (
        <BillingTab billingRecord={data.billing_record} billingRecordId={data.billing_record?.id} role={role} />
      ) : null}
    </div>
  );
}

const claimStatusStyles: Record<
  NonNullable<ChartBillingRecord["claim_status"]>,
  string
> = {
  draft: "bg-slate-100 text-slate-700",
  submitted: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  denied: "bg-red-100 text-red-700",
};

function BillingTab({
  billingRecord,
  billingRecordId,
  role,
}: {
  billingRecord: ChartBillingRecord | null;
  billingRecordId: string | undefined;
  role: UserRole;
}) {
  if (!billingRecord) {
    return (
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
        No billing record found for this encounter.
      </div>
    );
  }

  const canAccessBilling = role === "admin" || role === "billing";

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Billing Record</h2>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${claimStatusStyles[billingRecord.claim_status]}`}
          >
            {billingRecord.claim_status}
          </span>
        </div>

        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-slate-500">Total Charges</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">
              ${billingRecord.total_charges.toFixed(2)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Expected Reimbursement</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">
              ${billingRecord.expected_reimbursement.toFixed(2)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Patient Responsibility</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">
              ${billingRecord.patient_responsibility.toFixed(2)}
            </dd>
          </div>
          {billingRecord.payer && (
            <div>
              <dt className="text-xs font-medium text-slate-500">Payer</dt>
              <dd className="mt-1 text-sm text-slate-900">{billingRecord.payer}</dd>
            </div>
          )}
        </dl>

        {canAccessBilling && billingRecordId && (
          <div className="mt-4">
            <a
              href={`/billing/${billingRecordId}`}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Edit billing record →
            </a>
          </div>
        )}
      </div>

      {billingRecord.line_items.length > 0 && (
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">CPT Line Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-medium text-slate-500">
                  <th className="pb-2 pr-4">CPT Code</th>
                  <th className="pb-2 pr-4">Description</th>
                  <th className="pb-2 pr-4 text-right">Qty</th>
                  <th className="pb-2 pr-4 text-right">Unit Price</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {billingRecord.line_items.map((item, index) => (
                  <tr key={index} className="py-2">
                    <td className="py-2 pr-4 font-mono text-xs">{item.cpt_code ?? "—"}</td>
                    <td className="py-2 pr-4 text-slate-700">{item.description}</td>
                    <td className="py-2 pr-4 text-right">{item.quantity}</td>
                    <td className="py-2 pr-4 text-right">${item.unit_price.toFixed(2)}</td>
                    <td className="py-2 text-right font-medium">${item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
