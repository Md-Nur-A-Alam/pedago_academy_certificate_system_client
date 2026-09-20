"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "react-toastify";

export function usePosterTemplates(params = {}) {
  const queryClient = useQueryClient();

  const templatesQuery = useQuery({
    queryKey: ["poster-templates", params],
    queryFn: async () => {
      console.log("[HOOK DEBUG: PosterTemplates] Fetching poster templates with params:", params);
      const { data } = await apiClient.get("/api/posters/templates", { params });
      console.log("[HOOK DEBUG: PosterTemplates] Received templates:", data?.data?.length);
      return data.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      console.log("[HOOK DEBUG: PosterTemplates] Saving poster template:", payload);
      const { data } = await apiClient.post("/api/posters/templates", payload);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Poster template saved successfully");
      queryClient.invalidateQueries({ queryKey: ["poster-templates"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || "Failed to save poster template";
      console.error("[HOOK DEBUG: PosterTemplates] Save error:", msg);
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      console.log("[HOOK DEBUG: PosterTemplates] Deleting poster template:", id);
      const { data } = await apiClient.delete(`/api/posters/templates/${id}`);
      return data;
    },
    onSuccess: () => {
      toast.success("Poster template deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["poster-templates"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || "Failed to delete poster template";
      console.error("[HOOK DEBUG: PosterTemplates] Delete error:", msg);
      toast.error(msg);
    },
  });

  return {
    templates: templatesQuery.data || [],
    isLoading: templatesQuery.isLoading,
    isError: templatesQuery.isError,
    error: templatesQuery.error,
    saveTemplate: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    deleteTemplate: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    refetchTemplates: templatesQuery.refetch,
  };
}
