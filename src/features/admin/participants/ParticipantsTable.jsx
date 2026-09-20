"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Search, FileSpreadsheet, ExternalLink, Image as ImageIcon, Eye } from "lucide-react";
import { useParticipants } from "./useParticipants";
import { useCompetitions } from "../competitions/useCompetitions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { ParticipantForm } from "./ParticipantForm";
import { BulkImportModal } from "./BulkImportModal";
import { ParticipantDetailsModal } from "./ParticipantDetailsModal";

export function ParticipantsTable() {
  const [search, setSearch] = useState("");
  const [selectedCompetition, setSelectedCompetition] = useState("");
  const [achievementFilter, setAchievementFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [viewingParticipant, setViewingParticipant] = useState(null);

  const { competitions } = useCompetitions();
  const {
    participants,
    isLoading,
    createParticipant,
    isCreating,
    updateParticipant,
    isUpdating,
    archiveParticipant,
    isArchiving,
    bulkUpload,
    isBulkUploading,
  } = useParticipants({
    search,
    competitionId: selectedCompetition,
    achievementType: achievementFilter,
  });

  const handleOpenCreate = () => {
    setEditingParticipant(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingParticipant(p);
    setIsModalOpen(true);
  };

  const handleArchive = async (id) => {
    if (confirm("Are you sure you want to archive this participant?")) {
      await archiveParticipant(id);
    }
  };

  const handleFormSubmit = async (formData) => {
    if (editingParticipant) {
      await updateParticipant({ id: editingParticipant._id, data: formData });
    } else {
      await createParticipant(formData);
    }
  };

  const competitionOptions = [
    { label: "All Competitions", value: "" },
    ...competitions.map((c) => ({ label: c.name, value: c._id })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A284A]">Participants</h1>
          <p className="text-sm text-gray-500 mt-1">Manage competition participants and reference numbers</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsBulkModalOpen(true)}
            variant="outline"
            className="gap-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Bulk Import
          </Button>
          <Button onClick={handleOpenCreate} variant="primary" className="gap-2">
            <Plus className="w-4 h-4" /> Add Participant
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search by name, phone, or reference number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        </div>

        <div className="w-full md:w-56">
          <Select
            value={selectedCompetition}
            onChange={(e) => setSelectedCompetition(e.target.value)}
            options={competitionOptions}
          />
        </div>

        <div className="w-full md:w-44">
          <Select
            value={achievementFilter}
            onChange={(e) => setAchievementFilter(e.target.value)}
            options={[
              { label: "All Achievements", value: "" },
              { label: "Participant", value: "participant" },
              { label: "Winner", value: "winner" },
            ]}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : participants.length === 0 ? (
        <EmptyState
          title="No participants found"
          description="Add participants manually or import via Excel."
          action={
            <div className="flex items-center gap-3 mt-4">
              <Button
                onClick={() => setIsBulkModalOpen(true)}
                variant="outline"
                className="gap-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Bulk Import
              </Button>
              <Button onClick={handleOpenCreate} variant="primary" className="gap-2">
                <Plus className="w-4 h-4" /> Add Participant
              </Button>
            </div>
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/70 text-gray-700 uppercase font-semibold text-xs border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Ref Number</th>
                  <th className="px-6 py-4">Participant Name</th>
                  <th className="px-6 py-4">Phone & Age</th>
                  <th className="px-6 py-4">Competition</th>
                  <th className="px-6 py-4">Achievement</th>
                  <th className="px-6 py-4">Source & Media</th>
                  <th className="px-6 py-4">Downloads</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {participants.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-[#29479B]">
                      {p.refNumber}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => setViewingParticipant(p)}
                        className="font-semibold text-[#1A284A] hover:text-[#29479B] hover:underline text-left cursor-pointer transition-colors block"
                        title="Click to view details and preview source post"
                      >
                        {p.name}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-gray-700">{p.phone}</div>
                      <div className="text-[11px] text-gray-400">Age: {p.age || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-700">
                      {p.competitionId?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={p.achievementType === "winner" ? "warning" : "info"}>
                        {p.achievementType}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {p.sourceUrl ? (
                          <a
                            href={p.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
                            title={p.sourceUrl}
                          >
                            Source <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                        {p.mediaUrl && (
                          <a
                            href={p.mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 hover:underline font-medium"
                            title="View Media"
                          >
                            <ImageIcon className="w-3.5 h-3.5" /> Media
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-500">
                      📜 {p.downloadCount || 0} | 🎨 {p.posterDownloadCount || 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setViewingParticipant(p)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="View Details & Preview Source Post"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-gray-500 hover:text-[#29479B] hover:bg-gray-100 rounded-md transition-colors"
                          title="Edit Participant"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleArchive(p._id)}
                          disabled={isArchiving}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                          title="Archive Participant"
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

      {/* Participant Details & Submission Preview Modal */}
      <ParticipantDetailsModal
        isOpen={Boolean(viewingParticipant)}
        onClose={() => setViewingParticipant(null)}
        participant={viewingParticipant}
      />

      {/* Single Participant Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingParticipant ? "Edit Participant" : "Add Participant"}
      >
        <ParticipantForm
          initialData={editingParticipant}
          onSubmit={handleFormSubmit}
          onClose={() => setIsModalOpen(false)}
          isLoading={isCreating || isUpdating}
        />
      </Modal>

      {/* Bulk Import Excel Modal */}
      <BulkImportModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        competitions={competitions}
        onBulkUpload={bulkUpload}
        isUploading={isBulkUploading}
      />
    </div>
  );
}

