"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  FileSpreadsheet,
  ExternalLink,
  Image as ImageIcon,
  Eye,
  RotateCcw,
  Calendar,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "react-toastify";
import apiClient from "@/lib/api-client";
import { useParticipants } from "./useParticipants";
import { useCompetitions } from "../competitions/useCompetitions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { ExportDropdown } from "@/components/ui/ExportDropdown";
import { Pagination } from "@/components/ui/Pagination";
import { ParticipantForm } from "./ParticipantForm";
import { BulkImportModal } from "./BulkImportModal";
import { ParticipantDetailsModal } from "./ParticipantDetailsModal";
import {
  exportToExcel,
  exportToCsv,
  exportToJson,
  formatParticipantsForExport,
} from "@/lib/exportUtils";

export function ParticipantsTable() {
  const [search, setSearch] = useState("");
  const [selectedCompetition, setSelectedCompetition] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [achievementFilter, setAchievementFilter] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [viewingParticipant, setViewingParticipant] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const { competitions } = useCompetitions();

  const {
    participants,
    pagination,
    availableCategories,
    isLoading,
    isFetching,
    createParticipant,
    isCreating,
    updateParticipant,
    isUpdating,
    archiveParticipant,
    isArchiving,
    bulkUpload,
    isBulkUploading,
  } = useParticipants({
    page,
    limit,
    search: search.trim() || undefined,
    competitionId: selectedCompetition || undefined,
    category: selectedCategory || undefined,
    achievementType: achievementFilter || undefined,
    minAge: minAge !== "" ? minAge : undefined,
    maxAge: maxAge !== "" ? maxAge : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
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

  // Build competition dropdown options
  const competitionOptions = useMemo(() => {
    return [
      { label: "All Competitions", value: "" },
      ...competitions.map((c) => ({ label: c.name, value: c._id })),
    ];
  }, [competitions]);

  // Build category dropdown options dynamically from competition and participants data
  const categoryOptions = useMemo(() => {
    const set = new Set();

    if (selectedCompetition) {
      const comp = competitions.find((c) => c._id === selectedCompetition);
      if (comp) {
        if (Array.isArray(comp.categories)) {
          comp.categories.forEach((cat) => cat && set.add(cat));
        }
        if (comp.category) set.add(comp.category);
      }
    } else {
      competitions.forEach((c) => {
        if (Array.isArray(c.categories)) {
          c.categories.forEach((cat) => cat && set.add(cat));
        }
        if (c.category) set.add(c.category);
      });
    }

    // Also include any categories returned from the server or loaded participants
    if (Array.isArray(availableCategories)) {
      availableCategories.forEach((cat) => cat && set.add(cat));
    }
    if (Array.isArray(participants)) {
      participants.forEach((p) => p.category && set.add(p.category));
    }

    const sortedCats = Array.from(set).sort((a, b) => a.localeCompare(b));
    return [
      { label: "All Categories", value: "" },
      ...sortedCats.map((cat) => ({ label: cat, value: cat })),
    ];
  }, [competitions, selectedCompetition, availableCategories, participants]);

  // Check if any filter is currently applied
  const hasActiveFilters = Boolean(
    search ||
      selectedCompetition ||
      selectedCategory ||
      achievementFilter ||
      minAge !== "" ||
      maxAge !== "" ||
      startDate ||
      endDate
  );

  const handleClearFilters = () => {
    setSearch("");
    setSelectedCompetition("");
    setSelectedCategory("");
    setAchievementFilter("");
    setMinAge("");
    setMaxAge("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const handleExport = async (format) => {
    setIsExporting(true);
    try {
      let dataToExport = participants;
      try {
        const res = await apiClient.get("/api/participants", {
          params: {
            search: search.trim() || undefined,
            competitionId: selectedCompetition || undefined,
            category: selectedCategory || undefined,
            achievementType: achievementFilter || undefined,
            minAge: minAge !== "" ? minAge : undefined,
            maxAge: maxAge !== "" ? maxAge : undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            all: "true",
          },
        });
        if (res.data?.data && Array.isArray(res.data.data)) {
          dataToExport = res.data.data;
        }
      } catch (err) {
        console.warn("Could not fetch full export list from API, falling back to loaded participants", err);
      }

      if (!dataToExport || dataToExport.length === 0) {
        toast.info("No participants found matching current filters to export.");
        return;
      }

      const dateStr = new Date().toISOString().slice(0, 10);
      const selectedCompObj = competitions.find((c) => c._id === selectedCompetition);
      const compSlug = selectedCompObj
        ? `_${(selectedCompObj.refPrefix || selectedCompObj.name.slice(0, 15)).replace(/[^a-zA-Z0-9_-]/g, "_")}`
        : "";
      const catSlug = selectedCategory ? `_${selectedCategory.slice(0, 15).replace(/[^a-zA-Z0-9_-]/g, "_")}` : "";
      const achieveSlug = achievementFilter ? `_${achievementFilter}` : "";
      const baseFilename = `participants${compSlug}${catSlug}${achieveSlug}_${dateStr}`;
      const formattedRows = formatParticipantsForExport(dataToExport);

      if (format === "excel") {
        exportToExcel(formattedRows, baseFilename, "Participants");
        toast.success(`Exported ${dataToExport.length} participants as Excel (.xlsx)`);
      } else if (format === "csv") {
        exportToCsv(formattedRows, baseFilename);
        toast.success(`Exported ${dataToExport.length} participants as CSV (.csv)`);
      } else if (format === "json") {
        exportToJson(dataToExport, baseFilename);
        toast.success(`Exported ${dataToExport.length} participants as JSON (.json)`);
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error(error.message || "Failed to export participants");
    } finally {
      setIsExporting(false);
    }
  };

  const totalCount = pagination?.total ?? participants?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A284A]">Participants</h1>
          <p className="text-sm text-gray-500 mt-1">Manage competition participants and reference numbers</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportDropdown
            onExport={handleExport}
            isLoading={isExporting}
            count={totalCount}
            disabled={isLoading || totalCount === 0}
          />
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

      {/* Filter and Search Panel */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs space-y-3">
        {/* Row 1: Search, Competition, Category, Achievement */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-5 lg:col-span-4">
            <Input
              placeholder="Search by name, phone, or reference number..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-8"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Competition Filter */}
          <div className="md:col-span-3 lg:col-span-3">
            <Select
              value={selectedCompetition}
              onChange={(e) => {
                setSelectedCompetition(e.target.value);
                setSelectedCategory("");
                setPage(1);
              }}
              options={competitionOptions}
            />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-2 lg:col-span-3">
            <Select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              options={categoryOptions}
            />
          </div>

          {/* Achievement Filter */}
          <div className="md:col-span-2 lg:col-span-2">
            <Select
              value={achievementFilter}
              onChange={(e) => {
                setAchievementFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { label: "All Achievements", value: "" },
                { label: "Participant", value: "participant" },
                { label: "Winner", value: "winner" },
              ]}
            />
          </div>
        </div>

        {/* Row 2: Age Range, Created Date Range, and Filter Actions */}
        <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            {/* Age Range Filter */}
            <div className="flex items-center gap-2 bg-gray-50/80 px-3 py-1.5 rounded-lg border border-gray-200">
              <span className="font-semibold text-gray-700 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" /> Age:
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="1"
                  max="120"
                  placeholder="Min"
                  value={minAge}
                  onChange={(e) => {
                    setMinAge(e.target.value);
                    setPage(1);
                  }}
                  className="w-16 px-2 py-1 bg-white border border-gray-300 rounded-md text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-1 focus:ring-[#29479B]"
                />
                <span className="text-gray-400 font-medium">–</span>
                <input
                  type="number"
                  min="1"
                  max="120"
                  placeholder="Max"
                  value={maxAge}
                  onChange={(e) => {
                    setMaxAge(e.target.value);
                    setPage(1);
                  }}
                  className="w-16 px-2 py-1 bg-white border border-gray-300 rounded-md text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-1 focus:ring-[#29479B]"
                />
              </div>
            </div>

            {/* Created At Date Range Filter */}
            <div className="flex items-center gap-2 bg-gray-50/80 px-3 py-1.5 rounded-lg border border-gray-200">
              <span className="font-semibold text-gray-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-500" /> Created:
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={startDate}
                  title="From Date"
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  className="px-2 py-1 bg-white border border-gray-300 rounded-md text-xs text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-[#29479B]"
                />
                <span className="text-gray-400 font-medium">to</span>
                <input
                  type="date"
                  value={endDate}
                  title="To Date"
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  className="px-2 py-1 bg-white border border-gray-300 rounded-md text-xs text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-[#29479B]"
                />
              </div>
            </div>
          </div>

          {/* Clear Filters Action */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-300 font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table & State Container */}
      {isLoading ? (
        <div className="py-20 flex justify-center bg-white rounded-xl border border-gray-100">
          <Spinner size="lg" />
        </div>
      ) : participants.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? "No matching participants found" : "No participants found"}
          description={
            hasActiveFilters
              ? "Try adjusting or clearing your filters to see more results."
              : "Add participants manually or import via Excel."
          }
          action={
            hasActiveFilters ? (
              <div className="mt-4">
                <Button onClick={handleClearFilters} variant="outline" className="gap-2">
                  <RotateCcw className="w-4 h-4" /> Reset All Filters
                </Button>
              </div>
            ) : (
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
            )
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto relative">
            {isFetching && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center z-10">
                <Spinner size="md" />
              </div>
            )}
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
                {participants.map((p) => {
                  const createdDate = p.createdAt
                    ? new Date(p.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : null;

                  return (
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
                        {createdDate && (
                          <div className="text-[11px] text-gray-400 mt-0.5" title={`Created on ${p.createdAt}`}>
                            Created: {createdDate}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs text-gray-700">{p.phone}</div>
                        <div className="text-[11px] text-gray-400">Age: {p.age ?? "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-700">
                        <div className="font-medium text-gray-900">{p.competitionId?.name || "N/A"}</div>
                        <span className="inline-flex items-center px-1.5 py-0.5 mt-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                          {p.category || "General"}
                        </span>
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
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          <Pagination
            currentPage={pagination?.page || page}
            totalPages={pagination?.totalPages || 1}
            totalItems={pagination?.total || 0}
            pageSize={pagination?.limit || limit}
            onPageChange={(newPage) => setPage(newPage)}
            onPageSizeChange={(newSize) => {
              setLimit(newSize);
              setPage(1);
            }}
            pageSizeOptions={[10, 20, 50, 100]}
            itemName="participants"
            disabled={isLoading || isFetching}
          />
        </div>
      )}

      {/* Participant Details & Submission Preview Modal */}
      <ParticipantDetailsModal
        isOpen={Boolean(viewingParticipant)}
        onClose={() => setViewingParticipant(null)}
        participant={viewingParticipant}
        onUpdateParticipant={updateParticipant}
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

export default ParticipantsTable;
