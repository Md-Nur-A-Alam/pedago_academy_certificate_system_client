"use client";

import { useState, useRef, useEffect } from "react";
import {
  Target,
  Eye,
  Sliders,
  Sparkles,
  Info,
  Calendar,
  PenTool,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { parseStyleBooleans } from "@/lib/fontConstants";

export function CertificateCanvasPointPicker({
  backgroundImageUrl,
  nameZone = { x: 50, y: 46, enabled: true },
  refZone = { x: 50, y: 78, enabled: true },
  dateZone = { x: 25, y: 85, enabled: false },
  signatureZone = { x: 75, y: 85, enabled: false, width: 16 },
  onNameZoneChange,
  onRefZoneChange,
  onDateZoneChange,
  onSignatureZoneChange,
  previewName = "Alex Rahman",
  previewRef = "COMP-001",
  previewDate = "20 September 2026",
}) {
  const containerRef = useRef(null);
  const [activeTarget, setActiveTarget] = useState("name"); // 'name' | 'ref' | 'date' | 'signature'
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [containerWidth, setContainerWidth] = useState(800);
  const [isDragging, setIsDragging] = useState(null); // 'name' | 'ref' | 'date' | 'signature' | null

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

    if (activeTarget === "name" && onNameZoneChange) {
      onNameZoneChange({ ...nameZone, x: roundedX, y: roundedY });
    } else if (activeTarget === "ref" && onRefZoneChange) {
      onRefZoneChange({ ...refZone, x: roundedX, y: roundedY });
    } else if (activeTarget === "date" && onDateZoneChange) {
      onDateZoneChange({ ...dateZone, x: roundedX, y: roundedY });
    } else if (activeTarget === "signature" && onSignatureZoneChange) {
      onSignatureZoneChange({ ...signatureZone, x: roundedX, y: roundedY });
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

    if (isDragging === "name" && onNameZoneChange) {
      onNameZoneChange({ ...nameZone, x: roundedX, y: roundedY });
    } else if (isDragging === "ref" && onRefZoneChange) {
      onRefZoneChange({ ...refZone, x: roundedX, y: roundedY });
    } else if (isDragging === "date" && onDateZoneChange) {
      onDateZoneChange({ ...dateZone, x: roundedX, y: roundedY });
    } else if (isDragging === "signature" && onSignatureZoneChange) {
      onSignatureZoneChange({ ...signatureZone, x: roundedX, y: roundedY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  // Alignment offset helper
  const getTransform = (align = "center", rotation = 0) => {
    let translate = "translate(-50%, -50%)";
    if (align === "left") translate = "translate(0%, -50%)";
    if (align === "right") translate = "translate(-100%, -50%)";
    return `${translate} rotate(${rotation || 0}deg)`;
  };

  const isNameEnabled = nameZone?.enabled !== false;
  const isRefEnabled = refZone?.enabled !== false;
  const isDateEnabled = Boolean(dateZone?.enabled);
  const isSigEnabled = Boolean(signatureZone?.enabled);

  return (
    <div className="space-y-3">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1">
            Active Placement:
          </span>

          {/* Name button */}
          <button
            type="button"
            onClick={() => {
              setActiveTarget("name");
              setIsPreviewMode(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTarget === "name" && !isPreviewMode
                ? "bg-[#29479B] text-white shadow-sm ring-2 ring-[#29479B]/30"
                : isNameEnabled
                ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                : "bg-gray-100 text-gray-400 opacity-60"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isNameEnabled ? "bg-blue-400" : "bg-gray-300"}`} />
            Recipient Name {isNameEnabled ? `(${nameZone.x}%, ${nameZone.y}%)` : "(Hidden)"}
          </button>

          {/* Ref ID button */}
          <button
            type="button"
            onClick={() => {
              setActiveTarget("ref");
              setIsPreviewMode(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTarget === "ref" && !isPreviewMode
                ? "bg-amber-600 text-white shadow-sm ring-2 ring-amber-500/30"
                : isRefEnabled
                ? "bg-amber-50 text-amber-800 hover:bg-amber-100"
                : "bg-gray-100 text-gray-400 opacity-60"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isRefEnabled ? "bg-amber-400" : "bg-gray-300"}`} />
            Reference ID {isRefEnabled ? `(${refZone.x}%, ${refZone.y}%)` : "(Hidden)"}
          </button>

          {/* Date button */}
          <button
            type="button"
            onClick={() => {
              setActiveTarget("date");
              setIsPreviewMode(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTarget === "date" && !isPreviewMode
                ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/30"
                : isDateEnabled
                ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                : "bg-gray-100 text-gray-400 opacity-60"
            }`}
          >
            <Calendar className="w-3 h-3" />
            Date Field {isDateEnabled ? `(${dateZone.x}%, ${dateZone.y}%)` : "(Hidden)"}
          </button>

          {/* Signature button */}
          <button
            type="button"
            onClick={() => {
              setActiveTarget("signature");
              setIsPreviewMode(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTarget === "signature" && !isPreviewMode
                ? "bg-purple-600 text-white shadow-sm ring-2 ring-purple-500/30"
                : isSigEnabled
                ? "bg-purple-50 text-purple-800 hover:bg-purple-100"
                : "bg-gray-100 text-gray-400 opacity-60"
            }`}
          >
            <PenTool className="w-3 h-3" />
            Signature PNG {isSigEnabled ? `(${signatureZone.x}%, ${signatureZone.y}%)` : "(Hidden)"}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border cursor-pointer ${
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
            <strong className="capitalize">{activeTarget}</strong> point, or drag the marker directly. Unchecked fields will not appear on the final certificate.
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
            {isNameEnabled && (
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
                  transform: getTransform(nameZone.align, nameZone.rotation),
                  zIndex: activeTarget === "name" ? 30 : 20,
                }}
              >
                {!isPreviewMode && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-blue-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap pointer-events-none">
                    <Target className="w-3 h-3 text-blue-200" />
                    Name ({nameZone.x}%, {nameZone.y}%)
                  </div>
                )}

                {(() => {
                  const { isBold, isItalic } = parseStyleBooleans(nameZone.style);
                  return (
                    <div
                      style={{
                        fontFamily: nameZone.font || "Great Vibes",
                        fontSize: `${scaleFont(nameZone.size)}px`,
                        fontWeight: isBold ? "bold" : "normal",
                        fontStyle: isItalic ? "italic" : "normal",
                        color: nameZone.color || "#1A284A",
                        textAlign: nameZone.align || "center",
                        whiteSpace: "nowrap",
                        lineHeight: 1.2,
                      }}
                    >
                      {previewName}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* REFERENCE ID ZONE OVERLAY */}
            {isRefEnabled && (
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
                  transform: getTransform(refZone.align, refZone.rotation),
                  zIndex: activeTarget === "ref" ? 30 : 20,
                }}
              >
                {!isPreviewMode && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap pointer-events-none">
                    <Target className="w-3 h-3 text-amber-200" />
                    Ref ({refZone.x}%, {refZone.y}%)
                  </div>
                )}

                {(() => {
                  const { isBold, isItalic } = parseStyleBooleans(refZone.style);
                  return (
                    <div
                      style={{
                        fontFamily: refZone.font || "Montserrat",
                        fontSize: `${scaleFont(refZone.size)}px`,
                        fontWeight: isBold ? "bold" : "normal",
                        fontStyle: isItalic ? "italic" : "normal",
                        color: refZone.color || "#29479B",
                        textAlign: refZone.align || "center",
                        whiteSpace: "nowrap",
                        lineHeight: 1.2,
                      }}
                    >
                      {previewRef}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* DATE ZONE OVERLAY */}
            {isDateEnabled && (
              <div
                onMouseDown={(e) => handleMouseDown("date", e)}
                className={`absolute transition-transform select-none ${
                  !isPreviewMode
                    ? "cursor-grab active:cursor-grabbing group p-1 ring-2 ring-dashed ring-emerald-500 bg-emerald-500/10 rounded-md"
                    : ""
                }`}
                style={{
                  left: `${dateZone.x}%`,
                  top: `${dateZone.y}%`,
                  transform: getTransform(dateZone.align, dateZone.rotation),
                  zIndex: activeTarget === "date" ? 30 : 20,
                }}
              >
                {!isPreviewMode && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap pointer-events-none">
                    <Calendar className="w-3 h-3 text-emerald-200" />
                    Date ({dateZone.x}%, {dateZone.y}%)
                  </div>
                )}

                {(() => {
                  const { isBold, isItalic } = parseStyleBooleans(dateZone.style);
                  return (
                    <div
                      style={{
                        fontFamily: dateZone.font || "Montserrat",
                        fontSize: `${scaleFont(dateZone.size)}px`,
                        fontWeight: isBold ? "bold" : "normal",
                        fontStyle: isItalic ? "italic" : "normal",
                        color: dateZone.color || "#1A284A",
                        textAlign: dateZone.align || "center",
                        whiteSpace: "nowrap",
                        lineHeight: 1.2,
                      }}
                    >
                      {dateZone.format || previewDate}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* SIGNATURE PNG ZONE OVERLAY */}
            {isSigEnabled && (
              <div
                onMouseDown={(e) => handleMouseDown("signature", e)}
                className={`absolute transition-transform select-none ${
                  !isPreviewMode
                    ? "cursor-grab active:cursor-grabbing group p-1 ring-2 ring-dashed ring-purple-500 bg-purple-500/10 rounded-md"
                    : ""
                }`}
                style={{
                  left: `${signatureZone.x}%`,
                  top: `${signatureZone.y}%`,
                  transform: `translate(-50%, -50%) rotate(${signatureZone.rotation || 0}deg)`,
                  width: `${signatureZone.width || 16}%`,
                  zIndex: activeTarget === "signature" ? 30 : 20,
                }}
              >
                {!isPreviewMode && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-purple-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap pointer-events-none">
                    <PenTool className="w-3 h-3 text-purple-200" />
                    Signature ({signatureZone.x}%, {signatureZone.y}%)
                  </div>
                )}

                {signatureZone.imageUrl ? (
                  <img
                    src={signatureZone.imageUrl}
                    alt="Signature"
                    className="w-full h-auto block select-none pointer-events-none drop-shadow-xs"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="border border-dashed border-purple-400 bg-purple-50/70 p-2 text-center rounded text-[10px] text-purple-700 font-semibold">
                    Signature PNG
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
