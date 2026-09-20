/**
 * Master font options and typography utilities for Certificates and Posters
 */

export const FONT_OPTIONS = [
  // --- Script & Cursive Fonts ---
  { label: "Courgette (Cursive Calligraphy)", value: "Courgette", category: "Script & Cursive" },
  { label: "Playwrite BE WAL (Modern Script)", value: "Playwrite BE WAL", category: "Script & Cursive" },
  { label: "Great Vibes (Classic Calligraphy)", value: "Great Vibes", category: "Script & Cursive" },
  { label: "Alex Brush (Flowing Script)", value: "Alex Brush", category: "Script & Cursive" },
  { label: "Italianno (Elegant Italian Script)", value: "Italianno", category: "Script & Cursive" },
  { label: "Parisienne (French Boutique Script)", value: "Parisienne", category: "Script & Cursive" },
  { label: "Pinyon Script (Vintage Diploma)", value: "Pinyon Script", category: "Script & Cursive" },
  { label: "Marck Script (Curved Hand)", value: "Marck Script", category: "Script & Cursive" },
  { label: "Allura (Smooth Formal Script)", value: "Allura", category: "Script & Cursive" },
  { label: "Dancing Script (Lively Cursive)", value: "Dancing Script", category: "Script & Cursive" },
  { label: "Satisfy (Brush Calligraphy)", value: "Satisfy", category: "Script & Cursive" },
  { label: "Sacramento (Monoline Script)", value: "Sacramento", category: "Script & Cursive" },
  { label: "MonteCarlo (Royal Crest Script)", value: "MonteCarlo", category: "Script & Cursive" },
  { label: "Berkshire Swash (Ornate Flourish)", value: "Berkshire Swash", category: "Script & Cursive" },
  { label: "Caveat (Natural Cursive Handwriting)", value: "Caveat", category: "Script & Cursive" },
  { label: "Kaushan Script (Rustic Brush)", value: "Kaushan Script", category: "Script & Cursive" },
  { label: "Tangerine (Tall Slender Script)", value: "Tangerine", category: "Script & Cursive" },
  { label: "Yellowtail (Retro Sign Cursive)", value: "Yellowtail", category: "Script & Cursive" },
  { label: "Rouge Script (Graceful Script)", value: "Rouge Script", category: "Script & Cursive" },
  { label: "Bad Script (Informal Casual Script)", value: "Bad Script", category: "Script & Cursive" },

  // --- Monospace & Code Fonts ---
  { label: "Courier Prime (Vintage Typewriter)", value: "Courier Prime", category: "Code & Monospace" },
  { label: "JetBrains Mono (Developer Font)", value: "JetBrains Mono", category: "Code & Monospace" },
  { label: "Fira Code (Ligature Code Mono)", value: "Fira Code", category: "Code & Monospace" },
  { label: "Share Tech Mono (Cyber Tech)", value: "Share Tech Mono", category: "Code & Monospace" },
  { label: "Source Code Pro (Clean Terminal)", value: "Source Code Pro", category: "Code & Monospace" },
  { label: "Space Mono (Editorial Geometric)", value: "Space Mono", category: "Code & Monospace" },
  { label: "Roboto Mono (Modern Technical)", value: "Roboto Mono", category: "Code & Monospace" },
  { label: "Inconsolata (Clear Monospace)", value: "Inconsolata", category: "Code & Monospace" },
  { label: "Anonymous Pro (Classic Coder Mono)", value: "Anonymous Pro", category: "Code & Monospace" },

  // --- Serif & Formal Certificate Fonts ---
  { label: "Cinzel (Classical Roman Crest)", value: "Cinzel", category: "Formal Serif" },
  { label: "Playfair Display (Luxury Editorial)", value: "Playfair Display", category: "Formal Serif" },
  { label: "Merriweather (Sturdy Book Serif)", value: "Merriweather", category: "Formal Serif" },
  { label: "Times New Roman (Official Traditional)", value: "Times New Roman", category: "Formal Serif" },
  { label: "Georgia (Warm Dignified Serif)", value: "Georgia", category: "Formal Serif" },

  // --- Sans-serif Modern Fonts ---
  { label: "Montserrat (Modern Architectural)", value: "Montserrat", category: "Clean Sans-Serif" },
  { label: "Raleway (Geometric Elegant)", value: "Raleway", category: "Clean Sans-Serif" },
  { label: "Roboto (Clean Universal)", value: "Roboto", category: "Clean Sans-Serif" },
  { label: "Open Sans (Friendly Humanist)", value: "Open Sans", category: "Clean Sans-Serif" },
  { label: "Helvetica (Neutral Standard)", value: "Helvetica", category: "Clean Sans-Serif" },
];

/**
 * Get CSS generic fallback family
 */
export function getFontFallback(fontFamily) {
  const scriptFonts = [
    "Courgette",
    "Playwrite BE WAL",
    "Great Vibes",
    "Alex Brush",
    "Italianno",
    "Parisienne",
    "Pinyon Script",
    "Marck Script",
    "Allura",
    "Dancing Script",
    "Satisfy",
    "Sacramento",
    "MonteCarlo",
    "Berkshire Swash",
    "Caveat",
    "Kaushan Script",
    "Tangerine",
    "Yellowtail",
    "Rouge Script",
    "Bad Script",
  ];
  const monoFonts = [
    "Courier Prime",
    "JetBrains Mono",
    "Fira Code",
    "Share Tech Mono",
    "Source Code Pro",
    "Space Mono",
    "Roboto Mono",
    "Inconsolata",
    "Anonymous Pro",
  ];
  const serifFonts = ["Cinzel", "Playfair Display", "Merriweather", "Times New Roman", "Georgia"];

  if (scriptFonts.includes(fontFamily)) return "cursive, sans-serif";
  if (monoFonts.includes(fontFamily)) return "monospace, sans-serif";
  if (serifFonts.includes(fontFamily)) return "serif";
  return "sans-serif";
}

/**
 * Builds standard CSS font declaration string for Canvas rendering
 */
export function buildCanvasFont({
  font = "Montserrat",
  size = 24,
  style = "normal",
  isBold = false,
  isItalic = false,
}) {
  const hasBold = Boolean(isBold || (style && String(style).toLowerCase().includes("bold")));
  const hasItalic = Boolean(isItalic || (style && String(style).toLowerCase().includes("italic")));

  const italicStr = hasItalic ? "italic" : "normal";
  const weightStr = hasBold ? "bold" : "normal";
  const fallback = getFontFallback(font);

  return `${italicStr} ${weightStr} ${Math.round(size)}px "${font}", ${fallback}`;
}

/**
 * Parses style string into isBold and isItalic booleans
 */
export function parseStyleBooleans(styleStr = "normal") {
  const s = String(styleStr || "normal").toLowerCase();
  return {
    isBold: s.includes("bold"),
    isItalic: s.includes("italic"),
  };
}

/**
 * Serializes isBold and isItalic to style string
 */
export function serializeStyleString(isBold, isItalic) {
  if (isBold && isItalic) return "bold-italic";
  if (isBold) return "bold";
  if (isItalic) return "italic";
  return "normal";
}
