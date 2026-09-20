"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "react-toastify";

export function useParticipants(params = {}) {
  const queryClient = useQueryClient();

  const participantsQuery = useQuery({
    queryKey: ["participants", params],
    queryFn: async () => {
      console.log("[HOOK DEBUG: Participants] Fetching participants with params:", params);
      const { data } = await apiClient.get("/api/participants", { params });
      console.log("[HOOK DEBUG: Participants] Received count:", data?.data?.length);
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      console.log("[HOOK DEBUG: Participants] Creating participant:", payload);
      const { data } = await apiClient.post("/api/participants", payload);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Participant created successfully");
      queryClient.invalidateQueries({ queryKey: ["participants"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || "Failed to create participant";
      console.error("[HOOK DEBUG: Participants] Create error:", msg);
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data: payload }) => {
      console.log(`[HOOK DEBUG: Participants] Updating participant ${id}:`, payload);
      const { data } = await apiClient.patch(`/api/participants/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Participant updated successfully");
      queryClient.invalidateQueries({ queryKey: ["participants"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || "Failed to update participant";
      console.error("[HOOK DEBUG: Participants] Update error:", msg);
      toast.error(msg);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (id) => {
      console.log(`[HOOK DEBUG: Participants] Archiving participant ${id}`);
      const { data } = await apiClient.delete(`/api/participants/${id}`);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Participant archived successfully");
      queryClient.invalidateQueries({ queryKey: ["participants"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || "Failed to archive participant";
      console.error("[HOOK DEBUG: Participants] Archive error:", msg);
      toast.error(msg);
    },
  });

  const bulkUploadMutation = useMutation({
    mutationFn: async (payload) => {
      console.log("[HOOK DEBUG: Participants] Bulk uploading participants...");
      const { data } = await apiClient.post("/api/participants/bulk-upload", payload);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Bulk import complete");
      queryClient.invalidateQueries({ queryKey: ["participants"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || "Failed to import participants";
      console.error("[HOOK DEBUG: Participants] Bulk upload error:", msg);
      toast.error(msg);
    },
  });

  return {
    participants: participantsQuery.data?.data || [],
    pagination: participantsQuery.data?.pagination || {},
    isLoading: participantsQuery.isLoading,
    isError: participantsQuery.isError,
    error: participantsQuery.error,
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
