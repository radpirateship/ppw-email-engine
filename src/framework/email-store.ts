// ============================================================================
// PPW Email Engine — Generated Email Persistence (localStorage)
// Saves and loads generated emails so they survive page refreshes.
// ============================================================================

const STORAGE_KEY = "ppw-generated-emails";

export interface StoredEmailSet {
  flowTypeId: string;
  categoryCode: string;
  emails: StoredEmail[];
  editedSubjects: Record<string, string>;
  editedPreviews: Record<string, string>;
  editedHtml: Record<string, string>;
  editedPlainText: Record<string, string>;
  savedAt: string;
}

export interface StoredEmail {
  subject: string;
  previewText: string;
  htmlBody: string;
  plainText: string;
  position: string;
  day: number;
  categoryCode: string;
  categoryName: string;
  purpose: string;
  templateName: string;
  generatedAt?: string;
  variationSeed?: number;
  isAI: boolean;
}

/**
 * Build a unique storage key from flow type + category.
 * e.g. "quiz-nurture::SAU" or "cart-abandon::ALL"
 */
function buildKey(flowTypeId: string, categoryCode: string): string {
  return `${flowTypeId}::${categoryCode}`;
}

/**
 * Load all stored email sets from localStorage.
 */
export function loadAllEmailSets(): Record<string, StoredEmailSet> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Load a specific email set by flow type and category.
 */
export function loadEmailSet(
  flowTypeId: string,
  categoryCode: string
): StoredEmailSet | null {
  const all = loadAllEmailSets();
  return all[buildKey(flowTypeId, categoryCode)] ?? null;
}

/**
 * Save an email set to localStorage.
 */
export function saveEmailSet(
  flowTypeId: string,
  categoryCode: string,
  data: Omit<StoredEmailSet, "savedAt">
): void {
  if (typeof window === "undefined") return;
  try {
    const all = loadAllEmailSets();
    const key = buildKey(flowTypeId, categoryCode);
    all[key] = {
      ...data,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.error("Failed to save email set:", e);
  }
}

/**
 * Delete a specific email set.
 */
export function deleteEmailSet(
  flowTypeId: string,
  categoryCode: string
): void {
  if (typeof window === "undefined") return;
  try {
    const all = loadAllEmailSets();
    delete all[buildKey(flowTypeId, categoryCode)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

/**
 * Get a summary of all saved email sets (for display).
 */
export function getSavedEmailSummary(): Array<{
  flowTypeId: string;
  categoryCode: string;
  emailCount: number;
  savedAt: string;
}> {
  const all = loadAllEmailSets();
  return Object.entries(all).map(([key, set]) => {
    const [flowTypeId, categoryCode] = key.split("::");
    return {
      flowTypeId,
      categoryCode,
      emailCount: set.emails.length,
      savedAt: set.savedAt,
    };
  });
}
