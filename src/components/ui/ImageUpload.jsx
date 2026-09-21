"use client";

import { useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import {
  UploadCloud,
  Link as LinkIcon,
  Image as ImageIcon,
  X,
  ExternalLink,
  Loader2,
  Sparkles,
} from "lucide-react";
import apiClient from "@/lib/api-client";
import { toast } from "react-toastify";

export function ImageUpload({
  label = "Image",
  value = "",
  onChange,
  error,
  helpText = "Upload a file or paste a web image link",
}) {
  const [tab, setTab] = useState("file"); // 'file' | 'url'
  const [urlInput, setUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // File Dropzone handling
  const onDrop = async (acceptedFiles) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const { data } = await apiClient.post("/api/upload", formData, {
        headers: {
          "Content-Type": undefined,
        },
      });

      const uploadedUrl = data?.data?.url;
      if (uploadedUrl) {
        onChange(uploadedUrl);
        toast.success("Image uploaded successfully!");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Failed to upload image";
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  // URL Import / Detect handling
  const handleImportUrl = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsImporting(true);
    try {
      const { data } = await apiClient.post("/api/upload/from-url", {
        url: trimmed,
      });

      const importedUrl = data?.data?.url;
      if (importedUrl) {
        onChange(importedUrl);
        setUrlInput("");
        toast.success("Image imported and hosted successfully!");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Could not extract or host image from this URL.";
      toast.error(msg);
    } finally {
      setIsImporting(false);
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="w-full space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          {!value && (
            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setTab("file")}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  tab === "file"
                    ? "bg-white text-[#1A284A] shadow-2xs font-semibold"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setTab("url")}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  tab === "url"
                    ? "bg-white text-[#1A284A] shadow-2xs font-semibold"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                From Link / FB
              </button>
            </div>
          )}
        </div>
      )}

      {/* If an image is selected / uploaded */}
      {value ? (
        <div className="relative group p-3 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center gap-3">
          <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden shrink-0 border border-gray-200 relative">
            <img
              src={value}
              alt="Uploaded preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/fallback-image.png";
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-gray-800 truncate flex items-center gap-1.5">
              <span className="truncate">{value}</span>
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-blue-600 transition-colors shrink-0"
                title="Open in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Hosted & ready to use
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : tab === "file" ? (
        /* File Dropzone View */
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-[#29479B] bg-blue-50/50"
              : "border-gray-200 hover:border-gray-300 bg-gray-50/40"
          } ${isUploading ? "opacity-60 pointer-events-none" : ""}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-2">
            {isUploading ? (
              <>
                <Loader2 className="w-7 h-7 text-[#29479B] animate-spin" />
                <p className="text-xs font-medium text-gray-600">
                  Uploading image...
                </p>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#29479B] flex items-center justify-center shadow-2xs">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    PNG, JPG, WebP or GIF (Fast & Secure Storage)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Paste URL / Facebook Image View */
        <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-2.5">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="url"
                placeholder="Paste Facebook image address or web link..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleImportUrl();
                  }
                }}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-lg border border-gray-200 focus:outline-hidden focus:border-[#29479B]"
              />
            </div>
            <button
              type="button"
              onClick={handleImportUrl}
              disabled={isImporting || !urlInput.trim()}
              className="px-3.5 py-2 text-xs font-semibold bg-[#29479B] hover:bg-[#1A284A] text-white rounded-lg transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Import Image</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            💡 <strong>Facebook Tip:</strong> Right-click the photo on Facebook, choose <span className="text-gray-600 font-medium">&quot;Copy image address&quot;</span>, and paste here. Our server will save and host it permanently so the link never expires.
          </p>
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {!error && helpText && !value && (
        <p className="text-[11px] text-gray-400">{helpText}</p>
      )}
    </div>
  );
}

export default ImageUpload;
