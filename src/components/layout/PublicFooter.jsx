"use client";

import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="bg-[#1A284A] text-white/80 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg">Pedago Academy</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Official digital certificate generation, validation, and poster distribution platform for national competitions.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-[#F59E0B] transition-colors">Home</Link></li>
              <li><Link href="/competitions" className="hover:text-[#F59E0B] transition-colors">Competitions</Link></li>
              <li><Link href="/certificates" className="hover:text-[#F59E0B] transition-colors">Certificates</Link></li>
              <li><Link href="/posters" className="hover:text-[#F59E0B] transition-colors">Posters</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Verification</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/certificates" className="hover:text-[#F59E0B] transition-colors">Verify Certificate</Link></li>
              <li><Link href="/contact" className="hover:text-[#F59E0B] transition-colors">Support & Help</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <p className="text-sm text-white/70">Pedago Academy Headquarters</p>
            <p className="text-sm text-white/70 mt-1">Email: info@pedagoacademy.com</p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-xs text-white/50">
          © {new Date().getFullYear()} Pedago Academy. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
