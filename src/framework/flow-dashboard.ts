// ============================================================================
// PPW Email Engine — Flow Dashboard Data Layer
// Cross-references framework flow architecture with live Klaviyo state
// ============================================================================

import { ALL_FLOWS, type FlowDefinition, type FlowCategory, type FlowStatus, FLOW_COUNTS } from "./flows";
import { CATEGORIES, CATEGORY_CODES } from "./categories";
import { LIVE_FLOWS, KLAVIYO_SNAPSHOT, type KlaviyoFlow } from "./klaviyo-state";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FlowDashboardEntry {
  /** Framework flow definition */
  flow: FlowDefinition;
  /** Matching live Klaviyo flows (may be multiple due to brand-specific flows) */
  klaviyoMatches: KlaviyoFlow[];
  /** Effective status considering live data */
  effectiveStatus: FlowStatus;
  /** Category name for display */
  categoryName: string | null;
  /** Category code extracted from flow ID */
  categoryCode: string | null;
  /** Email completion percentage (live emails / planned emails) */
  emailCompletion: number;
}

export interface FlowCategorySummary {
  category: FlowCategory;
  label: string;
  total: number;
  planned: number;
  draft: number;
  built: number;
  live: number;
  flows: FlowDashboardEntry[];
}

export interface FlowDashboardSummary {
  totalFlows: number;
  totalEmails: number;
  statusCounts: Record<FlowStatus, number>;
  /** Flows that have at least one live Klaviyo match */
  liveInKlaviyo: number;
  /** Flows with draft matches */
  draftInKlaviyo: number;
  /** Categories with the most coverage */
  topCategories: Array<{ code: string; name: string; liveFlows: number }>;
  /** Snapshot metadata */
  snapshot: typeof KLAVIYO_SNAPSHOT;
}

// ---------------------------------------------------------------------------
// Category labels
// ---------------------------------------------------------------------------
const FLOW_CATEGORY_LABELS: Record<FlowCategory, string> = {
  entry: "Entry Flows",
  engagement: "Engagement Flows",
  "post-purchase": "Post-Purchase Flows",
  lifecycle: "Lifecycle Flows",
};

// ---------------------------------------------------------------------------
// Match framework flows to live Klaviyo flows
// ---------------------------------------------------------------------------
function findKlaviyoMatches(flow: FlowDefinition): KlaviyoFlow[] {
  // Extract category code from flow ID (e.g., "F-SAU-Welcome-Quiz" → "SAU")
  const parts = flow.id.split("-");
  const flowCatCode = parts.length >= 2 ? parts[1] : null;

  return LIVE_FLOWS.filter((kf) => {
    // Match by category code
    if (flowCatCode === "ALL") {
      // General flows match Klaviyo flows with null category or match by flow type
      return kf.categoryCode === null && kf.flowType === mapFlowIdToType(flow.id);
    }
    if (kf.categoryCode !== flowCatCode) return false;
    // Match by flow type
    return kf.flowType === mapFlowIdToType(flow.id);
  });
}

function mapFlowIdToType(flowId: string): KlaviyoFlow["flowType"] {
  if (flowId.includes("Welcome") || flowId.includes("Quiz")) return "welcome";
  if (flowId.includes("Browse")) return "browse-abandon";
  if (flowId.includes("Cart-Abandon")) return "cart-abandon";
  if (flowId.includes("Checkout-Abandon")) return "checkout-abandon";
  if (flowId.includes("Post-Purchase")) return "post-purchase";
  if (flowId.includes("Winback")) return "winback";
  if (flowId.includes("Accessory")) return "other";
  if (flowId.includes("VIP")) return "other";
  if (flowId.includes("Sunset")) return "other";
  return "other";
}

function determineEffectiveStatus(flow: FlowDefinition, matches: KlaviyoFlow[]): FlowStatus {
  if (matches.some((m) => m.status === "live")) return "live";
  if (matches.some((m) => m.status === "draft" || m.status === "manual")) return "draft";
  return flow.status;
}

// ---------------------------------------------------------------------------
// Build dashboard entries
// ---------------------------------------------------------------------------
export function buildFlowDashboard(): FlowDashboardEntry[] {
  return ALL_FLOWS.map((flow) => {
    const matches = findKlaviyoMatches(flow);
    const parts = flow.id.split("-");
    const catCode = parts.length >= 2 && parts[1] !== "ALL" ? parts[1] : null;

    return {
      flow,
      klaviyoMatches: matches,
      effectiveStatus: determineEffectiveStatus(flow, matches),
      categoryName: catCode && CATEGORIES[catCode] ? CATEGORIES[catCode].name : null,
      categoryCode: catCode,
      emailCompletion: 0, // Emails not individually tracked yet
    };
  });
}

// ---------------------------------------------------------------------------
// Group by flow category
// ---------------------------------------------------------------------------
export function buildFlowCategorySummaries(): FlowCategorySummary[] {
  const entries = buildFlowDashboard();
  const categories: FlowCategory[] = ["entry", "engagement", "post-purchase", "lifecycle"];

  return categories.map((cat) => {
    const flows = entries.filter((e) => e.flow.category === cat);
    return {
      category: cat,
      label: FLOW_CATEGORY_LABELS[cat],
      total: flows.length,
      planned: flows.filter((f) => f.effectiveStatus === "planned").length,
      draft: flows.filter((f) => f.effectiveStatus === "draft").length,
      built: flows.filter((f) => f.effectiveStatus === "built").length,
      live: flows.filter((f) => f.effectiveStatus === "live").length,
      flows,
    };
  });
}

// ---------------------------------------------------------------------------
// Dashboard summary stats
// ---------------------------------------------------------------------------
export function buildFlowDashboardSummary(): FlowDashboardSummary {
  const entries = buildFlowDashboard();
  const totalEmails = ALL_FLOWS.reduce((sum, f) => sum + f.emailCount, 0);

  const statusCounts: Record<FlowStatus, number> = {
    planned: 0,
    draft: 0,
    built: 0,
    live: 0,
  };
  for (const e of entries) {
    statusCounts[e.effectiveStatus]++;
  }

  const liveInKlaviyo = entries.filter((e) =>
    e.klaviyoMatches.some((m) => m.status === "live")
  ).length;
  const draftInKlaviyo = entries.filter((e) =>
    e.klaviyoMatches.some((m) => m.status === "draft") && !e.klaviyoMatches.some((m) => m.status === "live")
  ).length;

  // Top categories by live flow count
  const catCounts: Record<string, number> = {};
  for (const kf of LIVE_FLOWS) {
    if (kf.categoryCode && kf.status === "live") {
      catCounts[kf.categoryCode] = (catCounts[kf.categoryCode] || 0) + 1;
    }
  }
  const topCategories = Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([code, count]) => ({
      code,
      name: CATEGORIES[code]?.name ?? code,
      liveFlows: count,
    }));

  return {
    totalFlows: entries.length,
    totalEmails,
    statusCounts,
    liveInKlaviyo,
    draftInKlaviyo,
    topCategories,
    snapshot: KLAVIYO_SNAPSHOT,
  };
}

// ---------------------------------------------------------------------------
// Get category-specific flow view
// ---------------------------------------------------------------------------
export function getFlowsForProductCategory(categoryCode: string): FlowDashboardEntry[] {
  const entries = buildFlowDashboard();
  return entries.filter((e) => {
    // Include ALL (general) flows + category-specific flows
    const parts = e.flow.id.split("-");
    const flowCat = parts.length >= 2 ? parts[1] : null;
    return flowCat === categoryCode || flowCat === "ALL";
  });
}
