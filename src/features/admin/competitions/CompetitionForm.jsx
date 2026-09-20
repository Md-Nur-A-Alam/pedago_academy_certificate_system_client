"use client";
"use no memo";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/ui/ImageUpload";

const competitionFormSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  description: z.string().optional().default(""),
  refPrefix: z.string().min(1, "Prefix is required").trim(),
  refPadding: z.coerce.number().min(0).max(6).default(0),
  sourceLink: z.string().optional().default(""),
  imageUrl: z.string().optional().default(""),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
});

export function CompetitionForm({ initialData, onSubmit, onClose, isLoading }) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(competitionFormSchema),
    mode: "onChange",
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      refPrefix: initialData?.refPrefix || "",
      refPadding: initialData?.refPadding ?? 0,
      sourceLink: initialData?.sourceLink || "",
      imageUrl: initialData?.imageUrl || "",
      status: initialData?.status || "draft",
    },
  });

  // Only reset if editing an existing competition and initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || "",
        description: initialData.description || "",
        refPrefix: initialData.refPrefix || "",
        refPadding: initialData.refPadding ?? 0,
        sourceLink: initialData.sourceLink || "",
        imageUrl: initialData.imageUrl || "",
        status: initialData.status || "draft",
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data) => {
    // Ensure refPrefix is uppercase
    const payload = {
      ...data,
      refPrefix: data.refPrefix.toUpperCase().trim(),
    };
    await onSubmit(payload);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Competition Name *"
        placeholder="e.g. National Science Olympiad 2026"
        error={errors.name?.message}
        {...register("name")}
      />

      <Input
        label="Reference Prefix *"
        placeholder="e.g. NSO2026"
        error={errors.refPrefix?.message}
        {...register("refPrefix")}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Ref Padding (0-6)"
          type="number"
          min="0"
          max="6"
          error={errors.refPadding?.message}
          {...register("refPadding")}
        />

        <Select
          label="Status"
          options={[
            { label: "Draft", value: "draft" },
            { label: "Active", value: "active" },
            { label: "Archived", value: "archived" },
          ]}
          error={errors.status?.message}
          {...register("status")}
        />
      </div>

      <Input
        label="Description"
        placeholder="Brief overview of competition"
        error={errors.description?.message}
        {...register("description")}
      />

      <Input
        label="Source Link (Optional)"
        placeholder="https://pedagoacademy.com/events/nso2026"
        error={errors.sourceLink?.message}
        {...register("sourceLink")}
      />

      <ImageUpload
        label="Competition Banner / Poster Image"
        value={watch("imageUrl")}
        onChange={(url) => setValue("imageUrl", url, { shouldValidate: true })}
        error={errors.imageUrl?.message}
        helpText="Upload a banner image directly or paste a Facebook image link to host permanently on ImgBB"
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? "Saving..." : initialData ? "Update Competition" : "Create Competition"}
        </Button>
      </div>
    </form>
  );
}
