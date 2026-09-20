"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  Trash2,
  Lock,
  Users,
} from "lucide-react";
import { useAdmins } from "./useAdmins";
import { useCurrentAdmin } from "@/features/admin/auth/useCurrentAdmin";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { AdminForm } from "./AdminForm";

export function AdminsTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { admins, isLoading, createAdmin, isCreating, updateAdmin, isUpdating, deleteAdmin, isDeleting } = useAdmins();
  const { admin: currentAdmin, isSuperAdmin, isLoading: isAuthLoading } = useCurrentAdmin();

  // Filter admins by search query
  const filteredAdmins = useMemo(() => {
    if (!searchQuery.trim()) return admins;
    const q = searchQuery.toLowerCase();
    return admins.filter(
      (a) => a.name?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q)
    );
  }, [admins, searchQuery]);

  // Summary counts
  const stats = useMemo(() => {
    const total = admins.length;
    const active = admins.filter((a) => a.isActive).length;
    const supers = admins.filter((a) => a.role === "super_admin").length;
    return { total, active, supers };
  }, [admins]);

  const handleToggleActive = async (target) => {
    const isSelf = currentAdmin?._id === target._id;
    if (isSelf) return;

    const action = target.isActive ? "deactivate" : "activate";
    if (confirm(`Are you sure you want to ${action} ${target.name}'s account?`)) {
      await updateAdmin({ id: target._id, data: { isActive: !target.isActive } });
    }
  };

  const handleDelete = async (target) => {
    const isSelf = currentAdmin?._id === target._id;
    if (isSelf) return;

    if (
      confirm(
        `Are you sure you want to permanently delete administrator ${target.name} (${target.email})? This action cannot be undone.`
      )
    ) {
      await deleteAdmin(target._id);
    }
  };

  // If role is still loading, show spinner
  if (isAuthLoading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Guard: Super Admin permissions required
  if (!isSuperAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-2xl p-8 border border-red-100 shadow-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-[#1A284A]">Access Restricted</h2>
          <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
            Administrator account management is restricted to Super Administrators. You do not have permission to view or manage this section.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A284A] tracking-tight">
            Administrator Accounts
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage system administrators, permissions, and credential access
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="primary" className="gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> New Admin Account
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200/70 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Admins</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#1A284A] mt-2">{stats.total}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200/70 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Accounts</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">{stats.active}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200/70 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Super Admins</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2">{stats.supers}</div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search admins by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 focus:outline-hidden focus:border-[#29479B] transition-colors"
          />
        </div>
        <div className="text-xs text-gray-500 font-medium">
          Showing {filteredAdmins.length} of {admins.length} accounts
        </div>
      </div>

      {/* Admins Table */}
      {isLoading ? (
        <div className="py-20 flex justify-center bg-white rounded-xl border border-gray-200/70">
          <Spinner size="lg" />
        </div>
      ) : filteredAdmins.length === 0 ? (
        <EmptyState
          title="No administrator accounts found"
          description={
            searchQuery ? "No accounts matched your search criteria." : "Create a new administrator account to get started."
          }
          action={
            !searchQuery && (
              <Button onClick={() => setIsModalOpen(true)} variant="primary" className="mt-4 gap-2">
                <Plus className="w-4 h-4" /> Create Admin
              </Button>
            )
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200/70 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/80 text-gray-700 uppercase font-semibold text-xs border-b border-gray-200/70">
                <tr>
                  <th className="px-6 py-4">Administrator</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Security</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAdmins.map((target) => {
                  const isSelf = currentAdmin?._id === target._id;

                  return (
                    <tr key={target._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-[#1A284A] flex items-center gap-2">
                          {target.name}
                          {isSelf && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-mono text-xs">{target.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${
                            target.role === "super_admin"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-blue-50 text-blue-800 border-blue-200"
                          }`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          {target.role === "super_admin" ? "Super Admin" : "Admin"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${
                            target.isActive
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-red-50 text-red-800 border-red-200"
                          }`}
                        >
                          {target.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {target.mustChangePassword ? (
                          <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            Password change pending
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400">Normal</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Toggle Active / Deactivate */}
                          <button
                            onClick={() => handleToggleActive(target)}
                            disabled={isUpdating || isSelf}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                              target.isActive
                                ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            }`}
                            title={
                              isSelf
                                ? "You cannot deactivate your own account"
                                : target.isActive
                                ? "Deactivate Account"
                                : "Activate Account"
                            }
                          >
                            {target.isActive ? "Deactivate" : "Activate"}
                          </button>

                          {/* Delete Account */}
                          <button
                            onClick={() => handleDelete(target)}
                            disabled={isDeleting || isSelf}
                            className="p-1 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            title={isSelf ? "You cannot delete your own account" : "Delete Account"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Admin Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Administrator Account"
      >
        <AdminForm
          onSubmit={createAdmin}
          onClose={() => setIsModalOpen(false)}
          isLoading={isCreating}
        />
      </Modal>
    </div>
  );
}
