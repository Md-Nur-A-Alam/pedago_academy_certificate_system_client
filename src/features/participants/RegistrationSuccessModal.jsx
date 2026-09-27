"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Award,
  Image as ImageIcon,
  ArrowRight,
  Bookmark,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export function RegistrationSuccessModal({ isOpen, onClose, data }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !data) return null;

  const refNumber = data.refNumber || "";
  const name = data.name || "Participant";
  const category = data.category || "General";
  const compName = data.competition?.name || "Competition";
  const compId = data.competition?._id || "";

  const handleCopy = () => {
    if (!refNumber) return;
    navigator.clipboard.writeText(refNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col scale-in-95 duration-200">
        {/* Celebration Header */}
        <div className="relative bg-linear-to-r from-[#1A284A] via-[#29479B] to-[#1A284A] p-6 text-white text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#F59E0B] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            নিবন্ধন সফল হয়েছে | Registration Successful!
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            অভিনন্দন, {name}! 🎉
          </h2>
          <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-md mx-auto">
            &ldquo;{compName}&rdquo; প্রতিযোগিতায় <span className="text-[#F59E0B] font-semibold">{category}</span> ক্যাটাগরিতে অংশগ্রহণকারী হিসেবে আপনার তথ্য সংরক্ষিত হয়েছে।
          </p>
        </div>

        {/* Reference ID Callout Box */}
        <div className="p-6 space-y-5">
          <div className="bg-amber-50/70 border-2 border-dashed border-[#F59E0B] rounded-2xl p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#1A284A]/70 mb-1 flex items-center justify-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-[#F59E0B]" />
              আপনার অনন্য রেফারেন্স কোড (Reference ID)
            </p>
            <div className="text-3xl sm:text-4xl font-mono font-black text-[#29479B] tracking-wider py-1 select-all">
              {refNumber}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              সার্টিফিকেট ও পোস্টার ডাউনলোড করতে এই রেফারেন্স কোডটি সংরক্ষণ করুন।
            </p>

            <button
              onClick={handleCopy}
              className={`mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-[#29479B] text-white hover:bg-[#1A284A]"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>রেফারেন্স কোড কপি হয়েছে!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>কপি করুন (Copy Reference ID)</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Action Navigation */}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-gray-500 text-center">
              পরবর্তী ধাপসমূহ (Next Steps):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Link
                href={`/certificates?query=${encodeURIComponent(refNumber)}`}
                onClick={onClose}
                className="group flex items-center justify-between p-3.5 rounded-xl border border-gray-200 hover:border-[#29479B] hover:bg-blue-50/40 transition-all text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1A284A] group-hover:text-[#29479B]">
                      সার্টিফিকেট ডাউনলোড
                    </div>
                    <div className="text-[10px] text-gray-500">
                      Get Official Certificate
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 group-hover:text-[#29479B] transition-transform" />
              </Link>

              <Link
                href={`/posters?competitionId=${compId}`}
                onClick={onClose}
                className="group flex items-center justify-between p-3.5 rounded-xl border border-gray-200 hover:border-[#F0442E] hover:bg-red-50/40 transition-all text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-red-50 text-[#F0442E] flex items-center justify-center border border-red-100">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1A284A] group-hover:text-[#F0442E]">
                      পোস্টার তৈরি করুন
                    </div>
                    <div className="text-[10px] text-gray-500">
                      Photo Social Poster
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 group-hover:text-[#F0442E] transition-transform" />
              </Link>
            </div>
          </div>

          {/* Close button */}
          <div className="pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full text-xs py-2.5 text-gray-600 hover:text-[#1A284A]"
            >
              বন্ধ করুন (Close)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
