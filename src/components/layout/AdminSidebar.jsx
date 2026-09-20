"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Trophy,
  Users,
  Award,
  Image as ImageIcon,
  ShieldCheck,
  Settings,
  Sparkles,
} from "lucide-react";
import { useCurrentAdmin } from "@/features/admin/auth/useCurrentAdmin";
import { useSystemSettings } from "@/hooks/useSystemSettings";

export function AdminSidebar() {
  const pathname = usePathname();
  const { isSuperAdmin } = useCurrentAdmin();
  const { settings } = useSystemSettings();
  const [logoError, setLogoError] = useState(false);

  const logoSrc = !logoError && settings?.logoUrl ? settings.logoUrl : null;
  const siteTitle = settings?.siteTitle || "PEDAGO";
  const brandName = siteTitle.split(" ")[0] || "PEDAGO";

  const baseNavItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Competitions", href: "/admin/competitions", icon: Trophy },
    { label: "Participants", href: "/admin/participants", icon: Users },
    { label: "Certificate Templates", href: "/admin/certificate-templates", icon: Award },
    { label: "Poster Templates", href: "/admin/poster-templates", icon: ImageIcon },
  ];

  const adminItem = { label: "Admins", href: "/admin/admins", icon: ShieldCheck, superOnly: true };
  const settingsItem = { label: "Settings", href: "/admin/settings", icon: Settings };

  // Only include 'Admins' if current admin is super_admin
  const navItems = [
    ...baseNavItems,
    ...(isSuperAdmin ? [adminItem] : []),
    settingsItem,
  ];

  return (
    <aside className="w-64 bg-[#1A284A] text-white flex flex-col min-h-screen shrink-0 border-r border-white/5 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-white/10 flex items-center justify-between">
        <Link href="/admin/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-white p-1 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform overflow-hidden shrink-0">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={brandName}
                className="w-full h-full object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <Sparkles className="w-4 h-4 text-[#29479B]" />
            )}
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white block leading-none">
              {brandName}
            </span>
            <span className="text-[11px] font-semibold text-[#F59E0B] tracking-wider uppercase">
              Admin Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white/40">
          Management
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 ${
                isActive
                  ? "bg-[#29479B] text-white shadow-xs font-semibold"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#F59E0B]" : "text-white/60"}`} />
              <span className="truncate">{item.label}</span>
              {item.superOnly && (
                <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold uppercase">
                  Super
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Branding */}
      <div className="p-4 border-t border-white/10 text-xs text-white/40 text-center flex items-center justify-between px-5">
        <span>Pedago Academy</span>
        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/60">v1.0</span>
      </div>
    </aside>
  );
}
