"use client";

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "react-toastify";

const DEFAULT_HOMEPAGE_SETTINGS = {
  hero: {
    badgeText: "Official Verification Portal",
    showBadge: true,
    title: "Verify & Download Your Pedago Academy Certificates",
    titleHighlight: "Pedago Academy",
    titleColor: "#FFFFFF",
    titleHighlightColor: "#F59E0B",
    subtitle:
      "আপনার অনন্য রেফারেন্স কোড বা ফোন নম্বর দিয়ে অফিশিয়াল সার্টিফিকেট ও সোশ্যাল মিডিয়া পোস্টার ডাউনলোড করুন সহজে।",
    subtitleColor: "rgba(255, 255, 255, 0.9)",
    layoutMode: "background", // 'background' | 'flex'
    imageUrl: "/HeroBG.jpg",
    bgOverlayColor: "#1A284A",
    bgType: "solid", // 'solid' | 'gradient'
    bgSolidColor: "#1A284A",
    bgGradient: {
      direction: "to-r",
      colorStart: "#1A284A",
      colorEnd: "#29479B",
    },
    bgOverlayOpacity: 80,
    showButtons: true,
    pictureStyle: {
      borderWidth: 4,
      borderColor: "rgba(255, 255, 255, 0.2)",
      borderStyle: "solid",
      shadow: "glow",
      shadowColor: "rgba(245, 158, 11, 0.4)",
      animation: "float",
      shape: "rounded",
      size: "medium",
      fadeStyle: "bottom",
    },
    buttons: [
      {
        id: "btn-1",
        label: "সার্টিফিকেট ডাউনলোড করুন",
        link: "/certificates",
        bgColor: "#F0442E",
        textColor: "#FFFFFF",
        variant: "solid",
        isVisible: true,
      },
      {
        id: "btn-2",
        label: "প্রতিযোগিতা দেখুন",
        link: "/competitions",
        bgColor: "#29479B",
        textColor: "#FFFFFF",
        variant: "outline",
        isVisible: true,
      },
    ],
  },
  featuredCompetitions: {
    title: "চলমান ও জনপ্রিয় প্রতিযোগিতা | Featured Competitions",
    subtitle: "পেডাগো একাডেমির সকল সক্রিয় ও সাম্প্রতিক প্রতিযোগিতার ফলাফল ও সার্টিফিকেট",
    limit: 6,
    showSection: true,
  },
  quickPortals: {
    title: "Quick Access Portals",
    subtitle: "খুব সহজেই আপনার সার্টিফিকেট যাচাই করুন, ডাউনলোড করুন অথবা সোশ্যাল মিডিয়ায় শেয়ারের জন্য পোস্টার তৈরি করুন",
    showSection: true,
  },
};

export function useHomepageSettings() {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ["homepage-setting"],
    queryFn: async () => {
      // Resilient fetching: try /api/settings/homepage first, fallback to /api/homepage-setting
      try {
        const { data } = await apiClient.get("/api/settings/homepage");
        return data?.data;
      } catch (err) {
        if (err.response?.status === 404 || err.response?.status === 500) {
          const { data } = await apiClient.get("/api/homepage-setting");
          return data?.data;
        }
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 mins cache
  });

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      try {
        const { data } = await apiClient.patch("/api/settings/homepage", payload);
        return data?.data;
      } catch (err) {
        if (err.response?.status === 404 || err.response?.status === 500) {
          const { data } = await apiClient.patch("/api/homepage-setting", payload);
          return data?.data;
        }
        throw err;
      }
    },
    onSuccess: (updatedData) => {
      toast.success("Home page settings saved successfully!");
      queryClient.setQueryData(["homepage-setting"], updatedData);
      queryClient.invalidateQueries({ queryKey: ["homepage-setting"] });
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message || err.message || "Failed to update home settings";
      toast.error(msg);
    },
  });

  // Memoize mergedSettings so reference is stable and does NOT trigger infinite re-renders
  const mergedSettings = useMemo(() => {
    const data = settingsQuery.data;
    if (!data) return DEFAULT_HOMEPAGE_SETTINGS;

    return {
      ...DEFAULT_HOMEPAGE_SETTINGS,
      ...data,
      hero: {
        ...DEFAULT_HOMEPAGE_SETTINGS.hero,
        ...(data.hero || {}),
        bgGradient: {
          ...DEFAULT_HOMEPAGE_SETTINGS.hero.bgGradient,
          ...(data.hero?.bgGradient || {}),
        },
        pictureStyle: {
          ...DEFAULT_HOMEPAGE_SETTINGS.hero.pictureStyle,
          ...(data.hero?.pictureStyle || {}),
        },
        buttons:
          data.hero?.buttons !== undefined
            ? data.hero.buttons
            : DEFAULT_HOMEPAGE_SETTINGS.hero.buttons,
      },
      featuredCompetitions: {
        ...DEFAULT_HOMEPAGE_SETTINGS.featuredCompetitions,
        ...(data.featuredCompetitions || {}),
      },
      quickPortals: {
        ...DEFAULT_HOMEPAGE_SETTINGS.quickPortals,
        ...(data.quickPortals || {}),
      },
    };
  }, [settingsQuery.data]);

  return {
    settings: mergedSettings,
    isLoading: settingsQuery.isLoading,
    isError: settingsQuery.isError,
    error: settingsQuery.error,
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
