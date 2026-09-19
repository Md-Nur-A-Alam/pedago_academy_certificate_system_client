"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export default function AdminSettingsPage() {
  const { settings, isLoading, updateSettings, isUpdating } = useSystemSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      heroBgUrl: "/HeroBG.jpg",
      logoUrl: "/pedagoLogo.png",
      siteTitle: "Pedago Academy",
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        heroBgUrl: settings.heroBgUrl || "/HeroBG.jpg",
        logoUrl: settings.logoUrl || "/pedagoLogo.png",
        siteTitle: settings.siteTitle || "Pedago Academy",
      });
    }
  }, [settings, reset]);

  const onSubmit = async (data) => {
    await updateSettings(data);
  };

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1A284A]">System & Theme Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure global background images, logo, and portal branding</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Hero Section Background Image URL / Path"
            placeholder="/HeroBG.jpg or https://..."
            error={errors.heroBgUrl?.message}
            {...register("heroBgUrl")}
          />

          <Input
            label="Logo Image URL / Path"
            placeholder="/pedagoLogo.png or https://..."
            error={errors.logoUrl?.message}
            {...register("logoUrl")}
          />

          <Input
            label="Portal Title"
            placeholder="Pedago Academy"
            error={errors.siteTitle?.message}
            {...register("siteTitle")}
          />

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <Button type="submit" variant="primary" disabled={isUpdating}>
              {isUpdating ? "Saving Settings..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
