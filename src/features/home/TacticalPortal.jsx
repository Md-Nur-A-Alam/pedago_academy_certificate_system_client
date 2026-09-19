"use client";

import Link from "next/link";

export function TacticalPortal() {
  return (
    <section className="py-16 bg-[#F4F7FC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-[#1A284A]">Quick Access Portals</h2>
          <p className="text-gray-600 mt-2">Select your service below to verify, download, or validate</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-[#29479B]/10 rounded-xl flex items-center justify-center text-[#29479B] font-bold text-xl mb-6">
                📜
              </div>
              <h3 className="text-xl font-bold text-[#1A284A] mb-3">Certificate Download</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Enter your unique reference ID to search and download your official winner or participant certificate.
              </p>
            </div>
            <Link
              href="/certificates"
              className="inline-flex items-center text-sm font-bold text-[#29479B] hover:text-[#1A284A] transition-colors"
            >
              Search Certificates &rarr;
            </Link>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-[#F59E0B]/10 rounded-xl flex items-center justify-center text-[#F59E0B] font-bold text-xl mb-6">
                🎨
              </div>
              <h3 className="text-xl font-bold text-[#1A284A] mb-3">Customized Posters</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Generate personalized social media posters with your picture and achievement details.
              </p>
            </div>
            <Link
              href="/posters"
              className="inline-flex items-center text-sm font-bold text-[#29479B] hover:text-[#1A284A] transition-colors"
            >
              Generate Posters &rarr;
            </Link>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-[#F0442E]/10 rounded-xl flex items-center justify-center text-[#F0442E] font-bold text-xl mb-6">
                🏆
              </div>
              <h3 className="text-xl font-bold text-[#1A284A] mb-3">Competitions</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Explore ongoing and past national competitions hosted by Pedago Academy.
              </p>
            </div>
            <Link
              href="/competitions"
              className="inline-flex items-center text-sm font-bold text-[#29479B] hover:text-[#1A284A] transition-colors"
            >
              View Competitions &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
