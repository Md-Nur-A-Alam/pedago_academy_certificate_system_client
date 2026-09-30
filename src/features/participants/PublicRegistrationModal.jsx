"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Trophy,
  User,
  Phone,
  Calendar,
  Layers,
  Link as LinkIcon,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Clock,
  X,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ImageUpload } from "@/components/ui/ImageUpload";
import apiClient from "@/lib/api-client";
import { toast } from "react-toastify";
import { getRegistrationStatus } from "@/lib/dateUtils";

export function PublicRegistrationModal({
  isOpen,
  onClose,
  defaultCompetitionId = "",
  lockCompetition = false,
  onRegistered,
}) {
  // Fetch active competitions with React Query
  const { data: competitions = [], isLoading: isLoadingCompetitions } = useQuery({
    queryKey: ["public-active-competitions"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/competitions?limit=100&status=active");
      return Array.isArray(data?.data) ? data.data : [];
    },
    enabled: isOpen,
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

  // Active competition resolution
  const activeCompetitionId =
    (lockCompetition && defaultCompetitionId) ||
    selectedCompetitionId ||
    defaultCompetitionId ||
    competitions[0]?._id ||
    "";

  // Current selected competition object
  const currentCompetition = useMemo(() => {
    return competitions.find((c) => c._id === activeCompetitionId) || null;
  }, [competitions, activeCompetitionId]);

  // Compute registration timeline eligibility (startDate and endDate checks)
  const regStatus = useMemo(() => {
    return getRegistrationStatus(currentCompetition);
  }, [currentCompetition]);

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

  const activeCategory = category && availableCategories.includes(category)
    ? category
    : availableCategories[0] || "General";

  const clearErrors = () => {
    if (errorMessage) setErrorMessage("");
    if (duplicateInfo) setDuplicateInfo(null);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setDuplicateInfo(null);
    setRateLimitInfo(null);

    // Frontend validation
    if (!regStatus.isOpen) {
      setErrorMessage(regStatus.message || "এই প্রতিযোগিতার জন্য বর্তমানে নিবন্ধন গ্রহণ করা হচ্ছে না।");
      toast.error(regStatus.message || "নিবন্ধন গ্রহণ করা হচ্ছে না।");
      return;
    }
    if (!activeCompetitionId) {
      setErrorMessage("Please select a competition.");
      return;
    }
    if (!activeCategory.trim()) {
      setErrorMessage("Please select a competition category.");
      return;
    }
    if (!name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!phone.trim()) {
      setErrorMessage("Please enter your phone number.");
      return;
    }
    const parsedAge = parseInt(age, 10);
    if (!parsedAge || parsedAge < 1 || parsedAge > 120) {
      setErrorMessage("Please enter a valid age.");
      return;
    }
    if (!sourceUrl.trim()) {
      setErrorMessage("Please enter the Facebook post or video source link of your entry.");
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
        toast.success("নিবন্ধন সম্পন্ন হয়েছে! Reference ID সংরক্ষণ করুন।");
        onClose();
        if (onRegistered) {
          onRegistered(data.data);
        }
      }
    } catch (err) {
      const status = err.response?.status;
      const respData = err.response?.data;

      if (status === 409) {
        // Duplicate entry detected
        setDuplicateInfo({
          message: respData?.message || "You are already registered for this competition under this category.",
          refNumber: respData?.existingRefNumber || "",
        });
      } else if (status === 429) {
        // Rate limit exceeded (5 requests in 15 mins -> 45 min block)
        setRateLimitInfo({
          message: respData?.message || "You have reached the submission limit of 5 entries within 15 minutes. Please retry after 45 minutes.",
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl my-8 overflow-hidden border border-gray-100 flex flex-col scale-in-95 duration-200">
        {/* Modal Header */}
        <div className="relative bg-linear-to-r from-[#1A284A] via-[#29479B] to-[#1A284A] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#F59E0B]">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 text-[#F59E0B] text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                অংশগ্রহণকারীর তথ্য ফর্ম
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                অংশগ্রহণকারী হিসেবে নিবন্ধন করুন
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Rate Limit Alert */}
          {rateLimitInfo && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">
              <Clock className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-sm text-red-800">নিবন্ধন সীমা অতিক্রম করেছে (Rate Limit Reached)</p>
                <p className="mt-1 text-red-700 leading-relaxed">{rateLimitInfo.message}</p>
              </div>
            </div>
          )}

          {/* Duplicate Alert Box */}
          {duplicateInfo && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-2 flex-1">
                <p className="font-bold text-sm text-amber-900">ইতিমধ্যে নিবন্ধিত (Already Registered)</p>
                <p className="text-amber-800 leading-relaxed">{duplicateInfo.message}</p>
                {duplicateInfo.refNumber && (
                  <div className="pt-1 flex items-center gap-2">
                    <span className="font-bold text-xs">আপনার রেফারেন্স কোড:</span>
                    <span className="font-mono font-extrabold px-2.5 py-1 bg-white rounded-lg border border-amber-300 text-[#29479B] select-all">
                      {duplicateInfo.refNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Registration Window Status Notice */}
          {!regStatus.isOpen && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 animate-in fade-in ${
                regStatus.status === "upcoming"
                  ? "bg-amber-50 border-amber-300 text-amber-900"
                  : "bg-rose-50 border-rose-300 text-rose-900"
              }`}
            >
              {regStatus.status === "upcoming" ? (
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="text-xs space-y-0.5">
                <p className="font-bold">
                  {regStatus.status === "upcoming"
                    ? "নিবন্ধন এখনও শুরু হয়নি"
                    : "নিবন্ধনের সময়সীমা সমাপ্ত হয়েছে"}
                </p>
                <p className="opacity-90">
                  {regStatus.status === "upcoming"
                    ? `এই প্রতিযোগিতার নিবন্ধন শুরু হবে ${currentCompetition?.startDate} তারিখে।`
                    : `এই প্রতিযোগিতার শেষ তারিখ ছিল ${currentCompetition?.endDate}। বর্তমানে নিবন্ধন বন্ধ রয়েছে।`}
                </p>
              </div>
            </div>
          )}

          {/* General Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Competition Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              প্রতিযোগিতা নির্বাচন করুন (Select Competition) <span className="text-red-500">*</span>
            </label>
            {lockCompetition && currentCompetition ? (
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#29479B]" />
                  <span className="font-bold text-[#1A284A]">{currentCompetition.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-[#29479B]">
                    Pre-selected
                  </span>
                  {!regStatus.isOpen && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        regStatus.status === "upcoming"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {regStatus.status === "upcoming" ? "শুরু হয়নি" : "বন্ধ"}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <Select
                value={activeCompetitionId}
                onChange={(e) => {
                  setSelectedCompetitionId(e.target.value);
                  clearErrors();
                }}
                disabled={isLoadingCompetitions || lockCompetition}
                className="w-full text-xs font-medium"
              >
                {competitions.map((c) => {
                  const cStatus = getRegistrationStatus(c);
                  const statusTag = !cStatus.isOpen
                    ? cStatus.status === "upcoming"
                      ? ` [শুরু হয়নি: ${c.startDate}]`
                      : ` [নিবন্ধন শেষ: ${c.endDate}]`
                    : "";
                  return (
                    <option key={c._id} value={c._id}>
                      {c.name} {c.refPrefix ? `(${c.refPrefix})` : ""}{statusTag}
                    </option>
                  );
                })}
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
              className="w-full text-xs font-medium"
            >
              {availableCategories.map((catName) => (
                <option key={catName} value={catName}>
                  {catName}
                </option>
              ))}
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
                  Default (Fixed)
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                * প্রাথমিক নিবন্ধনে স্বয়ংক্রিয়ভাবে অংশগ্রহণকারী হিসেবে সংরক্ষিত হবে।
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

          {/* Action Buttons */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs"
            >
              বাতিল (Cancel)
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !regStatus.isOpen}
              className={`text-xs px-5 py-2.5 ${
                !regStatus.isOpen ? "bg-gray-300 hover:bg-gray-300 text-gray-600 cursor-not-allowed border border-gray-400/30" : ""
              }`}
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="mr-2 text-white" />
                  <span>জমা হচ্ছে... (Submitting)</span>
                </>
              ) : !regStatus.isOpen ? (
                regStatus.status === "upcoming" ? (
                  <>
                    <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-700" />
                    <span>শুরু হবে: {currentCompetition?.startDate}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-rose-700" />
                    <span>নিবন্ধন বন্ধ</span>
                  </>
                )
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-1.5 text-[#F59E0B]" />
                  <span>নিবন্ধন সম্পন্ন করুন (Submit)</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
