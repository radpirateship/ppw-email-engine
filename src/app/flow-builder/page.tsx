"use client";

import { useState } from "react";
import {
  buildFlowCategorySummaries,
  buildFlowDashboardSummary,
  type FlowDashboardEntry,
  type FlowCategorySummary,
} from "@/framework/flow-dashboard";
import { CATEGORIES, CATEGORY_CODES } from "@/framework/categories";
import type { FlowCategory, FlowStatus } from "@/framework/flows";

// ============================================================================
// Pre-compute data
// ============================================================================
const SUMMARIES = buildFlowCategorySummaries();
const DASHBOARD = buildFlowDashboardSummary();

// ============================================================================
// Style maps
// ============================================================================
const STATUS_STYLES: Record<FlowStatus, { bg: string; text: string; dot: string; label: string }> = {
  planned: { bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-300", label: "Planned" },
  draft: { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-400", label: "Draft" },
  built: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-400", label: "Built" },
  live: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500", label: "Live" },
};

const CATEGORY_ICONS: Record<FlowCategory, string> = {
  entry: "M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1",
  engagement: "M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122",
  "post-purchase": "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  lifecycle: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
};

// ============================================================================
// Summary Cards
// ============================================================================
function SummaryCards() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
      {/* Total Flows */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          Total Flows
        </div>
        <div className="text-3xl font-bold text-gray-900">{DASHBOARD.totalFlows}</div>
        <div className="text-xs text-gray-400 mt-1">{DASHBOARD.totalEmails} emails planned</div>
      </div>

      {/* Live */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          Live in Klaviyo
        </div>
        <div className="text-3xl font-bold text-green-600">{DASHBOARD.liveInKlaviyo}</div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
          <div
            className="bg-green-500 h-1.5 rounded-full"
            style={{ width: `${Math.round((DASHBOARD.liveInKlaviyo / DASHBOARD.totalFlows) * 100)}%` }}
          />
        </div>
      </div>

      {/* Draft */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          In Draft
        </div>
        <div className="text-3xl font-bold text-yellow-600">{DASHBOARD.draftInKlaviyo}</div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
          <div
            className="bg-yellow-400 h-1.5 rounded-full"
            style={{ width: `${Math.round((DASHBOARD.draftInKlaviyo / DASHBOARD.totalFlows) * 100)}%` }}
          />
        </div>
      </div>

      {/* Planned */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          Planned
        </div>
        <div className="text-3xl font-bold text-gray-400">{DASHBOARD.statusCounts.planned}</div>
        <div className="text-xs text-gray-400 mt-1">not yet started</div>
      </div>

      {/* Top Category */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          Top Category
        </div>
        {DASHBOARD.topCategories.length > 0 ? (
          <>
            <div className="text-lg font-bold text-gray-900">{DASHBOARD.topCategories[0].name}</div>
            <div className="text-xs text-gray-400 mt-1">
              {DASHBOARD.topCategories[0].liveFlows} live flows
            </div>
          </>
        ) : (
          <div className="text-lg font-bold text-gray-400">—</div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Status Distribution Bar
// ============================================================================
function StatusBar() {
  const total = DASHBOARD.totalFlows;
  const statuses: FlowStatus[] = ["live", "draft", "built", "planned"];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Flow Status Distribution
      </div>
      <div className="flex rounded-full overflow-hidden h-4 mb-3">
        {statuses.map((s) => {
          const count = DASHBOARD.statusCounts[s];
          if (count === 0) return null;
          return (
            <div
              key={s}
              className={`${STATUS_STYLES[s].dot} transition-all`}
              style={{ width: `${(count / total) * 100}%` }}
              title={`${STATUS_STYLES[s].label}: ${count}`}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-4 text-xs">
        {statuses.map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${STATUS_STYLES[s].dot}`} />
            <span className="text-gray-600">
              {STATUS_STYLES[s].label}: <span className="font-semibold">{DASHBOARD.statusCounts[s]}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Flow Card
// ============================================================================
function FlowCard({ entry }: { entry: FlowDashboardEntry }) {
  const [expanded, setExpanded] = useState(false);
  const style = STATUS_STYLES[entry.effectiveStatus];
  const hasKlaviyo = entry.klaviyoMatches.length > 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
      >
        {/* Status dot */}
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${style.dot}`} />

        {/* Flow ID */}
        <span className="font-mono text-[10px] text-gray-400 w-32 shrink-0 truncate">
          {entry.flow.id}
        </span>

        {/* Name */}
        <span className="text-sm font-semibold text-gray-900 flex-1 min-w-0 truncate">
          {entry.flow.name}
        </span>

        {/* Category badge */}
        {entry.categoryName && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 shrink-0">
            {entry.categoryCode}
          </span>
        )}

        {/* Email count */}
        <span className="text-xs text-gray-400 shrink-0 w-16 text-right">
          {entry.flow.emailCount} email{entry.flow.emailCount !== 1 ? "s" : ""}
        </span>

        {/* Status badge */}
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${style.bg} ${style.text}`}>
          {style.label}
        </span>

        {/* Klaviyo indicator */}
        <span
          title={hasKlaviyo ? `${entry.klaviyoMatches.length} Klaviyo flow(s)` : "Not in Klaviyo"}
          className={`text-[10px] shrink-0 ${hasKlaviyo ? "text-green-500" : "text-gray-300"}`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </span>

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Details */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</div>
              <div className="text-xs text-gray-600">{entry.flow.description}</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Trigger</span>
                  <span className="text-gray-700 text-right max-w-[200px] truncate">{entry.flow.trigger}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Emails</span>
                  <span className="text-gray-700">{entry.flow.emailCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Price Tiered</span>
                  <span className="text-gray-700">{entry.flow.tieredByPrice ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Framework Status</span>
                  <span className={`font-medium ${style.text}`}>{style.label}</span>
                </div>
              </div>
            </div>

            {/* Email Positions */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Email Sequence
              </div>
              {entry.flow.emails && entry.flow.emails.length > 0 ? (
                <div className="space-y-1">
                  {entry.flow.emails.map((email) => (
                    <div key={email.position} className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-[10px] text-gray-400 w-6">{email.position}</span>
                      <span className="text-gray-300">Day {email.day}</span>
                      <span className="text-gray-600 truncate flex-1">{email.purpose}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic">
                  {entry.flow.emailCount} emails planned — sequence not yet defined
                </div>
              )}
            </div>

            {/* Klaviyo State */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Klaviyo State
              </div>
              {entry.klaviyoMatches.length > 0 ? (
                <div className="space-y-2">
                  {entry.klaviyoMatches.map((kf) => (
                    <div key={kf.id} className="p-2 bg-gray-50 rounded-md">
                      <div className="text-xs font-medium text-gray-800 truncate">{kf.name}</div>
                      <div className="flex gap-3 mt-1 text-[10px] text-gray-400">
                        <span>ID: {kf.id}</span>
                        <span className={kf.status === "live" ? "text-green-600 font-medium" : "text-yellow-600 font-medium"}>
                          {kf.status}
                        </span>
                        <span>{kf.triggerType}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-md text-center">
                  <div className="text-xs text-gray-400">Not yet in Klaviyo</div>
                  <div className="text-[10px] text-gray-300 mt-1">Build using Copy Generator →</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Flow Category Section
// ============================================================================
function FlowCategorySection({ summary }: { summary: FlowCategorySummary }) {
  const [collapsed, setCollapsed] = useState(false);
  const iconPath = CATEGORY_ICONS[summary.category];

  return (
    <div className="mb-6">
      {/* Section Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-3 mb-3 group"
      >
        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={iconPath} />
          </svg>
        </div>
        <div className="flex-1 text-left">
          <h2 className="text-sm font-bold text-gray-900">{summary.label}</h2>
          <div className="flex gap-3 text-[10px] text-gray-400 mt-0.5">
            <span>{summary.total} flow{summary.total !== 1 ? "s" : ""}</span>
            {summary.live > 0 && <span className="text-green-600">{summary.live} live</span>}
            {summary.draft > 0 && <span className="text-yellow-600">{summary.draft} draft</span>}
            {summary.planned > 0 && <span>{summary.planned} planned</span>}
          </div>
        </div>
        {/* Mini status bar */}
        <div className="w-32 shrink-0">
          <div className="flex rounded-full overflow-hidden h-2">
            {summary.live > 0 && (
              <div className="bg-green-500" style={{ width: `${(summary.live / summary.total) * 100}%` }} />
            )}
            {summary.draft > 0 && (
              <div className="bg-yellow-400" style={{ width: `${(summary.draft / summary.total) * 100}%` }} />
            )}
            {summary.built > 0 && (
              <div className="bg-blue-400" style={{ width: `${(summary.built / summary.total) * 100}%` }} />
            )}
            {summary.planned > 0 && (
              <div className="bg-gray-200" style={{ width: `${(summary.planned / summary.total) * 100}%` }} />
            )}
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${collapsed ? "-rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Flow Cards */}
      {!collapsed && (
        <div className="space-y-2 ml-11">
          {summary.flows.map((entry) => (
            <FlowCard key={entry.flow.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Category Filter Sidebar
// ============================================================================
function CategoryFilter({
  selected,
  onChange,
}: {
  selected: string | null;
  onChange: (code: string | null) => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Filter by Product Category
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onChange(null)}
          className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
            selected === null
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {CATEGORY_CODES.map((code) => (
          <button
            key={code}
            onClick={() => onChange(selected === code ? null : code)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              selected === code
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span className="font-mono mr-1">{code}</span>
            {CATEGORIES[code].name}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Top Categories Ranking
// ============================================================================
function TopCategoriesWidget() {
  if (DASHBOARD.topCategories.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Categories with Most Live Flows
      </div>
      <div className="space-y-2">
        {DASHBOARD.topCategories.map((cat, i) => (
          <div key={cat.code} className="flex items-center gap-3">
            <span className="text-xs font-mono text-gray-400 w-4">{i + 1}</span>
            <span className="font-mono text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded w-10 text-center">
              {cat.code}
            </span>
            <span className="text-sm text-gray-800 flex-1">{cat.name}</span>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: cat.liveFlows }).map((_, j) => (
                <div key={j} className="w-2 h-2 rounded-full bg-green-500" />
              ))}
            </div>
            <span className="text-xs font-bold text-green-600 w-6 text-right">{cat.liveFlows}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Main Page
// ============================================================================
export default function FlowBuilderPage() {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // Filter summaries by category
  const filteredSummaries = categoryFilter
    ? SUMMARIES.map((s) => ({
        ...s,
        flows: s.flows.filter((e) => {
          const parts = e.flow.id.split("-");
          const flowCat = parts.length >= 2 ? parts[1] : null;
          return flowCat === categoryFilter || flowCat === "ALL";
        }),
      })).filter((s) => s.flows.length > 0)
    : SUMMARIES;

  return (
    <div className="px-8 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Flow Builder</h1>
            <p className="text-sm text-gray-500 mt-1">
              Track all {DASHBOARD.totalFlows} flows by category, status, and email completion.
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Klaviyo Snapshot</div>
            <div className="text-xs text-gray-500">
              {new Date(DASHBOARD.snapshot.pulledAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              {DASHBOARD.snapshot.liveFlows} live &middot; {DASHBOARD.snapshot.draftFlows} draft
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards />

      {/* Status Distribution */}
      <StatusBar />

      {/* Top Categories + Category Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopCategoriesWidget />
        <CategoryFilter selected={categoryFilter} onChange={setCategoryFilter} />
      </div>

      {/* Flow Sections */}
      {filteredSummaries.map((summary) => (
        <FlowCategorySection key={summary.category} summary={summary} />
      ))}

      {/* Footer */}
      <div className="mt-8 text-xs text-gray-400 text-center">
        PPW Email Engine v0.6.0 &middot; Phase 7: Flow Builder
        <br />
        Data source: Framework architecture ({DASHBOARD.totalFlows} flows, {DASHBOARD.totalEmails} emails)
        + Klaviyo snapshot from {new Date(DASHBOARD.snapshot.pulledAt).toLocaleDateString()}.
      </div>
    </div>
  );
}
