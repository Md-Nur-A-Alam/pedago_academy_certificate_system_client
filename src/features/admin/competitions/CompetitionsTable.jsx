"use client";

import { useState } from "react";
import { Edit, Trash2, Plus, Search } from "lucide-react";
import { useCompetitions } from "./useCompetitions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { CompetitionForm } from "./CompetitionForm";

export function CompetitionsTable() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);

  const {
    competitions,
    isLoading,
    createCompetition,
    isCreating,
    updateCompetition,
    isUpdating,
    archiveCompetition,
    isArchiving,
  } = useCompetitions({ search, status: statusFilter });

  const handleOpenCreate = () => {
    setSelectedCompetition(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (comp) => {
    setSelectedCompetition(comp);
    setIsModalOpen(true);
  };

  const handleArchive = async (id) => {
    if (confirm("Are you sure you want to archive this competition?")) {
      await archiveCompetition(id);
    }
  };

  const handleFormSubmit = async (formData) => {
    if (selectedCompetition) {
      await updateCompetition({ id: selectedCompetition._id, data: formData });
    } else {
      await createCompetition(formData);
    }
  };

  const statusBadgeVariant = {
    active: "success",
    draft: "warning",
    archived: "danger",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A284A]">Competitions</h1>
          <p className="text-sm text-gray-500 mt-1">Manage competitions, prefixes, and padding</p>
        </div>
        <Button onClick={handleOpenCreate} variant="primary" className="gap-2">
          <Plus className="w-4 h-4" /> New Competition
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search by competition name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        </div>

        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { label: "All Statuses", value: "" },
              { label: "Active", value: "active" },
              { label: "Draft", value: "draft" },
              { label: "Archived", value: "archived" },
            ]}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : competitions.length === 0 ? (
        <EmptyState
          title="No competitions found"
          description="Create a new competition to get started with certificate generation."
          action={
            <Button onClick={handleOpenCreate} variant="primary" className="mt-4 gap-2">
              <Plus className="w-4 h-4" /> Create Competition
            </Button>
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/70 text-gray-700 uppercase font-semibold text-xs border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Competition Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Ref Prefix</th>
                  <th className="px-6 py-4">Padding</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {competitions.map((comp) => (
                  <tr key={comp._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-[#1A284A]">{comp.name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                        {comp.category || "General"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-[#29479B] font-bold">
                      {comp.refPrefix}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono">{comp.refPadding} digits</td>
                    <td className="px-6 py-4">
                      <Badge variant={statusBadgeVariant[comp.status] || "info"}>
                        {comp.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(comp)}
                          className="p-1.5 text-gray-500 hover:text-[#29479B] hover:bg-gray-100 rounded-md transition-colors"
                          title="Edit Competition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleArchive(comp._id)}
                          disabled={isArchiving}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                          title="Archive Competition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
        title={selectedCompetition ? "Edit Competition" : "Create New Competition"}
      >
        <CompetitionForm
          initialData={selectedCompetition}
          onSubmit={handleFormSubmit}
          onClose={() => setIsModalOpen(false)}
          isLoading={isCreating || isUpdating}
        />
      </Modal>
    </div>
  );
}
