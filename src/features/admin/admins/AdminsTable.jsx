"use client";

import { useState } from "react";
import { Plus, UserCheck, UserX } from "lucide-react";
import { useAdmins } from "./useAdmins";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { AdminForm } from "./AdminForm";

export function AdminsTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { admins, isLoading, createAdmin, isCreating, updateAdmin, isUpdating } = useAdmins();

  const handleToggleActive = async (admin) => {
    const action = admin.isActive ? "deactivate" : "activate";
    if (confirm(`Are you sure you want to ${action} ${admin.name}'s account?`)) {
      await updateAdmin({ id: admin._id, data: { isActive: !admin.isActive } });
    }
  };

  const handleCreateSubmit = async (formData) => {
    await createAdmin(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A284A]">Admin Users</h1>
          <p className="text-sm text-gray-500 mt-1">Manage system administrator accounts and roles</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="primary" className="gap-2">
          <Plus className="w-4 h-4" /> New Admin Account
        </Button>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : admins.length === 0 ? (
        <EmptyState
          title="No admin accounts found"
          description="Create a new administrator account to manage the portal."
          action={
            <Button onClick={() => setIsModalOpen(true)} variant="primary" className="mt-4 gap-2">
              <Plus className="w-4 h-4" /> Create Admin
            </Button>
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/70 text-gray-700 uppercase font-semibold text-xs border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Admin Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {admins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-[#1A284A]">{admin.name}</td>
                    <td className="px-6 py-4 text-gray-600">{admin.email}</td>
                    <td className="px-6 py-4">
                      <Badge variant={admin.role === "super_admin" ? "warning" : "info"}>
                        {admin.role === "super_admin" ? "Super Admin" : "Admin"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={admin.isActive ? "success" : "danger"}>
                        {admin.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleActive(admin)}
                        disabled={isUpdating}
                        className={`px-3 py-1 text-xs font-semibold rounded-md border transition-colors ${
                          admin.isActive
                            ? "border-red-200 text-red-700 hover:bg-red-50"
                            : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        }`}
                        title={admin.isActive ? "Deactivate Account" : "Activate Account"}
                      >
                        {admin.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Admin Account"
      >
        <AdminForm
          onSubmit={handleCreateSubmit}
          onClose={() => setIsModalOpen(false)}
          isLoading={isCreating}
        />
      </Modal>
    </div>
  );
}
