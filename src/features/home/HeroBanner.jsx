"use client";

import Link from "next/link";
import { useSystemSettings } from "@/hooks/useSystemSettings";

export function HeroBanner() {
  const { settings } = useSystemSettings();
  const heroBgUrl = settings?.heroBgUrl || "/HeroBG.jpg";

  return (
    <section
      className="relative text-white py-24 px-4 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat overflow-hidden transition-all duration-500"
      style={{ backgroundImage: `url(${heroBgUrl})` }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-[#1A284A]/80 backdrop-blur-xs" />

      <div className="relative max-w-5xl mx-auto text-center space-y-6 z-10">
        <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-wider bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 uppercase shadow-xs">
          Official Verification Portal
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight drop-shadow-md">
          Verify & Download Your <span className="text-[#F59E0B]">{settings?.siteTitle || "Pedago Academy"}</span> Certificates
        </h1>
        <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto font-light leading-relaxed">
          Access high-resolution official competition certificates and customized posters securely. Search by your unique reference code.
        </p>
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/certificates"
            className="px-6 py-3.5 rounded-xl font-bold bg-[#F0442E] hover:bg-[#F0442E]/90 text-white shadow-lg hover:shadow-xl transition-all"
          >
            Download Certificate
          </Link>
          <Link
            href="/competitions"
            className="px-6 py-3.5 rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all backdrop-blur-xs"
          >
            Explore Competitions
          </Link>
        </div>
      </div>
    </section>
  );
}
