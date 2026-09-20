"use client";

import { useState, useRef, useEffect } from "react";
import { Download, X, Eye, Sparkles, User, Award, CheckCircle2, Sliders } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { useCurrentAdmin } from "../auth/useCurrentAdmin";

export function CertificateTestPreviewModal({ isOpen, onClose, template }) {
  const { admin } = useCurrentAdmin();
  const canvasRef = useRef(null);

  const competitionName = template?.competitionId?.name || "Pedago Competition";
  const refPrefix = template?.competitionId?.refPrefix || "COMP";

  const [testName, setTestName] = useState("");
  const [testRef, setTestRef] = useState("");
  const [containerWidth, setContainerWidth] = useState(800);
  const containerRef = useRef(null);

  // Set default test values from admin data
  useEffect(() => {
    if (isOpen && template) {
      setTestName(admin?.name || "Test admin");
      setTestRef(`${refPrefix}-001`);
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

  const { backgroundImageUrl, nameZone = {}, refZone = {}, variant, version = 1 } = template;

  const scaleFont = (sizePt) => {
    const base = Number(sizePt) || 24;
    const factor = containerWidth / 1000;
    return Math.max(10, Math.round(base * factor * 1.3));
  };

  const getTransform = (align = "center") => {
    if (align === "left") return "translate(0%, -50%)";
    if (align === "right") return "translate(-100%, -50%)";
    return "translate(-50%, -50%)";
  };

  // Generate and download test PNG certificate using HTML5 Canvas
  const handleDownloadSample = () => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = backgroundImageUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.naturalWidth || 1920;
      canvas.height = img.naturalHeight || 1080;

      // Draw background
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Render Name
      if (testName) {
        const nameSizePx = (nameZone.size || 42) * (canvas.width / 1000) * 1.3;
        ctx.font = `${nameSizePx}px "${nameZone.font || "Great Vibes"}", cursive, serif`;
        ctx.fillStyle = nameZone.color || "#1A284A";
        ctx.textAlign = nameZone.align || "center";
        ctx.textBaseline = "middle";

        const nameX = (nameZone.x / 100) * canvas.width;
        const nameY = (nameZone.y / 100) * canvas.height;
        ctx.fillText(testName, nameX, nameY);
      }

      // Render Ref Code
      if (testRef) {
        const refSizePx = (refZone.size || 18) * (canvas.width / 1000) * 1.3;
        ctx.font = `${refSizePx}px "${refZone.font || "Montserrat"}", sans-serif`;
        ctx.fillStyle = refZone.color || "#29479B";
        ctx.textAlign = refZone.align || "center";
        ctx.textBaseline = "middle";

        const refX = (refZone.x / 100) * canvas.width;
        const refY = (refZone.y / 100) * canvas.height;
        ctx.fillText(testRef, refX, refY);
      }

      // Trigger download
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `Test_Certificate_${refPrefix}_${variant}.png`;
      link.href = dataUrl;
      link.click();
    };
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/40 p-4 rounded-xl border border-blue-100">
          <Input
            label="Test Recipient Name (Admin Data)"
            placeholder="e.g. Test admin"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            helperText="Pre-filled with your admin profile name"
          />

          <Input
            label="Test Reference Number"
            placeholder="e.g. NB-001"
            value={testRef}
            onChange={(e) => setTestRef(e.target.value)}
            helperText="Pre-filled with competition demo reference code"
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
            <div
              className="absolute select-none pointer-events-none"
              style={{
                left: `${nameZone.x}%`,
                top: `${nameZone.y}%`,
                transform: getTransform(nameZone.align),
                fontFamily: nameZone.font || "Great Vibes",
                fontSize: `${scaleFont(nameZone.size)}px`,
                color: nameZone.color || "#1A284A",
                textAlign: nameZone.align || "center",
                whiteSpace: "nowrap",
                lineHeight: 1.2,
                zIndex: 20,
              }}
            >
              {testName}
            </div>

            {/* Rendered Ref */}
            <div
              className="absolute select-none pointer-events-none"
              style={{
                left: `${refZone.x}%`,
                top: `${refZone.y}%`,
                transform: getTransform(refZone.align),
                fontFamily: refZone.font || "Montserrat",
                fontSize: `${scaleFont(refZone.size)}px`,
                color: refZone.color || "#29479B",
                textAlign: refZone.align || "center",
                whiteSpace: "nowrap",
                lineHeight: 1.2,
                zIndex: 20,
              }}
            >
              {testRef}
            </div>
          </div>
        </div>

        {/* Template Positioning Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-gray-50 p-3.5 rounded-xl border border-gray-100">
          <div>
            <span className="font-bold text-gray-700 block mb-1">👤 Name Placement:</span>
            <span className="text-gray-500">
              X: <strong className="text-gray-700">{nameZone.x}%</strong>, Y:{" "}
              <strong className="text-gray-700">{nameZone.y}%</strong> | Font:{" "}
              <strong className="text-gray-700">{nameZone.font}</strong> ({nameZone.size}pt) | Color:{" "}
              <strong style={{ color: nameZone.color }}>{nameZone.color}</strong>
            </span>
          </div>
          <div>
            <span className="font-bold text-gray-700 block mb-1">🏷️ Reference Code Placement:</span>
            <span className="text-gray-500">
              X: <strong className="text-gray-700">{refZone.x}%</strong>, Y:{" "}
              <strong className="text-gray-700">{refZone.y}%</strong> | Font:{" "}
              <strong className="text-gray-700">{refZone.font}</strong> ({refZone.size}pt) | Color:{" "}
              <strong style={{ color: refZone.color }}>{refZone.color}</strong>
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
