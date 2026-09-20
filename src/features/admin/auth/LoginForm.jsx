"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Eye, EyeOff, ShieldCheck, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const callbackUrl = searchParams.get("callbackUrl") || "/admin/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { error } = await authClient.signIn.email({
        email: data.email.toLowerCase().trim(),
        password: data.password,
      });

      if (error) {
        toast.error(error.message || "Invalid email or password");
      } else {
        toast.success("Welcome back! Signed in successfully.");
        // Invalidate current-admin query to refresh role and admin context
        queryClient.invalidateQueries({ queryKey: ["current-admin"] });
        router.push(callbackUrl);
      }
    } catch (err) {
      toast.error(err.message || "An error occurred while signing in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
      {/* Brand & Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#1A284A] text-[#F59E0B] mb-3 shadow-md">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#1A284A] tracking-tight">
          Admin Portal Sign In
        </h1>
        <p className="text-xs text-gray-500 mt-1 font-medium">
          Pedago Academy Certificate & Poster Administration
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="admin@pedagoacademy.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="relative">
          <Input
            label="Password"
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
            title={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full mt-3 py-2.5 font-semibold text-sm shadow-md"
          variant="primary"
        >
          {loading ? "Verifying Credentials..." : "Sign In to Admin Portal"}
        </Button>
      </form>

      {/* Security Note */}
      <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-center gap-1.5 text-xs text-gray-400 font-medium">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Authorized Personnel Only</span>
      </div>
    </div>
  );
}
