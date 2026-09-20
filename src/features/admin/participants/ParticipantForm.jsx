"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useCompetitions } from "../competitions/useCompetitions";

const participantFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  competitionId: z.string().min(1, "Competition is required"),
  achievementType: z.enum(["participant", "winner"]).default("participant"),
});

export function ParticipantForm({ initialData, onSubmit, onClose, isLoading }) {
  const { competitions } = useCompetitions();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(participantFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      phone: "",
      competitionId: "",
      achievementType: "participant",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || "",
        phone: initialData.phone || "",
        competitionId: initialData.competitionId?._id || initialData.competitionId || "",
        achievementType: initialData.achievementType || "participant",
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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Participant Name *"
        placeholder="e.g. Alex Rahman"
        error={errors.name?.message}
        {...register("name")}
      />

      <Input
        label="Phone Number *"
        placeholder="e.g. +8801700000000"
        error={errors.phone?.message}
        {...register("phone")}
      />

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
