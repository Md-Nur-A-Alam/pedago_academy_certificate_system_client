/**
 * Date validation & status utilities for competitions:
 * 1. Start Date (startDate): before this date, registration is not allowed.
 * 2. End Date (endDate): after this date, registration is not allowed.
 * 3. Result Publish Date (resultPublishDate): before this date, preview and download of certificates are locked/blurred.
 */

export function parseLocalDate(dateStr, endOfDay = false) {
  if (!dateStr || typeof dateStr !== "string") return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  // Match YYYY-MM-DD
  const match = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    return endOfDay
      ? new Date(year, month, day, 23, 59, 59, 999)
      : new Date(year, month, day, 0, 0, 0, 0);
  }

  const d = new Date(trimmed);
  if (isNaN(d.getTime())) return null;
  if (endOfDay) d.setHours(23, 59, 59, 999);
  else d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns registration eligibility and status for a competition
 * @param {Object} competition
 * @returns {{ isOpen: boolean, status: 'open' | 'upcoming' | 'ended' | 'archived', message: string, startDate?: string, endDate?: string }}
 */
export function getRegistrationStatus(competition) {
  if (!competition) {
    return { isOpen: true, status: "open", message: "" };
  }

  if (competition.status === "archived") {
    return {
      isOpen: false,
      status: "archived",
      message: "এই প্রতিযোগিতাটি সমাপ্ত/আর্কাইভ করা হয়েছে এবং বর্তমানে কোনো নতুন নিবন্ধন গ্রহণ করা হচ্ছে না।",
    };
  }

  const now = new Date();

  // 1. Before startDate: Registration is not yet open
  if (competition.startDate) {
    const start = parseLocalDate(competition.startDate, false);
    if (start && now < start) {
      return {
        isOpen: false,
        status: "upcoming",
        startDate: competition.startDate,
        message: `এই প্রতিযোগিতার নিবন্ধন এখনও শুরু হয়নি। নিবন্ধনের শুরুর তারিখ: ${competition.startDate}`,
      };
    }
  }

  // 2. After endDate: Registration has closed
  if (competition.endDate) {
    const end = parseLocalDate(competition.endDate, true);
    if (end && now > end) {
      return {
        isOpen: false,
        status: "ended",
        endDate: competition.endDate,
        message: `এই প্রতিযোগিতার নিবন্ধনের সময়সীমা শেষ হয়েছে। নিবন্ধনের শেষ তারিখ ছিল: ${competition.endDate}`,
      };
    }
  }

  return {
    isOpen: true,
    status: "open",
    message: "",
  };
}

/**
 * Returns certificate publish & download release status for a competition
 * @param {Object} competition
 * @returns {{ isPublished: boolean, providesCertificate: boolean, resultPublishDate?: string, message: string }}
 */
export function getCertificateReleaseStatus(competition) {
  if (!competition) {
    return { isPublished: true, providesCertificate: true, message: "" };
  }

  if (competition.providesCertificate === false) {
    return {
      isPublished: false,
      providesCertificate: false,
      message: "এই প্রতিযোগিতায় সার্টিফিকেট প্রযোজ্য নয়।",
    };
  }

  if (competition.resultPublishDate) {
    const now = new Date();
    const resDate = parseLocalDate(competition.resultPublishDate, false);
    if (resDate && now < resDate) {
      return {
        isPublished: false,
        providesCertificate: true,
        resultPublishDate: competition.resultPublishDate,
        message: `ফলাফল প্রকাশের তারিখের পূর্বে সার্টিফিকেট দেখা (Preview) বা ডাউনলোড করা যাবে না। ফলাফল প্রকাশের নির্ধারিত তারিখ: ${competition.resultPublishDate}`,
      };
    }
  }

  return {
    isPublished: true,
    providesCertificate: true,
    resultPublishDate: competition.resultPublishDate || "",
    message: "",
  };
}
