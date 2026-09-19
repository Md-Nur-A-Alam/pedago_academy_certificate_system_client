"use client";

import Link from "next/link";

export function ViewCompetitions() {
  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-[#1A284A]">Featured Competitions</h2>
            <p className="text-gray-600 mt-2">Active and recently completed events</p>
          </div>
          <Link
            href="/competitions"
            className="mt-4 md:mt-0 text-sm font-bold text-[#29479B] hover:text-[#1A284A] transition-colors"
          >
            View All Competitions &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-4">
              Active
            </div>
            <h3 className="text-lg font-bold text-[#1A284A] mb-2">National Math Olympiad 2026</h3>
            <p className="text-gray-600 text-sm mb-4">Certificates and winner posters available for download.</p>
            <Link
              href="/certificates"
              className="inline-block px-4 py-2 text-xs font-bold rounded-lg bg-[#29479B] text-white hover:bg-[#1A284A] transition-colors"
            >
              Get Certificate
            </Link>
          </div>

          <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-4">
              Active
            </div>
            <h3 className="text-lg font-bold text-[#1A284A] mb-2">Science & Innovation Contest</h3>
            <p className="text-gray-600 text-sm mb-4">Certificates and winner posters available for download.</p>
            <Link
              href="/certificates"
              className="inline-block px-4 py-2 text-xs font-bold rounded-lg bg-[#29479B] text-white hover:bg-[#1A284A] transition-colors"
            >
              Get Certificate
            </Link>
          </div>

          <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 mb-4">
              Archived
            </div>
            <h3 className="text-lg font-bold text-[#1A284A] mb-2">ICT Excellence Award 2025</h3>
            <p className="text-gray-600 text-sm mb-4">Historical record verification and certificate download.</p>
            <Link
              href="/certificates"
              className="inline-block px-4 py-2 text-xs font-bold rounded-lg bg-[#29479B] text-white hover:bg-[#1A284A] transition-colors"
            >
              Get Certificate
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
