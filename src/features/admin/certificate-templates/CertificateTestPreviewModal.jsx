"use client";

import { useState, useRef, useEffect } from "react";
import { Download, X, Eye, Sparkles, User, Award, CheckCircle2, Sliders, Calendar, PenTool } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { useCurrentAdmin } from "../auth/useCurrentAdmin";
import { buildCanvasFont, parseStyleBooleans } from "@/lib/fontConstants";

export function CertificateTestPreviewModal({ isOpen, onClose, template }) {
  const { admin } = useCurrentAdmin();
  const canvasRef = useRef(null);

  const competitionName = template?.competitionId?.name || "Pedago Competition";
  const refPrefix = template?.competitionId?.refPrefix || "COMP";

  const [testName, setTestName] = useState("");
  const [testRef, setTestRef] = useState("");
  const [testDate, setTestDate] = useState("");
  const [containerWidth, setContainerWidth] = useState(800);
  const containerRef = useRef(null);

  // Set default test values from admin data
  useEffect(() => {
    if (isOpen && template) {
      setTestName(admin?.name || "Alex Rahman");
      setTestRef(`${refPrefix}-001`);
      setTestDate(template?.dateZone?.format || "20 September 2026");
    }
  }, [isOpen, template, admin, refPrefix]);

  // Track container width for responsive font scaling
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

  const {
    backgroundImageUrl,
    nameZone = {},
    refZone = {},
    dateZone = {},
    signatureZone = {},
    variant,
    version = 1,
  } = template;

  const isNameEnabled = nameZone.enabled !== false;
  const isRefEnabled = refZone.enabled !== false;
  const isDateEnabled = Boolean(dateZone.enabled);
  const isSigEnabled = Boolean(signatureZone.enabled);

  const scaleFont = (sizePt) => {
    const base = Number(sizePt) || 24;
    const factor = containerWidth / 1000;
    return Math.max(10, Math.round(base * factor * 1.3));
  };

  const getTransform = (align = "center", rotation = 0) => {
    let translate = "translate(-50%, -50%)";
    if (align === "left") translate = "translate(0%, -50%)";
    if (align === "right") translate = "translate(-100%, -50%)";
    return `${translate} rotate(${rotation || 0}deg)`;
  };

  // Generate and download test PNG certificate using HTML5 Canvas
  const handleDownloadSample = () => {
    const bgImg = new Image();
    bgImg.crossOrigin = "anonymous";
    bgImg.src = backgroundImageUrl;

    const loadImages = [
      new Promise((res, rej) => {
        bgImg.onload = () => res(bgImg);
        bgImg.onerror = rej;
      }),
    ];

    let sigImg = null;
    if (isSigEnabled && signatureZone.imageUrl) {
      sigImg = new Image();
      sigImg.crossOrigin = "anonymous";
      sigImg.src = signatureZone.imageUrl;
      loadImages.push(
        new Promise((res) => {
          sigImg.onload = () => res(sigImg);
          sigImg.onerror = () => res(null); // gracefully continue if signature fails
        })
      );
    }

    Promise.all(loadImages).then(() => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = bgImg.naturalWidth || 1920;
      canvas.height = bgImg.naturalHeight || 1080;

      // Draw background
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      // Render Name
      if (isNameEnabled && testName) {
        const nameSizePx = (nameZone.size || 42) * (canvas.width / 1000) * 1.3;
        const fontStr = buildCanvasFont({
          font: nameZone.font || "Great Vibes",
          size: nameSizePx,
          style: nameZone.style || "normal",
        });
        const nameX = (nameZone.x / 100) * canvas.width;
        const nameY = (nameZone.y / 100) * canvas.height;

        ctx.save();
        ctx.translate(nameX, nameY);
        if (nameZone.rotation) {
          ctx.rotate((nameZone.rotation * Math.PI) / 180);
        }
        ctx.font = fontStr;
        ctx.fillStyle = nameZone.color || "#1A284A";
        ctx.textAlign = nameZone.align || "center";
        ctx.textBaseline = "middle";
        ctx.fillText(testName, 0, 0);
        ctx.restore();
      }

      // Render Ref Code
      if (isRefEnabled && testRef) {
        const refSizePx = (refZone.size || 18) * (canvas.width / 1000) * 1.3;
        const fontStr = buildCanvasFont({
          font: refZone.font || "Montserrat",
          size: refSizePx,
          style: refZone.style || "normal",
        });
        const refX = (refZone.x / 100) * canvas.width;
        const refY = (refZone.y / 100) * canvas.height;

        ctx.save();
        ctx.translate(refX, refY);
        if (refZone.rotation) {
          ctx.rotate((refZone.rotation * Math.PI) / 180);
        }
        ctx.font = fontStr;
        ctx.fillStyle = refZone.color || "#29479B";
        ctx.textAlign = refZone.align || "center";
        ctx.textBaseline = "middle";
        ctx.fillText(testRef, 0, 0);
        ctx.restore();
      }

      // Render Date Field
      if (isDateEnabled && testDate) {
        const dateSizePx = (dateZone.size || 16) * (canvas.width / 1000) * 1.3;
        const fontStr = buildCanvasFont({
          font: dateZone.font || "Montserrat",
          size: dateSizePx,
          style: dateZone.style || "normal",
        });
        const dateX = (dateZone.x / 100) * canvas.width;
        const dateY = (dateZone.y / 100) * canvas.height;

        ctx.save();
        ctx.translate(dateX, dateY);
        if (dateZone.rotation) {
          ctx.rotate((dateZone.rotation * Math.PI) / 180);
        }
        ctx.font = fontStr;
        ctx.fillStyle = dateZone.color || "#1A284A";
        ctx.textAlign = dateZone.align || "center";
        ctx.textBaseline = "middle";
        ctx.fillText(testDate, 0, 0);
        ctx.restore();
      }

      // Render Signature PNG
      if (isSigEnabled && sigImg && sigImg.complete && sigImg.naturalWidth) {
        const sigWidth = ((signatureZone.width || 16) / 100) * canvas.width;
        const aspect = sigImg.naturalHeight / sigImg.naturalWidth;
        const sigHeight = sigWidth * aspect;
        const sigX = (signatureZone.x / 100) * canvas.width;
        const sigY = (signatureZone.y / 100) * canvas.height;

        ctx.save();
        ctx.translate(sigX, sigY);
        if (signatureZone.rotation) {
          ctx.rotate((signatureZone.rotation * Math.PI) / 180);
        }
        ctx.drawImage(sigImg, -sigWidth / 2, -sigHeight / 2, sigWidth, sigHeight);
        ctx.restore();
      }

      // Trigger download
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `Test_Certificate_${refPrefix}_${variant}.png`;
      link.href = dataUrl;
      link.click();
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Certificate Test Preview"
      className="max-w-4xl"
    >
      <div className="space-y-6 max-h-[82vh] overflow-y-auto pr-1">
        {/* Header Meta Info */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
          <div>
            <h3 className="font-extrabold text-base text-[#1A284A]">{competitionName}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Template Version: <span className="font-bold text-gray-700">v{version}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={variant === "winner" ? "warning" : "info"} className="capitalize gap-1.5">
              {variant === "winner" ? <Award className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              {variant} Variant
            </Badge>
          </div>
        </div>

        {/* Test Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-blue-50/40 p-4 rounded-xl border border-blue-100">
          <Input
            label="Test Recipient Name"
            placeholder="e.g. Alex Rahman"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            disabled={!isNameEnabled}
            helperText={isNameEnabled ? "Pre-filled with test name" : "Field disabled in template"}
          />

          <Input
            label="Test Reference Code"
            placeholder="e.g. NB-001"
            value={testRef}
            onChange={(e) => setTestRef(e.target.value)}
            disabled={!isRefEnabled}
            helperText={isRefEnabled ? "Pre-filled with reference code" : "Field disabled in template"}
          />

          <Input
            label="Test Date"
            placeholder="e.g. 20 September 2026"
            value={testDate}
            onChange={(e) => setTestDate(e.target.value)}
            disabled={!isDateEnabled}
            helperText={isDateEnabled ? "Pre-filled with issue date" : "Field disabled in template"}
          />
        </div>

        {/* Live Certificate Render Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-semibold text-gray-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Live Rendered Output
            </span>
            <span>Scale: Responsive Canvas</span>
          </div>

          <div
            ref={containerRef}
            className="relative w-full rounded-xl overflow-hidden border-2 border-gray-200 shadow-md bg-white select-none"
          >
            <img
              src={backgroundImageUrl}
              alt="Certificate Preview"
              className="w-full h-auto block select-none pointer-events-none"
              crossOrigin="anonymous"
            />

            {/* Rendered Name */}
            {isNameEnabled && (
              <div
                className="absolute select-none pointer-events-none"
                style={{
                  left: `${nameZone.x}%`,
                  top: `${nameZone.y}%`,
                  transform: getTransform(nameZone.align, nameZone.rotation),
                  fontFamily: nameZone.font || "Great Vibes",
                  fontSize: `${scaleFont(nameZone.size)}px`,
                  fontWeight: parseStyleBooleans(nameZone.style).isBold ? "bold" : "normal",
                  fontStyle: parseStyleBooleans(nameZone.style).isItalic ? "italic" : "normal",
                  color: nameZone.color || "#1A284A",
                  textAlign: nameZone.align || "center",
                  whiteSpace: "nowrap",
                  lineHeight: 1.2,
                  zIndex: 20,
                }}
              >
                {testName}
              </div>
            )}

            {/* Rendered Ref */}
            {isRefEnabled && (
              <div
                className="absolute select-none pointer-events-none"
                style={{
                  left: `${refZone.x}%`,
                  top: `${refZone.y}%`,
                  transform: getTransform(refZone.align, refZone.rotation),
                  fontFamily: refZone.font || "Montserrat",
                  fontSize: `${scaleFont(refZone.size)}px`,
                  fontWeight: parseStyleBooleans(refZone.style).isBold ? "bold" : "normal",
                  fontStyle: parseStyleBooleans(refZone.style).isItalic ? "italic" : "normal",
                  color: refZone.color || "#29479B",
                  textAlign: refZone.align || "center",
                  whiteSpace: "nowrap",
                  lineHeight: 1.2,
                  zIndex: 20,
                }}
              >
                {testRef}
              </div>
            )}

            {/* Rendered Date */}
            {isDateEnabled && (
              <div
                className="absolute select-none pointer-events-none"
                style={{
                  left: `${dateZone.x}%`,
                  top: `${dateZone.y}%`,
                  transform: getTransform(dateZone.align, dateZone.rotation),
                  fontFamily: dateZone.font || "Montserrat",
                  fontSize: `${scaleFont(dateZone.size)}px`,
                  fontWeight: parseStyleBooleans(dateZone.style).isBold ? "bold" : "normal",
                  fontStyle: parseStyleBooleans(dateZone.style).isItalic ? "italic" : "normal",
                  color: dateZone.color || "#1A284A",
                  textAlign: dateZone.align || "center",
                  whiteSpace: "nowrap",
                  lineHeight: 1.2,
                  zIndex: 20,
                }}
              >
                {testDate}
              </div>
            )}

            {/* Rendered Signature PNG */}
            {isSigEnabled && signatureZone.imageUrl && (
              <div
                className="absolute select-none pointer-events-none"
                style={{
                  left: `${signatureZone.x}%`,
                  top: `${signatureZone.y}%`,
                  width: `${signatureZone.width || 16}%`,
                  transform: `translate(-50%, -50%) rotate(${signatureZone.rotation || 0}deg)`,
                  zIndex: 20,
                }}
              >
                <img
                  src={signatureZone.imageUrl}
                  alt="Signature"
                  className="w-full h-auto block select-none pointer-events-none drop-shadow-xs"
                  crossOrigin="anonymous"
                />
              </div>
            )}
          </div>
        </div>

        {/* Template Positioning Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs bg-gray-50 p-3.5 rounded-xl border border-gray-100">
          <div>
            <span className="font-bold text-gray-700 block mb-1">👤 Name:</span>
            <span className="text-gray-500">
              {isNameEnabled ? `${nameZone.x}%, ${nameZone.y}% (Rot: ${nameZone.rotation || 0}°)` : "Disabled"}
            </span>
          </div>
          <div>
            <span className="font-bold text-gray-700 block mb-1">🏷️ Ref ID:</span>
            <span className="text-gray-500">
              {isRefEnabled ? `${refZone.x}%, ${refZone.y}% (Rot: ${refZone.rotation || 0}°)` : "Disabled"}
            </span>
          </div>
          <div>
            <span className="font-bold text-gray-700 block mb-1">📅 Date:</span>
            <span className="text-gray-500">
              {isDateEnabled ? `${dateZone.x}%, ${dateZone.y}% (Rot: ${dateZone.rotation || 0}°)` : "Disabled"}
            </span>
          </div>
          <div>
            <span className="font-bold text-gray-700 block mb-1">✍️ Signature:</span>
            <span className="text-gray-500">
              {isSigEnabled ? `${signatureZone.x}%, ${signatureZone.y}% (Width: ${signatureZone.width || 16}%, Rot: ${signatureZone.rotation || 0}°)` : "Disabled"}
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
            <Download className="w-4 h-4" /> Download Sample Certificate (.PNG)
          </Button>
        </div>
      </div>
    </Modal>
  );
}
