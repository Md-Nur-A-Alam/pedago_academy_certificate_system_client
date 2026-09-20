"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  Download,
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { toast } from "react-toastify";

export function BulkImportModal({ isOpen, onClose, competitions = [], onBulkUpload, isUploading }) {
  const [selectedCompetitionId, setSelectedCompetitionId] = useState("");
  const [selectedAchievementType, setSelectedAchievementType] = useState("participant");
  const [parsedRows, setParsedRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [duplicateReport, setDuplicateReport] = useState(null);
  const fileInputRef = useRef(null);

  const selectedCompetition = competitions.find((c) => c._id === selectedCompetitionId);

  // Download prescribed Excel template
  const handleDownloadTemplate = () => {
    if (!selectedCompetitionId) {
      toast.warning("Please select a competition first to download the template.");
      return;
    }

    const compPrefix = selectedCompetition?.refPrefix || "COMP";

    // Prescribed Column headers
    const headers = [
      "Participant Name (Required)",
      "Phone Number (Required)",
      "Age (Required)",
      "Category (Required)",
      "Source URL (Required)",
      "Media URL (Optional)",
    ];

    const definedCats =
      selectedCompetition?.categories?.length > 0
        ? selectedCompetition.categories
        : [selectedCompetition?.category || "General"];

    // Prescribed Sample data rows
    const sampleRows = [
      [
        "Alex Rahman",
        "+8801700000001",
        22,
        definedCats[0] || "Junior",
        "https://facebook.com/pedago/posts/10001",
        "https://i.ibb.co/sample1/photo.jpg",
      ],
      [
        "Alex Rahman",
        "+8801700000001",
        22,
        definedCats[1] || definedCats[0] || "Senior",
        "https://facebook.com/pedago/posts/10002",
        "",
      ],
      [
        "Sarah Khan",
        "+8801800000002",
        19,
        definedCats[2] || definedCats[0] || "Group A",
        "https://facebook.com/pedago/posts/10003",
        "https://i.ibb.co/sample3/avatar.png",
      ],
    ];

    const worksheetData = [headers, ...sampleRows];
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set auto column widths
    ws["!cols"] = [
      { wch: 26 }, // Name
      { wch: 22 }, // Phone
      { wch: 14 }, // Age
      { wch: 18 }, // Category
      { wch: 42 }, // Source URL
      { wch: 38 }, // Media URL
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Participants_Import");

    const exportFileName = `Template_${compPrefix}_${selectedAchievementType.toUpperCase()}.xlsx`;
    XLSX.writeFile(wb, exportFileName);
    toast.success(`Downloaded template: ${exportFileName}`);
  };

  // Helper to match column headers intelligently
  const findColumnKey = (row, candidates) => {
    const keys = Object.keys(row);
    for (const candidate of candidates) {
      const found = keys.find((k) => k.toLowerCase().replace(/[^a-z0-9]/g, "").includes(candidate));
      if (found) return found;
    }
    return null;
  };

  // Parse uploaded Excel / CSV file
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setDuplicateReport(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const firstSheetName = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheetName];
        const rawData = XLSX.utils.sheet_to_json(ws, { defval: "" });

        if (!rawData || rawData.length === 0) {
          toast.error("The selected spreadsheet appears to be empty.");
          return;
        }

        // Standardize rows and validate
        const standardized = rawData.map((row, idx) => {
          const nameKey = findColumnKey(row, ["participantname", "name", "fullname"]);
          const phoneKey = findColumnKey(row, ["phonenumber", "phone", "mobile", "contact"]);
          const ageKey = findColumnKey(row, ["age", "years"]);
          const categoryKey = findColumnKey(row, ["category", "catagory", "group", "track"]);
          const sourceKey = findColumnKey(row, ["sourceurl", "source", "sourcelink", "posturl", "submission"]);
          const mediaKey = findColumnKey(row, ["mediaurl", "media", "medialink", "image", "photourl", "upload"]);

          const name = nameKey ? String(row[nameKey]).trim() : "";
          const phone = phoneKey ? String(row[phoneKey]).trim() : "";
          const ageRaw = ageKey ? row[ageKey] : "";
          const age = Number(ageRaw) || 0;
          const category = categoryKey ? String(row[categoryKey]).trim() : "General";
          const sourceUrl = sourceKey ? String(row[sourceKey]).trim() : "";
          const mediaUrl = mediaKey ? String(row[mediaKey]).trim() : "";

          // Validation
          const errors = [];
          if (!name) errors.push("Missing name");
          if (!phone) errors.push("Missing phone");
          if (!age || age < 1) errors.push("Invalid age");
          if (!category) errors.push("Missing category");
          if (!sourceUrl) errors.push("Missing source URL");

          return {
            rowNumber: idx + 2, // Excel row numbering (row 1 is header)
            name,
            phone,
            age: age > 0 ? age : "",
            category,
            sourceUrl,
            mediaUrl,
            achievementType: selectedAchievementType,
            isValid: errors.length === 0,
            errors,
          };
        });

        setParsedRows(standardized);
        const validCount = standardized.filter((r) => r.isValid).length;
        toast.info(`Loaded ${standardized.length} rows (${validCount} valid).`);
      } catch (err) {
        console.error("Error reading file:", err);
        toast.error("Failed to parse Excel file. Please ensure it is a valid .xlsx or .xls file.");
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleClearFile = () => {
    setParsedRows([]);
    setFileName("");
    setDuplicateReport(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validRows = parsedRows.filter((r) => r.isValid);
  const invalidRows = parsedRows.filter((r) => !r.isValid);

  const handleSubmitImport = async () => {
    if (!selectedCompetitionId) {
      toast.error("Please select a competition.");
      return;
    }

    if (validRows.length === 0) {
      toast.error("No valid rows to import. Please check your data.");
      return;
    }

    try {
      const response = await onBulkUpload({
        competitionId: selectedCompetitionId,
        achievementType: selectedAchievementType,
        rows: validRows.map((r) => ({
          name: r.name,
          phone: r.phone,
          age: r.age,
          sourceUrl: r.sourceUrl,
          mediaUrl: r.mediaUrl,
          achievementType: selectedAchievementType,
        })),
      });

      const data = response?.data || response;
      const duplicates = data?.duplicates || [];

      if (duplicates.length > 0) {
        setDuplicateReport({
          insertedCount: data?.insertedCount ?? (validRows.length - duplicates.length),
          duplicateCount: duplicates.length,
          duplicates,
        });
      } else {
        toast.success(`Successfully imported ${data?.insertedCount || validRows.length} participants!`);
        handleClose();
      }
    } catch (err) {
      // Error handled in hook toast
    }
  };

  const handleClose = () => {
    handleClearFile();
    setSelectedCompetitionId("");
    setSelectedAchievementType("participant");
    onClose();
  };

  const competitionOptions = [
    { label: "Select a competition...", value: "" },
    ...competitions.map((c) => ({
      label: `${c.name} (${c.refPrefix})`,
      value: c._id,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Bulk Import Participants"
      className="max-w-4xl"
    >
      <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
        {/* DUPLICATE REPORT POPUP / BANNER */}
        {duplicateReport && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-amber-900">
                  Import Finished with Existing Rows Flagged
                </h3>
                <p className="text-sm text-amber-800 mt-1">
                  <span className="font-semibold text-emerald-700">
                    ✅ {duplicateReport.insertedCount} participant(s) imported successfully.
                  </span>{" "}
                  However,{" "}
                  <span className="font-semibold text-amber-900">
                    {duplicateReport.duplicateCount} row(s) were skipped
                  </span>{" "}
                  because they already exist in this competition.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-amber-200 overflow-hidden">
              <div className="px-4 py-2 bg-amber-100/60 font-semibold text-xs text-amber-900 uppercase">
                Existing Participant Data (Skipped)
              </div>
              <div className="max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs text-gray-700">
                  <thead className="bg-gray-50 border-b border-gray-100 font-semibold text-gray-600">
                    <tr>
                      <th className="px-3 py-2">Row #</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Phone</th>
                      <th className="px-3 py-2">Category</th>
                      <th className="px-3 py-2">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {duplicateReport.duplicates.map((dup, idx) => (
                      <tr key={idx} className="hover:bg-amber-50/30">
                        <td className="px-3 py-2 font-mono text-gray-500">
                          {dup.rowNumber || idx + 1}
                        </td>
                        <td className="px-3 py-2 font-medium text-gray-900">{dup.name}</td>
                        <td className="px-3 py-2 font-mono text-gray-600">{dup.phone}</td>
                        <td className="px-3 py-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700">
                            {dup.category || "General"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-amber-700 font-medium">
                          {dup.reason || `Already registered in this category (Ref: ${dup.existingRefNumber})`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="primary"
                onClick={() => {
                  setDuplicateReport(null);
                  handleClose();
                }}
              >
                Acknowledge & Finish
              </Button>
            </div>
          </div>
        )}

        {!duplicateReport && (
          <>
            {/* Step 1 & 2: Competition and Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <Select
                label="Step 1: Select Competition *"
                options={competitionOptions}
                value={selectedCompetitionId}
                onChange={(e) => setSelectedCompetitionId(e.target.value)}
              />

              <Select
                label="Step 2: Select Participant Type *"
                options={[
                  { label: "Participant", value: "participant" },
                  { label: "Winner", value: "winner" },
                ]}
                value={selectedAchievementType}
                onChange={(e) => setSelectedAchievementType(e.target.value)}
              />
            </div>

            {selectedCompetition && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-600 bg-slate-50 p-2.5 rounded-xl border border-gray-200/80">
                <span className="font-bold text-gray-700">Valid Categories for this competition:</span>
                {(selectedCompetition.categories && selectedCompetition.categories.length > 0
                  ? selectedCompetition.categories
                  : [selectedCompetition.category || "General"]
                ).map((cat, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-semibold text-[11px]"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}

            {/* Step 3: Template Download Card */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1A284A]">Step 3: Download Prescribed Excel Template</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Pre-configured with columns: Name, Phone, Age, Source URL, and Media URL.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadTemplate}
                className="shrink-0 gap-2 border-blue-200 text-blue-700 hover:bg-blue-100/50"
              >
                <Download className="w-4 h-4" /> Download Template (.xlsx)
              </Button>
            </div>

            {/* Step 4: Upload Area */}
            <div>
              <label className="block text-sm font-bold text-[#1A284A] mb-2">
                Step 4: Upload Completed Excel File (.xlsx, .xls, .csv)
              </label>

              {!fileName ? (
                <label className="border-2 border-dashed border-gray-200 hover:border-[#29479B] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white group">
                  <UploadCloud className="w-10 h-10 text-gray-400 group-hover:text-[#29479B] transition-colors mb-2" />
                  <span className="text-sm font-semibold text-gray-700">Click to upload or drag & drop</span>
                  <span className="text-xs text-gray-400 mt-1">Accepts .xlsx, .xls, or .csv</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
                    <div>
                      <p className="text-sm font-bold text-gray-800">{fileName}</p>
                      <p className="text-xs text-gray-500">
                        Total Rows: {parsedRows.length} |{" "}
                        <span className="text-emerald-600 font-semibold">Valid: {validRows.length}</span>
                        {invalidRows.length > 0 && (
                          <span className="text-amber-600 font-semibold ml-2">
                            | Incomplete: {invalidRows.length}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFile}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" /> Clear
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Data Preview Table */}
            {parsedRows.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#1A284A]">
                    Data Preview ({validRows.length} ready to import)
                  </h4>
                  {invalidRows.length > 0 && (
                    <Badge variant="warning" className="gap-1">
                      <AlertCircle className="w-3 h-3" /> {invalidRows.length} rows have missing fields
                    </Badge>
                  )}
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs text-gray-600">
                    <thead className="bg-gray-50 sticky top-0 uppercase font-semibold text-[11px] text-gray-500 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2">Row</th>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Phone</th>
                        <th className="px-3 py-2">Age</th>
                        <th className="px-3 py-2">Category</th>
                        <th className="px-3 py-2">Source URL</th>
                        <th className="px-3 py-2">Media URL</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {parsedRows.map((row, idx) => (
                        <tr
                          key={idx}
                          className={row.isValid ? "hover:bg-gray-50/50" : "bg-red-50/40 hover:bg-red-50/60"}
                        >
                          <td className="px-3 py-2 font-mono text-gray-400">{row.rowNumber}</td>
                          <td className="px-3 py-2 font-medium text-gray-900">{row.name || "—"}</td>
                          <td className="px-3 py-2 font-mono">{row.phone || "—"}</td>
                          <td className="px-3 py-2">{row.age || "—"}</td>
                          <td className="px-3 py-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700">
                              {row.category || "General"}
                            </span>
                          </td>
                          <td className="px-3 py-2 max-w-[150px] truncate text-blue-600 font-mono" title={row.sourceUrl}>
                            {row.sourceUrl || "—"}
                          </td>
                          <td className="px-3 py-2 max-w-[150px] truncate text-gray-500 font-mono" title={row.mediaUrl}>
                            {row.mediaUrl || "—"}
                          </td>
                          <td className="px-3 py-2">
                            {row.isValid ? (
                              <Badge variant="success" className="gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Ready
                              </Badge>
                            ) : (
                              <Badge variant="error" className="gap-1" title={row.errors.join(", ")}>
                                <XCircle className="w-3 h-3" /> {row.errors[0]}
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={!selectedCompetitionId || validRows.length === 0 || isUploading}
                onClick={handleSubmitImport}
                className="gap-2"
              >
                {isUploading ? (
                  <>
                    <Spinner size="sm" /> Importing...
                  </>
                ) : (
                  `Import ${validRows.length} Participant${validRows.length === 1 ? "" : "s"}`
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
