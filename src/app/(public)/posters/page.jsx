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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import apiClient from "@/lib/api-client";
import { toast } from "react-toastify";
import { PosterPhotoCropper } from "@/features/posters/PosterPhotoCropper";
import {
  getCroppedImg,
  generateCompositePoster,
} from "@/features/posters/posterCanvasUtils";

const FALLBACK_POSTER_BG =
  "https://i.ibb.co/yn2fx3J0/istockphoto-2162394672-612x612.jpg";

export default function PostersPage() {
  // Templates state
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
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

  // Download state
  const [isDownloading, setIsDownloading] = useState(false);

  // Responsive Canvas container scaling for live preview
  const [containerWidth, setContainerWidth] = useState(480);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch available poster templates
  useEffect(() => {
    let isMounted = true;
    const loadTemplates = async () => {
      try {
        const { data } = await apiClient.get("/api/posters/templates");
        if (isMounted && data?.data && data.data.length > 0) {
          setTemplates(data.data);
          setSelectedTemplateIndex(0);
          // Pre-populate default frame shape from template if available
          const firstTemplate = data.data[0];
          if (firstTemplate.photoZone?.shape) {
            const sh = firstTemplate.photoZone.shape;
            setFrameShape(
              sh === "square" || sh === "rounded"
                ? "rounded"
                : sh === "rectangle"
                ? "rectangle"
                : "circle"
            );
          }
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

  const activeTemplate = templates[selectedTemplateIndex] || {
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
    competitionId: { name: "Pedago Milestone Event" },
  };

  // Sync frame shape when template changes
  const handleSelectTemplate = (idx) => {
    setSelectedTemplateIndex(idx);
    const tmpl = templates[idx];
    if (tmpl?.photoZone?.shape) {
      const sh = tmpl.photoZone.shape;
      setFrameShape(
        sh === "square" || sh === "rounded"
          ? "rounded"
          : sh === "rectangle"
          ? "rectangle"
          : "circle"
      );
    }
  };

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
      toast.success("Photo uploaded! Adjust the crop & frame below.");
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
  const photoZone = activeTemplate.photoZone || { x: 50, y: 45, w: 35, h: 35 };
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
    if (!activeTemplate.backgroundImageUrl) {
      toast.error("Poster background image unavailable");
      return;
    }

    setIsDownloading(true);
    try {
      const dataUrl = await generateCompositePoster({
        bgUrl: activeTemplate.backgroundImageUrl,
        photoSrc: uploadedImageSrc,
        pixelCrop: croppedAreaPixels,
        frameShape,
        photoZone,
        textZones,
        customTexts: {
          name: userName.trim() || "Participant",
        },
      });

      const safeName = (userName.trim() || "Pedago_Participant").replace(
        /[^a-z0-9]/gi,
        "_"
      );
      const link = document.createElement("a");
      link.download = `${safeName}_Milestone_Poster.png`;
      link.href = dataUrl;
      link.click();

      toast.success("Poster generated and downloaded successfully!");
    } catch (err) {
      console.error("Poster download error:", err);
      toast.error("Failed to generate poster. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

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
            Create Your Milestone Achievement Poster
          </h1>

          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            কোনো ভেরিফিকেশন বা রেজিস্ট্রেশন কোড ছাড়াই আপনার সুন্দর ছবি আপলোড করুন,
            পছন্দমতো <strong>সার্কেল, রাউন্ডেড স্কয়ার বা আয়তাকার</strong> ফ্রেমে গ্রিড এডজাস্ট করুন এবং
            এক ক্লিকে সোশ্যাল মিডিয়ায় শেয়ারের উপযোগী হাই-রেজোলিউশন পোস্টার ডাউনলোড করুন!
          </p>
        </div>

        {/* Step 1: Template Selection (If multiple templates exist) */}
        {templates.length > 1 && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#29479B] flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#1A284A]">
                  Choose Poster Artwork / Competition
                </h3>
                <p className="text-xs text-gray-500">
                  Select which competition or event design you want to create your poster with
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {templates.map((tmpl, idx) => {
                const isSelected = idx === selectedTemplateIndex;
                return (
                  <button
                    key={tmpl._id || idx}
                    type="button"
                    onClick={() => handleSelectTemplate(idx)}
                    className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#29479B] ring-2 ring-[#29479B]/20 bg-blue-50/50 shadow-xs"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="w-12 h-14 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                      <img
                        src={tmpl.backgroundImageUrl}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#1A284A] truncate">
                        {tmpl.competitionId?.name || "Milestone Poster"}
                      </h4>
                      <span className="text-[11px] text-gray-500 capitalize block mt-0.5">
                        {tmpl.type} Edition
                      </span>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#29479B] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main 2-Column Studio Grid: Left Controls, Right Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Image Upload, Grid Cropper, Shape Selection & Details */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 2: Upload Photo Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm">
                    {templates.length > 1 ? "2" : "1"}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#1A284A]">
                      Upload Portrait Photo
                    </h3>
                    <p className="text-xs text-gray-500">
                      Upload your portrait picture (.png, .jpg, .jpeg) directly from your device
                    </p>
                  </div>
                </div>

                {uploadedImageSrc && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-[#29479B] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Change Photo
                  </button>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {!uploadedImageSrc ? (
                /* Drag & Drop Upload Zone */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 hover:border-[#29479B] bg-gray-50/50 hover:bg-blue-50/30 p-8 rounded-2xl text-center cursor-pointer transition-all space-y-3 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 text-[#29479B] group-hover:scale-110 flex items-center justify-center mx-auto shadow-xs transition-transform">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[#1A284A] block">
                      Click to upload or drag & drop portrait photo
                    </span>
                    <span className="text-xs text-gray-400 mt-1 block">
                      Supports JPG, PNG, WEBP high resolution images
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
                        Photo Loaded Successfully
                      </span>
                      <span className="text-[11px] text-emerald-700">
                        Use the interactive grid below to adjust position and frame shape
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
                    Upload Another
                  </Button>
                </div>
              )}
            </div>

            {/* Step 3: Interactive Grid Cropper & Frame Shape Selector */}
            {uploadedImageSrc && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm">
                    {templates.length > 1 ? "3" : "2"}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#1A284A]">
                      Fix Selected Portion & Frame Shape
                    </h3>
                    <p className="text-xs text-gray-500">
                      Drag inside the grid to position your face and choose Circle, Rounded Square, or Rectangle
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

            {/* Step 4: Optional Personalization (Name on Poster) */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  {templates.length > 1 ? "4" : "3"}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#1A284A]">
                    Personalize Name on Poster
                  </h3>
                  <p className="text-xs text-gray-500">
                    Type your full name as you would like it to appear on the official poster
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
                  The name is rendered directly onto the poster with the official font and drop-shadow.
                </span>
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
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full capitalize">
                  {frameShape} Cutout
                </span>
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
                        Upload Photo
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
                      fontFamily: nameZone.font || "Montserrat",
                      fontSize: `${scaleFont(nameZone.size)}px`,
                      color: nameZone.color || "#FFFFFF",
                      textAlign: nameZone.align || "center",
                      whiteSpace: "nowrap",
                      fontWeight: "bold",
                      lineHeight: 1.2,
                      textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                      zIndex: 25,
                    }}
                  >
                    {userName.trim()}
                  </div>
                )}
              </div>

              {/* Live Info & Format Details */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>Target Artwork:</span>
                  <strong className="text-gray-800">
                    {activeTemplate.competitionId?.name || "Official Milestone"}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Photo Frame:</span>
                  <strong className="text-gray-800 capitalize">
                    {frameShape}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Output Resolution:</span>
                  <strong className="text-emerald-700">
                    Full High-Res (.PNG)
                  </strong>
                </div>
              </div>

              {/* Final Download Button */}
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full py-4 text-base font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                {isDownloading ? (
                  <>
                    <Spinner size="sm" />
                    <span>Generating High-Res Poster...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Download Poster (.PNG)</span>
                  </>
                )}
              </Button>

              <p className="text-[11px] text-gray-400 text-center">
                Ready for instant sharing on Facebook, Instagram, LinkedIn & WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
