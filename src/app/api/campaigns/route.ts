// ============================================================================
// PPW Email Engine — Campaign Calendar API
// ============================================================================

import { NextResponse } from "next/server";
import {
  buildAnnualCalendar,
  getCalendarSummary,
  getMonthCalendar,
} from "@/framework/campaign-calendar";

/**
 * GET /api/campaigns
 * Query params:
 *   year  — calendar year (default: 2026)
 *   month — optional, return single month (1-12)
 *   mode  — "summary" for stats only, "full" for complete calendar (default: full)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get("year") ?? "2026", 10);
    const monthParam = searchParams.get("month");
    const mode = searchParams.get("mode") ?? "full";

    if (isNaN(year) || year < 2024 || year > 2030) {
      return NextResponse.json({ error: "Invalid year" }, { status: 400 });
    }

    // Summary mode — lightweight stats only
    if (mode === "summary") {
      const summary = getCalendarSummary(year);
      return NextResponse.json({ ok: true, summary });
    }

    // Single month
    if (monthParam) {
      const month = parseInt(monthParam, 10);
      if (isNaN(month) || month < 1 || month > 12) {
        return NextResponse.json({ error: "Invalid month (1-12)" }, { status: 400 });
      }
      const monthCalendar = getMonthCalendar(year, month);
      return NextResponse.json({ ok: true, month: monthCalendar });
    }

    // Full calendar
    const calendar = buildAnnualCalendar(year);
    return NextResponse.json({
      ok: true,
      calendar: {
        year: calendar.year,
        totalCampaigns: calendar.totalCampaigns,
        byType: calendar.byType,
        byCategory: calendar.byCategory,
        months: calendar.months.map((m) => ({
          month: m.month,
          monthName: m.monthName,
          campaignCount: m.campaigns.length,
          campaigns: m.campaigns.map((c) => ({
            campaignName: c.campaignName,
            title: c.title,
            type: c.type,
            categoryCode: c.categoryCode,
            suggestedWeek: c.suggestedWeek,
            channel: c.channel,
            subjectLine: c.subjectLine,
            audienceEstimate: c.audienceEstimate,
            status: c.status,
          })),
        })),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
