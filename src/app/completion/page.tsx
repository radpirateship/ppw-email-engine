"use client";

import { useState } from "react";
import {
  computeAllCompletions,
  computeOverallReadiness,
  type CategoryCompletion,
} from "@/framework/completion";
import { KLAVIYO_SNAPSHOT } from "@/framework/klaviyo-state";

// ============================================================================
// Compute data at module level (runs once)
// ============================================================================
const ALL_COMPLETIONS = computeAllCompletions();
const READINESS = computeOverallReadiness(ALL_COMPLETIONS);

// Sort: highest score first
const SORTED = [...ALL_COMPLETIONS].sort((a, b) => b.overallScore - a.overallScore);

// ============================================================================
// Color helpers
// ============================================================================
const TIER_COLORS: Record<string, string> = {
  "not-started": "bg-gray-100 text-gray-500",
  beginning: "bg-red-100 text-red-700",
  building: "bg-yellow-100 text-yellow-700",
  established: "bg-blue-100 text-blue-700",
  advanced: "bg-green-100 text-green-700",
};

const TIER_LABELS: Record<string, string> = {
  "not-started": "Not Started",
  beginning: "Beginning",
  building: "Building",
  established: "Established",
  advanced: "Advanced",
};

const TIER_BAR_COLORS: Record<string, string> = {
  "not-started": "bg-gray-300",
  beginning: "bg-red-400",
  building: "bg-yellow-400",
  established: "bg-blue-500",
  advanced: "bg-green-500",
};

function scoreColor(score: number): string {
  if (score === 0) return "text-gray-400";
  if (score < 25) return "text-red-600";
  if (score < 50) return "text-yellow-600";
  if (score < 75) return "text-blue-600";
  return "text-green-600";
}

// ============================================================================
// Summary Cards
// ============================================================================
function SummaryCards() {
  const notStarted = READINESS.tierCounts["not-started"] || 0;
  const beginning = READINESS.tierCounts["beginning"] || 0;
  const building = READINESS.tierCounts["building"] || 0;
  const established = READINESS.tierCounts["established"] || 0;
  const advanced = READINESS.tierCounts["advanced"] || 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {/* Overall Score */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 col-span-2 md:col-span-1">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          Overall Readiness
        </div>
        <div className={`text-3xl font-bold ${scoreColor(READINESS.averageScore)}`}>
          {READINESS.averageScore}%
        </div>
        <div className="text-xs text-gray-400 mt-1">across 14 categories</div>
      </div>

      {/* Flow Coverage */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          Flows Live
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {READINESS.flowsLive}
          <span className="text-sm font-normal text-gray-400"> / {READINESS.flowsPlanned}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
          <div
            className="bg-green-500 h-1.5 rounded-full"
            style={{ width: `${Math.round((READINESS.flowsLive / READINESS.flowsPlanned) * 100)}%` }}
          />
        </div>
      </div>

      {/* List Coverage */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          Lists Active
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {READINESS.listsExist}
          <span className="text-sm font-normal text-gray-400"> / {READINESS.listsPlanned}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
          <div
            className="bg-green-500 h-1.5 rounded-full"
            style={{ width: `${Math.round((READINESS.listsExist / READINESS.listsPlanned) * 100)}%` }}
          />
        </div>
      </div>

      {/* Segments */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          Segments Built
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {READINESS.segmentsExist}
          <span className="text-sm font-normal text-gray-400"> / {READINESS.segmentsPlanned}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
          <div
            className="bg-green-500 h-1.5 rounded-full"
            style={{ width: `${Math.round((READINESS.segmentsExist / READINESS.segmentsPlanned) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Tier Distribution Bar
// ============================================================================
function TierDistribution() {
  const tiers = ["advanced", "established", "building", "beginning", "not-started"] as const;
  const total = ALL_COMPLETIONS.length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Category Distribution
      </div>
      <div className="flex rounded-full overflow-hidden h-4 mb-3">
        {tiers.map((tier) => {
          const count = READINESS.tierCounts[tier] || 0;
          if (count === 0) return null;
          const pct = (count / total) * 100;
          return (
            <div
              key={tier}
              className={`${TIER_BAR_COLORS[tier]} transition-all`}
              style={{ width: `${pct}%` }}
              title={`${TIER_LABELS[tier]}: ${count}`}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 text-xs">
        {tiers.map((tier) => {
          const count = READINESS.tierCounts[tier] || 0;
          return (
            <div key={tier} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${TIER_BAR_COLORS[tier]}`} />
              <span className="text-gray-600">
                {TIER_LABELS[tier]}: <span className="font-semibold">{count}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Category Row (expandable)
// ============================================================================
function CategoryRow({ cat }: { cat: CategoryCompletion }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Summary row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
      >
        {/* Code badge */}
        <span className="font-mono text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded w-10 text-center shrink-0">
          {cat.code}
        </span>

        {/* Name */}
        <span className="text-sm font-semibold text-gray-900 min-w-[140px]">{cat.name}</span>

        {/* Score bar */}
        <div className="flex-1 flex items-center gap-2">
          <div className="flex-1 bg-gray-100 rounded-full h-2">
            <div
              className={`${TIER_BAR_COLORS[cat.tier]} h-2 rounded-full transition-all`}
              style={{ width: `${cat.overallScore}%` }}
            />
          </div>
          <span className={`text-sm font-bold w-10 text-right ${scoreColor(cat.overallScore)}`}>
            {cat.overallScore}%
          </span>
        </div>

        {/* Tier badge */}
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${TIER_COLORS[cat.tier]}`}>
          {TIER_LABELS[cat.tier]}
        </span>

        {/* Mini indicators */}
        <div className="flex gap-1 shrink-0">
          <span title="Flows" className={`w-2 h-2 rounded-full ${cat.flows.live > 0 ? "bg-green-400" : cat.flows.draft > 0 ? "bg-yellow-400" : "bg-gray-200"}`} />
          <span title="Lists" className={`w-2 h-2 rounded-full ${cat.lists.hasEmail ? "bg-green-400" : "bg-gray-200"}`} />
          <span title="Quiz" className={`w-2 h-2 rounded-full ${cat.quiz.hasQuiz ? "bg-green-400" : "bg-gray-200"}`} />
        </div>

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Flows */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Flows
                <span className={`ml-1.5 font-bold ${scoreColor(cat.flows.score)}`}>{cat.flows.score}%</span>
              </div>
              <div className="space-y-1.5">
                {cat.flows.details.map((f) => (
                  <div key={f.type} className="flex items-center gap-2 text-xs">
                    {f.hasLive ? (
                      <span className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px]">&#10003;</span>
                    ) : f.hasDraft ? (
                      <span className="w-4 h-4 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-[10px]">&#9679;</span>
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-[10px]">&#8722;</span>
                    )}
                    <span className={`capitalize ${f.hasLive ? "text-gray-900" : f.hasDraft ? "text-yellow-700" : "text-gray-400"}`}>
                      {f.type.replace(/-/g, " ")}
                    </span>
                    {f.klaviyoStatus && (
                      <span className="ml-auto text-[10px] text-gray-400">{f.klaviyoStatus}</span>
                    )}
                  </div>
                ))}
              </div>
              {cat.flows.details.some((f) => f.klaviyoName) && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="text-[10px] text-gray-400 mb-1">In Klaviyo:</div>
                  {cat.flows.details
                    .filter((f) => f.klaviyoName)
                    .map((f) => (
                      <div key={f.type} className="text-[10px] text-gray-500 truncate">{f.klaviyoName}</div>
                    ))}
                </div>
              )}
            </div>

            {/* Lists */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Lists
                <span className={`ml-1.5 font-bold ${scoreColor(cat.lists.score)}`}>{cat.lists.score}%</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${cat.lists.hasEmail ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                    {cat.lists.hasEmail ? "\u2713" : "\u2212"}
                  </span>
                  <span className={cat.lists.hasEmail ? "text-gray-900" : "text-gray-400"}>Email List</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${cat.lists.hasSms ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                    {cat.lists.hasSms ? "\u2713" : "\u2212"}
                  </span>
                  <span className={cat.lists.hasSms ? "text-gray-900" : "text-gray-400"}>SMS List</span>
                </div>
              </div>
              {cat.lists.klaviyoLists.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="text-[10px] text-gray-400 mb-1">In Klaviyo ({cat.lists.exists}):</div>
                  {cat.lists.klaviyoLists.map((name) => (
                    <div key={name} className="text-[10px] text-gray-500 truncate">{name}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Content
                <span className={`ml-1.5 font-bold ${scoreColor(cat.content.score)}`}>{cat.content.score}%</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{cat.content.articleCount}</div>
              <div className="text-xs text-gray-500">articles mapped</div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div
                  className="bg-green-500 h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, cat.content.score)}%` }}
                />
              </div>
              <div className="text-[10px] text-gray-400 mt-1">target: 50+ articles</div>
            </div>

            {/* Quiz + Segments */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Extras
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${cat.quiz.hasQuiz ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                      {cat.quiz.hasQuiz ? "\u2713" : "\u2212"}
                    </span>
                    <span className={cat.quiz.hasQuiz ? "text-gray-900" : "text-gray-400"}>Product Quiz</span>
                  </div>
                  {cat.quiz.quizName && (
                    <div className="text-[10px] text-gray-500 ml-6 mt-0.5">{cat.quiz.quizName}</div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-4 h-4 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-[10px]">{"\u2212"}</span>
                    <span className="text-gray-400">Interest Segment</span>
                  </div>
                  <div className="text-[10px] text-gray-400 ml-6 mt-0.5">planned for Phase 2</div>
                </div>
              </div>
            </div>
          </div>

          {/* Priority action */}
          {cat.tier !== "advanced" && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="text-xs font-semibold text-blue-800 mb-1">Next Priority</div>
              <div className="text-xs text-blue-700">
                {!cat.lists.hasEmail
                  ? `Create a category email list for ${cat.name} in Klaviyo.`
                  : cat.flows.live === 0
                    ? `Build and launch a Welcome Series flow for ${cat.name}.`
                    : !cat.flows.details.find((f) => f.type === "browse-abandon")?.hasLive
                      ? `Add a Browse Abandonment flow for ${cat.name}.`
                      : !cat.flows.details.find((f) => f.type === "cart-abandon")?.hasLive && !cat.flows.details.find((f) => f.type === "checkout-abandon")?.hasLive
                        ? `Add a Cart/Checkout Abandonment flow for ${cat.name}.`
                        : !cat.flows.details.find((f) => f.type === "post-purchase")?.hasLive
                          ? `Build a Post-Purchase flow for ${cat.name}.`
                          : `Expand ${cat.name} with category-specific segments and content.`}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Page
// ============================================================================
export default function CompletionPage() {
  return (
    <div className="px-8 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Category Completion Tracker</h1>
            <p className="text-sm text-gray-500 mt-1">
              Email marketing readiness per category — framework plan vs. live Klaviyo state.
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Klaviyo Snapshot</div>
            <div className="text-xs text-gray-500">
              {new Date(KLAVIYO_SNAPSHOT.pulledAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              {KLAVIYO_SNAPSHOT.liveFlows} live flows &middot; {KLAVIYO_SNAPSHOT.totalLists} lists
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <SummaryCards />
      <TierDistribution />

      {/* Category Grid */}
      <div className="space-y-2">
        {SORTED.map((cat) => (
          <CategoryRow key={cat.code} cat={cat} />
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-8 text-xs text-gray-400 text-center">
        Scores weighted: Flows 40% &middot; Lists 20% &middot; Segments 15% &middot; Content 25%
        <br />
        Data source: Klaviyo API snapshot from {new Date(KLAVIYO_SNAPSHOT.pulledAt).toLocaleDateString()}. Refresh by updating klaviyo-state.ts.
      </div>
    </div>
  );
}

