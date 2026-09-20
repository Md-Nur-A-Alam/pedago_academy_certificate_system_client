"use client";

import { useState, useRef, useEffect } from "react";
import {
  Target,
  Move,
  Eye,
  Sliders,
  Sparkles,
  Info,
  CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function CertificateCanvasPointPicker({
  backgroundImageUrl,
  nameZone,
  refZone,
  onNameZoneChange,
  onRefZoneChange,
  previewName = "Alex Rahman",
  previewRef = "COMP-001",
}) {
  const containerRef = useRef(null);
  const [activeTarget, setActiveTarget] = useState("name"); // 'name' | 'ref'
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [containerWidth, setContainerWidth] = useState(800);
  const [isDragging, setIsDragging] = useState(null); // 'name' | 'ref' | null

  // Track container width for proportional font rendering
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

  // Scale font size based on 1000px reference canvas width
  const scaleFont = (sizePt) => {
    const base = Number(sizePt) || 24;
    const factor = containerWidth / 1000;
    return Math.max(10, Math.round(base * factor * 1.3));
  };

  // Click on canvas to position active point
  const handleCanvasClick = (e) => {
    if (isPreviewMode || isDragging) return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    const roundedX = parseFloat(x.toFixed(1));
    const roundedY = parseFloat(y.toFixed(1));

    if (activeTarget === "name") {
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

    if (isDragging === "name") {
      onNameZoneChange({ ...nameZone, x: roundedX, y: roundedY });
    } else if (isDragging === "ref") {
      onRefZoneChange({ ...refZone, x: roundedX, y: roundedY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  // Alignment offset helper
  const getTransform = (align = "center") => {
    if (align === "left") return "translate(0%, -50%)";
    if (align === "right") return "translate(-100%, -50%)";
    return "translate(-50%, -50%)";
  };

  return (
    <div className="space-y-3">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1">
            Active Placement:
          </span>
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
            🔵 Recipient Name (X: {nameZone.x}%, Y: {nameZone.y}%)
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
            🟡 Reference ID (X: {refZone.x}%, Y: {refZone.y}%)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border ${
              isPreviewMode
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
            }`}
          >
            {isPreviewMode ? (
              <>
                <Sliders className="w-3.5 h-3.5" /> Switch to Point Editor
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" /> View Realistic Preview
              </>
            )}
          </button>
        </div>
      </div>

      {/* Instruction Tip */}
      {!isPreviewMode && (
        <div className="flex items-center gap-2 text-xs text-blue-800 bg-blue-50/80 px-3 py-2 rounded-lg border border-blue-100">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            Click anywhere on the certificate design to place the{" "}
            <strong>{activeTarget === "name" ? "Recipient Name" : "Reference ID"}</strong> point, or drag the marker directly.
          </span>
        </div>
      )}

      {/* Interactive Certificate Canvas */}
      <div
        ref={containerRef}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative w-full rounded-xl overflow-hidden border-2 bg-slate-900/5 select-none shadow-sm transition-all ${
          !isPreviewMode ? "cursor-crosshair border-blue-300" : "border-gray-200 cursor-default"
        }`}
        style={{ minHeight: "360px" }}
      >
        {backgroundImageUrl ? (
          <img
            src={backgroundImageUrl}
            alt="Certificate Background"
            className="w-full h-auto block select-none pointer-events-none"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="py-32 text-center text-gray-400 bg-gray-100">
            Please upload or provide a Certificate Background Image URL above
          </div>
        )}

        {backgroundImageUrl && (
          <>
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
                zIndex: activeTarget === "name" ? 30 : 20,
              }}
            >
              {/* Point Crosshair Marker (Editor mode) */}
              {!isPreviewMode && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-blue-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap pointer-events-none">
                  <Target className="w-3 h-3 text-blue-200" />
                  Name Point ({nameZone.x}%, {nameZone.y}%)
                </div>
              )}

              {/* Rendered Name Text */}
              <div
                style={{
                  fontFamily: nameZone.font || "Great Vibes",
                  fontSize: `${scaleFont(nameZone.size)}px`,
                  color: nameZone.color || "#1A284A",
                  textAlign: nameZone.align || "center",
                  whiteSpace: "nowrap",
                  lineHeight: 1.2,
                }}
              >
                {previewName}
              </div>
            </div>

            {/* REFERENCE NUMBER ZONE OVERLAY */}
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
                zIndex: activeTarget === "ref" ? 30 : 20,
              }}
            >
              {/* Point Crosshair Marker (Editor mode) */}
              {!isPreviewMode && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-amber-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap pointer-events-none">
                  <Target className="w-3 h-3 text-amber-200" />
                  Ref Point ({refZone.x}%, {refZone.y}%)
                </div>
              )}

              {/* Rendered Ref Text */}
              <div
                style={{
                  fontFamily: refZone.font || "Montserrat",
                  fontSize: `${scaleFont(refZone.size)}px`,
                  color: refZone.color || "#29479B",
                  textAlign: refZone.align || "center",
                  whiteSpace: "nowrap",
                  lineHeight: 1.2,
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
