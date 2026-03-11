// ============================================================================
// PPW Email Engine — Klaviyo Delta Analysis
// Compares live Klaviyo data against framework expectations to surface gaps
// ============================================================================

import { CATEGORIES, CATEGORY_CODES, type Category } from "./categories";
import { ALL_FLOWS, type FlowDefinition } from "./flows";
import {
  LIVE_FLOWS,
  LIVE_LISTS,
  LIVE_SEGMENTS,
  KEY_METRICS,
  QUIZ_METRICS,
  KLAVIYO_SNAPSHOT,
  type KlaviyoFlow,
  type KlaviyoList,
  type FlowType,
} from "./klaviyo-state";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CategoryDelta {
  code: string;
  name: string;
  /** Framework-planned flows for this category */
  plannedFlows: number;
  /** Live Klaviyo flows for this category */
  liveKlaviyoFlows: KlaviyoFlow[];
  /** Draft Klaviyo flows for this category */
  draftKlaviyoFlows: KlaviyoFlow[];
  /** Klaviyo lists for this category */
  lists: KlaviyoList[];
  /** Has at least a welcome flow in Klaviyo */
  hasWelcome: boolean;
  /** Has browse abandonment */
  hasBrowseAbandon: boolean;
  /** Has cart/checkout abandonment */
  hasCartOrCheckout: boolean;
  /** Has post-purchase flow */
  hasPostPurchase: boolean;
  /** Flow type coverage: which types exist in Klaviyo */
  flowTypeCoverage: FlowType[];
  /** Missing flow types that the framework expects */
  missingFlowTypes: string[];
  /** Readiness score 0-100 */
  readiness: number;
  /** Has a dedicated email list */
  hasEmailList: boolean;
  /** Has a dedicated SMS list */
  hasSMSList: boolean;
  /** Has content (articleCount > 0) */
  hasContent: boolean;
  /** Has products in catalog */
  hasQuiz: boolean;
}

export interface OrphanedItem {
  id: string;
  name: string;
  type: "flow" | "list";
  reason: string;
}

export interface DeltaSummary {
  /** Per-category readiness */
  categories: CategoryDelta[];
  /** Average readiness across all categories */
  averageReadiness: number;
  /** Categories with highest readiness */
  topCategories: CategoryDelta[];
  /** Categories with lowest readiness */
  bottomCategories: CategoryDelta[];
  /** Klaviyo items that don't map to any framework category */
  orphanedFlows: OrphanedItem[];
  orphanedLists: OrphanedItem[];
  /** Framework flows not yet in Klaviyo at all */
  missingFromKlaviyo: FlowDefinition[];
  /** High-level gap counts */
  gaps: {
    categoriesWithNoFlows: number;
    categoriesWithNoLists: number;
    categoriesWithNoWelcome: number;
    categoriesWithNoAbandonment: number;
    totalMissingFlowTypes: number;
  };
  /** Snapshot metadata */
  snapshot: typeof KLAVIYO_SNAPSHOT;
}

// ---------------------------------------------------------------------------
// Expected flow types per category (based on framework architecture)
// ---------------------------------------------------------------------------

const EXPECTED_FLOW_TYPES: FlowType[] = [
  "welcome",
  "browse-abandon",
  "cart-abandon",
  "checkout-abandon",
];

// ---------------------------------------------------------------------------
// Build per-category delta
// ---------------------------------------------------------------------------

function buildCategoryDelta(code: string, cat: Category): CategoryDelta {
  const catFlows = LIVE_FLOWS.filter((f) => f.categoryCode === code);
  const liveFlows = catFlows.filter((f) => f.status === "live");
  const draftFlows = catFlows.filter((f) => f.status === "draft");
  const catLists = LIVE_LISTS.filter((l) => l.categoryCode === code);

  const flowTypes = Array.from(new Set(catFlows.map((f) => f.flowType)));
  const hasWelcome = flowTypes.includes("welcome");
  const hasBrowseAbandon = flowTypes.includes("browse-abandon");
  const hasCartOrCheckout = flowTypes.includes("cart-abandon") || flowTypes.includes("checkout-abandon");
  const hasPostPurchase = flowTypes.includes("post-purchase");

  const missingFlowTypes = EXPECTED_FLOW_TYPES.filter((t) => !flowTypes.includes(t));

  // Count planned flows from the framework that target this category
  const plannedFlows = ALL_FLOWS.filter((f) => {
    const parts = f.id.split("-");
    return parts[1] === code;
  }).length;

  // Readiness scoring
  let readiness = 0;
  if (hasWelcome) readiness += 30;
  if (hasBrowseAbandon) readiness += 15;
  if (hasCartOrCheckout) readiness += 25;
  if (hasPostPurchase) readiness += 10;
  if (catLists.length > 0) readiness += 10;
  if (liveFlows.length > 0) readiness += 5;
  if (cat.hasQuiz && QUIZ_METRICS.some((q) => q.categoryCode === code)) readiness += 5;

  return {
    code,
    name: cat.name,
    plannedFlows,
    liveKlaviyoFlows: liveFlows,
    draftKlaviyoFlows: draftFlows,
    lists: catLists,
    hasWelcome,
    hasBrowseAbandon,
    hasCartOrCheckout,
    hasPostPurchase,
    flowTypeCoverage: flowTypes,
    missingFlowTypes,
    readiness: Math.min(100, readiness),
    hasEmailList: catLists.some((l) => l.listType === "email"),
    hasSMSList: catLists.some((l) => l.listType === "sms"),
    hasContent: cat.articleCount > 0,
    hasQuiz: cat.hasQuiz,
  };
}

// ---------------------------------------------------------------------------
// Find orphaned items (in Klaviyo but not mapped to framework)
// ---------------------------------------------------------------------------

function findOrphanedFlows(): OrphanedItem[] {
  return LIVE_FLOWS
    .filter((f) => !f.categoryCode)
    .map((f) => ({
      id: f.id,
      name: f.name,
      type: "flow" as const,
      reason: f.name.includes("Essential Flow") || f.name.includes("Test")
        ? "Test/template flow"
        : "No category classification rule matches",
    }));
}

function findOrphanedLists(): OrphanedItem[] {
  return LIVE_LISTS
    .filter((l) => !l.categoryCode)
    .map((l) => ({
      id: l.id,
      name: l.name,
      type: "list" as const,
      reason: l.name.includes("Preview")
        ? "Internal preview list"
        : l.name.includes("SMS List") && !l.name.includes("(")
          ? "General SMS list (not category-specific)"
          : l.name.includes("Email List") && !l.name.includes("(")
            ? "General email list (not category-specific)"
            : "No category classification rule matches",
    }));
}

// ---------------------------------------------------------------------------
// Find framework flows with no Klaviyo match
// ---------------------------------------------------------------------------

function findMissingFromKlaviyo(): FlowDefinition[] {
  return ALL_FLOWS.filter((planned) => {
    const parts = planned.id.split("-");
    const catCode = parts[1];

    if (catCode === "ALL") {
      // Check if any general-purpose flow of this type exists
      const neededType = planned.name.toLowerCase().includes("welcome")
        ? "welcome"
        : planned.name.toLowerCase().includes("browse")
          ? "browse-abandon"
          : planned.name.toLowerCase().includes("cart")
            ? "cart-abandon"
            : planned.name.toLowerCase().includes("checkout")
              ? "checkout-abandon"
              : planned.name.toLowerCase().includes("post-purchase")
                ? "post-purchase"
                : planned.name.toLowerCase().includes("winback")
                  ? "winback"
                  : "other";
      return !LIVE_FLOWS.some(
        (kf) => kf.flowType === neededType && kf.categoryCode === null
      );
    }

    // Category-specific: does any Klaviyo flow match this category?
    const matchingCatFlows = LIVE_FLOWS.filter((kf) => kf.categoryCode === catCode);
    if (matchingCatFlows.length === 0) return true;

    // Has matching category but check if the specific flow type exists
    const neededType = planned.name.toLowerCase().includes("welcome") || planned.name.toLowerCase().includes("quiz")
      ? "welcome"
      : planned.name.toLowerCase().includes("browse")
        ? "browse-abandon"
        : planned.name.toLowerCase().includes("upsell")
          ? "post-purchase"
          : "other";
    return !matchingCatFlows.some((kf) => kf.flowType === neededType);
  });
}

// ---------------------------------------------------------------------------
// Build full delta summary
// ---------------------------------------------------------------------------

export function buildDeltaSummary(): DeltaSummary {
  const categories = CATEGORY_CODES.map((code) =>
    buildCategoryDelta(code, CATEGORIES[code])
  );

  const averageReadiness = Math.round(
    categories.reduce((sum, c) => sum + c.readiness, 0) / Math.max(categories.length, 1)
  );

  const sorted = Array.from(categories).sort((a, b) => b.readiness - a.readiness);
  const topCategories = sorted.slice(0, 5);
  const bottomCategories = sorted.slice(-5).reverse();

  const orphanedFlows = findOrphanedFlows();
  const orphanedLists = findOrphanedLists();
  const missingFromKlaviyo = findMissingFromKlaviyo();

  return {
    categories,
    averageReadiness,
    topCategories,
    bottomCategories,
    orphanedFlows,
    orphanedLists,
    missingFromKlaviyo,
    gaps: {
      categoriesWithNoFlows: categories.filter(
        (c) => c.liveKlaviyoFlows.length === 0 && c.draftKlaviyoFlows.length === 0
      ).length,
      categoriesWithNoLists: categories.filter((c) => c.lists.length === 0).length,
      categoriesWithNoWelcome: categories.filter((c) => !c.hasWelcome).length,
      categoriesWithNoAbandonment: categories.filter((c) => !c.hasCartOrCheckout).length,
      totalMissingFlowTypes: categories.reduce((sum, c) => sum + c.missingFlowTypes.length, 0),
    },
    snapshot: KLAVIYO_SNAPSHOT,
  };
}
