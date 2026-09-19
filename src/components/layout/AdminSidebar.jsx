"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Competitions", href: "/admin/competitions" },
    { label: "Participants", href: "/admin/participants" },
    { label: "Certificate Templates", href: "/admin/certificate-templates" },
    { label: "Poster Templates", href: "/admin/poster-templates" },
    { label: "Admins", href: "/admin/admins" },
    { label: "Settings", href: "/admin/settings" },
  ];

  return (
    <aside className="w-64 bg-[#1A284A] text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-white/10">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <span className="font-extrabold text-xl text-[#F59E0B]">Pedago Admin</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? "bg-[#29479B] text-white font-semibold"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 text-xs text-white/50 text-center">
        v1.0.0 Admin Portal
      </div>
    </aside>
  );
}
