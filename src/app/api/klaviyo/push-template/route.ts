// ============================================================================
// API: /api/klaviyo/push-template
// POST → Push a generated email template to Klaviyo
// Returns the Klaviyo template ID and edit URL on success.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";

const KLAVIYO_API_KEY = process.env.KLAVIYO_PRIVATE_API_KEY || "";
const KLAVIYO_REVISION = "2024-10-15";

interface PushTemplateBody {
  /** Template name (e.g. T-SAU-Nurture-E1) */
  name: string;
  /** Full HTML of the email */
  html: string;
  /** Category code for tracking */
  categoryCode: string;
  /** Position (E1–E11) for tracking */
  position: string;
  /** Subject line (stored in metadata) */
  subject?: string;
}

export async function POST(request: NextRequest) {
  try {
    if (!KLAVIYO_API_KEY) {
      return NextResponse.json(
        {
          error: "KLAVIYO_PRIVATE_API_KEY is not configured",
          hint: "Add your Klaviyo private API key in Vercel → Settings → Environment Variables",
        },
        { status: 500 }
      );
    }

    const body: PushTemplateBody = await request.json();

    if (!body.name || !body.html) {
      return NextResponse.json(
        { error: "name and html are required" },
        { status: 400 }
      );
    }

    // Ensure the HTML includes an unsubscribe link for Klaviyo compliance
    const htmlWithUnsubscribe = body.html.includes("{% unsubscribe")
      ? body.html
      : body.html.replace(
          "</body>",
          `<div style="text-align:center;padding:16px;font-size:11px;color:#999;">
            <a href="{% unsubscribe 'Unsubscribe' %}" style="color:#999;">Unsubscribe</a>
            &nbsp;|&nbsp;
            <a href="{% manage_preferences 'Manage Preferences' %}" style="color:#999;">Manage Preferences</a>
          </div></body>`
        );

    // Call Klaviyo API to create email template
    const klaviyoRes = await fetch("https://a.klaviyo.com/api/email-templates/", {
      method: "POST",
      headers: {
        Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        revision: KLAVIYO_REVISION,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        data: {
          type: "template",
          attributes: {
            name: body.name,
            html: htmlWithUnsubscribe,
          },
        },
      }),
    });

    if (!klaviyoRes.ok) {
      const errorData = await klaviyoRes.json().catch(() => ({}));
      const errorMsg =
        errorData?.errors?.[0]?.detail ||
        errorData?.errors?.[0]?.title ||
        `Klaviyo API returned ${klaviyoRes.status}`;

      return NextResponse.json(
        {
          error: errorMsg,
          status: klaviyoRes.status,
          details: errorData,
        },
        { status: klaviyoRes.status >= 500 ? 502 : klaviyoRes.status }
      );
    }

    const data = await klaviyoRes.json();
    const templateId = data?.data?.id;
    const templateName = data?.data?.attributes?.name;

    return NextResponse.json({
      success: true,
      klaviyoTemplateId: templateId,
      templateName: templateName,
      editUrl: `https://www.klaviyo.com/email-editor/${templateId}/edit`,
      categoryCode: body.categoryCode,
      position: body.position,
      pushedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
