"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "react-toastify";

export function useCertificateTemplates(params = {}) {
  const queryClient = useQueryClient();

  const templatesQuery = useQuery({
    queryKey: ["certificate-templates", params],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/certificates/templates", { params });
      return data.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post("/api/certificates/templates", payload);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Certificate template saved successfully");
      queryClient.invalidateQueries({ queryKey: ["certificate-templates"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || "Failed to save template";
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
