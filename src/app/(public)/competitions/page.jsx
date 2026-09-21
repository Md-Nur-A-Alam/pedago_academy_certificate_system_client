"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import {
  Trophy,
  Search,
  Tag,
  ArrowRight,
  Info,
  Camera,
  Layers,
  Sparkles,
  Calendar,
  Users,
  Award,
  Filter,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

const TOPIC_ICONS = {
  "ছবি আঁকা": "🎨",
  চিঠি: "✉️",
  ভিডিও: "🎬",
  "কবিতা আবৃত্তি": "🎙️",
  "রচনা / গল্প": "📝",
  কুইজ: "💡",
  সাধারণ: "🌟",
};

export default function CompetitionsPage() {
  const [search, setSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedAge, setSelectedAge] = useState("all");
  const [dateStatus, setDateStatus] = useState("all"); // 'all' | 'active' | 'archived'

  // Fetch dynamic topics list from database
  const { data: availableTopics = [] } = useQuery({
    queryKey: ["competition-topics"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/competitions/topics");
      return data?.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // Fetch competitions with query params
  const { data: competitions = [], isLoading } = useQuery({
    queryKey: ["public-competitions", search, selectedTopic, selectedAge, dateStatus],
    queryFn: async () => {
      let url = `/api/competitions?limit=100`;

      if (search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      if (selectedTopic !== "all") {
        url += `&topic=${encodeURIComponent(selectedTopic)}`;
      }
      if (selectedAge !== "all") {
        url += `&age=${encodeURIComponent(selectedAge)}`;
      }
      if (dateStatus !== "all") {
        url += `&status=${dateStatus}`;
      }

      const { data } = await apiClient.get(url);
      return data?.data || [];
    },
    staleTime: 1000 * 60 * 3, // 3 mins
  });

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedTopic !== "all" ||
    selectedAge !== "all" ||
    dateStatus !== "all";

  const handleResetFilters = () => {
    setSearch("");
    setSelectedTopic("all");
    setSelectedAge("all");
    setDateStatus("all");
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#29479B]/10 text-[#29479B] text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-[#F59E0B]" />
            <span>Pedago Academy Competitions</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A284A] tracking-tight">
            সকল প্রতিযোগিতা ও ইভেন্ট সমূহ
          </h1>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            চিঠি, ভিডিও, ছবি আঁকা, কবিতা আবৃত্তিসহ পেডাগো একাডেমির সকল প্রতিযোগিতার বিস্তারিত নিয়মাবলী, ক্যাটাগরি, বয়স ও সময়সীমা দেখে অংশ নিন এবং সার্টিফিকেট ডাউনলোড করুন।
          </p>
        </div>

        {/* Multi-Filter Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1A284A] uppercase tracking-wider">
              <Filter className="w-4 h-4 text-[#29479B]" />
              <span>ফিল্টার ও অনুসন্ধান (Search & Filter)</span>
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>রিসেট (Reset)</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* 1. Name Search */}
            <div className="relative">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                প্রতিযোগিতার নাম (Name)
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="নাম দিয়ে খুঁজুন..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50/80 rounded-xl border border-gray-200 text-xs sm:text-sm text-[#1A284A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#29479B] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* 2. Topic Dropdown Filter */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                প্রতিযোগিতার বিষয় (Topic Type)
              </label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50/80 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold text-[#1A284A] focus:outline-none focus:ring-2 focus:ring-[#29479B] focus:bg-white transition-all cursor-pointer"
              >
                <option value="all">সকল বিষয় (All Topics)</option>
                {availableTopics.map((top, idx) => (
                  <option key={idx} value={top}>
                    {TOPIC_ICONS[top] ? `${TOPIC_ICONS[top]} ` : ""}
                    {top}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Age Filter Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                বয়স অনুযায়ী (Filter by Age)
              </label>
              <select
                value={selectedAge}
                onChange={(e) => setSelectedAge(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50/80 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold text-[#1A284A] focus:outline-none focus:ring-2 focus:ring-[#29479B] focus:bg-white transition-all cursor-pointer"
              >
                <option value="all">সকল বয়স (All Ages)</option>
                <option value="5">৫ বছর (Age 5)</option>
                <option value="6">৬ বছর (Age 6)</option>
                <option value="7">৭ বছর (Age 7)</option>
                <option value="8">৮ বছর (Age 8)</option>
                <option value="9">৯ বছর (Age 9)</option>
                <option value="10">১০ বছর (Age 10)</option>
                <option value="11">১১ বছর (Age 11)</option>
                <option value="12">১২ বছর (Age 12)</option>
                <option value="13">১৩ বছর (Age 13)</option>
                <option value="14">১৪ বছর (Age 14)</option>
                <option value="15">১৫+ বছর (Age 15+)</option>
              </select>
            </div>

            {/* 4. Date & Status Filter */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                সময়কাল ও স্ট্যাটাস (Date & Status)
              </label>
              <select
                value={dateStatus}
                onChange={(e) => setDateStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50/80 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold text-[#1A284A] focus:outline-none focus:ring-2 focus:ring-[#29479B] focus:bg-white transition-all cursor-pointer"
              >
                <option value="all">সকল সময় (All Competitions)</option>
                <option value="active">চলমান (Active / Ongoing)</option>
                <option value="archived">সম্পন্ন (Completed / Archived)</option>
              </select>
            </div>
          </div>

          {/* Active Summary */}
          <div className="flex items-center justify-between pt-2 text-xs text-gray-500">
            <span>
              মোট <strong>{competitions.length}</strong> টি প্রতিযোগিতা প্রদর্শিত হচ্ছে
            </span>
            {selectedTopic !== "all" && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-[#29479B] font-semibold">
                বিষয়: {selectedTopic}
              </span>
            )}
          </div>
        </div>

        {/* Competitions Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl border border-gray-200 p-6 space-y-4 animate-pulse shadow-xs"
              >
                <div className="h-44 bg-gray-200 rounded-2xl w-full" />
                <div className="h-5 bg-gray-200 rounded-full w-28" />
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
                <div className="h-10 bg-gray-200 rounded-xl w-full mt-4" />
              </div>
            ))}
          </div>
        ) : competitions.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white border-2 border-dashed border-gray-200 rounded-3xl max-w-lg mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#F59E0B] flex items-center justify-center mx-auto shadow-2xs">
              <Trophy className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-[#1A284A]">
              কোনো প্রতিযোগিতা পাওয়া যায়নি
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-xs mx-auto">
              আপনার ফিল্টার মানদণ্ডের সাথে মিল রেখে কোনো প্রতিযোগিতা পাওয়া যায়নি। ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-xs font-bold text-[#29479B] bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
              >
                সকল ফিল্টার মুছুন
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitions.map((comp) => {
              const isActive = comp.status === "active";
              const isArchived = comp.status === "archived";
              const primaryTopic = comp.topicType || (comp.topicTypes && comp.topicTypes[0]) || "সাধারণ";
              const topicIcon = TOPIC_ICONS[primaryTopic] || "🏆";

              return (
                <div
                  key={comp._id}
                  className="bg-white border border-gray-200/90 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                >
                  {/* Banner Image */}
                  {comp.imageUrl ? (
                    <Link
                      href={`/competitions/${comp._id}`}
                      className="w-full h-48 overflow-hidden bg-gray-100 relative block group/img"
                    >
                      <img
                        src={comp.imageUrl}
                        alt={comp.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                        {/* Topic badge */}
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#29479B]/90 text-white backdrop-blur-xs shadow-xs">
                          <span className="mr-1">{topicIcon}</span>
                          {primaryTopic}
                        </span>

                        {comp.galleryImages?.length > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/50 text-white backdrop-blur-xs">
                            <Camera className="w-3 h-3 mr-1" />
                            {comp.galleryImages.length} ছবি
                          </span>
                        )}
                      </div>

                      {/* Status chip on top right */}
                      <div className="absolute top-3 right-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-xs ${
                            isActive
                              ? "bg-emerald-600/90 text-white shadow-xs"
                              : isArchived
                              ? "bg-gray-800/80 text-white"
                              : "bg-amber-600/90 text-white"
                          }`}
                        >
                          {isActive ? "চলমান" : "সম্পন্ন"}
                        </span>
                      </div>
                    </Link>
                  ) : null}

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      {/* Badge row if no image */}
                      {!comp.imageUrl && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#29479B]/10 text-[#29479B]">
                            <span className="mr-1">{topicIcon}</span>
                            {primaryTopic}
                          </span>

                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isActive
                                ? "bg-emerald-100 text-emerald-800"
                                : isArchived
                                ? "bg-gray-100 text-gray-700"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {isActive ? "চলমান" : "সম্পন্ন"}
                          </span>
                        </div>
                      )}

                      <Link href={`/competitions/${comp._id}`} className="block">
                        <h3 className="text-lg sm:text-xl font-bold text-[#1A284A] group-hover:text-[#29479B] transition-colors leading-snug">
                          {comp.name}
                        </h3>
                      </Link>

                      <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-2">
                        {comp.description ||
                          "প্রতিযোগিতার বিস্তারিত নিয়মাবলী, ক্যাটাগরি এবং ফলাফল জানতে বিস্তারিত দেখুন।"}
                      </p>

                      {/* Timeline, Age and Category Indicators */}
                      <div className="space-y-1.5 pt-1 text-xs text-gray-600">
                        {/* Dates */}
                        {(comp.startDate || comp.endDate) && (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Calendar className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                            <span>
                              সময়সীমা: <strong>{comp.startDate || "শুরু"}</strong> থেকে{" "}
                              <strong>{comp.endDate || "শেষ"}</strong>
                            </span>
                          </div>
                        )}

                        {/* Age Eligibility */}
                        {(comp.minAge > 0 || comp.maxAge > 0) ? (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Users className="w-3.5 h-3.5 text-[#29479B] shrink-0" />
                            <span>
                              বয়সসীমা:{" "}
                              <strong>
                                {comp.minAge > 0 && comp.maxAge > 0
                                  ? `${comp.minAge} — ${comp.maxAge} বছর`
                                  : comp.minAge > 0
                                  ? `${comp.minAge}+ বছর`
                                  : `সর্বোচ্চ ${comp.maxAge} বছর`}
                              </strong>
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                            <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>সকল বয়সের জন্য উন্মুক্ত</span>
                          </div>
                        )}

                        {/* Groups count & Certificate badge */}
                        <div className="flex items-center justify-between gap-2 pt-1">
                          {(comp.categoryGroups?.length > 1 || comp.categories?.length > 1) && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                              <Layers className="w-3 h-3 text-purple-600" />
                              {(comp.categoryGroups || comp.categories).length} টি গ্রুপ
                            </span>
                          )}

                          {comp.providesCertificate !== false ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md ml-auto">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              সার্টিফিকেট সহ
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400 ml-auto">
                              সার্টিফিকেট নেই
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/competitions/${comp._id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 text-[#1A284A] hover:bg-[#29479B] hover:text-white transition-all shadow-2xs group/btn"
                        >
                          <Info className="w-3.5 h-3.5 text-[#29479B] group-hover/btn:text-white transition-colors" />
                          <span>বিস্তারিত (Details)</span>
                        </Link>

                        {comp.providesCertificate !== false ? (
                          <Link
                            href={`/certificates?competitionId=${comp._id}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#29479B] text-white hover:bg-[#1A284A] shadow-xs hover:shadow-md transition-all"
                          >
                            <span>সার্টিফিকেট</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        ) : null}
                      </div>

                      {comp.refPrefix && (
                        <span className="text-[11px] font-mono text-gray-400 font-semibold">
                          {comp.refPrefix}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
