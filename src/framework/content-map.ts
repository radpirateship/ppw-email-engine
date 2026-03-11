// ============================================================================
// PPW Email Engine — Content-to-Email Position Map
// ============================================================================

export type ContentClassification =
  | "benefit"
  | "comparison"
  | "buyers-guide"
  | "brand-spotlight"
  | "installation"
  | "social-proof"
  | "science"
  | "how-to"
  | "pillar-content"
  | "product-review";

export interface EmailPosition {
  position: string;
  day: number;
  contentType: ContentClassification | "quiz-results" | "consultation" | "offer" | "soft-close" | "deep-dive" | "customer-story";
  purpose: string;
}

/**
 * The 45-day nurture flow email position map.
 * Used by the Content-to-Email Pipeline to auto-map content.
 */
export const NURTURE_EMAIL_POSITIONS: EmailPosition[] = [
  { position: "E1", day: 0, contentType: "quiz-results", purpose: "Personalized product recommendations" },
  { position: "E2", day: 1, contentType: "deep-dive", purpose: "Detailed feature breakdown of #1 recommendation" },
  { position: "E3", day: 3, contentType: "benefit", purpose: "Health benefits aligned with stated goals" },
  { position: "E4", day: 5, contentType: "brand-spotlight", purpose: "Featured brand quality/warranty story" },
  { position: "E5", day: 8, contentType: "comparison", purpose: "Comparison guide (e.g., Traditional vs Infrared)" },
  { position: "E6", day: 12, contentType: "customer-story", purpose: "Case study, testimonial, lifestyle imagery" },
  { position: "E7", day: 17, contentType: "installation", purpose: "Installation guide, common concerns" },
  { position: "E8", day: 23, contentType: "consultation", purpose: "Have questions? Let's talk" },
  { position: "E9", day: 30, contentType: "offer", purpose: "Special offer or financing (optional)" },
  { position: "E10", day: 37, contentType: "buyers-guide", purpose: "Buyer's guide link, consultation reminder" },
  { position: "E11", day: 45, contentType: "soft-close", purpose: "Preference update, stay subscribed?" },
];

/**
 * Content classification → which email positions it maps to.
 * A single piece of content can serve multiple positions.
 */
export const CONTENT_TYPE_TO_POSITIONS: Record<ContentClassification, string[]> = {
  "benefit": ["E3"],
  "comparison": ["E5"],
  "buyers-guide": ["E10"],
  "brand-spotlight": ["E4"],
  "installation": ["E7"],
  "social-proof": ["E6"],
  "science": ["E3"],
  "how-to": ["E7"],
  "pillar-content": ["E2", "E3"],
  "product-review": ["E4", "E10"],
};

/**
 * Per-category content inventory from the topical authority plan.
 */
export interface CategoryContentInventory {
  categoryCode: string;
  articleCount: number;
  pillarContent: string;
  contentAreas: string[];
}

export const CATEGORY_CONTENT: CategoryContentInventory[] = [
  {
    categoryCode: "SAU",
    articleCount: 80,
    pillarContent: "Ultimate Guide to Saunas",
    contentAreas: [
      "Health, Detox, Athletic Recovery, Skin, Weight Loss",
      "Infrared vs Traditional, Indoor vs Outdoor, Barrel vs Cabin",
      "Best Saunas 2025, How to Choose, Size Guide",
      "Golden Designs, Dynamic, Finnmark, SaunaLife reviews",
      "Setup guides, electrical requirements, maintenance",
    ],
  },
  {
    categoryCode: "CLD",
    articleCount: 51,
    pillarContent: "Ultimate Guide to Cold Plunges",
    contentAreas: [
      "Recovery, Inflammation, Mental Health, Immune",
      "vs Ice Bath, vs Cryotherapy",
      "Temperature, Duration, Breathing techniques",
      "Best Cold Plunges, Features to Look For",
    ],
  },
  {
    categoryCode: "RLT",
    articleCount: 41,
    pillarContent: "Ultimate Guide to Red Light Therapy",
    contentAreas: [
      "Skin, Hair, Pain, Recovery, Inflammation",
      "Panel types, Full body vs Targeted",
      "Clinical studies, How it works",
    ],
  },
  {
    categoryCode: "HYP",
    articleCount: 39,
    pillarContent: "Ultimate Guide to Hyperbaric Chambers",
    contentAreas: [
      "Brain Health, Wound Healing, Athletic Recovery, Anti-Aging",
      "Home vs Clinical, Pressure levels",
      "OxyNova, OxyRevo, Summit to Sea reviews",
    ],
  },
  {
    categoryCode: "H2O",
    articleCount: 31,
    pillarContent: "Hydrogen Water Guide",
    contentAreas: [
      "Antioxidants, Athletic Recovery, Skin",
      "Hydrogen vs Alkaline",
      "Echo Water reviews",
    ],
  },
  {
    categoryCode: "ION",
    articleCount: 26,
    pillarContent: "Water Ionizer Guide",
    contentAreas: [
      "Antioxidants, pH, Health",
      "Countertop vs Under-sink",
      "Tyent reviews",
    ],
  },
  {
    categoryCode: "REC",
    articleCount: 25,
    pillarContent: "Recovery Equipment Guide",
    contentAreas: [
      "Massage Chairs, Guns, Compression",
      "Post-workout recovery, pain relief",
      "Medical Breakthrough reviews",
    ],
  },
  {
    categoryCode: "GYM",
    articleCount: 20,
    pillarContent: "Home Gym Setup Guide",
    contentAreas: [
      "Strength equipment, racks, benches",
      "Space planning, budget guide",
      "SteelFlex, PRx Performance reviews",
    ],
  },
  {
    categoryCode: "PIL",
    articleCount: 15,
    pillarContent: "Pilates Equipment Guide",
    contentAreas: [
      "Reformers, chairs, equipment",
      "Home vs studio setup",
    ],
  },
  {
    categoryCode: "CRD",
    articleCount: 15,
    pillarContent: "Cardio Equipment Guide",
    contentAreas: [
      "Bikes, treadmills, climbers",
      "Best home cardio 2025",
    ],
  },
  {
    categoryCode: "WEL",
    articleCount: 15,
    pillarContent: "Home Wellness Guide",
    contentAreas: [
      "Air purifiers, steam, PEMF",
      "Indoor air quality, wellness rooms",
    ],
  },
  {
    categoryCode: "HTR",
    articleCount: 10,
    pillarContent: "Sauna Heater Guide",
    contentAreas: [
      "Electric vs wood-burning",
      "Harvia, HUUM reviews",
    ],
  },
  {
    categoryCode: "SDT",
    articleCount: 10,
    pillarContent: "Float Tank Guide",
    contentAreas: [
      "Sensory deprivation benefits",
      "Home float tanks vs commercial",
    ],
  },
  {
    categoryCode: "SPT",
    articleCount: 5,
    pillarContent: "Sports Equipment Guide",
    contentAreas: ["Lacrosse, athlete management"],
  },
  // Add new category content above this line
];

export function getContentForCategory(
  categoryCode: string
): CategoryContentInventory | undefined {
  return CATEGORY_CONTENT.find((c) => c.categoryCode === categoryCode);
}

export function getPositionsForContentType(
  type: ContentClassification
): EmailPosition[] {
  const positionIds = CONTENT_TYPE_TO_POSITIONS[type];
  return NURTURE_EMAIL_POSITIONS.filter((p) =>
    positionIds.includes(p.position)
  );
}
