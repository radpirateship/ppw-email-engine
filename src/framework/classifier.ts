// ============================================================================
// PPW Email Engine — Content Classifier
// Rule-based content classification for the Content-to-Email Pipeline.
// Classifies articles by content type and category, then maps them to
// nurture flow email positions.
// ============================================================================

import { ContentClassification, CONTENT_TYPE_TO_POSITIONS, NURTURE_EMAIL_POSITIONS, EmailPosition } from "./content-map";
import { CATEGORIES, Category } from "./categories";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ContentInput {
  /** Article title */
  title: string;
  /** Optional article URL */
  url?: string;
  /** Optional summary or excerpt */
  summary?: string;
}

export interface ClassifiedContent {
  /** Original input */
  input: ContentInput;
  /** Detected content classification */
  contentType: ContentClassification;
  /** Confidence score 0–1 */
  confidence: number;
  /** Matched category code(s) — e.g. ["SAU"] or ["SAU", "CLD"] */
  categories: string[];
  /** Email positions this content maps to */
  positions: EmailPosition[];
  /** Which keywords triggered the classification */
  matchedKeywords: string[];
}

// ---------------------------------------------------------------------------
// Keyword dictionaries for content type classification
// ---------------------------------------------------------------------------

const CONTENT_TYPE_KEYWORDS: Record<ContentClassification, string[]> = {
  benefit: [
    "benefit", "benefits", "health", "wellness", "improve", "boost",
    "reduce", "relief", "recovery", "healing", "detox", "anti-aging",
    "weight loss", "inflammation", "immune", "sleep", "stress",
    "muscle", "pain relief", "circulation", "skin health",
    "mental health", "brain health", "cognitive",
  ],
  comparison: [
    "vs", "versus", "compared", "comparison", "difference",
    "better", "which is", "or", "alternative",
    "infrared vs traditional", "traditional vs",
  ],
  "buyers-guide": [
    "best", "top", "guide", "how to choose", "buying guide",
    "buyer", "what to look for", "features to consider",
    "budget", "worth it", "review roundup", "ranked",
    "size guide", "ultimate guide",
  ],
  "brand-spotlight": [
    "brand", "review", "spotlight", "company",
    "golden designs", "dynamic saunas", "saunalife", "harvia", "huum",
    "echo water", "tyent", "hooga", "medical breakthrough",
    "steelflex", "prx performance", "oxynova", "oxyrevo",
    "summit to sea", "finnmark", "therasage",
  ],
  installation: [
    "install", "installation", "setup", "how to set up",
    "electrical", "requirements", "maintenance", "assembly",
    "placement", "location", "wiring", "plumbing",
    "space requirements", "room size",
  ],
  "social-proof": [
    "testimonial", "customer story", "case study", "before and after",
    "success story", "results", "transformation", "experience",
    "real results", "user review",
  ],
  science: [
    "study", "studies", "research", "clinical", "evidence",
    "science", "scientific", "mechanism", "how it works",
    "wavelength", "frequency", "temperature", "peer-reviewed",
    "NIH", "pubmed",
  ],
  "how-to": [
    "how to", "step by step", "tutorial", "tips",
    "technique", "protocol", "routine", "beginner",
    "getting started", "first time", "instructions",
    "breathing", "duration", "frequency",
  ],
  "pillar-content": [
    "ultimate guide", "complete guide", "everything you need",
    "comprehensive", "definitive", "pillar", "101",
    "beginner to advanced", "a to z",
  ],
  "product-review": [
    "review", "hands-on", "unboxing", "tested",
    "our pick", "editor's choice", "field test",
    "long-term review", "honest review",
  ],
};

// ---------------------------------------------------------------------------
// Category keyword dictionaries
// ---------------------------------------------------------------------------

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  SAU: [
    "sauna", "saunas", "infrared", "barrel sauna", "indoor sauna",
    "outdoor sauna", "steam room", "finnish", "traditional sauna",
    "far infrared", "full spectrum",
  ],
  HTR: [
    "sauna heater", "heater", "wood-burning", "electric heater",
    "harvia", "huum", "sauna stove",
  ],
  CLD: [
    "cold plunge", "cold plunges", "ice bath", "cold water",
    "cold therapy", "cold immersion", "cold tub", "chiller",
    "wim hof",
  ],
  RLT: [
    "red light", "red light therapy", "light therapy",
    "near infrared", "NIR", "photobiomodulation", "LED panel",
    "light panel", "wavelength",
  ],
  HYP: [
    "hyperbaric", "hyperbaric chamber", "HBOT", "oxygen therapy",
    "pressurized", "oxygen chamber", "mild hyperbaric",
  ],
  H2O: [
    "hydrogen water", "hydrogen", "molecular hydrogen",
    "hydrogen machine", "hydrogen bottle", "H2",
    "echo water",
  ],
  ION: [
    "water ionizer", "ionizer", "alkaline water", "ionized water",
    "tyent", "pH water", "electrolysis",
  ],
  REC: [
    "massage", "recovery", "massage chair", "massage gun",
    "compression", "percussion", "foam roller",
    "medical breakthrough",
  ],
  SDT: [
    "float tank", "sensory deprivation", "flotation",
    "float therapy", "isolation tank", "epsom",
  ],
  PIL: [
    "pilates", "reformer", "pilates chair", "pilates equipment",
    "pilates machine",
  ],
  GYM: [
    "home gym", "gym equipment", "power rack", "weight bench",
    "squat rack", "barbell", "dumbbells", "strength training",
    "steelflex", "prx",
  ],
  CRD: [
    "cardio", "treadmill", "exercise bike", "elliptical",
    "rowing machine", "climber", "stationary bike",
  ],
  SPT: [
    "sports", "lacrosse", "athlete", "athletic",
    "sports equipment",
  ],
  WEL: [
    "wellness", "air purifier", "PEMF", "steam shower",
    "home wellness", "indoor air", "pulsed electromagnetic",
  ],
  // Add new category keywords above this line
};

// ---------------------------------------------------------------------------
// Classification functions
// ---------------------------------------------------------------------------

/**
 * Classify a single piece of content by type and category.
 */
export function classifyContent(input: ContentInput): ClassifiedContent {
  const text = `${input.title} ${input.summary ?? ""}`.toLowerCase();

  // --- Content type detection ---
  let bestType: ContentClassification = "benefit";
  let bestScore = 0;
  let bestKeywords: string[] = [];

  for (const [type, keywords] of Object.entries(CONTENT_TYPE_KEYWORDS) as [ContentClassification, string[]][]) {
    const matched = keywords.filter((kw) => text.includes(kw.toLowerCase()));
    const score = matched.length;
    if (score > bestScore) {
      bestScore = score;
      bestType = type;
      bestKeywords = matched;
    }
  }

  // Confidence: 0–1 scale based on number of keyword matches
  const confidence = Math.min(bestScore / 4, 1);

  // --- Category detection ---
  const categoryScores: Record<string, number> = {};
  for (const [code, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matched = keywords.filter((kw) => text.includes(kw.toLowerCase()));
    if (matched.length > 0) {
      categoryScores[code] = matched.length;
    }
  }

  // Sort categories by score descending, take all that matched
  const detectedCategories = Object.entries(categoryScores)
    .sort((a, b) => b[1] - a[1])
    .map(([code]) => code);

  // --- Map to email positions ---
  const positionIds = CONTENT_TYPE_TO_POSITIONS[bestType] ?? [];
  const positions = NURTURE_EMAIL_POSITIONS.filter((p) =>
    positionIds.includes(p.position)
  );

  return {
    input,
    contentType: bestType,
    confidence,
    categories: detectedCategories.length > 0 ? detectedCategories : ["ALL"],
    positions,
    matchedKeywords: bestKeywords,
  };
}

/**
 * Classify a batch of content items.
 */
export function classifyBatch(items: ContentInput[]): ClassifiedContent[] {
  return items.map(classifyContent);
}

/**
 * Get the category name for a code, or "Cross-Category" for "ALL".
 */
export function getCategoryLabel(code: string): string {
  if (code === "ALL") return "Cross-Category";
  const cat: Category | undefined = CATEGORIES[code as keyof typeof CATEGORIES];
  return cat?.name ?? code;
}

/**
 * Summary of classified content mapped by email position.
 * Shows which positions have content and which are gaps.
 */
export interface PositionMapping {
  position: string;
  day: number;
  purpose: string;
  assignedContent: ClassifiedContent[];
  isFilled: boolean;
}

export function mapContentToPositions(
  classified: ClassifiedContent[],
  categoryFilter?: string
): PositionMapping[] {
  // Filter by category if specified
  const filtered = categoryFilter
    ? classified.filter(
        (c) =>
          c.categories.includes(categoryFilter) ||
          c.categories.includes("ALL")
      )
    : classified;

  return NURTURE_EMAIL_POSITIONS.map((pos) => {
    const assigned = filtered.filter((c) =>
      c.positions.some((p) => p.position === pos.position)
    );
    return {
      position: pos.position,
      day: pos.day,
      purpose: pos.purpose,
      assignedContent: assigned,
      isFilled: assigned.length > 0,
    };
  });
}
