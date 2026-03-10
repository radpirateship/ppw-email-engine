// ============================================================================
// API: /api/klaviyo
// Returns the current Klaviyo state snapshot.
// Phase 1: static snapshot from klaviyo-state.ts
// Phase 2: will call Klaviyo API for real-time data
// ============================================================================

import { NextResponse } from "next/server";
import {
  LIVE_FLOWS,
  LIVE_LISTS,
  LIVE_SEGMENTS,
  QUIZ_METRICS,
  KLAVIYO_SNAPSHOT,
} from "@/framework/klaviyo-state";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section");

  try {
    // Return specific section if requested
    if (section) {
      switch (section) {
        case "flows":
          return NextResponse.json({
            flows: LIVE_FLOWS,
            count: LIVE_FLOWS.length,
            snapshot: KLAVIYO_SNAPSHOT,
          });
        case "lists":
          return NextResponse.json({
            lists: LIVE_LISTS,
            count: LIVE_LISTS.length,
            snapshot: KLAVIYO_SNAPSHOT,
          });
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
        default:
          return NextResponse.json(
            { error: `Unknown section: ${section}. Valid: flows, lists, segments, quizzes` },
            { status: 400 }
          );
      }
    }

    // Return everything
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
      generatedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
        }
