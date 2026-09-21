"use client";
"use no memo";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Trash2,
  Layers,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Info,
  Sliders,
  Calendar,
  Award,
  Gift,
  Tag,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { MultiImageUpload } from "@/components/ui/MultiImageUpload";
import { toast } from "react-toastify";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

const competitionFormSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  description: z.string().optional().default(""),
  refPrefix: z.string().min(1, "Prefix is required").trim(),
  refPadding: z.coerce.number().min(0).max(6).default(0),
  sourceLink: z.string().optional().default(""),
  imageUrl: z.string().optional().default(""),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
  minAge: z.coerce.number().min(0).max(120).default(0),
  maxAge: z.coerce.number().min(0).max(120).default(0),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default(""),
  resultPublishDate: z.string().optional().default(""),
  providesCertificate: z.boolean().default(true),
  firstPrize: z.string().optional().default(""),
  secondPrize: z.string().optional().default(""),
  thirdPrize: z.string().optional().default(""),
  topNPrizes: z.string().optional().default(""),
  allParticipantPrize: z.string().optional().default(""),
  mainRules: z.string().optional().default(""),
  mainCriteria: z.string().optional().default(""),
  galleryImages: z.array(z.string()).optional().default([]),
});

export function CompetitionForm({ initialData, onSubmit, onClose, isLoading }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("basic"); // 'basic' | 'prizes' | 'mainDetails' | 'categoryGroups'

  // Fetch dynamic topics directly from database
  const { data: dbTopics = [] } = useQuery({
    queryKey: ["competition-topics"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/competitions/topics");
      return data?.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // Topic selection and other custom topics state
  const getInitialTopicState = () => {
    const allExisting =
      Array.isArray(initialData?.topicTypes) && initialData.topicTypes.length > 0
        ? initialData.topicTypes
        : initialData?.topicType
        ? [initialData.topicType]
        : [];

    if (allExisting.length === 0) {
      return { selected: dbTopics[0] || "", custom: "" };
    }

    const first = allExisting[0];
    if (dbTopics.includes(first)) {
      const remaining = allExisting.slice(1);
      return { selected: first, custom: remaining.join(", ") };
    }

    return { selected: "__NEW_TOPIC__", custom: allExisting.join(", ") };
  };

  const [topicSelect, setTopicSelect] = useState(() => getInitialTopicState().selected);
  const [customTopicInput, setCustomTopicInput] = useState(() => getInitialTopicState().custom);

  // Initialize Category Groups
  const getInitialCategoryGroups = () => {
    if (initialData?.categoryGroups && Array.isArray(initialData.categoryGroups) && initialData.categoryGroups.length > 0) {
      return initialData.categoryGroups.map((cg) => ({
        name: cg.name || "",
        details: cg.details || "",
        criteria: cg.criteria || "",
        rules: cg.rules || "",
        pictures: Array.isArray(cg.pictures) ? cg.pictures : [],
      }));
    }

    if (initialData?.categories && Array.isArray(initialData.categories) && initialData.categories.length > 0) {
      return initialData.categories.map((cat) => ({
        name: typeof cat === "string" ? cat : cat.name || "General",
        details: "",
        criteria: "",
        rules: "",
        pictures: [],
      }));
    }

    if (initialData?.category) {
      return [
        {
          name: initialData.category,
          details: "",
          criteria: "",
          rules: "",
          pictures: [],
        },
      ];
    }

    return [
      {
        name: "General",
        details: "",
        criteria: "",
        rules: "",
        pictures: [],
      },
    ];
  };

  const [categoryGroups, setCategoryGroups] = useState(getInitialCategoryGroups);
  const [groupErrors, setGroupErrors] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(competitionFormSchema),
    mode: "onChange",
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      refPrefix: initialData?.refPrefix || "",
      refPadding: initialData?.refPadding ?? 0,
      sourceLink: initialData?.sourceLink || "",
      imageUrl: initialData?.imageUrl || "",
      status: initialData?.status || "draft",
      minAge: initialData?.minAge ?? 0,
      maxAge: initialData?.maxAge ?? 0,
      startDate: initialData?.startDate || "",
      endDate: initialData?.endDate || "",
      resultPublishDate: initialData?.resultPublishDate || "",
      providesCertificate: initialData?.providesCertificate !== false,
      firstPrize: initialData?.prizes?.firstPrize || "",
      secondPrize: initialData?.prizes?.secondPrize || "",
      thirdPrize: initialData?.prizes?.thirdPrize || "",
      topNPrizes: initialData?.prizes?.topNPrizes || "",
      allParticipantPrize: initialData?.prizes?.allParticipantPrize || "",
      mainRules: initialData?.mainRules || "",
      mainCriteria: initialData?.mainCriteria || "",
      galleryImages: initialData?.galleryImages || [],
    },
  });

  // Sync initialData or dbTopics when loaded
  useEffect(() => {
    if (initialData) {
      const initialGroups = getInitialCategoryGroups();
      setCategoryGroups(initialGroups);

      const topicState = getInitialTopicState();
      setTopicSelect(topicState.selected);
      setCustomTopicInput(topicState.custom);

      reset({
        name: initialData.name || "",
        description: initialData.description || "",
        refPrefix: initialData.refPrefix || "",
        refPadding: initialData.refPadding ?? 0,
        sourceLink: initialData.sourceLink || "",
        imageUrl: initialData.imageUrl || "",
        status: initialData.status || "draft",
        minAge: initialData.minAge ?? 0,
        maxAge: initialData.maxAge ?? 0,
        startDate: initialData.startDate || "",
        endDate: initialData.endDate || "",
        resultPublishDate: initialData.resultPublishDate || "",
        providesCertificate: initialData.providesCertificate !== false,
        firstPrize: initialData.prizes?.firstPrize || "",
        secondPrize: initialData.prizes?.secondPrize || "",
        thirdPrize: initialData.prizes?.thirdPrize || "",
        topNPrizes: initialData.prizes?.topNPrizes || "",
        allParticipantPrize: initialData.prizes?.allParticipantPrize || "",
        mainRules: initialData.mainRules || "",
        mainCriteria: initialData.mainCriteria || "",
        galleryImages: initialData.galleryImages || [],
      });
    } else if ((!topicSelect || topicSelect === "") && dbTopics.length > 0) {
      setTopicSelect(dbTopics[0]);
    }
  }, [initialData, dbTopics, reset]);

  // Category group operations
  const handleAddCategoryGroup = () => {
    setCategoryGroups((prev) => [
      ...prev,
      {
        name: "",
        details: "",
        criteria: "",
        rules: "",
        pictures: [],
      },
    ]);
  };

  const handleRemoveCategoryGroup = (index) => {
    if (categoryGroups.length <= 1) {
      toast.warning("A competition must have at least one category or group.");
      return;
    }
    setCategoryGroups((prev) => prev.filter((_, i) => i !== index));
    setGroupErrors((prev) => prev.filter((i) => i !== index));
  };

  const handleUpdateCategoryGroupField = (index, field, value) => {
    setCategoryGroups((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });

    if (field === "name" && value.trim()) {
      setGroupErrors((prev) => prev.filter((i) => i !== index));
    }
  };

  const handleFormSubmit = async (data) => {
    // Parse topic types
    let finalTopicTypes = [];
    if (topicSelect === "__NEW_TOPIC__" || topicSelect === "অন্যান্য (Other)") {
      const parts = customTopicInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (parts.length === 0) {
        toast.error("অনুগ্রহ করে নতুন বিষয় লিখুন (Please enter topic name)");
        return;
      }
      finalTopicTypes = parts;
    } else if (topicSelect) {
      finalTopicTypes = [topicSelect];
      if (customTopicInput.trim()) {
        const additional = customTopicInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
        finalTopicTypes = Array.from(new Set([...finalTopicTypes, ...additional]));
      }
    } else if (dbTopics.length > 0) {
      finalTopicTypes = [dbTopics[0]];
    } else {
      finalTopicTypes = ["সাধারণ (General)"];
    }
    const primaryTopic = finalTopicTypes[0] || "সাধারণ (General)";

    // Validate category groups
    const emptyIndices = [];
    const cleanedGroups = categoryGroups.map((group, idx) => {
      const trimmedName = (group.name || "").trim();
      if (!trimmedName) emptyIndices.push(idx);
      return {
        ...group,
        name: trimmedName,
        details: (group.details || "").trim(),
        criteria: (group.criteria || "").trim(),
        rules: (group.rules || "").trim(),
        pictures: Array.isArray(group.pictures) ? group.pictures.slice(0, 2) : [],
      };
    });

    if (emptyIndices.length > 0) {
      setGroupErrors(emptyIndices);
      setActiveTab("categoryGroups");
      toast.error("Please provide a name for each category / group.");
      return;
    }

    if (cleanedGroups.length === 0) {
      toast.error("At least one category or group is required.");
      return;
    }

    const payload = {
      ...data,
      refPrefix: data.refPrefix.toUpperCase().trim(),
      categoryGroups: cleanedGroups,
      categories: cleanedGroups.map((g) => g.name),
      category: cleanedGroups[0]?.name || "General",
      topicType: primaryTopic,
      topicTypes: finalTopicTypes,
      minAge: Number(data.minAge) || 0,
      maxAge: Number(data.maxAge) || 0,
      galleryImages: Array.isArray(data.galleryImages) && data.galleryImages.length > 0 ? data.galleryImages : (initialData?.galleryImages || []),
      startDate: data.startDate || "",
      endDate: data.endDate || "",
      resultPublishDate: data.resultPublishDate || "",
      providesCertificate: Boolean(data.providesCertificate),
      prizes: {
        firstPrize: (data.firstPrize || "").trim(),
        secondPrize: (data.secondPrize || "").trim(),
        thirdPrize: (data.thirdPrize || "").trim(),
        topNPrizes: (data.topNPrizes || "").trim(),
        allParticipantPrize: (data.allParticipantPrize || "").trim(),
      },
    };

    await onSubmit(payload);
    queryClient.invalidateQueries({ queryKey: ["competition-topics"] });
    queryClient.invalidateQueries({ queryKey: ["public-competitions"] });
    if (onClose) onClose();
  };

  const galleryImages = watch("galleryImages") || [];
  const providesCertificate = watch("providesCertificate");
  const formMainImg = watch("imageUrl");
  const formGroups = watch("categoryGroups") || [];

  // Automatically aggregate all pictures linked to this competition
  const allLinkedItems = useMemo(() => {
    const list = [];
    const seen = new Set();
    const add = (url, source, type) => {
      if (!url || typeof url !== "string") return;
      const t = url.trim();
      if (!t || seen.has(t)) return;
      seen.add(t);
      list.push({ url: t, source, type });
    };

    if (formMainImg) {
      add(formMainImg, "মূল ব্যানার ছবি (Main Banner)", "main");
    }

    formGroups.forEach((g, gIdx) => {
      const gName = g?.name || `গ্রুপ #${gIdx + 1}`;
      if (Array.isArray(g?.pictures)) {
        g.pictures.forEach((pic, pIdx) => {
          add(pic, `ক্যাটাগরি: ${gName} (ছবি ${pIdx + 1})`, "group");
        });
      }
    });

    if (Array.isArray(initialData?.linkedGallery)) {
      initialData.linkedGallery.forEach((item) => {
        add(item.url, item.label || "টেমপ্লেট ব্যাকগ্রাউন্ড", item.type);
      });
    }

    if (Array.isArray(initialData?.galleryImages)) {
      initialData.galleryImages.forEach((url, idx) => {
        add(url, `সংযুক্ত ছবি #${idx + 1}`, "other");
      });
    }

    return list;
  }, [formMainImg, formGroups, initialData]);

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-5 max-h-[80vh] overflow-y-auto pr-1 text-left"
    >
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 bg-gray-50/70 p-1.5 rounded-xl gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("basic")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "basic"
              ? "bg-white text-[#1A284A] shadow-xs"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <Sliders className="w-4 h-4 text-[#29479B]" />
          <span>Basic & Schedule</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("prizes")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "prizes"
              ? "bg-white text-[#1A284A] shadow-xs"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <Award className="w-4 h-4 text-[#F59E0B]" />
          <span>Prizes & Awards</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("mainDetails")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "mainDetails"
              ? "bg-white text-[#1A284A] shadow-xs"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <FileText className="w-4 h-4 text-[#29479B]" />
          <span>Rules & Auto Gallery ({allLinkedItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("categoryGroups")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "categoryGroups"
              ? "bg-white text-[#1A284A] shadow-xs"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <Layers className="w-4 h-4 text-[#29479B]" />
          <span>Groups ({categoryGroups.length})</span>
        </button>
      </div>

      {/* TAB 1: BASIC INFO, TOPIC & SCHEDULE */}
      {activeTab === "basic" && (
        <div className="space-y-4 pt-1">
          <Input
            label="Competition Name *"
            placeholder="e.g. National Drawing & Poetry Competition 2026"
            error={errors.name?.message}
            {...register("name")}
          />

          {/* Topic Type Dropdown & Custom Other Field */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-gray-200/80 space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#29479B]" />
              <label className="text-xs font-bold text-[#1A284A] uppercase tracking-wider">
                Competition Topic Type (প্রতিযোগিতার বিষয় / ধরন) *
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Select Topic from Database Menu
                </label>
                <select
                  value={topicSelect}
                  onChange={(e) => setTopicSelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm font-semibold text-[#1A284A] focus:outline-none focus:ring-2 focus:ring-[#29479B]"
                >
                  {dbTopics.length === 0 ? (
                    <option value="" disabled>
                      ডাটাবেজ থেকে বিষয় লোড হচ্ছে...
                    </option>
                  ) : (
                    dbTopics.map((top) => (
                      <option key={top} value={top}>
                        {top}
                      </option>
                    ))
                  )}
                  <option value="__NEW_TOPIC__">
                    ➕ অন্যান্য / নতুন বিষয় যুক্ত করুন (Add New Topic / Other)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {topicSelect === "__NEW_TOPIC__" || topicSelect === "অন্যান্য (Other)"
                    ? "Add Topics (কমা দিয়ে একাধিক লিখতে পারেন) *"
                    : "Additional Topics (ঐচ্ছিক - কমা দিয়ে একাধিক)"}
                </label>
                <input
                  type="text"
                  value={customTopicInput}
                  onChange={(e) => setCustomTopicInput(e.target.value)}
                  placeholder={
                    topicSelect === "__NEW_TOPIC__" || topicSelect === "অন্যান্য (Other)"
                      ? "e.g. বিতর্ক, নাটিকা, সংগীত, হস্তলিপি..."
                      : "e.g. বিতর্ক, সংগীত (কমা দিয়ে আলাদা করুন)"
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-[#1A284A] focus:outline-none focus:ring-2 focus:ring-[#29479B]"
                />
              </div>
            </div>
            <p className="text-[11px] text-gray-500">
              💡 ড্রপডাউনের বিষয়গুলো সরাসরি ডাটাবেজ থেকে সংরক্ষিত তালিকা। নতুন বিষয় লিখলে তা স্বয়ংক্রিয়ভাবে ডাটাবেজে যুক্ত হবে এবং পরবর্তীতে ড্রপডাউনে পাওয়া যাবে।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Reference Prefix *"
              placeholder="e.g. NSO2026"
              error={errors.refPrefix?.message}
              {...register("refPrefix")}
            />

            <Input
              label="Ref Padding (0-6)"
              type="number"
              min="0"
              max="6"
              error={errors.refPadding?.message}
              {...register("refPadding")}
            />

            <Select
              label="Status"
              options={[
                { label: "Active (সক্রিয় / দৃশ্যমান)", value: "active" },
                { label: "Draft (খসড়া)", value: "draft" },
                { label: "Archived (সংরক্ষিত / সমাপ্ত)", value: "archived" },
              ]}
              error={errors.status?.message}
              {...register("status")}
            />
          </div>

          {/* Age Range Setting */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-gray-200/80 space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#29479B]" />
              <label className="text-xs font-bold text-[#1A284A] uppercase tracking-wider">
                Age Eligibility Range (বয়সসীমা)
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Minimum Age (সর্বনিম্ন বয়স, e.g. 5)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0 (no limit)"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-[#1A284A] focus:outline-none focus:ring-2 focus:ring-[#29479B]"
                  {...register("minAge")}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Maximum Age (সর্বোচ্চ বয়স, e.g. 14)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0 (no limit)"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-[#1A284A] focus:outline-none focus:ring-2 focus:ring-[#29479B]"
                  {...register("maxAge")}
                />
              </div>
            </div>
            <p className="text-[11px] text-gray-500">
              💡 ব্যবহারকারীরা সাইটে বয়স অনুযায়ী প্রতিযোগিতা ফিল্টার করতে পারবে (০ দিলে বয়স উন্মুক্ত থাকবে)।
            </p>
          </div>

          {/* Dates & Timeline Section */}
          <div className="p-4 bg-blue-50/40 rounded-2xl border border-blue-100 space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#29479B]" />
              <label className="text-xs font-bold text-[#1A284A] uppercase tracking-wider">
                Schedule & Timeline (সময়সীমা ও ফলাফল প্রকাশের তারিখ)
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Start Date (শুরুর তারিখ)
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-[#1A284A] focus:outline-none focus:ring-2 focus:ring-[#29479B]"
                  {...register("startDate")}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  End Date (শেষের তারিখ)
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-[#1A284A] focus:outline-none focus:ring-2 focus:ring-[#29479B]"
                  {...register("endDate")}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Result Publish Date (ফলাফল প্রকাশ)
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-[#1A284A] focus:outline-none focus:ring-2 focus:ring-[#29479B]"
                  {...register("resultPublishDate")}
                />
              </div>
            </div>
          </div>

          {/* Certificate Provision Option */}
          <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100 flex items-start gap-3">
            <input
              type="checkbox"
              id="providesCertificate"
              className="mt-1 w-4 h-4 rounded text-[#29479B] focus:ring-[#29479B] cursor-pointer"
              {...register("providesCertificate")}
            />
            <div>
              <label
                htmlFor="providesCertificate"
                className="text-xs sm:text-sm font-bold text-[#1A284A] cursor-pointer block"
              >
                Provide Certificate for this Competition? (সার্টিফিকেট প্রদান করা হবে কি না?)
              </label>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {providesCertificate
                  ? "✓ এই প্রতিযোগিতার জন্য অংশগ্রহণকারী ও বিজয়ীদের ডিজিটাল সার্টিফিকেট প্রদান ও যাচাই সক্রিয় থাকবে।"
                  : "✗ এই প্রতিযোগিতায় কোনো সার্টিফিকেট প্রদান করা হবে না (সার্টিফিকেট ডাউনলোড বাটন বন্ধ থাকবে)।"}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Short Description / Overview
            </label>
            <textarea
              rows={3}
              placeholder="Brief summary displayed on competition cards and hero banner..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-[#1A284A] focus:outline-none focus:ring-2 focus:ring-[#29479B]"
              {...register("description")}
            />
          </div>

          <Input
            label="Source Link (Optional Website or Social Link)"
            placeholder="https://facebook.com/events/nso2026"
            error={errors.sourceLink?.message}
            {...register("sourceLink")}
          />

          <ImageUpload
            label="Competition Cover / Main Banner Image"
            value={watch("imageUrl")}
            onChange={(url) => setValue("imageUrl", url, { shouldValidate: true })}
            error={errors.imageUrl?.message}
            helpText="Upload a banner image or paste Facebook photo link to host permanently on ImgBB / Postimages"
          />
        </div>
      )}

      {/* TAB 2: PRIZES & AWARDS */}
      {activeTab === "prizes" && (
        <div className="space-y-4 pt-1">
          <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-1">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#F59E0B]" />
              <h4 className="text-sm font-bold text-[#1A284A]">
                Prizes & Awards Breakdown (পুরস্কার ও সম্মাননা)
              </h4>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Define the prizes for 1st, 2nd, 3rd, top N ranks, and participation tokens for all participants.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <span className="text-base">🥇</span>
                <span>First Prize / Champion (১ম পুরস্কার / চ্যাম্পিয়ন)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. ৳১০,০০০ প্রাইজমানি + গোল্ড মেডেল + চ্যাম্পিয়ন ট্রফি"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-sm text-[#1A284A] focus:outline-none focus:ring-2 focus:ring-[#29479B]"
                {...register("firstPrize")}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <span className="text-base">🥈</span>
                <span>Second Prize / 1st Runner-up (২য় পুরস্কার / ১ম রানার্স-আপ)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. ৳৫,০০০ প্রাইজমানি + সিলভার মেডেল + ট্রফি"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-sm text-[#1A284A] focus:outline-none focus:ring-2 focus:ring-[#29479B]"
                {...register("secondPrize")}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <span className="text-base">🥉</span>
                <span>Third Prize / 2nd Runner-up (৩য় পুরস্কার / ২য় রানার্স-আপ)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. ৳২,০০০ প্রাইজমানি + ব্রোঞ্জ মেডেল + ট্রফি"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-sm text-[#1A284A] focus:outline-none focus:ring-2 focus:ring-[#29479B]"
                {...register("thirdPrize")}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <span className="text-base">🎖️</span>
                <span>Top N / Special Awards (শীর্ষ প্রতিযোগীদের বিশেষ পুরস্কার)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. শীর্ষ ১০ জনের জন্য বিশেষ মেডেল, বই এবং ক্রেস্ট"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-sm text-[#1A284A] focus:outline-none focus:ring-2 focus:ring-[#29479B]"
                {...register("topNPrizes")}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <span className="text-base">🎁</span>
                <span>All Participants Prize / Gift (সকল অংশগ্রহণকারীর পুরস্কার ও উপহার)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. প্রতিটি অংশগ্রহণকারীর জন্য ডিজিটাল ই-সার্টিফিকেট, ব্যাজ এবং শিক্ষণীয় ই-বুক"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-sm text-[#1A284A] focus:outline-none focus:ring-2 focus:ring-[#29479B]"
                {...register("allParticipantPrize")}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MAIN RULES, CRITERIA & GALLERY */}
      {activeTab === "mainDetails" && (
        <div className="space-y-5 pt-1">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-gray-800">
                Main Rules (প্রতিযোগিতার মূল নিয়মাবলী)
              </label>
              <span className="text-[11px] text-gray-400">
                You can write bullet points or paragraphs
              </span>
            </div>
            <textarea
              rows={5}
              placeholder="Enter general competition rules, deadlines, submission guidelines, misconduct rules, etc. (e.g. 1. Participants must carry ID card... 2. Online submission deadline is...)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-[#1A284A] focus:outline-none focus:ring-2 focus:ring-[#29479B]"
              {...register("mainRules")}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-gray-800">
                Main Criteria & Evaluation (মূল মূল্যায়ন ও যোগ্যতার মানদণ্ড)
              </label>
              <span className="text-[11px] text-gray-400">Scoring & eligibility standards</span>
            </div>
            <textarea
              rows={5}
              placeholder="Enter judging criteria, marks distribution, eligibility rules (e.g. Originality: 30%, Technique: 40%, Presentation: 30%)..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-[#1A284A] focus:outline-none focus:ring-2 focus:ring-[#29479B]"
              {...register("mainCriteria")}
            />
          </div>

          {/* Auto-Linked Pictures Gallery Showcase */}
          <div className="p-5 bg-gradient-to-br from-blue-50/70 to-slate-50 rounded-2xl border border-blue-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-blue-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#29479B] text-white flex items-center justify-center shadow-xs">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#1A284A]">
                    স্বয়ংক্রিয় ছবি গ্যালারি (Auto-Linked Competition Gallery)
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    গ্যালারিতে অতিরিক্ত ছবি আপলোড করার প্রয়োজন নেই।
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-[#29479B] bg-blue-100/90 px-3 py-1 rounded-full border border-blue-200/80 self-start sm:self-auto">
                মোট {allLinkedItems.length} টি ছবি সংযুক্ত
              </span>
            </div>

            <div className="text-xs text-slate-600 bg-white/90 p-3 rounded-xl border border-blue-100/80 leading-relaxed shadow-2xs">
              💡 <strong>স্বয়ংক্রিয় ছবির সংযোগ ব্যবস্থা:</strong> এই প্রতিযোগিতার সাথে যে কোনোভাবে যুক্ত সকল ছবি যেমন— 
              <strong> মূল ব্যানার কভার ছবি</strong>, <strong>সকল ক্যাটাগরি বা গ্রুপের নমুনা/রেফারেন্স ছবি</strong>, এবং এই প্রতিযোগিতার জন্য সিস্টেমে আপলোডকৃত 
              <strong> পোস্টার টেমপ্লেট</strong> ও <strong>সার্টিফিকেট টেমপ্লেট</strong> স্বয়ংক্রিয়ভাবে গ্যালারিতে অন্তর্ভুক্ত হবে।
            </div>

            {allLinkedItems.length > 0 ? (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold text-gray-700 block">
                  বর্তমানে সংযুক্ত ছবি সমূহের প্রিভিউ ({allLinkedItems.length}):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                  {allLinkedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="group relative rounded-xl overflow-hidden border border-gray-200 bg-white shadow-2xs aspect-square"
                    >
                      <img
                        src={item.url}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-black/75 backdrop-blur-2xs px-1.5 py-1 text-center">
                        <span className="text-[9px] font-semibold text-white truncate block">
                          {item.source}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-amber-800 bg-amber-50/80 p-3 rounded-xl border border-amber-200/80">
                ℹ️ এখনো কোনো ছবি সংযুক্ত হয়নি। &quot;Basic & Schedule&quot; ট্যাবে মূল কভার ছবি অথবা &quot;Groups&quot; ট্যাবে ক্যাটাগরির ছবি আপলোড করলে সেগুলি স্বয়ংক্রিয়ভাবে এখানে এবং পাবলিক গ্যালারিতে দেখাবে।
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CATEGORY / GROUP DETAILS */}
      {activeTab === "categoryGroups" && (
        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div>
              <h4 className="text-xs font-bold text-[#1A284A]">
                Categories / Groups (ক্যাটাগরি বা গ্রুপ সমূহ)
              </h4>
              <p className="text-[11px] text-gray-500">
                Add specific details, rules, criteria, and up to 2 pictures for each category/group
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={handleAddCategoryGroup}
              className="gap-1 border-blue-200 text-[#29479B] hover:bg-blue-50 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Category/Group</span>
            </Button>
          </div>

          <div className="space-y-4">
            {categoryGroups.map((group, idx) => {
              const hasError = groupErrors.includes(idx);
              const groupPics = Array.isArray(group.pictures) ? group.pictures : [];

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    hasError
                      ? "border-red-300 bg-red-50/20"
                      : "border-gray-200/90 bg-slate-50/60 hover:border-gray-300"
                  }`}
                >
                  {/* Group Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200/60 mb-3 gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="w-6 h-6 rounded-md bg-[#29479B] text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={group.name}
                          onChange={(e) =>
                            handleUpdateCategoryGroupField(idx, "name", e.target.value)
                          }
                          placeholder={`Category / Group Name * (e.g. Group A / Class 1-3)`}
                          className={`w-full px-3 py-1.5 rounded-lg border text-sm font-bold text-[#1A284A] bg-white transition-all ${
                            hasError
                              ? "border-red-400 ring-2 ring-red-100"
                              : "border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#29479B]"
                          }`}
                        />
                        {hasError && (
                          <span className="text-[10px] text-red-500 font-semibold block mt-0.5">
                            Category/group name is required
                          </span>
                        )}
                      </div>
                    </div>

                    {categoryGroups.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCategoryGroup(idx)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Remove this group"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Group Detailed Fields */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Category Details & Eligibility
                      </label>
                      <textarea
                        rows={2}
                        value={group.details}
                        onChange={(e) =>
                          handleUpdateCategoryGroupField(idx, "details", e.target.value)
                        }
                        placeholder="Details for this category (e.g. Age 5-8 years, class limits, syllabus, theme)..."
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs text-[#1A284A] focus:outline-none focus:ring-2 focus:ring-[#29479B]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          Group Rules
                        </label>
                        <textarea
                          rows={2}
                          value={group.rules}
                          onChange={(e) =>
                            handleUpdateCategoryGroupField(idx, "rules", e.target.value)
                          }
                          placeholder="Specific rules for this group (e.g. 40 minutes time limit, standard paper size)..."
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs text-[#1A284A] focus:outline-none focus:ring-2 focus:ring-[#29479B]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          Group Criteria & Evaluation
                        </label>
                        <textarea
                          rows={2}
                          value={group.criteria}
                          onChange={(e) =>
                            handleUpdateCategoryGroupField(idx, "criteria", e.target.value)
                          }
                          placeholder="Judging criteria for this group (e.g. Creativity: 50%, Neatness: 50%)..."
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs text-[#1A284A] focus:outline-none focus:ring-2 focus:ring-[#29479B]"
                        />
                      </div>
                    </div>

                    {/* Category Pictures (Up to 2 pictures) */}
                    <div className="pt-1">
                      <MultiImageUpload
                        label={`Pictures for ${group.name || `Category ${idx + 1}`} (Max 2)`}
                        value={groupPics}
                        onChange={(pics) =>
                          handleUpdateCategoryGroupField(idx, "pictures", pics)
                        }
                        maxImages={2}
                        helpText="Upload up to 2 reference or sample photos for this specific category"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Form Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          Topic: <strong className="text-[#29479B]">{topicSelect}</strong> • {categoryGroups.length} Groups • Certificates:{" "}
          <strong className={providesCertificate ? "text-emerald-600" : "text-amber-600"}>
            {providesCertificate ? "Yes" : "No"}
          </strong>
        </div>
        <div className="flex gap-2">
          {onClose && (
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
          )}
          <Button type="submit" variant="primary" disabled={isLoading} className="shadow-sm">
            {isLoading ? "Saving..." : initialData ? "Update Competition" : "Create Competition"}
          </Button>
        </div>
      </div>
    </form>
  );
}
