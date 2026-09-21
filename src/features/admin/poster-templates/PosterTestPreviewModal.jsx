"use client";

import { useState, useRef, useEffect } from "react";
import { Download, Eye, Sparkles, User, Award, Sliders, Image as ImageIcon, RotateCcw, UploadCloud } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { useCurrentAdmin } from "../auth/useCurrentAdmin";
import { buildCanvasFont, parseStyleBooleans } from "@/lib/fontConstants";

const DEFAULT_SAMPLE_PHOTO =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80";

export function PosterTestPreviewModal({ isOpen, onClose, template }) {
  const { admin } = useCurrentAdmin();

  const competitionName = template?.competitionId?.name || "Pedago Competition";
  const refPrefix = template?.competitionId?.refPrefix || "COMP";

  const [testName, setTestName] = useState("");
  const [testRef, setTestRef] = useState("");
  const [testPhoto, setTestPhoto] = useState(DEFAULT_SAMPLE_PHOTO);
  const [containerWidth, setContainerWidth] = useState(800);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isOpen && template) {
      setTestName(admin?.name || "Test admin");
      setTestRef(`${refPrefix}-001`);
      setTestPhoto(DEFAULT_SAMPLE_PHOTO);
    }
  }, [isOpen, template, admin, refPrefix]);

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
  }, [isOpen]);

  if (!template) return null;

  const { backgroundImageUrl, photoZone = {}, textZones = [], type, version = 1 } = template;

  const nameZone = textZones.find((z) => z.key === "name") || {
    x: 50,
    y: 82,
    font: "Montserrat",
    size: 26,
    color: "#FFFFFF",
    align: "center",
  };

  const refZone = textZones.find((z) => z.key === "ref") || {
    x: 50,
    y: 88,
    font: "Montserrat",
    size: 16,
    color: "#F59E0B",
    align: "center",
  };

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

  const photoWidthPercent = photoZone.w || 25;
  const photoShapeClass =
    photoZone.shape === "circle"
      ? "rounded-full"
      : photoZone.shape === "rounded"
      ? "rounded-2xl"
      : "rounded-none";

  // Generate and download test PNG poster using HTML5 Canvas
  const handleDownloadSample = () => {
    const bgImg = new Image();
    bgImg.crossOrigin = "anonymous";
    bgImg.src = backgroundImageUrl;

    bgImg.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = bgImg.naturalWidth || 1200;
      canvas.height = bgImg.naturalHeight || 1600;

      // Draw background poster
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      // Load and clip user photo
      const userImg = new Image();
      userImg.crossOrigin = "anonymous";
      userImg.src = testPhoto;

      const finishRender = () => {
        // Render Name text
        if (testName) {
          const nameSizePx = (nameZone.size || 26) * (canvas.width / 1000) * 1.3;
          ctx.font = buildCanvasFont({
            font: nameZone.font || "Montserrat",
            size: nameSizePx,
            style: nameZone.style || "bold",
          });
          ctx.fillStyle = nameZone.color || "#FFFFFF";
          ctx.textAlign = nameZone.align || "center";
          ctx.textBaseline = "middle";
          ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
          ctx.shadowBlur = 8;

          const nameX = (nameZone.x / 100) * canvas.width;
          const nameY = (nameZone.y / 100) * canvas.height;
          ctx.fillText(testName, nameX, nameY);
          ctx.shadowBlur = 0;
        }

        // Render Ref Code text
        if (testRef) {
          const refSizePx = (refZone.size || 16) * (canvas.width / 1000) * 1.3;
          ctx.font = buildCanvasFont({
            font: refZone.font || "Montserrat",
            size: refSizePx,
            style: refZone.style || "normal",
          });
          ctx.fillStyle = refZone.color || "#F59E0B";
          ctx.textAlign = refZone.align || "center";
          ctx.textBaseline = "middle";
          ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
          ctx.shadowBlur = 6;

          const refX = (refZone.x / 100) * canvas.width;
          const refY = (refZone.y / 100) * canvas.height;
          ctx.fillText(testRef, refX, refY);
          ctx.shadowBlur = 0;
        }

        // Download
        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `Test_Poster_${refPrefix}_${type}.png`;
        link.href = dataUrl;
        link.click();
      };

      userImg.onload = () => {
        const photoPixelWidth = ((photoZone.w || 25) / 100) * canvas.width;
        const photoPixelHeight = photoPixelWidth; // Square aspect ratio
        const photoCenterX = (photoZone.x / 100) * canvas.width;
        const photoCenterY = (photoZone.y / 100) * canvas.height;
        const photoLeft = photoCenterX - photoPixelWidth / 2;
        const photoTop = photoCenterY - photoPixelHeight / 2;

        ctx.save();
        ctx.beginPath();
        if (photoZone.shape === "circle") {
          ctx.arc(photoCenterX, photoCenterY, photoPixelWidth / 2, 0, Math.PI * 2);
        } else if (photoZone.shape === "rounded") {
          const r = 24 * (canvas.width / 1000);
          ctx.roundRect(photoLeft, photoTop, photoPixelWidth, photoPixelHeight, [r]);
        } else {
          ctx.rect(photoLeft, photoTop, photoPixelWidth, photoPixelHeight);
        }
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(userImg, photoLeft, photoTop, photoPixelWidth, photoPixelHeight);
        ctx.restore();

        finishRender();
      };

      userImg.onerror = () => {
        finishRender();
      };
    };
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Poster Test Preview"
      className="max-w-4xl"
    >
      <div className="space-y-6 max-h-[82vh] overflow-y-auto pr-1">
        {/* Header Meta */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
          <div>
            <h3 className="font-extrabold text-base text-[#1A284A]">{competitionName}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Poster Version: <span className="font-bold text-gray-700">v{version}</span> | Shape:{" "}
              <strong className="capitalize text-emerald-700">{photoZone.shape || "circle"}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={type === "winner" ? "warning" : "info"} className="capitalize gap-1.5 font-bold">
              {type === "winner" ? <Award className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              {type} Poster
            </Badge>
          </div>
        </div>

        {/* Test Inputs & Photo Cutout Controls */}
        <div className="space-y-3 bg-emerald-50/40 p-4 rounded-xl border border-emerald-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Test Recipient Name (Admin Data)"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              helperText="Pre-filled with your admin profile"
            />

            <Input
              label="Test Reference Number"
              value={testRef}
              onChange={(e) => setTestRef(e.target.value)}
              helperText="Pre-filled with demo ref code"
            />
          </div>

          {/* Test Photo Upload & Presets */}
          <div className="pt-2 border-t border-emerald-200/50 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                Test Photo for Cutout Zone
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTestPhoto(DEFAULT_SAMPLE_PHOTO)}
                  className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/60 hover:bg-emerald-100 rounded-md transition-colors"
                >
                  Reset Default Photo
                </button>
                {admin?.photo && (
                  <button
                    type="button"
                    onClick={() => setTestPhoto(admin.photo)}
                    className="px-2 py-1 text-[11px] font-semibold text-blue-700 bg-blue-100/60 hover:bg-blue-100 rounded-md transition-colors flex items-center gap-1"
                  >
                    <User className="w-3 h-3" />
                    Use My Profile Photo
                  </button>
                )}
              </div>
            </div>

            <ImageUpload
              value={testPhoto}
              onChange={(url) => setTestPhoto(url || DEFAULT_SAMPLE_PHOTO)}
              helpText="Upload a portrait photo (hosted on ImgBB / Postimages) or paste image link to test circle/square/rounded cutouts"
            />
          </div>
        </div>

        {/* Live Poster Render Canvas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-semibold text-gray-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Live Rendered Poster
            </span>
            <span>Scale: Responsive Canvas</span>
          </div>

          <div
            ref={containerRef}
            className="relative w-full rounded-xl overflow-hidden border-2 border-gray-200 shadow-md bg-white select-none max-w-lg mx-auto"
          >
            <img
              src={backgroundImageUrl}
              alt="Poster Preview"
              className="w-full h-auto block select-none pointer-events-none"
              crossOrigin="anonymous"
            />

            {/* Rendered User Photo */}
            <div
              className={`absolute overflow-hidden select-none pointer-events-none ${photoShapeClass}`}
              style={{
                left: `${photoZone.x}%`,
                top: `${photoZone.y}%`,
                width: `${photoWidthPercent}%`,
                aspectRatio: "1/1",
                transform: "translate(-50%, -50%)",
                zIndex: 20,
              }}
            >
              <img
                src={testPhoto}
                alt="Participant"
                className={`w-full h-full object-cover select-none pointer-events-none ${photoShapeClass}`}
                crossOrigin="anonymous"
              />
            </div>

            {/* Rendered Name */}
            {(() => {
              const { isBold, isItalic } = parseStyleBooleans(nameZone.style);
              return (
                <div
                  className="absolute select-none pointer-events-none"
                  style={{
                    left: `${nameZone.x}%`,
                    top: `${nameZone.y}%`,
                    transform: getTransform(nameZone.align),
                    fontFamily: nameZone.font || "Montserrat",
                    fontSize: `${scaleFont(nameZone.size)}px`,
                    fontWeight: isBold ? "bold" : "normal",
                    fontStyle: isItalic ? "italic" : "normal",
                    color: nameZone.color || "#FFFFFF",
                    textAlign: nameZone.align || "center",
                    whiteSpace: "nowrap",
                    lineHeight: 1.2,
                    textShadow: "0 2px 4px rgba(0,0,0,0.6)",
                    zIndex: 25,
                  }}
                >
                  {testName}
                </div>
              );
            })()}

            {/* Rendered Ref */}
            {(() => {
              const { isBold, isItalic } = parseStyleBooleans(refZone.style);
              return (
                <div
                  className="absolute select-none pointer-events-none"
                  style={{
                    left: `${refZone.x}%`,
                    top: `${refZone.y}%`,
                    transform: getTransform(refZone.align),
                    fontFamily: refZone.font || "Montserrat",
                    fontSize: `${scaleFont(refZone.size)}px`,
                    fontWeight: isBold ? "bold" : "normal",
                    fontStyle: isItalic ? "italic" : "normal",
                    color: refZone.color || "#F59E0B",
                    textAlign: refZone.align || "center",
                    whiteSpace: "nowrap",
                    lineHeight: 1.2,
                    textShadow: "0 2px 4px rgba(0,0,0,0.6)",
                    zIndex: 25,
                  }}
                >
                  {testRef}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Positioning Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-gray-50 p-3.5 rounded-xl border border-gray-100">
          <div>
            <span className="font-bold text-gray-700 block mb-1">🖼️ Photo Placement:</span>
            <span className="text-gray-500">
              Center: <strong className="text-gray-700">{photoZone.x}%, {photoZone.y}%</strong> | Width:{" "}
              <strong className="text-gray-700">{photoZone.w || 25}%</strong> | Shape:{" "}
              <strong className="text-gray-700 capitalize">{photoZone.shape || "circle"}</strong>
            </span>
          </div>

          <div>
            <span className="font-bold text-gray-700 block mb-1">👤 Name Placement:</span>
            <span className="text-gray-500">
              Center: <strong className="text-gray-700">{nameZone.x}%, {nameZone.y}%</strong> | Font:{" "}
              <strong className="text-gray-700">{nameZone.font}</strong> ({nameZone.size}pt, {nameZone.style || "bold"})
            </span>
          </div>

          <div>
            <span className="font-bold text-gray-700 block mb-1">🏷️ Ref Code Placement:</span>
            <span className="text-gray-500">
              Center: <strong className="text-gray-700">{refZone.x}%, {refZone.y}%</strong> | Font:{" "}
              <strong className="text-gray-700">{refZone.font}</strong> ({refZone.size}pt, {refZone.style || "normal"})
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={handleDownloadSample}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Download className="w-4 h-4" /> Download Sample Poster (.PNG)
          </Button>
        </div>
      </div>
    </Modal>
  );
}
