"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "react-toastify";

export function useCompetitions(params = {}) {
  const queryClient = useQueryClient();

  const competitionsQuery = useQuery({
    queryKey: ["competitions", params],
    queryFn: async () => {
      console.log("[HOOK DEBUG: Competitions] Fetching competitions with params:", params);
      const { data } = await apiClient.get("/api/competitions", { params });
      console.log("[HOOK DEBUG: Competitions] Received data count:", data?.data?.length);
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      console.log("[HOOK DEBUG: Competitions] Creating competition:", payload);
      const { data } = await apiClient.post("/api/competitions", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Competition created successfully");
      queryClient.invalidateQueries({ queryKey: ["competitions"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || "Failed to create competition";
      console.error("[HOOK DEBUG: Competitions] Create error:", msg);
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data: payload }) => {
      console.log(`[HOOK DEBUG: Competitions] Updating competition ${id}:`, payload);
      const { data } = await apiClient.patch(`/api/competitions/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Competition updated successfully");
      queryClient.invalidateQueries({ queryKey: ["competitions"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || "Failed to update competition";
      console.error("[HOOK DEBUG: Competitions] Update error:", msg);
      toast.error(msg);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (id) => {
      console.log(`[HOOK DEBUG: Competitions] Archiving competition ${id}`);
      const { data } = await apiClient.delete(`/api/competitions/${id}`);
      return data;
    },
    onSuccess: () => {
      toast.success("Competition archived successfully");
      queryClient.invalidateQueries({ queryKey: ["competitions"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || "Failed to archive competition";
      console.error("[HOOK DEBUG: Competitions] Archive error:", msg);
      toast.error(msg);
    },
  });

  return {
    competitions: competitionsQuery.data?.data || [],
    pagination: competitionsQuery.data?.pagination || {},
    isLoading: competitionsQuery.isLoading,
    isError: competitionsQuery.isError,
    error: competitionsQuery.error,
    refetch: competitionsQuery.refetch,
    createCompetition: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateCompetition: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    archiveCompetition: archiveMutation.mutateAsync,
    isArchiving: archiveMutation.isPending,
  };
}
