import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ModulePlaceholderProps {
  title: string;
  summary: string;
  bullets: string[];
  cta?: {
    href: string;
    label: string;
  };
}

export function ModulePlaceholder({
  title,
  summary,
  bullets,
  cta,
}: ModulePlaceholderProps) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Sprint module
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">{title}</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">{summary}</p>
      </div>
      <div className="mt-8 grid gap-3 md:grid-cols-2">
        {bullets.map((bullet) => (
          <div
            key={bullet}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700"
          >
            {bullet}
          </div>
        ))}
      </div>
      {cta ? (
        <Link
          href={cta.href}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {cta.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </section>
  );
}
