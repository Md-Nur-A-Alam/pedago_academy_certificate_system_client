"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "react-toastify";

export function usePosterTemplates(params = {}) {
  const queryClient = useQueryClient();

  const templatesQuery = useQuery({
    queryKey: ["poster-templates", params],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/posters/templates", { params });
      return data.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post("/api/posters/templates", payload);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Poster template saved successfully");
      queryClient.invalidateQueries({ queryKey: ["poster-templates"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || "Failed to save poster template";
      toast.error(msg);
    },
  });

  return {
    templates: templatesQuery.data || [],
    isLoading: templatesQuery.isLoading,
    saveTemplate: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
}
