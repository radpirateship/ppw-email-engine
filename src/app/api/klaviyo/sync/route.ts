// ============================================================================
// API: /api/klaviyo/sync
// GET  → Returns sync status and delta comparison between live Klaviyo data
//        and the static snapshot in klaviyo-state.ts
// POST → Reserved for future: trigger a live refresh from Klaviyo API
// ============================================================================

import { NextResponse } from "next/server";
import {
  LIVE_FLOWS,
  LIVE_LISTS,
  LIVE_SEGMENTS,
  KEY_METRICS,
  QUIZ_METRICS,
  KLAVIYO_SNAPSHOT,
  type KlaviyoFlow,
  type KlaviyoList,
} from "@/framework/klaviyo-state";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface SyncDelta {
  flows: {
    total: number;
    live: number;
    draft: number;
    categorized: number;
    uncategorized: number;
    byCategory: Record<string, number>;
    byFlowType: Record<string, number>;
    uncategorizedFlows: Array<{ id: string; name: string }>;
  };
  lists: {
    total: number;
    categorized: number;
    uncategorized: number;
    byType: Record<string, number>;
    uncategorizedLists: Array<{ id: string; name: string }>;
  };
  segments: {
    total: number;
    active: number;
    byGroup: Record<string, number>;
  };
  metrics: {
    total: number;
    byCategory: Record<string, number>;
  };
  quizzes: {
    total: number;
  };
  health: {
    score: number; // 0-100
    issues: string[];
  };
}

function countBy<T>(arr: T[], key: (item: T) => string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of arr) {
    const k = key(item) || "uncategorized";
    out[k] = (out[k] || 0) + 1;
  }
  return out;
}

function computeHealthScore(delta: Omit<SyncDelta, "health">): { score: number; issues: string[] } {
  let score = 100;
  const issues: string[] = [];

  // Penalise uncategorized flows
  const uncatFlowPct = delta.flows.uncategorized / Math.max(delta.flows.total, 1);
  if (uncatFlowPct > 0.3) {
    score -= 20;
    issues.push(`${delta.flows.uncategorized} of ${delta.flows.total} flows are uncategorized (${Math.round(uncatFlowPct * 100)}%)`);
  } else if (uncatFlowPct > 0.1) {
    score -= 10;
    issues.push(`${delta.flows.uncategorized} flows uncategorized`);
  }

  // Penalise uncategorized lists
  const uncatListPct = delta.lists.uncategorized / Math.max(delta.lists.total, 1);
  if (uncatListPct > 0.3) {
    score -= 15;
    issues.push(`${delta.lists.uncategorized} of ${delta.lists.total} lists are uncategorized`);
  } else if (uncatListPct > 0.1) {
    score -= 5;
    issues.push(`${delta.lists.uncategorized} lists uncategorized`);
  }

  // Penalise low live ratio
  const liveRatio = delta.flows.live / Math.max(delta.flows.total, 1);
  if (liveRatio < 0.5) {
    score -= 10;
    issues.push(`Only ${Math.round(liveRatio * 100)}% of flows are live`);
  }

  // Bonus for quizzes
  if (delta.quizzes.total >= 5) {
    score = Math.min(100, score + 5);
  }

  return { score: Math.max(0, score), issues };
}

// ---------------------------------------------------------------------------
// GET handler
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const flowsByCategory = countBy(LIVE_FLOWS, (f) => f.categoryCode || "");
    const flowsByType = countBy(LIVE_FLOWS, (f) => f.flowType);
    const listsByType = countBy(LIVE_LISTS, (l) => l.listType);
    const segmentsByGroup = countBy(LIVE_SEGMENTS, (s) => s.segmentGroup);
    const metricsByCategory = countBy(KEY_METRICS, (m) => m.category);

    const uncategorizedFlows = LIVE_FLOWS
      .filter((f) => !f.categoryCode)
      .map((f) => ({ id: f.id, name: f.name }));

    const uncategorizedLists = LIVE_LISTS
      .filter((l) => !l.categoryCode)
      .map((l) => ({ id: l.id, name: l.name }));

    const baseDelta = {
      flows: {
        total: LIVE_FLOWS.length,
        live: LIVE_FLOWS.filter((f) => f.status === "live").length,
        draft: LIVE_FLOWS.filter((f) => f.status === "draft").length,
        categorized: LIVE_FLOWS.filter((f) => f.categoryCode).length,
        uncategorized: uncategorizedFlows.length,
        byCategory: flowsByCategory,
        byFlowType: flowsByType,
        uncategorizedFlows,
      },
      lists: {
        total: LIVE_LISTS.length,
        categorized: LIVE_LISTS.filter((l) => l.categoryCode).length,
        uncategorized: uncategorizedLists.length,
        byType: listsByType,
        uncategorizedLists,
      },
      segments: {
        total: LIVE_SEGMENTS.length,
        active: LIVE_SEGMENTS.filter((s) => s.isActive).length,
        byGroup: segmentsByGroup,
      },
      metrics: {
        total: KEY_METRICS.length,
        byCategory: metricsByCategory,
      },
      quizzes: {
        total: QUIZ_METRICS.length,
      },
    };

    const health = computeHealthScore(baseDelta);
    const delta: SyncDelta = { ...baseDelta, health };

    return NextResponse.json({
      status: "ok",
      snapshot: KLAVIYO_SNAPSHOT,
      delta,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST handler — reserved for live refresh
// ---------------------------------------------------------------------------

export async function POST() {
  return NextResponse.json(
    {
      error: "Live refresh not yet implemented. Coming in Chunk 2 (Delta Dashboard).",
      hint: "This will call Klaviyo API in real-time and rebuild the state.",
    },
    { status: 501 }
  );
}
