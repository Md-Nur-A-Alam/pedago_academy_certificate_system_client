"use client";
"use no memo";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Layers } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { toast } from "react-toastify";

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
  // Extract initial categories (array of strings)
  const getInitialCategories = () => {
    if (initialData?.categories && Array.isArray(initialData.categories) && initialData.categories.length > 0) {
      return initialData.categories;
    }
    if (initialData?.category) {
      return [initialData.category];
    }
    return ["General"];
  };

  const [categories, setCategories] = useState(getInitialCategories);
  const [numCategoriesInput, setNumCategoriesInput] = useState(getInitialCategories().length);
  const [categoryErrors, setCategoryErrors] = useState([]);

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

  // Sync initialData when editing
  useEffect(() => {
    if (initialData) {
      const initialCats = getInitialCategories();
      setCategories(initialCats);
      setNumCategoriesInput(initialCats.length);
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

  // Handle change of "Number of Categories"
  const handleNumCategoriesChange = (e) => {
    const rawVal = e.target.value;
    const num = Math.max(1, Math.min(20, parseInt(rawVal, 10) || 1));
    setNumCategoriesInput(rawVal);

    setCategories((prev) => {
      const current = [...prev];
      if (num > current.length) {
        // Add new category slots
        const added = Array.from({ length: num - current.length }, (_, idx) => "");
        return [...current, ...added];
      } else if (num < current.length) {
        // Truncate
        return current.slice(0, num);
      }
      return current;
    });
  };

  // Handle specific category name change
  const handleCategoryNameChange = (index, value) => {
    setCategories((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
    // Clear error for this index if filled
    if (value.trim()) {
      setCategoryErrors((prev) => prev.filter((i) => i !== index));
    }
  };

  // Add category button
  const handleAddCategory = () => {
    setCategories((prev) => {
      const updated = [...prev, ""];
      setNumCategoriesInput(updated.length);
      return updated;
    });
  };

  // Remove category button
  const handleRemoveCategory = (index) => {
    if (categories.length <= 1) {
      toast.warning("A competition must have at least one category.");
      return;
    }
    setCategories((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      setNumCategoriesInput(updated.length);
      return updated;
    });
  };

  const handleFormSubmit = async (data) => {
    // Validate categories
    const emptyIndices = [];
    const cleaned = categories.map((cat, idx) => {
      const trimmed = cat.trim();
      if (!trimmed) emptyIndices.push(idx);
      return trimmed;
    });

    if (emptyIndices.length > 0) {
      setCategoryErrors(emptyIndices);
      toast.error("Please provide a name for each category.");
      return;
    }

    if (cleaned.length === 0) {
      toast.error("At least one category is required.");
      return;
    }

    const payload = {
      ...data,
      refPrefix: data.refPrefix.toUpperCase().trim(),
      categories: cleaned,
      category: cleaned[0] || "General",
    };

    await onSubmit(payload);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 max-h-[82vh] overflow-y-auto pr-1">
      <Input
        label="Competition Name *"
        placeholder="e.g. National Science Olympiad 2026"
        error={errors.name?.message}
        {...register("name")}
      />

      {/* Multi-Category Management Section */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200/80 space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#29479B]/10 text-[#29479B] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <label className="text-xs font-bold text-[#1A284A] block">
                Categories (ক্যাটাগরি সমূহ) *
              </label>
              <span className="text-[11px] text-gray-500 block">
                How many categories will be included? (e.g. 4) Each category will be required in participant forms.
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={handleAddCategory}
            className="text-xs gap-1 border-blue-200 text-[#29479B] hover:bg-blue-50 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Category</span>
          </Button>
        </div>

        {/* Number of Categories Input */}
        <div className="max-w-xs">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Number of Categories (ক্যাটাগরি সংখ্যা)
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={numCategoriesInput}
            onChange={handleNumCategoriesChange}
            className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-sm font-bold text-[#1A284A] focus:outline-none focus:ring-2 focus:ring-[#29479B]"
          />
        </div>

        {/* Dynamic Category Name Inputs */}
        <div className="space-y-2.5 pt-1">
          <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider">
            Category Names ({categories.length})
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((cat, idx) => {
              const hasError = categoryErrors.includes(idx);
              return (
                <div key={idx} className="relative flex items-center gap-1.5">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={cat}
                      onChange={(e) => handleCategoryNameChange(idx, e.target.value)}
                      placeholder={`Category ${idx + 1} Name (e.g. ${
                        idx === 0
                          ? "Junior / Group A"
                          : idx === 1
                          ? "Senior / Group B"
                          : idx === 2
                          ? "Special / Group C"
                          : "General"
                      })`}
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs sm:text-sm bg-white font-medium transition-all ${
                        hasError
                          ? "border-red-400 ring-2 ring-red-100"
                          : "border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#29479B] focus:border-transparent"
                      }`}
                    />
                    {hasError && (
                      <span className="text-[10px] text-red-500 mt-0.5 block">
                        Category name is required
                      </span>
                    )}
                  </div>

                  {categories.length > 1 && (
                    <button
                      type="button"
                      title="Remove this category"
                      onClick={() => handleRemoveCategory(idx)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

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
