"use client";

import React from "react";

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-lg transition-all focus:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#29479B] hover:bg-[#1A284A] text-white shadow-xs",
    secondary: "bg-[#1A284A] hover:bg-[#29479B] text-white shadow-xs",
    accent: "bg-[#F0442E] hover:bg-[#F0442E]/90 text-white shadow-xs",
    outline: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50",
    ghost: "text-gray-700 hover:bg-gray-100",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      disabled={disabled}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
