// ============================================================================
// Klaviyo State — Live data with auto-classification engine
// Phase 2: Pulled from live Klaviyo API, auto-mapped to framework categories
// Last synced: 2026-03-11
// ============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FlowStatus = "live" | "draft" | "manual" | "paused";
export type FlowType =
  | "welcome"
  | "browse-abandon"
  | "cart-abandon"
  | "checkout-abandon"
  | "post-purchase"
  | "winback"
  | "nurture"
  | "other";

export interface KlaviyoFlow {
  id: string;
  name: string;
  status: FlowStatus;
  triggerType: string;
  categoryCode: string | null;
  flowType: FlowType;
  created: string;
  updated: string;
}

export interface KlaviyoList {
  id: string;
  name: string;
  categoryCode: string | null;
  listType: "email" | "sms" | "general";
  created: string;
  updated: string;
}

export interface KlaviyoSegment {
  id: string;
  name: string;
  categoryCode?: string | null;
  isActive: boolean;
  segmentGroup: "hot" | "warm" | "customer" | "interest" | "tier" | "other";
}

export interface QuizMetric {
  id: string;
  name: string;
  categoryCode: string;
}

export interface KlaviyoMetricSummary {
  id: string;
  name: string;
  integration: string;
  category: string;
}

// ---------------------------------------------------------------------------
// Auto-classification: Flow → Category Code
// ---------------------------------------------------------------------------

type ClassifyRule = { pattern: RegExp; code: string };

const FLOW_CATEGORY_RULES: ClassifyRule[] = [
  { pattern: /\bsauna heater/i, code: "HTR" },
  { pattern: /\bsauna/i, code: "SAU" },
  { pattern: /\becho\s?water/i, code: "ION" },
  { pattern: /\btyent/i, code: "ION" },
  { pattern: /\bstepr/i, code: "CRD" },
  { pattern: /\baustin/i, code: "CRD" },
  { pattern: /\bhyperbaric|\bHC\b/i, code: "HYP" },
  { pattern: /\bcold\s?plunge|\bcold\s?tub/i, code: "CLD" },
  { pattern: /\bred\s?light|\bpanel/i, code: "RLT" },
  { pattern: /\bfitness|\bcardio/i, code: "FIT" },
  { pattern: /\bemf|\bshielding/i, code: "EMF" },
  { pattern: /\bsleep|\bmattress/i, code: "SLP" },
  { pattern: /\bwater\s?filter|\bpurif/i, code: "WTR" },
  { pattern: /\bair\s?purif/i, code: "AIR" },
  { pattern: /\bsound|\bfreq/i, code: "SND" },
  { pattern: /\bPEMF|\bpulse/i, code: "PEM" },
];

const LIST_CATEGORY_RULES: ClassifyRule[] = [
  { pattern: /\bsauna heater/i, code: "HTR" },
  { pattern: /\bsauna/i, code: "SAU" },
  { pattern: /\becho/i, code: "ION" },
  { pattern: /\btyent/i, code: "ION" },
  { pattern: /\bstepr/i, code: "CRD" },
  { pattern: /\baustin/i, code: "CRD" },
  { pattern: /\bHC\b|hyperbaric/i, code: "HYP" },
  { pattern: /\bcold/i, code: "CLD" },
  { pattern: /\bpendant/i, code: null! }, // known uncategorized
];

function classifyByRules(name: string, rules: ClassifyRule[]): string | null {
  for (const rule of rules) {
    if (rule.pattern.test(name)) return rule.code;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Auto-classification: Flow → Flow Type
// ---------------------------------------------------------------------------

function classifyFlowType(name: string, triggerType: string): FlowType {
  const n = name.toLowerCase();
  if (n.includes("welcome") || n.includes("series")) return "welcome";
  if (n.includes("browse abandon")) return "browse-abandon";
  if (n.includes("abandoned cart") || n.includes("cart abandon")) return "cart-abandon";
  if (n.includes("abandoned checkout") || n.includes("checkout")) return "checkout-abandon";
  if (n.includes("post-purchase") || n.includes("thank")) return "post-purchase";
  if (n.includes("winback") || n.includes("win back") || n.includes("re-engage")) return "winback";
  if (n.includes("nurture")) return "nurture";
  if (triggerType === "Unconfigured") return "other";
  return "other";
}

// ---------------------------------------------------------------------------
// Auto-classification: List → List Type
// ---------------------------------------------------------------------------

function classifyListType(name: string): "email" | "sms" | "general" {
  const n = name.toLowerCase();
  if (n.includes("sms")) return "sms";
  if (n.includes("preview")) return "general";
  return "email";
}

// ---------------------------------------------------------------------------
// Auto-classification: Segment → Segment Group
// ---------------------------------------------------------------------------

function classifySegmentGroup(name: string): "hot" | "warm" | "customer" | "interest" | "tier" | "other" {
  const n = name.toLowerCase();
  if (n.includes("hot") || n.includes("checkout started") || n.includes("a2c")) return "hot";
  if (n.includes("warm")) return "warm";
  if (n.includes("customer") || n.includes("purchased")) return "customer";
  if (n.includes("interest")) return "interest";
  if (n.includes("tier") || n.includes("vip")) return "tier";
  return "other";
}

// ---------------------------------------------------------------------------
// Live Data — Flows (pulled 2026-03-11 from Klaviyo API)
// ---------------------------------------------------------------------------

const RAW_FLOWS = [
  { id: "R7YLfi", name: "[Do Not Live] Echo Water - Welcome Series - 5% OFF", status: "draft" as FlowStatus, triggerType: "Added to List", created: "2025-06-11T09:33:26.000Z", updated: "2026-01-25T10:26:01.000Z" },
  { id: "RJbVS4", name: "AUSTIN - Welcome Series", status: "draft" as FlowStatus, triggerType: "Added to List", created: "2025-01-16T11:26:14.000Z", updated: "2026-01-25T10:23:59.000Z" },
  { id: "RL4j84", name: "AUSTIN - Browse Abandonment", status: "draft" as FlowStatus, triggerType: "Metric", created: "2025-01-18T05:42:57.000Z", updated: "2026-01-25T10:23:21.000Z" },
  { id: "SK6buB", name: "[Do Not Live] Tyent - Welcome Series - 5% OFF", status: "draft" as FlowStatus, triggerType: "Added to List", created: "2025-06-06T11:47:44.000Z", updated: "2026-01-25T10:26:10.000Z" },
  { id: "SuKzDL", name: "Stepr - Abandoned Checkout", status: "live" as FlowStatus, triggerType: "Metric", created: "2025-08-12T13:40:05.000Z", updated: "2026-01-25T10:22:20.000Z" },
  { id: "T8ZCVr", name: "Tyent - Abandoned Checkout", status: "live" as FlowStatus, triggerType: "Metric", created: "2025-06-14T10:41:21.000Z", updated: "2026-01-25T11:20:45.000Z" },
  { id: "USCSXy", name: "Essential Flow Recommendation_", status: "draft" as FlowStatus, triggerType: "Unconfigured", created: "2025-09-10T00:37:30.000Z", updated: "2025-09-10T00:37:30.000Z" },
  { id: "UYycFs", name: "Tyent - Welcome Series - $250 OFF", status: "live" as FlowStatus, triggerType: "Added to List", created: "2025-08-06T10:57:45.000Z", updated: "2026-01-25T10:28:43.000Z" },
  { id: "VDeZPK", name: "Echo Water - Abandoned Checkout", status: "live" as FlowStatus, triggerType: "Metric", created: "2025-06-12T11:37:28.000Z", updated: "2026-03-05T08:00:52.000Z" },
  { id: "VE9jkY", name: "Essential Flow Recommendation_", status: "draft" as FlowStatus, triggerType: "Unconfigured", created: "2025-09-05T06:21:16.000Z", updated: "2025-09-05T06:21:16.000Z" },
  { id: "Vf3dKY", name: "Echo Water - Welcome Series - $250 OFF", status: "live" as FlowStatus, triggerType: "Added to List", created: "2025-08-06T10:58:07.000Z", updated: "2026-03-05T08:33:47.000Z" },
  { id: "VrbuDq", name: "Sauna Heater - Welcome Series", status: "live" as FlowStatus, triggerType: "Added to List", created: "2025-08-09T10:21:38.000Z", updated: "2026-01-25T10:27:18.000Z" },
  { id: "Vx8nUK", name: "SAUNAS- Abandoned Cart", status: "live" as FlowStatus, triggerType: "Metric", created: "2025-01-30T08:22:25.000Z", updated: "2026-01-25T10:28:00.000Z" },
  { id: "WUpYGg", name: "SAUNAS - Browse Abandonment", status: "live" as FlowStatus, triggerType: "Metric", created: "2025-01-30T08:22:53.000Z", updated: "2026-01-25T10:27:26.000Z" },
  { id: "WUsvYn", name: "Stepr - Welcome Series", status: "live" as FlowStatus, triggerType: "Added to List", created: "2025-08-07T09:45:33.000Z", updated: "2026-01-25T10:28:19.000Z" },
  { id: "WgUa9G", name: "Test - Welcome Series - Test% OFF", status: "draft" as FlowStatus, triggerType: "Added to List", created: "2026-02-09T22:41:57.000Z", updated: "2026-02-09T22:44:43.000Z" },
  { id: "X5BUiS", name: "SAUNAS - Welcome Series", status: "live" as FlowStatus, triggerType: "Added to List", created: "2025-01-28T06:18:29.000Z", updated: "2026-01-25T10:27:48.000Z" },
  { id: "X7HhEN", name: "Sauna Heater - Abandoned Checkout", status: "live" as FlowStatus, triggerType: "Metric", created: "2025-08-11T07:19:43.000Z", updated: "2026-01-25T10:22:06.000Z" },
  { id: "XTa8RJ", name: "Standard (High Value Cart vs. Low Value Cart) - Abandoned Checkout", status: "live" as FlowStatus, triggerType: "Metric", created: "2024-11-23T11:39:39.000Z", updated: "2026-01-25T11:42:55.000Z" },
  { id: "XZnLjU", name: "Standard - Welcome Series", status: "live" as FlowStatus, triggerType: "Added to List", created: "2024-11-12T15:03:34.000Z", updated: "2026-01-25T10:33:39.000Z" },
  { id: "Y6S3DG", name: "AUSTIN - Abandoned Cart", status: "draft" as FlowStatus, triggerType: "Metric", created: "2025-01-18T05:41:27.000Z", updated: "2026-01-25T10:26:24.000Z" },
  { id: "YgVLr8", name: "HC Welcome Series - 10% OFF", status: "live" as FlowStatus, triggerType: "Added to List", created: "2026-02-10T10:34:37.000Z", updated: "2026-02-10T11:07:22.000Z" },
  { id: "YqpVLL", name: "AUSTIN - Welcome Series - 5% Subscriber", status: "live" as FlowStatus, triggerType: "Added to List", created: "2025-02-01T07:22:28.000Z", updated: "2026-01-29T20:47:42.000Z" },
];

export const LIVE_FLOWS: KlaviyoFlow[] = RAW_FLOWS.map((f) => ({
  ...f,
  categoryCode: classifyByRules(f.name, FLOW_CATEGORY_RULES),
  flowType: classifyFlowType(f.name, f.triggerType),
}));

// ---------------------------------------------------------------------------
// Live Data — Lists (pulled 2026-03-11 from Klaviyo API)
// ---------------------------------------------------------------------------

const RAW_LISTS = [
  { id: "RDhsNA", name: "Sauna Heater", created: "2025-08-09T10:15:49.000Z", updated: "2025-08-09T10:16:08.000Z" },
  { id: "RHKmcP", name: "Tyent", created: "2025-06-06T11:46:04.000Z", updated: "2025-06-06T11:46:14.000Z" },
  { id: "RvXyNG", name: "Pendant Lights", created: "2025-08-18T14:28:06.000Z", updated: "2025-08-18T14:28:45.000Z" },
  { id: "SJ2uXJ", name: "Email List", created: "2024-11-06T21:14:32.000Z", updated: "2024-11-21T02:11:13.000Z" },
  { id: "TSdMg6", name: "stepr 500", created: "2025-08-07T09:43:22.000Z", updated: "2025-08-07T09:43:32.000Z" },
  { id: "URELru", name: "HC", created: "2026-02-10T09:22:13.000Z", updated: "2026-02-10T09:22:13.000Z" },
  { id: "UdC6wd", name: "SMS List", created: "2025-02-13T04:40:07.000Z", updated: "2025-07-01T19:04:46.000Z" },
  { id: "VfLcA2", name: "Austin 5% SMS Subscriber", created: "2025-02-01T07:19:49.000Z", updated: "2025-02-01T07:19:49.000Z" },
  { id: "WBvifU", name: "Email Austin 5% Subscriber", created: "2025-02-01T07:16:56.000Z", updated: "2025-02-18T04:07:18.000Z" },
  { id: "WiSfYG", name: "Preview List", created: "2024-11-06T21:14:32.000Z", updated: "2025-07-01T19:05:34.000Z" },
  { id: "Wpvwk6", name: "SMS List For [Austin]", created: "2024-11-06T21:14:31.000Z", updated: "2025-07-01T19:09:57.000Z" },
  { id: "XCDnR8", name: "Email List (Sauna)", created: "2025-01-16T09:59:05.000Z", updated: "2025-01-16T10:22:38.000Z" },
  { id: "XRYUKQ", name: "Echo 250", created: "2025-08-06T10:55:06.000Z", updated: "2025-08-06T10:56:44.000Z" },
  { id: "XaZHHg", name: "Echo Water", created: "2025-06-11T08:59:44.000Z", updated: "2025-06-11T08:59:51.000Z" },
  { id: "YiuFUE", name: "Email List (Austin)", created: "2025-01-16T08:24:19.000Z", updated: "2025-01-16T10:22:31.000Z" },
  { id: "YjacDj", name: "Tyent 250", created: "2025-08-06T10:54:35.000Z", updated: "2025-08-06T10:54:43.000Z" },
  { id: "Yn5rWd", name: "SMS List (Sauna)", created: "2025-01-16T10:01:34.000Z", updated: "2025-07-01T19:05:04.000Z" },
];

export const LIVE_LISTS: KlaviyoList[] = RAW_LISTS.map((l) => ({
  ...l,
  categoryCode: classifyByRules(l.name, LIST_CATEGORY_RULES),
  listType: classifyListType(l.name),
}));

// ---------------------------------------------------------------------------
// Live Data — Segments (pulled 2026-03-11 from Klaviyo API)
// ---------------------------------------------------------------------------

export const LIVE_SEGMENTS: KlaviyoSegment[] = [
  { id: "T7m9kD", name: "PPW Hot - Checkout Started or A2C that Never Purchased", isActive: true, segmentGroup: "hot" },
  { id: "XT3vmC", name: "PPW Hot - Checkout Started or A2C that Never Purchased (SMS Allowed)", isActive: true, segmentGroup: "hot" },
  { id: "TRQWwY", name: "PPW Warm - All Klavs - No A2C/AC/Purchase - SMS+EMAIL Allowed", isActive: true, segmentGroup: "warm" },
  { id: "XVhKxA", name: "PPW Warm - All Klavs No A2C/AC/Purchase NO SMS", isActive: true, segmentGroup: "warm" },
  { id: "TmMrK7", name: "For Testing Only", isActive: true, segmentGroup: "other" },
].map((s) => ({
  ...s,
  segmentGroup: classifySegmentGroup(s.name),
}));

// ---------------------------------------------------------------------------
// Quiz Metrics — auto-detected from "Submitted * Quiz" pattern
// ---------------------------------------------------------------------------

const QUIZ_METRIC_MAP: Record<string, string> = {
  "Submitted Massage Gun Quiz": "REC",
  "Submitted Float Tank Quiz": "SDT",
  "Submitted Hyperbaric Quiz": "HYP",
  "Submitted Hydrogen Water Quiz": "H2O",
  "Submitted Water Ionizer Quiz": "ION",
};

export const QUIZ_METRICS: QuizMetric[] = [
  { id: "RxTQTv", name: "Submitted Massage Gun Quiz", categoryCode: "REC" },
  { id: "SGeFJC", name: "Submitted Float Tank Quiz", categoryCode: "SDT" },
  { id: "SQkyne", name: "Submitted Hyperbaric Quiz", categoryCode: "HYP" },
  { id: "TZQ3gx", name: "Submitted Hydrogen Water Quiz", categoryCode: "H2O" },
  { id: "UD22AW", name: "Submitted Water Ionizer Quiz", categoryCode: "ION" },
];

// ---------------------------------------------------------------------------
// Key Metrics — IDs for performance queries
// ---------------------------------------------------------------------------

export const KEY_METRICS: KlaviyoMetricSummary[] = [
  { id: "Xirk9q", name: "Placed Order", integration: "Shopify", category: "eCommerce" },
  { id: "WFqhwM", name: "Checkout Started", integration: "Shopify", category: "eCommerce" },
  { id: "Y79E33", name: "Added to Cart", integration: "Shopify", category: "eCommerce" },
  { id: "THzz8s", name: "Ordered Product", integration: "Shopify", category: "eCommerce" },
  { id: "RKTaVb", name: "Opened Email", integration: "Klaviyo", category: "Internal" },
  { id: "Vrnchx", name: "Clicked Email", integration: "Klaviyo", category: "Internal" },
  { id: "Tyj4rE", name: "Received Email", integration: "Klaviyo", category: "Internal" },
  { id: "Twi4h9", name: "Bounced Email", integration: "Klaviyo", category: "Internal" },
  { id: "VVJYqf", name: "Marked Email as Spam", integration: "Klaviyo", category: "Internal" },
  { id: "RdvnDW", name: "Viewed Product", integration: "API", category: "API" },
  { id: "RAnKRR", name: "Viewed Collection", integration: "Shopify", category: "eCommerce" },
  { id: "XUpBPj", name: "Completed Quiz", integration: "API", category: "API" },
  { id: "T6ywvP", name: "Fulfilled Order", integration: "Shopify", category: "eCommerce" },
  { id: "USYq2i", name: "Refunded Order", integration: "Shopify", category: "eCommerce" },
  { id: "Ri8CZk", name: "Cancelled Order", integration: "Shopify", category: "eCommerce" },
];

// ---------------------------------------------------------------------------
// Snapshot metadata — computed from live data
// ---------------------------------------------------------------------------

export const KLAVIYO_SNAPSHOT = {
  pulledAt: "2026-03-11T12:00:00Z",
  source: "live" as const,
  totalFlows: LIVE_FLOWS.length,
  liveFlows: LIVE_FLOWS.filter((f) => f.status === "live").length,
  draftFlows: LIVE_FLOWS.filter((f) => f.status === "draft").length,
  totalLists: LIVE_LISTS.length,
  totalSegments: LIVE_SEGMENTS.length,
  activeQuizzes: QUIZ_METRICS.length,
  totalKeyMetrics: KEY_METRICS.length,
};

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

export function getFlowsByCategory(code: string): KlaviyoFlow[] {
  return LIVE_FLOWS.filter((f) => f.categoryCode === code);
}

export function getFlowsByStatus(status: FlowStatus): KlaviyoFlow[] {
  return LIVE_FLOWS.filter((f) => f.status === status);
}

export function getListsByCategory(code: string): KlaviyoList[] {
  return LIVE_LISTS.filter((l) => l.categoryCode === code);
}

export function getMetricId(name: string): string | undefined {
  return KEY_METRICS.find((m) => m.name === name)?.id;
}

// ---------------------------------------------------------------------------
// Classification engine exports (for sync endpoint)
// ---------------------------------------------------------------------------

export { classifyByRules, classifyFlowType, classifyListType, classifySegmentGroup };
export { FLOW_CATEGORY_RULES, LIST_CATEGORY_RULES };
