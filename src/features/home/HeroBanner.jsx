"use client";

import Link from "next/link";
import { useHomepageSettings } from "@/hooks/useHomepageSettings";

export function HeroBanner() {
  const { settings } = useHomepageSettings();
  const hero = settings?.hero || {};
  const buttons = hero.buttons || [];
  const pic = hero.pictureStyle || {};

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

  if (isFlexMode) {
    return (
      <section
        className="relative text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden transition-all duration-500"
        style={{ background: getHeroBackgroundStyle() }}
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

          {/* Right Hero Image Card with Full Shape, Border, Shadow, Animation & Fade */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div
              className={`relative overflow-hidden w-full bg-black/40 group transition-all duration-300 ${sizeClass} ${shapeClass} ${animClass}`}
              style={{
                border: `${borderWidth}px ${borderStyle} ${borderColor}`,
                boxShadow: shadowStyle,
                ...shapeInlineStyle,
              }}
            >
              <img
                src={hero.imageUrl || "/HeroBG.jpg"}
                alt="Pedago Academy Hero"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {/* Dynamic Fade Styles */}
              {fadeStyle === "bottom" && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              )}
              {fadeStyle === "vignette" && (
                <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />
              )}
              {fadeStyle === "radial" && (
                <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-transparent to-black/30 pointer-events-none" />
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Default: Background Mode (Picture as background with overlay)
  const bgImg = hero.imageUrl || "/HeroBG.jpg";
  const overlayColor = hero.bgOverlayColor || "#1A284A";
  const overlayOpacity = (hero.bgOverlayOpacity ?? 80) / 100;

  return (
    <section
      className="relative text-white py-24 sm:py-28 px-4 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat overflow-hidden transition-all duration-500"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      {/* Background Overlay */}
      <div
        className="absolute inset-0 backdrop-blur-xs transition-all duration-500"
        style={{
          background: getHeroBackgroundStyle(),
          opacity: overlayOpacity,
        }}
      />

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
