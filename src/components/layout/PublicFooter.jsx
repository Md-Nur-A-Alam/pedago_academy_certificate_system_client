"use client";

import { useState } from "react";
import Link from "next/link";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { Mail, Phone, MapPin } from "lucide-react";

export function PublicFooter() {
  const { settings } = useSystemSettings();
  const [logoError, setLogoError] = useState(false);

  const logoSrc = !logoError && settings?.logoUrl ? settings.logoUrl : null;
  const siteTitle = settings?.siteTitle || "Pedago Academy";
  const contactEmail = settings?.contactEmail || "info@pedagoacademy.com";
  const contactPhone = settings?.contactPhone || "+880 1700-000000";
  const footerText = settings?.footerText || `© ${new Date().getFullYear()} ${siteTitle}. All rights reserved.`;

  return (
    <footer className="bg-[#1A284A] text-white/80 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-xs overflow-hidden shrink-0">
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
              <div>
                <h3 className="text-white font-bold text-lg leading-tight">{siteTitle}</h3>
                <span className="text-[11px] text-[#F59E0B] font-semibold tracking-wider uppercase block">
                  Verification Portal
                </span>
              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              Official digital certificate generation, validation, and poster distribution platform for national competitions.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-[#F59E0B] transition-colors">Home</Link></li>
              <li><Link href="/competitions" className="hover:text-[#F59E0B] transition-colors">Competitions</Link></li>
              <li><Link href="/certificates" className="hover:text-[#F59E0B] transition-colors">Certificates & Validation</Link></li>
              <li><Link href="/posters" className="hover:text-[#F59E0B] transition-colors">Milestone Posters</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Verification</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/certificates" className="hover:text-[#F59E0B] transition-colors">Verify Certificate</Link></li>
              <li><Link href="/contact" className="hover:text-[#F59E0B] transition-colors">Support & Help</Link></li>
              <li><Link href="/admin/login" className="hover:text-[#F59E0B] transition-colors">Administrator Access</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <div className="space-y-2 text-sm text-white/70">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#F59E0B] shrink-0" />
                <span>Pedago Academy Headquarters</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#F59E0B] shrink-0" />
                <a href={`mailto:${contactEmail}`} className="hover:underline hover:text-white truncate">
                  {contactEmail}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#F59E0B] shrink-0" />
                <a href={`tel:${contactPhone}`} className="hover:underline hover:text-white">
                  {contactPhone}
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-xs text-white/50">
          {footerText}
        </div>
      </div>
    </footer>
  );
}
