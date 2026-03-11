// ============================================================================
// PPW Email Engine — AI Email Content Generator
// POST /api/generate-email
// Uses Claude API to generate rich, unique email content for each position
// in the 45-day nurture flow.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { CATEGORIES } from "@/framework/categories";
import { NURTURE_EMAIL_POSITIONS } from "@/framework/content-map";
import { PRICE_TIERS } from "@/framework/price-tiers";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GenerateRequest {
  categoryCode: string;
  position: string;
  tone?: "professional" | "friendly" | "urgent" | "educational";
  brandVoice?: string;
  additionalContext?: string;
  variationSeed?: number;
}

interface GeneratedEmail {
  subject: string;
  previewText: string;
  htmlBody: string;
  plainText: string;
  position: string;
  day: number;
  categoryCode: string;
  categoryName: string;
  purpose: string;
  templateName: string;
  generatedAt: string;
  variationSeed: number;
}

// ---------------------------------------------------------------------------
// System prompt for email generation
// ---------------------------------------------------------------------------

function buildSystemPrompt(): string {
  return `You are an expert email copywriter for Peak Primal Wellness (PPW), a premium home wellness e-commerce store selling saunas, cold plunges, red light therapy devices, hyperbaric chambers, hydrogen water machines, and other wellness equipment.

BRAND VOICE:
- Authoritative but warm — we're trusted advisors, not pushy salespeople
- Science-backed claims — reference research when discussing health benefits
- Conversational tone — like talking to a knowledgeable friend
- Premium positioning — these are investments in health, not impulse purchases
- Action-oriented — every email has a clear next step

WRITING RULES:
- NO filler phrases ("In today's world", "As you may know", "It goes without saying")
- NO generic wellness platitudes — be specific to the product category
- Subject lines: 6-10 words max, create curiosity or urgency
- Preview text: complement the subject line, don't repeat it
- Each paragraph should earn its place — cut anything that doesn't add value
- Use the subscriber's quiz data to personalize meaningfully
- Include specific product details, not vague descriptions

HTML OUTPUT RULES:
- Output ONLY the inner content HTML (what goes inside the email body)
- Do NOT include DOCTYPE, html, head, body, or style tags — those are handled by the template wrapper
- Use inline styles on elements for any styling
- Use Klaviyo template variables exactly as provided: {{ variable_name }}
- Use Klaviyo conditional blocks: {% if variable %} ... {% endif %}
- Include proper alt text on images
- Keep HTML email-client compatible (tables for layout if needed, inline styles)

KLAVIYO VARIABLES AVAILABLE:
- {{ first_name|default:"there" }} — subscriber's first name
- {{ top_recommendation }} — #1 product pick from quiz
- {{ top_recommendation_url }} — product page URL
- {{ top_recommendation_price }} — formatted price
- {{ top_recommendation_image }} — product image URL
- {{ quiz_goal }} — their stated wellness goal
- {{ quiz_category }} — category they took quiz for
- {{ alt_recommendation_1 }} — 2nd product pick
- {{ alt_recommendation_2 }} — 3rd product pick
- {{ brand_name }} — featured brand name
- {{ brand_story }} — brand narrative
- {{ offer_code }} — discount code (if assigned)
- {{ offer_amount }} — discount amount
- {{ consultation_url }} — booking link
- {{ unsubscribe_url }} — unsubscribe link`;
}

function buildEmailPrompt(
  categoryCode: string,
  categoryName: string,
  position: string,
  day: number,
  purpose: string,
  contentType: string,
  keyProducts: string[],
  articleCount: number,
  tone: string,
  additionalContext: string,
  variationSeed: number
): string {
  // Get price tier context
  const tierInfo = Object.values(PRICE_TIERS)
    .map((t) => `${t.name} ($${t.minPrice}${t.maxPrice ? `-$${t.maxPrice}` : "+"}): ${t.emailStrategy}`)
    .join("\n");

  return `Generate email content for position ${position} (Day ${day}) in the ${categoryName} 45-day nurture flow.

EMAIL POSITION: ${position} — Day ${day}
PURPOSE: ${purpose}
CONTENT TYPE: ${contentType}
CATEGORY: ${categoryName} (${categoryCode})
KEY PRODUCTS IN CATEGORY: ${keyProducts.join(", ")}
PUBLISHED ARTICLES: ${articleCount} articles available for this category
TONE: ${tone}
VARIATION SEED: ${variationSeed} (use this to create a distinct variation — different angle, different opening, different structure)

PRICE TIER STRATEGY:
${tierInfo}

${additionalContext ? `ADDITIONAL CONTEXT:\n${additionalContext}\n` : ""}

Please generate:
1. **subject** — Email subject line (6-10 words, include Klaviyo personalization where natural)
2. **previewText** — Preview/preheader text (complementary to subject, max 90 chars)
3. **htmlBody** — The inner HTML content (NOT wrapped in DOCTYPE/html/body — just the content that goes inside the email template). Must include:
   - Personalized greeting using {{ first_name|default:"there" }}
   - Category-specific content that demonstrates genuine expertise in ${categoryName.toLowerCase()}
   - Appropriate Klaviyo dynamic variables for this email position
   - At least one clear CTA button using <a> with class="cta-btn"
   - Conditional blocks ({% if %}) where appropriate
   - Minimum 200 words of substantive content
4. **plainText** — Plain text version of the email

Respond in valid JSON format:
{
  "subject": "...",
  "previewText": "...",
  "htmlBody": "...",
  "plainText": "..."
}`;
}

// ---------------------------------------------------------------------------
// HTML wrapper (same styling as existing templates)
// ---------------------------------------------------------------------------

function wrapHtml(inner: string, preheader: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Peak Primal Wellness</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4; color: #333333; }
    .wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background-color: #1a5632; padding: 24px 32px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 18px; margin: 8px 0 0; font-weight: 600; }
    .content { padding: 32px; }
    .content h2 { color: #1a5632; font-size: 22px; margin-top: 0; }
    .content p { font-size: 15px; line-height: 1.6; color: #555555; }
    .cta-btn { display: inline-block; background-color: #2d8a4e; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; margin: 16px 0; }
    .product-card { border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin: 16px 0; text-align: center; }
    .product-card img { max-width: 200px; margin-bottom: 12px; }
    .footer { background-color: #f8f8f8; padding: 24px 32px; text-align: center; font-size: 12px; color: #999999; }
    .footer a { color: #2d8a4e; text-decoration: none; }
    .preheader { display: none !important; max-height: 0; overflow: hidden; mso-hide: all; }
  </style>
</head>
<body>
  <div class="preheader">${preheader}</div>
  <div class="wrapper">
    <div class="header">
      <h1>Peak Primal Wellness</h1>
    </div>
    <div class="content">
${inner}
    </div>
    <div class="footer">
      <p>Peak Primal Wellness &middot; Your Home Wellness Experts</p>
      <p><a href="{{ consultation_url }}">Schedule a Free Consultation</a> &middot; <a href="{{ unsubscribe_url }}">Unsubscribe</a></p>
      <p style="font-size: 10px; color: #cccccc;">You're receiving this because you signed up at peakprimalwellness.com</p>
    </div>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Claude API call
// ---------------------------------------------------------------------------

async function callClaude(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set. Add it in Vercel project settings.");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Claude API error (${response.status}): ${errorData}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text;
  if (!content) {
    throw new Error("No content returned from Claude API");
  }

  return content;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const {
      categoryCode,
      position,
      tone = "friendly",
      additionalContext = "",
      variationSeed = Math.floor(Math.random() * 10000),
    } = body;

    // Validate category
    const cat = CATEGORIES[categoryCode as keyof typeof CATEGORIES];
    if (!cat) {
      return NextResponse.json(
        { error: `Invalid category code: ${categoryCode}` },
        { status: 400 }
      );
    }

    // Validate position
    const emailPos = NURTURE_EMAIL_POSITIONS.find((p) => p.position === position);
    if (!emailPos) {
      return NextResponse.json(
        { error: `Invalid position: ${position}. Must be E1-E11.` },
        { status: 400 }
      );
    }

    // Build prompts
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildEmailPrompt(
      categoryCode,
      cat.name,
      position,
      emailPos.day,
      emailPos.purpose,
      emailPos.contentType,
      cat.keyProducts,
      cat.articleCount,
      tone,
      additionalContext,
      variationSeed
    );

    // Call Claude
    const rawResponse = await callClaude(systemPrompt, userPrompt);

    // Parse JSON from Claude's response
    // Claude may wrap in ```json ... ``` so extract that
    let jsonStr = rawResponse;
    const jsonMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    let parsed: { subject: string; previewText: string; htmlBody: string; plainText: string };
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      // Try to find JSON object in the response
      const objMatch = rawResponse.match(/\{[\s\S]*"subject"[\s\S]*"plainText"[\s\S]*\}/);
      if (objMatch) {
        parsed = JSON.parse(objMatch[0]);
      } else {
        throw new Error("Could not parse Claude response as JSON");
      }
    }

    // Wrap the inner HTML in the full email template
    const fullHtml = wrapHtml(parsed.htmlBody, parsed.previewText);

    // Build template name using naming convention
    const templateName = `T-${categoryCode}-Nurture-${position}`;

    const result: GeneratedEmail = {
      subject: parsed.subject,
      previewText: parsed.previewText,
      htmlBody: fullHtml,
      plainText: parsed.plainText,
      position,
      day: emailPos.day,
      categoryCode,
      categoryName: cat.name,
      purpose: emailPos.purpose,
      templateName,
      generatedAt: new Date().toISOString(),
      variationSeed,
    };

    return NextResponse.json({ email: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Generate email error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
