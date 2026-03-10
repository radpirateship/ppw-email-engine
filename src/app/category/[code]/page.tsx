"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { CATEGORIES } from "@/framework/categories";
import { ALL_FLOWS, type FlowDefinition } from "@/framework/flows";
import { ALL_LISTS } from "@/framework/lists";
import { ALL_SEGMENTS } from "@/framework/segments";
import { getContentForCategory, NURTURE_EMAIL_POSITIONS } from "@/framework/content-map";
import { ALL_TAGS } from "@/framework/tags";
import {
  LIVE_FLOWS,
  LIVE_LISTS,
  LIVE_SEGMENTS,
  QUIZ_METRICS,
  KLAVIYO_SNAPSHOT,
} from "@/framework/klaviyo-state";
import {
  computeCategoryCompletion,
  type CategoryCompletion,
} from "@/framework/completion";

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
function statusBadge(status: string): string {
  switch (status) {
    case "live": return "bg-green-100 text-green-700";
    case "draft": return "bg-yellow-100 text-yellow-700";
    case "built": return "bg-blue-100 text-blue-700";
    default: return "bg-gray-100 text-gray-500";
  }
}

function ScoreCard({ label, score, detail }: { label: string; score: number; detail: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-3xl font-bold ${scoreColor(score)}`}>{score}%</div>
      <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
        <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{ width: `${score}%` }} />
      </div>
      <div className="text-xs text-gray-400 mt-1">{detail}</div>
    </div>
  );
}
function FlowSection({ categoryCode, completion }: { categoryCode: string; completion: CategoryCompletion }) {
  const frameworkFlows = ALL_FLOWS.filter((f) => f.id.includes(`-${categoryCode}-`) || f.id.startsWith("F-ALL-"));
  const liveFlows = LIVE_FLOWS.filter((f) => f.categoryCode === categoryCode);
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Flow Architecture</h3>
        <span className={`text-xs font-bold ${scoreColor(completion.flows.score)}`}>{completion.flows.score}% coverage</span>
      </div>
      <div className="p-4">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Core Flow Types</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {completion.flows.details.map((f) => (
            <div key={f.type} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
              {f.hasLive ? (
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">&#10003;</span>
              ) : f.hasDraft ? (
                <span className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-xs">&#9679;</span>
              ) : (
                <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs">&#8722;</span>
              )}
              <div className="flex-1 min-w-0">
                <div className={`text-sm capitalize font-medium ${f.hasLive ? "text-gray-900" : f.hasDraft ? "text-yellow-700" : "text-gray-400"}`}>{f.type.replace(/-/g, " ")}</div>
                {f.klaviyoName && <div className="text-[10px] text-gray-500 truncate">{f.klaviyoName}</div>}
              </div>
              {f.klaviyoStatus && <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusBadge(f.klaviyoStatus)}`}>{f.klaviyoStatus}</span>}
            </div>
          ))}
        </div>
      </div>
      {liveFlows.length > 0 && (
        <div className="px-4 pb-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">All Klaviyo Flows ({liveFlows.length})</div>
          <div className="space-y-1">
            {liveFlows.map((f) => (
              <div key={f.name} className="flex items-center justify-between text-xs px-2 py-1.5 bg-gray-50 rounded">
                <span className="text-gray-700 truncate flex-1">{f.name}</span>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-gray-400 capitalize">{f.flowType}</span>
                  <span className={`px-1.5 py-0.5 rounded-full font-medium ${statusBadge(f.status)}`}>{f.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="px-4 pb-4">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Framework Planned Flows ({frameworkFlows.length})</div>
        <div className="space-y-1">
          {frameworkFlows.map((f) => (
            <div key={f.id} className="flex items-center justify-between text-xs px-2 py-1.5 bg-gray-50 rounded">
              <div className="flex-1 min-w-0">
                <span className="text-gray-700 font-medium">{f.name}</span>
                <span className="text-gray-400 ml-2">{f.emailCount} emails</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="text-gray-400 capitalize">{f.category}</span>
                <span className={`px-1.5 py-0.5 rounded-full font-medium ${statusBadge(f.status)}`}>{f.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function ListsSection({ categoryCode, completion }: { categoryCode: string; completion: CategoryCompletion }) {
  const liveLists = LIVE_LISTS.filter((l) => l.categoryCode === categoryCode);
  const frameworkLists = ALL_LISTS.filter((l) => l.id.includes(`-${categoryCode}-`) || l.id.startsWith("L-ALL-"));
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Lists</h3>
        <span className={`text-xs font-bold ${scoreColor(completion.lists.score)}`}>{completion.lists.score}%</span>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${completion.lists.hasEmail ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>{completion.lists.hasEmail ? "\u2713" : "\u2212"}</span>
            <span className="text-sm text-gray-700">Email List</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${completion.lists.hasSms ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>{completion.lists.hasSms ? "\u2713" : "\u2212"}</span>
            <span className="text-sm text-gray-700">SMS List</span>
          </div>
        </div>
        {liveLists.length > 0 && (
          <>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">In Klaviyo ({liveLists.length})</div>
            <div className="space-y-1 mb-4">
              {liveLists.map((l) => (
                <div key={l.name} className="flex items-center justify-between text-xs px-2 py-1.5 bg-gray-50 rounded">
                  <span className="text-gray-700 truncate">{l.name}</span>
                  <span className="text-gray-400 capitalize">{l.listType}</span>
                </div>
              ))}
            </div>
          </>
        )}
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Framework Planned ({frameworkLists.length})</div>
        <div className="space-y-1">
          {frameworkLists.map((l) => (
            <div key={l.id} className="flex items-center justify-between text-xs px-2 py-1.5 bg-gray-50 rounded">
              <span className="text-gray-700">{l.name}</span>
              <span className="text-gray-400">{l.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContentSection({ categoryCode, completion }: { categoryCode: string; completion: CategoryCompletion }) {
  const content = getContentForCategory(categoryCode);
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Content Map</h3>
        <span className={`text-xs font-bold ${scoreColor(completion.content.score)}`}>{completion.content.score}%</span>
      </div>
      <div className="p-4">
        {content ? (
          <>
            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-1">Pillar Content</div>
              <div className="text-sm font-semibold text-gray-900">{content.pillarContent}</div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-900">{content.articleCount}</div>
                <div className="text-xs text-gray-500">articles mapped</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-900">50</div>
                <div className="text-xs text-gray-500">target articles</div>
              </div>
            </div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Content Areas</div>
            <div className="space-y-1">
              {content.contentAreas.map((area, i) => (
                <div key={i} className="text-xs text-gray-600 px-2 py-1.5 bg-gray-50 rounded">{area}</div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-sm text-gray-400 py-4 text-center">No content mapped yet for this category.</div>
        )}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">45-Day Nurture Email Positions</div>
          <div className="space-y-1">
            {NURTURE_EMAIL_POSITIONS.map((pos) => (
              <div key={pos.position} className="flex items-center gap-2 text-xs px-2 py-1.5 bg-gray-50 rounded">
                <span className="font-mono font-bold text-green-700 w-8">{pos.position}</span>
                <span className="text-gray-400 w-12">Day {pos.day}</span>
                <span className="text-gray-600 flex-1">{pos.purpose}</span>
                <span className="text-gray-400 capitalize text-[10px]">{pos.contentType.replace(/-/g, " ")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
function ExtrasSection({ categoryCode, completion }: { categoryCode: string; completion: CategoryCompletion }) {
  const category = CATEGORIES[categoryCode];
  const quizMetric = QUIZ_METRICS.find((q) => q.categoryCode === categoryCode);
  const categorySegments = ALL_SEGMENTS.filter((s) => s.id.includes(`-${categoryCode}-`) || s.group === "interest");
  const liveSegments = LIVE_SEGMENTS.filter((s) => s.categoryCode === categoryCode);
  const categoryTags = ALL_TAGS.filter((t) => t.slug === category?.tagSlug || t.namespace === "cat");
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Quiz, Segments & Tags</h3>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Product Quiz</div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${completion.quiz.hasQuiz ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>{completion.quiz.hasQuiz ? "\u2713" : "\u2212"}</span>
            <div>
              <div className="text-sm text-gray-700">{completion.quiz.hasQuiz ? "Active" : "Not configured"}</div>
              {completion.quiz.quizName && <div className="text-[10px] text-gray-500">{completion.quiz.quizName}</div>}
            </div>
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Segments</div>
          {liveSegments.length > 0 && (
            <div className="mb-2">
              <div className="text-[10px] text-gray-400 mb-1">Live in Klaviyo</div>
              {liveSegments.map((s) => (
                <div key={s.name} className="text-xs text-gray-600 px-2 py-1 bg-green-50 rounded mb-1">{s.name}</div>
              ))}
            </div>
          )}
          <div className="text-[10px] text-gray-400 mb-1">Framework Planned</div>
          <div className="space-y-1">
            {categorySegments.slice(0, 6).map((s) => (
              <div key={s.id} className="text-xs text-gray-500 px-2 py-1 bg-gray-50 rounded">{s.name}</div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Related Tags</div>
          <div className="flex flex-wrap gap-1.5">
            {categoryTags.slice(0, 10).map((t) => (
              <span key={t.fullTag} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{t.fullTag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CategoryDetailPage() {
  const params = useParams();
  const code = (params.code as string)?.toUpperCase();
  const category = CATEGORIES[code];
  if (!category) {
    return (
      <div className="px-8 py-8 max-w-7xl">
        <div className="text-center py-20">
          <div className="text-4xl font-bold text-gray-300 mb-2">404</div>
          <div className="text-gray-500 mb-4">Category &ldquo;{code}&rdquo; not found.</div>
          <Link href="/completion" className="text-green-600 hover:text-green-700 text-sm font-medium">&larr; Back to Completion Tracker</Link>
        </div>
      </div>
    );
  }
  const completion = computeCategoryCompletion(code);
  return (
    <div className="px-8 py-8 max-w-7xl">
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
        <Link href="/" className="hover:text-gray-600">Dashboard</Link>
        <span>/</span>
        <Link href="/completion" className="hover:text-gray-600">Completion</Link>
        <span>/</span>
        <span className="text-gray-600 font-medium">{category.name}</span>
      </div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-sm font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded">{code}</span>
            <h1 className="text-2xl font-bold text-gray-900">{category.fullName}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${TIER_COLORS[completion.tier]}`}>{TIER_LABELS[completion.tier]}</span>
          </div>
          <p className="text-sm text-gray-500">{category.keyProducts.join(", ")} &middot; {category.articleCount} articles &middot; {category.hasQuiz ? "Quiz active" : "No quiz"}</p>
        </div>
        <div className="text-right">
          <div className={`text-4xl font-bold ${scoreColor(completion.overallScore)}`}>{completion.overallScore}%</div>
          <div className="text-xs text-gray-400">overall readiness</div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <ScoreCard label="Flows" score={completion.flows.score} detail={`${completion.flows.live} live / ${completion.flows.planned} planned`} />
        <ScoreCard label="Lists" score={completion.lists.score} detail={`${completion.lists.exists} exist / 2 planned`} />
        <ScoreCard label="Segments" score={completion.segments.score} detail={completion.segments.hasInterestSegment ? "Interest segment active" : "No interest segment yet"} />
        <ScoreCard label="Content" score={completion.content.score} detail={`${completion.content.articleCount} articles / 50 target`} />
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Overall Progress</span>
          <span className="text-xs text-gray-400">Flows 40% &middot; Lists 20% &middot; Segments 15% &middot; Content 25%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div className={`${TIER_BAR_COLORS[completion.tier]} h-3 rounded-full transition-all`} style={{ width: `${completion.overallScore}%` }} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <FlowSection categoryCode={code} completion={completion} />
        <ListsSection categoryCode={code} completion={completion} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ContentSection categoryCode={code} completion={completion} />
        <ExtrasSection categoryCode={code} completion={completion} />
      </div>
      {completion.tier !== "advanced" && (
        <div className="bg-blue-50 rounded-lg border border-blue-100 p-4">
          <div className="text-sm font-semibold text-blue-800 mb-1">Next Priority Action</div>
          <div className="text-sm text-blue-700">
            {!completion.lists.hasEmail
              ? `Create a category email list for ${category.name} in Klaviyo (L-${code}-Master-Email).`
              : completion.flows.live === 0
              ? `Build and launch the Welcome Series flow for ${category.name} (F-${code}-Welcome-Quiz).`
              : !completion.flows.details.find((f) => f.type === "browse-abandon")?.hasLive
              ? `Add a Browse Abandonment flow for ${category.name}.`
              : !completion.flows.details.find((f) => f.type === "cart-abandon")?.hasLive && !completion.flows.details.find((f) => f.type === "checkout-abandon")?.hasLive
              ? `Add Cart/Checkout Abandonment flows for ${category.name}.`
              : !completion.flows.details.find((f) => f.type === "post-purchase")?.hasLive
              ? `Build a Post-Purchase flow for ${category.name}.`
              : `Expand ${category.name} with category-specific segments and additional content.`}
          </div>
        </div>
      )}
      <div className="mt-8 text-xs text-gray-400 text-center">
        Data source: Klaviyo API snapshot from {new Date(KLAVIYO_SNAPSHOT.pulledAt).toLocaleDateString()} &middot; Refresh by updating klaviyo-state.ts
      </div>
    </div>
  );
    }
