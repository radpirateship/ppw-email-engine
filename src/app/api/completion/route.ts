// ============================================================================
// API: /api/completion
// Returns category completion scores from the framework scoring engine.
// ============================================================================

import { NextResponse } from "next/server";
import {
  computeAllCompletions,
  computeOverallReadiness,
} from "@/framework/completion";
import { CATEGORIES } from "@/framework/categories";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  try {
    if (code) {
      // Single category
      const upperCode = code.toUpperCase();
      if (!CATEGORIES[upperCode]) {
        return NextResponse.json(
          { error: `Unknown category: ${upperCode}` },
          { status: 404 }
        );
      }
      const completions = computeAllCompletions();
      const match = completions.find((c) => c.code === upperCode);
      return NextResponse.json({ category: match });
    }

    // All categories
    const completions = computeAllCompletions();
    const readiness = computeOverallReadiness(completions);

    return NextResponse.json({
      completions,
      readiness,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
          }
