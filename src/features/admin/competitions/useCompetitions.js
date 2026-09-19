"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "react-toastify";

export function useCompetitions(params = {}) {
  const queryClient = useQueryClient();

  const competitionsQuery = useQuery({
    queryKey: ["competitions", params],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/competitions", { params });
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post("/api/competitions", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Competition created successfully");
      queryClient.invalidateQueries({ queryKey: ["competitions"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || "Failed to create competition";
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data: payload }) => {
      const { data } = await apiClient.patch(`/api/competitions/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Competition updated successfully");
      queryClient.invalidateQueries({ queryKey: ["competitions"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || "Failed to update competition";
      toast.error(msg);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (id) => {
      const { data } = await apiClient.delete(`/api/competitions/${id}`);
      return data;
    },
    onSuccess: () => {
      toast.success("Competition archived successfully");
      queryClient.invalidateQueries({ queryKey: ["competitions"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || "Failed to archive competition";
      toast.error(msg);
    },
  });

  return {
    competitions: competitionsQuery.data?.data || [],
    pagination: competitionsQuery.data?.pagination || {},
    isLoading: competitionsQuery.isLoading,
    isError: competitionsQuery.isError,
    refetch: competitionsQuery.refetch,
    createCompetition: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateCompetition: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    archiveCompetition: archiveMutation.mutateAsync,
    isArchiving: archiveMutation.isPending,
  };
}
