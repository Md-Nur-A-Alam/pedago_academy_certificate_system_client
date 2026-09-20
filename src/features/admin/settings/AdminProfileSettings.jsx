"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Phone, Briefcase, BadgeCheck, ShieldCheck, Mail, Save, Sparkles, Building2 } from "lucide-react";
import { useCurrentAdmin } from "../auth/useCurrentAdmin";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";

const profileSchema = z.object({
  name: z.string().min(1, "Full name is required").trim(),
  phone: z.string().trim().optional(),
  photo: z.string().trim().optional(),
  officeId: z.string().trim().optional(),
  officeRole: z.string().trim().optional(),
  bio: z.string().trim().optional(),
});

export function AdminProfileSettings() {
  const { admin, isLoading, updateProfile, isUpdatingProfile } = useCurrentAdmin();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      phone: "",
      photo: "",
      officeId: "",
      officeRole: "",
      bio: "",
    },
  });

  const photoValue = watch("photo");
  const nameValue = watch("name");
  const officeRoleValue = watch("officeRole");
  const officeIdValue = watch("officeId");

  useEffect(() => {
    if (admin) {
      reset({
        name: admin.name || "",
        phone: admin.phone || "",
        photo: admin.photo || "",
        officeId: admin.officeId || "",
        officeRole: admin.officeRole || "",
        bio: admin.bio || "",
      });
    }
  }, [admin, reset]);

  const onSubmit = async (data) => {
    await updateProfile(data);
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const isSuperAdmin = admin?.role === "super_admin";

  return (
    <div className="space-y-6">
      {/* Profile Live Card & Identity Banner */}
      <div className="bg-gradient-to-r from-[#1A284A] to-[#29479B] text-white p-6 rounded-2xl shadow-md flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar Display */}
        <div className="relative shrink-0">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/20 bg-white/10 shadow-inner flex items-center justify-center">
            {photoValue ? (
              <img
                src={photoValue}
                alt={nameValue || "Admin"}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            ) : (
              <User className="w-12 h-12 text-white/60" />
            )}
          </div>
          <div className="absolute bottom-0 right-0 bg-emerald-500 w-5 h-5 rounded-full border-2 border-[#1A284A]" title="Active Admin" />
        </div>

        {/* Identity Details */}
        <div className="text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-black tracking-tight">{nameValue || "Administrator"}</h2>
            <Badge
              variant={isSuperAdmin ? "warning" : "info"}
              className="gap-1 font-bold text-xs"
            >
              <ShieldCheck className="w-3 h-3" />
              {isSuperAdmin ? "Super Admin" : "Admin"}
            </Badge>
          </div>

          <p className="text-sm text-blue-200 mt-1 flex items-center justify-center sm:justify-start gap-1.5 font-medium">
            <Mail className="w-3.5 h-3.5 opacity-70" />
            {admin?.email}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 pt-3 border-t border-white/10 text-xs text-blue-100">
            {officeRoleValue && (
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 opacity-75" /> {officeRoleValue}
              </span>
            )}
            {officeIdValue && (
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 opacity-75" /> ID: {officeIdValue}
              </span>
            )}
            {admin?.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 opacity-75" /> {admin.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Profile Edit Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#1A284A]">Personal & Official Details</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Update your identity details, profile photo, phone number, and office credentials
            </p>
          </div>

          {/* Profile Photo Upload */}
          <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Profile Photo
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Upload a professional portrait or avatar. Automatically hosted on ImgBB.
            </p>
            <ImageUpload
              value={photoValue}
              onChange={(url) => setValue("photo", url, { shouldValidate: true })}
              placeholder="Upload photo or paste image URL"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              placeholder="e.g. Alex Rahman"
              error={errors.name?.message}
              {...register("name")}
            />

            <Input
              label="Email Address (System Login)"
              value={admin?.email || ""}
              disabled
              helperText="Managed by account security"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Phone Number"
              placeholder="e.g. +8801700000000"
              error={errors.phone?.message}
              {...register("phone")}
            />

            <Input
              label="Office ID"
              placeholder="e.g. PEDAGO-ADM-101"
              error={errors.officeId?.message}
              {...register("officeId")}
            />

            <Input
              label="Office Role / Title"
              placeholder="e.g. Operations Lead"
              error={errors.officeRole?.message}
              {...register("officeRole")}
            />
          </div>

          <Input
            label="Bio / Department Notes (Optional)"
            placeholder="e.g. Lead Academic Coordinator & Certificate Issuing Officer"
            error={errors.bio?.message}
            {...register("bio")}
          />

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <Button
              type="submit"
              variant="primary"
              disabled={isUpdatingProfile}
              className="gap-2 shadow-sm"
            >
              {isUpdatingProfile ? (
                <>
                  <Spinner size="sm" /> Saving Profile...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Profile Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
