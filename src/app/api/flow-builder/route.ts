// ============================================================================
// PPW Email Engine — Flow Builder API
// GET /api/flow-builder
// GET /api/flow-builder?category=SAU
// ============================================================================

import { NextResponse } from "next/server";
import {
  buildFlowDashboard,
  buildFlowDashboardSummary,
  getFlowsForProductCategory,
} from "@/framework/flow-dashboard";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    if (category) {
      const flows = getFlowsForProductCategory(category.toUpperCase());
      if (flows.length === 0) {
        return NextResponse.json(
          { error: `No flows found for category '${category.toUpperCase()}'.` },
          { status: 404 }
        );
      }
      return NextResponse.json({
        category: category.toUpperCase(),
        flows: flows.map((e) => ({
          id: e.flow.id,
          name: e.flow.name,
          category: e.flow.category,
          status: e.effectiveStatus,
          emailCount: e.flow.emailCount,
          trigger: e.flow.trigger,
          tieredByPrice: e.flow.tieredByPrice,
          description: e.flow.description,
          klaviyoMatches: e.klaviyoMatches.length,
          emails: e.flow.emails ?? null,
        })),
      });
    }

    // Full dashboard
    const entries = buildFlowDashboard();
    const summary = buildFlowDashboardSummary();

    return NextResponse.json({
      summary,
      flows: entries.map((e) => ({
        id: e.flow.id,
        name: e.flow.name,
        flowCategory: e.flow.category,
        productCategory: e.categoryCode,
        status: e.effectiveStatus,
        emailCount: e.flow.emailCount,
        trigger: e.flow.trigger,
        tieredByPrice: e.flow.tieredByPrice,
        description: e.flow.description,
        klaviyoMatches: e.klaviyoMatches.length,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}
