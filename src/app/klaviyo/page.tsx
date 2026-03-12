// ============================================================================
// PPW Email Engine — Klaviyo Dashboard (merged Sync + Delta)
// Two tabs: "Live State" and "Gap Analysis"
// ============================================================================

"use client";

import { useState, useMemo } from "react";
import {
  LIVE_FLOWS,
  LIVE_LISTS,
  LIVE_SEGMENTS,
  KEY_METRICS,
  QUIZ_METRICS,
  KLAVIYO_SNAPSHOT,
  type KlaviyoFlow,
  type KlaviyoList,
  type FlowStatus,
} from "@/framework/klaviyo-state";
import {
  buildDeltaSummary,
  type CategoryDelta,
  type DeltaSummary,
} from "@/framework/klaviyo-delta";

// ---------------------------------------------------------------------------
// Shared Helpers
// ---------------------------------------------------------------------------

function countBy<T>(arr: T[], key: (item: T) => string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of arr) {
    const k = key(item) || "—";
    out[k] = (out[k] || 0) + 1;
  }
  return out;
}

const STATUS_COLORS: Record<FlowStatus, string> = {
  live: "bg-green-100 text-green-700",
  draft: "bg-gray-100 text-gray-500",
  manual: "bg-yellow-100 text-yellow-700",
  paused: "bg-red-100 text-red-600",
};

// ---------------------------------------------------------------------------
// Live State Components
// ---------------------------------------------------------------------------

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function HealthBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-green-100 text-green-700 border-green-200"
      : score >= 60
        ? "bg-yellow-100 text-yellow-700 border-yellow-200"
        : "bg-red-100 text-red-600 border-red-200";
  const label = score >= 80 ? "Healthy" : score >= 60 ? "Needs Attention" : "Critical";
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${color}`}>
      <span className="text-lg font-bold">{score}</span>
      <span className="text-xs">{label}</span>
    </div>
  );
}

function FlowTable({ flows }: { flows: KlaviyoFlow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            <th className="pb-2 pr-4 font-medium">Flow Name</th>
            <th className="pb-2 pr-4 font-medium">Status</th>
            <th className="pb-2 pr-4 font-medium">Type</th>
            <th className="pb-2 pr-4 font-medium">Category</th>
            <th className="pb-2 font-medium">Trigger</th>
          </tr>
        </thead>
        <tbody>
          {flows.map((f) => (
            <tr key={f.id} className="border-b border-gray-100">
              <td className="py-2 pr-4 font-medium text-gray-900 max-w-[280px] truncate">
                {f.name}
              </td>
              <td className="py-2 pr-4">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[f.status]}`}>
                  {f.status}
                </span>
              </td>
              <td className="py-2 pr-4 text-gray-600">{f.flowType}</td>
              <td className="py-2 pr-4">
                {f.categoryCode ? (
                  <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-mono">
                    {f.categoryCode}
                  </span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="py-2 text-gray-500">{f.triggerType}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ListTable({ lists }: { lists: KlaviyoList[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            <th className="pb-2 pr-4 font-medium">List Name</th>
            <th className="pb-2 pr-4 font-medium">Type</th>
            <th className="pb-2 font-medium">Category</th>
          </tr>
        </thead>
        <tbody>
          {lists.map((l) => (
            <tr key={l.id} className="border-b border-gray-100">
              <td className="py-2 pr-4 font-medium text-gray-900">{l.name}</td>
              <td className="py-2 pr-4">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  l.listType === "sms"
                    ? "bg-purple-100 text-purple-700"
                    : l.listType === "general"
                      ? "bg-gray-100 text-gray-500"
                      : "bg-blue-100 text-blue-700"
                }`}>
                  {l.listType}
                </span>
              </td>
              <td className="py-2">
                {l.categoryCode ? (
                  <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-mono">
                    {l.categoryCode}
                  </span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LiveStateTab({ healthScore }: { healthScore: number }) {
  const flowsByStatus = useMemo(() => countBy(LIVE_FLOWS, (f) => f.status), []);
  const flowsByType = useMemo(() => countBy(LIVE_FLOWS, (f) => f.flowType), []);
  const listsByType = useMemo(() => countBy(LIVE_LISTS, (l) => l.listType), []);

  return (
    <>
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <StatCard
          label="Total Flows"
          value={KLAVIYO_SNAPSHOT.totalFlows}
          sub={`${KLAVIYO_SNAPSHOT.liveFlows} live · ${KLAVIYO_SNAPSHOT.draftFlows} draft`}
        />
        <StatCard
          label="Lists"
          value={KLAVIYO_SNAPSHOT.totalLists}
          sub={`${LIVE_LISTS.filter((l) => l.listType === "email").length} email · ${LIVE_LISTS.filter((l) => l.listType === "sms").length} SMS`}
        />
        <StatCard
          label="Segments"
          value={KLAVIYO_SNAPSHOT.totalSegments}
          sub={`${LIVE_SEGMENTS.filter((s) => s.isActive).length} active`}
        />
        <StatCard
          label="Key Metrics"
          value={KEY_METRICS.length}
          sub="eCommerce + Internal"
        />
        <StatCard
          label="Active Quizzes"
          value={QUIZ_METRICS.length}
          sub="Scoring product matches"
        />
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Flows by Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-xs font-semibold text-gray-700 mb-3">Flows by Status</h3>
          <div className="space-y-2">
            {Object.entries(flowsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[status as FlowStatus] || "bg-gray-100 text-gray-500"}`}>
                  {status}
                </span>
                <div className="flex items-center gap-2 flex-1 ml-3">
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-green-500 h-1.5 rounded-full"
                      style={{ width: `${(count / LIVE_FLOWS.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 font-mono w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flows by Type */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-xs font-semibold text-gray-700 mb-3">Flows by Type</h3>
          <div className="space-y-2">
            {Object.entries(flowsByType)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-600 w-28 truncate">{type}</span>
                  <div className="flex items-center gap-2 flex-1 ml-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${(count / LIVE_FLOWS.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 font-mono w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Lists by Type */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-xs font-semibold text-gray-700 mb-3">Lists by Type</h3>
          <div className="space-y-2">
            {Object.entries(listsByType)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    type === "sms"
                      ? "bg-purple-100 text-purple-700"
                      : type === "general"
                        ? "bg-gray-100 text-gray-500"
                        : "bg-blue-100 text-blue-700"
                  }`}>
                    {type}
                  </span>
                  <div className="flex items-center gap-2 flex-1 ml-3">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-purple-500 h-1.5 rounded-full"
                        style={{ width: `${(count / LIVE_LISTS.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 font-mono w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Flows Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">
            All Flows
            <span className="ml-2 text-xs text-gray-400 font-normal">
              {LIVE_FLOWS.length} total
            </span>
          </h2>
        </div>
        <FlowTable flows={LIVE_FLOWS} />
      </div>

      {/* Lists Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">
            All Lists
            <span className="ml-2 text-xs text-gray-400 font-normal">
              {LIVE_LISTS.length} total
            </span>
          </h2>
        </div>
        <ListTable lists={LIVE_LISTS} />
      </div>

      {/* Segments */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          Segments
          <span className="ml-2 text-xs text-gray-400 font-normal">
            {LIVE_SEGMENTS.length} total
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {LIVE_SEGMENTS.map((s) => (
            <div key={s.id} className="border border-gray-100 rounded-lg p-3">
              <div className="flex items-start justify-between">
                <p className="text-xs font-medium text-gray-900">{s.name}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  s.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {s.isActive ? "active" : "inactive"}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                Group: {s.segmentGroup} &middot; ID: {s.id}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          Key Metrics
          <span className="ml-2 text-xs text-gray-400 font-normal">
            {KEY_METRICS.length} tracked
          </span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {KEY_METRICS.map((m) => (
            <div key={m.id} className="flex items-center gap-2 px-3 py-2 border border-gray-100 rounded-lg">
              <span className={`w-2 h-2 rounded-full ${
                m.category === "eCommerce"
                  ? "bg-green-500"
                  : m.category === "Internal"
                    ? "bg-blue-500"
                    : "bg-gray-400"
              }`} />
              <div>
                <p className="text-xs text-gray-900">{m.name}</p>
                <p className="text-[10px] text-gray-400">{m.integration}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quizzes */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          Active Quizzes
          <span className="ml-2 text-xs text-gray-400 font-normal">
            {QUIZ_METRICS.length} configured
          </span>
        </h2>
        <div className="flex flex-wrap gap-2">
          {QUIZ_METRICS.map((q) => (
            <div key={q.id} className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-mono">
                {q.categoryCode}
              </span>
              <span className="text-xs text-gray-700">{q.name}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Gap Analysis Components (from former Delta Dashboard)
// ---------------------------------------------------------------------------

function readinessColor(score: number): string {
  if (score >= 70) return "text-green-700 bg-green-50 border-green-200";
  if (score >= 40) return "text-yellow-700 bg-yellow-50 border-yellow-200";
  return "text-red-700 bg-red-50 border-red-200";
}

function readinessBg(score: number): string {
  if (score >= 70) return "bg-green-500";
  if (score >= 40) return "bg-yellow-500";
  return "bg-red-500";
}

function checkIcon(yes: boolean) {
  return yes ? (
    <span className="text-green-600 font-bold">&#10003;</span>
  ) : (
    <span className="text-red-400">&#10007;</span>
  );
}

function GapCards({ gaps }: { gaps: DeltaSummary["gaps"] }) {
  const items = [
    { label: "No Flows", value: gaps.categoriesWithNoFlows, total: 14 },
    { label: "No Lists", value: gaps.categoriesWithNoLists, total: 14 },
    { label: "No Welcome", value: gaps.categoriesWithNoWelcome, total: 14 },
    { label: "No Abandon", value: gaps.categoriesWithNoAbandonment, total: 14 },
    { label: "Missing Types", value: gaps.totalMissingFlowTypes, total: null },
  ];

  return (
    <div className="grid grid-cols-5 gap-3">
      {items.map((g) => (
        <div
          key={g.label}
          className={`rounded-lg border p-4 text-center ${
            g.value === 0
              ? "bg-green-50 border-green-200"
              : g.value <= 3
                ? "bg-yellow-50 border-yellow-200"
                : "bg-red-50 border-red-200"
          }`}
        >
          <p className="text-2xl font-bold">
            {g.value}
            {g.total !== null && (
              <span className="text-xs font-normal text-gray-400">/{g.total}</span>
            )}
          </p>
          <p className="text-xs text-gray-500 mt-1">{g.label}</p>
        </div>
      ))}
    </div>
  );
}

function ReadinessBar({ cat }: { cat: CategoryDelta }) {
  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="py-2.5 px-3">
        <span className="font-mono text-[10px] text-gray-400 mr-1.5">{cat.code}</span>
        <span className="text-sm font-medium text-gray-800">{cat.name}</span>
      </td>
      <td className="py-2.5 px-3 text-center">
        <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full border ${readinessColor(cat.readiness)}`}>
          {cat.readiness}%
        </span>
      </td>
      <td className="py-2.5 px-3">
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${readinessBg(cat.readiness)}`}
            style={{ width: `${cat.readiness}%` }}
          />
        </div>
      </td>
      <td className="py-2.5 px-3 text-center text-xs">{checkIcon(cat.hasWelcome)}</td>
      <td className="py-2.5 px-3 text-center text-xs">{checkIcon(cat.hasBrowseAbandon)}</td>
      <td className="py-2.5 px-3 text-center text-xs">{checkIcon(cat.hasCartOrCheckout)}</td>
      <td className="py-2.5 px-3 text-center text-xs">{checkIcon(cat.hasPostPurchase)}</td>
      <td className="py-2.5 px-3 text-center text-xs">{checkIcon(cat.hasEmailList)}</td>
      <td className="py-2.5 px-3 text-center text-xs">{checkIcon(cat.hasSMSList)}</td>
      <td className="py-2.5 px-3 text-center">
        <span className="text-xs text-gray-600">
          {cat.liveKlaviyoFlows.length}
          {cat.draftKlaviyoFlows.length > 0 && (
            <span className="text-gray-400"> +{cat.draftKlaviyoFlows.length}d</span>
          )}
        </span>
      </td>
      <td className="py-2.5 px-3 text-center">
        {cat.missingFlowTypes.length === 0 ? (
          <span className="text-green-600 text-xs font-medium">Complete</span>
        ) : (
          <span className="text-xs text-red-500">
            {cat.missingFlowTypes.length} missing
          </span>
        )}
      </td>
    </tr>
  );
}

function GapAnalysisTab() {
  const delta = useMemo(() => buildDeltaSummary(), []);

  return (
    <>
      {/* Delta stats bar */}
      <div className="flex gap-3 text-xs text-gray-400 mb-6">
        <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-full">
          Snapshot: {delta.snapshot.pulledAt}
        </span>
        <span className={`px-2.5 py-1 rounded-full border font-medium ${readinessColor(delta.averageReadiness)}`}>
          Avg Readiness: {delta.averageReadiness}%
        </span>
        <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-full">
          {delta.missingFromKlaviyo.length} flows missing from Klaviyo
        </span>
      </div>

      {/* Gap Summary Cards */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Gap Summary</h2>
        <GapCards gaps={delta.gaps} />
      </section>

      {/* Category Readiness Table */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Category Readiness
        </h2>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
                <th className="py-2.5 px-3 font-semibold">Category</th>
                <th className="py-2.5 px-3 font-semibold text-center">Score</th>
                <th className="py-2.5 px-3 font-semibold" style={{ minWidth: 120 }}>Bar</th>
                <th className="py-2.5 px-3 font-semibold text-center">Welcome</th>
                <th className="py-2.5 px-3 font-semibold text-center">Browse</th>
                <th className="py-2.5 px-3 font-semibold text-center">Cart</th>
                <th className="py-2.5 px-3 font-semibold text-center">Post-P</th>
                <th className="py-2.5 px-3 font-semibold text-center">Email</th>
                <th className="py-2.5 px-3 font-semibold text-center">SMS</th>
                <th className="py-2.5 px-3 font-semibold text-center">Flows</th>
                <th className="py-2.5 px-3 font-semibold text-center">Gaps</th>
              </tr>
            </thead>
            <tbody>
              {delta.categories
                .sort((a, b) => b.readiness - a.readiness)
                .map((cat) => (
                  <ReadinessBar key={cat.code} cat={cat} />
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Top vs Bottom Categories */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <section>
          <h2 className="text-sm font-semibold text-green-700 mb-3">
            Top 5 Categories
          </h2>
          <div className="space-y-2">
            {delta.topCategories.map((cat) => (
              <div
                key={cat.code}
                className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-2.5"
              >
                <div>
                  <span className="font-mono text-[10px] text-green-500 mr-1.5">
                    {cat.code}
                  </span>
                  <span className="text-sm font-medium text-green-800">
                    {cat.name}
                  </span>
                </div>
                <span className="text-sm font-bold text-green-700">
                  {cat.readiness}%
                </span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-red-700 mb-3">
            Bottom 5 Categories
          </h2>
          <div className="space-y-2">
            {delta.bottomCategories.map((cat) => (
              <div
                key={cat.code}
                className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-4 py-2.5"
              >
                <div>
                  <span className="font-mono text-[10px] text-red-400 mr-1.5">
                    {cat.code}
                  </span>
                  <span className="text-sm font-medium text-red-800">
                    {cat.name}
                  </span>
                </div>
                <span className="text-sm font-bold text-red-700">
                  {cat.readiness}%
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Missing from Klaviyo */}
      {delta.missingFromKlaviyo.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Framework Flows Missing from Klaviyo
            <span className="ml-2 text-xs font-normal text-gray-400">
              ({delta.missingFromKlaviyo.length} flows)
            </span>
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
                  <th className="py-2 px-3 font-semibold">Flow ID</th>
                  <th className="py-2 px-3 font-semibold">Name</th>
                  <th className="py-2 px-3 font-semibold">Category</th>
                  <th className="py-2 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {delta.missingFromKlaviyo.map((flow) => (
                  <tr
                    key={flow.id}
                    className="border-t border-gray-100 hover:bg-red-50/30 transition-colors"
                  >
                    <td className="py-2 px-3 text-xs font-mono text-gray-500">
                      {flow.id}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-800">
                      {flow.name}
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {flow.category}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          flow.status === "planned"
                            ? "bg-gray-100 text-gray-500"
                            : flow.status === "draft"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {flow.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Orphaned Items */}
      {(delta.orphanedFlows.length > 0 || delta.orphanedLists.length > 0) && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Orphaned Items
            <span className="ml-2 text-xs font-normal text-gray-400">
              In Klaviyo but not mapped to framework
            </span>
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {delta.orphanedFlows.length > 0 && (
              <div className="bg-white border border-yellow-200 rounded-lg p-4">
                <h3 className="text-xs font-semibold text-yellow-700 mb-2">
                  Unmapped Flows ({delta.orphanedFlows.length})
                </h3>
                <div className="space-y-1.5">
                  {delta.orphanedFlows.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between text-xs"
                    >
                      <span className="text-gray-700 truncate flex-1 mr-2">
                        {item.name}
                      </span>
                      <span className="text-yellow-600 whitespace-nowrap">
                        {item.reason}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {delta.orphanedLists.length > 0 && (
              <div className="bg-white border border-yellow-200 rounded-lg p-4">
                <h3 className="text-xs font-semibold text-yellow-700 mb-2">
                  Unmapped Lists ({delta.orphanedLists.length})
                </h3>
                <div className="space-y-1.5">
                  {delta.orphanedLists.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between text-xs"
                    >
                      <span className="text-gray-700 truncate flex-1 mr-2">
                        {item.name}
                      </span>
                      <span className="text-yellow-600 whitespace-nowrap">
                        {item.reason}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Main Page — Tabbed
// ---------------------------------------------------------------------------

type TabKey = "live" | "gaps";

export default function KlaviyoDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("live");

  const healthScore = useMemo(() => {
    let score = 100;
    const uncatFlows = LIVE_FLOWS.filter((f) => !f.categoryCode).length;
    const uncatLists = LIVE_LISTS.filter((l) => !l.categoryCode).length;
    const liveRatio = LIVE_FLOWS.filter((f) => f.status === "live").length / Math.max(LIVE_FLOWS.length, 1);

    if (uncatFlows / LIVE_FLOWS.length > 0.3) score -= 20;
    else if (uncatFlows / LIVE_FLOWS.length > 0.1) score -= 10;

    if (uncatLists / LIVE_LISTS.length > 0.3) score -= 15;
    else if (uncatLists / LIVE_LISTS.length > 0.1) score -= 5;

    if (liveRatio < 0.5) score -= 10;
    if (QUIZ_METRICS.length >= 5) score = Math.min(100, score + 5);

    return Math.max(0, score);
  }, []);

  const tabs: { key: TabKey; label: string; description: string }[] = [
    { key: "live", label: "Live State", description: "Current Klaviyo flows, lists, segments, and metrics" },
    { key: "gaps", label: "Gap Analysis", description: "Framework expectations vs live Klaviyo state" },
  ];

  return (
    <div className="px-8 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Klaviyo Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Live state and gap analysis — powered by Klaviyo API
          </p>
          <p className="text-[10px] text-gray-400 mt-1">
            Source: {KLAVIYO_SNAPSHOT.source} &middot; Last synced: {KLAVIYO_SNAPSHOT.pulledAt}
          </p>
        </div>
        <HealthBadge score={healthScore} />
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 mb-8 bg-gray-100 rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "live" ? (
        <LiveStateTab healthScore={healthScore} />
      ) : (
        <GapAnalysisTab />
      )}

      {/* Footer */}
      <div className="mt-12 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
        PPW Email Engine v0.17.0 &middot; Phase 17: Section Consolidation
      </div>
    </div>
  );
}
