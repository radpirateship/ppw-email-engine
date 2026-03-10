// ============================================================================
// Category Completion Scoring Engine
// Cross-references the framework plan against live Klaviyo state
// ============================================================================

import { CATEGORIES, type Category } from "./categories";
import { ALL_FLOWS } from "./flows";
import { ALL_LISTS } from "./lists";
import { ALL_SEGMENTS } from "./segments";
import { CATEGORY_CONTENT } from "./content-map";
import {
  LIVE_FLOWS,
  LIVE_LISTS,
  LIVE_SEGMENTS,
  QUIZ_METRICS,
  KLAVIYO_SNAPSHOT,
  type KlaviyoFlow,
} from "./klaviyo-state";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CategoryFlowStatus {
  /** Framework flow type */
  type: string;
  /** Whether this flow type exists live in Klaviyo for this category */
  hasLive: boolean;
  /** Whether a draft exists */
  hasDraft: boolean;
  /** Name of the live/draft flow if it exists */
  klaviyoName: string | null;
  /** Status of the Klaviyo flow */
  klaviyoStatus: string | null;
}

export interface CategoryCompletion {
  code: string;
  name: string;
  articleCount: number;

  /** Flow coverage */
  flows: {
    planned: number;
    live: number;
    draft: number;
    details: CategoryFlowStatus[];
    score: number; // 0–100
  };

  /** List presence */
  lists: {
    planned: number;
    exists: number;
    hasEmail: boolean;
    hasSms: boolean;
    klaviyoLists: string[];
    score: number;
  };

  /** Segment readiness — category-specific segments are Phase 2+ */
  segments: {
    hasInterestSegment: boolean;
    score: number;
  };

  /** Content readiness */
  content: {
    articleCount: number;
    hasContentMap: boolean;
    score: number;
  };

  /** Quiz presence */
  quiz: {
    hasQuiz: boolean;
    quizName: string | null;
  };

  /** Overall readiness 0–100 */
  overallScore: number;
  /** Tier label */
  tier: "not-started" | "beginning" | "building" | "established" | "advanced";
}

export interface OverallReadiness {
  /** Average score across all categories */
  averageScore: number;
  /** Categories by tier */
  tierCounts: Record<string, number>;
  /** Total planned vs live flows */
  flowsPlanned: number;
  flowsLive: number;
  /** Total planned vs existing lists */
  listsPlanned: number;
  listsExist: number;
  /** Segments planned vs existing */
  segmentsPlanned: number;
  segmentsExist: number;
  /** Snapshot info */
  snapshot: typeof KLAVIYO_SNAPSHOT;
}

// ---------------------------------------------------------------------------
// The 5 core flow types every category should eventually have
// ---------------------------------------------------------------------------
const CORE_FLOW_TYPES = [
  "welcome",
  "browse-abandon",
  "cart-abandon",
  "checkout-abandon",
  "post-purchase",
] as const;

// ---------------------------------------------------------------------------
// Scoring helpers
// ---------------------------------------------------------------------------

function getFlowsForCategory(categoryCode: string): KlaviyoFlow[] {
  return LIVE_FLOWS.filter((f) => f.categoryCode === categoryCode);
}

function scoreTier(score: number): CategoryCompletion["tier"] {
  if (score === 0) return "not-started";
  if (score < 25) return "beginning";
  if (score < 50) return "building";
  if (score < 75) return "established";
  return "advanced";
}

// ---------------------------------------------------------------------------
// Compute completion for a single category
// ---------------------------------------------------------------------------
export function computeCategoryCompletion(categoryCode: string): CategoryCompletion {
  const cat = CATEGORIES[categoryCode];
  if (!cat) throw new Error(`Unknown category: ${categoryCode}`);

  const contentEntry = CATEGORY_CONTENT.find((c) => c.categoryCode === categoryCode);

  // --- FLOWS ---
  const categoryFlows = getFlowsForCategory(categoryCode);
  const flowDetails: CategoryFlowStatus[] = CORE_FLOW_TYPES.map((type) => {
    const liveMatch = categoryFlows.find((f) => f.flowType === type && f.status === "live");
    const draftMatch = categoryFlows.find((f) => f.flowType === type && f.status === "draft");
    const match = liveMatch || draftMatch;
    return {
      type,
      hasLive: !!liveMatch,
      hasDraft: !!draftMatch && !liveMatch,
      klaviyoName: match?.name ?? null,
      klaviyoStatus: match?.status ?? null,
    };
  });

  const liveFlowCount = flowDetails.filter((f) => f.hasLive).length;
  const draftFlowCount = flowDetails.filter((f) => f.hasDraft).length;
  // Live flows count full, drafts count half
  const flowScore = Math.round(((liveFlowCount + draftFlowCount * 0.5) / CORE_FLOW_TYPES.length) * 100);

  // --- LISTS ---
  const categoryLists = LIVE_LISTS.filter((l) => l.categoryCode === categoryCode);
  const hasEmail = categoryLists.some((l) => l.listType === "email");
  const hasSms = categoryLists.some((l) => l.listType === "sms");
  // Plan: each category needs at least an email list. SMS is bonus.
  const listScore = hasEmail ? (hasSms ? 100 : 75) : 0;

  // --- SEGMENTS ---
  // Category-specific interest segments don't exist yet in Klaviyo.
  // The framework plans 14 category interest segments + 5 tier segments.
  // For now, we just check if the general hot/warm segments exist.
  const hasInterest = false; // None built yet per live data
  const segmentScore = hasInterest ? 100 : 0;

  // --- CONTENT ---
  const articleCount = contentEntry?.articleCount ?? cat.articleCount;
  const hasContentMap = !!contentEntry;
  // Score based on article volume (80 articles = 100%)
  const contentScore = Math.min(100, Math.round((articleCount / 50) * 100));

  // --- QUIZ ---
  const quizMetric = QUIZ_METRICS.find((q) => q.categoryCode === categoryCode);

  // --- OVERALL ---
  // Weighted: Flows 40%, Lists 20%, Segments 15%, Content 25%
  const overallScore = Math.round(
    flowScore * 0.4 + listScore * 0.2 + segmentScore * 0.15 + contentScore * 0.25
  );

  return {
    code: categoryCode,
    name: cat.name,
    articleCount: cat.articleCount,
    flows: {
      planned: CORE_FLOW_TYPES.length,
      live: liveFlowCount,
      draft: draftFlowCount,
      details: flowDetails,
      score: flowScore,
    },
    lists: {
      planned: 2, // email + sms
      exists: categoryLists.length,
      hasEmail,
      hasSms,
      klaviyoLists: categoryLists.map((l) => l.name),
      score: listScore,
    },
    segments: {
      hasInterestSegment: hasInterest,
      score: segmentScore,
    },
    content: {
      articleCount,
      hasContentMap,
      score: contentScore,
    },
    quiz: {
      hasQuiz: !!quizMetric,
      quizName: quizMetric?.name ?? null,
    },
    overallScore,
    tier: scoreTier(overallScore),
  };
}

// ---------------------------------------------------------------------------
// Compute completion for ALL categories
// ---------------------------------------------------------------------------
export function computeAllCompletions(): CategoryCompletion[] {
  return Object.keys(CATEGORIES).map((code) => computeCategoryCompletion(code));
}

// ---------------------------------------------------------------------------
// Compute overall readiness summary
// ---------------------------------------------------------------------------
export function computeOverallReadiness(completions: CategoryCompletion[]): OverallReadiness {
  const avg = Math.round(
    completions.reduce((sum, c) => sum + c.overallScore, 0) / completions.length
  );

  const tierCounts: Record<string, number> = {};
  for (const c of completions) {
    tierCounts[c.tier] = (tierCounts[c.tier] || 0) + 1;
  }

  const flowsPlanned = completions.reduce((s, c) => s + c.flows.planned, 0);
  const flowsLive = completions.reduce((s, c) => s + c.flows.live, 0);
  const listsPlanned = completions.length * 2; // email + sms per category
  const listsExist = completions.reduce((s, c) => s + (c.lists.hasEmail ? 1 : 0) + (c.lists.hasSms ? 1 : 0), 0);

  return {
    averageScore: avg,
    tierCounts,
    flowsPlanned,
    flowsLive,
    listsPlanned,
    listsExist,
    segmentsPlanned: ALL_SEGMENTS.length,
    segmentsExist: LIVE_SEGMENTS.length,
    snapshot: KLAVIYO_SNAPSHOT,
  };
}
// ============================================================================
// Category Completion Scoring Engine
// Cross-references the framework plan against live Klaviyo state
// ============================================================================

import { CATEGORIES, type Category } from "./categories";
import { ALL_FLOWS } from "./flows";
import { ALL_LISTS } from "./lists";
import { ALL_SEGMENTS } from "./segments";
import { CATEGORY_CONTENT } from "./content-map";
import {
  LIVE_FLOWS,
  LIVE_LISTS,
  LIVE_SEGMENTS,
  QUIZ_METRICS,
  KLAVIYO_SNAPSHOT,
  type KlaviyoFlow,
} from "./klaviyo-state";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CategoryFlowStatus {
  /** Framework flow type */
  type: string;
  /** Whether this flow type exists live in Klaviyo for this category */
  hasLive: boolean;
  /** Whether a draft exists */
  hasDraft: boolean;
  /** Name of the live/draft flow if it exists */
  klaviyoName: string | null;
  /** Status of the Klaviyo flow */
  klaviyoStatus: string | null;
}

export interface CategoryCompletion {
  code: string;
  name: string;
  articleCount: number;

  /** Flow coverage */
  flows: {
    planned: number;
    live: number;
    draft: number;
    details: CategoryFlowStatus[];
    score: number; // 0–100
  };

  /** List presence */
  lists: {
    planned: number;
    exists: number;
    hasEmail: boolean;
    hasSms: boolean;
    klaviyoLists: string[];
    score: number;
  };

  /** Segment readiness — category-specific segments are Phase 2+ */
  segments: {
    hasInterestSegment: boolean;
    score: number;
  };

  /** Content readiness */
  content: {
    articleCount: number;
    hasContentMap: boolean;
    score: number;
  };

  /** Quiz presence */
  quiz: {
    hasQuiz: boolean;
    quizName: string | null;
  };

  /** Overall readiness 0–100 */
  overallScore: number;
  /** Tier label */
  tier: "not-started" | "beginning" | "building" | "established" | "advanced";
}

export interface OverallReadiness {
  /** Average score across all categories */
  averageScore: number;
  /** Categories by tier */
  tierCounts: Record<string, number>;
  /** Total planned vs live flows */
  flowsPlanned: number;
  flowsLive: number;
  /** Total planned vs existing lists */
  listsPlanned: number;
  listsExist: number;
  /** Segments planned vs existing */
  segmentsPlanned: number;
  segmentsExist: number;
  /** Snapshot info */
  snapshot: typeof KLAVIYO_SNAPSHOT;
}

// ---------------------------------------------------------------------------
// The 5 core flow types every category should eventually have
// ---------------------------------------------------------------------------
const CORE_FLOW_TYPES = [
  "welcome",
  "browse-abandon",
  "cart-abandon",
  "checkout-abandon",
  "post-purchase",
] as const;

// ---------------------------------------------------------------------------
// Scoring helpers
// ---------------------------------------------------------------------------

function getFlowsForCategory(categoryCode: string): KlaviyoFlow[] {
  return LIVE_FLOWS.filter((f) => f.categoryCode === categoryCode);
}

function scoreTier(score: number): CategoryCompletion["tier"] {
  if (score === 0) return "not-started";
  if (score < 25) return "beginning";
  if (score < 50) return "building";
  if (score < 75) return "established";
  return "advanced";
}

// ---------------------------------------------------------------------------
// Compute completion for a single category
// ---------------------------------------------------------------------------
export function computeCategoryCompletion(categoryCode: string): CategoryCompletion {
  const cat = CATEGORIES[categoryCode];
  if (!cat) throw new Error(`Unknown category: ${categoryCode}`);

  const contentEntry = CATEGORY_CONTENT.find((c) => c.categoryCode === categoryCode);

  // --- FLOWS ---
  const categoryFlows = getFlowsForCategory(categoryCode);
  const flowDetails: CategoryFlowStatus[] = CORE_FLOW_TYPES.map((type) => {
    const liveMatch = categoryFlows.find((f) => f.flowType === type && f.status === "live");
    const draftMatch = categoryFlows.find((f) => f.flowType === type && f.status === "draft");
    const match = liveMatch || draftMatch;
    return {
      type,
      hasLive: !!liveMatch,
      hasDraft: !!draftMatch && !liveMatch,
      klaviyoName: match?.name ?? null,
      klaviyoStatus: match?.status ?? null,
    };
  });

  const liveFlowCount = flowDetails.filter((f) => f.hasLive).length;
  const draftFlowCount = flowDetails.filter((f) => f.hasDraft).length;
  // Live flows count full, drafts count half
  const flowScore = Math.round(((liveFlowCount + draftFlowCount * 0.5) / CORE_FLOW_TYPES.length) * 100);

  // --- LISTS ---
  const categoryLists = LIVE_LISTS.filter((l) => l.categoryCode === categoryCode);
  const hasEmail = categoryLists.some((l) => l.listType === "email");
  const hasSms = categoryLists.some((l) => l.listType === "sms");
  // Plan: each category needs at least an email list. SMS is bonus.
  const listScore = hasEmail ? (hasSms ? 100 : 75) : 0;

  // --- SEGMENTS ---
  // Category-specific interest segments don't exist yet in Klaviyo.
  // The framework plans 14 category interest segments + 5 tier segments.
  // For now, we just check if the general hot/warm segments exist.
  const hasInterest = false; // None built yet per live data
  const segmentScore = hasInterest ? 100 : 0;

  // --- CONTENT ---
  const articleCount = contentEntry?.articleCount ?? cat.articleCount;
  const hasContentMap = !!contentEntry;
  // Score based on article volume (80 articles = 100%)
  const contentScore = Math.min(100, Math.round((articleCount / 50) * 100));

  // --- QUIZ ---
  const quizMetric = QUIZ_METRICS.find((q) => q.categoryCode === categoryCode);

  // --- OVERALL ---
  // Weighted: Flows 40%, Lists 20%, Segments 15%, Content 25%
  const overallScore = Math.round(
    flowScore * 0.4 + listScore * 0.2 + segmentScore * 0.15 + contentScore * 0.25
  );

  return {
    code: categoryCode,
    name: cat.name,
    articleCount: cat.articleCount,
    flows: {
      planned: CORE_FLOW_TYPES.length,
      live: liveFlowCount,
      draft: draftFlowCount,
      details: flowDetails,
      score: flowScore,
    },
    lists: {
      planned: 2, // email + sms
      exists: categoryLists.length,
      hasEmail,
      hasSms,
      klaviyoLists: categoryLists.map((l) => l.name),
      score: listScore,
    },
    segments: {
      hasInterestSegment: hasInterest,
      score: segmentScore,
    },
    content: {
      articleCount,
      hasContentMap,
      score: contentScore,
    },
    quiz: {
      hasQuiz: !!quizMetric,
      quizName: quizMetric?.name ?? null,
    },
    overallScore,
    tier: scoreTier(overallScore),
  };
}

// ---------------------------------------------------------------------------
// Compute completion for ALL categories
// ---------------------------------------------------------------------------
export function computeAllCompletions(): CategoryCompletion[] {
  return Object.keys(CATEGORIES).map((code) => computeCategoryCompletion(code));
}

// ---------------------------------------------------------------------------
// Compute overall readiness summary
// ---------------------------------------------------------------------------
export function computeOverallReadiness(completions: CategoryCompletion[]): OverallReadiness {
  const avg = Math.round(
    completions.reduce((sum, c) => sum + c.overallScore, 0) / completions.length
  );

  const tierCounts: Record<string, number> = {};
  for (const c of completions) {
    tierCounts[c.tier] = (tierCounts[c.tier] || 0) + 1;
  }

  const flowsPlanned = completions.reduce((s, c) => s + c.flows.planned, 0);
  const flowsLive = completions.reduce((s, c) => s + c.flows.live, 0);
  const listsPlanned = completions.length * 2; // email + sms per category
  const listsExist = completions.reduce((s, c) => s + (c.lists.hasEmail ? 1 : 0) + (c.lists.hasSms ? 1 : 0), 0);

  return {
    averageScore: avg,
    tierCounts,
    flowsPlanned,
    flowsLive,
    listsPlanned,
    listsExist,
    segmentsPlanned: ALL_SEGMENTS.length,
    segmentsExist: LIVE_SEGMENTS.length,
    snapshot: KLAVIYO_SNAPSHOT,
  };
}

