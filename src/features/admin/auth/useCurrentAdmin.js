"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "react-toastify";

export function useCurrentAdmin() {
  const queryClient = useQueryClient();

  const currentAdminQuery = useQuery({
    queryKey: ["current-admin"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/api/admins/me");
        return data.data;
      } catch (err) {
        if (err.response?.status === 401) {
          return null;
        }
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    retry: 1,
  });

  const changePasswordMutation = useMutation({
    mutationFn: async ({ currentPassword, newPassword }) => {
      const { data } = await apiClient.post("/api/admins/change-password", {
        currentPassword,
        newPassword,
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Password updated successfully");
      queryClient.invalidateQueries({ queryKey: ["current-admin"] });
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message || err.message || "Failed to update password";
      toast.error(msg);
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await apiClient.patch("/api/admins/me", payload);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["current-admin"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || "Failed to update profile";
      toast.error(msg);
    },
  });

  const admin = currentAdminQuery.data || null;

  return {
    admin,
    isLoading: currentAdminQuery.isLoading,
    isError: currentAdminQuery.isError,
    error: currentAdminQuery.error,
    isSuperAdmin: admin?.role === "super_admin",
    mustChangePassword: Boolean(admin?.mustChangePassword),
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    refetchAdmin: currentAdminQuery.refetch,
  };
}
