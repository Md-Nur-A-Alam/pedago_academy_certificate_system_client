"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  Sparkles,
  Target,
  Sliders,
  Image as ImageIcon,
  Bold,
  Italic,
} from "lucide-react";
import { useCompetitions } from "../competitions/useCompetitions";
import { usePosterTemplates } from "./usePosterTemplates";
import { useCurrentAdmin } from "../auth/useCurrentAdmin";
import { PosterCanvasPointPicker } from "./PosterCanvasPointPicker";
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

export function PosterTemplateDesigner({ initialTemplate, onBack, onSaved }) {
  const { competitions } = useCompetitions();
  const { templates, saveTemplate, isSaving } = usePosterTemplates();
  const { admin } = useCurrentAdmin();

  const [selectedCompetitionId, setSelectedCompetitionId] = useState(
    initialTemplate?.competitionId?._id || initialTemplate?.competitionId || ""
  );
  const [selectedType, setSelectedType] = useState(initialTemplate?.type || "participant");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(
    initialTemplate?.backgroundImageUrl || ""
  );

  // Photo Zone state (percentages)
  const [photoZone, setPhotoZone] = useState({
    x: initialTemplate?.photoZone?.x ?? 50,
    y: initialTemplate?.photoZone?.y ?? 42,
    w: initialTemplate?.photoZone?.w ?? 28,
    h: initialTemplate?.photoZone?.h ?? 28,
    shape: initialTemplate?.photoZone?.shape || "circle",
  });

  // Name Zone state
  const existingNameZone = initialTemplate?.textZones?.find((z) => z.key === "name");
  const [nameZone, setNameZone] = useState({
    x: existingNameZone?.x ?? 50,
    y: existingNameZone?.y ?? 78,
    font: existingNameZone?.font || "Montserrat",
    size: existingNameZone?.size ?? 28,
    color: existingNameZone?.color || "#FFFFFF",
    align: existingNameZone?.align || "center",
    style: existingNameZone?.style || "bold",
  });

  // Ref Zone state
  const existingRefZone = initialTemplate?.textZones?.find((z) => z.key === "ref");
  const [refZone, setRefZone] = useState({
    x: existingRefZone?.x ?? 50,
    y: existingRefZone?.y ?? 85,
    font: existingRefZone?.font || "Montserrat",
    size: existingRefZone?.size ?? 16,
    color: existingRefZone?.color || "#F59E0B",
    align: existingRefZone?.align || "center",
    style: existingRefZone?.style || "normal",
  });

  useEffect(() => {
    if (competitions.length > 0 && !selectedCompetitionId) {
      setSelectedCompetitionId(competitions[0]._id);
    }
  }, [competitions, selectedCompetitionId]);

  // If competition/type changes and not initial editing, match existing template
  useEffect(() => {
    if (selectedCompetitionId && templates && !initialTemplate) {
      const match = templates.find(
        (t) =>
          (t.competitionId?._id || t.competitionId) === selectedCompetitionId &&
          t.type === selectedType
      );
      if (match) {
        setBackgroundImageUrl(match.backgroundImageUrl || "");
        const normPhotoX = match.photoZone?.x > 100 ? 50 : (match.photoZone?.x ?? 50);
        const normPhotoY = match.photoZone?.y > 100 ? 42 : (match.photoZone?.y ?? 42);
        const normPhotoW = match.photoZone?.w > 100 ? 28 : (match.photoZone?.w ?? 28);

        setPhotoZone({
          x: normPhotoX,
          y: normPhotoY,
          w: normPhotoW,
          h: normPhotoW,
          shape: match.photoZone?.shape || "circle",
        });

        const nz = match.textZones?.find((z) => z.key === "name");
        if (nz) {
          setNameZone({
            x: nz.x > 100 ? 50 : (nz.x ?? 50),
            y: nz.y > 100 ? 78 : (nz.y ?? 78),
            font: nz.font || "Montserrat",
            size: nz.size ?? 28,
            color: nz.color || "#FFFFFF",
            align: nz.align || "center",
            style: nz.style || "bold",
          });
        }

        const rz = match.textZones?.find((z) => z.key === "ref");
        if (rz) {
          setRefZone({
            x: rz.x > 100 ? 50 : (rz.x ?? 50),
            y: rz.y > 100 ? 85 : (rz.y ?? 85),
            font: rz.font || "Montserrat",
            size: rz.size ?? 16,
            color: rz.color || "#F59E0B",
            align: rz.align || "center",
            style: rz.style || "normal",
          });
        }
      }
    }
  }, [selectedCompetitionId, selectedType, templates, initialTemplate]);

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
      toast.error("Please upload or provide a Poster Background Artwork");
      return;
    }

    try {
      await saveTemplate({
        competitionId: selectedCompetitionId,
        type: selectedType,
        backgroundImageUrl,
        photoZone: {
          x: Number(photoZone.x),
          y: Number(photoZone.y),
          w: Number(photoZone.w),
          h: Number(photoZone.w), // maintain square ratio
          shape: photoZone.shape,
        },
        textZones: [
          {
            key: "name",
            x: Number(nameZone.x),
            y: Number(nameZone.y),
            font: nameZone.font,
            size: Number(nameZone.size),
            color: nameZone.color,
            align: nameZone.align,
            style: nameZone.style || "bold",
          },
          {
            key: "ref",
            x: Number(refZone.x),
            y: Number(refZone.y),
            font: refZone.font,
            size: Number(refZone.size),
            color: refZone.color,
            align: refZone.align,
            style: refZone.style || "normal",
          },
        ],
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
      {/* Header */}
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
              <ArrowLeft className="w-4 h-4" /> Back to Posters
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-extrabold text-[#1A284A]">
              {initialTemplate ? "Edit Poster Template" : "Poster Template Designer"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Upload artwork, click to position user photo cutout & text zones, and test with admin data
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            disabled={isSaving || !backgroundImageUrl}
            className="gap-2 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isSaving ? (
              <>
                <Spinner size="sm" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Poster Configuration
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Step 1: Competition and Poster Type */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Step 1: Select Competition *"
          value={selectedCompetitionId}
          onChange={(e) => setSelectedCompetitionId(e.target.value)}
          options={compOptions.length > 0 ? compOptions : [{ label: "No competitions available", value: "" }]}
        />

        <Select
          label="Step 2: Poster Type *"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          options={[
            { label: "Participant Poster", value: "participant" },
            { label: "Winner Poster", value: "winner" },
          ]}
        />
      </div>

      {/* Step 2: Upload Poster Artwork */}
      <Card className="p-5">
        <div className="mb-2">
          <label className="block text-sm font-bold text-[#1A284A]">
            Step 3: Upload Poster Artwork (Background Image) *
          </label>
          <p className="text-xs text-gray-500 mt-0.5">
            Upload the high-resolution portrait poster design (recommended 1200×1600 or 1080×1350 for social media). Auto-hosted on ImgBB.
          </p>
        </div>

        <ImageUpload
          value={backgroundImageUrl}
          onChange={(url) => setBackgroundImageUrl(url)}
          placeholder="Upload poster template image (.png, .jpg) or enter URL"
        />
      </Card>

      {/* Step 3: Interactive Point & Zone Picker */}
      <Card className="p-5 space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#1A284A] flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" />
              Step 4: Interactive Point Placement on Poster
            </h3>
            <Badge variant="success" className="gap-1">
              <Sparkles className="w-3 h-3" /> Click anywhere on poster to position
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Choose <strong>User Photo Cutout</strong>, <strong>Name</strong>, or <strong>Ref Code</strong>, then click directly on the poster artwork to place the center point or drag the cutout directly.
          </p>
        </div>

        <PosterCanvasPointPicker
          backgroundImageUrl={backgroundImageUrl}
          photoZone={photoZone}
          nameZone={nameZone}
          refZone={refZone}
          onPhotoZoneChange={(updated) => setPhotoZone(updated)}
          onNameZoneChange={(updated) => setNameZone(updated)}
          onRefZoneChange={(updated) => setRefZone(updated)}
          previewName={previewAdminName}
          previewRef={previewDemoRef}
        />
      </Card>

      {/* Step 4: Zone Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Photo Cutout Zone Controls */}
        <Card className="p-5 space-y-4 border-t-4 border-t-emerald-600">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-[#1A284A] flex items-center gap-2">
                <span>🖼️ Photo Cutout Zone</span>
              </h3>
              <p className="text-xs text-gray-500">Participant photo placeholder</p>
            </div>
            <Badge variant="success">Center: {photoZone.x}%, {photoZone.y}%</Badge>
          </div>

          <div className="space-y-3">
            <Select
              label="Cutout Shape"
              value={photoZone.shape}
              onChange={(e) => setPhotoZone({ ...photoZone, shape: e.target.value })}
              options={[
                { label: "Circle", value: "circle" },
                { label: "Square", value: "square" },
                { label: "Rounded Rectangle", value: "rounded" },
              ]}
            />

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Photo Width / Size ({photoZone.w}%)
              </label>
              <input
                type="range"
                min="12"
                max="60"
                value={photoZone.w}
                onChange={(e) =>
                  setPhotoZone({
                    ...photoZone,
                    w: Number(e.target.value),
                    h: Number(e.target.value),
                  })
                }
                className="w-full accent-emerald-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Center X (%)"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={photoZone.x}
                onChange={(e) => setPhotoZone({ ...photoZone, x: parseFloat(e.target.value) || 0 })}
              />
              <Input
                label="Center Y (%)"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={photoZone.y}
                onChange={(e) => setPhotoZone({ ...photoZone, y: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        </Card>

        {/* Name Zone Controls */}
        <Card className="p-5 space-y-4 border-t-4 border-t-blue-600">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-[#1A284A] flex items-center gap-2">
                <span>👤 Name Text Zone</span>
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

            {/* Font Size, Bold & Italic Controls */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">Typography Style</span>
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
                        className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all ${
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
                        className={`px-2.5 py-1 rounded-lg border text-xs italic flex items-center gap-1 transition-all ${
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
                      max="100"
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
                  max="80"
                  value={nameZone.size}
                  onChange={(e) => setNameZone({ ...nameZone, size: Number(e.target.value) })}
                  className="w-full accent-[#29479B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Text Color
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={nameZone.color}
                    onChange={(e) => setNameZone({ ...nameZone, color: e.target.value })}
                    className="w-7 h-7 rounded border border-gray-300 cursor-pointer p-0.5"
                  />
                  <Input
                    value={nameZone.color}
                    onChange={(e) => setNameZone({ ...nameZone, color: e.target.value })}
                    className="font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Center X (%)"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={nameZone.x}
                  onChange={(e) => setNameZone({ ...nameZone, x: parseFloat(e.target.value) || 0 })}
                />
                <Input
                  label="Center Y (%)"
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

        {/* Ref Zone Controls */}
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

            {/* Font Size, Bold & Italic Controls */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">Typography Style</span>
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
                        className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all ${
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
                        className={`px-2.5 py-1 rounded-lg border text-xs italic flex items-center gap-1 transition-all ${
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
                      max="60"
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
                  max="50"
                  value={refZone.size}
                  onChange={(e) => setRefZone({ ...refZone, size: Number(e.target.value) })}
                  className="w-full accent-amber-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Text Color
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={refZone.color}
                    onChange={(e) => setRefZone({ ...refZone, color: e.target.value })}
                    className="w-7 h-7 rounded border border-gray-300 cursor-pointer p-0.5"
                  />
                  <Input
                    value={refZone.color}
                    onChange={(e) => setRefZone({ ...refZone, color: e.target.value })}
                    className="font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Center X (%)"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={refZone.x}
                  onChange={(e) => setRefZone({ ...refZone, x: parseFloat(e.target.value) || 0 })}
                />
                <Input
                  label="Center Y (%)"
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

      {/* Bottom Actions */}
      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-xs">
        {onBack ? (
          <Button type="button" variant="outline" onClick={onBack}>
            Cancel
          </Button>
        ) : (
          <div className="text-xs text-gray-400">
            Preview is active with admin data: <strong>{previewAdminName}</strong>
          </div>
        )}

        <Button
          type="button"
          variant="primary"
          onClick={handleSave}
          disabled={isSaving || !backgroundImageUrl}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {isSaving ? "Saving Configuration..." : "Save Poster Configuration"}
        </Button>
      </div>
    </div>
  );
}
