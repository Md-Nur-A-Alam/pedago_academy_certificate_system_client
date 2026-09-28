"use client";

import React from "react";
import {
  Sparkles,
  Trophy,
  CheckCircle2,
  FileCheck2,
  Award,
  ShieldCheck,
  Zap,
  ArrowRight,
  Layers,
  HelpCircle,
} from "lucide-react";
import { ParticipantRegistrationForm } from "./ParticipantRegistrationForm";

export function ParticipantRegistrationSection({
  defaultCompetitionId = "",
  lockCompetition = false,
  competitionData = null,
  title = "প্রতিযোগিতায় অংশ নিয়েছেন? সরাসরি নিবন্ধন করুন",
  subtitle = "কোনো পাসওয়ার্ড বা অ্যাকাউন্ট খোলার ঝামেলা ছাড়াই আপনার তথ্য ও সাবমিশন লিংক যুক্ত করে অফিশিয়াল রেফারেন্স কোড সংগ্রহ করুন।",
  className = "",
  id = "participant-registration",
  embedded = false,
}) {
  const containerClasses = embedded
    ? `rounded-3xl border border-gray-200/90 p-6 sm:p-8 bg-gradient-to-b from-[#F4F7FC] via-white to-[#F4F7FC] shadow-sm relative overflow-hidden ${className}`
    : `py-12 sm:py-16 bg-gradient-to-b from-[#F4F7FC] via-white to-[#F4F7FC] border-y border-gray-200/60 relative overflow-hidden ${className}`;

  const innerWrapper = embedded
    ? "relative"
    : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative";

  return (
    <section id={id} className={containerClasses}>
      {/* Decorative blurred background accents */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className={innerWrapper}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Context, Steps & Benefits */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>সেলফ-রেজিস্ট্রেশন পোর্টাল (Self-Service)</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1A284A] tracking-tight leading-tight">
                {title}
              </h2>

              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* Quick 3-Step Process Flow */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#29479B]" />
                <span>নিবন্ধন প্রক্রিয়া (৩টি সহজ ধাপ)</span>
              </h3>

              <div className="space-y-3.5">
                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-xl bg-blue-50 text-[#29479B] font-black text-xs flex items-center justify-center shrink-0 border border-blue-100">
                    ১
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1A284A]">
                      প্রতিযোগিতা ও গ্রুপ বাছাই
                    </h4>
                    <p className="text-xs text-gray-500 leading-snug mt-0.5">
                      যে প্রতিযোগিতায় অংশ নিয়েছেন সেটি এবং আপনার বয়স অনুযায়ী গ্রুপ নির্বাচন করুন।
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-xl bg-amber-50 text-[#F59E0B] font-black text-xs flex items-center justify-center shrink-0 border border-amber-100">
                    ২
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1A284A]">
                      তথ্য ও ফেসবুক সাবমিশন লিংক
                    </h4>
                    <p className="text-xs text-gray-500 leading-snug mt-0.5">
                      আপনার নাম, ফোন নম্বর, বয়স এবং আপনার আপলোডকৃত ফেসবুক পোস্ট বা ভিডিওর সঠিক লিঙ্ক দিন।
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 font-black text-xs flex items-center justify-center shrink-0 border border-emerald-100">
                    ৩
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1A284A]">
                      তাৎক্ষণিক রেফারেন্স কোড সংগ্রহ
                    </h4>
                    <p className="text-xs text-gray-500 leading-snug mt-0.5">
                      সাবমিটের সাথে সাথে আপনার অফিশিয়াল রেফারেন্স আইডি স্ক্রিনে দেখতে পাবেন, যা সংরক্ষণ করে রাখুন।
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-gray-100 shadow-2xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-[#1A284A]">তাত্ক্ষণিক আইডি</span>
                  <span className="block text-[11px] text-gray-500">অনন্য রেফারেন্স কোড</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-gray-100 shadow-2xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#29479B] flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-[#1A284A]">সার্টিফিকেট ট্র্যাকিং</span>
                  <span className="block text-[11px] text-gray-500">সহজে ফলাফল যাচাই</span>
                </div>
              </div>
            </div>

            {/* Help & Caution Banner */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-amber-950">জরুরি তথ্য ও দিকনির্দেশনা</p>
                <p className="text-amber-800 leading-relaxed text-[11px]">
                  একই প্রতিযোগিতায় একই ফোন নম্বর দিয়ে একাধিকবার নিবন্ধন করার প্রয়োজন নেই। পূর্বের নিবন্ধিত রেফারেন্স কোড দিয়ে পরবর্তীতে সার্টিফিকেট ও পোস্টার সংগ্রহ করতে পারবেন।
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Embedded Registration Form */}
          <div className="lg:col-span-6">
            <ParticipantRegistrationForm
              defaultCompetitionId={defaultCompetitionId}
              lockCompetition={lockCompetition}
              competitionData={competitionData}
              title="অংশগ্রহণকারী সেলফ-রেজিস্ট্রেশন"
              subtitle="সঠিক তথ্য দিয়ে ফর্মটি পূরণ করে সাবমিট করুন"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
