"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  LayoutTemplate,
  Save,
  Sparkles,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Palette,
  Columns,
  Maximize2,
  Sliders,
  ExternalLink,
  Layers,
  Check,
  Circle,
  Square,
  Wand2,
  Activity,
  Sun,
  Blend,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { MultiImageUpload } from "@/components/ui/MultiImageUpload";
import { useHomepageSettings } from "@/hooks/useHomepageSettings";

export function HomePageSettingsView() {
  const { settings, isLoading, updateSettings, isUpdating } = useHomepageSettings();

  const [formData, setFormData] = useState(null);
  const [activeTab, setActiveTab] = useState("hero"); // 'hero' | 'competitions' | 'portals'
  const isInitializedRef = useRef(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    if (settings && !isInitializedRef.current) {
      setFormData(JSON.parse(JSON.stringify(settings)));
      isInitializedRef.current = true;
    }
  }, [settings]);

  // Slideshow auto-advance effect (must be top-level hook to satisfy React Rules of Hooks)
  const heroImages = formData?.hero?.images;
  const heroImageUrl = formData?.hero?.imageUrl;
  const previewStayTime = formData?.hero?.stayTime || 5;

  const previewRawImages =
    Array.isArray(heroImages) && heroImages.length > 0
      ? heroImages
      : heroImageUrl
      ? [heroImageUrl]
      : ["/HeroBG.jpg"];
  const previewImages = previewRawImages.filter(
    (img) => typeof img === "string" && img.trim().length > 0
  );
  if (previewImages.length === 0) previewImages.push("/HeroBG.jpg");

  const safePreviewIndex = previewIndex % previewImages.length;

  useEffect(() => {
    if (previewImages.length <= 1) return;
    const interval = setInterval(() => {
      setPreviewIndex((prev) => (prev + 1) % previewImages.length);
    }, Math.max(1, previewStayTime) * 1000);
    return () => clearInterval(interval);
  }, [previewImages.length, previewStayTime]);

  if (isLoading || !formData) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-4">
        <Spinner size="lg" />
        <p className="text-sm font-semibold text-gray-500">Loading home page settings...</p>
      </div>
    );
  }

  const hero = formData.hero || {};
  const buttons = hero.buttons || [];
  const pic = hero.pictureStyle || {};

  // Handlers for nested state updates
  const handleHeroChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: value,
      },
    }));
  };

  const handlePictureStyleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        pictureStyle: {
          ...(prev.hero?.pictureStyle || {}),
          [field]: value,
        },
      },
    }));
  };

  const handleGradientChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        bgGradient: {
          ...(prev.hero?.bgGradient || {}),
          [field]: value,
        },
      },
    }));
  };

  const handleSolidColorChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        bgSolidColor: value,
        bgOverlayColor: value,
      },
    }));
  };

  const handleGradientPreset = (start, end, dir = "to-r") => {
    setFormData((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        bgType: "gradient",
        bgGradient: {
          ...(prev.hero?.bgGradient || {}),
          direction: dir,
          colorStart: start,
          colorEnd: end,
        },
      },
    }));
  };

  const getLiveHeroBackgroundStyle = () => {
    const bgType = hero.bgType || "solid";
    if (bgType === "gradient") {
      const grad = hero.bgGradient || {};
      const dir = grad.direction || "to-r";
      const c1 = grad.colorStart || "#1A284A";
      const c2 = grad.colorEnd || "#29479B";

      if (dir === "radial") {
        return `radial-gradient(circle at center, ${c1}, ${c2})`;
      }
      const dirCss =
        dir === "to-br"
          ? "to bottom right"
          : dir === "to-b"
          ? "to bottom"
          : dir === "to-tr"
          ? "to top right"
          : "to right";
      return `linear-gradient(${dirCss}, ${c1}, ${c2})`;
    }
    return hero.bgSolidColor || hero.bgOverlayColor || "#1A284A";
  };

  const handleButtonChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedButtons = [...prev.hero.buttons];
      updatedButtons[index] = {
        ...updatedButtons[index],
        [field]: value,
      };
      return {
        ...prev,
        hero: {
          ...prev.hero,
          buttons: updatedButtons,
        },
      };
    });
  };

  const handleAddButton = () => {
    if (buttons.length >= 4) return;
    const newBtn = {
      id: `btn-${Date.now()}`,
      label: "নতুন বাটন / New Action",
      link: "/certificates",
      bgColor: "#29479B",
      textColor: "#FFFFFF",
      variant: "solid",
      isVisible: true,
    };
    setFormData((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        buttons: [...prev.hero.buttons, newBtn],
      },
    }));
  };

  const handleRemoveButton = (index) => {
    setFormData((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        buttons: prev.hero.buttons.filter((_, i) => i !== index),
      },
    }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData) return;
    try {
      const updated = await updateSettings(formData);
      if (updated) {
        setFormData(JSON.parse(JSON.stringify(updated)));
      }
    } catch {
      // Handled by toast
    }
  };

  // Render title with highlighted span for live preview
  const renderLiveTitle = () => {
    const rawTitle = hero.title || "Verify & Download Your Pedago Academy Certificates";
    const highlight = hero.titleHighlight || "";

    if (!highlight || !rawTitle.includes(highlight)) {
      return <span>{rawTitle}</span>;
    }

    const parts = rawTitle.split(highlight);
    return (
      <>
        {parts[0]}
        <span style={{ color: hero.titleHighlightColor || "#F59E0B" }}>
          {highlight}
        </span>
        {parts.slice(1).join(highlight)}
      </>
    );
  };

  // Live preview picture style computations
  const borderWidth = pic.borderWidth ?? 4;
  const borderColor = pic.borderColor || "rgba(255, 255, 255, 0.2)";
  const borderStyle = pic.borderStyle || "solid";
  const shadowType = pic.shadow || "glow";
  const shadowColor = pic.shadowColor || "rgba(245, 158, 11, 0.4)";
  const anim = pic.animation || "float";
  const shape = pic.shape || "rounded";
  const size = pic.size || "medium";
  const fadeStyle = pic.fadeStyle || "bottom";

  const sizeClass =
    size === "small"
      ? "max-w-xs"
      : size === "large"
      ? "max-w-md"
      : "max-w-sm";

  const isCircle = shape === "circle";
  const isAmoeba = shape === "amoeba";
  const isSquircle = shape === "squircle";

  const shapeClass = isCircle
    ? "rounded-full aspect-square"
    : isAmoeba
    ? "aspect-square"
    : isSquircle
    ? "rounded-[2.5rem] aspect-4/3"
    : "rounded-3xl aspect-video md:aspect-4/3";

  const shapeInlineStyle = isAmoeba
    ? {
        borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
      }
    : {};

  const animClass =
    anim === "float"
      ? "animate-float"
      : anim === "pulse-glow"
      ? "animate-pulse-glow"
      : anim === "morph-amoeba"
      ? "animate-morph-amoeba"
      : anim === "kenburns"
      ? "animate-kenburns"
      : anim === "tilt-3d"
      ? "animate-tilt-3d"
      : anim === "shimmer"
      ? "animate-shimmer"
      : anim === "bounce-subtle"
      ? "animate-bounce-subtle"
      : "";

  const shadowStyle =
    shadowType === "glow"
      ? `0 0 30px ${shadowColor}, 0 20px 40px -15px rgba(0, 0, 0, 0.6)`
      : shadowType === "strong"
      ? "0 25px 50px -12px rgba(0, 0, 0, 0.7)"
      : shadowType === "soft"
      ? "0 10px 25px -5px rgba(0, 0, 0, 0.3)"
      : "none";

  const previewTransition = hero.transitionEffect || "fade";

  const getPreviewTransitionClass = (isActive, idx) => {
    if (previewTransition === "zoom") {
      return isActive
        ? "opacity-100 scale-100 z-10 transition-all duration-700 ease-out"
        : "opacity-0 scale-110 z-0 transition-all duration-700 ease-out pointer-events-none";
    }
    if (previewTransition === "slide") {
      return isActive
        ? "opacity-100 translate-x-0 z-10 transition-all duration-500 ease-in-out"
        : idx < safePreviewIndex
        ? "opacity-0 -translate-x-full z-0 transition-all duration-500 ease-in-out pointer-events-none"
        : "opacity-0 translate-x-full z-0 transition-all duration-500 ease-in-out pointer-events-none";
    }
    if (previewTransition === "kenburns") {
      return isActive
        ? "opacity-100 animate-kenburns z-10 transition-opacity duration-700 ease-in-out"
        : "opacity-0 z-0 transition-opacity duration-700 ease-in-out pointer-events-none";
    }
    return isActive
      ? "opacity-100 z-10 transition-opacity duration-700 ease-in-out"
      : "opacity-0 z-0 transition-opacity duration-700 ease-in-out pointer-events-none";
  };

  return (
    <div className="space-y-8 max-w-6xl pb-20">
      {/* Top Header & Save Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A284A] flex items-center gap-2.5">
            <LayoutTemplate className="w-6 h-6 text-[#29479B]" />
            Home Page Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Customize the Hero Banner layout, live text, picture styling, amoeba shapes, CTA buttons, and home page sections
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          onClick={handleSave}
          disabled={isUpdating}
          className="gap-2 bg-[#29479B] hover:bg-[#1A284A] text-white px-6 py-2.5 shadow-sm"
        >
          {isUpdating ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
          <span>{isUpdating ? "Saving..." : "Save Settings"}</span>
        </Button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("hero")}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "hero"
              ? "bg-[#29479B] text-white shadow-xs"
              : "text-gray-600 hover:text-[#1A284A] hover:bg-gray-100"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Hero Banner & Picture Styling</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("competitions")}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "competitions"
              ? "bg-[#29479B] text-white shadow-xs"
              : "text-gray-600 hover:text-[#1A284A] hover:bg-gray-100"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Featured Competitions</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("portals")}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "portals"
              ? "bg-[#29479B] text-white shadow-xs"
              : "text-gray-600 hover:text-[#1A284A] hover:bg-gray-100"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Quick Access Portals</span>
        </button>
      </div>

      {/* TAB 1: HERO BANNER SETTINGS */}
      {activeTab === "hero" && (
        <div className="space-y-8">
          {/* Real-time Hero Banner Preview Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#29479B]" />
                Live Hero Banner Preview
              </span>
              <span className="text-xs text-gray-400">
                Mode: <strong className="text-gray-700 capitalize">{hero.layoutMode}</strong> • Shape: <strong className="text-[#29479B] capitalize">{shape}</strong>
              </span>
            </div>

            <div className="rounded-2xl overflow-hidden border border-gray-300 shadow-sm relative transition-all">
              {/* Background Mode */}
              {hero.layoutMode === "background" ? (
                <div className="relative text-white py-16 px-6 sm:px-10 overflow-hidden transition-all min-h-[340px] flex items-center justify-center text-center">
                  {/* Slideshow Stack */}
                  <div className="absolute inset-0 z-0 overflow-hidden">
                    {previewImages.map((imgSrc, idx) => {
                      const isActive = idx === safePreviewIndex;
                      return (
                        <div
                          key={idx}
                          className={`absolute inset-0 bg-cover bg-center bg-no-repeat ${getPreviewTransitionClass(
                            isActive,
                            idx
                          )}`}
                          style={{ backgroundImage: `url(${imgSrc})` }}
                        />
                      );
                    })}
                  </div>

                  {/* Overlay */}
                  <div
                    className="absolute inset-0 transition-all z-1"
                    style={{
                      background: getLiveHeroBackgroundStyle(),
                      opacity: (hero.bgOverlayOpacity ?? 80) / 100,
                    }}
                  />

                  {/* Slide Indicators */}
                  {hero.showIndicators !== false && previewImages.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-xs border border-white/20">
                      {previewImages.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPreviewIndex(idx)}
                          className={`transition-all duration-300 rounded-full cursor-pointer ${
                            idx === safePreviewIndex
                              ? "w-4 h-1.5 bg-[#F59E0B]"
                              : "w-1.5 h-1.5 bg-white/60 hover:bg-white"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  <div className="relative z-10 max-w-3xl mx-auto space-y-4">
                    {hero.showBadge && (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 uppercase">
                        {hero.badgeText || "Official Verification Portal"}
                      </span>
                    )}

                    <h2
                      className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight"
                      style={{ color: hero.titleColor || "#FFFFFF" }}
                    >
                      {renderLiveTitle()}
                    </h2>

                    <p
                      className="text-sm sm:text-base font-light max-w-2xl mx-auto leading-relaxed"
                      style={{ color: hero.subtitleColor || "rgba(255, 255, 255, 0.9)" }}
                    >
                      {hero.subtitle}
                    </p>

                    {hero.showButtons && buttons.length > 0 && (
                      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                        {buttons
                          .filter((b) => b.isVisible)
                          .map((b, idx) => (
                            <span
                              key={b.id || idx}
                              className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all inline-block"
                              style={{
                                backgroundColor:
                                  b.variant === "outline" ? "transparent" : b.bgColor || "#F0442E",
                                color: b.textColor || "#FFFFFF",
                                border: `2px solid ${b.bgColor || "#F0442E"}`,
                              }}
                            >
                              {b.label}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Flex Mode with Styled Picture Card */
                <div
                  className="relative text-white py-12 px-6 sm:px-10 transition-all min-h-[340px] flex items-center overflow-hidden"
                  style={{
                    background: getLiveHeroBackgroundStyle(),
                  }}
                >
                  <div className="relative z-10 w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4 text-left">
                      {hero.showBadge && (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 uppercase">
                          {hero.badgeText || "Official Verification Portal"}
                        </span>
                      )}

                      <h2
                        className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight"
                        style={{ color: hero.titleColor || "#FFFFFF" }}
                      >
                        {renderLiveTitle()}
                      </h2>

                      <p
                        className="text-sm font-light leading-relaxed"
                        style={{ color: hero.subtitleColor || "rgba(255, 255, 255, 0.9)" }}
                      >
                        {hero.subtitle}
                      </p>

                      {hero.showButtons && buttons.length > 0 && (
                        <div className="pt-2 flex flex-wrap items-center gap-3">
                          {buttons
                            .filter((b) => b.isVisible)
                            .map((b, idx) => (
                              <span
                                key={b.id || idx}
                                className="px-4 py-2 rounded-xl font-bold text-xs shadow-md inline-block"
                                style={{
                                  backgroundColor:
                                    b.variant === "outline" ? "transparent" : b.bgColor || "#F0442E",
                                  color: b.textColor || "#FFFFFF",
                                  border: `2px solid ${b.bgColor || "#F0442E"}`,
                                }}
                              >
                                {b.label}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Right Picture with Live Calculated Styling & Slideshow */}
                    <div className="flex justify-center">
                      <div
                        className={`relative overflow-hidden w-full bg-black/40 group transition-all duration-300 ${sizeClass} ${shapeClass} ${animClass}`}
                        style={{
                          border: `${borderWidth}px ${borderStyle} ${borderColor}`,
                          boxShadow: shadowStyle,
                          ...shapeInlineStyle,
                        }}
                      >
                        <div className="relative w-full h-full min-h-[220px]">
                          {previewImages.map((imgSrc, idx) => {
                            const isActive = idx === safePreviewIndex;
                            return (
                              <img
                                key={idx}
                                src={imgSrc}
                                alt="Hero Graphic"
                                className={`absolute inset-0 w-full h-full object-cover ${getPreviewTransitionClass(
                                  isActive,
                                  idx
                                )}`}
                              />
                            );
                          })}
                        </div>

                        {fadeStyle === "bottom" && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none z-15" />
                        )}
                        {fadeStyle === "vignette" && (
                          <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.85)_100%)] pointer-events-none z-15" />
                        )}
                        {fadeStyle === "radial" && (
                          <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-transparent to-black/30 pointer-events-none z-15" />
                        )}

                        {hero.showIndicators !== false && previewImages.length > 1 && (
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-xs border border-white/20">
                            {previewImages.map((_, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setPreviewIndex(idx)}
                                className={`transition-all duration-300 rounded-full cursor-pointer ${
                                  idx === safePreviewIndex
                                    ? "w-3 h-1 bg-[#F59E0B]"
                                    : "w-1 h-1 bg-white/60 hover:bg-white"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Settings Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Section 1: Layout & Image Settings */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5">
              <h3 className="font-extrabold text-base text-[#1A284A] flex items-center gap-2">
                <Columns className="w-5 h-5 text-[#29479B]" />
                Hero Layout & Visual Style
              </h3>

              {/* Layout Mode Selector */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">
                  Display Mode (Layout)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleHeroChange("layoutMode", "background")}
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      hero.layoutMode === "background"
                        ? "border-[#29479B] ring-2 ring-[#29479B]/20 bg-blue-50/50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Maximize2 className="w-5 h-5 text-[#29479B]" />
                      {hero.layoutMode === "background" && (
                        <Check className="w-4 h-4 text-[#29479B]" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-[#1A284A] block">
                      Background Image Mode
                    </span>
                    <span className="text-[11px] text-gray-500 mt-1 block">
                      Image acts as full background with color overlay; text is centered.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleHeroChange("layoutMode", "flex")}
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      hero.layoutMode === "flex"
                        ? "border-[#29479B] ring-2 ring-[#29479B]/20 bg-blue-50/50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Columns className="w-5 h-5 text-[#29479B]" />
                      {hero.layoutMode === "flex" && (
                        <Check className="w-4 h-4 text-[#29479B]" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-[#1A284A] block">
                      Flex with Picture Mode
                    </span>
                    <span className="text-[11px] text-gray-500 mt-1 block">
                      Side-by-side flex: text & CTA on the left, graphic picture card on the right.
                    </span>
                  </button>
                </div>
              </div>

              {/* Multi-Image Slideshow Upload / URL (up to 10 images) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block">
                      Hero Banner Images (Multiple Slideshow)
                    </label>
                    <span className="text-[11px] text-gray-500">
                      Upload up to 10 images for the hero background or flex picture card.
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#29479B] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                    {(Array.isArray(hero.images) && hero.images.length > 0 ? hero.images.length : (hero.imageUrl ? 1 : 0))}/10
                  </span>
                </div>

                <MultiImageUpload
                  label="Hero Images"
                  value={
                    Array.isArray(hero.images) && hero.images.length > 0
                      ? hero.images
                      : hero.imageUrl
                      ? [hero.imageUrl]
                      : []
                  }
                  onChange={(newImages) => {
                    handleHeroChange("images", newImages);
                    handleHeroChange("imageUrl", newImages.length > 0 ? newImages[0] : "");
                  }}
                  maxImages={10}
                  helpText="Add up to 10 images. They will smoothly rotate one by one after your chosen stay time."
                />

                {/* Slideshow Stay Time & Transition Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50/80 border border-gray-200">
                  {/* Stay Time */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-[#29479B]" />
                        Slide Stay Time (n seconds)
                      </label>
                      <span className="text-xs font-mono font-bold text-[#29479B] bg-white px-2 py-0.5 rounded border border-blue-100">
                        {hero.stayTime || 5}s
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={hero.stayTime || 5}
                      onChange={(e) =>
                        handleHeroChange("stayTime", parseInt(e.target.value, 10))
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#29479B] mt-2"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      Each picture stays on screen for {hero.stayTime || 5} seconds before auto-advancing.
                    </p>
                  </div>

                  {/* Transition Effect */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Transition Motion Effect
                    </label>
                    <select
                      value={hero.transitionEffect || "fade"}
                      onChange={(e) =>
                        handleHeroChange("transitionEffect", e.target.value)
                      }
                      className="w-full text-xs font-semibold py-2 px-3 rounded-lg border border-gray-300 bg-white shadow-2xs"
                    >
                      <option value="fade">✨ Smooth Crossfade</option>
                      <option value="slide">➡️ Horizontal Slide</option>
                      <option value="zoom">🔍 Slow Zoom Depth Transition</option>
                      <option value="kenburns">🎬 Ken-Burns Cinematic Pan & Zoom</option>
                    </select>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Visual animation used to transition to the next image.
                    </p>
                  </div>

                  {/* Slide Indicators & Navigation Toggles */}
                  <div className="sm:col-span-2 pt-2 border-t border-gray-200/60 flex flex-wrap items-center gap-6">
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hero.showIndicators ?? true}
                        onChange={(e) => handleHeroChange("showIndicators", e.target.checked)}
                        className="rounded text-[#29479B] focus:ring-[#29479B] w-4 h-4"
                      />
                      <span>Show Slide Dot Indicators</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hero.showNavigation ?? true}
                        onChange={(e) => handleHeroChange("showNavigation", e.target.checked)}
                        className="rounded text-[#29479B] focus:ring-[#29479B] w-4 h-4"
                      />
                      <span>Show Arrow Navigation Buttons</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Background Fill Style: Solid or Gradient */}
              <div className="pt-4 border-t border-gray-100 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block">
                      Background Style & Fill
                    </label>
                    <span className="text-[11px] text-gray-500">
                      Choose between a uniform solid background or a modern multi-stop gradient
                    </span>
                  </div>

                  {/* Mode Toggle Pills */}
                  <div className="flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleHeroChange("bgType", "solid")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        (hero.bgType || "solid") === "solid"
                          ? "bg-white text-[#1A284A] shadow-xs"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <Palette className="w-3.5 h-3.5 text-[#29479B]" />
                      <span>Solid Color</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleHeroChange("bgType", "gradient")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        hero.bgType === "gradient"
                          ? "bg-white text-[#1A284A] shadow-xs"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <Blend className="w-3.5 h-3.5 text-[#29479B]" />
                      <span>Gradient Fill</span>
                    </button>
                  </div>
                </div>

                {/* Solid Color Controls */}
                {(hero.bgType || "solid") === "solid" ? (
                  <div className="space-y-3 bg-gray-50/70 p-4 rounded-xl border border-gray-200">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        Solid Background Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={hero.bgSolidColor || hero.bgOverlayColor || "#1A284A"}
                          onChange={(e) => handleSolidColorChange(e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300 p-1 bg-white shadow-xs"
                        />
                        <input
                          type="text"
                          value={hero.bgSolidColor || hero.bgOverlayColor || "#1A284A"}
                          onChange={(e) => handleSolidColorChange(e.target.value)}
                          className="w-40 text-xs font-mono px-3 py-2 rounded-lg border border-gray-300 bg-white"
                          placeholder="#1A284A"
                        />
                        <span className="text-xs text-gray-400">
                          Applies as flex background or image tint
                        </span>
                      </div>
                    </div>

                    {/* Quick Solid Presets */}
                    <div>
                      <span className="text-[11px] font-semibold text-gray-500 block mb-1.5">
                        Quick Solid Presets:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: "Pedago Navy", color: "#1A284A" },
                          { label: "Royal Blue", color: "#29479B" },
                          { label: "Midnight Slate", color: "#0F172A" },
                          { label: "Deep Indigo", color: "#1E1B4B" },
                          { label: "Emerald Deep", color: "#064E3B" },
                          { label: "Crimson Night", color: "#450A0A" },
                        ].map((preset) => (
                          <button
                            key={preset.color}
                            type="button"
                            onClick={() => handleSolidColorChange(preset.color)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-gray-200 bg-white hover:border-gray-400 text-xs text-gray-700 transition-all cursor-pointer shadow-2xs"
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/10"
                              style={{ backgroundColor: preset.color }}
                            />
                            <span>{preset.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Gradient Controls */
                  <div className="space-y-4 bg-gray-50/70 p-4 rounded-xl border border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Gradient Direction */}
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">
                          Gradient Flow / Direction
                        </label>
                        <select
                          value={hero.bgGradient?.direction || "to-r"}
                          onChange={(e) => handleGradientChange("direction", e.target.value)}
                          className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-gray-300 bg-white"
                        >
                          <option value="to-r">➡️ Left to Right (Horizontal)</option>
                          <option value="to-br">↘️ Top-Left to Bottom-Right (Diagonal)</option>
                          <option value="to-b">⬇️ Top to Bottom (Vertical)</option>
                          <option value="to-tr">↗️ Bottom-Left to Top-Right (Diagonal)</option>
                          <option value="radial">🔘 Center Radial Glow</option>
                        </select>
                      </div>

                      {/* Start Color */}
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">
                          Gradient Start Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={hero.bgGradient?.colorStart || "#1A284A"}
                            onChange={(e) => handleGradientChange("colorStart", e.target.value)}
                            className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300 p-1 bg-white shadow-xs"
                          />
                          <input
                            type="text"
                            value={hero.bgGradient?.colorStart || "#1A284A"}
                            onChange={(e) => handleGradientChange("colorStart", e.target.value)}
                            className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-gray-300 bg-white"
                          />
                        </div>
                      </div>

                      {/* End Color */}
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">
                          Gradient End Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={hero.bgGradient?.colorEnd || "#29479B"}
                            onChange={(e) => handleGradientChange("colorEnd", e.target.value)}
                            className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300 p-1 bg-white shadow-xs"
                          />
                          <input
                            type="text"
                            value={hero.bgGradient?.colorEnd || "#29479B"}
                            onChange={(e) => handleGradientChange("colorEnd", e.target.value)}
                            className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-gray-300 bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Gradient Presets */}
                    <div>
                      <span className="text-[11px] font-semibold text-gray-500 block mb-1.5">
                        Quick Gradient Presets:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          {
                            label: "Pedago Signature",
                            start: "#1A284A",
                            end: "#29479B",
                            dir: "to-r",
                          },
                          {
                            label: "Royal Indigo",
                            start: "#1E1B4B",
                            end: "#4338CA",
                            dir: "to-br",
                          },
                          {
                            label: "Sunset Amber",
                            start: "#1A284A",
                            end: "#B45309",
                            dir: "to-r",
                          },
                          {
                            label: "Emerald Deep",
                            start: "#064E3B",
                            end: "#047857",
                            dir: "to-br",
                          },
                          {
                            label: "Crimson Night",
                            start: "#450A0A",
                            end: "#991B1B",
                            dir: "to-r",
                          },
                          {
                            label: "Cyber Violet",
                            start: "#2E1065",
                            end: "#7C3AED",
                            dir: "to-br",
                          },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() =>
                              handleGradientPreset(preset.start, preset.end, preset.dir)
                            }
                            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-xs text-xs font-medium text-gray-700 transition-all cursor-pointer text-left"
                          >
                            <span
                              className="w-6 h-6 rounded-lg border border-black/10 shrink-0 shadow-2xs"
                              style={{
                                background: `linear-gradient(to right, ${preset.start}, ${preset.end})`,
                              }}
                            />
                            <span className="truncate">{preset.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Overlay Opacity Slider */}
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-gray-700">
                      Background Overlay Darkness / Opacity
                    </label>
                    <span className="text-xs font-mono font-bold text-[#29479B] bg-blue-50 px-2 py-0.5 rounded">
                      {hero.bgOverlayOpacity ?? 80}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={hero.bgOverlayOpacity ?? 80}
                    onChange={(e) =>
                      handleHeroChange("bgOverlayOpacity", parseInt(e.target.value, 10))
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#29479B] mt-2"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    In Background Mode, controls how much the solid/gradient overlay obscures the background image.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Typography & Text Settings */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-base text-[#1A284A] flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#29479B]" />
                Title, Subtitle & Colors
              </h3>

              {/* Badge Text & Show Toggle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700">Top Tag / Badge</label>
                  <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hero.showBadge ?? true}
                      onChange={(e) => handleHeroChange("showBadge", e.target.checked)}
                      className="rounded text-[#29479B] focus:ring-[#29479B]"
                    />
                    <span>Show Badge</span>
                  </label>
                </div>
                <Input
                  value={hero.badgeText || ""}
                  onChange={(e) => handleHeroChange("badgeText", e.target.value)}
                  placeholder="e.g. Official Verification Portal"
                />
              </div>

              {/* Title Text & Color */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700">Main Title</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-gray-500">Title Color:</span>
                    <input
                      type="color"
                      value={hero.titleColor || "#FFFFFF"}
                      onChange={(e) => handleHeroChange("titleColor", e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border border-gray-200"
                    />
                  </div>
                </div>
                <Input
                  value={hero.title || ""}
                  onChange={(e) => handleHeroChange("title", e.target.value)}
                  placeholder="e.g. Verify & Download Your Pedago Academy Certificates"
                />
              </div>

              {/* Highlight Portion & Highlight Color */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700">
                    Highlighted Title Text
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-gray-500">Highlight Color:</span>
                    <input
                      type="color"
                      value={hero.titleHighlightColor || "#F59E0B"}
                      onChange={(e) =>
                        handleHeroChange("titleHighlightColor", e.target.value)
                      }
                      className="w-6 h-6 rounded cursor-pointer border border-gray-200"
                    />
                  </div>
                </div>
                <Input
                  value={hero.titleHighlight || ""}
                  onChange={(e) => handleHeroChange("titleHighlight", e.target.value)}
                  placeholder="Exact word(s) inside Title to color differently (e.g. Pedago Academy)"
                />
              </div>

              {/* Subtitle / Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700">
                    Subtitle / Description
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-gray-500">Subtitle Color:</span>
                    <input
                      type="color"
                      value={hero.subtitleColor || "#FFFFFF"}
                      onChange={(e) => handleHeroChange("subtitleColor", e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border border-gray-200"
                    />
                  </div>
                </div>
                <textarea
                  rows={3}
                  value={hero.subtitle || ""}
                  onChange={(e) => handleHeroChange("subtitle", e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#29479B]"
                  placeholder="Enter descriptive subtitle text..."
                />
              </div>
            </div>
          </div>

          {/* Section 3: HERO PICTURE STYLING, SHAPES, BORDERS & ANIMATIONS */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-extrabold text-base text-[#1A284A] flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-purple-600" />
                  Hero Picture Shape, Border, Shadow, Animation & Fade Style
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Control the shape (rounded, circle, organic amoeba, squircle), border thickness, ambient shadow glow, and animations.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 shrink-0">
                Visual FX Engine
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Control 1: Shape Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-700 block">
                  Picture Shape & Form
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "rounded", label: "Rounded Card", icon: Square },
                    { id: "circle", label: "Circle Shape", icon: Circle },
                    { id: "amoeba", label: "Amoeba Blob", icon: Blend },
                    { id: "squircle", label: "Squircle", icon: Square },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handlePictureStyleChange("shape", s.id)}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer text-xs font-semibold ${
                        shape === s.id
                          ? "border-purple-600 bg-purple-50/70 text-purple-900 ring-2 ring-purple-600/20"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <s.icon className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>

                {/* Picture Size */}
                <div className="pt-2">
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Picture Size
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["small", "medium", "large"].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => handlePictureStyleChange("size", sz)}
                        className={`py-1.5 px-3 rounded-lg border text-center text-xs font-bold capitalize transition-all cursor-pointer ${
                          size === sz
                            ? "border-[#29479B] bg-blue-50 text-[#29479B]"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Control 2: Border Width, Style & Color */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-700">Border Thickness</label>
                  <span className="text-xs font-mono font-bold text-purple-700">
                    {borderWidth}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="16"
                  value={borderWidth}
                  onChange={(e) =>
                    handlePictureStyleChange("borderWidth", parseInt(e.target.value, 10))
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">
                      Border Color
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={borderColor.startsWith("#") ? borderColor : "#ffffff"}
                        onChange={(e) =>
                          handlePictureStyleChange("borderColor", e.target.value)
                        }
                        className="w-8 h-8 rounded cursor-pointer border border-gray-200 p-0.5"
                      />
                      <input
                        type="text"
                        value={borderColor}
                        onChange={(e) =>
                          handlePictureStyleChange("borderColor", e.target.value)
                        }
                        className="w-full text-xs font-mono px-2 py-1.5 rounded-lg border border-gray-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">
                      Border Style
                    </label>
                    <select
                      value={borderStyle}
                      onChange={(e) =>
                        handlePictureStyleChange("borderStyle", e.target.value)
                      }
                      className="w-full text-xs py-2 px-2.5 rounded-lg border border-gray-300 bg-white"
                    >
                      <option value="solid">Solid</option>
                      <option value="dashed">Dashed</option>
                      <option value="double">Double</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Control 3: Shadow, Glow & Animation */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-700">Shadow & Glow FX</label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "none", label: "None" },
                    { id: "soft", label: "Soft Shadow" },
                    { id: "strong", label: "Deep 3D" },
                    { id: "glow", label: "Ambient Glow" },
                  ].map((sh) => (
                    <button
                      key={sh.id}
                      type="button"
                      onClick={() => handlePictureStyleChange("shadow", sh.id)}
                      className={`py-1.5 px-2 rounded-lg border text-center text-xs font-semibold transition-all cursor-pointer ${
                        shadowType === sh.id
                          ? "border-amber-500 bg-amber-50 text-amber-900 font-bold ring-1 ring-amber-500"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {sh.label}
                    </button>
                  ))}
                </div>

                {shadowType === "glow" && (
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">
                      Glow Color
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={shadowColor.startsWith("#") ? shadowColor : "#f59e0b"}
                        onChange={(e) =>
                          handlePictureStyleChange("shadowColor", e.target.value)
                        }
                        className="w-8 h-8 rounded cursor-pointer border border-gray-200 p-0.5"
                      />
                      <input
                        type="text"
                        value={shadowColor}
                        onChange={(e) =>
                          handlePictureStyleChange("shadowColor", e.target.value)
                        }
                        className="w-full text-xs font-mono px-2 py-1.5 rounded-lg border border-gray-300"
                      />
                    </div>
                  </div>
                )}

                {/* Animation Selector */}
                <div className="pt-1">
                  <label className="text-xs font-bold text-gray-700 block mb-1 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-purple-600" />
                    Animation Effect
                  </label>
                  <select
                    value={anim}
                    onChange={(e) =>
                      handlePictureStyleChange("animation", e.target.value)
                    }
                    className="w-full text-xs py-2 px-2.5 rounded-lg border border-gray-300 bg-white"
                  >
                    <option value="none">Static (No Animation)</option>
                    <option value="float">Gentle Floating (Smooth Bobbing)</option>
                    <option value="pulse-glow">Pulse Breathing Glow</option>
                    <option value="morph-amoeba">Amoeba Fluid Morphing</option>
                    <option value="kenburns">🎬 Ken-Burns Cinematic Pan & Zoom</option>
                    <option value="tilt-3d">🧊 Dynamic 3D Perspective Tilt</option>
                    <option value="shimmer">✨ Prismatic Light Shimmer Sweep</option>
                    <option value="bounce-subtle">🪀 Subtle Elastic Float Bounce</option>
                  </select>
                </div>
              </div>

              {/* Control 4: Fade Style Overlay */}
              <div className="md:col-span-2 lg:col-span-3 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <Blend className="w-4 h-4 text-purple-600" />
                    Edge Fade Style & Gradient Overlay
                  </label>
                  <span className="text-xs text-gray-400">
                    Blends picture seamlessly into hero background
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: "none", label: "Crisp (No Fade)", desc: "Hard clean cut edges" },
                    { id: "bottom", label: "Bottom Fade", desc: "Fades smoothly into bottom" },
                    { id: "vignette", label: "Vignette Fade", desc: "Soft feathered radial edge" },
                    { id: "radial", label: "Radial Gradient", desc: "Diagonal ambient shade" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handlePictureStyleChange("fadeStyle", f.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        fadeStyle === f.id
                          ? "border-purple-600 bg-purple-50/70 text-purple-900 ring-2 ring-purple-600/20"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-xs font-bold block">{f.label}</span>
                      <span className="text-[10px] text-gray-500 block mt-0.5">{f.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Action Buttons Customization */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-extrabold text-base text-[#1A284A] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Hero Action Buttons (CTA)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configure how many buttons appear, their text, links, colors, and visibility.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hero.showButtons ?? true}
                    onChange={(e) => handleHeroChange("showButtons", e.target.checked)}
                    className="rounded text-[#29479B] focus:ring-[#29479B] w-4 h-4"
                  />
                  <span>Show Buttons</span>
                </label>

                {buttons.length < 4 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddButton}
                    className="gap-1.5 text-xs font-bold text-[#29479B]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Button</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Buttons List */}
            {buttons.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-xs text-gray-500">No action buttons added yet.</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddButton}
                  className="mt-3 gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add First Button
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {buttons.map((btn, index) => (
                  <div
                    key={btn.id || index}
                    className={`p-4 rounded-xl border transition-all ${
                      btn.isVisible
                        ? "bg-gray-50/70 border-gray-200"
                        : "bg-gray-100/50 border-gray-200 opacity-60"
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                      {/* Button Index & Visibility */}
                      <div className="md:col-span-1 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleButtonChange(index, "isVisible", !btn.isVisible)
                          }
                          className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                          title={btn.isVisible ? "Hide button" : "Show button"}
                        >
                          {btn.isVisible ? (
                            <Eye className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>

                      {/* Button Label */}
                      <div className="md:col-span-3">
                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                          Button Text
                        </label>
                        <Input
                          value={btn.label || ""}
                          onChange={(e) =>
                            handleButtonChange(index, "label", e.target.value)
                          }
                          placeholder="e.g. Download Certificate"
                        />
                      </div>

                      {/* Button Link */}
                      <div className="md:col-span-3">
                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                          Navigation Link
                        </label>
                        <Input
                          value={btn.link || ""}
                          onChange={(e) =>
                            handleButtonChange(index, "link", e.target.value)
                          }
                          placeholder="e.g. /certificates"
                        />
                      </div>

                      {/* Style Variant */}
                      <div className="md:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                          Style
                        </label>
                        <select
                          value={btn.variant || "solid"}
                          onChange={(e) =>
                            handleButtonChange(index, "variant", e.target.value)
                          }
                          className="w-full text-xs py-2 px-2.5 rounded-lg border border-gray-300 bg-white"
                        >
                          <option value="solid">Solid Background</option>
                          <option value="outline">Outline Border</option>
                        </select>
                      </div>

                      {/* Color Pickers */}
                      <div className="md:col-span-2 flex items-center gap-3">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                            BG Color
                          </label>
                          <div className="flex items-center gap-1">
                            <input
                              type="color"
                              value={btn.bgColor || "#F0442E"}
                              onChange={(e) =>
                                handleButtonChange(index, "bgColor", e.target.value)
                              }
                              className="w-7 h-7 rounded cursor-pointer border border-gray-200"
                            />
                            <span className="text-[10px] font-mono text-gray-500">
                              {btn.bgColor}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                            Text Color
                          </label>
                          <input
                            type="color"
                            value={btn.textColor || "#FFFFFF"}
                            onChange={(e) =>
                              handleButtonChange(index, "textColor", e.target.value)
                            }
                            className="w-7 h-7 rounded cursor-pointer border border-gray-200"
                          />
                        </div>
                      </div>

                      {/* Remove Action */}
                      <div className="md:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveButton(index)}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete button"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FEATURED COMPETITIONS SETTINGS */}
      {activeTab === "competitions" && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6 max-w-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-extrabold text-base text-[#1A284A]">
                Featured Competitions Section
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Controls the dynamic competitions showcase fetched live from the database.
              </p>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featuredCompetitions?.showSection ?? true}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    featuredCompetitions: {
                      ...prev.featuredCompetitions,
                      showSection: e.target.checked,
                    },
                  }))
                }
                className="rounded text-[#29479B] focus:ring-[#29479B] w-4 h-4"
              />
              <span>Show Section</span>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Section Title (Bangla / English)
              </label>
              <Input
                value={formData.featuredCompetitions?.title || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    featuredCompetitions: {
                      ...prev.featuredCompetitions,
                      title: e.target.value,
                    },
                  }))
                }
                placeholder="e.g. চলমান ও জনপ্রিয় প্রতিযোগিতা | Featured Competitions"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Section Subtitle
              </label>
              <Input
                value={formData.featuredCompetitions?.subtitle || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    featuredCompetitions: {
                      ...prev.featuredCompetitions,
                      subtitle: e.target.value,
                    },
                  }))
                }
                placeholder="e.g. পেডাগো একাডেমির সকল সক্রিয় ও সাম্প্রতিক প্রতিযোগিতার ফলাফল ও সার্টিফিকেট"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Number of Competitions to Display
              </label>
              <select
                value={formData.featuredCompetitions?.limit || 6}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    featuredCompetitions: {
                      ...prev.featuredCompetitions,
                      limit: parseInt(e.target.value, 10),
                    },
                  }))
                }
                className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl border border-gray-300 bg-white"
              >
                <option value={3}>3 Competitions</option>
                <option value={6}>6 Competitions</option>
                <option value={9}>9 Competitions</option>
                <option value={12}>12 Competitions</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QUICK ACCESS PORTALS SETTINGS */}
      {activeTab === "portals" && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6 max-w-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-extrabold text-base text-[#1A284A]">
                Quick Access Portals Section
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Controls the 3-column service entry points (Certificates, Posters, Competitions).
              </p>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.quickPortals?.showSection ?? true}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    quickPortals: {
                      ...prev.quickPortals,
                      showSection: e.target.checked,
                    },
                  }))
                }
                className="rounded text-[#29479B] focus:ring-[#29479B] w-4 h-4"
              />
              <span>Show Section</span>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Section Title
              </label>
              <Input
                value={formData.quickPortals?.title || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    quickPortals: {
                      ...prev.quickPortals,
                      title: e.target.value,
                    },
                  }))
                }
                placeholder="e.g. Quick Access Portals"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Section Subtitle
              </label>
              <Input
                value={formData.quickPortals?.subtitle || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    quickPortals: {
                      ...prev.quickPortals,
                      subtitle: e.target.value,
                    },
                  }))
                }
                placeholder="e.g. খুব সহজেই আপনার সার্টিফিকেট যাচাই করুন, ডাউনলোড করুন অথবা সোশ্যাল মিডিয়ায় শেয়ারের জন্য পোস্টার তৈরি করুন"
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating / Sticky Save Footer */}
      <div className="fixed bottom-0 left-0 right-0 sm:left-64 bg-white/95 backdrop-blur-md border-t border-gray-200 p-4 flex items-center justify-between z-30 shadow-lg px-8">
        <span className="text-xs text-gray-500">
          Changes will apply instantly to the public home page once saved.
        </span>
        <Button
          type="button"
          variant="primary"
          onClick={handleSave}
          disabled={isUpdating}
          className="gap-2 bg-[#29479B] hover:bg-[#1A284A] text-white px-6 shadow-md"
        >
          {isUpdating ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
          <span>{isUpdating ? "Saving..." : "Save Settings"}</span>
        </Button>
      </div>
    </div>
  );
}
