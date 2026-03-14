"use client";

import { useState } from "react";
import { ChartHeader } from "@/components/chart/chart-header";
import { DiagnosesSection } from "@/components/chart/diagnoses-section";
import { EncounterSummary } from "@/components/chart/encounter-summary";
import { NotesSection } from "@/components/chart/notes-section";
import { OrdersSection } from "@/components/chart/orders-section";
import { VitalsSection } from "@/components/chart/vitals-section";
import type { ChartNote, ChartOrder, PatientChartData } from "@/lib/clinical";
import type { Diagnosis, Order, UserRole, Vitals } from "@/types";

const tabs = ["overview", "vitals", "orders", "notes"] as const;
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
    </div>
  );
}
