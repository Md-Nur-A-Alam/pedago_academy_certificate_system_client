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
        <div className="max-w-2xl mx-auto">
          <ParticipantRegistrationForm
            defaultCompetitionId={defaultCompetitionId}
            lockCompetition={lockCompetition}
            competitionData={competitionData}
            title={title}
            subtitle={subtitle}
          />
        </div>
      </div>
    </section>
  );
}
