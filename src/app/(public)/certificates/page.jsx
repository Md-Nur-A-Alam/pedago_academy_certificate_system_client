"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  Download,
  ShieldCheck,
  Award,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Check,
  Layers,
  Tag,
  Calendar,
  ExternalLink,
  Lock,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import apiClient from "@/lib/api-client";
import { toast } from "react-toastify";
import { buildCanvasFont, parseStyleBooleans } from "@/lib/fontConstants";
import { parseLocalDate } from "@/lib/dateUtils";

export default function CertificatesPage() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [resultsList, setResultsList] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  // Responsive scaling container
  const [containerWidth, setContainerWidth] = useState(800);
  const containerRef = useRef(null);

  const activeResult = resultsList[selectedIndex] || null;
  const participantData = activeResult?.participant || null;
  const certTemplate = activeResult?.certificateTemplate || null;

  const resultPublishDate =
    participantData?.resultPublishDate ||
    participantData?.competition?.resultPublishDate ||
    activeResult?.resultPublishDate ||
    "";

  const isResultPublished = (() => {
    if (!resultPublishDate) return true;
    if (activeResult?.isResultPublished === false) return false;
    const resDate = parseLocalDate(resultPublishDate, false);
    if (!resDate) return true;
    return new Date() >= resDate;
  })();

  const canDownloadActiveCertificate = Boolean(
    isResultPublished &&
      activeResult?.canDownloadCertificate !== false &&
      participantData?.competition?.providesCertificate !== false
  );

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

  // Search by reference number or phone (matching last 6 digits)
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      toast.warning("Please enter your Reference Number or Phone Number");
      return;
    }

    setIsSearching(true);
    setResultsList([]);
    setSelectedIndex(0);

    try {
      const endpoint = `/api/participants/verify?query=${encodeURIComponent(trimmed)}`;
      const { data } = await apiClient.get(endpoint);

      if (data?.data) {
        const list =
          data.data.results && data.data.results.length > 0
            ? data.data.results
            : [
                {
                  participant: data.data.participant,
                  certificateTemplate: data.data.certificateTemplate,
                  posterTemplate: data.data.posterTemplate,
                },
              ];

        setResultsList(list);
        setSelectedIndex(0);

        if (list.length > 1) {
          toast.success(
            `Found ${list.length} certificates registered for this query!`
          );
        } else {
          toast.success(`Verified record for ${list[0].participant.name}!`);
        }
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "No certificate record found. Please verify your reference or phone number.";
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
    rotation: 0,
    enabled: true,
  };

  const refZone = certTemplate?.refZone || {
    x: 50,
    y: 78,
    font: "Montserrat",
    size: 16,
    color: "#29479B",
    align: "center",
    rotation: 0,
    enabled: true,
  };

  const dateZone = certTemplate?.dateZone || {
    x: 25,
    y: 85,
    font: "Montserrat",
    size: 16,
    color: "#1A284A",
    align: "center",
    rotation: 0,
    format: "20 September 2026",
    enabled: false,
  };

  const signatureZone = certTemplate?.signatureZone || {
    imageUrl: "",
    x: 75,
    y: 85,
    width: 16,
    rotation: 0,
    enabled: false,
  };

  const scaleFont = (sizePt) => {
    const base = Number(sizePt) || 24;
    const factor = containerWidth / 1000;
    return Math.max(10, Math.round(base * factor * 1.3));
  };

  const getTransform = (align = "center", rotation = 0) => {
    let translate = "translate(-50%, -50%)";
    if (align === "left") translate = "translate(0%, -50%)";
    if (align === "right") translate = "translate(-100%, -50%)";
    return `${translate} rotate(${rotation || 0}deg)`;
  };

  // Helper to generate & download a certificate given participant and template
  const generateAndDownloadCertificate = (participant, template) => {
    return new Promise((resolve, reject) => {
      const pubDate =
        participant?.resultPublishDate ||
        participant?.competition?.resultPublishDate ||
        "";
      if (pubDate) {
        const parsed = parseLocalDate(pubDate, false);
        if (parsed && new Date() < parsed) {
          toast.warning(
            `ফলাফল প্রকাশের তারিখের পূর্বে সার্টিফিকেট ডাউনলোড করা যাবে না। নির্ধারিত তারিখ: ${pubDate}`
          );
          return reject(new Error("Result not published yet"));
        }
      }

      if (!template?.backgroundImageUrl) {
        toast.error("Certificate template artwork unavailable");
        return reject(new Error("No artwork"));
      }

      const bgImg = new Image();
      bgImg.crossOrigin = "anonymous";
      bgImg.src = template.backgroundImageUrl;

      const nZ = template.nameZone || nameZone;
      const rZ = template.refZone || refZone;
      const dZ = template.dateZone || dateZone;
      const sZ = template.signatureZone || signatureZone;

      const isNameEnabled = nZ.enabled !== false;
      const isRefEnabled = rZ.enabled !== false;
      const isDateEnabled = Boolean(dZ.enabled);
      const isSigEnabled = Boolean(sZ.enabled && sZ.imageUrl);

      const loadPromises = [
        new Promise((res, rej) => {
          bgImg.onload = () => res(bgImg);
          bgImg.onerror = rej;
        }),
      ];

      let sigImg = null;
      if (isSigEnabled) {
        sigImg = new Image();
        sigImg.crossOrigin = "anonymous";
        sigImg.src = sZ.imageUrl;
        loadPromises.push(
          new Promise((res) => {
            sigImg.onload = () => res(sigImg);
            sigImg.onerror = () => res(null);
          })
        );
      }

      Promise.all(loadPromises)
        .then(() => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = bgImg.naturalWidth || 1920;
          canvas.height = bgImg.naturalHeight || 1080;

          // Draw background artwork
          ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

          // Draw Recipient Name (if enabled)
          if (isNameEnabled && participant?.name) {
            const nameSizePx = (nZ.size || 44) * (canvas.width / 1000) * 1.3;
            const fontStr = buildCanvasFont({
              font: nZ.font || "Great Vibes",
              size: nameSizePx,
              style: nZ.style || "normal",
            });
            const nameX = (nZ.x / 100) * canvas.width;
            const nameY = (nZ.y / 100) * canvas.height;

            ctx.save();
            ctx.translate(nameX, nameY);
            if (nZ.rotation) {
              ctx.rotate((nZ.rotation * Math.PI) / 180);
            }
            ctx.font = fontStr;
            ctx.fillStyle = nZ.color || "#1A284A";
            ctx.textAlign = nZ.align || "center";
            ctx.textBaseline = "middle";
            ctx.fillText(participant.name, 0, 0);
            ctx.restore();
          }

          // Draw Reference Code (if enabled)
          if (isRefEnabled && participant?.refNumber) {
            const refSizePx = (rZ.size || 16) * (canvas.width / 1000) * 1.3;
            const fontStr = buildCanvasFont({
              font: rZ.font || "Montserrat",
              size: refSizePx,
              style: rZ.style || "bold",
            });
            const refX = (rZ.x / 100) * canvas.width;
            const refY = (rZ.y / 100) * canvas.height;

            ctx.save();
            ctx.translate(refX, refY);
            if (rZ.rotation) {
              ctx.rotate((rZ.rotation * Math.PI) / 180);
            }
            ctx.font = fontStr;
            ctx.fillStyle = rZ.color || "#29479B";
            ctx.textAlign = rZ.align || "center";
            ctx.textBaseline = "middle";
            ctx.fillText(participant.refNumber, 0, 0);
            ctx.restore();
          }

          // Draw Date Field (if enabled)
          if (isDateEnabled) {
            const dateText = dZ.format || "20 September 2026";
            const dateSizePx = (dZ.size || 16) * (canvas.width / 1000) * 1.3;
            const fontStr = buildCanvasFont({
              font: dZ.font || "Montserrat",
              size: dateSizePx,
              style: dZ.style || "normal",
            });
            const dateX = (dZ.x / 100) * canvas.width;
            const dateY = (dZ.y / 100) * canvas.height;

            ctx.save();
            ctx.translate(dateX, dateY);
            if (dZ.rotation) {
              ctx.rotate((dZ.rotation * Math.PI) / 180);
            }
            ctx.font = fontStr;
            ctx.fillStyle = dZ.color || "#1A284A";
            ctx.textAlign = dZ.align || "center";
            ctx.textBaseline = "middle";
            ctx.fillText(dateText, 0, 0);
            ctx.restore();
          }

          // Draw Signature PNG (if enabled)
          if (isSigEnabled && sigImg && sigImg.complete && sigImg.naturalWidth) {
            const sigWidth = ((sZ.width || 16) / 100) * canvas.width;
            const aspect = sigImg.naturalHeight / sigImg.naturalWidth;
            const sigHeight = sigWidth * aspect;
            const sigX = (sZ.x / 100) * canvas.width;
            const sigY = (sZ.y / 100) * canvas.height;

            ctx.save();
            ctx.translate(sigX, sigY);
            if (sZ.rotation) {
              ctx.rotate((sZ.rotation * Math.PI) / 180);
            }
            ctx.drawImage(sigImg, -sigWidth / 2, -sigHeight / 2, sigWidth, sigHeight);
            ctx.restore();
          }

          // Record download count on server
          apiClient
            .post("/api/participants/record-download", {
              refNumber: participant.refNumber,
              type: "certificate",
            })
            .catch(() => {});

          // Save file to user
          const safeName = (participant.name || "Participant").replace(/[^a-z0-9]/gi, "_");
          const safeCat = (participant.category || "General").replace(/[^a-z0-9]/gi, "_");
          const link = document.createElement("a");
          link.download = `${safeName}_${safeCat}_Official_Certificate.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
          resolve(true);
        })
        .catch((err) => {
          toast.error("Failed to load certificate background image");
          reject(err);
        });
    });
  };

  // Download High-Resolution Certificate for currently selected item
  const handleDownloadActiveCertificate = async () => {
    if (!isResultPublished) {
      toast.warning(
        `ফলাফল প্রকাশের তারিখের পূর্বে সার্টিফিকেট ডাউনলোড করা যাবে না। ফলাফল প্রকাশের নির্ধারিত তারিখ: ${resultPublishDate}`
      );
      return;
    }

    if (!participantData || !certTemplate) {
      toast.error("Certificate template artwork unavailable");
      return;
    }
    setIsDownloading(true);
    try {
      await generateAndDownloadCertificate(participantData, certTemplate);
      toast.success("Certificate downloaded successfully!");
    } catch {
      // Toast already handled
    } finally {
      setIsDownloading(false);
    }
  };

  // Download All Matching Certificates Sequentially
  const handleDownloadAllCertificates = async () => {
    if (resultsList.length === 0) return;

    // Filter only eligible items whose results are published
    const eligibleItems = resultsList.filter((item) => {
      if (!item.certificateTemplate) return false;
      const pubDate =
        item.participant?.resultPublishDate ||
        item.participant?.competition?.resultPublishDate ||
        item.resultPublishDate ||
        "";
      if (!pubDate) return true;
      if (item.isResultPublished === false) return false;
      const parsed = parseLocalDate(pubDate, false);
      return parsed ? new Date() >= parsed : true;
    });

    if (eligibleItems.length === 0) {
      toast.warning(
        "ফলাফল প্রকাশের তারিখের পূর্বে কোনো সার্টিফিকেট ডাউনলোড করা সম্ভব নয়।"
      );
      return;
    }

    setIsDownloadingAll(true);
    let successCount = 0;

    for (let i = 0; i < eligibleItems.length; i++) {
      const item = eligibleItems[i];
      try {
        await generateAndDownloadCertificate(item.participant, item.certificateTemplate);
        successCount++;
        // Delay to prevent browser throttling downloads
        await new Promise((r) => setTimeout(r, 600));
      } catch {
        // Continue with remaining
      }
    }

    setIsDownloadingAll(false);
    if (successCount > 0) {
      toast.success(`Downloaded ${successCount} certificates!`);
    } else {
      toast.error("No certificate templates available for batch download");
    }
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
            Search by your Reference ID or Phone Number (matches last 6 digits) to validate credential authenticity and download your high-resolution competition certificates.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Enter Reference Code (e.g. COMP-001) or Phone Number (e.g. 01712345678 or last 6 digits)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#29479B] focus:border-transparent text-sm"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              disabled={isSearching}
              className="gap-2 px-6 py-3 shrink-0 bg-[#29479B] hover:bg-[#1A284A] text-white"
            >
              {isSearching ? <Spinner size="sm" /> : <Search className="w-4 h-4" />}
              <span>Verify & Search</span>
            </Button>
          </form>
          <div className="flex items-center gap-2 mt-2.5 text-xs text-gray-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              Tip: You can search using your phone number; matching occurs on the last 6 digits. If you registered in multiple categories or competitions, all certificates will be presented.
            </span>
          </div>
        </div>

        {/* Multi-Result Certificate Selector (When multiple certificates found) */}
        {resultsList.length > 1 && (
          <div className="bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/50 p-6 rounded-2xl border border-blue-200/70 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#29479B] text-white flex items-center justify-center shadow-xs">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#1A284A] flex items-center gap-2">
                    Found {resultsList.length} Certificates
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                      Multi-Category / Multi-Competition
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Select a certificate card below to view preview and download:
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadAllCertificates}
                disabled={isDownloadingAll}
                className="gap-1.5 text-xs font-bold text-[#29479B] border-blue-300 hover:bg-blue-50 shrink-0"
              >
                {isDownloadingAll ? (
                  <>
                    <Spinner size="xs" /> Downloading All...
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" /> Download All ({resultsList.length})
                  </>
                )}
              </Button>
            </div>

            {/* Grid of Certificate Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {resultsList.map((resItem, idx) => {
                const isSelected = idx === selectedIndex;
                const p = resItem.participant;
                const hasTemplate = !!resItem.certificateTemplate;

                return (
                  <div
                    key={p._id || idx}
                    onClick={() => setSelectedIndex(idx)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between text-left ${
                      isSelected
                        ? "bg-white border-[#29479B] ring-2 ring-[#29479B]/20 shadow-md scale-[1.01]"
                        : "bg-white/70 hover:bg-white border-gray-200 hover:border-blue-300 hover:shadow-xs"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#29479B]/10 text-[#29479B] border border-[#29479B]/20">
                          <Tag className="w-3 h-3 mr-1" />
                          {p.category || "General"}
                        </span>
                        <Badge
                          variant={p.achievementType === "winner" ? "warning" : "info"}
                          className="text-[10px] capitalize font-bold"
                        >
                          {p.achievementType}
                        </Badge>
                      </div>

                      <h4 className="font-bold text-sm text-[#1A284A] line-clamp-1">
                        {p.competition?.name || "Competition"}
                      </h4>

                      <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
                        <span className="font-mono font-bold text-gray-700">
                          {p.refNumber}
                        </span>
                        {(() => {
                          const itemPubDate =
                            p.resultPublishDate ||
                            p.competition?.resultPublishDate ||
                            resItem.resultPublishDate ||
                            "";
                          const itemPublished = (() => {
                            if (!itemPubDate) return true;
                            if (resItem.isResultPublished === false) return false;
                            const d = parseLocalDate(itemPubDate, false);
                            return d ? new Date() >= d : true;
                          })();

                          if (!itemPublished) {
                            return (
                              <span className="text-amber-700 bg-amber-50 border border-amber-200 font-semibold text-[11px] px-2 py-0.5 rounded flex items-center gap-1">
                                <Lock className="w-3 h-3 text-amber-600" /> প্রকাশের অপেক্ষায়
                              </span>
                            );
                          }

                          return hasTemplate ? (
                            <span className="text-emerald-600 font-semibold text-[11px] flex items-center gap-1">
                              <Check className="w-3 h-3" /> Ready
                            </span>
                          ) : (
                            <span className="text-amber-600 font-semibold text-[11px]">
                              In Prep
                            </span>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 flex items-center justify-between">
                      <span
                        className={`text-xs font-bold ${
                          isSelected ? "text-[#29479B]" : "text-gray-400"
                        }`}
                      >
                        {isSelected ? "● Currently Viewing" : "Click to view"}
                      </span>

                      {hasTemplate && (() => {
                        const itemPubDate =
                          p.resultPublishDate ||
                          p.competition?.resultPublishDate ||
                          resItem.resultPublishDate ||
                          "";
                        const itemPublished = (() => {
                          if (!itemPubDate) return true;
                          if (resItem.isResultPublished === false) return false;
                          const d = parseLocalDate(itemPubDate, false);
                          return d ? new Date() >= d : true;
                        })();

                        if (!itemPublished) {
                          return (
                            <span
                              className="p-1.5 rounded-lg bg-amber-50 text-amber-600 cursor-not-allowed"
                              title={`Locked until ${itemPubDate}`}
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </span>
                          );
                        }

                        return (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              generateAndDownloadCertificate(p, resItem.certificateTemplate);
                            }}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#29479B] text-gray-600 hover:text-white transition-colors"
                            title="Quick Download this Certificate"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Certificate Verification & Canvas Preview */}
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
                    Officially certified in Pedago Academy credentials database. Verified{" "}
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
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-black text-[#1A284A]">{participantData.name}</h2>
                  <Badge
                    variant={participantData.achievementType === "winner" ? "warning" : "info"}
                    className="capitalize font-bold text-xs"
                  >
                    <Award className="w-3.5 h-3.5 mr-1" />
                    {participantData.achievementType}
                  </Badge>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#29479B]/10 text-[#29479B] border border-[#29479B]/20">
                    Category: {participantData.category || "General"}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Competition:{" "}
                  <strong className="text-gray-800">
                    {participantData.competition?.name || "National Competition"}
                  </strong>
                </p>
              </div>

              <div className="text-xs text-gray-400 text-left sm:text-right space-y-0.5">
                <div>
                  Downloaded:{" "}
                  <strong className="text-gray-700 font-semibold">
                    {participantData.downloadCount || 0} times
                  </strong>
                </div>
                {resultsList.length > 1 && (
                  <div className="text-blue-600 font-medium">
                    Showing certificate {selectedIndex + 1} of {resultsList.length}
                  </div>
                )}
              </div>
            </div>

            {/* Pending Result Notification Banner */}
            {!isResultPublished && (
              <div className="bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-amber-50/90 border-2 border-amber-200/90 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 shadow-2xs">
                    <Clock className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-amber-950 text-base flex items-center gap-2 flex-wrap">
                      ফলাফল প্রকাশের অপেক্ষায় (Result Not Published Yet)
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-bold border border-amber-300">
                        সার্টিফিকেট লক করা আছে
                      </span>
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                      ফলাফল প্রকাশের নির্ধারিত তারিখের পূর্বে সার্টিফিকেট স্পষ্ট দেখা বা ডাউনলোড করা যাবে না। আপনার নিবন্ধন ও ক্রেডেনশিয়াল সুরক্ষিত রয়েছে।
                    </p>
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-200/80 text-amber-950 border border-amber-300/60">
                        <Calendar className="w-3.5 h-3.5 text-amber-800" />
                        ফলাফল প্রকাশের নির্ধারিত তারিখ: {resultPublishDate}
                      </span>
                      <span className="text-xs text-amber-700 font-medium">
                        অনুগ্রহ করে ফলাফল প্রকাশের তারিখ পর্যন্ত অপেক্ষা করুন।
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Certificate Template Preview */}
            {certTemplate ? (
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200/80 space-y-6">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="font-bold text-gray-700 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    {isResultPublished ? "Live Certificate Preview" : "Protected Certificate Preview (Blurred)"} ({participantData.category || "General"})
                  </span>
                  <span>Format: Landscape Official Credential</span>
                </div>

                <div
                  ref={containerRef}
                  className={`relative w-full rounded-xl overflow-hidden border-2 ${
                    !isResultPublished ? "border-amber-300 bg-slate-900" : "border-gray-200 bg-white"
                  } shadow-md select-none max-w-2xl mx-auto`}
                  style={{ aspectRatio: "16 / 9" }}
                >
                  {/* Inner Certificate Artwork & Texts (Blurred when unreleased) */}
                  <div
                    className={`w-full h-full relative ${
                      !isResultPublished ? "filter blur-[16px] pointer-events-none select-none scale-[1.04]" : ""
                    }`}
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
                    {nameZone.enabled !== false && (() => {
                      const { isBold, isItalic } = parseStyleBooleans(nameZone.style);
                      return (
                        <div
                          className="absolute select-none pointer-events-none"
                          style={{
                            left: `${nameZone.x}%`,
                            top: `${nameZone.y}%`,
                            transform: getTransform(nameZone.align, nameZone.rotation),
                            fontFamily: nameZone.font || "Great Vibes",
                            fontSize: `${scaleFont(nameZone.size)}px`,
                            fontWeight: isBold ? "bold" : "normal",
                            fontStyle: isItalic ? "italic" : "normal",
                            color: nameZone.color || "#1A284A",
                            textAlign: nameZone.align || "center",
                            whiteSpace: "nowrap",
                            lineHeight: 1.2,
                            zIndex: 25,
                          }}
                        >
                          {participantData.name}
                        </div>
                      );
                    })()}

                    {/* Rendered Reference Code */}
                    {refZone.enabled !== false && (() => {
                      const { isBold, isItalic } = parseStyleBooleans(refZone.style);
                      return (
                        <div
                          className="absolute select-none pointer-events-none"
                          style={{
                            left: `${refZone.x}%`,
                            top: `${refZone.y}%`,
                            transform: getTransform(refZone.align, refZone.rotation),
                            fontFamily: refZone.font || "Montserrat",
                            fontSize: `${scaleFont(refZone.size)}px`,
                            fontWeight: isBold ? "bold" : "normal",
                            fontStyle: isItalic ? "italic" : "normal",
                            color: refZone.color || "#29479B",
                            textAlign: refZone.align || "center",
                            whiteSpace: "nowrap",
                            lineHeight: 1.2,
                            zIndex: 25,
                          }}
                        >
                          {participantData.refNumber}
                        </div>
                      );
                    })()}

                    {/* Rendered Date Field */}
                    {Boolean(dateZone.enabled) && (() => {
                      const { isBold, isItalic } = parseStyleBooleans(dateZone.style);
                      return (
                        <div
                          className="absolute select-none pointer-events-none"
                          style={{
                            left: `${dateZone.x}%`,
                            top: `${dateZone.y}%`,
                            transform: getTransform(dateZone.align, dateZone.rotation),
                            fontFamily: dateZone.font || "Montserrat",
                            fontSize: `${scaleFont(dateZone.size)}px`,
                            fontWeight: isBold ? "bold" : "normal",
                            fontStyle: isItalic ? "italic" : "normal",
                            color: dateZone.color || "#1A284A",
                            textAlign: dateZone.align || "center",
                            whiteSpace: "nowrap",
                            lineHeight: 1.2,
                            zIndex: 25,
                          }}
                        >
                          {dateZone.format || "20 September 2026"}
                        </div>
                      );
                    })()}

                    {/* Rendered Signature PNG */}
                    {Boolean(signatureZone.enabled && signatureZone.imageUrl) && (
                      <div
                        className="absolute select-none pointer-events-none"
                        style={{
                          left: `${signatureZone.x}%`,
                          top: `${signatureZone.y}%`,
                          width: `${signatureZone.width || 16}%`,
                          transform: `translate(-50%, -50%) rotate(${signatureZone.rotation || 0}deg)`,
                          zIndex: 25,
                        }}
                      >
                        <img
                          src={signatureZone.imageUrl}
                          alt="Signature"
                          className="w-full h-auto block select-none pointer-events-none drop-shadow-xs"
                          crossOrigin="anonymous"
                        />
                      </div>
                    )}
                  </div>

                  {/* Dark Glassmorphic Lock Overlay when Result Not Published */}
                  {!isResultPublished && (
                    <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-xs flex flex-col items-center justify-center text-center p-6 z-30 select-none">
                      <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-white/95 text-amber-600 flex items-center justify-center shadow-xl mb-3 border border-amber-200">
                        <Lock className="w-6 h-6 sm:w-8 sm:h-8" />
                      </div>
                      <h4 className="text-base sm:text-xl font-black text-white drop-shadow-md">
                        সার্টিফিকেট প্রিভিউ ব্লার ও লক করা আছে
                      </h4>
                      <p className="text-xs sm:text-sm text-white/90 max-w-md mt-1 drop-shadow-sm font-medium">
                        ফলাফল প্রকাশের তারিখের পূর্বে সার্টিফিকেট দেখা বা ডাউনলোড করা যাবে না।
                      </p>
                      <div className="mt-3.5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md text-amber-300 text-xs font-bold border border-amber-300/40 shadow-xs">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        ফলাফল প্রকাশের তারিখ: {resultPublishDate}
                      </div>
                      <p className="text-[11px] text-white/80 mt-2 font-medium">
                        নির্ধারিত তারিখে ফলাফল প্রকাশ হওয়া মাত্র আপনার মূল সার্টিফিকেট সম্পূর্ণ উন্মুক্ত হবে।
                      </p>
                    </div>
                  )}
                </div>

                {/* Download Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    {isResultPublished
                      ? "High-resolution ready for printing or portfolio sharing."
                      : `ফলাফল প্রকাশের তারিখ: ${resultPublishDate} তারিখে সার্টিফিকেট উন্মুক্ত হবে।`}
                  </span>

                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    {resultsList.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={handleDownloadAllCertificates}
                        disabled={isDownloadingAll || !isResultPublished}
                        className={`w-full sm:w-auto gap-2 text-xs font-bold ${
                          isResultPublished
                            ? "text-[#29479B] border-blue-300 hover:bg-blue-50"
                            : "text-gray-400 border-gray-200 cursor-not-allowed"
                        }`}
                      >
                        {isDownloadingAll ? (
                          <>
                            <Spinner size="xs" /> Downloading All...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" /> Download All ({resultsList.length})
                          </>
                        )}
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant={isResultPublished ? "primary" : "secondary"}
                      size="lg"
                      onClick={handleDownloadActiveCertificate}
                      disabled={isDownloading || !isResultPublished}
                      className={`w-full sm:w-auto gap-2 ${
                        isResultPublished
                          ? "bg-[#29479B] hover:bg-[#1A284A] text-white shadow-md hover:shadow-lg transition-all"
                          : "bg-gray-200 text-gray-600 cursor-not-allowed border border-gray-300 shadow-none font-semibold text-xs sm:text-sm"
                      }`}
                      title={!isResultPublished ? `Available on ${resultPublishDate}` : ""}
                    >
                      {isDownloading ? (
                        <>
                          <Spinner size="sm" /> Generating File...
                        </>
                      ) : !isResultPublished ? (
                        <>
                          <Lock className="w-4 h-4 text-amber-600" />
                          <span>ফলাফল প্রকাশ পর্যন্ত অপেক্ষা করুন ({resultPublishDate})</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" /> Download Certificate (.PNG)
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : !isResultPublished ? (
              <div className="bg-white p-8 rounded-2xl border border-amber-200 text-center space-y-3 shadow-xs">
                <Clock className="w-10 h-10 text-amber-500 mx-auto animate-pulse" />
                <h3 className="font-bold text-gray-800 text-base">সার্টিফিকেট ফলাফল প্রকাশের অপেক্ষায়</h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  ফলাফল প্রকাশের তারিখের পূর্বে সার্টিফিকেট দেখা বা ডাউনলোড করা যাবে না। ফলাফল প্রকাশের নির্ধারিত তারিখ: <strong>{resultPublishDate}</strong>। অনুগ্রহ করে নির্ধারিত তারিখ পর্যন্ত অপেক্ষা করুন।
                </p>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                <h3 className="font-bold text-gray-800">Certificate Design in Preparation</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  The official certificate template for <strong>{participantData.competition?.name}</strong> ({participantData.category || "General"}) is currently being prepared. Please check back shortly!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
