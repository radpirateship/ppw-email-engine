// ============================================================================
// PPW Email Engine — Klaviyo Sync Dashboard
// Shows live Klaviyo state: flows, lists, segments, metrics, health score
// ============================================================================

"use client";

import { useMemo } from "react";
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

// ---------------------------------------------------------------------------
// Helpers
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
// Components
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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function KlaviyoPage() {
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

  const flowsByStatus = useMemo(() => countBy(LIVE_FLOWS, (f) => f.status), []);
  const flowsByCategory = useMemo(() => countBy(LIVE_FLOWS, (f) => f.categoryCode || ""), []);
  const flowsByType = useMemo(() => countBy(LIVE_FLOWS, (f) => f.flowType), []);
  const listsByType = useMemo(() => countBy(LIVE_LISTS, (l) => l.listType), []);

  return (
    <div className="px-8 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Klaviyo Sync
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Live state pulled from Klaviyo API with auto-classification
          </p>
          <p className="text-[10px] text-gray-400 mt-1">
            Source: {KLAVIYO_SNAPSHOT.source} &middot; Last synced: {KLAVIYO_SNAPSHOT.pulledAt}
          </p>
        </div>
        <HealthBadge score={healthScore} />
      </div>

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

      {/* Distribution Charts (simple text-based) */}
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
    </div>
  );
}
