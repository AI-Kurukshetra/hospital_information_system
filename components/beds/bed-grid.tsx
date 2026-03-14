"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { BedCard } from "@/components/beds/bed-card";
import { AdmitPatientDialog } from "@/components/beds/admit-patient-dialog";
import { DischargeDialog } from "@/components/beds/discharge-dialog";
import type { BedBoardItem, PatientLookup, PhysicianLookup } from "@/types";

interface DepartmentTab {
  id: string;
  name: string;
  code: string;
}

export function BedGrid({
  initialBeds,
  departments,
  patients,
  physicians,
  prefillPatientId,
  initialAdmitBedId,
  initialDischargeBedId,
}: {
  initialBeds: BedBoardItem[];
  departments: DepartmentTab[];
  patients: PatientLookup[];
  physicians: PhysicianLookup[];
  prefillPatientId?: string | null;
  initialAdmitBedId?: string | null;
  initialDischargeBedId?: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [beds, setBeds] = useState(initialBeds);
  const [availablePatients, setAvailablePatients] = useState(patients);
  const [activeDepartment, setActiveDepartment] = useState("all");
  const [admitBed, setAdmitBed] = useState<BedBoardItem | null>(
    initialAdmitBedId
      ? initialBeds.find((bed) => bed.id === initialAdmitBedId) ?? null
      : null,
  );
  const [dischargeBed, setDischargeBed] = useState<BedBoardItem | null>(
    initialDischargeBedId
      ? initialBeds.find((bed) => bed.id === initialDischargeBedId) ?? null
      : null,
  );

  async function reloadBeds() {
    const response = await fetch("/api/beds", {
      cache: "no-store",
    });

    if (!response.ok) {
      toast.error("Unable to refresh bed board.");
      return;
    }

    const payload = (await response.json()) as { beds: BedBoardItem[] };
    setBeds(payload.beds);
  }

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("beds-live-board")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "beds" },
        () => {
          void reloadBeds();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const filteredBeds = useMemo(() => {
    if (activeDepartment === "all") {
      return beds;
    }

    return beds.filter((bed) => bed.dept_id === activeDepartment);
  }, [activeDepartment, beds]);

  const stats = useMemo(() => {
    const total = beds.length;
    const available = beds.filter((bed) => bed.status === "available").length;
    const occupied = beds.filter((bed) => bed.status === "occupied").length;
    const housekeeping = beds.filter(
      (bed) => bed.status === "housekeeping",
    ).length;
    const maintenance = beds.filter((bed) => bed.status === "maintenance").length;

    return {
      total,
      available,
      occupied,
      housekeeping,
      maintenance,
      occupancyPct: total ? Math.round((occupied / total) * 100) : 0,
    };
  }, [beds]);

  function closeDialog() {
    setAdmitBed(null);
    setDischargeBed(null);
    const nextSearch = prefillPatientId ? `?patient=${prefillPatientId}` : "";
    router.replace(`${pathname}${nextSearch}`, { scroll: false });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Bed Management
              </p>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Live
              </span>
            </div>
            <h1 className="mt-3 text-4xl font-semibold text-slate-950">
              Bed Management Dashboard
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              View department capacity, admit registered patients into available
              beds, and discharge active encounters back to housekeeping.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <StatCard label="Total Beds" value={stats.total} tone="text-slate-950" />
          <StatCard label="Available" value={stats.available} tone="text-emerald-700" />
          <StatCard label="Occupied" value={stats.occupied} tone="text-rose-700" />
          <StatCard
            label="Housekeeping"
            value={stats.housekeeping}
            tone="text-amber-700"
          />
          <StatCard
            label="Maintenance"
            value={stats.maintenance}
            tone="text-slate-600"
          />
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Occupancy</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">
              {stats.occupancyPct}%
            </p>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-sky-600 transition-[width]"
                style={{ width: `${stats.occupancyPct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <DepartmentButton
            label="All"
            active={activeDepartment === "all"}
            onClick={() => setActiveDepartment("all")}
          />
          {departments.map((department) => (
            <DepartmentButton
              key={department.id}
              label={department.name}
              active={activeDepartment === department.id}
              onClick={() => setActiveDepartment(department.id)}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredBeds.map((bed) => (
          <BedCard
            key={bed.id}
            bed={bed}
            patientQueryId={prefillPatientId}
          />
        ))}
      </section>

      <AdmitPatientDialog
        bed={admitBed}
        patients={availablePatients}
        physicians={physicians}
        prefillPatientId={prefillPatientId}
        onClose={closeDialog}
        onAdmitted={async ({ patientId }) => {
          setAvailablePatients((current) =>
            current.filter((patient) => patient.id !== patientId),
          );
          await reloadBeds();
        }}
      />

      <DischargeDialog
        bed={dischargeBed}
        onClose={closeDialog}
        onDischarged={reloadBeds}
      />
    </div>
  );
}

function DepartmentButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-slate-950 text-white"
          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-3 text-3xl font-semibold ${tone}`}>{value}</p>
    </div>
  );
}
