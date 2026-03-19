import { Filter } from "bad-words";

// ── Custom word lists ─────────────────────────────────────────────────────────

const CUSTOM_PROFANITY = [
  // Arabic
  "كس", "طيز", "زب", "نيك", "شرموطة", "خول", "منيوك", "متناك", "عاهرة",
  // Azerbaijani
  "sik", "siktir", "göt", "orospu", "piç", "fahişə", "eşşək",
];

// ── Patterns ──────────────────────────────────────────────────────────────────

const SQL_PATTERNS: RegExp[] = [
  /'\s*OR\s*'/i,
  /'\s*AND\s*'/i,
  /UNION\s+SELECT/i,
  /';\s*DROP/i,
  /--(\s|;|$)/,
  /\/\*[\s\S]*?\*\//,
  /EXEC\s*\(/i,
  /EXECUTE\s*\(/i,
  /CHAR\s*\(\s*\d/i,
  /0x[0-9a-fA-F]{4,}/i,
];

const XSS_PATTERNS: RegExp[] = [
  /<script[\s>]/i,
  /<\/script>/i,
  /javascript\s*:/i,
  /vbscript\s*:/i,
  /on\w+\s*=/i,
  /eval\s*\(/i,
  /setTimeout\s*\(/i,
  /setInterval\s*\(/i,
  /<iframe[\s>]/i,
  /<object[\s>]/i,
  /<embed[\s>]/i,
  /<form[\s>]/i,
  /document\.cookie/i,
  /window\.location/i,
];

// ── Types ─────────────────────────────────────────────────────────────────────

export type BodyValidationResult =
  | { valid: true }
  | { valid: false; type: "invalid" }
  | { valid: false; type: "profanity"; words: string[] };

// ── Helpers ───────────────────────────────────────────────────────────────────

let _filter: Filter | null = null;
function getFilter(): Filter {
  if (!_filter) {
    _filter = new Filter();
    _filter.addWords(...CUSTOM_PROFANITY);
  }
  return _filter;
}

/** Extract all profane words that appear in `text` (deduped, original casing). */
function extractProfaneWords(text: string, filter: Filter): string[] {
  const found = new Set<string>();

  // Check standard words (split on whitespace + punctuation, preserve word)
  const tokens = text.split(/[\s\p{P}]+/u).filter(Boolean);
  for (const token of tokens) {
    if (filter.isProfane(token)) found.add(token);
  }

  // Check custom multi-script words (substring match for Arabic / Azerbaijani)
  for (const word of CUSTOM_PROFANITY) {
    if (text.toLowerCase().includes(word.toLowerCase())) found.add(word);
  }

  return [...found];
}

// ── Main export ───────────────────────────────────────────────────────────────

export function validateReviewBody(text: string): BodyValidationResult {
  const trimmed = text.trim();
  if (!trimmed) return { valid: true };

  // SQL injection
  for (const pattern of SQL_PATTERNS) {
    if (pattern.test(trimmed)) return { valid: false, type: "invalid" };
  }

  // XSS / HTML injection
  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(trimmed)) return { valid: false, type: "invalid" };
  }

  // Profanity (English via bad-words + custom Arabic/Azerbaijani)
  const filter = getFilter();
  const words = extractProfaneWords(trimmed, filter);
  if (words.length > 0) {
    return { valid: false, type: "profanity", words };
  }

  return { valid: true };
}
