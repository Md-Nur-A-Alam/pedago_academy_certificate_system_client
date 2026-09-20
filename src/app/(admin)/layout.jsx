"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminTopbar } from "@/components/layout/AdminTopbar";
import { AdminErrorBoundary } from "@/components/ui/AdminErrorBoundary";
import { useCurrentAdmin } from "@/features/admin/auth/useCurrentAdmin";
import { ChangePasswordModal } from "@/features/admin/auth/ChangePasswordModal";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { admin, mustChangePassword, changePassword, isChangingPassword } = useCurrentAdmin();

  // If on login page, render standalone without admin sidebar and topbar
  if (pathname === "/admin/login") {
    return (
      <AdminErrorBoundary>
        {children}
      </AdminErrorBoundary>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F4F7FC]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar />
        <main className="flex-1 p-6 sm:p-8">
          <AdminErrorBoundary>
            {children}
          </AdminErrorBoundary>
        </main>
      </div>

      {/* Forced Password Change Modal for first-time login (§3 requirement) */}
      {admin && mustChangePassword && (
        <ChangePasswordModal
          isOpen={true}
          enforced={true}
          onSubmit={changePassword}
          isLoading={isChangingPassword}
        />
      )}
    </div>
  );
}
