// ============================================================================
// Live Klaviyo State Snapshot
// Pulled from Klaviyo API on 2026-03-11
// This file maps actual Klaviyo assets to the framework's category system.
// Replace with live API calls when the Klaviyo Sync Layer (Module 04) is built.
// ============================================================================

export interface KlaviyoFlow {
  id: string;
  name: string;
  status: "live" | "draft" | "manual" | "paused";
  triggerType: string;
  /** Which framework category this maps to, or "general" */
  categoryCode: string | null;
  /** Which framework flow type this maps to */
  flowType: "welcome" | "browse-abandon" | "cart-abandon" | "checkout-abandon" | "post-purchase" | "winback" | "nurture" | "other";
}

export interface KlaviyoList {
  id: string;
  name: string;
  /** Which framework category this maps to, or null for general */
  categoryCode: string | null;
  listType: "email" | "sms" | "general";
}

export interface KlaviyoSegment {
  id: string;
  name: string;
  /** Which framework category this maps to, or null for general */
  categoryCode?: string | null;
  isActive: boolean;
  /** Which framework segment group this maps to */
  segmentGroup: "hot" | "warm" | "customer" | "interest" | "tier" | "other";
}

export interface QuizMetric {
  id: string;
  name: string;
  categoryCode: string;
}

// ---------------------------------------------------------------------------
// Live Flows — mapped to framework categories
// ---------------------------------------------------------------------------
export const LIVE_FLOWS: KlaviyoFlow[] = [
  // === GENERAL / STANDARD ===
  { id: "XZnLjU", name: "Standard - Welcome Series", status: "live", triggerType: "Added to List", categoryCode: null, flowType: "welcome" },
  { id: "XTa8RJ", name: "Standard - Abandoned Checkout (High/Low Value)", status: "live", triggerType: "Metric", categoryCode: null, flowType: "checkout-abandon" },

  // === SAUNAS (SAU) ===
  { id: "X5BUiS", name: "SAUNAS - Welcome Series", status: "live", triggerType: "Added to List", categoryCode: "SAU", flowType: "welcome" },
  { id: "WUpYGg", name: "SAUNAS - Browse Abandonment", status: "live", triggerType: "Metric", categoryCode: "SAU", flowType: "browse-abandon" },
  { id: "Vx8nUK", name: "SAUNAS - Abandoned Cart", status: "live", triggerType: "Metric", categoryCode: "SAU", flowType: "cart-abandon" },

  // === SAUNA HEATERS (HTR) ===
  { id: "VrbuDq", name: "Sauna Heater - Welcome Series", status: "live", triggerType: "Added to List", categoryCode: "HTR", flowType: "welcome" },
  { id: "X7HhEN", name: "Sauna Heater - Abandoned Checkout", status: "live", triggerType: "Metric", categoryCode: "HTR", flowType: "checkout-abandon" },

  // === WATER IONIZERS (ION) — Echo Water brand ===
  { id: "Vf3dKY", name: "Echo Water - Welcome Series - $250 OFF", status: "live", triggerType: "Added to List", categoryCode: "ION", flowType: "welcome" },
  { id: "VDeZPK", name: "Echo Water - Abandoned Checkout", status: "live", triggerType: "Metric", categoryCode: "ION", flowType: "checkout-abandon" },
  { id: "R7YLfi", name: "Echo Water - Welcome Series - 5% OFF", status: "draft", triggerType: "Added to List", categoryCode: "ION", flowType: "welcome" },

  // === WATER IONIZERS (ION) — Tyent brand ===
  { id: "UYycFs", name: "Tyent - Welcome Series - $250 OFF", status: "live", triggerType: "Added to List", categoryCode: "ION", flowType: "welcome" },
  { id: "T8ZCVr", name: "Tyent - Abandoned Checkout", status: "live", triggerType: "Metric", categoryCode: "ION", flowType: "checkout-abandon" },
  { id: "SK6buB", name: "Tyent - Welcome Series - 5% OFF", status: "draft", triggerType: "Added to List", categoryCode: "ION", flowType: "welcome" },

  // === CARDIO (CRD) — Stepr brand ===
  { id: "WUsvYn", name: "Stepr - Welcome Series", status: "live", triggerType: "Added to List", categoryCode: "CRD", flowType: "welcome" },
  { id: "SuKzDL", name: "Stepr - Abandoned Checkout", status: "live", triggerType: "Metric", categoryCode: "CRD", flowType: "checkout-abandon" },

  // === CARDIO (CRD) — Austin brand ===
  { id: "YqpVLL", name: "AUSTIN - Welcome Series - 5% Subscriber", status: "live", triggerType: "Added to List", categoryCode: "CRD", flowType: "welcome" },
  { id: "RJbVS4", name: "AUSTIN - Welcome Series", status: "draft", triggerType: "Added to List", categoryCode: "CRD", flowType: "welcome" },
  { id: "RL4j84", name: "AUSTIN - Browse Abandonment", status: "draft", triggerType: "Metric", categoryCode: "CRD", flowType: "browse-abandon" },
  { id: "Y6S3DG", name: "AUSTIN - Abandoned Cart", status: "draft", triggerType: "Metric", categoryCode: "CRD", flowType: "cart-abandon" },

  // === HYPERBARIC (HYP) ===
  { id: "YgVLr8", name: "HC Welcome Series - 10% OFF", status: "live", triggerType: "Added to List", categoryCode: "HYP", flowType: "welcome" },

  // === UNCATEGORIZED / TEST ===
  { id: "USCSXy", name: "Essential Flow Recommendation_", status: "draft", triggerType: "Unconfigured", categoryCode: null, flowType: "other" },
  { id: "VE9jkY", name: "Essential Flow Recommendation_", status: "draft", triggerType: "Unconfigured", categoryCode: null, flowType: "other" },
  { id: "WgUa9G", name: "Test - Welcome Series", status: "draft", triggerType: "Added to List", categoryCode: null, flowType: "other" },
];

// ---------------------------------------------------------------------------
// Live Lists — mapped to framework categories
// ---------------------------------------------------------------------------
export const LIVE_LISTS: KlaviyoList[] = [
  // General
  { id: "SJ2uXJ", name: "Email List", categoryCode: null, listType: "email" },
  { id: "UdC6wd", name: "SMS List", categoryCode: null, listType: "sms" },
  { id: "WiSfYG", name: "Preview List", categoryCode: null, listType: "general" },

  // Saunas
  { id: "XCDnR8", name: "Email List (Sauna)", categoryCode: "SAU", listType: "email" },
  { id: "Yn5rWd", name: "SMS List (Sauna)", categoryCode: "SAU", listType: "sms" },

  // Sauna Heaters
  { id: "RDhsNA", name: "Sauna Heater", categoryCode: "HTR", listType: "email" },

  // Water Ionizers (brand-specific, should be consolidated)
  { id: "XaZHHg", name: "Echo Water", categoryCode: "ION", listType: "email" },
  { id: "XRYUKQ", name: "Echo 250", categoryCode: "ION", listType: "email" },
  { id: "RHKmcP", name: "Tyent", categoryCode: "ION", listType: "email" },
  { id: "YjacDj", name: "Tyent 250", categoryCode: "ION", listType: "email" },

  // Cardio (brand-specific)
  { id: "TSdMg6", name: "stepr 500", categoryCode: "CRD", listType: "email" },
  { id: "WBvifU", name: "Email Austin 5% Subscriber", categoryCode: "CRD", listType: "email" },
  { id: "VfLcA2", name: "Austin 5% SMS Subscriber", categoryCode: "CRD", listType: "sms" },
  { id: "YiuFUE", name: "Email List (Austin)", categoryCode: "CRD", listType: "email" },
  { id: "Wpvwk6", name: "SMS List For [Austin]", categoryCode: "CRD", listType: "sms" },

  // Hyperbaric
  { id: "URELru", name: "HC", categoryCode: "HYP", listType: "email" },

  // Uncategorized
  { id: "RvXyNG", name: "Pendant Lights", categoryCode: null, listType: "email" },
];

// ---------------------------------------------------------------------------
// Live Segments
// ---------------------------------------------------------------------------
export const LIVE_SEGMENTS: KlaviyoSegment[] = [
  { id: "T7m9kD", name: "PPW Hot - Checkout Started or A2C that Never Purchased", isActive: true, segmentGroup: "hot" },
  { id: "XT3vmC", name: "PPW Hot - Checkout Started or A2C that Never Purchased (SMS Allowed)", isActive: true, segmentGroup: "hot" },
  { id: "TRQWwY", name: "PPW Warm - All Klavs - No A2C/AC/Purchase - SMS+EMAIL Allowed", isActive: true, segmentGroup: "warm" },
  { id: "XVhKxA", name: "PPW Warm - All Klavs No A2C/AC/Purchase NO SMS", isActive: true, segmentGroup: "warm" },
  { id: "TmMrK7", name: "For Testing Only", isActive: true, segmentGroup: "other" },
];

// ---------------------------------------------------------------------------
// Quiz Metrics — categories with active quizzes
// ---------------------------------------------------------------------------
export const QUIZ_METRICS: QuizMetric[] = [
  { id: "RxTQTv", name: "Submitted Massage Gun Quiz", categoryCode: "REC" },
  { id: "SGeFJC", name: "Submitted Float Tank Quiz", categoryCode: "SDT" },
  { id: "SQkyne", name: "Submitted Hyperbaric Quiz", categoryCode: "HYP" },
  { id: "TZQ3gx", name: "Submitted Hydrogen Water Quiz", categoryCode: "H2O" },
  { id: "UD22AW", name: "Submitted Water Ionizer Quiz", categoryCode: "ION" },
];

// ---------------------------------------------------------------------------
// Snapshot metadata
// ---------------------------------------------------------------------------
export const KLAVIYO_SNAPSHOT = {
  pulledAt: "2026-03-11T00:00:00Z",
  totalFlows: LIVE_FLOWS.length,
  liveFlows: LIVE_FLOWS.filter((f) => f.status === "live").length,
  draftFlows: LIVE_FLOWS.filter((f) => f.status === "draft").length,
  totalLists: LIVE_LISTS.length,
  totalSegments: LIVE_SEGMENTS.length,
  activeQuizzes: QUIZ_METRICS.length,
};
