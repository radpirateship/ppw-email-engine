"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  gradeCollectionWithOverrides,
  gradeAllCollections,
  saveOverride,
  type CollectionReport,
  type SystemGradeReport,
  type FlowMatrixItem,
  type InfraItem,
  type LetterGrade,
  type FlowStatusOverride,
} from "@/framework/collection-hub";
import { CATEGORIES, CATEGORY_CODES } from "@/framework/categories";
import type { FlowStatus } from "@/framework/flows";
import {
  computeAllCompletions,
  computeOverallReadiness,
} from "@/framework/completion";

// ============================================================================
// Grade Colors & Helpers
// ============================================================================

const GRADE_STYLES: Record<LetterGrade, { bg: string; text: string; ring: string; glow: string }> = {
  A: { bg: "bg-green-50", text: "text-green-700", ring: "ring-green-200", glow: "shadow-green-100" },
  B: { bg: "bg-blue-50", text: "text-blue-700", ring: "ring-blue-200", glow: "shadow-blue-100" },
  C: { bg: "bg-yellow-50", text: "text-yellow-700", ring: "ring-yellow-200", glow: "shadow-yellow-100" },
  D: { bg: "bg-orange-50", text: "text-orange-700", ring: "ring-orange-200", glow: "shadow-orange-100" },
  F: { bg: "bg-red-50", text: "text-red-700", ring: "ring-red-200", glow: "shadow-red-100" },
};

const STATUS_STYLES: Record<string, { dot: string; bg: string; text: string; label: string }> = {
  live: { dot: "bg-green-500", bg: "bg-green-50", text: "text-green-700", label: "Live" },
  built: { dot: "bg-blue-500", bg: "bg-blue-50", text: "text-blue-700", label: "Built" },
  draft: { dot: "bg-yellow-500", bg: "bg-yellow-50", text: "text-yellow-700", label: "Draft" },
  planned: { dot: "bg-gray-400", bg: "bg-gray-50", text: "text-gray-600", label: "Planned" },
  missing: { dot: "bg-red-400", bg: "bg-red-50", text: "text-red-600", label: "Missing" },
};

function scoreBarColor(score: number): string {
  if (score >= 90) return "bg-green-500";
  if (score >= 75) return "bg-blue-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

// ============================================================================
// Collection Grid Card
// ============================================================================

function CollectionCard({
  report,
  onClick,
}: {
  report: CollectionReport;
  onClick: () => void;
}) {
  const g = GRADE_STYLES[report.letterGrade];
  const cat = report.category;

  return (
    <button
      onClick={onClick}
      className={`text-left w-full rounded-xl border border-gray-200 bg-white p-4 hover:shadow-md transition-all hover:border-gray-300 group`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
              {report.categoryCode}
            </span>
            {cat.hasQuiz && (
              <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                Quiz
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {report.categoryName}
          </h3>
        </div>
        {/* Grade Badge */}
        <div
          className={`w-10 h-10 rounded-lg ${g.bg} ${g.text} ring-1 ${g.ring} flex items-center justify-center text-lg font-bold shadow-sm ${g.glow}`}
        >
          {report.letterGrade}
        </div>
      </div>

      {/* Score Bars */}
      <div className="space-y-1.5 mb-3">
        <ScoreMiniBar label="Flows" score={report.flowCompletionScore} />
        <ScoreMiniBar label="Content" score={report.contentCoverageScore} />
        <ScoreMiniBar label="Infra" score={report.infraScore} />
      </div>

      {/* Bottom stats */}
      <div className="flex items-center justify-between text-[10px] text-gray-400">
        <span>
          {report.completedFlows}/{report.totalFlows} flows done
        </span>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-green-600 font-medium">
          View details →
        </span>
      </div>
    </button>
  );
}

function ScoreMiniBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-gray-400 w-12 text-right">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${scoreBarColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-[10px] font-medium text-gray-500 w-8">{score}%</span>
    </div>
  );
}

// ============================================================================
// Readiness Metrics (from Completion)
// ============================================================================

const TIER_BAR_COLORS: Record<string, string> = {
  "not-started": "bg-gray-300",
  beginning: "bg-red-400",
  building: "bg-yellow-400",
  established: "bg-blue-500",
  advanced: "bg-green-500",
};

const TIER_LABELS: Record<string, string> = {
  "not-started": "Not Started",
  beginning: "Beginning",
  building: "Building",
  established: "Established",
  advanced: "Advanced",
};

function readinessScoreColor(score: number): string {
  if (score === 0) return "text-gray-400";
  if (score < 25) return "text-red-600";
  if (score < 50) return "text-yellow-600";
  if (score < 75) return "text-blue-600";
  return "text-green-600";
}

function ReadinessPanel() {
  const allCompletions = computeAllCompletions();
  const readiness = computeOverallReadiness(allCompletions);
  const total = allCompletions.length;
  const tiers = ["advanced", "established", "building", "beginning", "not-started"] as const;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Readiness Overview
      </h3>
      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Overall</div>
          <div className={`text-2xl font-bold ${readinessScoreColor(readiness.averageScore)}`}>
            {readiness.averageScore}%
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Flows Live</div>
          <div className="text-xl font-bold text-gray-900">
            {readiness.flowsLive}
            <span className="text-xs font-normal text-gray-400"> / {readiness.flowsPlanned}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
            <div className="bg-green-500 h-1 rounded-full" style={{ width: `${readiness.flowsPlanned > 0 ? Math.round((readiness.flowsLive / readiness.flowsPlanned) * 100) : 0}%` }} />
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Lists</div>
          <div className="text-xl font-bold text-gray-900">
            {readiness.listsExist}
            <span className="text-xs font-normal text-gray-400"> / {readiness.listsPlanned}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
            <div className="bg-green-500 h-1 rounded-full" style={{ width: `${readiness.listsPlanned > 0 ? Math.round((readiness.listsExist / readiness.listsPlanned) * 100) : 0}%` }} />
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Segments</div>
          <div className="text-xl font-bold text-gray-900">
            {readiness.segmentsExist}
            <span className="text-xs font-normal text-gray-400"> / {readiness.segmentsPlanned}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
            <div className="bg-green-500 h-1 rounded-full" style={{ width: `${readiness.segmentsPlanned > 0 ? Math.round((readiness.segmentsExist / readiness.segmentsPlanned) * 100) : 0}%` }} />
          </div>
        </div>
      </div>
      {/* Tier distribution bar */}
      <div className="flex rounded-full overflow-hidden h-3 mb-2">
        {tiers.map((tier) => {
          const count = readiness.tierCounts[tier] || 0;
          if (count === 0) return null;
          return (
            <div
              key={tier}
              className={`${TIER_BAR_COLORS[tier]} transition-all`}
              style={{ width: `${(count / total) * 100}%` }}
              title={`${TIER_LABELS[tier]}: ${count}`}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 text-[10px]">
        {tiers.map((tier) => {
          const count = readiness.tierCounts[tier] || 0;
          return (
            <div key={tier} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${TIER_BAR_COLORS[tier]}`} />
              <span className="text-gray-500">
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
// System Summary Header
// ============================================================================

function SystemSummary({ report }: { report: SystemGradeReport }) {
  const g = GRADE_STYLES[report.overallGrade];
  const gradeCounts = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  report.collections.forEach((c) => {
    gradeCounts[c.letterGrade]++;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
      <div className="flex flex-col md:flex-row md:items-center gap-5">
        {/* Overall Grade */}
        <div className="flex items-center gap-4">
          <div
            className={`w-16 h-16 rounded-xl ${g.bg} ${g.text} ring-2 ${g.ring} flex items-center justify-center text-3xl font-bold shadow-sm`}
          >
            {report.overallGrade}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">System Grade</h2>
            <p className="text-sm text-gray-500">
              {report.overallScore}% overall · {report.completionPercent}% flows
              complete
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">
              {report.totalFlowsComplete} / {report.totalFlowsNeeded} flows
            </span>
            <span className="text-xs font-medium text-gray-600">
              {report.completionPercent}%
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${scoreBarColor(report.overallScore)}`}
              style={{ width: `${report.completionPercent}%` }}
            />
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="flex gap-2">
          {(["A", "B", "C", "D", "F"] as LetterGrade[]).map((grade) => {
            const gs = GRADE_STYLES[grade];
            return (
              <div
                key={grade}
                className={`w-10 h-10 rounded-lg ${gs.bg} ${gs.text} flex flex-col items-center justify-center`}
              >
                <span className="text-xs font-bold">{grade}</span>
                <span className="text-[9px]">{gradeCounts[grade]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Collection Detail View — Flow Matrix
// ============================================================================

function FlowMatrixRow({
  item,
  onStatusChange,
}: {
  item: FlowMatrixItem;
  onStatusChange: (flowId: string, status: FlowStatus) => void;
}) {
  const s = STATUS_STYLES[item.status];
  const isQuizNurture = item.flowType === "quiz-nurture";
  const filled = item.contentPositionsFilled.length;
  const total = item.contentPositionsTotal.length;

  // Determine action link based on flow type and status
  const getActionLink = (): { href: string; label: string } | null => {
    if (item.status === "live" || item.status === "built") return null;

    if (isQuizNurture && (item.status === "missing" || item.status === "planned")) {
      return { href: "/copy-generator", label: "Generate Emails" };
    }
    if (item.status === "missing" || item.status === "planned") {
      return { href: "/flow-builder", label: "Build Flow" };
    }
    if (item.status === "draft") {
      return { href: "/flow-builder", label: "Finish Draft" };
    }
    return null;
  };

  const action = getActionLink();

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/50">
      {/* Flow name */}
      <td className="py-3 px-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${s.dot}`} />
          <span className="text-sm font-medium text-gray-900">{item.flowLabel}</span>
        </div>
        <p className="text-[11px] text-gray-400 ml-4 mt-0.5">{item.description}</p>
      </td>

      {/* Status badge */}
      <td className="py-3 px-3">
        <span className={`text-[11px] px-2 py-0.5 rounded-full ${s.bg} ${s.text} font-medium`}>
          {s.label}
        </span>
      </td>

      {/* Emails */}
      <td className="py-3 px-3 text-center">
        <span className="text-sm text-gray-600">{item.emailCount || "—"}</span>
      </td>

      {/* Content Coverage (quiz nurture only) */}
      <td className="py-3 px-3">
        {isQuizNurture ? (
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
              {item.contentPositionsTotal.map((pos) => {
                const isFilled = item.contentPositionsFilled.includes(pos);
                return (
                  <div
                    key={pos}
                    className={`w-3.5 h-3.5 rounded-sm text-[7px] flex items-center justify-center font-mono ${
                      isFilled
                        ? "bg-green-100 text-green-700 ring-1 ring-green-200"
                        : "bg-gray-100 text-gray-400"
                    }`}
                    title={`${pos}: ${isFilled ? "Content mapped" : "Empty"}`}
                  >
                    {pos.replace("E", "")}
                  </div>
                );
              })}
            </div>
            <span className="text-[10px] text-gray-400">
              {filled}/{total}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-gray-300">—</span>
        )}
      </td>

      {/* Action */}
      <td className="py-3 px-3">
        <div className="flex items-center gap-2">
          {action && (
            <Link
              href={action.href}
              className="text-[11px] px-2.5 py-1 rounded-md bg-green-50 text-green-700 hover:bg-green-100 transition-colors font-medium"
            >
              {action.label} →
            </Link>
          )}
          {/* Quick status override */}
          {item.flowId && item.status !== "live" && (
            <select
              value={item.status}
              onChange={(e) =>
                item.flowId && onStatusChange(item.flowId, e.target.value as FlowStatus)
              }
              className="text-[10px] text-gray-400 bg-transparent border border-gray-200 rounded px-1 py-0.5 cursor-pointer hover:border-gray-300"
              title="Override status manually"
            >
              <option value="missing">Missing</option>
              <option value="planned">Planned</option>
              <option value="draft">Draft</option>
              <option value="built">Built</option>
              <option value="live">Live</option>
            </select>
          )}
        </div>
      </td>
    </tr>
  );
}

// ============================================================================
// Infrastructure Checklist
// ============================================================================

function InfraChecklist({ items }: { items: InfraItem[] }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3 py-1.5">
          {/* Check / X icon */}
          {item.exists ? (
            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <div className="flex-1 min-w-0">
            <span className={`text-sm ${item.exists ? "text-gray-700" : "text-gray-500"}`}>
              {item.name}
            </span>
            {item.id && (
              <span className="text-[10px] text-gray-400 ml-2 font-mono">{item.id}</span>
            )}
          </div>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded ${
              item.type === "list"
                ? "bg-indigo-50 text-indigo-600"
                : "bg-purple-50 text-purple-600"
            }`}
          >
            {item.type}
          </span>
          {!item.exists && (
            <Link
              href="/klaviyo"
              className="text-[10px] px-2 py-0.5 rounded bg-green-50 text-green-700 hover:bg-green-100 transition-colors font-medium"
            >
              Create in Klaviyo →
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Content Gap Analysis
// ============================================================================

function ContentGaps({ report }: { report: CollectionReport }) {
  const inv = report.contentInventory;
  const quizRow = report.flowMatrix.find((f) => f.flowType === "quiz-nurture");

  if (!quizRow) return null;

  const emptyPositions = quizRow.contentPositionsTotal.filter(
    (p) => !quizRow.contentPositionsFilled.includes(p)
  );

  return (
    <div className="space-y-4">
      {/* Content inventory */}
      {inv && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-700">Content Library</h4>
            <span className="text-xs text-gray-400">{inv.articleCount} articles</span>
          </div>
          <p className="text-xs text-gray-500 mb-2">
            Pillar: <span className="font-medium text-gray-700">{inv.pillarContent}</span>
          </p>
          <div className="flex flex-wrap gap-1">
            {inv.contentAreas.map((area, i) => (
              <span key={i} className="text-[10px] bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-500">
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Empty positions */}
      {emptyPositions.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Unfilled Email Positions ({emptyPositions.length})
          </h4>
          <div className="space-y-1.5">
            {emptyPositions.map((pos) => (
              <div
                key={pos}
                className="flex items-center justify-between bg-red-50/50 rounded-lg px-3 py-2 border border-red-100"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                    {pos}
                  </span>
                  <span className="text-xs text-gray-600">Needs content</span>
                </div>
                <Link
                  href="/copy-generator"
                  className="text-[11px] px-2.5 py-1 rounded-md bg-green-50 text-green-700 hover:bg-green-100 transition-colors font-medium"
                >
                  Generate →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {emptyPositions.length === 0 && (
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <span className="text-sm text-green-700 font-medium">
            All email positions have content mapped
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Next Steps / Gap Filler
// ============================================================================

function NextSteps({ report }: { report: CollectionReport }) {
  const steps: { priority: number; label: string; href: string; desc: string; color: string }[] = [];

  // Missing infrastructure
  const missingInfra = report.infraItems.filter((i) => i.required && !i.exists);
  if (missingInfra.length > 0) {
    steps.push({
      priority: 1,
      label: "Set Up Infrastructure",
      href: "/klaviyo",
      desc: `${missingInfra.length} missing list${missingInfra.length > 1 ? "s" : ""}/segment${missingInfra.length > 1 ? "s" : ""} needed in Klaviyo`,
      color: "border-red-200 bg-red-50",
    });
  }

  // Quiz nurture content gaps
  const quizRow = report.flowMatrix.find((f) => f.flowType === "quiz-nurture");
  if (quizRow) {
    const empty = quizRow.contentPositionsTotal.filter(
      (p) => !quizRow.contentPositionsFilled.includes(p)
    );
    if (empty.length > 0) {
      steps.push({
        priority: 2,
        label: "Write Nurture Emails",
        href: "/copy-generator",
        desc: `${empty.length} of 11 email positions need content (${empty.join(", ")})`,
        color: "border-orange-200 bg-orange-50",
      });
    }
  }

  // Missing flows
  const missingFlows = report.flowMatrix.filter((f) => f.status === "missing");
  if (missingFlows.length > 0) {
    steps.push({
      priority: 3,
      label: "Create Missing Flows",
      href: "/flow-builder",
      desc: `${missingFlows.length} flow${missingFlows.length > 1 ? "s" : ""} not yet defined: ${missingFlows.map((f) => f.flowLabel).join(", ")}`,
      color: "border-red-200 bg-red-50",
    });
  }

  // Draft flows
  const draftFlows = report.flowMatrix.filter((f) => f.status === "draft");
  if (draftFlows.length > 0) {
    steps.push({
      priority: 4,
      label: "Finish Draft Flows",
      href: "/flow-builder",
      desc: `${draftFlows.length} flow${draftFlows.length > 1 ? "s" : ""} in draft: ${draftFlows.map((f) => f.flowLabel).join(", ")}`,
      color: "border-yellow-200 bg-yellow-50",
    });
  }

  // Planned flows
  const plannedFlows = report.flowMatrix.filter((f) => f.status === "planned");
  if (plannedFlows.length > 0) {
    steps.push({
      priority: 5,
      label: "Start Planned Flows",
      href: "/flow-builder",
      desc: `${plannedFlows.length} flow${plannedFlows.length > 1 ? "s" : ""} planned but not started`,
      color: "border-gray-200 bg-gray-50",
    });
  }

  if (steps.length === 0) {
    return (
      <div className="bg-green-50 rounded-xl border border-green-200 p-6 text-center">
        <div className="text-2xl mb-2">🎉</div>
        <h3 className="text-lg font-bold text-green-800">Collection Complete!</h3>
        <p className="text-sm text-green-600 mt-1">
          All flows, content, and infrastructure are in place.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        Next Steps to Improve Grade
      </h3>
      {steps.sort((a, b) => a.priority - b.priority).map((step, i) => (
        <Link
          key={i}
          href={step.href}
          className={`block rounded-lg border ${step.color} p-3 hover:shadow-sm transition-shadow group`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-900">{step.label}</span>
              <p className="text-[11px] text-gray-500 mt-0.5">{step.desc}</p>
            </div>
            <span className="text-xs text-green-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Go →
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

// ============================================================================
// Collection Detail Panel
// ============================================================================

function CollectionDetail({
  report,
  onBack,
  onRefresh,
}: {
  report: CollectionReport;
  onBack: () => void;
  onRefresh: () => void;
}) {
  const g = GRADE_STYLES[report.letterGrade];
  const [activeTab, setActiveTab] = useState<"flows" | "content" | "infra">("flows");

  const handleStatusChange = (flowId: string, status: FlowStatus) => {
    saveOverride(flowId, status);
    onRefresh();
  };

  return (
    <div>
      {/* Back + Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All Collections
        </button>
      </div>

      {/* Title + Grade */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div
            className={`w-14 h-14 rounded-xl ${g.bg} ${g.text} ring-2 ${g.ring} flex items-center justify-center text-2xl font-bold shadow-sm`}
          >
            {report.letterGrade}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">{report.categoryName}</h2>
              <span className="text-xs font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                {report.categoryCode}
              </span>
              {report.category.hasQuiz && (
                <span className="text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                  Quiz Enabled
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              Overall: {report.overallScore}% · {report.completedFlows}/{report.totalFlows} flows complete
            </p>
          </div>
        </div>

        {/* Score breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <ScoreCard label="Flow Completion" score={report.flowCompletionScore} weight="50%" />
          <ScoreCard label="Content Coverage" score={report.contentCoverageScore} weight="30%" />
          <ScoreCard label="Infrastructure" score={report.infraScore} weight="20%" />
        </div>
      </div>

      {/* Next Steps (the key generation point!) */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <NextSteps report={report} />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {[
            { key: "flows" as const, label: "Flow Matrix", count: report.totalFlows },
            { key: "content" as const, label: "Content", count: null },
            { key: "infra" as const, label: "Infrastructure", count: report.infraItems.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.key
                  ? "border-green-600 text-green-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="ml-1.5 text-[10px] text-gray-400">({tab.count})</span>
              )}
            </button>
          ))}
        </div>

        <div className="p-4">
          {activeTab === "flows" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                    <th className="text-left py-2 px-3 font-semibold">Flow</th>
                    <th className="text-left py-2 px-3 font-semibold">Status</th>
                    <th className="text-center py-2 px-3 font-semibold">Emails</th>
                    <th className="text-left py-2 px-3 font-semibold">Content (E1-E11)</th>
                    <th className="text-left py-2 px-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {report.flowMatrix.map((item) => (
                    <FlowMatrixRow
                      key={item.flowType}
                      item={item}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "content" && <ContentGaps report={report} />}

          {activeTab === "infra" && <InfraChecklist items={report.infraItems} />}
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ label, score, weight }: { label: string; score: number; weight: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-medium text-gray-500">{label}</span>
        <span className="text-[10px] text-gray-400">{weight}</span>
      </div>
      <div className="text-xl font-bold text-gray-900">{score}%</div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1.5">
        <div
          className={`h-full rounded-full ${scoreBarColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function CollectionsPage() {
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [reports, setReports] = useState<CollectionReport[]>([]);
  const [systemReport, setSystemReport] = useState<SystemGradeReport | null>(null);
  const [sortBy, setSortBy] = useState<"grade" | "name" | "score">("grade");

  const loadData = useCallback(() => {
    const sys = gradeAllCollections();
    // Also apply overrides to individual reports
    const withOverrides = CATEGORY_CODES.map((code) =>
      gradeCollectionWithOverrides(code)
    );
    setReports(withOverrides);
    setSystemReport({
      ...sys,
      collections: withOverrides,
      overallScore: Math.round(
        withOverrides.reduce((sum, c) => sum + c.overallScore, 0) / withOverrides.length
      ),
      overallGrade:
        Math.round(
          withOverrides.reduce((sum, c) => sum + c.overallScore, 0) / withOverrides.length
        ) >= 90
          ? "A"
          : Math.round(
              withOverrides.reduce((sum, c) => sum + c.overallScore, 0) / withOverrides.length
            ) >= 75
          ? "B"
          : Math.round(
              withOverrides.reduce((sum, c) => sum + c.overallScore, 0) / withOverrides.length
            ) >= 60
          ? "C"
          : Math.round(
              withOverrides.reduce((sum, c) => sum + c.overallScore, 0) / withOverrides.length
            ) >= 40
          ? "D"
          : "F",
      totalFlowsNeeded: withOverrides.reduce((s, c) => s + c.totalFlows, 0),
      totalFlowsComplete: withOverrides.reduce((s, c) => s + c.completedFlows, 0),
      completionPercent:
        withOverrides.reduce((s, c) => s + c.totalFlows, 0) > 0
          ? Math.round(
              (withOverrides.reduce((s, c) => s + c.completedFlows, 0) /
                withOverrides.reduce((s, c) => s + c.totalFlows, 0)) *
                100
            )
          : 0,
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const sorted = [...reports].sort((a, b) => {
    if (sortBy === "grade") {
      const gradeOrder: Record<LetterGrade, number> = { A: 0, B: 1, C: 2, D: 3, F: 4 };
      const diff = gradeOrder[a.letterGrade] - gradeOrder[b.letterGrade];
      return diff !== 0 ? diff : b.overallScore - a.overallScore;
    }
    if (sortBy === "name") return a.categoryName.localeCompare(b.categoryName);
    return b.overallScore - a.overallScore;
  });

  const selectedReport = selectedCat
    ? reports.find((r) => r.categoryCode === selectedCat)
    : null;

  if (!systemReport) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Collection Hub</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Grade each collection · Find gaps · Build what&apos;s missing
          </p>
        </div>
        {!selectedCat && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Sort:</span>
            {(["grade", "score", "name"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                  sortBy === s
                    ? "bg-green-50 text-green-700 font-medium"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* System summary + readiness (only in grid view) */}
      {!selectedCat && (
        <>
          <SystemSummary report={systemReport} />
          <ReadinessPanel />
        </>
      )}

      {/* Grid or Detail */}
      {selectedCat && selectedReport ? (
        <CollectionDetail
          report={selectedReport}
          onBack={() => setSelectedCat(null)}
          onRefresh={() => {
            loadData();
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {sorted.map((r) => (
            <CollectionCard
              key={r.categoryCode}
              report={r}
              onClick={() => setSelectedCat(r.categoryCode)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
