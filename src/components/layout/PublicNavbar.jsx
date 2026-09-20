"use client";

import { useState } from "react";
import Link from "next/link";
import { useSystemSettings } from "@/hooks/useSystemSettings";

export function PublicNavbar() {
  const { settings } = useSystemSettings();
  const [logoError, setLogoError] = useState(false);

  const logoSrc = !logoError && settings?.logoUrl ? settings.logoUrl : null;
  const siteTitle = settings?.siteTitle || "PEDAGO ACADEMY";

  return (
    <header className="sticky top-0 z-50 bg-[#1A284A] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="relative w-12 h-12 bg-white rounded-xl p-1 flex items-center justify-center shadow-xs overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={siteTitle}
                className="w-full h-full object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-[#29479B] font-extrabold text-xl">PA</span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight text-white tracking-wide uppercase">
              {siteTitle}
            </span>
            <span className="text-xs text-[#F59E0B] font-semibold tracking-wider">
              CERTIFICATE VERIFICATION PORTAL
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="text-white hover:text-[#F59E0B] transition-colors">
            Home
          </Link>
          <Link href="/competitions" className="text-white/90 hover:text-[#F59E0B] transition-colors">
            Competitions
          </Link>
          <Link href="/certificates" className="text-white/90 hover:text-[#F59E0B] transition-colors">
            Certificates & Validation
          </Link>
          <Link href="/posters" className="text-white/90 hover:text-[#F59E0B] transition-colors">
            Posters
          </Link>
          <Link href="/contact" className="text-white/90 hover:text-[#F59E0B] transition-colors">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/admin/login"
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#29479B] hover:bg-[#1A284A] text-white border border-white/20 transition-all shadow-sm"
          >
            Admin Portal
          </Link>
        </div>
      </div>
    </header>
  );
}
