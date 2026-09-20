"use client";

import Link from "next/link";
import { Award, FileText, Image as ImageIcon, ArrowRight, Trophy } from "lucide-react";
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
    "খুব সহজেই আপনার সার্টিফিকেট যাচাই করুন, ডাউনলোড করুন অথবা সোশ্যাল মিডিয়ায় শেয়ারের জন্য পোস্টার তৈরি করুন";

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Portal Card 1: Certificate Download */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col justify-between group hover:-translate-y-1">
            <div>
              <div className="w-12 h-12 bg-[#29479B]/10 rounded-xl flex items-center justify-center text-[#29479B] font-bold text-xl mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-[#29479B]" />
              </div>
              <h3 className="text-xl font-bold text-[#1A284A] mb-3">
                সার্টিফিকেট ডাউনলোড ও যাচাই <span className="text-xs font-semibold text-[#29479B] block mt-0.5">(Certificate Download)</span>
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                আপনার রেফারেন্স কোড বা ফোন নম্বর দিয়ে সহজেই অফিশিয়াল সার্টিফিকেট খুঁজুন এবং হাই-রেজোলিউশন PNG ফাইল ডাউনলোড করুন।
              </p>
            </div>
            <Link
              href="/certificates"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#29479B] hover:text-[#1A284A] transition-colors"
            >
              <span>সার্টিফিকেট ডাউনলোড করুন</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Portal Card 2: Milestone Posters */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col justify-between group hover:-translate-y-1">
            <div>
              <div className="w-12 h-12 bg-[#F59E0B]/15 rounded-xl flex items-center justify-center text-[#F59E0B] font-bold text-xl mb-6 group-hover:scale-110 transition-transform">
                <ImageIcon className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <h3 className="text-xl font-bold text-[#1A284A] mb-3">
                অ্যাচিভমেন্ট সোশ্যাল পোস্টার <span className="text-xs font-semibold text-[#F59E0B] block mt-0.5">(Customized Posters)</span>
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                আপনার পছন্দের ছবি আপলোড করে ফেসবুক ও সোশ্যাল মিডিয়ায় শেয়ার করার উপযোগী দৃষ্টিনন্দন অফিসিয়াল পোস্টার তৈরি করুন।
              </p>
            </div>
            <Link
              href="/posters"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#29479B] hover:text-[#1A284A] transition-colors"
            >
              <span>পোস্টার তৈরি করুন</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Portal Card 3: Competitions */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col justify-between group hover:-translate-y-1">
            <div>
              <div className="w-12 h-12 bg-[#F0442E]/10 rounded-xl flex items-center justify-center text-[#F0442E] font-bold text-xl mb-6 group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6 text-[#F0442E]" />
              </div>
              <h3 className="text-xl font-bold text-[#1A284A] mb-3">
                সকল প্রতিযোগিতা ও ইভেন্ট <span className="text-xs font-semibold text-[#F0442E] block mt-0.5">(Competitions)</span>
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                পেডাগো একাডেমির চলমান ও বিগত সকল জাতীয় প্রতিযোগিতা এক্সপ্লোর করুন, ফলাফল ও বিস্তারিত তথ্য জেনে নিন।
              </p>
            </div>
            <Link
              href="/competitions"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#29479B] hover:text-[#1A284A] transition-colors"
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
