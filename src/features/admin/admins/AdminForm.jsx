"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const adminFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["super_admin", "admin"]).default("admin"),
});

export function AdminForm({ onSubmit, onClose, isLoading }) {
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
        placeholder="e.g. John Doe"
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

      <Input
        label="Password *"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register("password")}
      />

      <Select
        label="Role *"
        options={[
          { label: "Admin (Standard)", value: "admin" },
          { label: "Super Admin (Full Access)", value: "super_admin" },
        ]}
        error={errors.role?.message}
        {...register("role")}
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Admin Account"}
        </Button>
      </div>
    </form>
  );
}
