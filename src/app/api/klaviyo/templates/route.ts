// ============================================================================
// API: /api/klaviyo/templates
// GET → Returns full template inventory across all categories
// POST → Generate a single template preview (categoryCode + position)
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { buildTemplateInventory, prepareTemplatePush } from "@/framework/template-push";
import { generateEmailTemplate } from "@/framework/email-templates";

export async function GET() {
  try {
    const inventory = buildTemplateInventory();

    // Compact serialisation for JSON
    const serialised = {
      totalTemplates: inventory.totalTemplates,
      totalGenerated: inventory.totalGenerated,
      totalPushed: inventory.totalPushed,
      totalErrors: inventory.totalErrors,
      overallCompletionPct: inventory.overallCompletionPct,
      quizCategoryCount: inventory.quizCategoryCount,
      nonQuizCategoryCount: inventory.nonQuizCategoryCount,
      categories: inventory.categories.map((c) => ({
        code: c.code,
        name: c.name,
        hasQuiz: c.hasQuiz,
        totalExpected: c.totalExpected,
        generated: c.generated,
        pushed: c.pushed,
        errors: c.errors,
        completionPct: c.completionPct,
        templates: c.templates.map((t) => ({
          templateName: t.templateName,
          position: t.position,
          day: t.day,
          subject: t.subject,
          status: t.status,
          purpose: t.purpose,
          klaviyoTemplateId: t.klaviyoTemplateId,
        })),
      })),
      generatedAt: inventory.generatedAt,
    };

    return NextResponse.json({ status: "ok", inventory: serialised });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categoryCode, position, mode } = body as {
      categoryCode?: string;
      position?: string;
      mode?: "preview" | "push-payload";
    };

    if (!categoryCode || !position) {
      return NextResponse.json(
        { error: "categoryCode and position are required" },
        { status: 400 }
      );
    }

    if (mode === "push-payload") {
      // Return the payload needed for Klaviyo create_email_template
      const payload = prepareTemplatePush(categoryCode, position);
      if (!payload) {
        return NextResponse.json(
          { error: `No template found for ${categoryCode}/${position}` },
          { status: 404 }
        );
      }
      return NextResponse.json({ status: "ok", payload });
    }

    // Default: full template preview
    const template = generateEmailTemplate(categoryCode, position);
    if (!template) {
      return NextResponse.json(
        { error: `No template found for ${categoryCode}/${position}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "ok",
      template: {
        templateName: template.templateName,
        position: template.position,
        day: template.day,
        categoryCode: template.categoryCode,
        categoryName: template.categoryName,
        subject: template.subject,
        previewText: template.previewText,
        htmlBody: template.htmlBody,
        plainText: template.plainText,
        variables: template.variables.map((v) => ({
          tag: v.tag,
          description: v.description,
        })),
        conditionals: template.conditionals.map((c) => ({
          condition: c.condition,
          description: c.description,
        })),
        purpose: template.purpose,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
