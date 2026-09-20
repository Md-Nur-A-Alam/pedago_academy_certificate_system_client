"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Download, ShieldCheck, Award, User, Sparkles, CheckCircle2, AlertCircle, FileText, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import apiClient from "@/lib/api-client";
import { toast } from "react-toastify";

export default function CertificatesPage() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [participantData, setParticipantData] = useState(null);
  const [certTemplate, setCertTemplate] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Responsive scaling container
  const [containerWidth, setContainerWidth] = useState(800);
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
  }, [participantData, certTemplate]);

  // Search by reference number or phone
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      toast.warning("Please enter your Reference Number or Phone");
      return;
    }

    setIsSearching(true);
    setParticipantData(null);
    setCertTemplate(null);

    try {
      const isPhoneSearch = /^(\+)?\d{6,15}$/.test(trimmed);
      const endpoint = isPhoneSearch
        ? `/api/participants/verify?phone=${encodeURIComponent(trimmed)}`
        : `/api/participants/verify?refNumber=${encodeURIComponent(trimmed)}`;

      const { data } = await apiClient.get(endpoint);
      if (data?.data) {
        const participant = data.data.participant;
        setParticipantData(participant);
        setCertTemplate(data.data.certificateTemplate);
        toast.success(`Verified record for ${participant.name}!`);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "No certificate record found. Please verify your reference number.";
      toast.error(msg);
    } finally {
      setIsSearching(false);
    }
  };

  const nameZone = certTemplate?.nameZone || {
    x: 50,
    y: 46,
    font: "Great Vibes",
    size: 44,
    color: "#1A284A",
    align: "center",
  };

  const refZone = certTemplate?.refZone || {
    x: 50,
    y: 78,
    font: "Montserrat",
    size: 16,
    color: "#29479B",
    align: "center",
  };

  const scaleFont = (sizePt) => {
    const base = Number(sizePt) || 24;
    const factor = containerWidth / 1000;
    return Math.max(10, Math.round(base * factor * 1.3));
  };

  const getTransform = (align = "center") => {
    if (align === "left") return "translate(0%, -50%)";
    if (align === "right") return "translate(-100%, -50%)";
    return "translate(-50%, -50%)";
  };

  // Download High-Resolution Certificate (.PNG)
  const handleDownloadCertificate = () => {
    if (!certTemplate?.backgroundImageUrl) {
      toast.error("Certificate template artwork unavailable");
      return;
    }

    setIsDownloading(true);
    const bgImg = new Image();
    bgImg.crossOrigin = "anonymous";
    bgImg.src = certTemplate.backgroundImageUrl;

    bgImg.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = bgImg.naturalWidth || 1920;
      canvas.height = bgImg.naturalHeight || 1080;

      // Draw background artwork
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      // Draw Recipient Name
      if (participantData?.name) {
        const nameSizePx = (nameZone.size || 44) * (canvas.width / 1000) * 1.3;
        ctx.font = `${nameSizePx}px "${nameZone.font || "Great Vibes"}", cursive, sans-serif`;
        ctx.fillStyle = nameZone.color || "#1A284A";
        ctx.textAlign = nameZone.align || "center";
        ctx.textBaseline = "middle";

        const nameX = (nameZone.x / 100) * canvas.width;
        const nameY = (nameZone.y / 100) * canvas.height;
        ctx.fillText(participantData.name, nameX, nameY);
      }

      // Draw Reference Code
      if (participantData?.refNumber) {
        const refSizePx = (refZone.size || 16) * (canvas.width / 1000) * 1.3;
        ctx.font = `bold ${refSizePx}px "${refZone.font || "Montserrat"}", sans-serif`;
        ctx.fillStyle = refZone.color || "#29479B";
        ctx.textAlign = refZone.align || "center";
        ctx.textBaseline = "middle";

        const refX = (refZone.x / 100) * canvas.width;
        const refY = (refZone.y / 100) * canvas.height;
        ctx.fillText(participantData.refNumber, refX, refY);
      }

      // Record download count on server
      apiClient
        .post("/api/participants/record-download", {
          refNumber: participantData.refNumber,
          type: "certificate",
        })
        .catch(() => {});

      // Save file to user
      const safeName = (participantData.name || "Participant").replace(/[^a-z0-9]/gi, "_");
      const link = document.createElement("a");
      link.download = `${safeName}_Official_Certificate.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setIsDownloading(false);
      toast.success("Certificate downloaded successfully!");
    };

    bgImg.onerror = () => {
      setIsDownloading(false);
      toast.error("Failed to load certificate background image");
    };
  };

  return (
    <div className="min-h-screen bg-[#F4F7FC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-[#29479B]/10 text-[#29479B] border border-[#29479B]/20 uppercase">
            Official Pedago Credentials
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A284A] tracking-tight">
            Certificate Search & Authenticity Validation
          </h1>
          <p className="text-gray-600 text-sm sm:text-base max-w-xl mx-auto">
            Validate credential authenticity and download your high-resolution competition certificate using your unique reference ID.
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
              <span>Verify & Search</span>
            </Button>
          </form>
        </div>

        {/* Result Area */}
        {participantData && (
          <div className="space-y-6">
            {/* Authenticity Verification Badge Card */}
            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-emerald-900 text-base flex items-center gap-1.5">
                    Authentic Pedago Credential Verified
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </h3>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Officially certified and recorded in Pedago Academy credentials database. Verified{" "}
                    <strong>{participantData.validatedCount || 1} times</strong>.
                  </p>
                </div>
              </div>

              <div className="bg-white/80 p-3 rounded-xl border border-emerald-200 text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">
                  Reference Code
                </span>
                <span className="font-mono text-base font-extrabold text-[#1A284A]">
                  {participantData.refNumber}
                </span>
              </div>
            </div>

            {/* Recipient Details Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-[#1A284A]">{participantData.name}</h2>
                  <Badge
                    variant={participantData.achievementType === "winner" ? "warning" : "info"}
                    className="capitalize font-bold text-xs"
                  >
                    <Award className="w-3.5 h-3.5 mr-1" />
                    {participantData.achievementType}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Competition:{" "}
                  <strong className="text-gray-800">
                    {participantData.competition?.name || "National Competition"}
                  </strong>
                </p>
              </div>

              <div className="text-xs text-gray-400 text-left sm:text-right">
                <span>Downloaded: </span>
                <strong className="text-gray-700 font-semibold">
                  {participantData.downloadCount || 0} times
                </strong>
              </div>
            </div>

            {/* Certificate Template Preview */}
            {certTemplate ? (
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200/80 space-y-6">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="font-bold text-gray-700 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Live Certificate Preview
                  </span>
                  <span>Format: Landscape Official Credential</span>
                </div>

                <div
                  ref={containerRef}
                  className="relative w-full rounded-xl overflow-hidden border-2 border-gray-200 shadow-md bg-white select-none max-w-2xl mx-auto"
                  style={{ aspectRatio: "16 / 9" }}
                >
                  {/* Background Certificate Artwork */}
                  {certTemplate.backgroundImageUrl && (
                    <img
                      src={certTemplate.backgroundImageUrl}
                      alt="Certificate Background"
                      className="w-full h-full object-cover pointer-events-none"
                      crossOrigin="anonymous"
                    />
                  )}

                  {/* Rendered Name */}
                  <div
                    className="absolute select-none pointer-events-none"
                    style={{
                      left: `${nameZone.x}%`,
                      top: `${nameZone.y}%`,
                      transform: getTransform(nameZone.align),
                      fontFamily: nameZone.font || "Great Vibes",
                      fontSize: `${scaleFont(nameZone.size)}px`,
                      color: nameZone.color || "#1A284A",
                      textAlign: nameZone.align || "center",
                      whiteSpace: "nowrap",
                      lineHeight: 1.2,
                      zIndex: 25,
                    }}
                  >
                    {participantData.name}
                  </div>

                  {/* Rendered Reference Code */}
                  <div
                    className="absolute select-none pointer-events-none"
                    style={{
                      left: `${refZone.x}%`,
                      top: `${refZone.y}%`,
                      transform: getTransform(refZone.align),
                      fontFamily: refZone.font || "Montserrat",
                      fontSize: `${scaleFont(refZone.size)}px`,
                      color: refZone.color || "#29479B",
                      textAlign: refZone.align || "center",
                      whiteSpace: "nowrap",
                      lineHeight: 1.2,
                      zIndex: 25,
                    }}
                  >
                    {participantData.refNumber}
                  </div>
                </div>

                {/* Download Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    High-resolution ready for printing or portfolio sharing.
                  </span>

                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={handleDownloadCertificate}
                    disabled={isDownloading}
                    className="w-full sm:w-auto gap-2 bg-[#29479B] hover:bg-[#1A284A] text-white shadow-md hover:shadow-lg transition-all"
                  >
                    {isDownloading ? (
                      <>
                        <Spinner size="sm" /> Generating File...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" /> Download Certificate (.PNG)
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                <h3 className="font-bold text-gray-800">Certificate Design in Preparation</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  The official certificate template for <strong>{participantData.competition?.name}</strong> is currently being prepared. Please check back shortly!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

