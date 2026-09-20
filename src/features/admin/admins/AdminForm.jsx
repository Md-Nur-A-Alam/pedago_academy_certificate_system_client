"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const adminFormSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().min(1, "Email is required").email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(6, "Temporary password must be at least 6 characters"),
  role: z.enum(["super_admin", "admin"]).default("admin"),
});

export function AdminForm({ onSubmit, onClose, isLoading }) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "admin",
    },
  });

  const handleFormSubmit = async (data) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Full Name *"
        placeholder="e.g. Sarah Connor"
        error={errors.name?.message}
        {...register("name")}
      />

      <Input
        label="Email Address *"
        type="email"
        placeholder="admin@pedagoacademy.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <div className="relative">
        <Input
          label="Temporary Password *"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          error={errors.password?.message}
          className="pr-10"
          {...register("password")}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      <Select
        label="Administrative Role *"
        options={[
          { label: "Standard Admin (Manage competitions, participants, templates)", value: "admin" },
          { label: "Super Admin (Full access, manage other admin accounts)", value: "super_admin" },
        ]}
        error={errors.role?.message}
        {...register("role")}
      />

      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
        💡 The new administrator will be required to change this temporary password on their first login.
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? "Creating Account..." : "Create Admin Account"}
        </Button>
      </div>
    </form>
  );
}
