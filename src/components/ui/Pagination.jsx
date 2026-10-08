"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

/**
 * Reusable Pagination Component
 *
 * @param {Object} props
 * @param {number} props.currentPage - Current 1-based page number
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.totalItems - Total number of items
 * @param {number} props.pageSize - Number of items per page
 * @param {Function} props.onPageChange - Callback when page changes (newPage: number) => void
 * @param {Function} [props.onPageSizeChange] - Optional callback when page size changes (newSize: number) => void
 * @param {number[]} [props.pageSizeOptions=[10, 25, 50, 100]] - Page size options
 * @param {string} [props.itemName="entries"] - Singular or plural name of items being displayed
 * @param {boolean} [props.disabled=false] - Whether interactions are disabled
 */
export function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  itemName = "participants",
  disabled = false,
}) {
  const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const fromItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const toItem = totalItems === 0 ? 0 : Math.min(safeCurrentPage * pageSize, totalItems);

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    if (safeCurrentPage <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    } else if (safeCurrentPage >= totalPages - 3) {
      pages.push(1);
      pages.push("...");
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      pages.push(safeCurrentPage - 1);
      pages.push(safeCurrentPage);
      pages.push(safeCurrentPage + 1);
      pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const pages = getPageNumbers();

  const handlePrev = () => {
    if (safeCurrentPage > 1 && !disabled) {
      onPageChange(safeCurrentPage - 1);
    }
  };

  const handleNext = () => {
    if (safeCurrentPage < totalPages && !disabled) {
      onPageChange(safeCurrentPage + 1);
    }
  };

  const handleFirst = () => {
    if (safeCurrentPage !== 1 && !disabled) {
      onPageChange(1);
    }
  };

  const handleLast = () => {
    if (safeCurrentPage !== totalPages && !disabled) {
      onPageChange(totalPages);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border-t border-gray-100 rounded-b-xl text-sm">
      {/* Items count summary */}
      <div className="text-gray-500 text-xs sm:text-sm">
        {totalItems === 0 ? (
          <span>No {itemName} found</span>
        ) : (
          <span>
            Showing <span className="font-semibold text-gray-900">{fromItem}</span> to{" "}
            <span className="font-semibold text-gray-900">{toItem}</span> of{" "}
            <span className="font-semibold text-gray-900">{totalItems}</span> {itemName}
          </span>
        )}
      </div>

      {/* Controls: Page size + Page Navigation */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Page size selector */}
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="hidden md:inline">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={disabled}
              className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white hover:border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#29479B] focus:border-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Page navigation buttons */}
        <div className="flex items-center gap-1">
          {/* First page button */}
          <button
            type="button"
            onClick={handleFirst}
            disabled={safeCurrentPage <= 1 || disabled}
            title="First Page"
            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Previous page button */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={safeCurrentPage <= 1 || disabled}
            title="Previous Page"
            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1 mx-0.5">
            {pages.map((p, idx) => {
              if (p === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 py-1 text-gray-400 select-none text-xs"
                  >
                    …
                  </span>
                );
              }

              const isActive = p === safeCurrentPage;
              return (
                <button
                  key={`page-${p}`}
                  type="button"
                  onClick={() => !disabled && onPageChange(p)}
                  disabled={disabled}
                  className={`min-w-8 h-8 px-2 flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#29479B] text-white shadow-xs cursor-default"
                      : "text-gray-700 hover:bg-gray-100 hover:text-[#29479B]"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Next page button */}
          <button
            type="button"
            onClick={handleNext}
            disabled={safeCurrentPage >= totalPages || disabled}
            title="Next Page"
            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Last page button */}
          <button
            type="button"
            onClick={handleLast}
            disabled={safeCurrentPage >= totalPages || disabled}
            title="Last Page"
            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Pagination;
