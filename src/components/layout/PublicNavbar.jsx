"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { PublicRegistrationModal, RegistrationSuccessModal } from "@/features/participants";

export function PublicNavbar() {
  const { settings } = useSystemSettings();
  const [logoError, setLogoError] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registeredData, setRegisteredData] = useState(null);

  const logoSrc = !logoError && settings?.logoUrl ? settings.logoUrl : null;
  const siteTitle = settings?.siteTitle || "PEDAGO ACADEMY";

  return (
    <header className="sticky top-0 z-50 bg-[#1A284A] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3.5 group shrink-0">
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

        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
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

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsRegisterOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-105"
          >
            <UserPlus className="w-4 h-4" />
            <span>নিবন্ধন করুন (Register)</span>
          </button>
        </div>
      </div>

      {/* Quick Navbar Registration Modals */}
      <PublicRegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegistered={(data) => setRegisteredData(data)}
      />

      <RegistrationSuccessModal
        isOpen={Boolean(registeredData)}
        onClose={() => setRegisteredData(null)}
        data={registeredData}
      />
    </header>
  );
}
