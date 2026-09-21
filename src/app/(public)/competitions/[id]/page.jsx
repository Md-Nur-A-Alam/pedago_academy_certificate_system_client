"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { useCurrentAdmin } from "@/features/admin/auth/useCurrentAdmin";
import { CompetitionForm } from "@/features/admin/competitions/CompetitionForm";
import { Modal } from "@/components/ui/Modal";
import {
  Trophy,
  ArrowLeft,
  Calendar,
  ExternalLink,
  Edit,
  Tag,
  CheckCircle2,
  FileText,
  Award,
  Layers,
  Camera,
  ChevronLeft,
  ChevronRight,
  X,
  Share2,
  Sparkles,
  Gift,
  Clock,
  XCircle,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";

export default function CompetitionDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { admin } = useCurrentAdmin();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedGroupTab, setSelectedGroupTab] = useState(0);
  const [lightboxImage, setLightboxImage] = useState(null); // url string or null
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxList, setLightboxList] = useState([]); // array of urls

  // Fetch Competition by ID
  const {
    data: competition,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["competition-details", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/competitions/${id}`);
      return data?.data || null;
    },
    enabled: Boolean(id),
  });

  // Update Mutation for Admin
  const updateCompetitionMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await apiClient.patch(`/api/competitions/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Competition details updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["competition-details", id] });
      queryClient.invalidateQueries({ queryKey: ["public-competitions"] });
      queryClient.invalidateQueries({ queryKey: ["competitions"] });
      queryClient.invalidateQueries({ queryKey: ["competition-topics"] });
      setIsEditModalOpen(false);
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message || err.message || "Failed to update competition";
      toast.error(msg);
    },
  });

  const handleAdminUpdate = async (formData) => {
    await updateCompetitionMutation.mutateAsync(formData);
  };

  const openLightbox = (imageList, index) => {
    setLightboxList(imageList);
    setLightboxIndex(index);
    setLightboxImage(imageList[index]);
  };

  const handleNextImage = () => {
    if (lightboxList.length === 0) return;
    const nextIdx = (lightboxIndex + 1) % lightboxList.length;
    setLightboxIndex(nextIdx);
    setLightboxImage(lightboxList[nextIdx]);
  };

  const handlePrevImage = () => {
    if (lightboxList.length === 0) return;
    const prevIdx = (lightboxIndex - 1 + lightboxList.length) % lightboxList.length;
    setLightboxIndex(prevIdx);
    setLightboxImage(lightboxList[prevIdx]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-16">
        <div className="max-w-5xl mx-auto px-4 space-y-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded-lg w-48" />
          <div className="h-64 sm:h-80 bg-gray-200 rounded-3xl w-full" />
          <div className="h-10 bg-gray-200 rounded-lg w-3/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-gray-200 rounded-2xl" />
            <div className="h-48 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !competition) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <Trophy className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-[#1A284A]">প্রতিযোগিতা পাওয়া যায়নি</h2>
          <p className="text-sm text-gray-500">
            এই আইডিযুক্ত প্রতিযোগিতাটি হয়তো সরানো হয়েছে অথবা খুঁজে পাওয়া যাচ্ছে না।
          </p>
          <Link
            href="/competitions"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#29479B] text-white font-bold text-sm hover:bg-[#1A284A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>সকল প্রতিযোগিতা দেখুন</span>
          </Link>
        </div>
      </div>
    );
  }

  const isActive = competition.status === "active";
  const isArchived = competition.status === "archived";
  const gallery = Array.isArray(competition.galleryImages) ? competition.galleryImages : [];
  const groups =
    Array.isArray(competition.categoryGroups) && competition.categoryGroups.length > 0
      ? competition.categoryGroups
      : Array.isArray(competition.categories) && competition.categories.length > 0
      ? competition.categories.map((c) => ({
          name: c,
          details: "",
          criteria: "",
          rules: "",
          pictures: [],
        }))
      : [{ name: competition.category || "General", details: "", criteria: "", rules: "", pictures: [] }];

  const currentGroup = groups[selectedGroupTab] || groups[0];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Top Breadcrumb & Admin Bar */}
      <div className="bg-white border-b border-gray-200/80 sticky top-20 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 truncate">
            <Link href="/" className="hover:text-[#29479B] transition-colors shrink-0">
              হোম
            </Link>
            <span>/</span>
            <Link
              href="/competitions"
              className="hover:text-[#29479B] transition-colors shrink-0"
            >
              প্রতিযোগিতা সমূহ
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#1A284A] truncate">
              {competition.name}
            </span>
          </div>

          {/* Admin Edit Trigger if logged in */}
          {admin && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#29479B] text-white hover:bg-[#1A284A] shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Details (Admin)</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* Main Hero Card */}
        <div className="bg-white rounded-3xl border border-gray-200/90 overflow-hidden shadow-sm">
          {competition.imageUrl && (
            <div className="w-full h-64 sm:h-96 relative bg-gray-900 overflow-hidden">
              <img
                src={competition.imageUrl}
                alt={competition.name}
                className="w-full h-full object-cover opacity-90 hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4 text-white">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/30">
                      <Tag className="w-3.5 h-3.5 mr-1 text-[#F59E0B]" />
                      {competition.category || "General"}
                    </span>
                    {/* Topic Badges */}
                    {(() => {
                      const allTopics =
                        Array.isArray(competition.topicTypes) && competition.topicTypes.length > 0
                          ? competition.topicTypes
                          : competition.topicType
                          ? [competition.topicType]
                          : [];
                      return allTopics.map((top, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#F59E0B] text-white shadow-xs"
                        >
                          বিষয়: {top}
                        </span>
                      ));
                    })()}
                    {(competition.minAge > 0 || competition.maxAge > 0) && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/30">
                        <Users className="w-3.5 h-3.5 mr-1 text-white" />
                        বয়স:{" "}
                        {competition.minAge > 0 && competition.maxAge > 0
                          ? `${competition.minAge} - ${competition.maxAge} বছর`
                          : competition.minAge > 0
                          ? `${competition.minAge}+ বছর`
                          : `সর্বোচ্চ ${competition.maxAge} বছর`}
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        isActive
                          ? "bg-emerald-500 text-white"
                          : isArchived
                          ? "bg-gray-600 text-white"
                          : "bg-amber-500 text-white"
                      }`}
                    >
                      {isActive ? "সক্রিয় প্রতিযোগিতা" : "সম্পন্ন"}
                    </span>
                    {competition.providesCertificate !== false ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/30 backdrop-blur-md text-emerald-200 border border-emerald-400/30">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-300" />
                        সার্টিফিকেট প্রদান করা হবে
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-500/30 backdrop-blur-md text-amber-200 border border-amber-400/30">
                        সার্টিফিকেট নেই
                      </span>
                    )}
                    {competition.refPrefix && (
                      <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-black/40 text-white backdrop-blur-xs">
                        Code: {competition.refPrefix}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight drop-shadow-md">
                    {competition.name}
                  </h1>

                  {/* Date range in banner if provided */}
                  {(competition.startDate || competition.endDate || competition.resultPublishDate) && (
                    <div className="flex items-center gap-3 flex-wrap text-xs text-white/90 pt-1">
                      {(competition.startDate || competition.endDate) && (
                        <span className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-3 py-1 rounded-lg">
                          <Calendar className="w-3.5 h-3.5 text-[#F59E0B]" />
                          <span>সময়সীমা: {competition.startDate || "শুরু"} হতে {competition.endDate || "শেষ"}</span>
                        </span>
                      )}
                      {competition.resultPublishDate && (
                        <span className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-3 py-1 rounded-lg">
                          <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                          <span>ফলাফল প্রকাশ: {competition.resultPublishDate}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="p-6 sm:p-8 space-y-6">
            {!competition.imageUrl && (
              <div className="space-y-3 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#29479B]/10 text-[#29479B]">
                    <Tag className="w-3.5 h-3.5 mr-1 text-[#29479B]" />
                    {competition.category || "General"}
                  </span>
                  {(competition.topicType || (competition.topicTypes && competition.topicTypes[0])) && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
                      বিষয়: {competition.topicType || competition.topicTypes[0]}
                    </span>
                  )}
                  {(competition.minAge > 0 || competition.maxAge > 0) && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#29479B] border border-blue-100">
                      <Users className="w-3.5 h-3.5 mr-1 text-[#29479B]" />
                      বয়স:{" "}
                      {competition.minAge > 0 && competition.maxAge > 0
                        ? `${competition.minAge} - ${competition.maxAge} বছর`
                        : competition.minAge > 0
                        ? `${competition.minAge}+ বছর`
                        : `সর্বোচ্চ ${competition.maxAge} বছর`}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      isActive
                        ? "bg-emerald-100 text-emerald-800"
                        : isArchived
                        ? "bg-gray-100 text-gray-700"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {isActive ? "সক্রিয় প্রতিযোগিতা" : "সম্পন্ন"}
                  </span>
                  {competition.providesCertificate !== false ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                      সার্টিফিকেট প্রদান করা হবে
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      সার্টিফিকেট প্রযোজ্য নয়
                    </span>
                  )}
                  {competition.refPrefix && (
                    <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-gray-700">
                      Code: {competition.refPrefix}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A284A]">
                  {competition.name}
                </h1>

                {/* Timeline in non-image banner */}
                {(competition.startDate || competition.endDate || competition.resultPublishDate) && (
                  <div className="flex items-center gap-3 flex-wrap text-xs text-gray-600 pt-1">
                    {(competition.startDate || competition.endDate) && (
                      <span className="inline-flex items-center gap-1.5 bg-blue-50 text-[#1A284A] px-3 py-1.5 rounded-xl border border-blue-100">
                        <Calendar className="w-3.5 h-3.5 text-[#29479B]" />
                        <span>সময়সীমা: {competition.startDate || "শুরু"} হতে {competition.endDate || "শেষ"}</span>
                      </span>
                    )}
                    {competition.resultPublishDate && (
                      <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-900 px-3 py-1.5 rounded-xl border border-purple-100">
                        <Clock className="w-3.5 h-3.5 text-purple-600" />
                        <span>ফলাফল প্রকাশ: {competition.resultPublishDate}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {competition.description && (
              <div className="text-gray-700 text-sm sm:text-base leading-relaxed bg-slate-50/80 p-5 rounded-2xl border border-gray-100">
                <p className="whitespace-pre-line">{competition.description}</p>
              </div>
            )}

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex flex-wrap items-center gap-3">
                {competition.providesCertificate !== false ? (
                  <Link
                    href={`/certificates?competitionId=${competition._id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#29479B] text-white font-bold text-sm hover:bg-[#1A284A] shadow-md hover:shadow-lg transition-all"
                  >
                    <Award className="w-4 h-4" />
                    <span>সার্টিফিকেট সংগ্রহ ও যাচাই</span>
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 text-gray-500 font-semibold text-xs border border-gray-200">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>এই প্রতিযোগিতায় সার্টিফিকেট প্রযোজ্য নয়</span>
                  </span>
                )}

                <Link
                  href={`/posters?competitionId=${competition._id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F59E0B] text-white font-bold text-sm hover:bg-[#d97706] shadow-md hover:shadow-lg transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>মাইলস্টোন পোস্টার তৈরি</span>
                </Link>
              </div>

              {competition.sourceLink && (
                <a
                  href={competition.sourceLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#29479B] transition-colors"
                >
                  <span>অফিসিয়াল ইভেন্ট লিঙ্ক</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Section: Prizes & Awards (পুরস্কার ও সম্মাননা) */}
        {(competition.prizes?.firstPrize ||
          competition.prizes?.secondPrize ||
          competition.prizes?.thirdPrize ||
          competition.prizes?.topNPrizes ||
          competition.prizes?.allParticipantPrize) && (
          <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#F59E0B] flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#1A284A]">
                  পুরস্কার ও সম্মাননা (Prizes & Awards)
                </h3>
                <p className="text-xs text-gray-500">
                  বিজয়ী ও অংশগ্রহণকারীদের জন্য নির্ধারিত আকর্ষণীয় পুরস্কার সমূহ
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {competition.prizes?.firstPrize && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 to-yellow-50/40 border border-amber-200/80 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🥇</span>
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      ১ম পুরস্কার (Champion)
                    </h4>
                  </div>
                  <p className="text-sm font-bold text-[#1A284A] leading-snug">
                    {competition.prizes.firstPrize}
                  </p>
                </div>
              )}

              {competition.prizes?.secondPrize && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-gray-50/80 border border-gray-200 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🥈</span>
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      ২য় পুরস্কার (1st Runner-up)
                    </h4>
                  </div>
                  <p className="text-sm font-bold text-[#1A284A] leading-snug">
                    {competition.prizes.secondPrize}
                  </p>
                </div>
              )}

              {competition.prizes?.thirdPrize && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50/60 to-amber-50/30 border border-orange-200/70 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🥉</span>
                    <h4 className="text-xs font-bold text-orange-900 uppercase tracking-wider">
                      ৩য় পুরস্কার (2nd Runner-up)
                    </h4>
                  </div>
                  <p className="text-sm font-bold text-[#1A284A] leading-snug">
                    {competition.prizes.thirdPrize}
                  </p>
                </div>
              )}

              {competition.prizes?.topNPrizes && (
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1.5 shadow-2xs sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🎖️</span>
                    <h4 className="text-xs font-bold text-[#29479B] uppercase tracking-wider">
                      শীর্ষ প্রতিযোগীদের বিশেষ পুরস্কার (Top N)
                    </h4>
                  </div>
                  <p className="text-sm font-bold text-[#1A284A] leading-snug">
                    {competition.prizes.topNPrizes}
                  </p>
                </div>
              )}

              {competition.prizes?.allParticipantPrize && (
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1.5 shadow-2xs sm:col-span-2 lg:col-span-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🎁</span>
                    <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      সকল অংশগ্রহণকারীর জন্য উপহার (All Participants)
                    </h4>
                  </div>
                  <p className="text-sm font-bold text-[#1A284A] leading-snug">
                    {competition.prizes.allParticipantPrize}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section 2: Main Rules & Main Criteria */}
        {(competition.mainRules || competition.mainCriteria) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Main Rules */}
            {competition.mainRules ? (
              <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-7 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#29479B] flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-[#1A284A]">
                      মূল নিয়মাবলী (Main Rules)
                    </h3>
                    <p className="text-xs text-gray-500">প্রতিযোগিতার সার্বিক নীতিমালা</p>
                  </div>
                </div>
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line space-y-2">
                  {competition.mainRules}
                </div>
              </div>
            ) : null}

            {/* Main Criteria */}
            {competition.mainCriteria ? (
              <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-7 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-[#1A284A]">
                      মূল্যায়ন মানদণ্ড (Main Criteria)
                    </h3>
                    <p className="text-xs text-gray-500">বিচারকার্য ও যোগ্যতার মাপকাঠি</p>
                  </div>
                </div>
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line space-y-2">
                  {competition.mainCriteria}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Section 3: Gallery Pictures (Up to 5 pictures) */}
        {gallery.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 space-y-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#F59E0B] flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#1A284A]">
                    ছবি গ্যালারি (Gallery - {gallery.length} Photos)
                  </h3>
                  <p className="text-xs text-gray-500">
                    প্রতিযোগিতার স্মরণীয় মুহূর্ত ও বিজয়ীদের ছবি (ক্লিক করে বড় করে দেখুন)
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {gallery.map((imgUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => openLightbox(gallery, idx)}
                  className="group relative rounded-2xl overflow-hidden bg-gray-100 aspect-video sm:aspect-square cursor-pointer border border-gray-200 shadow-2xs hover:shadow-md transition-all"
                >
                  <img
                    src={imgUrl}
                    alt={`Competition photo ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs font-bold text-white bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                      বড় করে দেখুন
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 4: Category / Group Breakdown */}
        <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#1A284A]">
                  ক্যাটাগরি ও গ্রুপ ভিত্তিক বিস্তারিত (Categories & Groups)
                </h3>
                <p className="text-xs text-gray-500">
                  মোট {groups.length} টি ক্যাটাগরি / গ্রুপের নির্দিষ্ট নিয়মাবলী ও তথ্য
                </p>
              </div>
            </div>

            {/* Category selection tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-100 rounded-xl max-w-full">
              {groups.map((grp, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedGroupTab(idx)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedGroupTab === idx
                      ? "bg-white text-[#1A284A] shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {grp.name || `Group ${idx + 1}`}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Category Content */}
          <div className="bg-slate-50/70 rounded-2xl border border-gray-200/80 p-6 space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-gray-200/60">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#29479B] text-white text-xs font-bold flex items-center justify-center">
                  {selectedGroupTab + 1}
                </span>
                <h4 className="text-xl font-bold text-[#1A284A]">
                  {currentGroup.name || `ক্যাটাগরি ${selectedGroupTab + 1}`}
                </h4>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-100 text-purple-800">
                গ্রুপ স্পেসিফিক তথ্য
              </span>
            </div>

            {/* Group Details */}
            {currentGroup.details ? (
              <div className="space-y-1.5">
                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  বিবরণ ও যোগ্যতা (Details & Eligibility)
                </h5>
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-gray-200/70">
                  {currentGroup.details}
                </p>
              </div>
            ) : null}

            {/* Group Rules & Criteria Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentGroup.rules && (
                <div className="space-y-1.5">
                  <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    গ্রুপের নির্দিষ্ট নিয়মাবলী (Group Rules)
                  </h5>
                  <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-gray-200/70">
                    {currentGroup.rules}
                  </div>
                </div>
              )}

              {currentGroup.criteria && (
                <div className="space-y-1.5">
                  <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    গ্রুপের মূল্যায়ন মানদণ্ড (Group Criteria)
                  </h5>
                  <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-gray-200/70">
                    {currentGroup.criteria}
                  </div>
                </div>
              )}
            </div>

            {/* Group Pictures (up to 2 pictures) */}
            {Array.isArray(currentGroup.pictures) && currentGroup.pictures.length > 0 && (
              <div className="space-y-2 pt-2">
                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#29479B]" />
                  <span>গ্রুপের নমুনা / রেফারেন্স ছবি ({currentGroup.pictures.length} টি ছবি)</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                  {currentGroup.pictures.map((picUrl, pIdx) => (
                    <div
                      key={pIdx}
                      onClick={() => openLightbox(currentGroup.pictures, pIdx)}
                      className="group relative rounded-2xl overflow-hidden bg-gray-100 aspect-video cursor-pointer border border-gray-200 shadow-2xs hover:shadow-md transition-all"
                    >
                      <img
                        src={picUrl}
                        alt={`${currentGroup.name} picture ${pIdx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-xs font-bold text-white bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                          বড় করে দেখুন
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-5 right-5 p-2 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>

          {lightboxList.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                className="absolute left-4 sm:left-8 p-3 text-white bg-black/40 hover:bg-black/70 rounded-full transition-colors cursor-pointer"
                title="Previous"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-4 sm:right-8 p-3 text-white bg-black/40 hover:bg-black/70 rounded-full transition-colors cursor-pointer"
                title="Next"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div
            className="max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage}
              alt="Enlarged view"
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
            />
            {lightboxList.length > 1 && (
              <span className="mt-2 text-xs font-semibold text-white/70">
                {lightboxIndex + 1} of {lightboxList.length}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Admin Edit Modal */}
      {admin && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          maxWidth="max-w-4xl"
          title={`Edit Competition Details: ${competition.name}`}
        >
          <CompetitionForm
            initialData={competition}
            onSubmit={handleAdminUpdate}
            onClose={() => setIsEditModalOpen(false)}
            isLoading={updateCompetitionMutation.isPending}
          />
        </Modal>
      )}
    </div>
  );
}
