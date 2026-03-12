// ============================================================================
// PPW Email Engine — Template Push Store (localStorage)
// Persists push records so the UI can track which templates have been
// pushed to Klaviyo, their IDs, and whether they've been marked as live.
// ============================================================================

export type PushRecordStatus = "pushed" | "live" | "error";

export interface StoredPushRecord {
  /** PPW template name: T-[CAT]-Nurture-[E#] */
  templateName: string;
  /** Category code */
  categoryCode: string;
  /** Position in nurture flow (E1–E11) */
  position: string;
  /** Email subject line */
  subject: string;
  /** Klaviyo template ID */
  klaviyoTemplateId: string;
  /** Klaviyo edit URL */
  editUrl: string;
  /** Whether the flow is fully live in Klaviyo */
  status: PushRecordStatus;
  /** When the template was pushed */
  pushedAt: string;
  /** When the flow was marked live (if applicable) */
  markedLiveAt?: string;
}

const STORAGE_KEY = "ppw-template-pushes";

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export function loadPushRecords(): StoredPushRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePushRecord(record: StoredPushRecord): void {
  if (typeof window === "undefined") return;
  const records = loadPushRecords();
  const idx = records.findIndex(
    (r) =>
      r.categoryCode === record.categoryCode &&
      r.position === record.position
  );
  if (idx >= 0) {
    records[idx] = record;
  } else {
    records.push(record);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function getPushRecord(
  categoryCode: string,
  position: string
): StoredPushRecord | undefined {
  return loadPushRecords().find(
    (r) => r.categoryCode === categoryCode && r.position === position
  );
}

export function markPushRecordLive(
  categoryCode: string,
  position: string
): void {
  const records = loadPushRecords();
  const record = records.find(
    (r) => r.categoryCode === categoryCode && r.position === position
  );
  if (record) {
    record.status = "live";
    record.markedLiveAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function getCategoryPushSummary(categoryCode: string) {
  const records = loadPushRecords().filter(
    (r) => r.categoryCode === categoryCode
  );
  return {
    total: records.length,
    pushed: records.filter((r) => r.status === "pushed").length,
    live: records.filter((r) => r.status === "live").length,
    records,
  };
}

export function getAllPushSummary() {
  const records = loadPushRecords();
  return {
    total: records.length,
    pushed: records.filter((r) => r.status === "pushed").length,
    live: records.filter((r) => r.status === "live").length,
  };
}
