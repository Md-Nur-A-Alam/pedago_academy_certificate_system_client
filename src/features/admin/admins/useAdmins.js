"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "react-toastify";

export function useAdmins() {
  const queryClient = useQueryClient();

  const adminsQuery = useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/admins");
      return data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post("/api/admins", payload);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Admin account created successfully");
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || "Failed to create admin account";
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data: payload }) => {
      const { data } = await apiClient.patch(`/api/admins/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Admin account updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || "Failed to update admin account";
      toast.error(msg);
    },
  });

  return {
    admins: adminsQuery.data || [],
    isLoading: adminsQuery.isLoading,
    createAdmin: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateAdmin: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
