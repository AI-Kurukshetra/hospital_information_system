import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { loginAction } from "./actions";
import { LoginSubmitButton } from "./login-submit-button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const parsedError =
    error === "missing_credentials"
      ? "Email and password are required."
      : error
        ? decodeURIComponent(error)
        : null;

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#ecf5ff_0%,#f8fafc_48%,#e2ecff_100%)] px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl overflow-hidden rounded-[2.25rem] border border-white/70 bg-white/70 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.5)] backdrop-blur xl:grid-cols-[1.05fr_0.95fr]">
        <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,#38bdf8_0%,transparent_32%),linear-gradient(160deg,#0f172a_0%,#11284d_45%,#0f172a_100%)] px-8 py-10 text-white sm:px-12 sm:py-14">
          <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.08)_0%,transparent_35%,rgba(34,211,238,0.08)_100%)]" />
          <div className="relative flex h-full flex-col justify-between gap-12">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs uppercase tracking-[0.24em] text-cyan-100">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-white/12 font-serif text-base">
                  H
                </span>
                Healthland Centriq
              </div>
              <div className="mt-12 max-w-xl">
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/75">
                  Hospital Information System
                </p>
                <h1 className="mt-4 text-5xl font-semibold leading-[1.05] text-white">
                  Modern clinical operations for critical access hospitals.
                </h1>
                <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
                  Real-time beds, role-aware workflows, and a clean path from registration through discharge for rural care teams.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {[
                "Real-time bed management",
                "AI-ready clinical workflows",
                "Cloud-native, built for rural hospitals",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-4 text-sm text-slate-200"
                >
                  <CheckCircle2 className="h-5 w-5 text-cyan-300" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center bg-white px-6 py-10 sm:px-12">
          <div className="mx-auto w-full max-w-md">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Secure sign-in
            </p>
            <h2 className="mt-3 text-4xl font-semibold text-slate-950">
              Welcome back
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Sign in to your hospital system and continue the patient journey.
            </p>

            <form action={loginAction} className="mt-10 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="admin@demo.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Demo1234!"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
              </div>

              {parsedError ? (
                <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {parsedError}
                </p>
              ) : null}

              <LoginSubmitButton />
            </form>

            <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Demo credentials
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                admin@demo.com / Demo1234!
              </p>
            </div>

            <p className="mt-6 text-sm text-slate-500">
              Need an account for local testing?{" "}
              <Link
                href="/signup"
                className="font-semibold text-sky-700 transition hover:text-sky-800"
              >
                Create one here
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
