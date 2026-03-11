// ============================================================================
// PPW Email Engine — Campaign Calendar Page
// ============================================================================
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  buildAnnualCalendar,
  getCalendarSummary,
  type CampaignSuggestion,
  type MonthCalendar,
  type CampaignType,
} from "@/framework/campaign-calendar";

const CURRENT_YEAR = 2026;

// ---------------------------------------------------------------------------
// Type colors & labels
// ---------------------------------------------------------------------------

const TYPE_COLORS: Record<CampaignType, string> = {
  newsletter: "bg-blue-100 text-blue-700",
  "seasonal-promo": "bg-amber-100 text-amber-700",
  "product-launch": "bg-green-100 text-green-700",
  "flash-sale": "bg-red-100 text-red-700",
  "content-spotlight": "bg-purple-100 text-purple-700",
  holiday: "bg-pink-100 text-pink-700",
  winback: "bg-orange-100 text-orange-700",
  "vip-exclusive": "bg-yellow-100 text-yellow-700",
  "educational-series": "bg-teal-100 text-teal-700",
  "cross-sell": "bg-indigo-100 text-indigo-700",
};

const TYPE_LABELS: Record<CampaignType, string> = {
  newsletter: "Newsletter",
  "seasonal-promo": "Seasonal",
  "product-launch": "Launch",
  "flash-sale": "Flash Sale",
  "content-spotlight": "Content",
  holiday: "Holiday",
  winback: "Winback",
  "vip-exclusive": "VIP",
  "educational-series": "Educational",
  "cross-sell": "Cross-Sell",
};

// ---------------------------------------------------------------------------
// Summary Cards
// ---------------------------------------------------------------------------

function SummaryCards() {
  const summary = getCalendarSummary(CURRENT_YEAR);

  const avgPerMonth = (summary.totalCampaigns / 12).toFixed(1);
  const peakMonth = summary.campaignsPerMonth.indexOf(
    Math.max(...summary.campaignsPerMonth)
  );
  const emailSms = summary.byChannel["email+sms"] ?? 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="text-2xl font-bold text-gray-900">{summary.totalCampaigns}</div>
        <div className="text-xs text-gray-500 mt-1">Total Campaigns</div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="text-2xl font-bold text-blue-600">{avgPerMonth}</div>
        <div className="text-xs text-gray-500 mt-1">Avg / Month</div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="text-2xl font-bold text-green-600">{Object.keys(summary.byType).length}</div>
        <div className="text-xs text-gray-500 mt-1">Campaign Types</div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="text-2xl font-bold text-purple-600">{emailSms}</div>
        <div className="text-xs text-gray-500 mt-1">Email + SMS</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Type Distribution Bar
// ---------------------------------------------------------------------------

function TypeDistribution() {
  const summary = getCalendarSummary(CURRENT_YEAR);
  const entries = Object.entries(summary.byType).sort(
    (a, b) => b[1] - a[1]
  ) as Array<[CampaignType, number]>;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Campaign Mix</h3>
      <div className="flex flex-wrap gap-2">
        {entries.map(([type, count]) => (
          <span
            key={type}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${TYPE_COLORS[type]}`}
          >
            {TYPE_LABELS[type]}
            <span className="font-bold">{count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Month Volume Chart (simple bar)
// ---------------------------------------------------------------------------

function MonthVolumeChart() {
  const summary = getCalendarSummary(CURRENT_YEAR);
  const max = Math.max(...summary.campaignsPerMonth);
  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec",
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Campaigns by Month</h3>
      <div className="flex items-end gap-2 h-32">
        {summary.campaignsPerMonth.map((count, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs font-bold text-gray-600">{count}</span>
            <div
              className="w-full rounded-t bg-gradient-to-t from-green-600 to-green-400 transition-all"
              style={{ height: `${max > 0 ? (count / max) * 100 : 0}%`, minHeight: count > 0 ? "4px" : "0" }}
            />
            <span className="text-[10px] text-gray-400">{months[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Campaign Card
// ---------------------------------------------------------------------------

function CampaignCard({
  campaign,
  expanded,
  onToggle,
}: {
  campaign: CampaignSuggestion;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="border border-gray-200 rounded-lg hover:border-green-300 transition-colors cursor-pointer"
      onClick={onToggle}
    >
      <div className="p-3 flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
          W{campaign.suggestedWeek}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${TYPE_COLORS[campaign.type]}`}>
              {TYPE_LABELS[campaign.type]}
            </span>
            {campaign.categoryCode !== "ALL" && (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600">
                {campaign.categoryCode}
              </span>
            )}
            <span className="px-2 py-0.5 rounded text-[10px] bg-gray-50 text-gray-400">
              {campaign.channel}
            </span>
          </div>
          <h4 className="text-sm font-semibold text-gray-800 mt-1">{campaign.title}</h4>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{campaign.subjectLine}</p>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 mt-1 ${expanded ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-0 border-t border-gray-100 mt-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Brief</div>
              <p className="text-xs text-gray-600 leading-relaxed">{campaign.brief}</p>
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Target</div>
                <div className="flex flex-wrap gap-1">
                  {campaign.targetSegments.map((s) => (
                    <span key={s} className="px-1.5 py-0.5 bg-green-50 text-green-700 rounded text-[10px]">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Exclude</div>
                <div className="flex flex-wrap gap-1">
                  {campaign.excludeSegments.map((s) => (
                    <span key={s} className="px-1.5 py-0.5 bg-red-50 text-red-600 rounded text-[10px]">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Content Source</div>
                <p className="text-xs text-gray-600">{campaign.contentSource}</p>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Klaviyo Name</div>
                <code className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{campaign.campaignName}</code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Month Section
// ---------------------------------------------------------------------------

function MonthSection({ month }: { month: MonthCalendar }) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-lg font-bold text-gray-800">{month.monthName}</h2>
        <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {month.campaigns.length} campaign{month.campaigns.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="space-y-2">
        {month.campaigns.map((c, i) => (
          <CampaignCard
            key={c.campaignName}
            campaign={c}
            expanded={expandedIdx === i}
            onToggle={() => setExpandedIdx(expandedIdx === i ? null : i)}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function CampaignCalendarPage() {
  const calendar = buildAnnualCalendar(CURRENT_YEAR);
  const [viewMode, setViewMode] = useState<"timeline" | "grid">("timeline");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-green-600 transition-colors">Dashboard</Link>
          <span>/</span>
          <span className="text-gray-600">Campaign Calendar</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Campaign Calendar
            </h1>
            <p className="text-sm text-gray-500 mt-2 max-w-xl">
              {CURRENT_YEAR} campaign plan — newsletters, seasonal promos, flash sales, content spotlights,
              cross-sells, and winbacks across all 14 categories.
            </p>
          </div>
          <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("timeline")}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                viewMode === "timeline" ? "bg-green-600 text-white" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                viewMode === "grid" ? "bg-green-600 text-white" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Grid
            </button>
          </div>
        </div>

        <SummaryCards />
        <TypeDistribution />
        <MonthVolumeChart />

        {/* Calendar Content */}
        {viewMode === "timeline" ? (
          <div>
            {calendar.months.map((month) => (
              <MonthSection key={month.month} month={month} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {calendar.months.map((month) => (
              <div key={month.month} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-800">{month.monthName}</h3>
                  <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {month.campaigns.length}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {month.campaigns.map((c) => (
                    <div key={c.campaignName} className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${TYPE_COLORS[c.type].split(" ")[0]}`} />
                      <span className="text-xs text-gray-600 truncate">{c.title}</span>
                      <span className="text-[10px] text-gray-400 ml-auto flex-shrink-0">W{c.suggestedWeek}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 mt-12 pb-6">
          PPW Email Engine v0.10.0 &middot; Phase 10: Campaign Calendar
        </div>
      </div>
    </div>
  );
}
