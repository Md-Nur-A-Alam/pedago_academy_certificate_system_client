"use client";

import Link from "next/link";
import { Trophy, Tag, Calendar, ArrowRight, ExternalLink, Info, Camera, Layers } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { Badge } from "@/components/ui/Badge";
import { useHomepageSettings } from "@/hooks/useHomepageSettings";

export function ViewCompetitions() {
  const { settings } = useHomepageSettings();
  const config = settings?.featuredCompetitions || {};
  const limit = config.limit || 6;
  const sectionTitle =
    config.title || "চলমান ও জনপ্রিয় প্রতিযোগিতা | Featured Competitions";
  const sectionSubtitle =
    config.subtitle ||
    "পেডাগো একাডেমির সকল সক্রিয় ও সাম্প্রতিক প্রতিযোগিতার ফলাফল ও সার্টিফিকেট";

  // Fetch real competitions dynamically from MongoDB
  const { data: competitions, isLoading } = useQuery({
    queryKey: ["featured-competitions", limit],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/competitions?limit=${limit}`);
      return data?.data || [];
    },
    enabled: config.showSection !== false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (config.showSection === false) {
    return null;
  }

  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-[#1A284A] tracking-tight">
              {sectionTitle}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mt-2 leading-relaxed">
              {sectionSubtitle}
            </p>
          </div>
          <Link
            href="/competitions"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#29479B] hover:text-[#1A284A] transition-colors shrink-0 group"
          >
            <span>সব প্রতিযোগিতা দেখুন (View All)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Dynamic Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-2xl p-6 space-y-4 animate-pulse"
              >
                <div className="h-5 bg-gray-200 rounded-full w-24" />
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
                <div className="h-9 bg-gray-200 rounded-lg w-32 mt-4" />
              </div>
            ))}
          </div>
        ) : !competitions || competitions.length === 0 ? (
          <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-2xl space-y-3">
            <Trophy className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="text-base font-bold text-gray-700">
              কোনো প্রতিযোগিতা পাওয়া যায়নি
            </h3>
            <p className="text-xs text-gray-500">
              শীঘ্রই নতুন প্রতিযোগিতা যুক্ত করা হবে। চোখ রাখুন আমাদের পোর্টালে!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitions.map((comp) => {
              const isActive = comp.status === "active";
              const isArchived = comp.status === "archived";

              return (
                <div
                  key={comp._id}
                  className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between bg-white group hover:-translate-y-1"
                >
                  {/* Optional Image Banner if provided */}
                  {comp.imageUrl ? (
                    <Link
                      href={`/competitions/${comp._id}`}
                      className="w-full h-44 overflow-hidden bg-gray-100 relative block group/img"
                    >
                      <img
                        src={comp.imageUrl}
                        alt={comp.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 text-white backdrop-blur-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {comp.category || "General"}
                        </span>
                        {comp.galleryImages?.length > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/50 text-white backdrop-blur-xs">
                            <Camera className="w-3 h-3 mr-1" />
                            {comp.galleryImages.length} ছবি
                          </span>
                        )}
                      </div>
                    </Link>
                  ) : null}

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        {!comp.imageUrl && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#29479B]/10 text-[#29479B] border border-[#29479B]/20">
                            <Tag className="w-3 h-3 mr-1" />
                            {comp.category || "General"}
                          </span>
                        )}

                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isActive
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : isArchived
                              ? "bg-gray-100 text-gray-700"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              isActive ? "bg-emerald-500" : "bg-gray-400"
                            }`}
                          />
                          {isActive ? "সক্রিয় / Active" : "সম্পন্ন / Completed"}
                        </span>
                      </div>

                      <Link href={`/competitions/${comp._id}`} className="block">
                        <h3 className="text-xl font-bold text-[#1A284A] group-hover:text-[#29479B] transition-colors leading-snug">
                          {comp.name}
                        </h3>
                      </Link>

                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                        {comp.description ||
                          "প্রতিযোগিতার বিস্তারিত নিয়মাবলী, ক্যাটাগরি এবং ফলাফল জানতে বিস্তারিত দেখুন।"}
                      </p>

                      {/* Group, media, and date indicator */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 pt-1">
                        {(comp.categoryGroups?.length > 1 || comp.categories?.length > 1) && (
                          <div className="flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5 text-[#29479B]" />
                            <span>
                              {(comp.categoryGroups || comp.categories).length} টি গ্রুপ
                            </span>
                          </div>
                        )}

                        {(comp.startDate || comp.endDate) && (
                          <div className="flex items-center gap-1 text-[11px] text-gray-500">
                            <Calendar className="w-3 h-3 text-[#F59E0B]" />
                            <span>
                              {comp.startDate || ""} {comp.endDate ? `— ${comp.endDate}` : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

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
    </section>
  );
}
