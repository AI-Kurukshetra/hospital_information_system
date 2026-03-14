import Link from "next/link";
import {
  BedDouble,
  ClipboardList,
  LayoutDashboard,
  Receipt,
  Settings,
  Users,
} from "lucide-react";
import { canAccessBilling, isAdmin } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

interface SidebarProps {
  currentPath: string;
  orgName: string;
  role: UserRole;
}

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "physician", "nurse", "billing", "receptionist"] as UserRole[],
  },
  {
    href: "/patients",
    label: "Patients",
    icon: Users,
    roles: ["admin", "physician", "nurse", "receptionist"] as UserRole[],
  },
  {
    href: "/beds",
    label: "Bed Management",
    icon: BedDouble,
    roles: ["admin", "physician", "nurse", "receptionist"] as UserRole[],
  },
  {
    href: "/orders",
    label: "Orders",
    icon: ClipboardList,
    roles: ["admin", "physician", "nurse"] as UserRole[],
  },
  {
    href: "/billing",
    label: "Billing",
    icon: Receipt,
    roles: ["admin", "billing"] as UserRole[],
  },
  {
    href: "/admin",
    label: "Admin",
    icon: Settings,
    roles: ["admin"] as UserRole[],
  },
];

export function Sidebar({ currentPath, orgName, role }: SidebarProps) {
  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="flex h-full w-full max-w-72 flex-col border-r border-slate-200/80 bg-[linear-gradient(180deg,#0f172a_0%,#12233f_48%,#0f172a_100%)] text-slate-100">
      <div className="border-b border-white/10 px-6 py-6">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100 shadow-[0_12px_40px_-20px_rgba(34,211,238,0.85)]">
            <span className="font-serif text-2xl font-semibold">H</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">
              Critical Access HIS
            </p>
            <h1 className="text-base font-semibold text-white">{orgName}</h1>
          </div>
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Active role
          </p>
          <p className="mt-2 text-sm font-medium capitalize text-white">
            {role}
          </p>
          <div className="mt-3 flex gap-2 text-[11px] text-slate-300">
            <span
              className={cn(
                "rounded-full px-2 py-1",
                canAccessBilling(role)
                  ? "bg-emerald-400/15 text-emerald-200"
                  : "bg-slate-200/10",
              )}
            >
              Billing {canAccessBilling(role) ? "Enabled" : "Hidden"}
            </span>
            <span
              className={cn(
                "rounded-full px-2 py-1",
                isAdmin(role)
                  ? "bg-cyan-400/15 text-cyan-200"
                  : "bg-slate-200/10",
              )}
            >
              {isAdmin(role) ? "Admin" : "Scoped"}
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4 pb-4">
        {visibleItems.map((item) => {
          const isActive =
            currentPath === item.href || currentPath.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                isActive
                  ? "bg-white text-slate-950 shadow-lg shadow-slate-950/20"
                  : "text-slate-300 hover:bg-white/10 hover:text-white",
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
