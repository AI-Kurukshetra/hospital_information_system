import Link from "next/link";
import { ShieldX } from "lucide-react";

interface AccessDeniedProps {
  title?: string;
  description?: string;
}

export function AccessDenied({
  title = "Access denied",
  description = "Your role does not have permission to open this module.",
}: AccessDeniedProps) {
  return (
    <div className="rounded-[2rem] border border-rose-200 bg-white p-8 shadow-sm">
      <div className="flex max-w-lg flex-col gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <ShieldX className="h-7 w-7" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex w-fit rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Return to dashboard
        </Link>
      </div>
    </div>
  );
}
