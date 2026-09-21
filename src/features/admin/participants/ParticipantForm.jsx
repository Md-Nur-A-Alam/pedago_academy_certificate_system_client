"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { useCompetitions } from "../competitions/useCompetitions";

const participantFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  age: z.coerce.number({ invalid_type_error: "Age is required" }).min(1, "Age must be at least 1").max(120, "Age must be valid"),
  category: z.string().min(1, "Category is required"),
  competitionId: z.string().min(1, "Competition is required"),
  achievementType: z.enum(["participant", "winner"]).default("participant"),
  sourceUrl: z.string().min(1, "Source URL is required"),
  mediaUrl: z.string().optional().default(""),
});

export function ParticipantForm({ initialData, onSubmit, onClose, isLoading }) {
  const { competitions } = useCompetitions();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(participantFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      phone: "",
      age: "",
      category: "General",
      competitionId: "",
      achievementType: "participant",
      sourceUrl: "",
      mediaUrl: "",
    },
  });

  const selectedCompetitionId = watch("competitionId");
  const selectedCategory = watch("category");
  const mediaUrl = watch("mediaUrl");

  // Determine current competition and its defined categories
  const selectedCompetition = useMemo(() => {
    return competitions.find((c) => c._id === selectedCompetitionId);
  }, [competitions, selectedCompetitionId]);

  const categoryOptions = useMemo(() => {
    if (!selectedCompetition) {
      return [{ label: "-- Select Competition First --", value: "" }];
    }

    const cats =
      Array.isArray(selectedCompetition.categories) && selectedCompetition.categories.length > 0
        ? selectedCompetition.categories
        : [selectedCompetition.category || "General"];

    return cats.map((cat) => ({ label: cat, value: cat }));
  }, [selectedCompetition]);

  // When competition changes, ensure category is set to a valid option of that competition
  useEffect(() => {
    if (selectedCompetition && categoryOptions.length > 0) {
      const validValues = categoryOptions.map((o) => o.value);
      if (!validValues.includes(selectedCategory)) {
        setValue("category", validValues[0], { shouldValidate: true });
      }
    }
  }, [selectedCompetition, categoryOptions, selectedCategory, setValue]);

  // Set initial competition if available and none selected yet
  useEffect(() => {
    if (!initialData && competitions.length > 0 && !selectedCompetitionId) {
      setValue("competitionId", competitions[0]._id);
    }
  }, [competitions, selectedCompetitionId, initialData, setValue]);

  useEffect(() => {
    if (initialData) {
      const compId = initialData.competitionId?._id || initialData.competitionId || "";
      reset({
        name: initialData.name || "",
        phone: initialData.phone || "",
        age: initialData.age ?? "",
        category: initialData.category || "General",
        competitionId: compId,
        achievementType: initialData.achievementType || "participant",
        sourceUrl: initialData.sourceUrl || "",
        mediaUrl: initialData.mediaUrl || "",
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data) => {
    await onSubmit(data);
    onClose();
  };

  const competitionOptions = competitions.map((c) => ({
    label: `${c.name} (${c.refPrefix})`,
    value: c._id,
  }));

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
      {/* Target Competition Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Competition (প্রতিযোগিতা) *"
          options={competitionOptions.length > 0 ? competitionOptions : [{ label: "No competitions available", value: "" }]}
          error={errors.competitionId?.message}
          {...register("competitionId")}
        />

        {/* Dynamic Mandatory Category Dropdown */}
        <Select
          label="Category (ক্যাটাগরি) *"
          options={categoryOptions}
          error={errors.category?.message}
          helperText={
            selectedCompetition
              ? `Select from ${categoryOptions.length} categories defined for this competition`
              : "Please select a competition first"
          }
          {...register("category")}
        />
      </div>

      <Input
        label="Participant Name *"
        placeholder="e.g. Alex Rahman"
        error={errors.name?.message}
        {...register("name")}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Phone Number *"
          placeholder="e.g. +8801700000000"
          error={errors.phone?.message}
          {...register("phone")}
        />

        <Input
          label="Age *"
          type="number"
          min="1"
          max="120"
          placeholder="e.g. 21"
          error={errors.age?.message}
          {...register("age")}
        />

        <Select
          label="Achievement Type *"
          options={[
            { label: "Participant (অংশগ্রহণকারী)", value: "participant" },
            { label: "Winner (বিজয়ী)", value: "winner" },
          ]}
          error={errors.achievementType?.message}
          {...register("achievementType")}
        />
      </div>

      <Input
        label="Source URL *"
        placeholder="e.g. https://facebook.com/pedago/posts/12345"
        helperText="Link to the participant's original post, submission, or verification source"
        error={errors.sourceUrl?.message}
        {...register("sourceUrl")}
      />

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Media Link or Upload (Optional)
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Upload participant&apos;s photo or media file (auto-hosted on ImgBB / Postimages), or paste an external URL directly.
        </p>
        <ImageUpload
          value={mediaUrl}
          onChange={(url) => setValue("mediaUrl", url, { shouldValidate: true })}
          placeholder="Upload photo or paste image URL"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? "Saving..." : initialData ? "Update Participant" : "Add Participant"}
        </Button>
      </div>
    </form>
  );
}
