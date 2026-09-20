"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Sparkles, UploadCloud, Target, Sliders, CheckCircle } from "lucide-react";
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

const FONT_OPTIONS = [
  // Serif
  { label: "Playfair Display (Serif)", value: "Playfair Display" },
  { label: "Cinzel (Serif)", value: "Cinzel" },
  { label: "Merriweather (Serif)", value: "Merriweather" },
  { label: "Garamond (Serif)", value: "Garamond" },
  { label: "Baskerville (Serif)", value: "Baskerville" },
  { label: "Times New Roman (Serif)", value: "Times New Roman" },
  { label: "Georgia (Serif)", value: "Georgia" },
  // Script
  { label: "Great Vibes (Script)", value: "Great Vibes" },
  { label: "Alex Brush (Script)", value: "Alex Brush" },
  { label: "Allura (Script)", value: "Allura" },
  { label: "Dancing Script (Script)", value: "Dancing Script" },
  { label: "Satisfy (Script)", value: "Satisfy" },
  // Sans-serif
  { label: "Montserrat (Sans-serif)", value: "Montserrat" },
  { label: "Raleway (Sans-serif)", value: "Raleway" },
  { label: "Roboto (Sans-serif)", value: "Roboto" },
  { label: "Open Sans (Sans-serif)", value: "Open Sans" },
  { label: "Helvetica (Sans-serif)", value: "Helvetica" },
];

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

  // Name Zone state (coordinates as percentages 0-100)
  const [nameZone, setNameZone] = useState({
    x: initialTemplate?.nameZone?.x ?? 50,
    y: initialTemplate?.nameZone?.y ?? 46,
    font: initialTemplate?.nameZone?.font || "Great Vibes",
    size: initialTemplate?.nameZone?.size ?? 44,
    color: initialTemplate?.nameZone?.color || "#1A284A",
    align: initialTemplate?.nameZone?.align || "center",
  });

  // Reference Code Zone state (coordinates as percentages 0-100)
  const [refZone, setRefZone] = useState({
    x: initialTemplate?.refZone?.x ?? 50,
    y: initialTemplate?.refZone?.y ?? 78,
    font: initialTemplate?.refZone?.font || "Montserrat",
    size: initialTemplate?.refZone?.size ?? 16,
    color: initialTemplate?.refZone?.color || "#29479B",
    align: initialTemplate?.refZone?.align || "center",
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
        // Normalize pixel values (> 100) from legacy data to percentages
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
        });
        setRefZone({
          x: normRefX,
          y: normRefY,
          font: match.refZone?.font || "Montserrat",
          size: match.refZone?.size ?? 16,
          color: match.refZone?.color || "#29479B",
          align: match.refZone?.align || "center",
        });
      }
    }
  }, [selectedCompetitionId, selectedVariant, templates, initialTemplate]);

  const selectedComp = competitions.find((c) => c._id === selectedCompetitionId);
  const compPrefix = selectedComp?.refPrefix || "COMP";
  const previewAdminName = admin?.name || "Test admin";
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
        },
        refZone: {
          ...refZone,
          x: Number(refZone.x),
          y: Number(refZone.y),
          size: Number(refZone.size),
        },
      });

      if (onSaved) {
        onSaved();
      } else if (onBack) {
        onBack();
      }
    } catch (err) {
      // Error handled in hook
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
              Upload design, click to position Name & Ref ID points, and preview with your admin profile data
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
            Upload the high-resolution certificate artwork (recommended 1920×1080 or A4 ratio). Hosted automatically on ImgBB.
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
              <Sparkles className="w-3 h-3" /> Click anywhere on image to position
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Select <strong>Recipient Name</strong> or <strong>Reference ID</strong>, then click directly on the certificate design to place the point. You can also drag the text marker.
          </p>
        </div>

        <CertificateCanvasPointPicker
          backgroundImageUrl={backgroundImageUrl}
          nameZone={nameZone}
          refZone={refZone}
          onNameZoneChange={(updated) => setNameZone(updated)}
          onRefZoneChange={(updated) => setRefZone(updated)}
          previewName={previewAdminName}
          previewRef={previewDemoRef}
        />
      </Card>

      {/* Step 4: Typography & Styling Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recipient Name Zone Controls */}
        <Card className="p-5 space-y-4 border-t-4 border-t-blue-600">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-[#1A284A] flex items-center gap-2">
                <span>👤 Recipient Name Zone</span>
              </h3>
              <p className="text-xs text-gray-500">Preview: {previewAdminName}</p>
            </div>
            <Badge variant="info">Point: {nameZone.x}%, {nameZone.y}%</Badge>
          </div>

          <div className="space-y-3">
            <Select
              label="Font Family"
              value={nameZone.font}
              onChange={(e) => setNameZone({ ...nameZone, font: e.target.value })}
              options={FONT_OPTIONS}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Font Size ({nameZone.size}pt)
                </label>
                <input
                  type="range"
                  min="16"
                  max="96"
                  value={nameZone.size}
                  onChange={(e) => setNameZone({ ...nameZone, size: Number(e.target.value) })}
                  className="w-full accent-[#29479B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Text Color
                </label>
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
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Text Alignment"
                value={nameZone.align}
                onChange={(e) => setNameZone({ ...nameZone, align: e.target.value })}
                options={[
                  { label: "Center Aligned", value: "center" },
                  { label: "Left Aligned", value: "left" },
                  { label: "Right Aligned", value: "right" },
                ]}
              />

              <div className="flex gap-2">
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
          </div>
        </Card>

        {/* Reference ID Zone Controls */}
        <Card className="p-5 space-y-4 border-t-4 border-t-amber-500">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-[#1A284A] flex items-center gap-2">
                <span>🏷️ Reference Code Zone</span>
              </h3>
              <p className="text-xs text-gray-500">Preview: {previewDemoRef}</p>
            </div>
            <Badge variant="warning">Point: {refZone.x}%, {refZone.y}%</Badge>
          </div>

          <div className="space-y-3">
            <Select
              label="Font Family"
              value={refZone.font}
              onChange={(e) => setRefZone({ ...refZone, font: e.target.value })}
              options={FONT_OPTIONS}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Font Size ({refZone.size}pt)
                </label>
                <input
                  type="range"
                  min="10"
                  max="48"
                  value={refZone.size}
                  onChange={(e) => setRefZone({ ...refZone, size: Number(e.target.value) })}
                  className="w-full accent-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Text Color
                </label>
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
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Text Alignment"
                value={refZone.align}
                onChange={(e) => setRefZone({ ...refZone, align: e.target.value })}
                options={[
                  { label: "Center Aligned", value: "center" },
                  { label: "Left Aligned", value: "left" },
                  { label: "Right Aligned", value: "right" },
                ]}
              />

              <div className="flex gap-2">
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
          </div>
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
