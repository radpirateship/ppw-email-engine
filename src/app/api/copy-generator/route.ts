// ============================================================================
// PPW Email Engine — Email Copy Generator API
// GET /api/copy-generator?category=SAU&position=E1
// ============================================================================

import { NextResponse } from "next/server";
import {
  generateEmailTemplate,
  generateAllTemplatesForCategory,
} from "@/framework/email-templates";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const position = searchParams.get("position");

    if (!category) {
      return NextResponse.json(
        { error: "Query parameter 'category' is required (e.g., SAU, CLD, RLT)." },
        { status: 400 }
      );
    }

    const categoryCode = category.toUpperCase();

    // Single position
    if (position) {
      const template = generateEmailTemplate(categoryCode, position.toUpperCase());
      if (!template) {
        return NextResponse.json(
          { error: `No template found for category '${categoryCode}' position '${position}'.` },
          { status: 404 }
        );
      }
      return NextResponse.json({ templates: [template] });
    }

    // All positions for category
    const templates = generateAllTemplatesForCategory(categoryCode);
    if (templates.length === 0) {
      return NextResponse.json(
        { error: `Invalid category code '${categoryCode}'.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      templates,
      summary: {
        category: categoryCode,
        totalTemplates: templates.length,
        totalVariables: templates.reduce((acc, t) => acc + t.variables.length, 0),
        totalConditionals: templates.reduce((acc, t) => acc + t.conditionals.length, 0),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}
