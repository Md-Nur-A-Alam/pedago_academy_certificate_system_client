"use client";

import React from "react";

export function EmptyState({ title = "No data found", description = "There are no items to display at this time.", action }) {
  return (
    <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50">
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-xl font-bold">
        ?
      </div>
      <h3 className="text-base font-bold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1 mb-6">{description}</p>
      {action}
    </div>
  );
}
