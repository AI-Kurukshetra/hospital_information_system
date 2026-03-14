"use client";

import Link from "next/link";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { statusClassName } from "@/components/patients/patient-card";
import type { Patient } from "@/types";

const columnHelper = createColumnHelper<Patient>();

export function PatientList({
  patients,
  page,
  pageSize,
}: {
  patients: Patient[];
  page: number;
  pageSize: number;
}) {
  const columns = [
    columnHelper.accessor("mrn", {
      header: "MRN",
      cell: (info) => (
        <span className="font-mono text-xs text-slate-600">{info.getValue()}</span>
      ),
    }),
    columnHelper.display({
      id: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-slate-950">
            {row.original.first_name} {row.original.last_name}
          </p>
          <p className="text-xs text-slate-500">{row.original.phone ?? "No phone"}</p>
        </div>
      ),
    }),
    columnHelper.accessor("date_of_birth", {
      header: "DOB",
      cell: (info) =>
        info.getValue()
          ? format(new Date(info.getValue() as string), "MMM d, yyyy")
          : "Not entered",
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => (
        <span className={statusClassName(info.getValue())}>{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("insurance_payer", {
      header: "Insurance",
      cell: (info) => info.getValue() ?? "Not entered",
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/patients/${row.original.id}`}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            View Profile
          </Link>
          {row.original.status === "admitted" ? (
            <Link
              href={`/patients/${row.original.id}/chart`}
              className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white transition hover:bg-slate-800"
            >
              View Chart
            </Link>
          ) : (
            <Link
              href={`/beds?patient=${row.original.id}`}
              className="rounded-full bg-sky-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-sky-700"
            >
              Admit
            </Link>
          )}
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: patients,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div>
          <p className="text-sm font-semibold text-slate-950">Patient Directory</p>
          <p className="text-xs text-slate-500">
            Page {page} · {patients.length} record(s) shown · {pageSize} per page
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-6 py-4 font-medium">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-200">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 align-top text-slate-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-sm text-slate-500"
                >
                  No patients found for the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
