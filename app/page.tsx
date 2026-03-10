import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "./_LogoutButton";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware already handles the redirect, but this is a safety net for
  // cases where the middleware may not run (e.g. direct Server Component fetch).
  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-lg rounded-2xl bg-white p-10 shadow-lg">
        <div className="mb-8 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Authenticated
          </span>
          <LogoutButton />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Welcome,{" "}
          <span className="text-indigo-600">{user.email}</span>
        </h1>
        <p className="mt-3 text-gray-500">
          You&apos;re successfully signed in. This is your protected home page.
        </p>

        <div className="mt-8 rounded-xl border border-gray-100 bg-gray-50 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Session info
          </p>
          <dl className="mt-3 space-y-2 text-sm text-gray-700">
            <div className="flex justify-between gap-4">
              <dt className="font-medium text-gray-500">User ID</dt>
              <dd className="truncate font-mono text-xs text-gray-700">
                {user.id}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-medium text-gray-500">Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-medium text-gray-500">Last sign in</dt>
              <dd>
                {user.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleString()
                  : "—"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </main>
  );
}
