"use client";

import React from "react";

export const Select = React.forwardRef(function Select(
  { label, options = [], error, helperText, className = "", id, children, ...props },
  ref
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`w-full px-3.5 py-2.5 border rounded-xl text-sm font-medium text-gray-900 bg-white transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#29479B] focus:border-transparent cursor-pointer disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed ${
          error ? "border-red-500" : "border-gray-300"
        } ${className}`}
        {...props}
      >
        {children
          ? children
          : options.map((opt) => (
              <option key={opt.value} value={opt.value} className="text-gray-900 bg-white">
                {opt.label}
              </option>
            ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {!error && helperText && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
    </div>
  );
});

export default Select;
