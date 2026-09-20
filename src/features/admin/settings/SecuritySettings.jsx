"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KeyRound, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useCurrentAdmin } from "../auth/useCurrentAdmin";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

export function SecuritySettings() {
  const { changePassword, isChangingPassword } = useCurrentAdmin();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      reset();
    } catch (err) {
      // Handled in mutation
    }
  };

  return (
    <Card className="p-6 max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h3 className="text-base font-bold text-[#1A284A] flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#29479B]" />
            Change Account Password
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Ensure your administrator account is using a strong, unique password
          </p>
        </div>

        <div className="space-y-4">
          <Input
            label="Current Password *"
            type="password"
            placeholder="Enter current password"
            error={errors.currentPassword?.message}
            {...register("currentPassword")}
          />

          <Input
            label="New Password *"
            type="password"
            placeholder="Enter new password (min. 6 characters)"
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />

          <Input
            label="Confirm New Password *"
            type="password"
            placeholder="Re-type new password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <Button type="submit" variant="primary" disabled={isChangingPassword} className="gap-2">
            {isChangingPassword ? (
              <>
                <Spinner size="sm" /> Updating Password...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
