"use client";

import { useState, useEffect } from "react";
import Cropper from "react-easy-crop";
import {
  Circle,
  Square,
  RectangleVertical,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Grid,
  Check,
  Sparkles,
} from "lucide-react";

/**
 * Interactive Photo Cropper with Rule-of-Thirds Grid, Pan/Zoom,
 * and Shape Selection (Circle, Rounded Square, Rectangle)
 */
export function PosterPhotoCropper({
  imageSrc,
  frameShape = "circle", // 'circle' | 'rounded' | 'rectangle'
  onFrameShapeChange,
  crop,
  onCropChange,
  zoom,
  onZoomChange,
  rotation = 0,
  onRotationChange,
  onCropComplete,
  className = "",
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !imageSrc) return null;

  // Compute aspect ratio and crop shape for react-easy-crop
  const isCircle = frameShape === "circle";
  const isRounded = frameShape === "rounded";
  const isRectangle = frameShape === "rectangle";

  const cropShape = isCircle ? "round" : "rect";
  const aspect = isRectangle ? 3 / 4 : 1;

  const handleZoomIn = () => {
    onZoomChange(Math.min(zoom + 0.2, 3));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(zoom - 0.2, 1));
  };

  const handleRotate = () => {
    onRotationChange((rotation + 90) % 360);
  };

  const handleReset = () => {
    onCropChange({ x: 0, y: 0 });
    onZoomChange(1);
    onRotationChange(0);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Controls: Frame Shape Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
        <div>
          <span className="text-xs font-extrabold text-[#1A284A] block">
            Select Photo Frame Shape:
          </span>
          <span className="text-[11px] text-gray-500">
            Choose how your photo will be framed on the final poster
          </span>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl border border-gray-200">
          <button
            type="button"
            onClick={() => onFrameShapeChange("circle")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isCircle
                ? "bg-white text-[#29479B] shadow-xs border border-gray-200"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Circle className="w-3.5 h-3.5" />
            <span>Circle</span>
          </button>

          <button
            type="button"
            onClick={() => onFrameShapeChange("rounded")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isRounded
                ? "bg-white text-[#29479B] shadow-xs border border-gray-200"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Square className="w-3.5 h-3.5 rounded-xs" />
            <span>Rounded Square</span>
          </button>

          <button
            type="button"
            onClick={() => onFrameShapeChange("rectangle")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isRectangle
                ? "bg-white text-[#29479B] shadow-xs border border-gray-200"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <RectangleVertical className="w-3.5 h-3.5" />
            <span>Rectangle</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Cropper Canvas */}
      <div className="relative w-full h-[360px] sm:h-[420px] bg-slate-900 rounded-2xl overflow-hidden shadow-inner border-2 border-gray-300">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspect}
          cropShape={cropShape}
          showGrid={true}
          onCropChange={onCropChange}
          onCropComplete={onCropComplete}
          onZoomChange={onZoomChange}
          onRotationChange={onRotationChange}
          style={{
            containerStyle: {
              width: "100%",
              height: "100%",
              backgroundColor: "#0F172A",
            },
            cropAreaStyle: {
              border: "3px solid #F59E0B",
              boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.75), 0 0 25px rgba(245, 158, 11, 0.5)",
              borderRadius: isCircle ? "50%" : isRounded ? "24px" : "8px",
            },
          }}
        />

        {/* Floating Hint Overlay */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white px-3 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 pointer-events-none z-10 border border-white/10">
          <Grid className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>Drag & zoom inside the grid to position your face</span>
        </div>

        {/* Active Frame Shape Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-[#1A284A] px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 pointer-events-none z-10 shadow-xs">
          <Sparkles className="w-3 h-3 text-[#F59E0B]" />
          <span className="capitalize">{frameShape} Frame</span>
        </div>
      </div>

      {/* Bottom Controls: Zoom, Rotation & Reset */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Zoom Slider */}
          <div className="flex-1 flex items-center gap-3">
            <button
              type="button"
              onClick={handleZoomOut}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer shrink-0"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <div className="flex-1">
              <div className="flex justify-between text-[11px] font-semibold text-gray-500 mb-1">
                <span>Scale / Zoom</span>
                <span>{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => onZoomChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#29479B]"
              />
            </div>

            <button
              type="button"
              onClick={handleZoomIn}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer shrink-0"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons: Rotate & Reset */}
          <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
            <button
              type="button"
              onClick={handleRotate}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="Rotate 90 degrees"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#29479B]" />
              <span>Rotate 90°</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-50 flex items-center gap-1 transition-all cursor-pointer"
            >
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
