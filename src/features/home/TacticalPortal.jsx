"use client";

import Link from "next/link";
import { Award, FileText, Image as ImageIcon, ArrowRight, ArrowDown, Trophy, UserPlus, Sparkles } from "lucide-react";
import { useHomepageSettings } from "@/hooks/useHomepageSettings";

export function TacticalPortal() {
  const { settings } = useHomepageSettings();
  const quickPortals = settings?.quickPortals || {};

  if (quickPortals.showSection === false) {
    return null;
  }

  const title = quickPortals.title || "Quick Access Portals";
  const subtitle =
    quickPortals.subtitle ||
    "খুব সহজেই অংশগ্রহণকারী হিসেবে নিবন্ধন করুন, সার্টিফিকেট ডাউনলোড করুন অথবা সোশ্যাল মিডিয়ায় শেয়ারের জন্য পোস্টার তৈরি করুন";

  return (
    <section className="py-16 bg-[#F4F7FC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-3xl font-extrabold text-[#1A284A] tracking-tight">
            {title}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Portal Card 1: Participant Self-Registration */}
          <div className="bg-white p-7 rounded-2xl shadow-xs border-2 border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-bl-xl tracking-wider uppercase">
              Free Entry
            </div>
            <div>
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-bold text-xl mb-5 group-hover:scale-110 transition-transform border border-emerald-100">
                <UserPlus className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-[#1A284A] mb-2">
                অংশগ্রহণকারী নিবন্ধন <span className="text-xs font-semibold text-emerald-600 block mt-0.5">(Self Registration)</span>
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-6">
                প্রতিযোগিতায় অংশগ্রহণ করেছেন? কোনো লগইন ছাড়াই আপনার সাবমিশন ডেটা যুক্ত করুন এবং সাথে সাথে অনন্য রেফারেন্স কোড পান।
              </p>
            </div>
            <a
              href="#participant-registration"
              className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <span>নিবন্ধন ফর্মে যান (Register)</span>
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
            </a>
          </div>

          {/* Portal Card 2: Certificate Download */}
          <div className="bg-white p-7 rounded-2xl shadow-xs border border-gray-100 hover:shadow-md transition-all flex flex-col justify-between group hover:-translate-y-1">
            <div>
              <div className="w-12 h-12 bg-[#29479B]/10 rounded-xl flex items-center justify-center text-[#29479B] font-bold text-xl mb-5 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-[#29479B]" />
              </div>
              <h3 className="text-lg font-bold text-[#1A284A] mb-2">
                সার্টিফিকেট ডাউনলোড ও যাচাই <span className="text-xs font-semibold text-[#29479B] block mt-0.5">(Download Certificate)</span>
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-6">
                রেফারেন্স কোড বা ফোন নম্বর দিয়ে সহজে সার্টিফিকেট খুঁজুন এবং হাই-রেজোলিউশন অফিশিয়াল PNG ফাইল ডাউনলোড করুন।
              </p>
            </div>
            <Link
              href="/certificates"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#29479B] hover:text-[#1A284A] transition-colors"
            >
              <span>সার্টিফিকেট সংগ্রহ করুন</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Portal Card 3: Milestone Posters */}
          <div className="bg-white p-7 rounded-2xl shadow-xs border border-gray-100 hover:shadow-md transition-all flex flex-col justify-between group hover:-translate-y-1">
            <div>
              <div className="w-12 h-12 bg-[#F59E0B]/15 rounded-xl flex items-center justify-center text-[#F59E0B] font-bold text-xl mb-5 group-hover:scale-110 transition-transform">
                <ImageIcon className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <h3 className="text-lg font-bold text-[#1A284A] mb-2">
                অ্যাচিভমেন্ট সোশ্যাল পোস্টার <span className="text-xs font-semibold text-[#F59E0B] block mt-0.5">(Customized Posters)</span>
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-6">
                আপনার পছন্দের ছবি ও নাম যুক্ত করে সোশ্যাল মিডিয়ায় শেয়ার করার উপযোগী আকর্ষণীয় অফিশিয়াল পোস্টার তৈরি করুন।
              </p>
            </div>
            <Link
              href="/posters"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#29479B] hover:text-[#1A284A] transition-colors"
            >
              <span>পোস্টার তৈরি করুন</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Portal Card 4: Competitions */}
          <div className="bg-white p-7 rounded-2xl shadow-xs border border-gray-100 hover:shadow-md transition-all flex flex-col justify-between group hover:-translate-y-1">
            <div>
              <div className="w-12 h-12 bg-[#F0442E]/10 rounded-xl flex items-center justify-center text-[#F0442E] font-bold text-xl mb-5 group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6 text-[#F0442E]" />
              </div>
              <h3 className="text-lg font-bold text-[#1A284A] mb-2">
                সকল প্রতিযোগিতা ও ইভেন্ট <span className="text-xs font-semibold text-[#F0442E] block mt-0.5">(Competitions)</span>
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-6">
                পেডাগো একাডেমির চলমান ও বিগত সকল জাতীয় প্রতিযোগিতা এক্সপ্লোর করুন, নিয়মাবলী ও বিস্তারিত জানুন।
              </p>
            </div>
            <Link
              href="/competitions"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#29479B] hover:text-[#1A284A] transition-colors"
            >
              <span>প্রতিযোগিতা দেখুন</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

