"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  UploadCloud,
  Link as LinkIcon,
  X,
  ExternalLink,
  Loader2,
  Sparkles,
  Images,
  Eye,
  Copy,
  Check,
  Image as ImageIcon,
} from "lucide-react";
import apiClient from "@/lib/api-client";
import { toast } from "react-toastify";

export function MultiImageUpload({
  label = "Images",
  value = [],
  onChange,
  maxImages = 5,
  error,
  helpText,
}) {
  const images = Array.isArray(value) ? value : [];
  const [tab, setTab] = useState("file"); // 'file' | 'url'
  const [urlInput, setUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [previewModalUrl, setPreviewModalUrl] = useState(null);
  const [copied, setCopied] = useState(false);

  const canAddMore = images.length < maxImages;

  // File Dropzone handling
  const onDrop = async (acceptedFiles) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      toast.warning(`Maximum ${maxImages} images allowed.`);
      return;
    }

    const filesToUpload = acceptedFiles.slice(0, remainingSlots);
    setIsUploading(true);

    const uploadedUrls = [];
    for (const file of filesToUpload) {
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
          uploadedUrls.push(uploadedUrl);
        }
      } catch (err) {
        const msg =
          err.response?.data?.message || err.message || `Failed to upload ${file.name}`;
        toast.error(msg);
      }
    }

    if (uploadedUrls.length > 0) {
      onChange([...images, ...uploadedUrls]);
      toast.success(
        `${uploadedUrls.length} image${uploadedUrls.length > 1 ? "s" : ""} uploaded successfully!`
      );
    }
    setIsUploading(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"],
    },
    maxFiles: maxImages - images.length > 0 ? maxImages - images.length : 1,
    disabled: isUploading || !canAddMore,
  });

  // URL Import / Detect handling
  const handleImportUrl = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      toast.error("Please enter a valid URL");
      return;
    }

    if (!canAddMore) {
      toast.warning(`Maximum ${maxImages} images allowed.`);
      return;
    }

    setIsImporting(true);
    try {
      const { data } = await apiClient.post("/api/upload/from-url", {
        url: trimmed,
      });

      const importedUrl = data?.data?.url;
      if (importedUrl) {
        onChange([...images, importedUrl]);
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

  const handleRemoveImage = (indexToRemove) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  return (
    <div className="w-full space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="block text-xs sm:text-sm font-semibold text-gray-700">
            {label}
          </label>
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              images.length >= maxImages
                ? "bg-amber-100 text-amber-800"
                : "bg-blue-50 text-[#29479B]"
            }`}
          >
            {images.length} / {maxImages}
          </span>
        </div>

        {canAddMore && (
          <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setTab("file")}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md transition-colors cursor-pointer text-[11px] sm:text-xs ${
                tab === "file"
                  ? "bg-white text-[#1A284A] shadow-xs font-semibold"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Upload
            </button>
            <button
              type="button"
              onClick={() => setTab("url")}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md transition-colors cursor-pointer text-[11px] sm:text-xs ${
                tab === "url"
                  ? "bg-white text-[#1A284A] shadow-xs font-semibold"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              From Link/FB
            </button>
          </div>
        )}
      </div>

      {/* Upload/Import controls if below limit */}
      {canAddMore && (
        <>
          {tab === "file" ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-[#29479B] bg-blue-50/50"
                  : "border-gray-200 hover:border-gray-300 bg-gray-50/40"
              } ${isUploading ? "opacity-60 pointer-events-none" : ""}`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center gap-1.5">
                {isUploading ? (
                  <>
                    <Loader2 className="w-6 h-6 text-[#29479B] animate-spin" />
                    <p className="text-xs font-medium text-gray-600">
                      Uploading image(s)...
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#29479B] flex items-center justify-center shadow-xs">
                      <UploadCloud className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700">
                        Drop image here or click to browse (up to {maxImages - images.length} more)
                      </p>
                      <p className="text-[10px] text-gray-400">
                        PNG, JPG, WebP, GIF (Fast & Secure Storage)
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-gray-50/70 border border-gray-200 rounded-xl space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  <input
                    type="url"
                    placeholder="Paste Facebook or web image link..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleImportUrl();
                      }
                    }}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-lg border border-gray-200 focus:outline-hidden focus:border-[#29479B]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleImportUrl}
                  disabled={isImporting || !urlInput.trim()}
                  className="px-3 py-1.5 text-xs font-semibold bg-[#29479B] hover:bg-[#1A284A] text-white rounded-lg transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Hosting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      <span>Import</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Uploaded Images Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-1">
          {images.map((imgUrl, idx) => (
            <div
              key={idx}
              onClick={() => setPreviewModalUrl(imgUrl)}
              className="group relative rounded-xl border border-gray-200 overflow-hidden bg-gray-100 aspect-video sm:aspect-square flex items-center justify-center shadow-2xs cursor-pointer hover:border-purple-300 hover:shadow-md transition-all"
            >
              <img
                src={imgUrl}
                alt={`Uploaded image ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = "/fallback-image.png";
                }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewModalUrl(imgUrl);
                  }}
                  className="p-1.5 bg-white/90 hover:bg-white text-gray-800 rounded-lg shadow-sm transition-transform hover:scale-110 cursor-pointer"
                  title="View details"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(idx);
                  }}
                  className="p-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-lg shadow-sm transition-transform hover:scale-110 cursor-pointer"
                  title="Remove picture"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/60 text-white backdrop-blur-2xs">
                #{idx + 1}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-gray-400 text-xs py-1">
          <Images className="w-4 h-4" />
          <span>No pictures added yet (max {maxImages}).</span>
        </div>
      )}

      {/* Image Preview & Details Modal */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-gray-100 overflow-hidden my-6 max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-50 via-purple-50/40 to-slate-50 border-b border-gray-100 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#1A284A]">
                    ইমেজ প্রিভিউ ও বিবরণ (Image Preview)
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {previewModalUrl.includes("postimg")
                      ? "Hosted on Postimages"
                      : previewModalUrl.includes("ibb.co")
                      ? "Hosted on ImgBB"
                      : "Cloud Storage"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalUrl(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              <div className="rounded-2xl overflow-hidden bg-slate-100 border border-gray-200 flex items-center justify-center max-h-[60vh]">
                <img
                  src={previewModalUrl}
                  alt="Full preview"
                  className="max-h-[60vh] w-auto max-w-full object-contain mx-auto"
                />
              </div>

              {/* Direct Link & Copy */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 space-y-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  Direct Image URL
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={previewModalUrl}
                    className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-mono text-gray-700 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(previewModalUrl);
                      setCopied(true);
                      toast.success("Link copied to clipboard!");
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1A284A] hover:bg-[#29479B] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2 shrink-0">
              <a
                href={previewModalUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-gray-100 text-[#1A284A] border border-gray-200 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>নতুন ট্যাবে খুলুন</span>
              </a>
              <button
                type="button"
                onClick={() => setPreviewModalUrl(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#1A284A] hover:bg-[#29479B] text-white transition-colors cursor-pointer shadow-xs"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
      {!error && helpText && (
        <p className="text-[11px] text-gray-400">{helpText}</p>
      )}
    </div>
  );
}

export default MultiImageUpload;
