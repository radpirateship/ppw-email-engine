// ============================================================================
// PPW Email Engine — Tag Taxonomy
// ============================================================================

export type TagNamespace =
  | "cat"
  | "brand"
  | "tier"
  | "source"
  | "quiz"
  | "engage"
  | "stage";

export interface TagDefinition {
  namespace: TagNamespace;
  slug: string;
  fullTag: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Category Tags
// ---------------------------------------------------------------------------
export const CATEGORY_TAGS: TagDefinition[] = [
  { namespace: "cat", slug: "saunas", fullTag: "cat:saunas", description: "Interest in saunas" },
  { namespace: "cat", slug: "sauna-heaters", fullTag: "cat:sauna-heaters", description: "Interest in sauna heaters" },
  { namespace: "cat", slug: "cold-plunges", fullTag: "cat:cold-plunges", description: "Interest in cold plunges" },
  { namespace: "cat", slug: "red-light-therapy", fullTag: "cat:red-light-therapy", description: "Interest in red light therapy" },
  { namespace: "cat", slug: "hyperbaric", fullTag: "cat:hyperbaric", description: "Interest in hyperbaric chambers" },
  { namespace: "cat", slug: "hydrogen-water", fullTag: "cat:hydrogen-water", description: "Interest in hydrogen water" },
  { namespace: "cat", slug: "water-ionizers", fullTag: "cat:water-ionizers", description: "Interest in water ionizers" },
  { namespace: "cat", slug: "massage-recovery", fullTag: "cat:massage-recovery", description: "Interest in massage & recovery" },
  { namespace: "cat", slug: "float-tanks", fullTag: "cat:float-tanks", description: "Interest in float tanks" },
  { namespace: "cat", slug: "pilates", fullTag: "cat:pilates", description: "Interest in pilates equipment" },
  { namespace: "cat", slug: "home-gym", fullTag: "cat:home-gym", description: "Interest in home gym equipment" },
  { namespace: "cat", slug: "cardio", fullTag: "cat:cardio", description: "Interest in cardio equipment" },
  { namespace: "cat", slug: "sports", fullTag: "cat:sports", description: "Interest in sports equipment" },
  { namespace: "cat", slug: "home-wellness", fullTag: "cat:home-wellness", description: "Interest in home wellness" },
];

// ---------------------------------------------------------------------------
// Price Tier Tags
// ---------------------------------------------------------------------------
export const TIER_TAGS: TagDefinition[] = [
  { namespace: "tier", slug: "entry", fullTag: "tier:entry", description: "$0-$499" },
  { namespace: "tier", slug: "mid", fullTag: "tier:mid", description: "$500-$1,999" },
  { namespace: "tier", slug: "high", fullTag: "tier:high", description: "$2,000-$9,999" },
  { namespace: "tier", slug: "premium", fullTag: "tier:premium", description: "$10,000+" },
];

// ---------------------------------------------------------------------------
// Source Tags (Lead Origin)
// ---------------------------------------------------------------------------
export const SOURCE_TAGS: TagDefinition[] = [
  { namespace: "source", slug: "popup", fullTag: "source:popup", description: "Subscribed via popup" },
  { namespace: "source", slug: "quiz", fullTag: "source:quiz", description: "Subscribed via quiz" },
  { namespace: "source", slug: "footer-form", fullTag: "source:footer-form", description: "Subscribed via footer form" },
  { namespace: "source", slug: "checkout-abandon", fullTag: "source:checkout-abandon", description: "Abandoned checkout" },
  { namespace: "source", slug: "browse-abandon", fullTag: "source:browse-abandon", description: "Browse abandonment" },
  { namespace: "source", slug: "purchase", fullTag: "source:purchase", description: "Made a purchase" },
  { namespace: "source", slug: "phone-lead", fullTag: "source:phone-lead", description: "Phone/consultation lead" },
  { namespace: "source", slug: "manual-import", fullTag: "source:manual-import", description: "Manually imported" },
];

// ---------------------------------------------------------------------------
// Quiz-Specific Tags
// ---------------------------------------------------------------------------
export const QUIZ_TAGS: TagDefinition[] = [
  { namespace: "quiz", slug: "sauna-finder", fullTag: "quiz:sauna-finder", description: "Completed sauna finder quiz" },
  { namespace: "quiz", slug: "cold-plunge", fullTag: "quiz:cold-plunge", description: "Completed cold plunge quiz" },
  { namespace: "quiz", slug: "red-light", fullTag: "quiz:red-light", description: "Completed red light quiz" },
  { namespace: "quiz", slug: "hyperbaric", fullTag: "quiz:hyperbaric", description: "Completed hyperbaric quiz" },
  { namespace: "quiz", slug: "hydrogen-water", fullTag: "quiz:hydrogen-water", description: "Completed hydrogen water quiz" },
  { namespace: "quiz", slug: "recovery", fullTag: "quiz:recovery", description: "Completed recovery quiz" },
  { namespace: "quiz", slug: "pilates", fullTag: "quiz:pilates", description: "Completed pilates quiz" },
  { namespace: "quiz", slug: "home-gym", fullTag: "quiz:home-gym", description: "Completed home gym quiz" },
];

// ---------------------------------------------------------------------------
// Engagement Tags
// ---------------------------------------------------------------------------
export const ENGAGEMENT_TAGS: TagDefinition[] = [
  { namespace: "engage", slug: "opened-30d", fullTag: "engage:opened-30d", description: "Opened email in last 30 days" },
  { namespace: "engage", slug: "clicked-30d", fullTag: "engage:clicked-30d", description: "Clicked email in last 30 days" },
  { namespace: "engage", slug: "purchased", fullTag: "engage:purchased", description: "Has made a purchase" },
  { namespace: "engage", slug: "repeat-buyer", fullTag: "engage:repeat-buyer", description: "Has made 2+ purchases" },
  { namespace: "engage", slug: "vip", fullTag: "engage:vip", description: "VIP customer" },
  { namespace: "engage", slug: "at-risk", fullTag: "engage:at-risk", description: "At risk of churning" },
  { namespace: "engage", slug: "churned", fullTag: "engage:churned", description: "Churned customer" },
];

// ---------------------------------------------------------------------------
// Lifecycle Stage Tags
// ---------------------------------------------------------------------------
export const LIFECYCLE_TAGS: TagDefinition[] = [
  { namespace: "stage", slug: "new-subscriber", fullTag: "stage:new-subscriber", description: "New subscriber" },
  { namespace: "stage", slug: "engaged-prospect", fullTag: "stage:engaged-prospect", description: "Engaged prospect" },
  { namespace: "stage", slug: "hot-lead", fullTag: "stage:hot-lead", description: "Hot lead / high purchase intent" },
  { namespace: "stage", slug: "customer", fullTag: "stage:customer", description: "First-time customer" },
  { namespace: "stage", slug: "repeat-customer", fullTag: "stage:repeat-customer", description: "Repeat customer" },
  { namespace: "stage", slug: "vip", fullTag: "stage:vip", description: "VIP customer" },
  { namespace: "stage", slug: "at-risk", fullTag: "stage:at-risk", description: "At risk of churning" },
  { namespace: "stage", slug: "churned", fullTag: "stage:churned", description: "Churned / inactive" },
];

// ---------------------------------------------------------------------------
// Notable Brand Tags (49 total — key brands listed here)
// ---------------------------------------------------------------------------
export const BRAND_TAGS: TagDefinition[] = [
  { namespace: "brand", slug: "golden-designs", fullTag: "brand:golden-designs", description: "Golden Designs saunas" },
  { namespace: "brand", slug: "dynamic-saunas", fullTag: "brand:dynamic-saunas", description: "Dynamic Saunas" },
  { namespace: "brand", slug: "saunalife", fullTag: "brand:saunalife", description: "SaunaLife" },
  { namespace: "brand", slug: "harvia", fullTag: "brand:harvia", description: "Harvia heaters" },
  { namespace: "brand", slug: "huum", fullTag: "brand:huum", description: "HUUM heaters" },
  { namespace: "brand", slug: "echo-water", fullTag: "brand:echo-water", description: "Echo Water hydrogen" },
  { namespace: "brand", slug: "tyent", fullTag: "brand:tyent", description: "Tyent ionizers" },
  { namespace: "brand", slug: "hooga", fullTag: "brand:hooga", description: "Hooga red light therapy" },
  { namespace: "brand", slug: "medical-breakthrough", fullTag: "brand:medical-breakthrough", description: "Medical Breakthrough massage" },
  { namespace: "brand", slug: "steelflex", fullTag: "brand:steelflex", description: "SteelFlex gym equipment" },
  { namespace: "brand", slug: "prx-performance", fullTag: "brand:prx-performance", description: "PRx Performance racks" },
];

// ---------------------------------------------------------------------------
// All Tags (combined)
// ---------------------------------------------------------------------------
export const ALL_TAGS: TagDefinition[] = [
  ...CATEGORY_TAGS,
  ...TIER_TAGS,
  ...SOURCE_TAGS,
  ...QUIZ_TAGS,
  ...ENGAGEMENT_TAGS,
  ...LIFECYCLE_TAGS,
  ...BRAND_TAGS,
];

export function getTagsByNamespace(namespace: TagNamespace): TagDefinition[] {
  return ALL_TAGS.filter((t) => t.namespace === namespace);
}
