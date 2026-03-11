// ============================================================================
// PPW Email Engine — Klaviyo Delta Dashboard
// Gap analysis: Framework expectations vs live Klaviyo state
// ============================================================================

"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  buildDeltaSummary,
  type CategoryDelta,
  type DeltaSummary,
} from "@/framework/klaviyo-delta";

// ---------------------------------------------------------------------------
// Helpers
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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function DeltaDashboardPage() {
  const delta = useMemo(() => buildDeltaSummary(), []);

  return (
    <div className="px-8 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <Link href="/klaviyo" className="hover:text-gray-600">
            Klaviyo Sync
          </Link>
          <span>/</span>
          <span className="text-gray-600">Delta Dashboard</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Delta Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Gap analysis — Framework expectations vs live Klaviyo state
        </p>
        <div className="mt-3 flex gap-3 text-xs text-gray-400">
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
            {/* Orphaned Flows */}
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

            {/* Orphaned Lists */}
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

      {/* Footer */}
      <div className="mt-12 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-400">
        <span>
          PPW Email Engine v0.8.1 &middot; Phase 9: Klaviyo Delta Dashboard
        </span>
        <Link
          href="/klaviyo"
          className="text-green-600 hover:text-green-700 font-medium"
        >
          &larr; Back to Klaviyo Sync
        </Link>
      </div>
    </div>
  );
}
