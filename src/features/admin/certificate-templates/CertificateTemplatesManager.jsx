"use client";

import { useState } from "react";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Award,
  User,
  Sliders,
  Sparkles,
  FileCheck,
  Search,
} from "lucide-react";
import { useCertificateTemplates } from "./useCertificateTemplates";
import { useCompetitions } from "../competitions/useCompetitions";
import { CertificateTemplateDesigner } from "./CertificateTemplateDesigner";
import { CertificateTestPreviewModal } from "./CertificateTestPreviewModal";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";

export function CertificateTemplatesManager() {
  const { templates, isLoading, deleteTemplate, isDeleting } = useCertificateTemplates();
  const { competitions } = useCompetitions();

  const [viewMode, setViewMode] = useState("list"); // 'list' | 'designer'
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // Filters
  const [competitionFilter, setCompetitionFilter] = useState("");
  const [variantFilter, setVariantFilter] = useState("");

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setViewMode("designer");
  };

  const handleOpenEdit = (template) => {
    setEditingTemplate(template);
    setViewMode("designer");
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this certificate template configuration?")) {
      await deleteTemplate(id);
    }
  };

  // Filter templates
  const filteredTemplates = templates.filter((t) => {
    const compId = t.competitionId?._id || t.competitionId;
    if (competitionFilter && compId !== competitionFilter) return false;
    if (variantFilter && t.variant !== variantFilter) return false;
    return true;
  });

  const competitionOptions = [
    { label: "All Competitions", value: "" },
    ...competitions.map((c) => ({ label: c.name, value: c._id })),
  ];

  if (viewMode === "designer") {
    return (
      <CertificateTemplateDesigner
        initialTemplate={editingTemplate}
        onBack={() => {
          setEditingTemplate(null);
          setViewMode("list");
        }}
        onSaved={() => {
          setEditingTemplate(null);
          setViewMode("list");
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A284A]">Certificate Templates</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage certificate designs, point-and-click positioning, and test sample generation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleOpenCreate} variant="primary" className="gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Add / Configure Template
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col sm:flex-row gap-4 shadow-xs">
        <div className="flex-1">
          <Select
            label="Filter by Competition"
            value={competitionFilter}
            onChange={(e) => setCompetitionFilter(e.target.value)}
            options={competitionOptions}
          />
        </div>

        <div className="w-full sm:w-56">
          <Select
            label="Filter by Variant"
            value={variantFilter}
            onChange={(e) => setVariantFilter(e.target.value)}
            options={[
              { label: "All Variants", value: "" },
              { label: "Participant Variant", value: "participant" },
              { label: "Winner Variant", value: "winner" },
            ]}
          />
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="py-24 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <EmptyState
          title="No certificate templates found"
          description={
            competitionFilter || variantFilter
              ? "No templates match your selected filters."
              : "Upload your first certificate design to configure visual positioning."
          }
          action={
            <Button onClick={handleOpenCreate} variant="primary" className="mt-4 gap-2">
              <Plus className="w-4 h-4" /> Add Certificate Template
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const compName = template.competitionId?.name || "Competition";
            const compPrefix = template.competitionId?.refPrefix || "COMP";

            return (
              <div
                key={template._id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                {/* Certificate Thumbnail Preview */}
                <div
                  onClick={() => setPreviewTemplate(template)}
                  className="relative aspect-[16/10] bg-slate-900 overflow-hidden cursor-pointer group-hover:opacity-95 transition-opacity"
                >
                  <img
                    src={template.backgroundImageUrl}
                    alt={compName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    crossOrigin="anonymous"
                  />

                  {/* Badges Overlay */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <Badge
                      variant={template.variant === "winner" ? "warning" : "info"}
                      className="shadow-sm capitalize gap-1 font-bold text-xs"
                    >
                      {template.variant === "winner" ? (
                        <Award className="w-3 h-3" />
                      ) : (
                        <User className="w-3 h-3" />
                      )}
                      {template.variant}
                    </Badge>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      v{template.version || 1}
                    </span>
                  </div>

                  {/* Hover Quick Preview Button */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3.5 py-1.5 bg-white text-gray-900 rounded-lg text-xs font-bold shadow-lg flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[#29479B]" /> Test Preview
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-extrabold text-[#1A284A] text-base line-clamp-1">
                      {compName}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">
                      Ref Prefix: <span className="text-gray-700 font-bold">{compPrefix}</span>
                    </p>
                  </div>

                  {/* Coordinate and Typography Summary */}
                  <div className="bg-gray-50 p-2.5 rounded-xl text-xs space-y-1 text-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-blue-700">👤 Name Point:</span>
                      <span className="font-mono text-[11px]">
                        X: {template.nameZone?.x}%, Y: {template.nameZone?.y}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span>Font: {template.nameZone?.font || "Great Vibes"}</span>
                      <span>{template.nameZone?.size || 42}pt</span>
                    </div>

                    <div className="pt-1 border-t border-gray-200/60 flex items-center justify-between">
                      <span className="font-semibold text-amber-700">🏷️ Ref Point:</span>
                      <span className="font-mono text-[11px]">
                        X: {template.refZone?.x}%, Y: {template.refZone?.y}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span>Font: {template.refZone?.font || "Montserrat"}</span>
                      <span>{template.refZone?.size || 18}pt</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewTemplate(template)}
                      className="gap-1.5 text-xs text-blue-700 border-blue-200 hover:bg-blue-50"
                    >
                      <Eye className="w-3.5 h-3.5" /> Test Preview
                    </Button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(template)}
                        className="p-2 text-gray-500 hover:text-[#29479B] hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit Positioning Layout"
                      >
                        <Sliders className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(template._id)}
                        disabled={isDeleting}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete Template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Test Preview Modal with Admin Data */}
      <CertificateTestPreviewModal
        isOpen={Boolean(previewTemplate)}
        onClose={() => setPreviewTemplate(null)}
        template={previewTemplate}
      />
    </div>
  );
}
