// ============================================================================
// PPW Email Engine — Collection Hub: Grading & Progress System
// ============================================================================
// Grades each product collection against the full flow matrix. Tracks
// completion % AND content coverage for a composite letter grade.
// ============================================================================

import { CATEGORIES, type Category } from "./categories";
import { ALL_FLOWS, type FlowDefinition, type FlowStatus } from "./flows";
import { ALL_LISTS, type ListDefinition } from "./lists";
import { ALL_SEGMENTS, type SegmentDefinition } from "./segments";
import {
  NURTURE_EMAIL_POSITIONS,
  CATEGORY_CONTENT,
  type CategoryContentInventory,
} from "./content-map";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LetterGrade = "A" | "B" | "C" | "D" | "F";

/** One row in the flow matrix for a collection */
export interface FlowMatrixItem {
  flowType: string;
  flowLabel: string;
  flowId: string | null; // null = no matching flow definition exists
  required: boolean; // whether this flow type applies to this collection
  status: FlowStatus | "missing"; // from the flow definition or "missing"
  emailCount: number;
  description: string;
  /** For quiz nurture: which of E1-E11 have content mapped */
  contentPositionsFilled: string[];
  contentPositionsTotal: string[];
}

/** Infrastructure items a collection needs */
export interface InfraItem {
  type: "list" | "segment";
  id: string | null;
  name: string;
  required: boolean;
  exists: boolean;
}

/** Per-collection grade report */
export interface CollectionReport {
  categoryCode: string;
  categoryName: string;
  category: Category;

  // Scores (0-100)
  flowCompletionScore: number; // % of applicable flows that are "built" or "live"
  contentCoverageScore: number; // % of nurture email positions with content
  infraScore: number; // % of required lists/segments defined
  overallScore: number; // weighted composite

  letterGrade: LetterGrade;

  // Breakdown
  flowMatrix: FlowMatrixItem[];
  infraItems: InfraItem[];
  contentInventory: CategoryContentInventory | null;

  // Counts
  totalFlows: number;
  completedFlows: number;
  missingFlows: number;
  draftFlows: number;
}

/** System-wide summary */
export interface SystemGradeReport {
  collections: CollectionReport[];
  overallScore: number;
  overallGrade: LetterGrade;
  totalFlowsNeeded: number;
  totalFlowsComplete: number;
  completionPercent: number;
}

// ---------------------------------------------------------------------------
// Flow Type Matrix — every collection gets graded against ALL of these
// ---------------------------------------------------------------------------

interface FlowTypeSpec {
  key: string;
  label: string;
  /** How to find the matching flow ID: "exact" uses a literal, "template"
   *  replaces {CAT} with the category code */
  idPattern: string;
  weight: number; // relative importance for scoring
  description: string;
}

const FLOW_MATRIX_SPEC: FlowTypeSpec[] = [
  {
    key: "welcome-popup",
    label: "Welcome Popup",
    idPattern: "F-ALL-Welcome-Popup",
    weight: 1,
    description: "3-email master welcome sequence",
  },
  {
    key: "quiz-nurture",
    label: "45-Day Quiz Nurture",
    idPattern: "F-{CAT}-Welcome-Quiz",
    weight: 3, // heaviest — this is the core collection flow
    description: "11-email, 45-day nurture after quiz completion",
  },
  {
    key: "browse-abandon",
    label: "Browse Abandonment",
    idPattern: "F-ALL-Browse-Abandon",
    weight: 1,
    description: "Re-engage product browsers",
  },
  {
    key: "cart-abandon",
    label: "Cart Abandonment",
    idPattern: "F-ALL-Cart-Abandon",
    weight: 2,
    description: "Tiered recovery by cart value",
  },
  {
    key: "checkout-abandon",
    label: "Checkout Abandonment",
    idPattern: "F-ALL-Checkout-Abandon",
    weight: 2,
    description: "Tiered recovery by checkout value",
  },
  {
    key: "post-purchase",
    label: "Post-Purchase",
    idPattern: "F-ALL-Post-Purchase",
    weight: 2,
    description: "Order journey: confirm → setup → review → upsell",
  },
  {
    key: "accessory-upsell",
    label: "Accessory Upsell",
    idPattern: "F-{CAT}-Accessory-Upsell",
    weight: 1,
    description: "30+ day post-purchase accessory push",
  },
  {
    key: "winback",
    label: "90-Day Winback",
    idPattern: "F-ALL-Winback-90",
    weight: 1,
    description: "Re-engage before churn",
  },
  {
    key: "vip-nurture",
    label: "VIP Nurture",
    idPattern: "F-ALL-VIP-Nurture",
    weight: 1,
    description: "White-glove treatment for high-value customers",
  },
  {
    key: "sunset",
    label: "Sunset / Cleanup",
    idPattern: "F-ALL-Sunset",
    weight: 0.5,
    description: "Unengaged subscriber cleanup",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveFlowId(pattern: string, catCode: string): string {
  return pattern.replace("{CAT}", catCode);
}

function findFlow(flowId: string): FlowDefinition | undefined {
  return ALL_FLOWS.find((f) => f.id === flowId);
}

function findList(idPrefix: string): ListDefinition | undefined {
  return ALL_LISTS.find((l) => l.id.startsWith(idPrefix));
}

function findSegment(idSubstring: string): SegmentDefinition | undefined {
  return ALL_SEGMENTS.find((s) => s.id.includes(idSubstring));
}

function scoreToGrade(score: number): LetterGrade {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

function isFlowComplete(status: FlowStatus | "missing"): boolean {
  return status === "built" || status === "live";
}

function isFlowInProgress(status: FlowStatus | "missing"): boolean {
  return status === "draft";
}

// Map category codes to the interest segment identifier fragment
const CAT_TO_INTEREST_SEGMENT: Record<string, string> = {
  SAU: "Saunas",
  CLD: "Cold-Plunges",
  RLT: "Red-Light",
  HYP: "Hyperbaric",
  H2O: "Hydrogen-Water",
  REC: "Recovery",
  // Categories without dedicated interest segments:
  HTR: "",
  ION: "",
  PIL: "",
  GYM: "",
  CRD: "",
  SPT: "",
  WEL: "",
  SDT: "",
};

// Map category codes to quiz list identifier fragment
const CAT_TO_QUIZ_LIST: Record<string, string> = {
  SAU: "Sauna-Finder",
  CLD: "Cold-Plunge",
  RLT: "Red-Light",
  HYP: "Hyperbaric",
  H2O: "",
  REC: "Recovery",
  PIL: "",
  GYM: "",
  ION: "",
  CRD: "",
  SPT: "",
  WEL: "",
  SDT: "",
  HTR: "",
};

// ---------------------------------------------------------------------------
// Core: Build a collection report
// ---------------------------------------------------------------------------

export function gradeCollection(catCode: string): CollectionReport {
  const category = CATEGORIES[catCode];
  if (!category) throw new Error(`Unknown category: ${catCode}`);

  // ── Flow Matrix ──────────────────────────────────────────────────────
  const flowMatrix: FlowMatrixItem[] = FLOW_MATRIX_SPEC.map((spec) => {
    const flowId = resolveFlowId(spec.idPattern, catCode);
    const flow = findFlow(flowId);
    const allNurturePositions = NURTURE_EMAIL_POSITIONS.map((p) => p.position);

    // Determine content coverage for quiz nurture flows
    let contentPositionsFilled: string[] = [];
    const contentPositionsTotal =
      spec.key === "quiz-nurture" ? allNurturePositions : [];

    if (spec.key === "quiz-nurture" && flow && flow.emails) {
      contentPositionsFilled = flow.emails.map((e) => e.position);
    }

    return {
      flowType: spec.key,
      flowLabel: spec.label,
      flowId: flow ? flow.id : null,
      required: true, // full matrix — every flow type applies
      status: flow ? flow.status : "missing",
      emailCount: flow ? flow.emailCount : 0,
      description: spec.description,
      contentPositionsFilled,
      contentPositionsTotal,
    };
  });

  // ── Infrastructure ──────────────────────────────────────────────────
  const infraItems: InfraItem[] = [];

  // Category subscriber list
  const catListId = `L-${catCode}-Subscribers`;
  const catList = findList(catListId);
  infraItems.push({
    type: "list",
    id: catList ? catList.id : null,
    name: `${category.name} Subscribers List`,
    required: true,
    exists: !!catList,
  });

  // Quiz list (if category has quiz)
  if (category.hasQuiz) {
    const quizKey = CAT_TO_QUIZ_LIST[catCode] || "";
    const quizList = quizKey
      ? ALL_LISTS.find((l) => l.id.includes(quizKey) && l.type === "quiz")
      : undefined;
    infraItems.push({
      type: "list",
      id: quizList ? quizList.id : null,
      name: `${category.name} Quiz Completers List`,
      required: true,
      exists: !!quizList,
    });
  }

  // Interest segment
  const intKey = CAT_TO_INTEREST_SEGMENT[catCode] || "";
  const intSegment = intKey
    ? ALL_SEGMENTS.find((s) => s.id.includes(intKey) && s.group === "interest")
    : undefined;
  infraItems.push({
    type: "segment",
    id: intSegment ? intSegment.id : null,
    name: `${category.name} Interest Segment`,
    required: true,
    exists: !!intSegment,
  });

  // Shared segments (count as infra for every collection)
  const sharedSegments = [
    { id: "S-HOT-Checkout-Abandon-7d", name: "Checkout Abandon Segment" },
    { id: "S-HOT-Cart-Abandon-7d", name: "Cart Abandon Segment" },
    { id: "S-CUST-First-Time", name: "First-Time Customer Segment" },
    { id: "S-CUST-VIP", name: "VIP Customer Segment" },
  ];
  sharedSegments.forEach((ss) => {
    const seg = ALL_SEGMENTS.find((s) => s.id === ss.id);
    infraItems.push({
      type: "segment",
      id: seg ? seg.id : null,
      name: ss.name,
      required: true,
      exists: !!seg,
    });
  });

  // ── Scoring ─────────────────────────────────────────────────────────

  // Flow completion: weighted by spec.weight
  let weightedComplete = 0;
  let weightedTotal = 0;
  flowMatrix.forEach((item, i) => {
    const w = FLOW_MATRIX_SPEC[i].weight;
    weightedTotal += w;
    if (isFlowComplete(item.status)) {
      weightedComplete += w;
    } else if (isFlowInProgress(item.status)) {
      weightedComplete += w * 0.3; // partial credit for drafts
    }
  });
  const flowCompletionScore =
    weightedTotal > 0
      ? Math.round((weightedComplete / weightedTotal) * 100)
      : 0;

  // Content coverage: for quiz nurture, how many of E1-E11 are filled
  const quizRow = flowMatrix.find((f) => f.flowType === "quiz-nurture");
  let contentCoverageScore = 0;
  if (quizRow && quizRow.contentPositionsTotal.length > 0) {
    contentCoverageScore = Math.round(
      (quizRow.contentPositionsFilled.length /
        quizRow.contentPositionsTotal.length) *
        100
    );
  }

  // Infra: % of required items that exist
  const requiredInfra = infraItems.filter((i) => i.required);
  const existingInfra = requiredInfra.filter((i) => i.exists);
  const infraScore =
    requiredInfra.length > 0
      ? Math.round((existingInfra.length / requiredInfra.length) * 100)
      : 0;

  // Composite: 50% flows, 30% content, 20% infra
  const overallScore = Math.round(
    flowCompletionScore * 0.5 +
      contentCoverageScore * 0.3 +
      infraScore * 0.2
  );

  // Counts
  const completedFlows = flowMatrix.filter((f) =>
    isFlowComplete(f.status)
  ).length;
  const missingFlows = flowMatrix.filter((f) => f.status === "missing").length;
  const draftFlows = flowMatrix.filter((f) =>
    isFlowInProgress(f.status)
  ).length;

  // Content inventory
  const contentInventory =
    CATEGORY_CONTENT.find((c) => c.categoryCode === catCode) || null;

  return {
    categoryCode: catCode,
    categoryName: category.name,
    category,
    flowCompletionScore,
    contentCoverageScore,
    infraScore,
    overallScore,
    letterGrade: scoreToGrade(overallScore),
    flowMatrix,
    infraItems,
    contentInventory,
    totalFlows: flowMatrix.length,
    completedFlows,
    missingFlows,
    draftFlows,
  };
}

// ---------------------------------------------------------------------------
// System-wide grade
// ---------------------------------------------------------------------------

export function gradeAllCollections(): SystemGradeReport {
  const codes = Object.keys(CATEGORIES);
  const collections = codes.map((code) => gradeCollection(code));

  const totalFlowsNeeded = collections.reduce(
    (sum, c) => sum + c.totalFlows,
    0
  );
  const totalFlowsComplete = collections.reduce(
    (sum, c) => sum + c.completedFlows,
    0
  );
  const completionPercent =
    totalFlowsNeeded > 0
      ? Math.round((totalFlowsComplete / totalFlowsNeeded) * 100)
      : 0;

  const overallScore =
    collections.length > 0
      ? Math.round(
          collections.reduce((sum, c) => sum + c.overallScore, 0) /
            collections.length
        )
      : 0;

  return {
    collections,
    overallScore,
    overallGrade: scoreToGrade(overallScore),
    totalFlowsNeeded,
    totalFlowsComplete,
    completionPercent,
  };
}

// ---------------------------------------------------------------------------
// localStorage persistence for manual status overrides
// ---------------------------------------------------------------------------

const OVERRIDES_KEY = "ppw-collection-hub-overrides";

export interface FlowStatusOverride {
  flowId: string;
  status: FlowStatus;
  updatedAt: string;
}

export function loadOverrides(): FlowStatusOverride[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOverride(flowId: string, status: FlowStatus): void {
  if (typeof window === "undefined") return;
  const overrides = loadOverrides();
  const existing = overrides.find((o) => o.flowId === flowId);
  if (existing) {
    existing.status = status;
    existing.updatedAt = new Date().toISOString();
  } else {
    overrides.push({
      flowId,
      status,
      updatedAt: new Date().toISOString(),
    });
  }
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
}

/**
 * Re-grade a collection applying any localStorage overrides to flow statuses.
 * This lets users manually mark flows as built/live from the UI.
 */
export function gradeCollectionWithOverrides(catCode: string): CollectionReport {
  const report = gradeCollection(catCode);
  const overrides = loadOverrides();

  if (overrides.length === 0) return report;

  // Apply overrides
  report.flowMatrix.forEach((item) => {
    if (!item.flowId) return;
    const override = overrides.find((o) => o.flowId === item.flowId);
    if (override) {
      item.status = override.status;
    }
  });

  // Recalculate scores
  let weightedComplete = 0;
  let weightedTotal = 0;
  report.flowMatrix.forEach((item, i) => {
    const w = FLOW_MATRIX_SPEC[i].weight;
    weightedTotal += w;
    if (isFlowComplete(item.status)) {
      weightedComplete += w;
    } else if (isFlowInProgress(item.status)) {
      weightedComplete += w * 0.3;
    }
  });
  report.flowCompletionScore =
    weightedTotal > 0
      ? Math.round((weightedComplete / weightedTotal) * 100)
      : 0;
  report.completedFlows = report.flowMatrix.filter((f) =>
    isFlowComplete(f.status)
  ).length;
  report.draftFlows = report.flowMatrix.filter((f) =>
    isFlowInProgress(f.status)
  ).length;
  report.missingFlows = report.flowMatrix.filter(
    (f) => f.status === "missing"
  ).length;

  report.overallScore = Math.round(
    report.flowCompletionScore * 0.5 +
      report.contentCoverageScore * 0.3 +
      report.infraScore * 0.2
  );
  report.letterGrade = scoreToGrade(report.overallScore);

  return report;
}
