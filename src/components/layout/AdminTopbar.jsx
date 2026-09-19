"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function AdminTopbar() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.push("/admin/login");
    } catch (err) {
      console.error("Sign out failed", err);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-[#1A284A]">Administration Portal</h2>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSignOut}
          className="px-3 py-1.5 text-xs font-semibold rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
