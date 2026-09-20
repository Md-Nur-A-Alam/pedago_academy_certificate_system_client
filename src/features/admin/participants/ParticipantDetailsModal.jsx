"use client";

import { useState } from "react";
import {
  ExternalLink,
  Copy,
  Check,
  User,
  Phone,
  Calendar,
  Award,
  Download,
  Share2,
  FileText,
  Video,
  Image as ImageIcon,
  Globe,
  Clock,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { toast } from "react-toastify";

function FacebookIcon({ className = "w-5 h-5 text-blue-600" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function YoutubeIcon({ className = "w-5 h-5 text-red-600" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function parseSourceUrl(url = "") {
  if (!url) return { type: "none" };

  // YouTube
  const ytMatch = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return {
      type: "youtube",
      id: ytMatch[1],
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`,
      url,
    };
  }

  // Direct video file
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) {
    return { type: "video", url };
  }

  // Direct audio file
  if (/\.(mp3|wav|m4a)(\?.*)?$/i.test(url)) {
    return { type: "audio", url };
  }

  // Facebook post / video / reel
  if (/facebook\.com|fb\.watch/i.test(url)) {
    const isVideo = /video|watch|reel/i.test(url);
    const fbPluginUrl = isVideo
      ? `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=500`
      : `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}&show_text=true&width=500`;
    return { type: "facebook", isVideo, embedUrl: fbPluginUrl, url };
  }

  return { type: "web", url };
}

function isImageUrl(url = "") {
  if (!url) return false;
  return (
    /\.(jpeg|jpg|gif|png|webp|svg|bmp)(\?.*)?$/i.test(url) ||
    url.includes("i.ibb.co") ||
    url.includes("imgur.com") ||
    url.includes("cloudinary.com") ||
    url.includes("/uploads/")
  );
}

export function ParticipantDetailsModal({ isOpen, onClose, participant }) {
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  if (!participant) return null;

  const handleCopyRef = () => {
    navigator.clipboard.writeText(participant.refNumber || "");
    setCopiedRef(true);
    toast.success("Reference number copied to clipboard");
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(participant.phone || "");
    setCopiedPhone(true);
    toast.success("Phone number copied to clipboard");
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const sourceParsed = parseSourceUrl(participant.sourceUrl);
  const mediaIsImage = isImageUrl(participant.mediaUrl);

  const formattedDate = participant.createdAt
    ? new Date(participant.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

  const lastDownloaded = participant.lastDownloadedAt
    ? new Date(participant.lastDownloadedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Never";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Participant Details & Submission Preview"
      className="max-w-4xl"
    >
      <div className="space-y-6 max-h-[82vh] overflow-y-auto pr-1">
        {/* Identity & Reference Header Card */}
        <div className="bg-gradient-to-r from-[#1A284A] to-[#29479B] text-white p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center shrink-0">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-extrabold">{participant.name}</h2>
                <Badge
                  variant={participant.achievementType === "winner" ? "warning" : "info"}
                  className="capitalize font-bold text-xs"
                >
                  <Award className="w-3.5 h-3.5 mr-1" />
                  {participant.achievementType}
                </Badge>
              </div>
              <p className="text-xs text-blue-200 mt-1">
                Competition:{" "}
                <strong className="text-white">
                  {participant.competitionId?.name || "Competition"}
                </strong>
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/15 flex items-center justify-between sm:justify-end gap-3 shrink-0">
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-200 block">
                Reference Code
              </span>
              <span className="font-mono text-base font-extrabold text-white tracking-wide">
                {participant.refNumber}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyRef}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Copy Reference Code"
            >
              {copiedRef ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 2-Column Specs: Personal Info + Download Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Personal Information */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Participant Information
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-xs text-gray-400 block">Phone Number</span>
                <div className="flex items-center gap-1.5 font-mono text-gray-800 font-semibold mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {participant.phone}
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="p-1 hover:text-[#29479B] transition-colors"
                    title="Copy phone"
                  >
                    {copiedPhone ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-xs text-gray-400 block">Age</span>
                <span className="font-semibold text-gray-800 mt-0.5 block">
                  {participant.age ? `${participant.age} years` : "Not provided"}
                </span>
              </div>

              <div>
                <span className="text-xs text-gray-400 block">Registered On</span>
                <span className="text-xs text-gray-700 font-medium mt-0.5 block flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  {formattedDate}
                </span>
              </div>

              <div>
                <span className="text-xs text-gray-400 block">Achievement Tier</span>
                <span className="text-xs capitalize font-bold text-gray-800 mt-0.5 block">
                  {participant.achievementType}
                </span>
              </div>
            </div>
          </div>

          {/* Activity & Download Stats */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Download & Verification Metrics
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-3 rounded-lg border border-gray-200/70">
                <span className="text-xl font-extrabold text-[#29479B] block">
                  {participant.downloadCount || 0}
                </span>
                <span className="text-[11px] text-gray-500 font-medium">📜 Certificates</span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-gray-200/70">
                <span className="text-xl font-extrabold text-purple-600 block">
                  {participant.posterDownloadCount || 0}
                </span>
                <span className="text-[11px] text-gray-500 font-medium">🎨 Posters</span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-gray-200/70">
                <span className="text-xl font-extrabold text-emerald-600 block">
                  {participant.validatedCount || 0}
                </span>
                <span className="text-[11px] text-gray-500 font-medium">🛡️ Validated</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 text-center mt-1">
              Last Downloaded: <strong className="text-gray-600">{lastDownloaded}</strong>
            </p>
          </div>
        </div>

        {/* SOURCE POST RICH PREVIEW */}
        <div className="border border-gray-200 rounded-2xl p-5 space-y-4 bg-white shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              {sourceParsed.type === "youtube" ? (
                <YoutubeIcon className="w-5 h-5 text-red-600" />
              ) : sourceParsed.type === "facebook" ? (
                <FacebookIcon className="w-5 h-5 text-blue-600" />
              ) : sourceParsed.type === "video" ? (
                <Video className="w-5 h-5 text-purple-600" />
              ) : (
                <Globe className="w-5 h-5 text-[#29479B]" />
              )}
              <div>
                <h4 className="font-bold text-sm text-[#1A284A]">
                  Source Submission Post / Link
                </h4>
                <p className="text-xs text-gray-500">
                  Original post provided during participant registration
                </p>
              </div>
            </div>

            {participant.sourceUrl && (
              <a
                href={participant.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors shrink-0"
              >
                <span>Open Source Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Embedded Player or Preview Based on Type */}
          {sourceParsed.type === "youtube" && (
            <div className="w-full aspect-video rounded-xl overflow-hidden border border-gray-200 shadow-inner bg-black">
              <iframe
                src={sourceParsed.embedUrl}
                title="YouTube Video Preview"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {sourceParsed.type === "facebook" && (
            <div className="space-y-2">
              <div className="w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex justify-center p-2 min-h-[380px]">
                <iframe
                  src={sourceParsed.embedUrl}
                  title="Facebook Post Preview"
                  className="w-full max-w-[500px] min-h-[420px] rounded-lg border-0"
                  scrolling="yes"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                />
              </div>
              <p className="text-[11px] text-gray-400 text-center">
                Note: If Facebook post preview does not render due to browser cookie restrictions, click "Open Source Link" above to view directly on Facebook.
              </p>
            </div>
          )}

          {sourceParsed.type === "video" && (
            <div className="w-full rounded-xl overflow-hidden border border-gray-200 bg-black">
              <video
                src={sourceParsed.url}
                controls
                className="w-full max-h-[380px] block"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {sourceParsed.type === "audio" && (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <audio src={sourceParsed.url} controls className="w-full" />
            </div>
          )}

          {sourceParsed.type === "web" && (
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-gray-800 truncate">
                    {participant.sourceUrl}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Click to inspect participant's web submission page
                  </p>
                </div>
              </div>

              <a
                href={participant.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 px-3 py-2 text-xs font-bold text-white bg-[#29479B] hover:bg-[#1A284A] rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>Visit URL</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* MEDIA PREVIEW IF ATTACHED */}
        {participant.mediaUrl ? (
          <div className="border border-gray-200 rounded-2xl p-5 space-y-4 bg-white shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-600" />
                <div>
                  <h4 className="font-bold text-sm text-[#1A284A]">
                    Attached Participant Media / Photo
                  </h4>
                  <p className="text-xs text-gray-500">
                    Image or media asset associated with this participant
                  </p>
                </div>
              </div>

              <a
                href={participant.mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <span>View Full Size</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {mediaIsImage ? (
              <div className="w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-900/5 flex items-center justify-center p-2 max-h-[400px]">
                <img
                  src={participant.mediaUrl}
                  alt={participant.name}
                  className="max-h-[380px] w-auto object-contain rounded-lg shadow-xs"
                  crossOrigin="anonymous"
                />
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-purple-600" />
                  <span className="text-xs font-mono text-gray-700 truncate max-w-md">
                    {participant.mediaUrl}
                  </span>
                </div>
                <a
                  href={participant.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg"
                >
                  Download File
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-400">
            No media attachment uploaded for this participant.
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex justify-end pt-3 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
