"use client";

import { useState } from "react";
import { User, Palette, KeyRound } from "lucide-react";
import { AdminProfileSettings } from "@/features/admin/settings/AdminProfileSettings";
import { BrandingSettings } from "@/features/admin/settings/BrandingSettings";
import { SecuritySettings } from "@/features/admin/settings/SecuritySettings";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'branding' | 'security'

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1A284A]">Settings & Administration</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your personal admin profile, portal branding, and security credentials
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "profile"
              ? "bg-[#29479B] text-white shadow-xs"
              : "text-gray-600 hover:text-[#1A284A] hover:bg-gray-100"
          }`}
        >
          <User className="w-4 h-4" />
          <span>My Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("branding")}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "branding"
              ? "bg-[#29479B] text-white shadow-xs"
              : "text-gray-600 hover:text-[#1A284A] hover:bg-gray-100"
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>System & Branding</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "security"
              ? "bg-[#29479B] text-white shadow-xs"
              : "text-gray-600 hover:text-[#1A284A] hover:bg-gray-100"
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Security & Password</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === "profile" && <AdminProfileSettings />}
        {activeTab === "branding" && <BrandingSettings />}
        {activeTab === "security" && <SecuritySettings />}
      </div>
    </div>
  );
}
