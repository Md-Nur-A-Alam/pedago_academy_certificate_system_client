"use client";

import { useEffect } from "react";
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

  const mediaUrl = watch("mediaUrl");

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || "",
        phone: initialData.phone || "",
        age: initialData.age ?? "",
        category: initialData.category || "General",
        competitionId: initialData.competitionId?._id || initialData.competitionId || "",
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

        <Input
          label="Category *"
          placeholder="e.g. Junior, Senior, Group A"
          helperText="Mandatory participant category"
          error={errors.category?.message}
          {...register("category")}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Competition *"
          options={competitionOptions.length > 0 ? competitionOptions : [{ label: "No competitions", value: "" }]}
          error={errors.competitionId?.message}
          {...register("competitionId")}
        />

        <Select
          label="Achievement Type *"
          options={[
            { label: "Participant", value: "participant" },
            { label: "Winner", value: "winner" },
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
          Upload participant's photo or media file (auto-hosted on ImgBB), or paste an external URL directly.
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
