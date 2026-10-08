import * as XLSX from "xlsx";

/**
 * Triggers a browser file download using a Blob.
 *
 * @param {Blob} blob
 * @param {string} filename
 */
export function downloadBlob(blob, filename) {
  if (typeof window === "undefined") return;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Helper to calculate dynamic column widths for an XLSX sheet.
 */
function calculateAutoColumnWidths(data) {
  if (!Array.isArray(data) || data.length === 0) return [];
  const keys = Object.keys(data[0] || {});
  return keys.map((key) => {
    let maxLen = String(key).length;
    for (const row of data) {
      const val = row[key];
      if (val !== undefined && val !== null) {
        const str = String(val);
        if (str.length > maxLen) {
          maxLen = str.length;
        }
      }
    }
    // Cap width between 10 and 60 chars for readable display
    return { wch: Math.min(Math.max(maxLen + 3, 10), 60) };
  });
}

/**
 * Export data array to Excel (.xlsx) file.
 *
 * @param {Array<Object>} data - Array of row objects
 * @param {string} filename - Filename with or without .xlsx extension
 * @param {string} [sheetName="Export"]
 */
export function exportToExcel(data, filename, sheetName = "Export") {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("No data available to export");
  }

  const finalName = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = calculateAutoColumnWidths(data);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31)); // Excel sheet names limited to 31 chars

  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
  });

  downloadBlob(blob, finalName);
}

/**
 * Export data array to CSV (.csv) file.
 * Prepends UTF-8 BOM (\uFEFF) so Bengali and international characters render correctly in Excel.
 *
 * @param {Array<Object>} data - Array of row objects
 * @param {string} filename - Filename with or without .csv extension
 */
export function exportToCsv(data, filename) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("No data available to export");
  }

  const finalName = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  const headers = Object.keys(data[0] || {});

  const escapeCsvValue = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    // Double quote internal quotes and wrap in quotes if contains comma, quote, or newline
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const headerLine = headers.map(escapeCsvValue).join(",");
  const rows = data.map((row) =>
    headers.map((field) => escapeCsvValue(row[field])).join(",")
  );

  // UTF-8 BOM (\uFEFF) ensures Excel opens Bengali/Unicode text properly without garbled characters
  const csvContent = "\uFEFF" + [headerLine, ...rows].join("\r\n");
  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  downloadBlob(blob, finalName);
}

/**
 * Export raw or formatted data to JSON (.json) file.
 *
 * @param {any} data - Array or object to export as JSON
 * @param {string} filename - Filename with or without .json extension
 */
export function exportToJson(data, filename) {
  if (!data) {
    throw new Error("No data available to export");
  }

  const finalName = filename.endsWith(".json") ? filename : `${filename}.json`;
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], {
    type: "application/json;charset=utf-8;",
  });

  downloadBlob(blob, finalName);
}

/**
 * Clean HTML and line breaks for table export.
 */
function cleanText(text) {
  if (!text) return "";
  return String(text)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Transforms competitions data into structured rows suitable for tabular export (Excel/CSV)
 * and structured JSON.
 *
 * @param {Array<Object>} competitions
 * @returns {Array<Object>}
 */
export function formatCompetitionsForExport(competitions = []) {
  return competitions.map((comp, idx) => {
    const categoriesStr = Array.isArray(comp.categories) && comp.categories.length > 0
      ? comp.categories.join(", ")
      : comp.category || "General";

    const groupsStr = Array.isArray(comp.categoryGroups) && comp.categoryGroups.length > 0
      ? comp.categoryGroups
          .map((g) => `${g.name || ""}${g.details ? ` (${g.details})` : ""}`)
          .filter(Boolean)
          .join("; ")
      : "";

    const topicsStr = Array.isArray(comp.topicTypes) && comp.topicTypes.length > 0
      ? comp.topicTypes.join(", ")
      : comp.topicType || "";

    const ageRange =
      comp.minAge && comp.maxAge
        ? `${comp.minAge} - ${comp.maxAge} years`
        : comp.minAge
        ? `${comp.minAge}+ years`
        : comp.maxAge
        ? `Up to ${comp.maxAge} years`
        : "All Ages";

    const totalPictures =
      comp.totalLinkedPhotos ??
      (Array.isArray(comp.galleryImages) ? comp.galleryImages.length : 0);

    return {
      "SL": idx + 1,
      "Competition Name": comp.name || "",
      "Status": comp.status ? comp.status.toUpperCase() : "DRAFT",
      "Ref Prefix": comp.refPrefix || "",
      "Ref Padding": comp.refPadding ?? 0,
      "Category": comp.category || "General",
      "All Categories": categoriesStr,
      "Category Groups": groupsStr,
      "Topics / Streams": topicsStr,
      "Age Range": ageRange,
      "Start Date": comp.startDate || "N/A",
      "End Date": comp.endDate || "N/A",
      "Result Publish Date": comp.resultPublishDate || "N/A",
      "Provides Certificate": comp.providesCertificate === false ? "No" : "Yes",
      "1st Prize": comp.prizes?.firstPrize || "",
      "2nd Prize": comp.prizes?.secondPrize || "",
      "3rd Prize": comp.prizes?.thirdPrize || "",
      "Top N Prizes": comp.prizes?.topNPrizes || "",
      "Participant Prize": comp.prizes?.allParticipantPrize || "",
      "Source Link": comp.sourceLink || "",
      "Cover Image URL": comp.imageUrl || "",
      "Linked Media Count": totalPictures,
      "Description": cleanText(comp.description),
      "Created At": comp.createdAt ? new Date(comp.createdAt).toLocaleString("en-GB") : "",
      "Competition ID": comp._id || "",
    };
  });
}

/**
 * Transforms participants data into structured rows suitable for tabular export (Excel/CSV)
 * and structured JSON.
 *
 * @param {Array<Object>} participants
 * @returns {Array<Object>}
 */
export function formatParticipantsForExport(participants = []) {
  return participants.map((p, idx) => {
    const compName =
      p.competitionId && typeof p.competitionId === "object"
        ? p.competitionId.name
        : p.competitionId || "N/A";

    const compPrefix =
      p.competitionId && typeof p.competitionId === "object"
        ? p.competitionId.refPrefix || ""
        : "";

    return {
      "SL": idx + 1,
      "Ref Number": p.refNumber || "",
      "Participant Name": p.name || "",
      "Phone Number": p.phone || "",
      "Age": p.age ?? "",
      "Category": p.category || "General",
      "Achievement Type": p.achievementType === "winner" ? "Winner" : "Participant",
      "Competition Name": compName,
      "Ref Prefix": compPrefix,
      "Source URL": p.sourceUrl || "",
      "Media URL": p.mediaUrl || "",
      "Certificate Downloads": p.downloadCount || 0,
      "Poster Downloads": p.posterDownloadCount || 0,
      "Total Validated": p.validatedCount || 0,
      "Last Downloaded At": p.lastDownloadedAt
        ? new Date(p.lastDownloadedAt).toLocaleString("en-GB")
        : "Never",
      "Registered At": p.createdAt ? new Date(p.createdAt).toLocaleString("en-GB") : "",
      "Participant ID": p._id || "",
    };
  });
}
