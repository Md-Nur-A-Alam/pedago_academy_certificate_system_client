import { Suspense } from "react";
import { LoginForm } from "@/features/admin/auth/LoginForm";
import { Spinner } from "@/components/ui/Spinner";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]">
      <Suspense fallback={<Spinner size="lg" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
