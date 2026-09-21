"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useHomepageSettings } from "@/hooks/useHomepageSettings";

export function HeroBanner() {
  const { settings } = useHomepageSettings();
  const hero = settings?.hero || {};
  const buttons = hero.buttons || [];
  const pic = hero.pictureStyle || {};

  // Extract valid image list (up to 10 images)
  const rawImages =
    Array.isArray(hero.images) && hero.images.length > 0
      ? hero.images
      : hero.imageUrl
      ? [hero.imageUrl]
      : ["/HeroBG.jpg"];
  const images = rawImages.filter(
    (img) => typeof img === "string" && img.trim().length > 0
  );
  if (images.length === 0) images.push("/HeroBG.jpg");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const safeIndex = images.length > 0 ? currentIndex % images.length : 0;
  const stayTimeSec = hero.stayTime || 5;
  const transitionEffect = hero.transitionEffect || "fade";
  const showIndicators = hero.showIndicators !== false;
  const showNavigation = hero.showNavigation !== false;

  // Auto transition timer
  useEffect(() => {
    if (images.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, Math.max(1, stayTimeSec) * 1000);

    return () => clearInterval(interval);
  }, [images.length, isHovered, stayTimeSec]);

  const handlePrev = (e) => {
    e?.stopPropagation?.();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = (e) => {
    e?.stopPropagation?.();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handleDotClick = (idx, e) => {
    e?.stopPropagation?.();
    setCurrentIndex(idx);
  };

  const rawTitle = hero.title || "Verify & Download Your Pedago Academy Certificates";
  const highlight = hero.titleHighlight || "";

  const renderTitle = () => {
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

  const isFlexMode = hero.layoutMode === "flex";
  const visibleButtons = buttons.filter((b) => b.isVisible !== false);

  // Picture Styling Calculations
  const borderWidth = pic.borderWidth ?? 4;
  const borderColor = pic.borderColor || "rgba(255, 255, 255, 0.2)";
  const borderStyle = pic.borderStyle || "solid";
  const shadowType = pic.shadow || "glow";
  const shadowColor = pic.shadowColor || "rgba(245, 158, 11, 0.4)";
  const anim = pic.animation || "float";
  const shape = pic.shape || "rounded";
  const size = pic.size || "medium";
  const fadeStyle = pic.fadeStyle || "bottom";

  // Size helper
  const sizeClass =
    size === "small"
      ? "max-w-xs md:max-w-sm"
      : size === "large"
      ? "max-w-md md:max-w-xl"
      : "max-w-sm md:max-w-md";

  // Shape helper
  const isCircle = shape === "circle";
  const isAmoeba = shape === "amoeba";
  const isSquircle = shape === "squircle";

  const shapeClass = isCircle
    ? "rounded-full aspect-square"
    : isAmoeba
    ? "aspect-square"
    : isSquircle
    ? "rounded-[2.5rem] aspect-4/3"
    : "rounded-3xl aspect-video lg:aspect-4/3";

  const shapeInlineStyle = isAmoeba
    ? {
        borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
      }
    : {};

  // Animation class helper
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

  // Shadow helper
  const shadowStyle =
    shadowType === "glow"
      ? `0 0 35px ${shadowColor}, 0 20px 40px -15px rgba(0, 0, 0, 0.6)`
      : shadowType === "strong"
      ? "0 25px 50px -12px rgba(0, 0, 0, 0.7)"
      : shadowType === "soft"
      ? "0 10px 25px -5px rgba(0, 0, 0, 0.3)"
      : "none";

  // Calculate Background Fill (Solid or Gradient)
  const getHeroBackgroundStyle = () => {
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

  // Helper for transition styles
  const getSlideTransitionClass = (isActive, idx) => {
    if (transitionEffect === "zoom") {
      return isActive
        ? "opacity-100 scale-100 z-10 transition-all duration-1000 ease-out"
        : "opacity-0 scale-110 z-0 transition-all duration-1000 ease-out pointer-events-none";
    }
    if (transitionEffect === "slide") {
      return isActive
        ? "opacity-100 translate-x-0 z-10 transition-all duration-700 ease-in-out"
        : idx < safeIndex
        ? "opacity-0 -translate-x-full z-0 transition-all duration-700 ease-in-out pointer-events-none"
        : "opacity-0 translate-x-full z-0 transition-all duration-700 ease-in-out pointer-events-none";
    }
    if (transitionEffect === "kenburns") {
      return isActive
        ? "opacity-100 animate-kenburns z-10 transition-opacity duration-1000 ease-in-out"
        : "opacity-0 z-0 transition-opacity duration-1000 ease-in-out pointer-events-none";
    }
    // Default: 'fade'
    return isActive
      ? "opacity-100 z-10 transition-opacity duration-1000 ease-in-out"
      : "opacity-0 z-0 transition-opacity duration-1000 ease-in-out pointer-events-none";
  };

  // ==================== FLEX LAYOUT MODE ====================
  if (isFlexMode) {
    return (
      <section
        className="relative text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden transition-all duration-500"
        style={{ background: getHeroBackgroundStyle() }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
          {/* Left Text & CTA Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {hero.showBadge !== false && (
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-wider bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 uppercase shadow-xs">
                {hero.badgeText || "Official Verification Portal"}
              </span>
            )}

            <h1
              className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight drop-shadow-sm"
              style={{ color: hero.titleColor || "#FFFFFF" }}
            >
              {renderTitle()}
            </h1>

            <p
              className="text-base sm:text-xl font-light leading-relaxed max-w-2xl"
              style={{ color: hero.subtitleColor || "rgba(255, 255, 255, 0.9)" }}
            >
              {hero.subtitle ||
                "আপনার অনন্য রেফারেন্স কোড বা ফোন নম্বর দিয়ে অফিশিয়াল সার্টিফিকেট ও সোশ্যাল মিডিয়া পোস্টার ডাউনলোড করুন সহজে।"}
            </p>

            {hero.showButtons !== false && visibleButtons.length > 0 && (
              <div className="pt-3 flex flex-wrap items-center gap-4">
                {visibleButtons.map((btn, idx) => {
                  const isOutline = btn.variant === "outline";
                  return (
                    <Link
                      key={btn.id || idx}
                      href={btn.link || "/certificates"}
                      className="px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-md hover:shadow-xl hover:scale-[1.02] transition-all inline-block"
                      style={{
                        backgroundColor: isOutline ? "transparent" : btn.bgColor || "#F0442E",
                        color: btn.textColor || "#FFFFFF",
                        border: `2px solid ${btn.bgColor || "#F0442E"}`,
                      }}
                    >
                      {btn.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Hero Image Card with Multi-Image Slideshow */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div
              className={`relative overflow-hidden w-full bg-black/40 group transition-all duration-300 ${sizeClass} ${shapeClass} ${animClass}`}
              style={{
                border: `${borderWidth}px ${borderStyle} ${borderColor}`,
                boxShadow: shadowStyle,
                ...shapeInlineStyle,
              }}
            >
              {/* Stacked Images for Smooth Carousel Transitions */}
              <div className="relative w-full h-full min-h-[260px] sm:min-h-[320px]">
                {images.map((imgSrc, idx) => {
                  const isActive = idx === safeIndex;
                  return (
                    <img
                      key={idx}
                      src={imgSrc}
                      alt={`Pedago Academy Hero ${idx + 1}`}
                      className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105 ${getSlideTransitionClass(
                        isActive,
                        idx
                      )}`}
                    />
                  );
                })}
              </div>

              {/* Dynamic Fade Styles */}
              {fadeStyle === "bottom" && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none z-15" />
              )}
              {fadeStyle === "vignette" && (
                <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.85)_100%)] pointer-events-none z-15" />
              )}
              {fadeStyle === "radial" && (
                <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-transparent to-black/30 pointer-events-none z-15" />
              )}

              {/* Navigation Arrows for Card */}
              {showNavigation && images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100 shadow-md hover:scale-110 active:scale-95 cursor-pointer"
                    aria-label="Previous slide"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100 shadow-md hover:scale-110 active:scale-95 cursor-pointer"
                    aria-label="Next slide"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Indicator Dots for Card */}
              {showIndicators && images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 shadow-md">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => handleDotClick(idx, e)}
                      className={`transition-all duration-300 rounded-full cursor-pointer ${
                        idx === safeIndex
                          ? "w-5 h-1.5 bg-[#F59E0B] shadow-sm shadow-[#F59E0B]/50"
                          : "w-1.5 h-1.5 bg-white/60 hover:bg-white"
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ==================== BACKGROUND LAYOUT MODE ====================
  const overlayOpacity = (hero.bgOverlayOpacity ?? 80) / 100;

  return (
    <section
      className="relative text-white py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden transition-all duration-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Slideshow Stack */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {images.map((imgSrc, idx) => {
          const isActive = idx === safeIndex;
          return (
            <div
              key={idx}
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat ${getSlideTransitionClass(
                isActive,
                idx
              )}`}
              style={{ backgroundImage: `url(${imgSrc})` }}
            />
          );
        })}
      </div>

      {/* Background Overlay */}
      <div
        className="absolute inset-0 backdrop-blur-xs transition-all duration-500 z-1"
        style={{
          background: getHeroBackgroundStyle(),
          opacity: overlayOpacity,
        }}
      />

      {/* Navigation Arrows for Full Bleed */}
      {showNavigation && images.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-black/70 text-white/90 hover:text-white backdrop-blur-md border border-white/20 transition-all shadow-xl hover:scale-110 active:scale-95 cursor-pointer"
            aria-label="Previous slide"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-black/70 text-white/90 hover:text-white backdrop-blur-md border border-white/20 transition-all shadow-xl hover:scale-110 active:scale-95 cursor-pointer"
            aria-label="Next slide"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Slide Indicators for Full Bleed */}
      {showIndicators && images.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 shadow-xl">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => handleDotClick(idx, e)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                idx === safeIndex
                  ? "w-7 h-2 bg-[#F59E0B] shadow-md shadow-[#F59E0B]/50"
                  : "w-2 h-2 bg-white/50 hover:bg-white"
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Hero Content */}
      <div className="relative max-w-5xl mx-auto text-center space-y-6 z-10">
        {hero.showBadge !== false && (
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-wider bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 uppercase shadow-xs">
            {hero.badgeText || "Official Verification Portal"}
          </span>
        )}

        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight drop-shadow-md"
          style={{ color: hero.titleColor || "#FFFFFF" }}
        >
          {renderTitle()}
        </h1>

        <p
          className="text-lg sm:text-xl max-w-3xl mx-auto font-light leading-relaxed"
          style={{ color: hero.subtitleColor || "rgba(255, 255, 255, 0.9)" }}
        >
          {hero.subtitle ||
            "আপনার অনন্য রেফারেন্স কোড বা ফোন নম্বর দিয়ে অফিশিয়াল সার্টিফিকেট ও সোশ্যাল মিডিয়া পোস্টার ডাউনলোড করুন সহজে।"}
        </p>

        {hero.showButtons !== false && visibleButtons.length > 0 && (
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            {visibleButtons.map((btn, idx) => {
              const isOutline = btn.variant === "outline";
              return (
                <Link
                  key={btn.id || idx}
                  href={btn.link || "/certificates"}
                  className="px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all inline-block"
                  style={{
                    backgroundColor: isOutline ? "transparent" : btn.bgColor || "#F0442E",
                    color: btn.textColor || "#FFFFFF",
                    border: `2px solid ${btn.bgColor || "#F0442E"}`,
                  }}
                >
                  {btn.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

