"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useCompetitions } from "../competitions/useCompetitions";
import { usePosterTemplates } from "./usePosterTemplates";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";

export function PosterTemplateDesigner() {
  const { competitions } = useCompetitions();
  const { templates, isLoading, saveTemplate, isSaving } = usePosterTemplates();

  const [selectedCompetition, setSelectedCompetition] = useState("");
  const [selectedType, setSelectedType] = useState("participant");

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      backgroundImageUrl: "",
      photoX: 300,
      photoY: 250,
      photoW: 200,
      photoH: 200,
      photoShape: "circle",
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
        (t) => (t.competitionId?._id || t.competitionId) === selectedCompetition && t.type === selectedType
      );
      if (match) {
        reset({
          backgroundImageUrl: match.backgroundImageUrl || "",
          photoX: match.photoZone?.x ?? 300,
          photoY: match.photoZone?.y ?? 250,
          photoW: match.photoZone?.w ?? 200,
          photoH: match.photoZone?.h ?? 200,
          photoShape: match.photoZone?.shape || "circle",
        });
      }
    }
  }, [selectedCompetition, selectedType, templates, reset]);

  const onSubmit = async (data) => {
    await saveTemplate({
      competitionId: selectedCompetition,
      type: selectedType,
      backgroundImageUrl: data.backgroundImageUrl,
      photoZone: {
        x: Number(data.photoX),
        y: Number(data.photoY),
        w: Number(data.photoW),
        h: Number(data.photoH),
        shape: data.photoShape,
      },
    });
  };

  const compOptions = competitions.map((c) => ({ label: c.name, value: c._id }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1A284A]">Poster Templates</h1>
        <p className="text-sm text-gray-500 mt-1">Configure layout, background images, and user photo positioning for shareable posters</p>
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
            label="Poster Type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            options={[
              { label: "Participant Poster", value: "participant" },
              { label: "Winner Poster", value: "winner" },
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
              label="Poster Background Image URL (ImgBB or hosted asset) *"
              placeholder="https://i.ibb.co/..."
              {...register("backgroundImageUrl")}
            />

            <div className="border-t border-gray-100 pt-4">
              <h3 className="font-bold text-base text-[#1A284A] mb-4 flex items-center gap-2">
                <span>🖼️ User Photo Cutout Zone</span>
                <Badge variant="success">Photo Placeholder</Badge>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Input label="X Position (px)" type="number" {...register("photoX")} />
                <Input label="Y Position (px)" type="number" {...register("photoY")} />
                <Input label="Width (px)" type="number" {...register("photoW")} />
                <Input label="Height (px)" type="number" {...register("photoH")} />
                <Select
                  label="Cutout Shape"
                  options={[
                    { label: "Circle", value: "circle" },
                    { label: "Square", value: "square" },
                    { label: "Rounded Rectangle", value: "rounded" },
                  ]}
                  {...register("photoShape")}
                />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-end">
              <Button type="submit" variant="primary" disabled={isSaving}>
                {isSaving ? "Saving Template..." : "Save Poster Template"}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
