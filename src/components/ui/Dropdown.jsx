"use client";

import React, { useState } from "react";

export function Dropdown({ trigger, items = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black/5 z-50 py-1 border border-gray-100">
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                item.onClick?.();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
