// ============================================================================
// PPW Email Engine — Onboarding Education Center
// Guided implementation checklist with phase-based steps, progress tracking,
// dependency management, time estimates, and milestone rewards.
// ============================================================================

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  type PhaseId,
  type StepStatus,
  type OnboardingStep,
  type Phase,
  type Milestone,
  ALL_STEPS,
  PHASES,
  MILESTONES,
  STEP_COUNTS,
  getStepsByPhase,
  computeStepStatuses,
  computeProgress,
} from "@/framework/onboarding";

// ---------------------------------------------------------------------------
// localStorage key
// ---------------------------------------------------------------------------
const STORAGE_KEY = "ppw-onboarding-completed";

function loadCompleted(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function saveCompleted(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
}

// ---------------------------------------------------------------------------
// Phase color utilities
// ---------------------------------------------------------------------------
const PHASE_COLORS: Record<string, { bg: string; text: string; ring: string; bar: string; light: string }> = {
  blue:   { bg: "bg-blue-50",   text: "text-blue-700",   ring: "ring-blue-200",   bar: "bg-blue-500",   light: "bg-blue-100" },
  green:  { bg: "bg-green-50",  text: "text-green-700",  ring: "ring-green-200",  bar: "bg-green-500",  light: "bg-green-100" },
  purple: { bg: "bg-purple-50", text: "text-purple-700", ring: "ring-purple-200", bar: "bg-purple-500", light: "bg-purple-100" },
  amber:  { bg: "bg-amber-50",  text: "text-amber-700",  ring: "ring-amber-200",  bar: "bg-amber-500",  light: "bg-amber-100" },
};

const DIFFICULTY_STYLES: Record<string, string> = {
  easy:   "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard:   "bg-red-100 text-red-700",
};

// ---------------------------------------------------------------------------
// Component: ProgressBar
// ---------------------------------------------------------------------------
function ProgressBar({ percentage, color }: { percentage: number; color: string }) {
  const c = PHASE_COLORS[color] ?? PHASE_COLORS.blue;
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <div
        className={`h-2 rounded-full transition-all duration-500 ${c.bar}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component: MilestoneCard
// ---------------------------------------------------------------------------
function MilestoneCard({ milestone, unlocked }: { milestone: Milestone; unlocked: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
        unlocked
          ? "bg-green-50 border-green-200 ring-1 ring-green-200"
          : "bg-gray-50 border-gray-200 opacity-50"
      }`}
    >
      <span className="text-2xl">{milestone.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${unlocked ? "text-green-800" : "text-gray-500"}`}>
          {milestone.title}
        </p>
        <p className="text-xs text-gray-500 truncate">{milestone.description}</p>
      </div>
      {unlocked && (
        <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component: StepCard
// ---------------------------------------------------------------------------
function StepCard({
  step,
  status,
  expanded,
  onToggleExpand,
  onToggleComplete,
}: {
  step: OnboardingStep;
  status: StepStatus;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleComplete: () => void;
}) {
  const isLocked = status === "locked";
  const isComplete = status === "complete";

  return (
    <div
      className={`border rounded-lg transition-all ${
        isComplete
          ? "bg-green-50/50 border-green-200"
          : isLocked
          ? "bg-gray-50 border-gray-200 opacity-60"
          : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      {/* Step Header */}
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Checkbox */}
        <button
          onClick={onToggleComplete}
          disabled={isLocked}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            isComplete
              ? "bg-green-600 border-green-600"
              : isLocked
              ? "border-gray-300 cursor-not-allowed"
              : "border-gray-300 hover:border-green-500 cursor-pointer"
          }`}
          title={isLocked ? "Complete prerequisites first" : isComplete ? "Mark incomplete" : "Mark complete"}
        >
          {isComplete && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Title + Meta */}
        <div className="flex-1 min-w-0">
          <button
            onClick={onToggleExpand}
            disabled={isLocked}
            className="w-full text-left"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className={`text-sm font-semibold ${
                  isComplete ? "text-green-800 line-through" : isLocked ? "text-gray-400" : "text-gray-900"
                }`}
              >
                {step.title}
              </h3>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${DIFFICULTY_STYLES[step.difficulty]}`}>
                {step.difficulty}
              </span>
              <span className="text-[10px] text-gray-400">
                ~{step.estimatedMinutes >= 60
                  ? `${Math.floor(step.estimatedMinutes / 60)}h${step.estimatedMinutes % 60 > 0 ? ` ${step.estimatedMinutes % 60}m` : ""}`
                  : `${step.estimatedMinutes}m`}
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isComplete ? "text-green-600" : isLocked ? "text-gray-400" : "text-gray-500"}`}>
              {step.description}
            </p>
          </button>

          {/* Locked dependency hint */}
          {isLocked && step.dependsOn.length > 0 && (
            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Requires: {step.dependsOn.map((d) => {
                const dep = ALL_STEPS.find((s) => s.id === d);
                return dep?.title ?? d;
              }).join(", ")}
            </p>
          )}
        </div>

        {/* Expand chevron */}
        {!isLocked && (
          <button onClick={onToggleExpand} className="mt-0.5 flex-shrink-0 text-gray-400 hover:text-gray-600">
            <svg
              className={`w-5 h-5 transition-transform ${expanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Expanded Instructions */}
      {expanded && !isLocked && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100">
          <ol className="space-y-1.5 ml-1">
            {step.instructions.map((inst, i) => (
              <li key={i} className="flex gap-2 text-xs text-gray-600">
                <span className="text-gray-400 font-mono text-[10px] mt-0.5 flex-shrink-0 w-4 text-right">
                  {i + 1}.
                </span>
                <span>{inst}</span>
              </li>
            ))}
          </ol>

          {/* Action links */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {step.toolLink && step.toolLabel && (
              <Link
                href={step.toolLink}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-md transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {step.toolLabel}
              </Link>
            )}
            {step.externalLink && step.externalLabel && (
              <a
                href={step.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {step.externalLabel}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component: PhaseSection
// ---------------------------------------------------------------------------
function PhaseSection({
  phase,
  steps,
  statuses,
  completedIds,
  expandedStepId,
  phaseProgress,
  onToggleStep,
  onToggleComplete,
  isOpen,
  onToggleOpen,
}: {
  phase: Phase;
  steps: OnboardingStep[];
  statuses: Map<string, StepStatus>;
  completedIds: Set<string>;
  expandedStepId: string | null;
  phaseProgress: { total: number; completed: number; percentage: number };
  onToggleStep: (id: string) => void;
  onToggleComplete: (id: string) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}) {
  const c = PHASE_COLORS[phase.color] ?? PHASE_COLORS.blue;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Phase Header */}
      <button
        onClick={onToggleOpen}
        className={`w-full flex items-center gap-4 px-5 py-4 transition-colors ${
          isOpen ? `${c.bg}` : "bg-white hover:bg-gray-50"
        }`}
      >
        <span className="text-2xl">{phase.icon}</span>
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2">
            <h2 className={`text-base font-bold ${c.text}`}>
              Phase {phase.order}: {phase.name}
            </h2>
            <span className="text-xs text-gray-400">
              {phaseProgress.completed}/{phaseProgress.total}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{phase.description}</p>
          <div className="mt-2 max-w-xs">
            <ProgressBar percentage={phaseProgress.percentage} color={phase.color} />
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
          {phaseProgress.percentage === 100 && (
            <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
              Complete
            </span>
          )}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Phase Steps */}
      {isOpen && (
        <div className="px-5 py-4 space-y-2 bg-white">
          {steps.map((step) => (
            <StepCard
              key={step.id}
              step={step}
              status={statuses.get(step.id) ?? "locked"}
              expanded={expandedStepId === step.id}
              onToggleExpand={() => onToggleStep(step.id)}
              onToggleComplete={() => onToggleComplete(step.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component: NewMilestoneToast
// ---------------------------------------------------------------------------
function NewMilestoneToast({ milestone, onDismiss }: { milestone: Milestone; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <div className="bg-white border border-green-200 rounded-xl shadow-lg p-4 flex items-center gap-3 ring-2 ring-green-300">
        <span className="text-3xl">{milestone.icon}</span>
        <div>
          <p className="text-sm font-bold text-green-800">Milestone Unlocked!</p>
          <p className="text-xs text-green-600">{milestone.title} — {milestone.description}</p>
        </div>
        <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600 ml-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function OnboardingPage() {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [openPhases, setOpenPhases] = useState<Set<PhaseId>>(() => new Set<PhaseId>(["foundation"]));
  const [showMilestones, setShowMilestones] = useState(false);
  const [newMilestone, setNewMilestone] = useState<Milestone | null>(null);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setCompletedIds(loadCompleted());
    setMounted(true);
  }, []);

  // Computed values
  const statuses = useMemo(() => computeStepStatuses(completedIds), [completedIds]);
  const progress = useMemo(() => computeProgress(completedIds), [completedIds]);

  const toggleStep = useCallback((id: string) => {
    setExpandedStep((prev) => (prev === id ? null : id));
  }, []);

  const toggleComplete = useCallback(
    (id: string) => {
      const prevSize = completedIds.size;
      const next = new Set(completedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        const status = statuses.get(id);
        if (status === "locked") return;
        next.add(id);
      }
      setCompletedIds(next);
      saveCompleted(next);

      // Check for new milestones
      const prevMilestones = MILESTONES.filter((m) => prevSize >= m.threshold);
      const nextMilestones = MILESTONES.filter((m) => next.size >= m.threshold);
      if (nextMilestones.length > prevMilestones.length) {
        setNewMilestone(nextMilestones[nextMilestones.length - 1]);
      }
    },
    [completedIds, statuses]
  );

  const togglePhase = useCallback((phaseId: PhaseId) => {
    setOpenPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  }, []);

  const resetProgress = useCallback(() => {
    if (confirm("Reset all onboarding progress? This cannot be undone.")) {
      setCompletedIds(new Set());
      saveCompleted(new Set());
    }
  }, []);

  // Don't render progress values until client is mounted (avoids hydration mismatch)
  if (!mounted) {
    return (
      <div className="px-8 py-8 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-4 bg-gray-200 rounded w-96" />
          <div className="h-32 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Onboarding Education Center
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Step-by-step guide to building your complete email marketing system in Klaviyo
        </p>
      </div>

      {/* Overall Progress Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Overall Progress
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {progress.completed} of {progress.total} steps complete
              {progress.remainingHours > 0 && (
                <> &middot; ~{progress.remainingHours}h remaining</>
              )}
            </p>
          </div>
          <span className="text-2xl font-bold text-green-700">{progress.percentage}%</span>
        </div>
        <ProgressBar percentage={progress.percentage} color="green" />

        {/* Phase Mini Progress */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          {PHASES.map((phase) => {
            const pp = progress.byPhase[phase.id];
            const c = PHASE_COLORS[phase.color] ?? PHASE_COLORS.blue;
            return (
              <div key={phase.id} className="text-center">
                <span className="text-lg">{phase.icon}</span>
                <p className="text-[10px] font-medium text-gray-600 mt-0.5">{phase.name}</p>
                <p className={`text-xs font-bold ${c.text}`}>
                  {pp.completed}/{pp.total}
                </p>
              </div>
            );
          })}
        </div>

        {/* Next milestone hint */}
        {progress.nextMilestone && (
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
            <span className="text-lg">{progress.nextMilestone.icon}</span>
            <p className="text-xs text-gray-500">
              <span className="font-medium text-gray-700">Next milestone:</span>{" "}
              {progress.nextMilestone.title} — complete {progress.nextMilestone.threshold - progress.completed} more step{progress.nextMilestone.threshold - progress.completed !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      {/* Milestones Toggle */}
      <div className="mb-6">
        <button
          onClick={() => setShowMilestones(!showMilestones)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          Milestones ({progress.unlockedMilestones.length}/{MILESTONES.length})
          <svg
            className={`w-4 h-4 transition-transform ${showMilestones ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showMilestones && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {MILESTONES.map((m) => (
              <MilestoneCard
                key={m.id}
                milestone={m}
                unlocked={progress.unlockedMilestones.some((u) => u.id === m.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Phase Sections */}
      <div className="space-y-4">
        {PHASES.map((phase) => (
          <PhaseSection
            key={phase.id}
            phase={phase}
            steps={getStepsByPhase(phase.id)}
            statuses={statuses}
            completedIds={completedIds}
            expandedStepId={expandedStep}
            phaseProgress={progress.byPhase[phase.id]}
            onToggleStep={toggleStep}
            onToggleComplete={toggleComplete}
            isOpen={openPhases.has(phase.id)}
            onToggleOpen={() => togglePhase(phase.id)}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-200 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {progress.total} steps &middot; ~{ALL_STEPS.reduce((s, step) => s + step.estimatedMinutes, 0)} min total estimated time
        </p>
        <button
          onClick={resetProgress}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          Reset progress
        </button>
      </div>

      {/* Milestone Toast */}
      {newMilestone && (
        <NewMilestoneToast
          milestone={newMilestone}
          onDismiss={() => setNewMilestone(null)}
        />
      )}
    </div>
  );
}
