"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "react-toastify";

export function useSystemSettings() {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ["system-settings"],
    queryFn: async () => {
      console.log("[HOOK DEBUG: Settings] Fetching system settings");
      const { data } = await apiClient.get("/api/settings");
      console.log("[HOOK DEBUG: Settings] Received settings:", data?.data);
      return data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 mins cache
  });

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      console.log("[HOOK DEBUG: Settings] Updating settings:", payload);
      const { data } = await apiClient.patch("/api/settings", payload);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Settings updated successfully");
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || "Failed to update settings";
      console.error("[HOOK DEBUG: Settings] Update error:", msg);
      toast.error(msg);
    },
  });

  return {
    settings: settingsQuery.data || { heroBgUrl: "/HeroBG.jpg", logoUrl: "/pedagoLogo.png", siteTitle: "Pedago Academy" },
    isLoading: settingsQuery.isLoading,
    isError: settingsQuery.isError,
    error: settingsQuery.error,
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
