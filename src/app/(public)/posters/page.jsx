"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Download, Sparkles, Award, User, RefreshCw, UploadCloud, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { ImageUpload } from "@/components/ui/ImageUpload";
import apiClient from "@/lib/api-client";
import { toast } from "react-toastify";

const DEFAULT_FALLBACK_PHOTO =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80";

export default function PostersPage() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [participantData, setParticipantData] = useState(null);
  const [posterTemplate, setPosterTemplate] = useState(null);
  const [userPhoto, setUserPhoto] = useState("");
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Responsive Canvas container scaling
  const [containerWidth, setContainerWidth] = useState(600);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [participantData, posterTemplate]);

  // Search by reference code or phone
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      toast.warning("Please enter your Reference Number or Phone");
      return;
    }

    setIsSearching(true);
    setParticipantData(null);
    setPosterTemplate(null);

    try {
      const isPhoneSearch = /^(\+)?\d{6,15}$/.test(trimmed);
      const endpoint = isPhoneSearch
        ? `/api/participants/verify?phone=${encodeURIComponent(trimmed)}`
        : `/api/participants/verify?refNumber=${encodeURIComponent(trimmed)}`;

      const { data } = await apiClient.get(endpoint);
      if (data?.data) {
        const participant = data.data.participant;
        setParticipantData(participant);
        setPosterTemplate(data.data.posterTemplate);
        setUserPhoto(participant.mediaUrl || DEFAULT_FALLBACK_PHOTO);
        toast.success(`Found record for ${participant.name}!`);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "No participant record found. Please verify your reference number.";
      toast.error(msg);
    } finally {
      setIsSearching(false);
    }
  };

  // Save new photo uploaded by user
  const handlePhotoChange = async (newUrl) => {
    if (!newUrl || !participantData?.refNumber) return;
    setUserPhoto(newUrl);
    setIsUpdatingPhoto(true);

    try {
      await apiClient.post("/api/participants/update-photo", {
        refNumber: participantData.refNumber,
        mediaUrl: newUrl,
      });
      setParticipantData((prev) => ({ ...prev, mediaUrl: newUrl }));
      toast.success("Your poster photo has been updated!");
    } catch (err) {
      toast.error("Failed to save updated photo to your record");
    } finally {
      setIsUpdatingPhoto(false);
    }
  };

  // Scaling helpers for responsive preview
  const photoZone = posterTemplate?.photoZone || { x: 50, y: 35, w: 32, shape: "circle" };
  const textZones = posterTemplate?.textZones || [];
  const nameZone = textZones.find((z) => z.key === "name") || {
    x: 50,
    y: 82,
    font: "Montserrat",
    size: 26,
    color: "#FFFFFF",
    align: "center",
  };
  const refZone = textZones.find((z) => z.key === "ref") || {
    x: 50,
    y: 88,
    font: "Montserrat",
    size: 16,
    color: "#F59E0B",
    align: "center",
  };

  const scaleFont = (sizePt) => {
    const base = Number(sizePt) || 20;
    const factor = containerWidth / 1000;
    return Math.max(10, Math.round(base * factor * 1.3));
  };

  const getTransform = (align = "center") => {
    if (align === "left") return "translate(0%, -50%)";
    if (align === "right") return "translate(-100%, -50%)";
    return "translate(-50%, -50%)";
  };

  const photoWidthPercent = photoZone.w || 30;
  const photoShapeClass =
    photoZone.shape === "circle"
      ? "rounded-full"
      : photoZone.shape === "rounded"
      ? "rounded-2xl"
      : "rounded-none";

  // Download High-Resolution Composite Poster (.PNG)
  const handleDownloadPoster = () => {
    if (!posterTemplate?.backgroundImageUrl) {
      toast.error("Poster background image unavailable");
      return;
    }

    setIsDownloading(true);
    const bgImg = new Image();
    bgImg.crossOrigin = "anonymous";
    bgImg.src = posterTemplate.backgroundImageUrl;

    bgImg.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = bgImg.naturalWidth || 1200;
      canvas.height = bgImg.naturalHeight || 1600;

      // Draw background poster artwork
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      const finishAndSave = () => {
        // Draw Name text
        if (participantData?.name) {
          const nameSizePx = (nameZone.size || 26) * (canvas.width / 1000) * 1.3;
          ctx.font = `bold ${nameSizePx}px "${nameZone.font || "Montserrat"}", sans-serif`;
          ctx.fillStyle = nameZone.color || "#FFFFFF";
          ctx.textAlign = nameZone.align || "center";
          ctx.textBaseline = "middle";
          ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
          ctx.shadowBlur = 10;

          const nameX = (nameZone.x / 100) * canvas.width;
          const nameY = (nameZone.y / 100) * canvas.height;
          ctx.fillText(participantData.name, nameX, nameY);
        }

        // Draw Reference Code text
        if (participantData?.refNumber) {
          const refSizePx = (refZone.size || 16) * (canvas.width / 1000) * 1.3;
          ctx.font = `bold ${refSizePx}px "${refZone.font || "Montserrat"}", sans-serif`;
          ctx.fillStyle = refZone.color || "#F59E0B";
          ctx.textAlign = refZone.align || "center";
          ctx.textBaseline = "middle";
          ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
          ctx.shadowBlur = 6;

          const refX = (refZone.x / 100) * canvas.width;
          const refY = (refZone.y / 100) * canvas.height;
          ctx.fillText(participantData.refNumber, refX, refY);
        }

        // Record download count
        apiClient
          .post("/api/participants/record-download", {
            refNumber: participantData.refNumber,
            type: "poster",
          })
          .catch(() => {});

        // Save file to user
        const safeName = (participantData.name || "Participant").replace(/[^a-z0-9]/gi, "_");
        const link = document.createElement("a");
        link.download = `${safeName}_Pedago_Poster.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        setIsDownloading(false);
        toast.success("Poster generated and downloaded successfully!");
      };

      // Load & Clip user photo onto canvas
      if (userPhoto) {
        const userImg = new Image();
        userImg.crossOrigin = "anonymous";
        userImg.src = userPhoto;

        userImg.onload = () => {
          ctx.save();
          const pW = ((photoZone.w || 30) / 100) * canvas.width;
          const pH = pW; // 1:1 aspect ratio cutout
          const pX = (photoZone.x / 100) * canvas.width - pW / 2;
          const pY = (photoZone.y / 100) * canvas.height - pH / 2;

          ctx.beginPath();
          if (photoZone.shape === "circle") {
            ctx.arc(pX + pW / 2, pY + pH / 2, pW / 2, 0, Math.PI * 2);
          } else if (photoZone.shape === "rounded") {
            const r = pW * 0.12;
            ctx.roundRect(pX, pY, pW, pH, r);
          } else {
            ctx.rect(pX, pY, pW, pH);
          }
          ctx.closePath();
          ctx.clip();

          // Cover-fit user photo inside cutout
          const imgRatio = userImg.naturalWidth / userImg.naturalHeight;
          let drawW = pW;
          let drawH = pH;
          let dx = pX;
          let dy = pY;

          if (imgRatio > 1) {
            drawW = pH * imgRatio;
            dx = pX - (drawW - pW) / 2;
          } else {
            drawH = pW / imgRatio;
            dy = pY - (drawH - pH) / 2;
          }

          ctx.drawImage(userImg, dx, dy, drawW, drawH);
          ctx.restore();
          finishAndSave();
        };

        userImg.onerror = () => {
          finishAndSave();
        };
      } else {
        finishAndSave();
      }
    };

    bgImg.onerror = () => {
      setIsDownloading(false);
      toast.error("Failed to load poster background image");
    };
  };

  return (
    <div className="min-h-screen bg-[#F4F7FC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Title */}
        <div className="text-center space-y-3">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-[#F59E0B]/20 text-[#1A284A] border border-[#F59E0B]/30 uppercase">
            Pedago Milestone Posters
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A284A] tracking-tight">
            Create Your Personalized Achievement Poster
          </h1>
          <p className="text-gray-600 text-sm sm:text-base max-w-xl mx-auto">
            Search by your reference ID, upload your favorite picture, and download your personalized high-resolution social media poster.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Enter Reference Number (e.g. COMP-001) or Phone..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#29479B] focus:border-transparent text-sm"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              disabled={isSearching}
              className="gap-2 px-6 py-3 shrink-0"
            >
              {isSearching ? <Spinner size="sm" /> : <Search className="w-4 h-4" />}
              <span>Find My Poster</span>
            </Button>
          </form>
        </div>

        {/* Participant & Poster Result */}
        {participantData && (
          <div className="space-y-6">
            {/* Participant Banner Card */}
            <div className="bg-gradient-to-r from-[#1A284A] to-[#29479B] text-white p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center shrink-0">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-black">{participantData.name}</h2>
                    <Badge
                      variant={participantData.achievementType === "winner" ? "warning" : "info"}
                      className="capitalize font-bold text-xs"
                    >
                      <Award className="w-3.5 h-3.5 mr-1" />
                      {participantData.achievementType}
                    </Badge>
                  </div>
                  <p className="text-xs text-blue-200 mt-1">
                    Competition:{" "}
                    <strong className="text-white">
                      {participantData.competition?.name || "National Competition"}
                    </strong>
                  </p>
                </div>
              </div>

              <div className="bg-white/10 p-3 rounded-xl border border-white/15 text-right sm:text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-blue-200 block">
                  Reference Code
                </span>
                <span className="font-mono text-base font-extrabold text-white">
                  {participantData.refNumber}
                </span>
              </div>
            </div>

            {/* Poster Template Section */}
            {posterTemplate ? (
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200/80 space-y-6">
                {/* PHOTO UPLOAD CUSTOMIZATION SECTION */}
                <div className="bg-amber-50/50 p-5 rounded-xl border border-amber-200/70 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-[#1A284A] flex items-center gap-2">
                        <UploadCloud className="w-4 h-4 text-[#F59E0B]" />
                        Upload Your Photo for the Poster
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Upload your clear portrait photo to fit into the poster's cutout shape ({photoZone.shape || "circle"}).
                      </p>
                    </div>
                    {isUpdatingPhoto && (
                      <span className="text-xs text-amber-700 font-semibold flex items-center gap-1">
                        <Spinner size="xs" /> Updating record...
                      </span>
                    )}
                  </div>

                  <ImageUpload
                    value={userPhoto}
                    onChange={handlePhotoChange}
                    placeholder="Upload portrait photo (.png, .jpg) or paste image URL"
                    helpText="Auto-hosted permanently on ImgBB. Your photo will render directly in the preview below."
                  />
                </div>

                {/* Live Render Canvas */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-bold text-gray-700 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Live Poster Preview
                    </span>
                    <span>Format: Portrait Social Media</span>
                  </div>

                  <div
                    ref={containerRef}
                    className="relative w-full rounded-xl overflow-hidden border-2 border-gray-200 shadow-md bg-white select-none max-w-md mx-auto"
                    style={{ aspectRatio: "3 / 4" }}
                  >
                    {/* Background Poster Artwork */}
                    {posterTemplate.backgroundImageUrl && (
                      <img
                        src={posterTemplate.backgroundImageUrl}
                        alt="Poster Background"
                        className="w-full h-full object-cover pointer-events-none"
                        crossOrigin="anonymous"
                      />
                    )}

                    {/* Rendered User Photo Cutout */}
                    <div
                      className={`absolute overflow-hidden border-2 border-white/80 shadow-md ${photoShapeClass}`}
                      style={{
                        left: `${photoZone.x}%`,
                        top: `${photoZone.y}%`,
                        width: `${photoWidthPercent}%`,
                        aspectRatio: "1 / 1",
                        transform: "translate(-50%, -50%)",
                        zIndex: 20,
                        backgroundColor: "#E2E8F0",
                      }}
                    >
                      {userPhoto ? (
                        <img
                          src={userPhoto}
                          alt={participantData.name}
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <User className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    {/* Rendered Name */}
                    <div
                      className="absolute select-none pointer-events-none"
                      style={{
                        left: `${nameZone.x}%`,
                        top: `${nameZone.y}%`,
                        transform: getTransform(nameZone.align),
                        fontFamily: nameZone.font || "Montserrat",
                        fontSize: `${scaleFont(nameZone.size)}px`,
                        color: nameZone.color || "#FFFFFF",
                        textAlign: nameZone.align || "center",
                        whiteSpace: "nowrap",
                        lineHeight: 1.2,
                        textShadow: "0 2px 4px rgba(0,0,0,0.6)",
                        zIndex: 25,
                      }}
                    >
                      {participantData.name}
                    </div>

                    {/* Rendered Ref Number */}
                    <div
                      className="absolute select-none pointer-events-none"
                      style={{
                        left: `${refZone.x}%`,
                        top: `${refZone.y}%`,
                        transform: getTransform(refZone.align),
                        fontFamily: refZone.font || "Montserrat",
                        fontSize: `${scaleFont(refZone.size)}px`,
                        color: refZone.color || "#F59E0B",
                        textAlign: refZone.align || "center",
                        whiteSpace: "nowrap",
                        lineHeight: 1.2,
                        textShadow: "0 2px 4px rgba(0,0,0,0.6)",
                        zIndex: 25,
                      }}
                    >
                      {participantData.refNumber}
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    Downloaded <strong>{participantData.posterDownloadCount || 0} times</strong> previously.
                  </div>

                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={handleDownloadPoster}
                    disabled={isDownloading}
                    className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all"
                  >
                    {isDownloading ? (
                      <>
                        <Spinner size="sm" /> Generating Poster...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" /> Download High-Res Poster (.PNG)
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                <h3 className="font-bold text-gray-800">Poster Template in Preparation</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  The official poster artwork for <strong>{participantData.competition?.name}</strong> is currently being uploaded by the administration. Please check back shortly!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
