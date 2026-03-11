// ============================================================================
// PPW Email Engine — Klaviyo Template Management Page
// View, preview, and track email templates across categories
// ============================================================================

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES, CATEGORY_CODES } from "@/framework/categories";
import {
  buildTemplateInventory,
  getCategoryTemplatePreviews,
  type TemplateInventorySummary,
  type CategoryTemplateInventory,
} from "@/framework/template-push";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function completionColor(pct: number): string {
  if (pct >= 80) return "text-green-700 bg-green-50 border-green-200";
  if (pct >= 40) return "text-yellow-700 bg-yellow-50 border-yellow-200";
  return "text-red-700 bg-red-50 border-red-200";
}

function completionBg(pct: number): string {
  if (pct >= 80) return "bg-green-500";
  if (pct >= 40) return "bg-yellow-500";
  return "bg-red-500";
}

function statusBadge(status: string): string {
  switch (status) {
    case "pushed":
      return "bg-green-100 text-green-700";
    case "generated":
      return "bg-blue-100 text-blue-700";
    case "error":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-500";
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SummaryCards({ inv }: { inv: TemplateInventorySummary }) {
  const items = [
    { label: "Total Templates", value: inv.totalTemplates, sub: `${inv.categories.length} categories` },
    { label: "Generated", value: inv.totalGenerated, sub: `${Math.round((inv.totalGenerated / inv.totalTemplates) * 100)}% ready` },
    { label: "Pushed to Klaviyo", value: inv.totalPushed, sub: `${inv.overallCompletionPct}% deployed` },
    { label: "Quiz Categories", value: inv.quizCategoryCount, sub: `${inv.quizCategoryCount * 11} templates` },
    { label: "Errors", value: inv.totalErrors, sub: inv.totalErrors === 0 ? "All clear" : "Needs attention" },
  ];

  return (
    <div className="grid grid-cols-5 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-lg border p-4 text-center ${
            item.label === "Errors"
              ? item.value === 0
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
              : "bg-white border-gray-200"
          }`}
        >
          <p className="text-2xl font-bold text-gray-900">{item.value}</p>
          <p className="text-xs font-medium text-gray-600 mt-1">{item.label}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{item.sub}</p>
        </div>
      ))}
    </div>
  );
}

function CategoryRow({ cat }: { cat: CategoryTemplateInventory }) {
  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="py-2.5 px-3">
        <span className="font-mono text-[10px] text-gray-400 mr-1.5">{cat.code}</span>
        <span className="text-sm font-medium text-gray-800">{cat.name}</span>
        {cat.hasQuiz && (
          <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600 font-medium">
            Quiz
          </span>
        )}
      </td>
      <td className="py-2.5 px-3 text-center">
        <span className="text-sm font-medium text-gray-700">{cat.totalExpected}</span>
      </td>
      <td className="py-2.5 px-3 text-center">
        <span className="text-sm font-bold text-blue-600">{cat.generated}</span>
      </td>
      <td className="py-2.5 px-3 text-center">
        <span className="text-sm font-bold text-green-600">{cat.pushed}</span>
      </td>
      <td className="py-2.5 px-3">
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${completionBg(cat.completionPct)}`}
            style={{ width: `${Math.max(cat.completionPct, 2)}%` }}
          />
        </div>
      </td>
      <td className="py-2.5 px-3 text-center">
        <span
          className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full border ${completionColor(cat.completionPct)}`}
        >
          {cat.completionPct}%
        </span>
      </td>
      <td className="py-2.5 px-3 text-center">
        {cat.errors > 0 ? (
          <span className="text-xs text-red-500 font-medium">{cat.errors} errors</span>
        ) : (
          <span className="text-green-600 text-xs">&#10003;</span>
        )}
      </td>
    </tr>
  );
}

function TemplatePreviewPanel({ categoryCode }: { categoryCode: string }) {
  const previews = useMemo(
    () => getCategoryTemplatePreviews(categoryCode),
    [categoryCode]
  );
  const cat = CATEGORIES[categoryCode as keyof typeof CATEGORIES];

  if (!cat || previews.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div>
          <span className="font-mono text-[10px] text-gray-400 mr-1.5">{categoryCode}</span>
          <span className="text-sm font-semibold text-gray-800">{cat.name}</span>
          <span className="ml-2 text-xs text-gray-400">{previews.length} templates</span>
        </div>
        <span className="text-[10px] text-gray-400">
          45-day nurture flow
        </span>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-gray-500 bg-gray-50/50">
            <th className="py-2 px-4 font-semibold">Position</th>
            <th className="py-2 px-4 font-semibold">Day</th>
            <th className="py-2 px-4 font-semibold">Subject</th>
            <th className="py-2 px-4 font-semibold">Purpose</th>
            <th className="py-2 px-4 font-semibold text-center">Vars</th>
            <th className="py-2 px-4 font-semibold text-center">Size</th>
          </tr>
        </thead>
        <tbody>
          {previews.map((p) => (
            <tr
              key={p.templateName}
              className="border-t border-gray-100 hover:bg-blue-50/30 transition-colors"
            >
              <td className="py-2 px-4">
                <span className="text-xs font-mono font-bold text-blue-600">{p.position}</span>
              </td>
              <td className="py-2 px-4 text-xs text-gray-600">Day {p.day}</td>
              <td className="py-2 px-4 text-xs text-gray-700 max-w-[240px] truncate">
                {p.subject}
              </td>
              <td className="py-2 px-4 text-xs text-gray-500">{p.purpose}</td>
              <td className="py-2 px-4 text-center text-xs text-gray-500">
                {p.variableCount}
                {p.conditionalCount > 0 && (
                  <span className="text-purple-500 ml-1">+{p.conditionalCount}c</span>
                )}
              </td>
              <td className="py-2 px-4 text-center text-[10px] text-gray-400">
                {(p.htmlLength / 1024).toFixed(1)}kb
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function TemplatesPage() {
  const inventory = useMemo(() => buildTemplateInventory(), []);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  // Sort categories: quiz categories first, then alphabetical
  const sortedCategories = useMemo(
    () =>
      [...inventory.categories].sort((a, b) => {
        if (a.hasQuiz !== b.hasQuiz) return a.hasQuiz ? -1 : 1;
        return a.name.localeCompare(b.name);
      }),
    [inventory.categories]
  );

  return (
    <div className="px-8 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <Link href="/klaviyo" className="hover:text-gray-600">
            Klaviyo Sync
          </Link>
          <span>/</span>
          <span className="text-gray-600">Template Manager</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Template Manager
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Email template inventory — generate, preview, and push to Klaviyo
        </p>
        <div className="mt-3 flex gap-3 text-xs text-gray-400">
          <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-full">
            {inventory.totalTemplates} total templates
          </span>
          <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-full">
            {inventory.quizCategoryCount} quiz categories &middot; {inventory.nonQuizCategoryCount} non-quiz
          </span>
          <span
            className={`px-2.5 py-1 rounded-full border font-medium ${completionColor(inventory.overallCompletionPct)}`}
          >
            {inventory.overallCompletionPct}% pushed to Klaviyo
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Overview</h2>
        <SummaryCards inv={inventory} />
      </section>

      {/* Category Template Table */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Category Template Status
        </h2>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
                <th className="py-2.5 px-3 font-semibold">Category</th>
                <th className="py-2.5 px-3 font-semibold text-center">Expected</th>
                <th className="py-2.5 px-3 font-semibold text-center">Generated</th>
                <th className="py-2.5 px-3 font-semibold text-center">Pushed</th>
                <th className="py-2.5 px-3 font-semibold" style={{ minWidth: 100 }}>
                  Progress
                </th>
                <th className="py-2.5 px-3 font-semibold text-center">Score</th>
                <th className="py-2.5 px-3 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedCategories.map((cat) => (
                <CategoryRow key={cat.code} cat={cat} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Template Preview by Category */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Template Previews
          <span className="ml-2 text-xs font-normal text-gray-400">
            Click a category to expand
          </span>
        </h2>
        <div className="space-y-2">
          {sortedCategories.map((cat) => (
            <div key={cat.code}>
              <button
                onClick={() =>
                  setExpandedCat(expandedCat === cat.code ? null : cat.code)
                }
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                  expandedCat === cat.code
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-gray-400">
                    {cat.code}
                  </span>
                  <span>{cat.name}</span>
                  {cat.hasQuiz && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600 font-medium">
                      Quiz
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    {cat.generated} templates
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      expandedCat === cat.code ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>
              {expandedCat === cat.code && (
                <div className="mt-2 ml-4">
                  <TemplatePreviewPanel categoryCode={cat.code} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div className="mt-12 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-400">
        <span>
          PPW Email Engine v0.10.0 &middot; Phase 10: Campaign Calendar
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
