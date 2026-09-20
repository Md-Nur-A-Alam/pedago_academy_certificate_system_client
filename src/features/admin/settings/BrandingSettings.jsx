"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Save, Globe, Palette } from "lucide-react";

export function BrandingSettings() {
  const { settings, isLoading, updateSettings, isUpdating } = useSystemSettings();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      heroBgUrl: "/HeroBG.jpg",
      logoUrl: "/pedagoLogo.png",
      siteTitle: "Pedago Academy",
      contactEmail: "support@pedago.academy",
      contactPhone: "+880 1700-000000",
      footerText: "Pedago Academy - Official Certificate & Poster Verification Portal",
    },
  });

  const heroBgValue = watch("heroBgUrl");
  const logoValue = watch("logoUrl");

  useEffect(() => {
    if (settings) {
      reset({
        heroBgUrl: settings.heroBgUrl || "/HeroBG.jpg",
        logoUrl: settings.logoUrl || "/pedagoLogo.png",
        siteTitle: settings.siteTitle || "Pedago Academy",
        contactEmail: settings.contactEmail || "support@pedago.academy",
        contactPhone: settings.contactPhone || "+880 1700-000000",
        footerText:
          settings.footerText ||
          "Pedago Academy - Official Certificate & Poster Verification Portal",
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
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h3 className="text-base font-bold text-[#1A284A] flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#29479B]" />
            Portal Branding & Global Assets
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure the visual branding, logos, contact info, and background images used across the portal
          </p>
        </div>

        {/* Logo Upload */}
        <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Portal Logo
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Upload the official academy logo (.png with transparent background recommended).
          </p>
          <ImageUpload
            value={logoValue}
            onChange={(url) => setValue("logoUrl", url, { shouldValidate: true })}
            placeholder="Upload logo or enter image URL"
          />
        </div>

        {/* Hero Background Upload */}
        <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Homepage Hero Background Image
          </label>
          <p className="text-xs text-gray-500 mb-3">
            High-resolution banner artwork displayed on the public certificate verification homepage.
          </p>
          <ImageUpload
            value={heroBgValue}
            onChange={(url) => setValue("heroBgUrl", url, { shouldValidate: true })}
            placeholder="Upload hero background image or enter URL"
          />
        </div>

        {/* Text Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Portal Brand Title *"
            placeholder="Pedago Academy"
            error={errors.siteTitle?.message}
            {...register("siteTitle")}
          />

          <Input
            label="Support Contact Email"
            placeholder="support@pedago.academy"
            error={errors.contactEmail?.message}
            {...register("contactEmail")}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Support Contact Phone"
            placeholder="+880 1700-000000"
            error={errors.contactPhone?.message}
            {...register("contactPhone")}
          />

          <Input
            label="Footer Tagline / Copyright"
            placeholder="Pedago Academy - Official Certificate & Poster Verification Portal"
            error={errors.footerText?.message}
            {...register("footerText")}
          />
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <Button type="submit" variant="primary" disabled={isUpdating} className="gap-2">
            {isUpdating ? (
              <>
                <Spinner size="sm" /> Saving Settings...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save System Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
