"use client";

import { useState, useMemo } from "react";
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
  const [activeGroupModal, setActiveGroupModal] = useState(null); // { group, index }
  const [lightboxImage, setLightboxImage] = useState(null); // url string or null
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxList, setLightboxList] = useState([]); // array of urls
  const [galleryFilter, setGalleryFilter] = useState("all");

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

  // Prepare full linked gallery list with robust fallbacks (top-level hook)
  const linkedGallery = useMemo(() => {
    if (Array.isArray(competition?.linkedGallery) && competition.linkedGallery.length > 0) {
      return competition.linkedGallery;
    }
    const list = [];
    const seen = new Set();
    const add = (url, type, label, sublabel = "") => {
      if (!url || typeof url !== "string") return;
      const t = url.trim();
      if (!t || seen.has(t)) return;
      seen.add(t);
      list.push({ url: t, type, label, sublabel });
    };

    if (competition?.imageUrl) {
      add(competition.imageUrl, "main", "মূল ব্যানার ছবি", "Main Banner");
    }

    if (Array.isArray(competition?.categoryGroups)) {
      competition.categoryGroups.forEach((g, idx) => {
        if (Array.isArray(g.pictures)) {
          g.pictures.forEach((pic, pIdx) => {
            add(pic, "group", `ক্যাটাগরি: ${g.name || `#${idx + 1}`}`, `গ্রুপ ছবি ${pIdx + 1}`);
          });
        }
      });
    }

    if (Array.isArray(competition?.galleryImages)) {
      competition.galleryImages.forEach((img, idx) => {
        add(img, "other", `সংযুক্ত ছবি #${idx + 1}`, "Competition Photo");
      });
    }

    return list;
  }, [competition]);

  const filteredGallery = useMemo(() => {
    if (galleryFilter === "all") return linkedGallery;
    return linkedGallery.filter((item) => item.type === galleryFilter);
  }, [linkedGallery, galleryFilter]);

  const groups =
    Array.isArray(competition?.categoryGroups) && competition.categoryGroups.length > 0
      ? competition.categoryGroups
      : Array.isArray(competition?.categories) && competition.categories.length > 0
      ? competition.categories.map((c) => ({
          name: c,
          details: "",
          criteria: "",
          rules: "",
          pictures: [],
        }))
      : [{ name: competition?.category || "General", details: "", criteria: "", rules: "", pictures: [] }];

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
    const item = imageList[index];
    setLightboxImage(typeof item === "string" ? item : item?.url || "");
  };

  const handleNextImage = () => {
    if (lightboxList.length === 0) return;
    const nextIdx = (lightboxIndex + 1) % lightboxList.length;
    setLightboxIndex(nextIdx);
    const item = lightboxList[nextIdx];
    setLightboxImage(typeof item === "string" ? item : item?.url || "");
  };

  const handlePrevImage = () => {
    if (lightboxList.length === 0) return;
    const prevIdx = (lightboxIndex - 1 + lightboxList.length) % lightboxList.length;
    setLightboxIndex(prevIdx);
    const item = lightboxList[prevIdx];
    setLightboxImage(typeof item === "string" ? item : item?.url || "");
  };

  const handleNextGroup = () => {
    if (!activeGroupModal) return;
    const nextIdx = (activeGroupModal.index + 1) % groups.length;
    setActiveGroupModal({ group: groups[nextIdx], index: nextIdx });
  };

  const handlePrevGroup = () => {
    if (!activeGroupModal) return;
    const prevIdx = (activeGroupModal.index - 1 + groups.length) % groups.length;
    setActiveGroupModal({ group: groups[prevIdx], index: prevIdx });
  };

  const renderFormattedText = (text) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline break-all inline-flex items-center gap-1 font-semibold"
            onClick={(e) => e.stopPropagation()}
          >
            <span>{part}</span>
            <ExternalLink className="w-3 h-3 inline shrink-0" />
          </a>
        );
      }
      return part;
    });
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

  const allCount = linkedGallery.length;
  const mainCount = linkedGallery.filter((i) => i.type === "main").length;
  const groupCount = linkedGallery.filter((i) => i.type === "group").length;
  const posterCount = linkedGallery.filter((i) => i.type === "poster").length;
  const certCount = linkedGallery.filter((i) => i.type === "certificate").length;

  const gallery = linkedGallery.map((item) => item.url);

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

        {/* Section 3: Competition Linked Photos & Media Gallery */}
        {linkedGallery.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#F59E0B] flex items-center justify-center shadow-xs">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#1A284A]">
                    প্রতিযোগিতার ছবি গ্যালারি (Gallery - {linkedGallery.length} Linked Photos)
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    এই প্রতিযোগিতার সাথে যুক্ত সকল ছবি— মূল ব্যানার, ক্যাটাগরি/গ্রুপের ছবি, পোস্টার ও সার্টিফিকেট টেমপ্লেট
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60 self-start sm:self-center flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>স্বয়ংক্রিয়ভাবে সংযুক্ত মিডিয়া</span>
              </span>
            </div>

            {/* Filter Tabs if multiple sources exist */}
            {(mainCount > 0 || groupCount > 0 || posterCount > 0 || certCount > 0) && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <button
                  type="button"
                  onClick={() => setGalleryFilter("all")}
                  className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                    galleryFilter === "all"
                      ? "bg-[#29479B] text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  সকল ছবি ({allCount})
                </button>

                {mainCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setGalleryFilter("main")}
                    className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                      galleryFilter === "main"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }`}
                  >
                    মূল ব্যানার ({mainCount})
                  </button>
                )}

                {groupCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setGalleryFilter("group")}
                    className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                      galleryFilter === "group"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                    }`}
                  >
                    ক্যাটাগরি / গ্রুপ ({groupCount})
                  </button>
                )}

                {posterCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setGalleryFilter("poster")}
                    className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                      galleryFilter === "poster"
                        ? "bg-amber-600 text-white shadow-xs"
                        : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                    }`}
                  >
                    পোস্টার টেমপ্লেট ({posterCount})
                  </button>
                )}

                {certCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setGalleryFilter("certificate")}
                    className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                      galleryFilter === "certificate"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                    }`}
                  >
                    সার্টিফিকেট টেমপ্লেট ({certCount})
                  </button>
                )}
              </div>
            )}

            {/* Gallery Image Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {filteredGallery.map((item, idx) => {
                const isMain = item.type === "main";
                const isGroup = item.type === "group";
                const isPoster = item.type === "poster";
                const isCert = item.type === "certificate";

                return (
                  <div
                    key={idx}
                    onClick={() => openLightbox(filteredGallery.map((g) => g.url), idx)}
                    className="group relative rounded-2xl overflow-hidden bg-gray-100 aspect-4/3 cursor-pointer border border-gray-200/90 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all"
                  >
                    <img
                      src={item.url}
                      alt={item.label || `Competition media ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Source Category Tag */}
                    <div className="absolute top-2 left-2 z-10">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs backdrop-blur-xs ${
                          isMain
                            ? "bg-blue-600/90 text-white"
                            : isGroup
                            ? "bg-purple-600/90 text-white"
                            : isPoster
                            ? "bg-amber-600/90 text-white"
                            : isCert
                            ? "bg-emerald-600/90 text-white"
                            : "bg-black/60 text-white"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2 text-center">
                      <span className="text-xs font-bold text-white bg-black/70 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                        🔍 বড় করে দেখুন
                      </span>
                      {item.sublabel && (
                        <span className="text-[10px] text-white/80 line-clamp-1">
                          {item.sublabel}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 4: Category / Group Breakdown - Card Style Preview with Thumbnails */}
        <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-[#1A284A]">
                  ক্যাটাগরি ও গ্রুপ ভিত্তিক বিস্তারিত (Categories & Groups)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  মোট {groups.length} টি ক্যাটাগরি / গ্রুপ। কার্ডে ক্লিক করে বিস্তারিত নিয়মাবলী ও তথ্য দেখুন
                </p>
              </div>
            </div>

            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/60 self-start sm:self-center flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>{groups.length} টি ক্যাটাগরি কার্ড</span>
            </span>
          </div>

          {/* Category Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {groups.map((grp, idx) => {
              const hasPictures = Array.isArray(grp.pictures) && grp.pictures.length > 0;
              const thumbnail = hasPictures ? grp.pictures[0] : null;

              return (
                <div
                  key={idx}
                  onClick={() => setActiveGroupModal({ group: grp, index: idx })}
                  className="group relative bg-white hover:bg-slate-50/70 rounded-2xl border border-gray-200/90 hover:border-purple-300 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer transform hover:-translate-y-1"
                >
                  {/* Card Thumbnail */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={grp.name || `Group ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1A284A] via-[#29479B] to-purple-800 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
                        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 blur-md pointer-events-none" />
                        <div className="absolute -left-6 -top-6 w-20 h-20 rounded-full bg-purple-500/20 blur-sm pointer-events-none" />

                        <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md text-white flex items-center justify-center mb-2 shadow-inner border border-white/20 group-hover:scale-110 transition-transform">
                          <Layers className="w-6 h-6 text-purple-200" />
                        </div>
                        <span className="text-white font-bold text-sm line-clamp-1 drop-shadow-sm px-2">
                          {grp.name || `গ্রুপ ${idx + 1}`}
                        </span>
                        <span className="text-[11px] text-purple-200/90 mt-0.5">
                          ক্লিক করে বিস্তারিত দেখুন
                        </span>
                      </div>
                    )}

                    {/* Gradient Overlay for photo thumbnails */}
                    {thumbnail && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                    )}

                    {/* Top-left Group Index Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-white/95 text-[#1A284A] shadow-md backdrop-blur-xs border border-white/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                        গ্রুপ #{idx + 1}
                      </span>
                    </div>

                    {/* Top-right Photo Count badge if multiple */}
                    {hasPictures && (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-black/60 text-white backdrop-blur-xs border border-white/20">
                          <Camera className="w-3 h-3" />
                          {grp.pictures.length}
                        </span>
                      </div>
                    )}

                    {/* Bottom overlay title if thumbnail exists */}
                    {thumbnail && (
                      <div className="absolute bottom-2.5 left-3 right-3">
                        <p className="text-xs font-bold text-white/90 line-clamp-1 drop-shadow-sm">
                          {grp.name || `গ্রুপ ${idx + 1}`}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-extrabold text-[#1A284A] text-base group-hover:text-[#29479B] transition-colors line-clamp-1">
                        {grp.name || `ক্যাটাগরি ${idx + 1}`}
                      </h4>

                      {/* Snippet / preview of details */}
                      {grp.details ? (
                        <p className="text-xs text-gray-600 mt-1.5 line-clamp-2 leading-relaxed">
                          {grp.details}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400 mt-1.5 italic">
                          গ্রুপের নিয়মাবলী ও মূল্যায়ন মানদণ্ড দেখুন
                        </p>
                      )}
                    </div>

                    {/* Feature indicator pills */}
                    <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                      {grp.rules && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                          নিয়মাবলী
                        </span>
                      )}
                      {grp.criteria && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                          মূল্যায়ন
                        </span>
                      )}
                      {hasPictures && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">
                          রেফারেন্স ছবি
                        </span>
                      )}
                    </div>

                    {/* Card Footer / Action */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#29479B] group-hover:text-purple-700 transition-colors">
                      <span className="flex items-center gap-1">
                        বিস্তারিত দেখুন
                      </span>
                      <span className="transform group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category / Group Details Modal Popup */}
      {activeGroupModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setActiveGroupModal(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-gray-100 overflow-hidden my-8 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-slate-50 via-purple-50/40 to-slate-50 border-b border-gray-100 flex items-start justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#29479B] text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0">
                  {activeGroupModal.index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      ক্যাটাগরি / গ্রুপ #{activeGroupModal.index + 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-[#1A284A] mt-1">
                    {activeGroupModal.group.name || `গ্রুপ ${activeGroupModal.index + 1}`}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {groups.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevGroup}
                      className="p-2 rounded-xl text-gray-400 hover:text-[#1A284A] hover:bg-gray-100 transition-colors cursor-pointer"
                      title="পূর্ববর্তী গ্রুপ"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextGroup}
                      className="p-2 rounded-xl text-gray-400 hover:text-[#1A284A] hover:bg-gray-100 transition-colors cursor-pointer"
                      title="পরবর্তী গ্রুপ"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setActiveGroupModal(null)}
                  className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer ml-1"
                  title="বন্ধ করুন"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Pictures if available */}
              {Array.isArray(activeGroupModal.group.pictures) &&
                activeGroupModal.group.pictures.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-[#29479B]" />
                      <span>নমুনা / রেফারেন্স ছবি ({activeGroupModal.group.pictures.length} টি)</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeGroupModal.group.pictures.map((pic, pIdx) => (
                        <div
                          key={pIdx}
                          onClick={() => openLightbox(activeGroupModal.group.pictures, pIdx)}
                          className="group relative rounded-2xl overflow-hidden aspect-video bg-gray-100 border border-gray-200 cursor-pointer shadow-xs hover:shadow-md transition-all"
                        >
                          <img
                            src={pic}
                            alt={`${activeGroupModal.group.name} picture ${pIdx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-xs font-bold text-white bg-black/60 px-3 py-1.5 rounded-xl backdrop-blur-xs">
                              বড় করে দেখুন
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Details & Eligibility */}
              {activeGroupModal.group.details && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    <span>বিবরণ ও যোগ্যতা (Details & Eligibility)</span>
                  </h5>
                  <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line bg-purple-50/40 p-4 rounded-2xl border border-purple-100">
                    {renderFormattedText(activeGroupModal.group.details)}
                  </div>
                </div>
              )}

              {/* Rules & Criteria */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeGroupModal.group.rules && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>গ্রুপের নির্দিষ্ট নিয়মাবলী (Group Rules)</span>
                    </h5>
                    <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line bg-blue-50/40 p-4 rounded-2xl border border-blue-100">
                      {renderFormattedText(activeGroupModal.group.rules)}
                    </div>
                  </div>
                )}

                {activeGroupModal.group.criteria && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-4 h-4" />
                      <span>গ্রুপের মূল্যায়ন মানদণ্ড (Group Criteria)</span>
                    </h5>
                    <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100">
                      {renderFormattedText(activeGroupModal.group.criteria)}
                    </div>
                  </div>
                )}
              </div>

              {!activeGroupModal.group.details &&
                !activeGroupModal.group.rules &&
                !activeGroupModal.group.criteria &&
                (!activeGroupModal.group.pictures || activeGroupModal.group.pictures.length === 0) && (
                  <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100 text-gray-500 text-sm">
                    এই ক্যাটাগরি / গ্রুপের জন্য কোনো বিশেষ আলাদা নিয়ম নেই। মূল প্রতিযোগিতার সাধারণ নিয়মাবলী প্রযোজ্য।
                  </div>
                )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-gray-500 font-medium">
                ক্যাটাগরি {activeGroupModal.index + 1} / {groups.length}
              </div>
              <div className="flex items-center gap-2">
                {groups.length > 1 && (
                  <button
                    type="button"
                    onClick={handleNextGroup}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-gray-100 text-[#1A284A] border border-gray-200 transition-colors cursor-pointer"
                  >
                    পরবর্তী ক্যাটাগরি →
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveGroupModal(null)}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#1A284A] hover:bg-[#29479B] text-white transition-colors cursor-pointer shadow-xs"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
