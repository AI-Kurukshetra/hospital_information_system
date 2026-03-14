import { headers } from "next/headers";
import { Sidebar } from "@/components/layout/sidebar";
import { UserMenu } from "@/components/layout/user-menu";
import { requireSession } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [{ profile }, requestHeaders] = await Promise.all([
    requireSession(),
    headers(),
  ]);
  const currentPath = requestHeaders.get("x-current-path") ?? "/dashboard";

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eef4ff_0%,#f8fbff_38%,#eef2f7_100%)] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:px-6">
        <div className="hidden xl:block">
          <Sidebar
            currentPath={currentPath}
            orgName="Healthland Centriq"
            role={profile.role}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white/80 px-6 py-5 shadow-sm backdrop-blur lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Healthland Centriq
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                Critical access operations workspace
              </p>
            </div>
            <div className="w-full max-w-sm">
              <UserMenu
                fullName={profile.full_name}
                role={profile.role}
                email={profile.email}
              />
            </div>
          </header>

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
