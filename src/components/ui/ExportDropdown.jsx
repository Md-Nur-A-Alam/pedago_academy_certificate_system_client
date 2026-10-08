"use client";

import React, { useState, useRef, useEffect } from "react";
import { Download, ChevronDown, FileSpreadsheet, FileText, FileCode, Loader2 } from "lucide-react";

/**
 * Reusable Export Dropdown component with options for Excel (.xlsx), CSV (.csv), and JSON (.json).
 *
 * @param {Object} props
 * @param {Function} props.onExport - Callback `(format: 'excel' | 'csv' | 'json') => Promise<void> | void`
 * @param {boolean} [props.isLoading=false] - If export data is actively being fetched or processed
 * @param {number} [props.count] - Optional item count to display on the button
 * @param {boolean} [props.disabled=false] - Whether button is disabled
 * @param {string} [props.label="Export"] - Button label text
 * @param {string} [props.className=""] - Extra CSS classes for wrapper
 */
export function ExportDropdown({
  onExport,
  isLoading = false,
  count,
  disabled = false,
  label = "Export",
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFormat, setActiveFormat] = useState(null);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = async (format) => {
    setIsOpen(false);
    if (disabled || isLoading) return;
    setActiveFormat(format);
    try {
      await onExport(format);
    } finally {
      setActiveFormat(null);
    }
  };

  const isBusy = isLoading || Boolean(activeFormat);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && !isBusy && setIsOpen(!isOpen)}
        disabled={disabled || isBusy}
        className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-all shadow-2xs hover:border-gray-400 focus:outline-hidden focus:ring-2 focus:ring-[#29479B]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        title="Export data according to current filters"
      >
        {isBusy ? (
          <Loader2 className="w-4 h-4 text-[#29479B] animate-spin shrink-0" />
        ) : (
          <Download className="w-4 h-4 text-gray-500 shrink-0" />
        )}
        <span>{label}</span>
        {count !== undefined && count > 0 && (
          <span className="px-1.5 py-0.2 text-[11px] font-bold rounded-full bg-gray-100 text-gray-600 border border-gray-200">
            {count}
          </span>
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-xl bg-white border border-gray-100 ring-1 ring-black/5 z-50 py-1.5 animate-in fade-in zoom-in-95 duration-100 divide-y divide-gray-100">
          <div className="px-3 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Export Filtered Data As
          </div>

          <div className="py-1">
            {/* Excel Option */}
            <button
              type="button"
              onClick={() => handleSelect("excel")}
              className="w-full text-left px-3.5 py-2 text-sm text-gray-700 hover:bg-emerald-50/70 hover:text-emerald-800 flex items-center gap-3 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-200/80 transition-colors">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 group-hover:text-emerald-900 flex items-center justify-between">
                  <span>Excel</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">.xlsx</span>
                </div>
                <div className="text-[11px] text-gray-500 truncate">Microsoft Excel spreadsheet</div>
              </div>
            </button>

            {/* CSV Option */}
            <button
              type="button"
              onClick={() => handleSelect("csv")}
              className="w-full text-left px-3.5 py-2 text-sm text-gray-700 hover:bg-blue-50/70 hover:text-blue-800 flex items-center gap-3 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0 group-hover:bg-blue-200/80 transition-colors">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 group-hover:text-blue-900 flex items-center justify-between">
                  <span>CSV</span>
                  <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">.csv</span>
                </div>
                <div className="text-[11px] text-gray-500 truncate">Comma-separated values (UTF-8)</div>
              </div>
            </button>

            {/* JSON Option */}
            <button
              type="button"
              onClick={() => handleSelect("json")}
              className="w-full text-left px-3.5 py-2 text-sm text-gray-700 hover:bg-purple-50/70 hover:text-purple-800 flex items-center gap-3 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-100/80 text-purple-700 flex items-center justify-center shrink-0 group-hover:bg-purple-200/80 transition-colors">
                <FileCode className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 group-hover:text-purple-900 flex items-center justify-between">
                  <span>JSON</span>
                  <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">.json</span>
                </div>
                <div className="text-[11px] text-gray-500 truncate">Structured raw/formatted data</div>
              </div>
            </button>
          </div>

          <div className="px-3.5 py-2 text-[10px] text-gray-400 bg-gray-50/60 rounded-b-xl flex items-center justify-between">
            <span>Matches active search & filters</span>
            <span className="font-mono">UTF-8</span>
          </div>
        </div>
      )}
    </div>
  );
}
