"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, KeyRound, ShieldCheck, User } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useCurrentAdmin } from "@/features/admin/auth/useCurrentAdmin";
import { ChangePasswordModal } from "@/features/admin/auth/ChangePasswordModal";

export function AdminTopbar() {
  const router = useRouter();
  const { admin, changePassword, isChangingPassword } = useCurrentAdmin();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      router.push("/admin/login");
    } catch (err) {
      console.error("Sign out failed", err);
      // Fallback redirect
      window.location.href = "/admin/login";
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isSuperAdmin = admin?.role === "super_admin";

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-200/80 px-6 flex items-center justify-between shadow-2xs z-10">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-[#1A284A] tracking-tight">
            Administration Portal
          </h2>
        </div>

        <div className="flex items-center gap-3.5">
          {/* Admin Identity Info */}
          {admin && (
            <div className="flex items-center gap-3 pr-3 border-r border-gray-200">
              <div className="w-8 h-8 rounded-full bg-[#1A284A]/5 border border-[#1A284A]/10 flex items-center justify-center text-[#1A284A]">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-[#1A284A] leading-tight flex items-center gap-1.5">
                  {admin.name}
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                      isSuperAdmin
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-blue-50 text-blue-800 border-blue-200"
                    }`}
                  >
                    <ShieldCheck className="w-2.5 h-2.5" />
                    {isSuperAdmin ? "Super Admin" : "Admin"}
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 font-medium leading-none mt-0.5">
                  {admin.email}
                </div>
              </div>
            </div>
          )}

          {/* Change Password Trigger */}
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="p-2 sm:px-3 sm:py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Change Password"
          >
            <KeyRound className="w-3.5 h-3.5 text-gray-500" />
            <span className="hidden sm:inline">Password</span>
          </button>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isLoggingOut ? "Signing out..." : "Sign Out"}
            </span>
          </button>
        </div>
      </header>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={changePassword}
        isLoading={isChangingPassword}
        enforced={false}
      />
    </>
  );
}
