// ============================================================================
// PPW Email Engine — Onboarding Education Center
// Guided implementation checklist with process explanation, phase-based steps,
// progress tracking, dependency management, time estimates, milestone rewards,
// and a "How This System Works" explainer.
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
import { FLOW_COUNTS } from "@/framework/flows";

// ---------------------------------------------------------------------------
// localStorage key
// ---------------------------------------------------------------------------
const STORAGE_KEY = "ppw-onboarding-completed";
const EXPLAINER_DISMISSED_KEY = "ppw-explainer-dismissed";

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

function loadExplainerDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(EXPLAINER_DISMISSED_KEY) === "true";
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
// Component: SystemExplainer
// ---------------------------------------------------------------------------
function SystemExplainer({ onDismiss }: { onDismiss: () => void }) {
  const [activeTab, setActiveTab] = useState<"overview" | "architecture" | "workflow">("overview");

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">How This Email System Works</h2>
            <p className="text-green-100 text-sm mt-1">
              A quick guide to the PPW Email Engine architecture before you start building
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="text-green-200 hover:text-white transition-colors flex-shrink-0 mt-1"
            title="Dismiss — you can bring this back from the header"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          {[
            { id: "overview" as const, label: "The Big Picture" },
            { id: "architecture" as const, label: "Architecture" },
            { id: "workflow" as const, label: "Your Workflow" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-green-700"
                  : "text-green-100 hover:bg-green-500/30"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 py-5">
        {activeTab === "overview" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              The PPW Email Engine is a complete email marketing system designed for Peak Primal Wellness.
              It manages <span className="font-semibold text-green-700">{FLOW_COUNTS.total} automated flows</span> across
              {" "}<span className="font-semibold text-green-700">14 product categories</span> (saunas, cold plunges, red light therapy, and more).
              Everything is connected — from the moment someone takes a quiz on your site to their first purchase, follow-up, and beyond.
            </p>

            {/* What are flows? */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📬</span>
                  <h3 className="text-sm font-bold text-blue-800">What are Flows?</h3>
                </div>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Flows are automated email sequences triggered by customer actions. When someone takes a quiz,
                  abandons their cart, or makes a purchase, Klaviyo automatically sends the right emails at the
                  right time. You build them once, and they run 24/7.
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🏷️</span>
                  <h3 className="text-sm font-bold text-purple-800">Why so many categories?</h3>
                </div>
                <p className="text-xs text-purple-700 leading-relaxed">
                  PPW sells high-ticket wellness equipment across many categories. Each category needs tailored
                  messaging — a sauna buyer has different concerns than a cold plunge buyer. The naming system
                  (SAU, CLD, RLT, etc.) keeps everything organized across hundreds of assets.
                </p>
              </div>

              <div className="bg-amber-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">💰</span>
                  <h3 className="text-sm font-bold text-amber-800">Why price tiers?</h3>
                </div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Someone browsing a $200 accessory gets a different experience than someone considering a $5,000
                  sauna. High-value cart abandoners get more emails, personal outreach, and financing info.
                  Entry-level gets a shorter, faster sequence.
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🎯</span>
                  <h3 className="text-sm font-bold text-green-800">What does this dashboard do?</h3>
                </div>
                <p className="text-xs text-green-700 leading-relaxed">
                  This app is your command center. It generates email copy, tracks what&apos;s been built vs planned,
                  syncs with Klaviyo, manages your content pipeline, and guides you through the entire
                  implementation step by step. You&apos;re looking at the guided onboarding now.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "architecture" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              Here&apos;s how all the pieces connect. The system has four layers that work together:
            </p>

            {/* Architecture layers */}
            <div className="space-y-3">
              {[
                {
                  num: "1",
                  title: "Foundation Layer (Klaviyo Setup)",
                  color: "blue",
                  items: [
                    "Lists — subscriber containers (Master, Category, Quiz, Exclusion)",
                    "Segments — dynamic groups based on behavior (Hot Leads, VIP, Recent Buyers)",
                    "Tags — organizational labels applied to flows, campaigns, and templates",
                  ],
                  note: "Think of this as the filing system. Everything that comes later depends on these being set up correctly.",
                },
                {
                  num: "2",
                  title: "Flow Layer (Automated Sequences)",
                  color: "green",
                  items: [
                    `Entry flows (${FLOW_COUNTS.entry}) — welcome sequences and 45-day quiz nurtures`,
                    `Engagement flows (${FLOW_COUNTS.engagement}) — browse, cart, and checkout abandonment`,
                    `Post-purchase flows (${FLOW_COUNTS["post-purchase"]}) — order follow-up and upsells`,
                    `Lifecycle flows (${FLOW_COUNTS.lifecycle}) — winback, VIP, and sunset`,
                  ],
                  note: "Each flow is a series of emails triggered by customer actions. Some are tiered by purchase value.",
                },
                {
                  num: "3",
                  title: "Content Layer (Email Copy & Templates)",
                  color: "purple",
                  items: [
                    "Style system — brand colors, fonts, and layout for all emails",
                    "Copy Generator — AI-assisted email writing tuned to your brand voice",
                    "Template Manager — reusable Klaviyo templates for each email type",
                    "Content Pipeline — maps blog posts and articles to email positions",
                  ],
                  note: "Content is generated per-category with the right product focus, then loaded into Klaviyo templates.",
                },
                {
                  num: "4",
                  title: "Execution Layer (Campaigns & Optimization)",
                  color: "amber",
                  items: [
                    "Campaign Calendar — scheduled sends for newsletters, promos, and seasonal content",
                    "A/B Testing — subject lines, send times, and content variants",
                    "Revenue Attribution — tracking which flows and campaigns drive revenue",
                    "Deliverability — list hygiene, bounce monitoring, and sunset flows",
                  ],
                  note: "Once flows are live, this layer is where ongoing optimization happens.",
                },
              ].map((layer) => {
                const c = PHASE_COLORS[layer.color] ?? PHASE_COLORS.blue;
                return (
                  <div key={layer.num} className={`${c.bg} rounded-lg p-4`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-6 h-6 rounded-full ${c.bar} text-white text-xs font-bold flex items-center justify-center flex-shrink-0`}>
                        {layer.num}
                      </span>
                      <h3 className={`text-sm font-bold ${c.text}`}>{layer.title}</h3>
                    </div>
                    <ul className="space-y-1 mb-2">
                      {layer.items.map((item, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                          <span className="text-gray-400 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-[11px] text-gray-500 italic">{layer.note}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "workflow" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              Here&apos;s the order you should work through everything. The onboarding steps below follow this exact sequence,
              but here&apos;s the high-level view:
            </p>

            {/* Workflow steps */}
            <div className="relative">
              {[
                { step: "1", title: "Set up the foundation in Klaviyo", desc: "Create lists, segments, and tags using the naming conventions. This takes about 2 hours and unlocks everything else.", status: "foundation" },
                { step: "2", title: "Configure your email branding", desc: "Set colors, fonts, and layout in the Style Editor. All generated emails will use these settings.", status: "foundation" },
                { step: "3", title: "Build your first welcome flow", desc: "The 3-email welcome popup flow. This is the simplest flow and gets you comfortable with the process.", status: "core" },
                { step: "4", title: "Build your first quiz nurture", desc: "The 11-email, 45-day sequence for your top quiz. This is the most complex flow type — the rest follow the same pattern.", status: "core" },
                { step: "5", title: "Build abandonment flows", desc: "Browse → Cart → Checkout abandonment. These catch potential revenue that's walking away.", status: "core" },
                { step: "6", title: "Build post-purchase flow", desc: "Turn buyers into repeat customers and reviewers. This completes the core customer journey.", status: "core" },
                { step: "7", title: "Expand to more categories", desc: "Repeat quiz nurtures for additional categories. Each one follows the same template.", status: "expansion" },
                { step: "8", title: "Add lifecycle flows", desc: "Winback, VIP, and sunset flows to maintain list health and reward top customers.", status: "expansion" },
                { step: "9", title: "Optimize and iterate", desc: "A/B test, monitor deliverability, execute campaigns, and refresh content quarterly.", status: "optimization" },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 mb-4 last:mb-0">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      item.status === "foundation" ? "bg-blue-100 text-blue-700" :
                      item.status === "core" ? "bg-green-100 text-green-700" :
                      item.status === "expansion" ? "bg-purple-100 text-purple-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {item.step}
                    </div>
                    {i < 8 && <div className="w-0.5 h-full bg-gray-200 mt-1" />}
                  </div>
                  <div className="pb-1">
                    <h4 className="text-sm font-semibold text-gray-900">{item.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick links */}
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <p className="text-xs font-semibold text-gray-700 mb-2">Quick links to get started:</p>
              <div className="flex flex-wrap gap-2">
                <Link href="/kanban" className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-md transition-colors border border-green-200">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                  </svg>
                  Kanban Board — track all tasks
                </Link>
                <Link href="/framework" className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors border border-blue-200">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Framework — naming conventions
                </Link>
                <Link href="/style-editor" className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-md transition-colors border border-purple-200">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  Style Editor — email branding
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component: GoalCard — replaces the simple milestone system
// ---------------------------------------------------------------------------
interface Goal {
  id: string;
  title: string;
  description: string;
  icon: string;
  stepsRequired: string[];
  reward: string;
}

const GOALS: Goal[] = [
  {
    id: "G01",
    title: "Foundation Ready",
    description: "All lists, segments, tags, and popups configured in Klaviyo",
    icon: "🏗️",
    stepsRequired: ["F01-review-naming", "F02-create-master-lists", "F03-create-category-lists", "F04-create-exclusion-lists", "F05-setup-tags", "F06-create-core-segments", "F07-connect-popups", "F08-email-style-setup"],
    reward: "Your Klaviyo workspace is organized and ready for flows!",
  },
  {
    id: "G02",
    title: "First Flow Live",
    description: "Welcome popup flow built and active in Klaviyo",
    icon: "⚡",
    stepsRequired: ["CF01-welcome-popup-flow"],
    reward: "New subscribers are now getting automated welcome emails!",
  },
  {
    id: "G03",
    title: "Revenue Recovery Active",
    description: "All three abandonment flows live — catching lost revenue 24/7",
    icon: "💸",
    stepsRequired: ["CF03-browse-abandon", "CF04-cart-abandon", "CF05-checkout-abandon"],
    reward: "You're now recovering revenue from browse, cart, and checkout abandoners!",
  },
  {
    id: "G04",
    title: "Full Customer Journey",
    description: "Complete path from first visit to post-purchase follow-up",
    icon: "🎯",
    stepsRequired: ["CF01-welcome-popup-flow", "CF03-browse-abandon", "CF04-cart-abandon", "CF05-checkout-abandon", "CF06-post-purchase"],
    reward: "Every stage of the customer journey is now automated!",
  },
  {
    id: "G05",
    title: "Nurture Machine",
    description: "First 45-day quiz nurture sequence live and educating leads",
    icon: "🧠",
    stepsRequired: ["CF02-first-quiz-nurture"],
    reward: "Your top quiz is now nurturing leads with an 11-email, 45-day sequence!",
  },
  {
    id: "G06",
    title: "Email Engine Complete",
    description: "All flows built, lifecycle management active, optimization underway",
    icon: "🚀",
    stepsRequired: ALL_STEPS.map((s) => s.id),
    reward: "Your complete email marketing engine is fully operational!",
  },
];

function GoalCard({ goal, completedIds }: { goal: Goal; completedIds: Set<string> }) {
  const completedCount = goal.stepsRequired.filter((id) => completedIds.has(id)).length;
  const totalCount = goal.stepsRequired.length;
  const isComplete = completedCount === totalCount;
  const percentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div
      className={`border rounded-lg p-4 transition-all ${
        isComplete
          ? "bg-green-50 border-green-200 ring-1 ring-green-200"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className={`text-2xl ${isComplete ? "" : "grayscale opacity-60"}`}>{goal.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`text-sm font-bold ${isComplete ? "text-green-800" : "text-gray-800"}`}>
              {goal.title}
            </h3>
            {isComplete && (
              <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{goal.description}</p>
          {!isComplete && (
            <div className="mt-2">
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-1.5 rounded-full bg-green-400 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">{completedCount}/{totalCount} steps</p>
            </div>
          )}
          {isComplete && (
            <p className="text-xs text-green-600 mt-1 font-medium">{goal.reward}</p>
          )}
        </div>
      </div>
    </div>
  );
}

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
  const [showGoals, setShowGoals] = useState(true);
  const [showExplainer, setShowExplainer] = useState(true);
  const [newMilestone, setNewMilestone] = useState<Milestone | null>(null);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setCompletedIds(loadCompleted());
    setShowExplainer(!loadExplainerDismissed());
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

  const dismissExplainer = useCallback(() => {
    setShowExplainer(false);
    localStorage.setItem(EXPLAINER_DISMISSED_KEY, "true");
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Onboarding Education Center
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Step-by-step guide to building your complete email marketing system in Klaviyo
            </p>
          </div>
          {!showExplainer && (
            <button
              onClick={() => setShowExplainer(true)}
              className="text-xs text-gray-400 hover:text-green-600 transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Show system guide
            </button>
          )}
        </div>
      </div>

      {/* System Explainer */}
      {showExplainer && <SystemExplainer onDismiss={dismissExplainer} />}

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
          <div className="flex items-center gap-3">
            <Link
              href="/kanban"
              className="text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
              </svg>
              Kanban Board
            </Link>
            <span className="text-2xl font-bold text-green-700">{progress.percentage}%</span>
          </div>
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

      {/* Goals Section */}
      <div className="mb-6">
        <button
          onClick={() => setShowGoals(!showGoals)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          Goals ({GOALS.filter((g) => g.stepsRequired.every((id) => completedIds.has(id))).length}/{GOALS.length})
          <svg
            className={`w-4 h-4 transition-transform ${showGoals ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showGoals && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GOALS.map((goal) => (
              <GoalCard key={goal.id} goal={goal} completedIds={completedIds} />
            ))}
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
