// ============================================================================
// PPW Email Engine — Content-to-Email Pipeline API
// POST /api/pipeline — Classify content and map to nurture flow positions
// ============================================================================

import { NextResponse } from "next/server";
import {
  classifyBatch,
  mapContentToPositions,
  type ContentInput,
} from "@/framework/classifier";

interface PipelineRequest {
  /** Array of content items to classify */
  items: ContentInput[];
  /** Optional category filter code (e.g. "SAU") */
  categoryFilter?: string;
}

export async function POST(request: Request) {
  try {
    const body: PipelineRequest = await request.json();

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "Request must include a non-empty 'items' array with at least a 'title' field per item." },
        { status: 400 }
      );
    }

    // Validate each item has a title
    for (const item of body.items) {
      if (!item.title || typeof item.title !== "string") {
        return NextResponse.json(
          { error: "Each item must have a 'title' string field." },
          { status: 400 }
        );
      }
    }

    // Classify
    const classified = classifyBatch(body.items);

    // Map to positions
    const positionMap = mapContentToPositions(
      classified,
      body.categoryFilter && body.categoryFilter !== "ALL"
        ? body.categoryFilter
        : undefined
    );

    // Summary stats
    const filledPositions = positionMap.filter((p) => p.isFilled).length;
    const totalPositions = positionMap.length;
    const uniqueCategories = Array.from(
      new Set(classified.flatMap((c) => c.categories))
    );

    return NextResponse.json({
      classified: classified.map((c) => ({
        title: c.input.title,
        url: c.input.url,
        contentType: c.contentType,
        confidence: c.confidence,
        categories: c.categories,
        positions: c.positions.map((p) => ({
          position: p.position,
          day: p.day,
          purpose: p.purpose,
        })),
        matchedKeywords: c.matchedKeywords,
      })),
      positionMap: positionMap.map((p) => ({
        position: p.position,
        day: p.day,
        purpose: p.purpose,
        isFilled: p.isFilled,
        contentCount: p.assignedContent.length,
        assignedTitles: p.assignedContent.map((c) => c.input.title),
      })),
      summary: {
        totalArticles: classified.length,
        uniqueCategories,
        filledPositions,
        totalPositions,
        coveragePercent: Math.round((filledPositions / totalPositions) * 100),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 }
    );
  }
}
