"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  Sparkles,
  UploadCloud,
  Target,
  Sliders,
  CheckCircle,
  Bold,
  Italic,
  RotateCw,
  Calendar,
  PenTool,
  CheckSquare,
  Square,
  Eye,
} from "lucide-react";
import { useCompetitions } from "../competitions/useCompetitions";
import { useCertificateTemplates } from "./useCertificateTemplates";
import { useCurrentAdmin } from "../auth/useCurrentAdmin";
import { CertificateCanvasPointPicker } from "./CertificateCanvasPointPicker";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { toast } from "react-toastify";
import {
  FONT_OPTIONS,
  parseStyleBooleans,
  serializeStyleString,
} from "@/lib/fontConstants";

export function CertificateTemplateDesigner({ initialTemplate, onBack, onSaved }) {
  const { competitions } = useCompetitions();
  const { templates, saveTemplate, isSaving } = useCertificateTemplates();
  const { admin } = useCurrentAdmin();

  const [selectedCompetitionId, setSelectedCompetitionId] = useState(
    initialTemplate?.competitionId?._id || initialTemplate?.competitionId || ""
  );
  const [selectedVariant, setSelectedVariant] = useState(
    initialTemplate?.variant || "participant"
  );
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(
    initialTemplate?.backgroundImageUrl || ""
  );

  // Name Zone state
  const [nameZone, setNameZone] = useState({
    x: initialTemplate?.nameZone?.x ?? 50,
    y: initialTemplate?.nameZone?.y ?? 46,
    font: initialTemplate?.nameZone?.font || "Great Vibes",
    size: initialTemplate?.nameZone?.size ?? 44,
    color: initialTemplate?.nameZone?.color || "#1A284A",
    align: initialTemplate?.nameZone?.align || "center",
    style: initialTemplate?.nameZone?.style || "normal",
    rotation: initialTemplate?.nameZone?.rotation ?? 0,
    enabled: initialTemplate?.nameZone?.enabled !== false,
  });

  // Reference Code Zone state
  const [refZone, setRefZone] = useState({
    x: initialTemplate?.refZone?.x ?? 50,
    y: initialTemplate?.refZone?.y ?? 78,
    font: initialTemplate?.refZone?.font || "Montserrat",
    size: initialTemplate?.refZone?.size ?? 16,
    color: initialTemplate?.refZone?.color || "#29479B",
    align: initialTemplate?.refZone?.align || "center",
    style: initialTemplate?.refZone?.style || "normal",
    rotation: initialTemplate?.refZone?.rotation ?? 0,
    enabled: initialTemplate?.refZone?.enabled !== false,
  });

  // Date Zone state
  const [dateZone, setDateZone] = useState({
    x: initialTemplate?.dateZone?.x ?? 25,
    y: initialTemplate?.dateZone?.y ?? 85,
    font: initialTemplate?.dateZone?.font || "Montserrat",
    size: initialTemplate?.dateZone?.size ?? 16,
    color: initialTemplate?.dateZone?.color || "#1A284A",
    align: initialTemplate?.dateZone?.align || "center",
    style: initialTemplate?.dateZone?.style || "normal",
    rotation: initialTemplate?.dateZone?.rotation ?? 0,
    format: initialTemplate?.dateZone?.format || "20 September 2026",
    enabled: Boolean(initialTemplate?.dateZone?.enabled),
  });

  // Signature PNG Zone state
  const [signatureZone, setSignatureZone] = useState({
    imageUrl: initialTemplate?.signatureZone?.imageUrl || "",
    x: initialTemplate?.signatureZone?.x ?? 75,
    y: initialTemplate?.signatureZone?.y ?? 85,
    width: initialTemplate?.signatureZone?.width ?? 16,
    rotation: initialTemplate?.signatureZone?.rotation ?? 0,
    enabled: Boolean(initialTemplate?.signatureZone?.enabled),
  });

  // Automatically select first competition if none selected
  useEffect(() => {
    if (competitions.length > 0 && !selectedCompetitionId) {
      setSelectedCompetitionId(competitions[0]._id);
    }
  }, [competitions, selectedCompetitionId]);

  // If competition/variant changes, load existing template if available
  useEffect(() => {
    if (selectedCompetitionId && templates && !initialTemplate) {
      const match = templates.find(
        (t) =>
          (t.competitionId?._id || t.competitionId) === selectedCompetitionId &&
          t.variant === selectedVariant
      );
      if (match) {
        setBackgroundImageUrl(match.backgroundImageUrl || "");

        const normNameX = match.nameZone?.x > 100 ? 50 : (match.nameZone?.x ?? 50);
        const normNameY = match.nameZone?.y > 100 ? 46 : (match.nameZone?.y ?? 46);
        const normRefX = match.refZone?.x > 100 ? 50 : (match.refZone?.x ?? 50);
        const normRefY = match.refZone?.y > 100 ? 78 : (match.refZone?.y ?? 78);

        setNameZone({
          x: normNameX,
          y: normNameY,
          font: match.nameZone?.font || "Great Vibes",
          size: match.nameZone?.size ?? 44,
          color: match.nameZone?.color || "#1A284A",
          align: match.nameZone?.align || "center",
          style: match.nameZone?.style || "normal",
          rotation: match.nameZone?.rotation ?? 0,
          enabled: match.nameZone?.enabled !== false,
        });

        setRefZone({
          x: normRefX,
          y: normRefY,
          font: match.refZone?.font || "Montserrat",
          size: match.refZone?.size ?? 16,
          color: match.refZone?.color || "#29479B",
          align: match.refZone?.align || "center",
          style: match.refZone?.style || "normal",
          rotation: match.refZone?.rotation ?? 0,
          enabled: match.refZone?.enabled !== false,
        });

        if (match.dateZone) {
          setDateZone({
            x: match.dateZone.x ?? 25,
            y: match.dateZone.y ?? 85,
            font: match.dateZone.font || "Montserrat",
            size: match.dateZone.size ?? 16,
            color: match.dateZone.color || "#1A284A",
            align: match.dateZone.align || "center",
            style: match.dateZone.style || "normal",
            rotation: match.dateZone.rotation ?? 0,
            format: match.dateZone.format || "20 September 2026",
            enabled: Boolean(match.dateZone.enabled),
          });
        }

        if (match.signatureZone) {
          setSignatureZone({
            imageUrl: match.signatureZone.imageUrl || "",
            x: match.signatureZone.x ?? 75,
            y: match.signatureZone.y ?? 85,
            width: match.signatureZone.width ?? 16,
            rotation: match.signatureZone.rotation ?? 0,
            enabled: Boolean(match.signatureZone.enabled),
          });
        }
      }
    }
  }, [selectedCompetitionId, selectedVariant, templates, initialTemplate]);

  const selectedComp = competitions.find((c) => c._id === selectedCompetitionId);
  const compPrefix = selectedComp?.refPrefix || "COMP";
  const previewAdminName = admin?.name || "Alex Rahman";
  const previewDemoRef = `${compPrefix}-001`;

  const handleSave = async (e) => {
    e.preventDefault();

    if (!selectedCompetitionId) {
      toast.error("Please select a competition");
      return;
    }

    if (!backgroundImageUrl) {
      toast.error("Please upload or provide a Certificate Background Design");
      return;
    }

    try {
      await saveTemplate({
        competitionId: selectedCompetitionId,
        variant: selectedVariant,
        backgroundImageUrl,
        nameZone: {
          ...nameZone,
          x: Number(nameZone.x),
          y: Number(nameZone.y),
          size: Number(nameZone.size),
          rotation: Number(nameZone.rotation) || 0,
          enabled: Boolean(nameZone.enabled),
        },
        refZone: {
          ...refZone,
          x: Number(refZone.x),
          y: Number(refZone.y),
          size: Number(refZone.size),
          rotation: Number(refZone.rotation) || 0,
          enabled: Boolean(refZone.enabled),
        },
        dateZone: {
          ...dateZone,
          x: Number(dateZone.x),
          y: Number(dateZone.y),
          size: Number(dateZone.size),
          rotation: Number(dateZone.rotation) || 0,
          enabled: Boolean(dateZone.enabled),
        },
        signatureZone: {
          ...signatureZone,
          x: Number(signatureZone.x),
          y: Number(signatureZone.y),
          width: Number(signatureZone.width) || 16,
          rotation: Number(signatureZone.rotation) || 0,
          enabled: Boolean(signatureZone.enabled),
        },
      });

      if (onSaved) {
        onSaved();
      } else if (onBack) {
        onBack();
      }
    } catch (err) {
      // Handled in hook
    }
  };

  const compOptions = competitions.map((c) => ({
    label: `${c.name} (${c.refPrefix})`,
    value: c._id,
  }));

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onBack}
              className="gap-1.5 text-gray-600"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Templates
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-extrabold text-[#1A284A]">
              {initialTemplate ? "Edit Certificate Template" : "Certificate Template Designer"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Upload design, place points for Name, Ref ID, Date & Signature PNG with rotation & visibility controls
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            disabled={isSaving || !backgroundImageUrl}
            className="gap-2 shadow-sm"
          >
            {isSaving ? (
              <>
                <Spinner size="sm" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Template Configuration
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Step 1: Select Competition and Variant */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Step 1: Select Competition *"
          value={selectedCompetitionId}
          onChange={(e) => setSelectedCompetitionId(e.target.value)}
          options={compOptions.length > 0 ? compOptions : [{ label: "No competitions available", value: "" }]}
        />

        <Select
          label="Step 2: Certificate Variant *"
          value={selectedVariant}
          onChange={(e) => setSelectedVariant(e.target.value)}
          options={[
            { label: "Participant Variant", value: "participant" },
            { label: "Winner Variant", value: "winner" },
          ]}
        />
      </div>

      {/* Step 2: Upload Certificate Background Design */}
      <Card className="p-5">
        <div className="mb-2">
          <label className="block text-sm font-bold text-[#1A284A]">
            Step 3: Upload Certificate Design (Background Image) *
          </label>
          <p className="text-xs text-gray-500 mt-0.5">
            Upload the high-resolution certificate artwork (recommended 1920×1080 or A4 ratio). Hosted automatically on ImgBB / Postimages.
          </p>
        </div>

        <ImageUpload
          value={backgroundImageUrl}
          onChange={(url) => setBackgroundImageUrl(url)}
          placeholder="Upload certificate template image (.png, .jpg) or enter URL"
        />
      </Card>

      {/* Step 3: Interactive Point-Picker Canvas */}
      <Card className="p-5 space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#1A284A] flex items-center gap-2">
              <Target className="w-5 h-5 text-[#29479B]" />
              Step 4: Interactive Point Placement on Certificate
            </h3>
            <Badge variant="info" className="gap-1">
              <Sparkles className="w-3 h-3" /> Click anywhere on image to position active point
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Select an active placement target (<strong>Name</strong>, <strong>Reference ID</strong>, <strong>Date</strong>, or <strong>Signature</strong>) and click directly on the canvas to place it. Unchecked fields will not appear.
          </p>
        </div>

        <CertificateCanvasPointPicker
          backgroundImageUrl={backgroundImageUrl}
          nameZone={nameZone}
          refZone={refZone}
          dateZone={dateZone}
          signatureZone={signatureZone}
          onNameZoneChange={(updated) => setNameZone(updated)}
          onRefZoneChange={(updated) => setRefZone(updated)}
          onDateZoneChange={(updated) => setDateZone(updated)}
          onSignatureZoneChange={(updated) => setSignatureZone(updated)}
          previewName={previewAdminName}
          previewRef={previewDemoRef}
          previewDate={dateZone.format || "20 September 2026"}
        />
      </Card>

      {/* Step 4: Configuration & Styling Controls for ALL 4 Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. RECIPIENT NAME ZONE */}
        <Card className={`p-5 space-y-4 border-t-4 transition-all ${nameZone.enabled ? "border-t-blue-600 bg-white" : "border-t-gray-300 bg-gray-50/60"}`}>
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={nameZone.enabled}
                  onChange={(e) => setNameZone({ ...nameZone, enabled: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-[#29479B] cursor-pointer"
                />
                <span className="font-bold text-base text-[#1A284A]">👤 Recipient Name Field</span>
              </label>
            </div>
            <Badge variant={nameZone.enabled ? "info" : "default"}>
              {nameZone.enabled ? `Point: ${nameZone.x}%, ${nameZone.y}%` : "Hidden (Unchecked)"}
            </Badge>
          </div>

          {nameZone.enabled ? (
            <div className="space-y-3">
              <Select
                label="Font Family"
                value={nameZone.font}
                onChange={(e) => setNameZone({ ...nameZone, font: e.target.value })}
                options={FONT_OPTIONS}
              />

              {/* Font Size, Bold & Italic Controls */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">Typography & Style</span>
                  {(() => {
                    const { isBold, isItalic } = parseStyleBooleans(nameZone.style);
                    return (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          title="Toggle Bold"
                          onClick={() =>
                            setNameZone({
                              ...nameZone,
                              style: serializeStyleString(!isBold, isItalic),
                            })
                          }
                          className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            isBold
                              ? "bg-[#29479B] text-white border-[#29479B] shadow-xs"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          <Bold className="w-3.5 h-3.5" /> Bold
                        </button>
                        <button
                          type="button"
                          title="Toggle Italic"
                          onClick={() =>
                            setNameZone({
                              ...nameZone,
                              style: serializeStyleString(isBold, !isItalic),
                            })
                          }
                          className={`px-2.5 py-1 rounded-lg border text-xs italic flex items-center gap-1 transition-all cursor-pointer ${
                            isItalic
                              ? "bg-[#29479B] text-white border-[#29479B] shadow-xs"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          <Italic className="w-3.5 h-3.5" /> Italic
                        </button>
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Font Size</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="12"
                        max="120"
                        value={nameZone.size}
                        onChange={(e) =>
                          setNameZone({ ...nameZone, size: Number(e.target.value) || 12 })
                        }
                        className="w-16 px-1.5 py-0.5 text-xs text-center font-bold border border-gray-300 rounded bg-white"
                      />
                      <span className="text-gray-400">pt</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="14"
                    max="100"
                    value={nameZone.size}
                    onChange={(e) => setNameZone({ ...nameZone, size: Number(e.target.value) })}
                    className="w-full accent-[#29479B]"
                  />
                </div>
              </div>

              {/* Rotation Slider */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span className="flex items-center gap-1 font-semibold text-gray-700">
                    <RotateCw className="w-3.5 h-3.5 text-[#29479B]" /> Rotation Angle
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="-180"
                      max="180"
                      value={nameZone.rotation || 0}
                      onChange={(e) =>
                        setNameZone({ ...nameZone, rotation: Number(e.target.value) || 0 })
                      }
                      className="w-16 px-1.5 py-0.5 text-xs text-center font-bold border border-gray-300 rounded bg-white"
                    />
                    <span className="text-gray-400">deg</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  value={nameZone.rotation || 0}
                  onChange={(e) => setNameZone({ ...nameZone, rotation: Number(e.target.value) })}
                  className="w-full accent-[#29479B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={nameZone.color}
                      onChange={(e) => setNameZone({ ...nameZone, color: e.target.value })}
                      className="w-8 h-8 rounded border border-gray-300 cursor-pointer p-0.5"
                    />
                    <Input
                      value={nameZone.color}
                      onChange={(e) => setNameZone({ ...nameZone, color: e.target.value })}
                      className="font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                <Select
                  label="Alignment"
                  value={nameZone.align}
                  onChange={(e) => setNameZone({ ...nameZone, align: e.target.value })}
                  options={[
                    { label: "Center", value: "center" },
                    { label: "Left", value: "left" },
                    { label: "Right", value: "right" },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="X Position (%)"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={nameZone.x}
                  onChange={(e) => setNameZone({ ...nameZone, x: parseFloat(e.target.value) || 0 })}
                />
                <Input
                  label="Y Position (%)"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={nameZone.y}
                  onChange={(e) => setNameZone({ ...nameZone, y: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-3 text-center">
              Check the box above to enable rendering recipient names on this certificate.
            </p>
          )}
        </Card>

        {/* 2. REFERENCE CODE ZONE */}
        <Card className={`p-5 space-y-4 border-t-4 transition-all ${refZone.enabled ? "border-t-amber-500 bg-white" : "border-t-gray-300 bg-gray-50/60"}`}>
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={refZone.enabled}
                  onChange={(e) => setRefZone({ ...refZone, enabled: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600 cursor-pointer"
                />
                <span className="font-bold text-base text-[#1A284A]">🏷️ Reference Code Field</span>
              </label>
            </div>
            <Badge variant={refZone.enabled ? "warning" : "default"}>
              {refZone.enabled ? `Point: ${refZone.x}%, ${refZone.y}%` : "Hidden (Unchecked)"}
            </Badge>
          </div>

          {refZone.enabled ? (
            <div className="space-y-3">
              <Select
                label="Font Family"
                value={refZone.font}
                onChange={(e) => setRefZone({ ...refZone, font: e.target.value })}
                options={FONT_OPTIONS}
              />

              {/* Font Size, Bold & Italic Controls */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">Typography & Style</span>
                  {(() => {
                    const { isBold, isItalic } = parseStyleBooleans(refZone.style);
                    return (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          title="Toggle Bold"
                          onClick={() =>
                            setRefZone({
                              ...refZone,
                              style: serializeStyleString(!isBold, isItalic),
                            })
                          }
                          className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            isBold
                              ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          <Bold className="w-3.5 h-3.5" /> Bold
                        </button>
                        <button
                          type="button"
                          title="Toggle Italic"
                          onClick={() =>
                            setRefZone({
                              ...refZone,
                              style: serializeStyleString(isBold, !isItalic),
                            })
                          }
                          className={`px-2.5 py-1 rounded-lg border text-xs italic flex items-center gap-1 transition-all cursor-pointer ${
                            isItalic
                              ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          <Italic className="w-3.5 h-3.5" /> Italic
                        </button>
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Font Size</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="10"
                        max="72"
                        value={refZone.size}
                        onChange={(e) =>
                          setRefZone({ ...refZone, size: Number(e.target.value) || 10 })
                        }
                        className="w-16 px-1.5 py-0.5 text-xs text-center font-bold border border-gray-300 rounded bg-white"
                      />
                      <span className="text-gray-400">pt</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    value={refZone.size}
                    onChange={(e) => setRefZone({ ...refZone, size: Number(e.target.value) })}
                    className="w-full accent-amber-600"
                  />
                </div>
              </div>

              {/* Rotation Slider */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span className="flex items-center gap-1 font-semibold text-gray-700">
                    <RotateCw className="w-3.5 h-3.5 text-amber-600" /> Rotation Angle
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="-180"
                      max="180"
                      value={refZone.rotation || 0}
                      onChange={(e) =>
                        setRefZone({ ...refZone, rotation: Number(e.target.value) || 0 })
                      }
                      className="w-16 px-1.5 py-0.5 text-xs text-center font-bold border border-gray-300 rounded bg-white"
                    />
                    <span className="text-gray-400">deg</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  value={refZone.rotation || 0}
                  onChange={(e) => setRefZone({ ...refZone, rotation: Number(e.target.value) })}
                  className="w-full accent-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={refZone.color}
                      onChange={(e) => setRefZone({ ...refZone, color: e.target.value })}
                      className="w-8 h-8 rounded border border-gray-300 cursor-pointer p-0.5"
                    />
                    <Input
                      value={refZone.color}
                      onChange={(e) => setRefZone({ ...refZone, color: e.target.value })}
                      className="font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                <Select
                  label="Alignment"
                  value={refZone.align}
                  onChange={(e) => setRefZone({ ...refZone, align: e.target.value })}
                  options={[
                    { label: "Center", value: "center" },
                    { label: "Left", value: "left" },
                    { label: "Right", value: "right" },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="X Position (%)"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={refZone.x}
                  onChange={(e) => setRefZone({ ...refZone, x: parseFloat(e.target.value) || 0 })}
                />
                <Input
                  label="Y Position (%)"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={refZone.y}
                  onChange={(e) => setRefZone({ ...refZone, y: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-3 text-center">
              Check the box above to enable rendering reference numbers on this certificate.
            </p>
          )}
        </Card>

        {/* 3. DATE FIELD ZONE */}
        <Card className={`p-5 space-y-4 border-t-4 transition-all ${dateZone.enabled ? "border-t-emerald-600 bg-white" : "border-t-gray-300 bg-gray-50/60"}`}>
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dateZone.enabled}
                  onChange={(e) => setDateZone({ ...dateZone, enabled: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                />
                <span className="font-bold text-base text-[#1A284A]">📅 Date Field</span>
              </label>
            </div>
            <Badge variant={dateZone.enabled ? "success" : "default"}>
              {dateZone.enabled ? `Point: ${dateZone.x}%, ${dateZone.y}%` : "Hidden (Unchecked)"}
            </Badge>
          </div>

          {dateZone.enabled ? (
            <div className="space-y-3">
              <Input
                label="Date Text / Custom Format"
                placeholder="e.g. 20 September 2026 or DD/MM/YYYY"
                value={dateZone.format}
                onChange={(e) => setDateZone({ ...dateZone, format: e.target.value })}
                helperText="Custom date string to display on the certificate"
              />

              <Select
                label="Font Family"
                value={dateZone.font}
                onChange={(e) => setDateZone({ ...dateZone, font: e.target.value })}
                options={FONT_OPTIONS}
              />

              {/* Font Size, Bold & Italic Controls */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">Typography & Style</span>
                  {(() => {
                    const { isBold, isItalic } = parseStyleBooleans(dateZone.style);
                    return (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          title="Toggle Bold"
                          onClick={() =>
                            setDateZone({
                              ...dateZone,
                              style: serializeStyleString(!isBold, isItalic),
                            })
                          }
                          className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            isBold
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          <Bold className="w-3.5 h-3.5" /> Bold
                        </button>
                        <button
                          type="button"
                          title="Toggle Italic"
                          onClick={() =>
                            setDateZone({
                              ...dateZone,
                              style: serializeStyleString(isBold, !isItalic),
                            })
                          }
                          className={`px-2.5 py-1 rounded-lg border text-xs italic flex items-center gap-1 transition-all cursor-pointer ${
                            isItalic
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          <Italic className="w-3.5 h-3.5" /> Italic
                        </button>
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Font Size</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="10"
                        max="72"
                        value={dateZone.size}
                        onChange={(e) =>
                          setDateZone({ ...dateZone, size: Number(e.target.value) || 10 })
                        }
                        className="w-16 px-1.5 py-0.5 text-xs text-center font-bold border border-gray-300 rounded bg-white"
                      />
                      <span className="text-gray-400">pt</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    value={dateZone.size}
                    onChange={(e) => setDateZone({ ...dateZone, size: Number(e.target.value) })}
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>

              {/* Rotation Slider */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span className="flex items-center gap-1 font-semibold text-gray-700">
                    <RotateCw className="w-3.5 h-3.5 text-emerald-600" /> Rotation Angle
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="-180"
                      max="180"
                      value={dateZone.rotation || 0}
                      onChange={(e) =>
                        setDateZone({ ...dateZone, rotation: Number(e.target.value) || 0 })
                      }
                      className="w-16 px-1.5 py-0.5 text-xs text-center font-bold border border-gray-300 rounded bg-white"
                    />
                    <span className="text-gray-400">deg</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  value={dateZone.rotation || 0}
                  onChange={(e) => setDateZone({ ...dateZone, rotation: Number(e.target.value) })}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={dateZone.color}
                      onChange={(e) => setDateZone({ ...dateZone, color: e.target.value })}
                      className="w-8 h-8 rounded border border-gray-300 cursor-pointer p-0.5"
                    />
                    <Input
                      value={dateZone.color}
                      onChange={(e) => setDateZone({ ...dateZone, color: e.target.value })}
                      className="font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                <Select
                  label="Alignment"
                  value={dateZone.align}
                  onChange={(e) => setDateZone({ ...dateZone, align: e.target.value })}
                  options={[
                    { label: "Center", value: "center" },
                    { label: "Left", value: "left" },
                    { label: "Right", value: "right" },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="X Position (%)"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={dateZone.x}
                  onChange={(e) => setDateZone({ ...dateZone, x: parseFloat(e.target.value) || 0 })}
                />
                <Input
                  label="Y Position (%)"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={dateZone.y}
                  onChange={(e) => setDateZone({ ...dateZone, y: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-3 text-center">
              Check the box above to enable rendering an issue date on this certificate.
            </p>
          )}
        </Card>

        {/* 4. SIGNATURE PNG ZONE */}
        <Card className={`p-5 space-y-4 border-t-4 transition-all ${signatureZone.enabled ? "border-t-purple-600 bg-white" : "border-t-gray-300 bg-gray-50/60"}`}>
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={signatureZone.enabled}
                  onChange={(e) => setSignatureZone({ ...signatureZone, enabled: e.target.checked })}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 accent-purple-600 cursor-pointer"
                />
                <span className="font-bold text-base text-[#1A284A]">✍️ Signature PNG Field</span>
              </label>
            </div>
            <Badge variant={signatureZone.enabled ? "primary" : "default"}>
              {signatureZone.enabled ? `Point: ${signatureZone.x}%, ${signatureZone.y}%` : "Hidden (Unchecked)"}
            </Badge>
          </div>

          {signatureZone.enabled ? (
            <div className="space-y-3">
              <ImageUpload
                label="Signature Image (Transparent PNG recommended)"
                value={signatureZone.imageUrl}
                onChange={(url) => setSignatureZone({ ...signatureZone, imageUrl: url })}
                helpText="Upload a signature with transparent background (.png) or enter image URL"
              />

              {/* Signature Size / Width Slider */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span className="font-semibold text-gray-700">Signature Size / Scale (Width %)</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="5"
                      max="50"
                      value={signatureZone.width || 16}
                      onChange={(e) =>
                        setSignatureZone({ ...signatureZone, width: Number(e.target.value) || 16 })
                      }
                      className="w-16 px-1.5 py-0.5 text-xs text-center font-bold border border-gray-300 rounded bg-white"
                    />
                    <span className="text-gray-400">%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={signatureZone.width || 16}
                  onChange={(e) => setSignatureZone({ ...signatureZone, width: Number(e.target.value) })}
                  className="w-full accent-purple-600"
                />
              </div>

              {/* Rotation Slider */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span className="flex items-center gap-1 font-semibold text-gray-700">
                    <RotateCw className="w-3.5 h-3.5 text-purple-600" /> Rotation Angle
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="-180"
                      max="180"
                      value={signatureZone.rotation || 0}
                      onChange={(e) =>
                        setSignatureZone({ ...signatureZone, rotation: Number(e.target.value) || 0 })
                      }
                      className="w-16 px-1.5 py-0.5 text-xs text-center font-bold border border-gray-300 rounded bg-white"
                    />
                    <span className="text-gray-400">deg</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  value={signatureZone.rotation || 0}
                  onChange={(e) => setSignatureZone({ ...signatureZone, rotation: Number(e.target.value) })}
                  className="w-full accent-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="X Position (%)"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={signatureZone.x}
                  onChange={(e) => setSignatureZone({ ...signatureZone, x: parseFloat(e.target.value) || 0 })}
                />
                <Input
                  label="Y Position (%)"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={signatureZone.y}
                  onChange={(e) => setSignatureZone({ ...signatureZone, y: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-3 text-center">
              Check the box above to enable rendering a signature image on this certificate.
            </p>
          )}
        </Card>
      </div>

      {/* Bottom Save Action */}
      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-xs">
        {onBack ? (
          <Button type="button" variant="outline" onClick={onBack}>
            Cancel
          </Button>
        ) : (
          <div className="text-xs text-gray-400">
            Preview is live with admin data: <strong>{previewAdminName}</strong>
          </div>
        )}

        <Button
          type="button"
          variant="primary"
          onClick={handleSave}
          disabled={isSaving || !backgroundImageUrl}
          className="gap-2"
        >
          {isSaving ? "Saving Configuration..." : "Save Template Configuration"}
        </Button>
      </div>
    </div>
  );
}
