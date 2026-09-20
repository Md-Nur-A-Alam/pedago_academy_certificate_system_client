"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  UploadCloud,
  Download,
  Sparkles,
  Award,
  Layers,
  Check,
  Circle,
  Square,
  RectangleVertical,
  Image as ImageIcon,
  User,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Eye,
  Tag,
  Bold,
  Italic,
  Type,
  Lock,
  Unlock,
  ShieldCheck,
  AlertCircle,
  Search,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import apiClient from "@/lib/api-client";
import { toast } from "react-toastify";
import { PosterPhotoCropper } from "@/features/posters/PosterPhotoCropper";
import {
  getCroppedImg,
  generateCompositePoster,
} from "@/features/posters/posterCanvasUtils";
import {
  FONT_OPTIONS,
  parseStyleBooleans,
  serializeStyleString,
} from "@/lib/fontConstants";

const FALLBACK_POSTER_BG =
  "https://i.ibb.co/yn2fx3J0/istockphoto-2162394672-612x612.jpg";

export default function PostersPage() {
  // Competitions state
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState("");
  const [isLoadingCompetitions, setIsLoadingCompetitions] = useState(true);

  // Poster type state: 'participant' | 'winner'
  const [posterType, setPosterType] = useState("participant");

  // Winner phone verification state
  const [winnerPhone, setWinnerPhone] = useState("");
  const [isVerifyingWinner, setIsVerifyingWinner] = useState(false);
  const [verifiedWinner, setVerifiedWinner] = useState(null);
  const [winnerVerifyError, setWinnerVerifyError] = useState("");

  // Templates state
  const [templates, setTemplates] = useState([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);

  // User uploaded image state
  const [uploadedImageSrc, setUploadedImageSrc] = useState(null);
  const [frameShape, setFrameShape] = useState("circle"); // 'circle' | 'rounded' | 'rectangle'

  // Cropper interactive state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedPreviewUrl, setCroppedPreviewUrl] = useState(null);

  // User details for text zones (Name, etc.)
  const [userName, setUserName] = useState("");

  // Personalized typography state
  const [customFont, setCustomFont] = useState("Montserrat");
  const [customSize, setCustomSize] = useState(28);
  const [isBold, setIsBold] = useState(true);
  const [isItalic, setIsItalic] = useState(false);
  const [customColor, setCustomColor] = useState("#FFFFFF");

  // Download state
  const [isDownloading, setIsDownloading] = useState(false);

  // Responsive Canvas container scaling for live preview
  const [containerWidth, setContainerWidth] = useState(480);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const verifyInputRef = useRef(null);

  // 1. Fetch available competitions
  useEffect(() => {
    let isMounted = true;
    const loadCompetitions = async () => {
      try {
        const { data } = await apiClient.get("/api/competitions");
        if (isMounted && data?.data) {
          setCompetitions(data.data);
          if (data.data.length > 0 && !selectedCompetitionId) {
            setSelectedCompetitionId(data.data[0]._id);
          }
        }
      } catch (err) {
        console.warn("Could not load competitions:", err);
      } finally {
        if (isMounted) setIsLoadingCompetitions(false);
      }
    };
    loadCompetitions();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch available poster templates
  useEffect(() => {
    let isMounted = true;
    const loadTemplates = async () => {
      try {
        const { data } = await apiClient.get("/api/posters/templates");
        if (isMounted && data?.data) {
          setTemplates(data.data);
        }
      } catch (err) {
        console.warn("Could not load poster templates, using fallback:", err);
      } finally {
        if (isMounted) setIsLoadingTemplates(false);
      }
    };
    loadTemplates();
    return () => {
      isMounted = false;
    };
  }, []);

  // 3. Dynamically resolve activeTemplate based on selectedCompetitionId and posterType
  const activeTemplate = useMemo(() => {
    const selectedComp = competitions.find(
      (c) => c._id === selectedCompetitionId
    );
    const compName = selectedComp?.name || "Pedago Milestone Event";

    if (!templates || templates.length === 0) {
      return {
        backgroundImageUrl: FALLBACK_POSTER_BG,
        photoZone: { x: 50, y: 45, w: 38, h: 38, shape: "circle" },
        textZones: [
          {
            key: "name",
            x: 50,
            y: 80,
            font: "Montserrat",
            style: "bold",
            size: 28,
            color: "#FFFFFF",
            align: "center",
          },
        ],
        competitionId: { name: compName, _id: selectedCompetitionId },
        type: posterType,
      };
    }

    // 1. Exact match: both competitionId and posterType match
    const exactMatch = templates.find(
      (t) =>
        (t.competitionId?._id === selectedCompetitionId ||
          t.competitionId === selectedCompetitionId) &&
        t.type === posterType
    );
    if (exactMatch) return exactMatch;

    // 2. Fallback: match by competitionId
    const compMatch = templates.find(
      (t) =>
        t.competitionId?._id === selectedCompetitionId ||
        t.competitionId === selectedCompetitionId
    );
    if (compMatch) return compMatch;

    // 3. Fallback: match by type
    const typeMatch = templates.find((t) => t.type === posterType);
    if (typeMatch) return typeMatch;

    // 4. Default fallback template
    return {
      backgroundImageUrl: FALLBACK_POSTER_BG,
      photoZone: { x: 50, y: 45, w: 38, h: 38, shape: "circle" },
      textZones: [
        {
          key: "name",
          x: 50,
          y: 80,
          font: "Montserrat",
          style: "bold",
          size: 28,
          color: "#FFFFFF",
          align: "center",
        },
      ],
      competitionId: { name: compName, _id: selectedCompetitionId },
      type: posterType,
    };
  }, [templates, selectedCompetitionId, posterType, competitions]);

  // Sync frame shape when active template updates
  useEffect(() => {
    if (activeTemplate?.photoZone?.shape) {
      const sh = activeTemplate.photoZone.shape;
      setFrameShape(
        sh === "square" || sh === "rounded"
          ? "rounded"
          : sh === "rectangle"
          ? "rectangle"
          : "circle"
      );
    }
  }, [activeTemplate]);

  // Sync typography defaults with template
  useEffect(() => {
    const tmplNameZone = activeTemplate?.textZones?.find(
      (z) => z.key === "name"
    );
    if (tmplNameZone) {
      if (tmplNameZone.font) setCustomFont(tmplNameZone.font);
      if (tmplNameZone.size) setCustomSize(tmplNameZone.size);
      if (tmplNameZone.style) {
        const { isBold: b, isItalic: it } = parseStyleBooleans(
          tmplNameZone.style
        );
        setIsBold(b);
        setIsItalic(it);
      }
      if (tmplNameZone.color) setCustomColor(tmplNameZone.color);
    }
  }, [activeTemplate]);

  // Handle Competition Change
  const handleCompetitionChange = (newCompId) => {
    setSelectedCompetitionId(newCompId);
    // If already verified winner belongs to another competition, clear verification
    if (verifiedWinner) {
      const verifiedCompId =
        verifiedWinner.competition?._id || verifiedWinner.competition;
      if (verifiedCompId !== newCompId) {
        setVerifiedWinner(null);
        setWinnerVerifyError("");
      }
    }
  };

  // Handle Poster Type Change
  const handlePosterTypeChange = (newType) => {
    setPosterType(newType);
    setWinnerVerifyError("");
  };

  // Winner Verification Logic via Phone Number (or last 6 digits)
  const handleVerifyWinner = async (e) => {
    if (e) e.preventDefault();
    const query = winnerPhone.trim();
    if (!query) {
      toast.warning("অনুগ্রহ করে আপনার ফোন নম্বর বা শেষ ৬ ডিজিট লিখুন");
      return;
    }

    setIsVerifyingWinner(true);
    setWinnerVerifyError("");
    try {
      const { data } = await apiClient.get("/api/participants/verify", {
        params: {
          query,
          competitionId: selectedCompetitionId || undefined,
        },
      });

      // Unified results array check
      const results = Array.isArray(data?.data?.results)
        ? data.data.results
        : Array.isArray(data?.data)
        ? data.data
        : data?.data?.participant
        ? [data.data]
        : [];

      if (results.length === 0) {
        setWinnerVerifyError(
          "এই ফোন নম্বরের জন্য কোনো রেকর্ড পাওয়া যায়নি। অনুগ্রহ করে সঠিক নম্বর দিন।"
        );
        setVerifiedWinner(null);
        return;
      }

      // Find record matching winner status for the selected competition
      const winnerEntry = results.find((r) => {
        const p = r.participant || r;
        const compId = p.competition?._id || p.competition;
        const isWinner = p.achievementType === "winner";
        if (!selectedCompetitionId) return isWinner;
        return isWinner && compId === selectedCompetitionId;
      });

      if (winnerEntry) {
        const winnerData = winnerEntry.participant || winnerEntry;
        setVerifiedWinner(winnerData);
        setUserName(winnerData.name || "");
        toast.success(
          `অভিনন্দন ${winnerData.name}! আপনার বিজয়ী তথ্য সফলভাবে যাচাইকৃত।`
        );
      } else {
        // Check if user is registered as participant only
        const partEntry = results.find((r) => {
          const p = r.participant || r;
          return p.achievementType === "participant";
        });

        if (partEntry) {
          setWinnerVerifyError(
            "আপনি এই প্রতিযোগিতায় 'অংশগ্রহণকারী' হিসেবে নিবন্ধিত, বিজয়ী হিসেবে নয়। অংশগ্রহণকারী পোস্টার তৈরি করতে উপরে 'অংশগ্রহণকারী' অপশন নির্বাচন করুন।"
          );
        } else {
          setWinnerVerifyError(
            "এই প্রতিযোগিতায় এই নম্বরের কোনো বিজয়ী রেকর্ড পাওয়া যায়নি। অনুগ্রহ করে সঠিক নম্বর দিন।"
          );
        }
        setVerifiedWinner(null);
      }
    } catch (err) {
      console.error("Winner verification error:", err);
      const msg =
        err.response?.data?.message ||
        "যাচাইকরণে সমস্যা হয়েছে। অনুগ্রহ করে নম্বরটি পরীক্ষা করে আবার চেষ্টা করুন।";
      setWinnerVerifyError(msg);
      setVerifiedWinner(null);
    } finally {
      setIsVerifyingWinner(false);
    }
  };

  // Determine whether editing and downloading are unlocked
  const isUnlocked =
    posterType === "participant" ||
    (posterType === "winner" && Boolean(verifiedWinner));

  // Handle local file selection (instant, 0-lag, local FileReader)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.warning("Please select a valid image file (.jpg, .png, .webp)");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImageSrc(reader.result);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      toast.success("ছবি আপলোড সম্পন্ন হয়েছে! নিচের গ্রিডে ফ্রেম অ্যাডজাস্ট করুন।");
    };
    reader.readAsDataURL(file);
  };

  // Update live cropped preview URL when crop completes
  const handleCropComplete = async (croppedArea, pixelCrop) => {
    setCroppedAreaPixels(pixelCrop);
    if (uploadedImageSrc && pixelCrop) {
      try {
        const croppedUrl = await getCroppedImg(
          uploadedImageSrc,
          pixelCrop,
          frameShape,
          rotation
        );
        setCroppedPreviewUrl(croppedUrl);
      } catch (e) {
        console.warn("Live crop preview error:", e);
      }
    }
  };

  // Re-generate cropped thumbnail when frame shape or rotation changes
  useEffect(() => {
    if (uploadedImageSrc && croppedAreaPixels) {
      getCroppedImg(uploadedImageSrc, croppedAreaPixels, frameShape, rotation)
        .then((url) => setCroppedPreviewUrl(url))
        .catch(() => {});
    }
  }, [frameShape, rotation]);

  // Responsive width observer for live preview scaling
  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [activeTemplate]);

  // Scaling helpers for live responsive preview
  const photoZone = activeTemplate.photoZone || {
    x: 50,
    y: 45,
    w: 35,
    h: 35,
  };
  const textZones = activeTemplate.textZones || [];
  const nameZone = textZones.find((z) => z.key === "name") || {
    x: 50,
    y: 80,
    font: "Montserrat",
    size: 26,
    color: "#FFFFFF",
    align: "center",
  };

  const scaleFont = (sizePt) => {
    const base = Number(sizePt) || 24;
    const factor = containerWidth / 1000;
    return Math.max(12, Math.round(base * factor * 1.3));
  };

  const photoWidthPercent = photoZone.w || 35;
  const isRectangle = frameShape === "rectangle";
  const isCircle = frameShape === "circle";
  const isRounded = frameShape === "rounded";

  // Class for live preview frame cutout
  const frameClass = isCircle
    ? "rounded-full"
    : isRounded
    ? "rounded-[22%]"
    : "rounded-lg";

  // Trigger high-resolution composite PNG download
  const handleDownload = async () => {
    if (!isUnlocked) {
      toast.warning("অনুগ্রহ করে প্রথমে ফোন নম্বর দিয়ে বিজয়ী হিসেবে যাচাই করুন।");
      return;
    }

    if (!activeTemplate.backgroundImageUrl) {
      toast.error("Poster background image unavailable");
      return;
    }

    setIsDownloading(true);
    try {
      // Build personalized text zones
      const customizedTextZones = (activeTemplate.textZones || []).map((z) => {
        if (z.key === "name") {
          return {
            ...z,
            font: customFont,
            size: customSize,
            style: serializeStyleString(isBold, isItalic),
            color: customColor,
          };
        }
        return z;
      });

      const dataUrl = await generateCompositePoster({
        bgUrl: activeTemplate.backgroundImageUrl,
        photoSrc: uploadedImageSrc,
        pixelCrop: croppedAreaPixels,
        frameShape,
        photoZone,
        textZones: customizedTextZones,
        customTexts: {
          name: userName.trim() || (posterType === "winner" ? "Winner" : "Participant"),
        },
      });

      const safeName = (
        userName.trim() ||
        (posterType === "winner" ? "Pedago_Winner" : "Pedago_Participant")
      ).replace(/[^a-z0-9]/gi, "_");
      const link = document.createElement("a");
      link.download = `${safeName}_${posterType.toUpperCase()}_Poster.png`;
      link.href = dataUrl;
      link.click();

      toast.success("পোস্টার সফলভাবে তৈরি ও ডাউনলোড সম্পন্ন হয়েছে!");
    } catch (err) {
      console.error("Poster download error:", err);
      toast.error("পোস্টার তৈরিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setIsDownloading(false);
    }
  };

  const selectedCompetition = competitions.find(
    (c) => c._id === selectedCompetitionId
  );

  return (
    <div className="min-h-screen bg-[#F4F7FC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider bg-amber-100 text-amber-900 border border-amber-200 shadow-2xs uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>সরাসরি সোশ্যাল মিডিয়া পোস্টার তৈরি ও ডাউনলোড</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#1A284A] tracking-tight">
            Create Your Achievement Poster
          </h1>

          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            প্রথমে আপনার <strong>প্রতিযোগিতা</strong> ও <strong>পোস্টারের ধরন</strong> নির্বাচন করুন।
            অংশগ্রহণকারী পোস্টারের জন্য কোনো ভেরিফিকেশন লাগবে না, এবং বিজয়ীদের জন্য ফোন নম্বর দিয়ে যাচাই করে
            আকর্ষণীয় ফ্রেমের পোস্টার সহজে তৈরি ও ডাউনলোড করুন!
          </p>
        </div>

        {/* Step 1 & 2: Competition Dropdown & Poster Type Selection Card */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-gray-200/80 shadow-xs space-y-6">
          {/* Section 1: Select Competition */}
          <div>
            <div className="flex items-center gap-2.5 pb-2.5 mb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#29479B] flex items-center justify-center font-bold text-sm">
                ১
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#1A284A]">
                  প্রতিযোগিতা নির্বাচন করুন (Select Competition)
                </h3>
                <p className="text-xs text-gray-500">
                  যে প্রতিযোগিতার জন্য পোস্টার তৈরি করতে চান তা ড্রপডাউন থেকে সিলেক্ট করুন
                </p>
              </div>
            </div>

            <div className="relative max-w-2xl">
              <Select
                id="competition-selector"
                value={selectedCompetitionId}
                onChange={(e) => handleCompetitionChange(e.target.value)}
                options={
                  competitions.length > 0
                    ? competitions.map((c) => ({
                        value: c._id,
                        label: `${c.name}${c.category ? ` (${c.category})` : ""}`,
                      }))
                    : [{ value: "", label: "প্রতিযোগিতা লোড হচ্ছে..." }]
                }
                className="font-medium text-[#1A284A] py-2.5"
              />
            </div>
          </div>

          {/* Section 2: Select Poster Type (Participate vs Winner) */}
          <div className="pt-2">
            <div className="flex items-center gap-2.5 pb-2.5 mb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm">
                ২
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#1A284A]">
                  পোস্টারের ধরন নির্বাচন করুন (Select Poster Type)
                </h3>
                <p className="text-xs text-gray-500">
                  অংশগ্রহণকারী পোস্টার (সরাসরি উন্মুক্ত) অথবা বিজয়ী পোস্টার (ফোন নম্বর ভেরিফিকেশন প্রযোজ্য)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Participant Option Card */}
              <button
                type="button"
                onClick={() => handlePosterTypeChange("participant")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  posterType === "participant"
                    ? "border-[#29479B] bg-blue-50/40 ring-2 ring-[#29479B]/20 shadow-xs"
                    : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        posterType === "participant"
                          ? "bg-[#29479B] text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1A284A]">
                        অংশগ্রহণকারী পোস্টার
                      </h4>
                      <span className="text-[11px] text-gray-500">
                        Participation Poster
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                    ভেরিফিকেশন মুক্ত
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-3 leading-relaxed">
                  কোনো ভেরিফিকেশন বা ফোন নম্বরের প্রয়োজন নেই। সরাসরি আপনার ছবি আপলোড করে নাম কাস্টমাইজ করে পোস্টার ডাউনলোড করুন।
                </p>
              </button>

              {/* Winner Option Card */}
              <button
                type="button"
                onClick={() => handlePosterTypeChange("winner")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  posterType === "winner"
                    ? "border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20 shadow-xs"
                    : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        posterType === "winner"
                          ? "bg-amber-500 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1A284A]">
                        বিজয়ী পোস্টার
                      </h4>
                      <span className="text-[11px] text-gray-500">
                        Winner Champion Poster
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                    ফোন ভেরিফিকেশন
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-3 leading-relaxed">
                  প্রতিযোগিতার বিজয়ীদের জন্য নির্ধারিত বিশেষ সম্মাননা ফ্রেম। নিবন্ধিত মোবাইল নম্বর বা শেষ ৬ ডিজিট দিয়ে যাচাই করে আনলক করুন।
                </p>
              </button>
            </div>

            {/* Conditional Winner Verification Section */}
            {posterType === "winner" && (
              <div className="mt-5 pt-4 border-t border-dashed border-amber-200">
                {!verifiedWinner ? (
                  <div className="bg-gradient-to-r from-amber-50/70 to-orange-50/50 p-4 sm:p-5 rounded-xl border border-amber-200/90 space-y-3">
                    <div className="flex items-center gap-2 text-amber-900">
                      <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                      <h4 className="text-sm font-bold">
                        ফোন নম্বর দিয়ে বিজয়ী যাচাই (Winner Verification)
                      </h4>
                    </div>
                    <p className="text-xs text-amber-800">
                      আপনার নিবন্ধিত মোবাইল নম্বর অথবা শেষ ৬ ডিজিট প্রদান করে &ldquo;যাচাই করুন&rdquo; বাটনে ক্লিক করুন:
                    </p>

                    <form
                      onSubmit={handleVerifyWinner}
                      className="flex flex-col sm:flex-row gap-2.5"
                    >
                      <div className="relative flex-1">
                        <input
                          ref={verifyInputRef}
                          type="text"
                          value={winnerPhone}
                          onChange={(e) => setWinnerPhone(e.target.value)}
                          placeholder="যেমন: 01800000002 অথবা শেষ ৬ ডিজিট (000002)"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-transparent font-medium"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isVerifyingWinner || !winnerPhone.trim()}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-2 px-5 py-2.5 shrink-0 shadow-xs cursor-pointer"
                      >
                        {isVerifyingWinner ? (
                          <>
                            <Spinner size="xs" />
                            <span>যাচাই হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4" />
                            <span>যাচাই করুন (Verify)</span>
                          </>
                        )}
                      </Button>
                    </form>

                    {winnerVerifyError && (
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs mt-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                        <span>{winnerVerifyError}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-emerald-50/80 p-4 sm:p-5 rounded-xl border border-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-emerald-900 uppercase tracking-wider">
                            বিজয়ী হিসেবে সফলভাবে যাচাইকৃত
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-900">
                            VERIFIED WINNER
                          </span>
                        </div>
                        <h4 className="text-base font-extrabold text-[#1A284A]">
                          {verifiedWinner.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          ক্যাটাগরি: {verifiedWinner.category || "General"} | রেফারেন্স: {verifiedWinner.refNumber}
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => {
                        setVerifiedWinner(null);
                        setWinnerPhone("");
                        setWinnerVerifyError("");
                      }}
                      className="border-emerald-300 text-emerald-800 bg-white hover:bg-emerald-100 text-xs shrink-0 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1" />
                      অন্য নম্বর দিন
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main 2-Column Studio Grid: Left Controls, Right Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Image Upload, Grid Cropper, Shape Selection & Typography */}
          <div className="lg:col-span-7 space-y-6">
            {/* Locked Notice (if winner mode selected and not verified yet) */}
            {!isUnlocked && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-950">
                    বিজয়ী পোস্টার লক করা আছে
                  </h4>
                  <p className="text-xs text-amber-800 mt-1 max-w-md mx-auto">
                    বিজয়ী পোস্টার কাস্টমাইজ ও ডাউনলোড করতে অনুগ্রহ করে উপরে আপনার নিবন্ধিত ফোন নম্বর বা শেষ ৬ ডিজিট দিয়ে যাচাই করুন।
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    verifyInputRef.current?.focus();
                    window.scrollTo({ top: 180, behavior: "smooth" });
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>ফোন নম্বর যাচাই করতে যান</span>
                </Button>
              </div>
            )}

            {/* Step 3: Upload Photo Card */}
            <div
              className={`bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4 transition-opacity ${
                !isUnlocked ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm">
                    ৩
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#1A284A]">
                      পোর্ট্রেট ছবি আপলোড করুন (Upload Portrait Photo)
                    </h3>
                    <p className="text-xs text-gray-500">
                      আপনার ডিভাইস থেকে সরাসরি পরিষ্কার পোর্ট্রেট ছবি নির্বাচন করুন
                    </p>
                  </div>
                </div>

                {uploadedImageSrc && isUnlocked && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-[#29479B] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> ছবি পরিবর্তন করুন
                  </button>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={!isUnlocked}
                className="hidden"
              />

              {!uploadedImageSrc ? (
                /* Drag & Drop Upload Zone */
                <div
                  onClick={() => isUnlocked && fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 hover:border-[#29479B] bg-gray-50/50 hover:bg-blue-50/30 p-8 rounded-2xl text-center cursor-pointer transition-all space-y-3 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 text-[#29479B] group-hover:scale-110 flex items-center justify-center mx-auto shadow-xs transition-transform">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[#1A284A] block">
                      ক্লিক করে ছবি আপলোড করুন অথবা ড্র্যাগ করুন
                    </span>
                    <span className="text-xs text-gray-400 mt-1 block">
                      JPG, PNG, WEBP হাই-রেজোলিউশন ছবি সাপোর্ট করে
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2 pointer-events-none text-xs"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Browse Device Files</span>
                  </Button>
                </div>
              ) : (
                /* Uploaded Photo Notification */
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <span className="text-xs font-bold text-emerald-900 block">
                        ছবি সফলভাবে লোড হয়েছে
                      </span>
                      <span className="text-[11px] text-emerald-700">
                        নিচের ইন্টার‍্যাক্টিভ গ্রিডে ছবি ড্র্যাগ ও ফ্রেম নির্ধারণ করুন
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-emerald-300 text-emerald-800 bg-white hover:bg-emerald-100"
                  >
                    অন্য ছবি দিন
                  </Button>
                </div>
              )}
            </div>

            {/* Step 4: Interactive Grid Cropper & Frame Shape Selector */}
            {uploadedImageSrc && isUnlocked && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm">
                    ৪
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#1A284A]">
                      ফ্রেমের অবস্থান ও আকার ঠিক করুন (Fix Frame Portion)
                    </h3>
                    <p className="text-xs text-gray-500">
                      গ্রিডে ছবি পজিশন করুন এবং সার্কেল, রাউন্ডেড স্কয়ার বা আয়তাকার ফ্রেম বেছে নিন
                    </p>
                  </div>
                </div>

                <PosterPhotoCropper
                  imageSrc={uploadedImageSrc}
                  frameShape={frameShape}
                  onFrameShapeChange={setFrameShape}
                  crop={crop}
                  onCropChange={setCrop}
                  zoom={zoom}
                  onZoomChange={setZoom}
                  rotation={rotation}
                  onRotationChange={setRotation}
                  onCropComplete={handleCropComplete}
                />
              </div>
            )}

            {/* Step 5: Name on Poster & Typography Customization */}
            <div
              className={`bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4 transition-opacity ${
                !isUnlocked ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  ৫
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#1A284A]">
                    নাম ও টাইপোগ্রাফি কাস্টমাইজেশন (Personalize Name & Fonts)
                  </h3>
                  <p className="text-xs text-gray-500">
                    পোস্টারে আপনার নাম, ফন্ট ফ্যামিলি, সাইজ, বোল্ড, ইটালিক ও কালার পরিবর্তন করুন
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">
                  Your Full Name (পোস্টারে প্রদর্শনের নাম)
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Md. Nur Alam / নূরে আলম"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#29479B] focus:border-transparent text-sm"
                  />
                </div>
                <span className="text-[11px] text-gray-400 mt-1 block">
                  নামটি স্বয়ংক্রিয়ভাবে পোস্টারের নির্দিষ্ট জোনে প্রিমিয়াম ড্রপ-শ্যাডো সহ রেন্ডার হবে।
                </span>
              </div>

              {/* Typography Controls: Font Family, Size, Bold, Italic, Color */}
              <div className="p-4 bg-slate-50 rounded-xl border border-gray-200/80 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-[#29479B]" /> Typography & Formatting
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      title="Toggle Bold"
                      onClick={() => setIsBold(!isBold)}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        isBold
                          ? "bg-[#29479B] text-white border-[#29479B] shadow-xs"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      <Bold className="w-3.5 h-3.5" /> Bold
                    </button>
                    <button
                      type="button"
                      title="Toggle Italic"
                      onClick={() => setIsItalic(!isItalic)}
                      className={`px-2.5 py-1 rounded-lg border text-xs italic flex items-center gap-1 transition-all cursor-pointer ${
                        isItalic
                          ? "bg-[#29479B] text-white border-[#29479B] shadow-xs"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      <Italic className="w-3.5 h-3.5" /> Italic
                    </button>
                  </div>
                </div>

                <Select
                  label="Name Font Family"
                  value={customFont}
                  onChange={(e) => setCustomFont(e.target.value)}
                  options={FONT_OPTIONS}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Font Size</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="14"
                          max="80"
                          value={customSize}
                          onChange={(e) =>
                            setCustomSize(Number(e.target.value) || 14)
                          }
                          className="w-14 px-1.5 py-0.5 text-xs text-center font-bold border border-gray-300 rounded bg-white"
                        />
                        <span className="text-gray-400">pt</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="14"
                      max="72"
                      value={customSize}
                      onChange={(e) => setCustomSize(Number(e.target.value))}
                      className="w-full accent-[#29479B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Name Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="w-8 h-8 rounded border border-gray-300 cursor-pointer p-0.5"
                      />
                      <Input
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="font-mono text-xs uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Poster Preview & Instant High-Res Download */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#29479B]" />
                  <h3 className="text-sm font-extrabold text-[#1A284A]">
                    Live Poster Preview
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      posterType === "winner"
                        ? "bg-amber-50 text-amber-800 border-amber-300"
                        : "bg-blue-50 text-[#29479B] border-blue-200"
                    }`}
                  >
                    {posterType === "winner" ? "🏆 বিজয়ী সংস্করণ" : "অংশগ্রহণমূলক"}
                  </span>
                  <span className="text-[10px] font-bold text-gray-700 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full capitalize">
                    {frameShape}
                  </span>
                </div>
              </div>

              {/* Responsive Live Canvas Container */}
              <div
                ref={containerRef}
                className="relative w-full rounded-2xl overflow-hidden border-2 border-gray-200 shadow-lg bg-slate-900 select-none mx-auto max-w-sm"
                style={{ aspectRatio: "3 / 4" }}
              >
                {/* Poster Background Artwork */}
                {activeTemplate.backgroundImageUrl && (
                  <img
                    src={activeTemplate.backgroundImageUrl}
                    alt="Poster Background"
                    className="w-full h-full object-cover pointer-events-none"
                    crossOrigin="anonymous"
                  />
                )}

                {/* Framed Photo Cutout */}
                <div
                  className={`absolute overflow-hidden border-2 border-white shadow-xl transition-all ${frameClass}`}
                  style={{
                    left: `${photoZone.x}%`,
                    top: `${photoZone.y}%`,
                    width: `${photoWidthPercent}%`,
                    aspectRatio: isRectangle ? "3 / 4" : "1 / 1",
                    transform: "translate(-50%, -50%)",
                    zIndex: 20,
                    backgroundColor: "#1E293B",
                  }}
                >
                  {croppedPreviewUrl ? (
                    <img
                      src={croppedPreviewUrl}
                      alt="User Preview"
                      className="w-full h-full object-cover pointer-events-none"
                      crossOrigin="anonymous"
                    />
                  ) : uploadedImageSrc ? (
                    <img
                      src={uploadedImageSrc}
                      alt="User Raw Preview"
                      className="w-full h-full object-cover pointer-events-none"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-2 text-center">
                      <User className="w-8 h-8 mb-1 opacity-60" />
                      <span className="text-[10px] font-semibold">
                        {isUnlocked ? "Upload Photo" : "Locked"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Rendered Name Text */}
                {userName.trim() && (
                  <div
                    className="absolute select-none pointer-events-none"
                    style={{
                      left: `${nameZone.x}%`,
                      top: `${nameZone.y}%`,
                      transform: "translate(-50%, -50%)",
                      fontFamily: customFont || "Montserrat",
                      fontSize: `${scaleFont(customSize)}px`,
                      fontWeight: isBold ? "bold" : "normal",
                      fontStyle: isItalic ? "italic" : "normal",
                      color: customColor || "#FFFFFF",
                      textAlign: nameZone.align || "center",
                      whiteSpace: "nowrap",
                      lineHeight: 1.2,
                      textShadow: "0 2px 8px rgba(0,0,0,0.85)",
                      zIndex: 25,
                    }}
                  >
                    {userName.trim()}
                  </div>
                )}
              </div>

              {/* Live Info & Details */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs text-gray-500 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span>প্রতিযোগিতা:</span>
                  <strong className="text-gray-800 text-right truncate max-w-[200px]">
                    {selectedCompetition?.name || activeTemplate.competitionId?.name || "Milestone Event"}
                  </strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>পোস্টারের ধরন:</span>
                  <strong className={posterType === "winner" ? "text-amber-700 font-bold" : "text-[#29479B] font-bold"}>
                    {posterType === "winner" ? "বিজয়ী সম্মাননা (Winner)" : "অংশগ্রহণমূলক (Participant)"}
                  </strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>ফটো ফ্রেম:</span>
                  <strong className="text-gray-800 capitalize">
                    {frameShape === "circle" ? "সার্কেল (Circle)" : frameShape === "rounded" ? "রাউন্ডেড (Rounded Square)" : "আয়তাকার (Rectangle)"}
                  </strong>
                </div>
              </div>

              {/* Final Download Button */}
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handleDownload}
                disabled={isDownloading || !isUnlocked}
                className={`w-full py-4 text-base font-bold gap-2 transition-all cursor-pointer ${
                  !isUnlocked
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                    : posterType === "winner"
                    ? "bg-amber-600 hover:bg-amber-700 text-white shadow-md hover:shadow-lg"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg"
                }`}
              >
                {isDownloading ? (
                  <>
                    <Spinner size="sm" />
                    <span>পোস্টার জেনারেট হচ্ছে...</span>
                  </>
                ) : !isUnlocked ? (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>প্রথমে ফোন নম্বর দিয়ে যাচাই করুন</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Download Poster (.PNG)</span>
                  </>
                )}
              </Button>

              <p className="text-[11px] text-gray-400 text-center">
                ফেসবুক, ইনস্টাগ্রাম, লিঙ্কডইন ও হোয়াটসঅ্যাপে সরাসরি শেয়ার করার উপযোগী।
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
