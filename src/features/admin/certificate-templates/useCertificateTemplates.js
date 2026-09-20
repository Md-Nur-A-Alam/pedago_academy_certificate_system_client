"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "react-toastify";

export function useCertificateTemplates(params = {}) {
  const queryClient = useQueryClient();

  const templatesQuery = useQuery({
    queryKey: ["certificate-templates", params],
    queryFn: async () => {
      console.log("[HOOK DEBUG: CertificateTemplates] Fetching certificate templates with params:", params);
      const { data } = await apiClient.get("/api/certificates/templates", { params });
      console.log("[HOOK DEBUG: CertificateTemplates] Received templates:", data?.data?.length);
      return data.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      console.log("[HOOK DEBUG: CertificateTemplates] Saving template:", payload);
      const { data } = await apiClient.post("/api/certificates/templates", payload);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Certificate template saved successfully");
      queryClient.invalidateQueries({ queryKey: ["certificate-templates"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || "Failed to save template";
      console.error("[HOOK DEBUG: CertificateTemplates] Save error:", msg);
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      console.log("[HOOK DEBUG: CertificateTemplates] Deleting template:", id);
      const { data } = await apiClient.delete(`/api/certificates/templates/${id}`);
      return data;
    },
    onSuccess: () => {
      toast.success("Certificate template deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["certificate-templates"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || "Failed to delete template";
      console.error("[HOOK DEBUG: CertificateTemplates] Delete error:", msg);
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
