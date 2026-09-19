"use client";

import React from "react";

export function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 shadow-xs p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
