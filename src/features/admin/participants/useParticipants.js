"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "react-toastify";

export function useParticipants(params = {}) {
  const queryClient = useQueryClient();

  const participantsQuery = useQuery({
    queryKey: ["participants", params],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/participants", { params });
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post("/api/participants", payload);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Participant created successfully");
      queryClient.invalidateQueries({ queryKey: ["participants"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || "Failed to create participant";
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data: payload }) => {
      const { data } = await apiClient.patch(`/api/participants/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Participant updated successfully");
      queryClient.invalidateQueries({ queryKey: ["participants"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || "Failed to update participant";
      toast.error(msg);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (id) => {
      const { data } = await apiClient.delete(`/api/participants/${id}`);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Participant archived successfully");
      queryClient.invalidateQueries({ queryKey: ["participants"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || "Failed to archive participant";
      toast.error(msg);
    },
  });

  const bulkUploadMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post("/api/participants/bulk-upload", payload);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Bulk import complete");
      queryClient.invalidateQueries({ queryKey: ["participants"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || "Failed to import participants";
      toast.error(msg);
    },
  });

  return {
    participants: participantsQuery.data?.data || [],
    pagination: participantsQuery.data?.pagination || {},
    isLoading: participantsQuery.isLoading,
    createParticipant: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateParticipant: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    archiveParticipant: archiveMutation.mutateAsync,
    isArchiving: archiveMutation.isPending,
    bulkUpload: bulkUploadMutation.mutateAsync,
    isBulkUploading: bulkUploadMutation.isPending,
  };
}
