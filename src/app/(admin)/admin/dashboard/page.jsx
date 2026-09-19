"use client";

import { authClient } from "@/lib/auth-client";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

export default function AdminDashboardPage() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="py-12 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const user = session?.user;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1A284A]">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview & System Administration</p>
      </div>

      <Card className="p-8">
        <h2 className="text-xl font-bold text-[#1A284A] mb-2">
          Welcome back, {user?.name || "Admin"}! 👋
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed max-w-xl">
          You are signed in as <span className="font-semibold text-[#29479B]">{user?.email}</span>. Use the navigation sidebar on the left to manage competitions, certificate templates, poster templates, and participants.
        </p>
      </Card>
    </div>
  );
}
