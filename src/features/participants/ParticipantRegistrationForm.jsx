"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Trophy,
  User,
  Phone,
  Calendar,
  Sparkles,
  AlertCircle,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  Award,
  ArrowRight,
  Bookmark,
  RefreshCw,
  Tag,
  Share2,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ImageUpload } from "@/components/ui/ImageUpload";
import apiClient from "@/lib/api-client";
import { toast } from "react-toastify";

export function ParticipantRegistrationForm({
  defaultCompetitionId = "",
  lockCompetition = false,
  competitionData = null,
  title = "অংশগ্রহণকারী নিবন্ধন (Participant Registration)",
  subtitle = "কোনো অ্যাকাউন্ট বা লগইন ছাড়াই সরাসরি আপনার সাবমিশন তথ্য যুক্ত করুন",
  onSuccess,
  className = "",
}) {
  // Query active competitions if competition list is needed
  const { data: competitions = [], isLoading: isLoadingCompetitions } = useQuery({
    queryKey: ["public-active-competitions"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/competitions?limit=100&status=active");
      return Array.isArray(data?.data) ? data.data : [];
    },
    enabled: !lockCompetition || !competitionData,
    staleTime: 1000 * 60 * 3,
  });

  // Form states
  const [selectedCompetitionId, setSelectedCompetitionId] = useState("");
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [duplicateInfo, setDuplicateInfo] = useState(null);
  const [rateLimitInfo, setRateLimitInfo] = useState(null);
  const [registeredData, setRegisteredData] = useState(null);
  const [copied, setCopied] = useState(false);

  // Active competition resolution
  const activeCompetitionId =
    (lockCompetition && defaultCompetitionId) ||
    selectedCompetitionId ||
    defaultCompetitionId ||
    competitionData?._id ||
    competitions[0]?._id ||
    "";

  // Current selected competition object
  const currentCompetition = useMemo(() => {
    if (competitionData && competitionData._id === activeCompetitionId) {
      return competitionData;
    }
    return competitions.find((c) => c._id === activeCompetitionId) || competitionData || null;
  }, [competitions, competitionData, activeCompetitionId]);

  // Derive categories available for selected competition
  const availableCategories = useMemo(() => {
    if (!currentCompetition) return ["General"];

    const catList = [];
    if (Array.isArray(currentCompetition.categoryGroups) && currentCompetition.categoryGroups.length > 0) {
      currentCompetition.categoryGroups.forEach((cg) => {
        if (cg.name && !catList.includes(cg.name.trim())) {
          catList.push(cg.name.trim());
        }
      });
    }

    if (Array.isArray(currentCompetition.categories) && currentCompetition.categories.length > 0) {
      currentCompetition.categories.forEach((c) => {
        if (c && !catList.includes(c.trim())) {
          catList.push(c.trim());
        }
      });
    }

    if (currentCompetition.category && !catList.includes(currentCompetition.category.trim())) {
      catList.push(currentCompetition.category.trim());
    }

    return catList.length > 0 ? catList : ["General"];
  }, [currentCompetition]);

  const activeCategory =
    category && availableCategories.includes(category)
      ? category
      : availableCategories[0] || "General";

  const clearErrors = () => {
    if (errorMessage) setErrorMessage("");
    if (duplicateInfo) setDuplicateInfo(null);
  };

  const handleCopyRef = (ref) => {
    if (!ref) return;
    navigator.clipboard.writeText(ref);
    setCopied(true);
    toast.info("রেফারেন্স কোড কপি হয়েছে!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleResetForm = () => {
    setRegisteredData(null);
    setName("");
    setPhone("");
    setAge("");
    setSourceUrl("");
    setMediaUrl("");
    setErrorMessage("");
    setDuplicateInfo(null);
    setRateLimitInfo(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setDuplicateInfo(null);
    setRateLimitInfo(null);

    // Validation
    if (!activeCompetitionId) {
      setErrorMessage("অনুগ্রহ করে একটি প্রতিযোগিতা নির্বাচন করুন।");
      return;
    }
    if (!activeCategory.trim()) {
      setErrorMessage("অনুগ্রহ করে একটি ক্যাটাগরি নির্বাচন করুন।");
      return;
    }
    if (!name.trim()) {
      setErrorMessage("অনুগ্রহ করে অংশগ্রহণকারীর পূর্ণ নাম লিখুন।");
      return;
    }
    if (!phone.trim()) {
      setErrorMessage("অনুগ্রহ করে একটি সচল ফোন নম্বর দিন।");
      return;
    }
    const parsedAge = parseInt(age, 10);
    if (!parsedAge || parsedAge < 1 || parsedAge > 120) {
      setErrorMessage("অনুগ্রহ করে সঠিক বয়স লিখুন (১-১২০)।");
      return;
    }
    if (!sourceUrl.trim()) {
      setErrorMessage("অনুগ্রহ করে ফেসবুক পোস্ট বা ভিডিওর লিঙ্ক দিন।");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        competitionId: activeCompetitionId,
        category: activeCategory.trim(),
        name: name.trim(),
        phone: phone.trim(),
        age: parsedAge,
        sourceUrl: sourceUrl.trim(),
        mediaUrl: mediaUrl.trim(),
      };

      const { data } = await apiClient.post("/api/participants/public-register", payload);

      if (data?.success && data?.data) {
        toast.success("নিবন্ধন সম্পন্ন হয়েছে! আপনার রেফারেন্স কোড সংরক্ষণ করুন।");
        setRegisteredData(data.data);
        if (onSuccess) {
          onSuccess(data.data);
        }
      }
    } catch (err) {
      const status = err.response?.status;
      const respData = err.response?.data;

      if (status === 409) {
        setDuplicateInfo({
          message: respData?.message || "You are already registered for this competition under this category.",
          refNumber: respData?.existingRefNumber || "",
        });
      } else if (status === 429) {
        setRateLimitInfo({
          message:
            respData?.message ||
            "You have reached the submission limit of 5 entries within 15 minutes. Please retry after 45 minutes.",
          minutes: respData?.retryAfterMinutes || 45,
        });
      } else {
        const msg = respData?.message || err.message || "Failed to submit registration. Please try again.";
        setErrorMessage(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS VIEW (Celebration Card)
  if (registeredData) {
    const refNum = registeredData.refNumber || "";
    const compName = registeredData.competition?.name || currentCompetition?.name || "Competition";
    const partName = registeredData.name || name;
    const cat = registeredData.category || activeCategory;

    return (
      <div className={`bg-white rounded-3xl border border-emerald-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 ${className}`}>
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 sm:p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center mb-3 shadow-inner">
            <CheckCircle2 className="w-9 h-9 text-emerald-200" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[#FDE047] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            নিবন্ধন সফল হয়েছে! (Registration Successful)
          </div>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
            অভিনন্দন, {partName}! 🎉
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1.5 max-w-lg mx-auto">
            &ldquo;{compName}&rdquo; প্রতিযোগিতায় <span className="font-bold text-[#FDE047]">{cat}</span> ক্যাটাগরিতে অংশগ্রহণকারী হিসেবে আপনার তথ্য সংরক্ষিত হয়েছে।
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Reference ID Showcase */}
          <div className="bg-amber-50/80 border-2 border-dashed border-[#F59E0B] rounded-2xl p-6 text-center shadow-xs">
            <p className="text-xs font-bold uppercase tracking-widest text-[#1A284A]/70 mb-1.5 flex items-center justify-center gap-1.5">
              <Bookmark className="w-4 h-4 text-[#F59E0B]" />
              আপনার অনন্য অফিশিয়াল রেফারেন্স কোড (Reference ID)
            </p>
            <div className="text-3xl sm:text-4xl font-mono font-black text-[#29479B] tracking-wider py-2 select-all">
              {refNum}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              সার্টিফিকেট অনুসন্ধান ও সোশ্যাল পোস্টার তৈরিতে এই রেফারেন্স কোডটি সংরক্ষণ করুন।
            </p>

            <button
              type="button"
              onClick={() => handleCopyRef(refNum)}
              className={`mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-[#29479B] text-white hover:bg-[#1A284A]"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
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

          {/* Action Links */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
              পরবর্তী গুরুত্বপূর্ণ ধাপসমূহ
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href={`/certificates?query=${encodeURIComponent(refNum)}`}
                className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/70 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#29479B] text-white flex items-center justify-center shadow-xs">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1A284A]">
                      সার্টিফিকেট ডাউনলোড ও যাচাই
                    </h4>
                    <span className="text-[11px] text-gray-500">
                      রেফারেন্স দিয়ে সরাসরি খুঁজুন
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#29479B] group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href={`/posters?query=${encodeURIComponent(refNum)}`}
                className="flex items-center justify-between p-4 rounded-2xl bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/70 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F59E0B] text-white flex items-center justify-center shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1A284A]">
                      অ্যাচিভমেন্ট পোস্টার তৈরি
                    </h4>
                    <span className="text-[11px] text-gray-500">
                      সোশ্যাল মিডিয়ার উপযোগী ছবি
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#F59E0B] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Reset button to register another participant */}
          <div className="pt-2 border-t border-gray-100 text-center">
            <button
              type="button"
              onClick={handleResetForm}
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-[#29479B] transition-colors cursor-pointer py-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>নতুন আরেকটি নিবন্ধন করুন (Register Another)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STANDARD FORM VIEW
  return (
    <div className={`bg-white rounded-3xl border border-gray-200/90 shadow-md overflow-hidden ${className}`}>
      {/* Header */}
      <div className="relative bg-gradient-to-r from-[#1A284A] via-[#29479B] to-[#1A284A] px-6 py-5 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#F59E0B] shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 text-[#F59E0B] text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              স্বয়ংক্রিয় নিবন্ধন পোর্টাল
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-white/80 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Rate Limit Alert */}
        {rateLimitInfo && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 animate-in fade-in">
            <Clock className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-sm text-red-800">নিবন্ধন সীমা অতিক্রম করেছে (Rate Limit Reached)</p>
              <p className="mt-1 text-red-700 leading-relaxed">{rateLimitInfo.message}</p>
            </div>
          </div>
        )}

        {/* Duplicate Alert Box */}
        {duplicateInfo && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-2 flex-1">
              <p className="font-bold text-sm text-amber-900">ইতিমধ্যে নিবন্ধিত (Already Registered)</p>
              <p className="text-amber-800 leading-relaxed">{duplicateInfo.message}</p>
              {duplicateInfo.refNumber && (
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <span className="font-bold text-xs">আপনার রেফারেন্স কোড:</span>
                  <span className="font-mono font-extrabold px-2.5 py-1 bg-white rounded-lg border border-amber-300 text-[#29479B] select-all">
                    {duplicateInfo.refNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyRef(duplicateInfo.refNumber)}
                    className="text-[11px] font-bold text-[#29479B] underline hover:text-[#1A284A] cursor-pointer"
                  >
                    কপি করুন
                  </button>
                  <Link
                    href={`/certificates?query=${encodeURIComponent(duplicateInfo.refNumber)}`}
                    className="text-[11px] font-bold text-emerald-700 hover:underline inline-flex items-center gap-0.5 ml-2"
                  >
                    <span>সার্টিফিকেট দেখুন</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* General Error Message */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Competition Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            প্রতিযোগিতা নির্বাচন করুন (Competition) <span className="text-red-500">*</span>
          </label>
          {lockCompetition && currentCompetition ? (
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#29479B]" />
                <span className="font-bold text-[#1A284A]">{currentCompetition.name}</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-[#29479B]">
                Selected
              </span>
            </div>
          ) : (
            <Select
              value={activeCompetitionId}
              onChange={(e) => {
                setSelectedCompetitionId(e.target.value);
                setCategory("");
                clearErrors();
              }}
              disabled={isLoadingCompetitions || lockCompetition}
              className="w-full text-xs sm:text-sm font-medium text-gray-900 bg-white"
            >
              {isLoadingCompetitions ? (
                <option value="">প্রতিযোগিতা লোড হচ্ছে... (Loading...)</option>
              ) : competitions.length === 0 ? (
                <option value="">কোনো সক্রিয় প্রতিযোগিতা নেই</option>
              ) : (
                competitions.map((c) => (
                  <option key={c._id} value={c._id} className="text-gray-900 bg-white">
                    {c.name} {c.refPrefix ? `(${c.refPrefix})` : ""}
                  </option>
                ))
              )}
            </Select>
          )}
        </div>

        {/* 2. Category Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            ক্যাটাগরি বা গ্রুপ (Category / Group) <span className="text-red-500">*</span>
          </label>
          <Select
            value={activeCategory}
            onChange={(e) => {
              setCategory(e.target.value);
              clearErrors();
            }}
            disabled={availableCategories.length === 0}
            className="w-full text-xs sm:text-sm font-medium text-gray-900 bg-white"
          >
            {availableCategories.length === 0 ? (
              <option value="General">General</option>
            ) : (
              availableCategories.map((catName) => (
                <option key={catName} value={catName} className="text-gray-900 bg-white">
                  {catName}
                </option>
              ))
            )}
          </Select>
        </div>

        {/* 3. Name & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <Input
              label="অংশগ্রহণকারীর পূর্ণ নাম (Full Name) *"
              placeholder="e.g. তানভীর আহমেদ / Tanvir Ahmed"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clearErrors();
              }}
              required
            />
          </div>
          <div>
            <Input
              label="ফোন নম্বর (Phone Number) *"
              placeholder="e.g. 01700-000000"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                clearErrors();
              }}
              required
            />
          </div>
        </div>

        {/* 4. Age & Achievement Type (Fixed) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <Input
              label="বয়স (Age) *"
              type="number"
              min="1"
              max="120"
              placeholder="e.g. 10"
              value={age}
              onChange={(e) => {
                setAge(e.target.value);
                clearErrors();
              }}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              অ্যাচিভমেন্ট টাইপ (Achievement Type)
            </label>
            <div className="h-10 px-3.5 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-between text-xs text-gray-600 cursor-not-allowed">
              <span className="font-semibold text-[#1A284A]">অংশগ্রহণকারী (Participant)</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-[#29479B]">
                Default
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              * স্বয়ংক্রিয়ভাবে অংশগ্রহণকারী হিসেবে সংরক্ষিত হবে।
            </p>
          </div>
        </div>

        {/* 5. Source URL */}
        <div>
          <Input
            label="ফেসবুক পোস্ট বা ভিডিও লিংক (Source URL) *"
            placeholder="https://www.facebook.com/..."
            value={sourceUrl}
            onChange={(e) => {
              setSourceUrl(e.target.value);
              clearErrors();
            }}
            required
          />
          <p className="text-[10px] text-gray-500 mt-1">
            আপনার সাবমিশনকৃত ফেসবুক পোস্ট বা ভিডিওর লিঙ্ক দিন।
          </p>
        </div>

        {/* 6. Photo Upload / Media Link (Optional) */}
        <div className="pt-1">
          <ImageUpload
            label="অংশগ্রহণকারীর ছবি (Photo Upload / Media Link - Optional)"
            value={mediaUrl}
            onChange={(url) => setMediaUrl(url)}
            helpText="আপনার ছবি আপলোড করুন অথবা সরাসরি ছবির লিংক দিন (পোস্টারে প্রদর্শনের জন্য)"
          />
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-gray-100">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="w-full text-xs sm:text-sm py-3 font-extrabold shadow-md hover:shadow-lg transition-all"
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="mr-2 text-white" />
                <span>জমা হচ্ছে... (Submitting)</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2 text-[#F59E0B]" />
                <span>নিবন্ধন সম্পন্ন করুন (Submit Registration)</span>
              </>
            )}
          </Button>
          <p className="text-[11px] text-gray-400 text-center mt-2">
            সাবমিট করার সাথে সাথেই আপনি একটি অনন্য রেফারেন্স কোড পাবেন।
          </p>
        </div>
      </form>
    </div>
  );
}
