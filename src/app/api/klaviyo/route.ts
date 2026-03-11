// ============================================================================
// API: /api/klaviyo
// Returns the current Klaviyo state snapshot — live data with auto-classification.
// Phase 2: Powered by live Klaviyo API pull + auto-classification engine.
//
// GET /api/klaviyo                → full state
// GET /api/klaviyo?section=flows  → flows only
// GET /api/klaviyo?section=lists  → lists only
// GET /api/klaviyo?section=segments
// GET /api/klaviyo?section=quizzes
// GET /api/klaviyo?section=metrics
// GET /api/klaviyo?section=summary → compact summary for dashboards
// ============================================================================

import { NextResponse } from "next/server";
import {
  LIVE_FLOWS,
  LIVE_LISTS,
  LIVE_SEGMENTS,
  QUIZ_METRICS,
  KEY_METRICS,
  KLAVIYO_SNAPSHOT,
  getFlowsByCategory,
  getFlowsByStatus,
  getListsByCategory,
} from "@/framework/klaviyo-state";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section");
  const categoryFilter = searchParams.get("category");

  try {
    // ---- Section-specific queries ----
    if (section) {
      switch (section) {
        case "flows": {
          const flows = categoryFilter
            ? getFlowsByCategory(categoryFilter.toUpperCase())
            : LIVE_FLOWS;
          return NextResponse.json({
            flows,
            count: flows.length,
            live: flows.filter((f) => f.status === "live").length,
            draft: flows.filter((f) => f.status === "draft").length,
            snapshot: KLAVIYO_SNAPSHOT,
          });
        }
        case "lists": {
          const lists = categoryFilter
            ? getListsByCategory(categoryFilter.toUpperCase())
            : LIVE_LISTS;
          return NextResponse.json({
            lists,
            count: lists.length,
            snapshot: KLAVIYO_SNAPSHOT,
          });
        }
        case "segments":
          return NextResponse.json({
            segments: LIVE_SEGMENTS,
            count: LIVE_SEGMENTS.length,
            snapshot: KLAVIYO_SNAPSHOT,
          });
        case "quizzes":
          return NextResponse.json({
            quizzes: QUIZ_METRICS,
            count: QUIZ_METRICS.length,
            snapshot: KLAVIYO_SNAPSHOT,
          });
        case "metrics":
          return NextResponse.json({
            metrics: KEY_METRICS,
            count: KEY_METRICS.length,
            snapshot: KLAVIYO_SNAPSHOT,
          });
        case "summary":
          return NextResponse.json({
            snapshot: KLAVIYO_SNAPSHOT,
            flowsByStatus: {
              live: getFlowsByStatus("live").length,
              draft: getFlowsByStatus("draft").length,
              manual: getFlowsByStatus("manual").length,
              paused: getFlowsByStatus("paused").length,
            },
            categoryCoverage: {
              flowsWithCategory: LIVE_FLOWS.filter((f) => f.categoryCode).length,
              flowsUncategorized: LIVE_FLOWS.filter((f) => !f.categoryCode).length,
              listsWithCategory: LIVE_LISTS.filter((l) => l.categoryCode).length,
              listsUncategorized: LIVE_LISTS.filter((l) => !l.categoryCode).length,
            },
          });
        default:
          return NextResponse.json(
            { error: `Unknown section: ${section}. Valid: flows, lists, segments, quizzes, metrics, summary` },
            { status: 400 }
          );
      }
    }

    // ---- Full state ----
    return NextResponse.json({
      snapshot: KLAVIYO_SNAPSHOT,
      flows: {
        data: LIVE_FLOWS,
        total: LIVE_FLOWS.length,
        live: LIVE_FLOWS.filter((f) => f.status === "live").length,
        draft: LIVE_FLOWS.filter((f) => f.status === "draft").length,
      },
      lists: {
        data: LIVE_LISTS,
        total: LIVE_LISTS.length,
      },
      segments: {
        data: LIVE_SEGMENTS,
        total: LIVE_SEGMENTS.length,
      },
      quizzes: {
        data: QUIZ_METRICS,
        total: QUIZ_METRICS.length,
      },
      metrics: {
        data: KEY_METRICS,
        total: KEY_METRICS.length,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
