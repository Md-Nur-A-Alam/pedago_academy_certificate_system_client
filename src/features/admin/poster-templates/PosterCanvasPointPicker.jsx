"use client";

import { useState, useRef, useEffect } from "react";
import {
  Target,
  Image as ImageIcon,
  User,
  Sliders,
  Eye,
  Info,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const DEFAULT_SAMPLE_PHOTO =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80";

export function PosterCanvasPointPicker({
  backgroundImageUrl,
  photoZone,
  nameZone,
  refZone,
  onPhotoZoneChange,
  onNameZoneChange,
  onRefZoneChange,
  previewName = "Alex Rahman",
  previewRef = "COMP-001",
  previewPhoto = DEFAULT_SAMPLE_PHOTO,
}) {
  const containerRef = useRef(null);
  const [activeTarget, setActiveTarget] = useState("photo"); // 'photo' | 'name' | 'ref'
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [containerWidth, setContainerWidth] = useState(800);
  const [isDragging, setIsDragging] = useState(null); // 'photo' | 'name' | 'ref' | null

  // Track container width for responsive scaling
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
  }, []);

  const scaleFont = (sizePt) => {
    const base = Number(sizePt) || 20;
    const factor = containerWidth / 1000;
    return Math.max(10, Math.round(base * factor * 1.3));
  };

  const getTransform = (align = "center") => {
    if (align === "left") return "translate(0%, -50%)";
    if (align === "right") return "translate(-100%, -50%)";
    return "translate(-50%, -50%)";
  };

  // Click canvas to place active point
  const handleCanvasClick = (e) => {
    if (isPreviewMode || isDragging) return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    const roundedX = parseFloat(x.toFixed(1));
    const roundedY = parseFloat(y.toFixed(1));

    if (activeTarget === "photo") {
      onPhotoZoneChange({ ...photoZone, x: roundedX, y: roundedY });
    } else if (activeTarget === "name") {
      onNameZoneChange({ ...nameZone, x: roundedX, y: roundedY });
    } else {
      onRefZoneChange({ ...refZone, x: roundedX, y: roundedY });
    }
  };

  // Drag handlers
  const handleMouseDown = (target, e) => {
    e.stopPropagation();
    setActiveTarget(target);
    setIsDragging(target);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    const roundedX = parseFloat(x.toFixed(1));
    const roundedY = parseFloat(y.toFixed(1));

    if (isDragging === "photo") {
      onPhotoZoneChange({ ...photoZone, x: roundedX, y: roundedY });
    } else if (isDragging === "name") {
      onNameZoneChange({ ...nameZone, x: roundedX, y: roundedY });
    } else if (isDragging === "ref") {
      onRefZoneChange({ ...refZone, x: roundedX, y: roundedY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const photoWidthPercent = photoZone.w || 25;
  const photoShapeClass =
    photoZone.shape === "circle"
      ? "rounded-full"
      : photoZone.shape === "rounded"
      ? "rounded-2xl"
      : "rounded-none";

  return (
    <div className="space-y-3">
      {/* Top Placement Selector Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1">
            Active Placement:
          </span>

          <button
            type="button"
            onClick={() => {
              setActiveTarget("photo");
              setIsPreviewMode(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTarget === "photo" && !isPreviewMode
                ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/30"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            🖼️ User Photo Zone (X: {photoZone.x}%, Y: {photoZone.y}%)
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTarget("name");
              setIsPreviewMode(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTarget === "name" && !isPreviewMode
                ? "bg-[#29479B] text-white shadow-sm ring-2 ring-[#29479B]/30"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
            🔵 Name Zone (X: {nameZone.x}%, Y: {nameZone.y}%)
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTarget("ref");
              setIsPreviewMode(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTarget === "ref" && !isPreviewMode
                ? "bg-amber-600 text-white shadow-sm ring-2 ring-amber-500/30"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            🟡 Ref Code (X: {refZone.x}%, Y: {refZone.y}%)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border ${
              isPreviewMode
                ? "bg-purple-600 text-white border-purple-600"
                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
            }`}
          >
            {isPreviewMode ? (
              <>
                <Sliders className="w-3.5 h-3.5" /> Switch to Zone Editor
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" /> View Realistic Poster
              </>
            )}
          </button>
        </div>
      </div>

      {/* Instruction Tip */}
      {!isPreviewMode && (
        <div className="flex items-center gap-2 text-xs text-emerald-900 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
          <Info className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Click anywhere on the poster design to place the{" "}
            <strong>
              {activeTarget === "photo"
                ? "User Photo Cutout"
                : activeTarget === "name"
                ? "Participant Name"
                : "Reference Code"}
            </strong>{" "}
            position, or drag the element directly.
          </span>
        </div>
      )}

      {/* Interactive Poster Canvas */}
      <div
        ref={containerRef}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative w-full rounded-xl overflow-hidden border-2 bg-slate-900/5 select-none shadow-sm transition-all ${
          !isPreviewMode ? "cursor-crosshair border-emerald-300" : "border-gray-200 cursor-default"
        }`}
        style={{ minHeight: "420px" }}
      >
        {backgroundImageUrl ? (
          <img
            src={backgroundImageUrl}
            alt="Poster Background"
            className="w-full h-auto block select-none pointer-events-none"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="py-36 text-center text-gray-400 bg-gray-100">
            Please upload or enter a Poster Background Image URL above
          </div>
        )}

        {backgroundImageUrl && (
          <>
            {/* PHOTO ZONE OVERLAY */}
            <div
              onMouseDown={(e) => handleMouseDown("photo", e)}
              className={`absolute transition-transform select-none ${
                !isPreviewMode
                  ? "cursor-grab active:cursor-grabbing ring-2 ring-dashed ring-emerald-500 bg-emerald-500/10 p-0.5"
                  : ""
              } ${photoShapeClass}`}
              style={{
                left: `${photoZone.x}%`,
                top: `${photoZone.y}%`,
                width: `${photoWidthPercent}%`,
                aspectRatio: "1/1",
                transform: "translate(-50%, -50%)",
                zIndex: activeTarget === "photo" ? 30 : 15,
                overflow: "hidden",
              }}
            >
              {/* Marker Label (Editor mode) */}
              {!isPreviewMode && (
                <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-emerald-800/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow pointer-events-none whitespace-nowrap z-40">
                  Photo Cutout ({photoZone.x}%, {photoZone.y}%)
                </div>
              )}

              {/* Sample Photo Image */}
              <img
                src={previewPhoto}
                alt="Sample Participant"
                className={`w-full h-full object-cover select-none pointer-events-none ${photoShapeClass}`}
                crossOrigin="anonymous"
              />
            </div>

            {/* NAME ZONE OVERLAY */}
            <div
              onMouseDown={(e) => handleMouseDown("name", e)}
              className={`absolute transition-transform select-none ${
                !isPreviewMode
                  ? "cursor-grab active:cursor-grabbing group p-1 ring-2 ring-dashed ring-blue-500 bg-blue-500/10 rounded-md"
                  : ""
              }`}
              style={{
                left: `${nameZone.x}%`,
                top: `${nameZone.y}%`,
                transform: getTransform(nameZone.align),
                zIndex: activeTarget === "name" ? 35 : 20,
              }}
            >
              {!isPreviewMode && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-blue-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap pointer-events-none">
                  <Target className="w-3 h-3 text-blue-200" />
                  Name ({nameZone.x}%, {nameZone.y}%)
                </div>
              )}

              <div
                style={{
                  fontFamily: nameZone.font || "Montserrat",
                  fontSize: `${scaleFont(nameZone.size)}px`,
                  color: nameZone.color || "#FFFFFF",
                  textAlign: nameZone.align || "center",
                  whiteSpace: "nowrap",
                  lineHeight: 1.2,
                  textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                }}
              >
                {previewName}
              </div>
            </div>

            {/* REFERENCE CODE ZONE OVERLAY */}
            <div
              onMouseDown={(e) => handleMouseDown("ref", e)}
              className={`absolute transition-transform select-none ${
                !isPreviewMode
                  ? "cursor-grab active:cursor-grabbing group p-1 ring-2 ring-dashed ring-amber-500 bg-amber-500/10 rounded-md"
                  : ""
              }`}
              style={{
                left: `${refZone.x}%`,
                top: `${refZone.y}%`,
                transform: getTransform(refZone.align),
                zIndex: activeTarget === "ref" ? 35 : 20,
              }}
            >
              {!isPreviewMode && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-amber-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap pointer-events-none">
                  <Target className="w-3 h-3 text-amber-200" />
                  Ref ({refZone.x}%, {refZone.y}%)
                </div>
              )}

              <div
                style={{
                  fontFamily: refZone.font || "Montserrat",
                  fontSize: `${scaleFont(refZone.size)}px`,
                  color: refZone.color || "#F59E0B",
                  textAlign: refZone.align || "center",
                  whiteSpace: "nowrap",
                  lineHeight: 1.2,
                  textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                }}
              >
                {previewRef}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
