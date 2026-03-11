// ============================================================================
// PPW Email Engine — Template Push Orchestration
// Bridges the email template generator with Klaviyo template management.
// Tracks generated templates, their push status, and Klaviyo template IDs.
// ============================================================================

import { CATEGORIES, CATEGORY_CODES } from "./categories";
import { NURTURE_EMAIL_POSITIONS } from "./content-map";
import {
  generateEmailTemplate,
  generateAllTemplatesForCategory,
  type EmailTemplate,
} from "./email-templates";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TemplatePushStatus = "not_generated" | "generated" | "pushed" | "error";

export interface TemplatePushRecord {
  /** PPW template name: T-[CAT]-Nurture-[E#] */
  templateName: string;
  /** Category code */
  categoryCode: string;
  /** Category display name */
  categoryName: string;
  /** Position in nurture flow (E1–E11) */
  position: string;
  /** Day in the 45-day sequence */
  day: number;
  /** Email subject line */
  subject: string;
  /** Current push status */
  status: TemplatePushStatus;
  /** Klaviyo template ID (set after push) */
  klaviyoTemplateId?: string;
  /** Push timestamp */
  pushedAt?: string;
  /** Error message if push failed */
  error?: string;
  /** Purpose description */
  purpose: string;
}

export interface CategoryTemplateInventory {
  /** Category code */
  code: string;
  /** Category name */
  name: string;
  /** Whether this category has a quiz flow */
  hasQuiz: boolean;
  /** Total templates expected (11 for quiz categories) */
  totalExpected: number;
  /** Number of templates generated */
  generated: number;
  /** Number of templates pushed to Klaviyo */
  pushed: number;
  /** Number with errors */
  errors: number;
  /** Completion percentage */
  completionPct: number;
  /** Individual template records */
  templates: TemplatePushRecord[];
}

export interface TemplateInventorySummary {
  /** Total templates across all categories */
  totalTemplates: number;
  /** Total generated */
  totalGenerated: number;
  /** Total pushed to Klaviyo */
  totalPushed: number;
  /** Total with errors */
  totalErrors: number;
  /** Overall completion percentage */
  overallCompletionPct: number;
  /** Per-category inventory */
  categories: CategoryTemplateInventory[];
  /** Categories with quiz flows (primary template targets) */
  quizCategoryCount: number;
  /** Categories without quiz flows */
  nonQuizCategoryCount: number;
  /** Generated at timestamp */
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Template inventory builder
// ---------------------------------------------------------------------------

/**
 * Build a complete template inventory for a single category.
 * Generates templates on-the-fly and tracks their status.
 */
export function buildCategoryTemplateInventory(
  categoryCode: string,
  pushedTemplates?: Map<string, { klaviyoId: string; pushedAt: string }>
): CategoryTemplateInventory | null {
  const cat = CATEGORIES[categoryCode as keyof typeof CATEGORIES];
  if (!cat) return null;

  const positions = NURTURE_EMAIL_POSITIONS;
  const templates: TemplatePushRecord[] = [];

  for (const pos of positions) {
    const template = generateEmailTemplate(categoryCode, pos.position);

    if (template) {
      const pushInfo = pushedTemplates?.get(template.templateName);

      templates.push({
        templateName: template.templateName,
        categoryCode,
        categoryName: cat.name,
        position: pos.position,
        day: pos.day,
        subject: template.subject,
        status: pushInfo ? "pushed" : "generated",
        klaviyoTemplateId: pushInfo?.klaviyoId,
        pushedAt: pushInfo?.pushedAt,
        purpose: template.purpose,
      });
    }
  }

  const generated = templates.filter((t) => t.status !== "not_generated").length;
  const pushed = templates.filter((t) => t.status === "pushed").length;
  const errors = templates.filter((t) => t.status === "error").length;
  const totalExpected = positions.length;

  return {
    code: categoryCode,
    name: cat.name,
    hasQuiz: cat.hasQuiz,
    totalExpected,
    generated,
    pushed,
    errors,
    completionPct: totalExpected > 0 ? Math.round((pushed / totalExpected) * 100) : 0,
    templates,
  };
}

/**
 * Build a full inventory summary across all categories.
 */
export function buildTemplateInventory(
  pushedTemplates?: Map<string, { klaviyoId: string; pushedAt: string }>
): TemplateInventorySummary {
  const categories: CategoryTemplateInventory[] = [];

  for (const code of CATEGORY_CODES) {
    const inv = buildCategoryTemplateInventory(code as string, pushedTemplates);
    if (inv) categories.push(inv);
  }

  const totalTemplates = categories.reduce((s, c) => s + c.totalExpected, 0);
  const totalGenerated = categories.reduce((s, c) => s + c.generated, 0);
  const totalPushed = categories.reduce((s, c) => s + c.pushed, 0);
  const totalErrors = categories.reduce((s, c) => s + c.errors, 0);

  return {
    totalTemplates,
    totalGenerated,
    totalPushed,
    totalErrors,
    overallCompletionPct: totalTemplates > 0
      ? Math.round((totalPushed / totalTemplates) * 100)
      : 0,
    categories,
    quizCategoryCount: categories.filter((c) => c.hasQuiz).length,
    nonQuizCategoryCount: categories.filter((c) => !c.hasQuiz).length,
    generatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Push preparation — formats templates for Klaviyo API
// ---------------------------------------------------------------------------

export interface KlaviyoPushPayload {
  /** Template name for Klaviyo */
  name: string;
  /** Full HTML body */
  html: string;
  /** Category code for tracking */
  categoryCode: string;
  /** Position for tracking */
  position: string;
  /** PPW template name */
  templateName: string;
}

/**
 * Prepare a single template for push to Klaviyo.
 * Returns the payload needed by the Klaviyo create_email_template tool.
 */
export function prepareTemplatePush(
  categoryCode: string,
  position: string
): KlaviyoPushPayload | null {
  const template = generateEmailTemplate(categoryCode, position);
  if (!template) return null;

  return {
    name: template.templateName,
    html: template.htmlBody,
    categoryCode,
    position,
    templateName: template.templateName,
  };
}

/**
 * Prepare all templates for a category for push to Klaviyo.
 */
export function prepareAllPushesForCategory(
  categoryCode: string
): KlaviyoPushPayload[] {
  const templates = generateAllTemplatesForCategory(categoryCode);

  return templates.map((t) => ({
    name: t.templateName,
    html: t.htmlBody,
    categoryCode,
    position: t.position,
    templateName: t.templateName,
  }));
}

/**
 * Prepare all templates across all categories for push.
 * Optionally filter to only quiz categories.
 */
export function prepareFullPushQueue(
  options?: { quizCategoriesOnly?: boolean }
): KlaviyoPushPayload[] {
  const codes = options?.quizCategoriesOnly
    ? CATEGORY_CODES.filter((c) => CATEGORIES[c].hasQuiz)
    : CATEGORY_CODES;

  const payloads: KlaviyoPushPayload[] = [];

  for (const code of codes) {
    const catPayloads = prepareAllPushesForCategory(code as string);
    payloads.push(...catPayloads);
  }

  return payloads;
}

// ---------------------------------------------------------------------------
// Push result tracking
// ---------------------------------------------------------------------------

export interface PushResult {
  templateName: string;
  success: boolean;
  klaviyoTemplateId?: string;
  error?: string;
  pushedAt: string;
}

export interface BatchPushSummary {
  total: number;
  succeeded: number;
  failed: number;
  results: PushResult[];
  startedAt: string;
  completedAt: string;
}

/**
 * Create an empty batch push summary for tracking push operations.
 */
export function createBatchPushSummary(): BatchPushSummary {
  const now = new Date().toISOString();
  return {
    total: 0,
    succeeded: 0,
    failed: 0,
    results: [],
    startedAt: now,
    completedAt: now,
  };
}

/**
 * Record a push result into a batch summary.
 */
export function recordPushResult(
  summary: BatchPushSummary,
  result: PushResult
): BatchPushSummary {
  return {
    ...summary,
    total: summary.total + 1,
    succeeded: result.success ? summary.succeeded + 1 : summary.succeeded,
    failed: result.success ? summary.failed : summary.failed + 1,
    results: [...summary.results, result],
    completedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Template preview helpers
// ---------------------------------------------------------------------------

/**
 * Get a compact preview of a template (without full HTML).
 */
export function getTemplatePreview(
  categoryCode: string,
  position: string
): {
  templateName: string;
  position: string;
  subject: string;
  previewText: string;
  purpose: string;
  day: number;
  variableCount: number;
  conditionalCount: number;
  htmlLength: number;
} | null {
  const template = generateEmailTemplate(categoryCode, position);
  if (!template) return null;

  return {
    templateName: template.templateName,
    position: template.position,
    subject: template.subject,
    previewText: template.previewText,
    purpose: template.purpose,
    day: template.day,
    variableCount: template.variables.length,
    conditionalCount: template.conditionals.length,
    htmlLength: template.htmlBody.length,
  };
}

/**
 * Get all template previews for a category.
 */
export function getCategoryTemplatePreviews(categoryCode: string) {
  return NURTURE_EMAIL_POSITIONS.map((pos) =>
    getTemplatePreview(categoryCode, pos.position)
  ).filter((p): p is NonNullable<typeof p> => p !== null);
}
