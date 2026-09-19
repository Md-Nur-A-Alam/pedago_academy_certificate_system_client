"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useCompetitions } from "../competitions/useCompetitions";
import { useCertificateTemplates } from "./useCertificateTemplates";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";

const FONT_OPTIONS = [
  // Serif
  { label: "Garamond (Serif)", value: "Garamond" },
  { label: "Baskerville (Serif)", value: "Baskerville" },
  { label: "Times New Roman (Serif)", value: "Times New Roman" },
  { label: "Cinzel (Serif)", value: "Cinzel" },
  { label: "Playfair Display (Serif)", value: "Playfair Display" },
  { label: "Merriweather (Serif)", value: "Merriweather" },
  { label: "Georgia (Serif)", value: "Georgia" },
  // Script
  { label: "Great Vibes (Script)", value: "Great Vibes" },
  { label: "Alex Brush (Script)", value: "Alex Brush" },
  { label: "Allura (Script)", value: "Allura" },
  { label: "Dancing Script (Script)", value: "Dancing Script" },
  { label: "Satisfy (Script)", value: "Satisfy" },
  // Sans-serif
  { label: "Montserrat (Sans-serif)", value: "Montserrat" },
  { label: "Helvetica (Sans-serif)", value: "Helvetica" },
  { label: "Open Sans (Sans-serif)", value: "Open Sans" },
  { label: "Roboto (Sans-serif)", value: "Roboto" },
];

export function CertificateTemplateDesigner() {
  const { competitions } = useCompetitions();
  const { templates, isLoading, saveTemplate, isSaving } = useCertificateTemplates();

  const [selectedCompetition, setSelectedCompetition] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("participant");

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      backgroundImageUrl: "",
      nameX: 400,
      nameY: 300,
      nameFont: "Great Vibes",
      nameSize: 42,
      nameColor: "#1A284A",
      refX: 400,
      refY: 520,
      refFont: "Montserrat",
      refSize: 18,
      refColor: "#29479B",
    },
  });

  useEffect(() => {
    if (competitions.length > 0 && !selectedCompetition) {
      setSelectedCompetition(competitions[0]._id);
    }
  }, [competitions, selectedCompetition]);

  useEffect(() => {
    if (selectedCompetition && templates) {
      const match = templates.find(
        (t) => (t.competitionId?._id || t.competitionId) === selectedCompetition && t.variant === selectedVariant
      );
      if (match) {
        reset({
          backgroundImageUrl: match.backgroundImageUrl || "",
          nameX: match.nameZone?.x ?? 400,
          nameY: match.nameZone?.y ?? 300,
          nameFont: match.nameZone?.font || "Great Vibes",
          nameSize: match.nameZone?.size ?? 42,
          nameColor: match.nameZone?.color || "#1A284A",
          refX: match.refZone?.x ?? 400,
          refY: match.refZone?.y ?? 520,
          refFont: match.refZone?.font || "Montserrat",
          refSize: match.refZone?.size ?? 18,
          refColor: match.refZone?.color || "#29479B",
        });
      }
    }
  }, [selectedCompetition, selectedVariant, templates, reset]);

  const onSubmit = async (data) => {
    await saveTemplate({
      competitionId: selectedCompetition,
      variant: selectedVariant,
      backgroundImageUrl: data.backgroundImageUrl,
      nameZone: {
        x: Number(data.nameX),
        y: Number(data.nameY),
        font: data.nameFont,
        size: Number(data.nameSize),
        color: data.nameColor,
        style: "normal",
        align: "center",
      },
      refZone: {
        x: Number(data.refX),
        y: Number(data.refY),
        font: data.refFont,
        size: Number(data.refSize),
        color: data.refColor,
        style: "normal",
        align: "center",
      },
    });
  };

  const compOptions = competitions.map((c) => ({ label: c.name, value: c._id }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1A284A]">Certificate Templates</h1>
        <p className="text-sm text-gray-500 mt-1">Configure layout, background images, and text positioning</p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Select
            label="Select Competition"
            value={selectedCompetition}
            onChange={(e) => setSelectedCompetition(e.target.value)}
            options={compOptions.length > 0 ? compOptions : [{ label: "No competitions available", value: "" }]}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            label="Variant"
            value={selectedVariant}
            onChange={(e) => setSelectedVariant(e.target.value)}
            options={[
              { label: "Participant Variant", value: "participant" },
              { label: "Winner Variant", value: "winner" },
            ]}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Background Image URL (ImgBB or hosted asset) *"
              placeholder="https://i.ibb.co/..."
              {...register("backgroundImageUrl")}
            />

            <div className="border-t border-gray-100 pt-4">
              <h3 className="font-bold text-base text-[#1A284A] mb-4 flex items-center gap-2">
                <span>👤 Name Text Zone</span>
                <Badge variant="info">Recipient Name</Badge>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input label="X Position (px)" type="number" {...register("nameX")} />
                <Input label="Y Position (px)" type="number" {...register("nameY")} />
                <Select label="Font Family" options={FONT_OPTIONS} {...register("nameFont")} />
                <Input label="Font Size (pt)" type="number" {...register("nameSize")} />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h3 className="font-bold text-base text-[#1A284A] mb-4 flex items-center gap-2">
                <span>🏷️ Reference Code Text Zone</span>
                <Badge variant="warning">Ref ID</Badge>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input label="X Position (px)" type="number" {...register("refX")} />
                <Input label="Y Position (px)" type="number" {...register("refY")} />
                <Select label="Font Family" options={FONT_OPTIONS} {...register("refFont")} />
                <Input label="Font Size (pt)" type="number" {...register("refSize")} />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-end">
              <Button type="submit" variant="primary" disabled={isSaving}>
                {isSaving ? "Saving Template..." : "Save Template Configuration"}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
