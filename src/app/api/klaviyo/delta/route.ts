// ============================================================================
// API: /api/klaviyo/delta
// GET → Returns full delta analysis between framework and live Klaviyo state
// ============================================================================

import { NextResponse } from "next/server";
import { buildDeltaSummary } from "@/framework/klaviyo-delta";

export async function GET() {
  try {
    const delta = buildDeltaSummary();

    // Serialisable summary (strip KlaviyoFlow objects for JSON brevity)
    const serialised = {
      averageReadiness: delta.averageReadiness,
      categories: delta.categories.map((c) => ({
        code: c.code,
        name: c.name,
        readiness: c.readiness,
        plannedFlows: c.plannedFlows,
        liveFlows: c.liveKlaviyoFlows.length,
        draftFlows: c.draftKlaviyoFlows.length,
        lists: c.lists.length,
        hasWelcome: c.hasWelcome,
        hasBrowseAbandon: c.hasBrowseAbandon,
        hasCartOrCheckout: c.hasCartOrCheckout,
        hasPostPurchase: c.hasPostPurchase,
        hasEmailList: c.hasEmailList,
        hasSMSList: c.hasSMSList,
        hasContent: c.hasContent,
        hasQuiz: c.hasQuiz,
        flowTypeCoverage: c.flowTypeCoverage,
        missingFlowTypes: c.missingFlowTypes,
      })),
      topCategories: delta.topCategories.map((c) => ({
        code: c.code,
        name: c.name,
        readiness: c.readiness,
      })),
      bottomCategories: delta.bottomCategories.map((c) => ({
        code: c.code,
        name: c.name,
        readiness: c.readiness,
      })),
      orphanedFlows: delta.orphanedFlows,
      orphanedLists: delta.orphanedLists,
      missingFromKlaviyo: delta.missingFromKlaviyo.map((f) => ({
        id: f.id,
        name: f.name,
        category: f.category,
        status: f.status,
      })),
      gaps: delta.gaps,
      snapshot: delta.snapshot,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ status: "ok", delta: serialised });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
