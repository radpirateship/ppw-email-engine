// ============================================================================
// PPW Email Engine — Style Configuration API
// GET: retrieve current style config + presets
// POST: preview email with given style
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_STYLE,
  STYLE_PRESETS,
  EmailStyleConfig,
  wrapEmailHtml,
  generateEmailCSS,
} from "@/framework/email-styles";

// ---------------------------------------------------------------------------
// Sample email content for preview
// ---------------------------------------------------------------------------

function getSampleEmailHtml(): string {
  return `      <h2>Your Personalized Sauna Picks</h2>
      <p>Hi {{ first_name|default:"Sarah" }},</p>
      <p>Thanks for taking our Sauna Finder Quiz! Based on your goals — <strong>detox and relaxation</strong> — we've hand-picked products that are the perfect match for your home wellness journey.</p>

      <div class="product-card">
        <h3 style="margin: 8px 0 4px;">Golden Designs 2-Person Full Spectrum Sauna</h3>
        <p style="font-size: 20px; font-weight: 700; margin: 4px 0;">$2,499</p>
        <a href="#" class="cta-btn">View Your #1 Pick</a>
      </div>

      <p>Also worth considering: <strong>Dynamic Saunas Barcelona 1-2 Person</strong> and <strong>SaunaLife Model X7 2-Person Barrel Sauna</strong></p>

      <p>Have questions? Our wellness experts are just a click away.</p>
      <a href="#" class="cta-btn" style="background-color: #555555; color: #ffffff;">Talk to an Expert — Free</a>`;
}

// ---------------------------------------------------------------------------
// GET — Return presets and current style
// ---------------------------------------------------------------------------

export async function GET() {
  return NextResponse.json({
    status: "ok",
    currentStyle: DEFAULT_STYLE,
    presets: Object.entries(STYLE_PRESETS).map(([key, preset]) => ({
      key,
      name: preset.name,
      description: preset.description,
      colors: preset.colors,
      fonts: preset.fonts,
      spacing: preset.spacing,
    })),
    presetCount: Object.keys(STYLE_PRESETS).length,
  });
}

// ---------------------------------------------------------------------------
// POST — Generate a preview email with the given style
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { style, presetKey }: { style?: EmailStyleConfig; presetKey?: string } = body;

    // Use preset if specified, otherwise use provided style, fallback to default
    let activeStyle: EmailStyleConfig;
    if (presetKey && STYLE_PRESETS[presetKey]) {
      activeStyle = STYLE_PRESETS[presetKey];
    } else if (style) {
      activeStyle = {
        ...DEFAULT_STYLE,
        ...style,
        colors: { ...DEFAULT_STYLE.colors, ...(style.colors || {}) },
        fonts: { ...DEFAULT_STYLE.fonts, ...(style.fonts || {}) },
        spacing: { ...DEFAULT_STYLE.spacing, ...(style.spacing || {}) },
      };
    } else {
      activeStyle = DEFAULT_STYLE;
    }

    const sampleHtml = getSampleEmailHtml();
    const fullHtml = wrapEmailHtml(sampleHtml, "We picked the best saunas based on your quiz answers.", activeStyle);
    const css = generateEmailCSS(activeStyle);

    return NextResponse.json({
      status: "ok",
      previewHtml: fullHtml,
      css,
      style: activeStyle,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { status: "error", error: message },
      { status: 400 }
    );
  }
}
