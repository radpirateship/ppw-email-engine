"use client";

import { useState } from "react";
import {
  CATEGORIES,
  CATEGORY_CODES,
  PRICE_TIERS,
  TIER_IDS,
  ASSET_PREFIXES,
  ALL_FLOWS,
  FLOW_COUNTS,
  ALL_SEGMENTS,
  ALL_LISTS,
  ALL_TAGS,
  CATEGORY_TAGS,
  TIER_TAGS,
  SOURCE_TAGS,
  QUIZ_TAGS,
  ENGAGEMENT_TAGS,
  LIFECYCLE_TAGS,
  BRAND_TAGS,
  NURTURE_EMAIL_POSITIONS,
  CATEGORY_CONTENT,
} from "@/framework";

// ============================================================================
// Tab definitions
// ============================================================================
const TABS = [
  { id: "categories", label: "Categories", count: CATEGORY_CODES.length },
  { id: "flows", label: "Flows", count: ALL_FLOWS.length },
  { id: "segments", label: "Segments", count: ALL_SEGMENTS.length },
  { id: "lists", label: "Lists", count: ALL_LISTS.length },
  { id: "tags", label: "Tags", count: ALL_TAGS.length },
  { id: "tiers", label: "Price Tiers", count: TIER_IDS.length },
  { id: "naming", label: "Naming", count: Object.keys(ASSET_PREFIXES).length },
  { id: "content", label: "Content Map", count: NURTURE_EMAIL_POSITIONS.length },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ============================================================================
// Badge styles by flow category / segment group / list type
// ============================================================================
const FLOW_CAT_COLORS: Record<string, string> = {
  entry: "bg-blue-100 text-blue-700",
  engagement: "bg-amber-100 text-amber-700",
  "post-purchase": "bg-purple-100 text-purple-700",
  lifecycle: "bg-rose-100 text-rose-700",
};

const SEGMENT_GROUP_COLORS: Record<string, string> = {
  hot: "bg-red-100 text-red-700",
  warm: "bg-amber-100 text-amber-700",
  customer: "bg-green-100 text-green-700",
  interest: "bg-blue-100 text-blue-700",
  tier: "bg-purple-100 text-purple-700",
};

const LIST_TYPE_COLORS: Record<string, string> = {
  master: "bg-green-100 text-green-700",
  category: "bg-blue-100 text-blue-700",
  quiz: "bg-amber-100 text-amber-700",
  exclusion: "bg-red-100 text-red-700",
};

const TAG_NS_COLORS: Record<string, string> = {
  cat: "bg-blue-100 text-blue-700",
  tier: "bg-purple-100 text-purple-700",
  source: "bg-amber-100 text-amber-700",
  quiz: "bg-teal-100 text-teal-700",
  engage: "bg-orange-100 text-orange-700",
  stage: "bg-rose-100 text-rose-700",
  brand: "bg-gray-100 text-gray-700",
};

const FLOW_STATUS_COLORS: Record<string, string> = {
  planned: "bg-gray-100 text-gray-500",
  draft: "bg-yellow-100 text-yellow-700",
  built: "bg-blue-100 text-blue-700",
  live: "bg-green-100 text-green-700",
};

// ============================================================================
// Tab Content Panels
// ============================================================================

function CategoriesPanel() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {CATEGORY_CODES.map((code) => {
        const cat = CATEGORIES[code];
        return (
          <div key={code} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-green-50 text-green-700 text-xs font-bold">
                  {code}
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{cat.fullName}</h3>
                  <p className="text-xs text-gray-400">Tag: cat:{cat.tagSlug}</p>
                </div>
              </div>
              {cat.hasQuiz && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                  Quiz
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span>{cat.articleCount} articles</span>
              <span className="text-gray-300">|</span>
              <span>{cat.keyProducts.join(", ")}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FlowsPanel() {
  const categories: Array<{ key: string; label: string }> = [
    { key: "entry", label: "Entry Flows" },
    { key: "engagement", label: "Engagement Flows" },
    { key: "post-purchase", label: "Post-Purchase Flows" },
    { key: "lifecycle", label: "Lifecycle Flows" },
  ];

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="flex gap-3 flex-wrap">
        {categories.map((c) => (
          <span key={c.key} className={`text-xs px-3 py-1.5 rounded-full font-medium ${FLOW_CAT_COLORS[c.key]}`}>
            {c.label}: {FLOW_COUNTS[c.key as keyof typeof FLOW_COUNTS]}
          </span>
        ))}
      </div>

      {/* Flow table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trigger</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Emails</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tiered</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ALL_FLOWS.map((flow) => (
              <tr key={flow.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{flow.id}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{flow.name}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${FLOW_CAT_COLORS[flow.category]}`}>
                    {flow.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate">{flow.trigger}</td>
                <td className="px-4 py-3 text-center font-semibold text-gray-700">{flow.emailCount}</td>
                <td className="px-4 py-3 text-center">
                  {flow.tieredByPrice ? (
                    <span className="text-green-600 text-xs font-medium">Yes</span>
                  ) : (
                    <span className="text-gray-300 text-xs">â</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${FLOW_STATUS_COLORS[flow.status]}`}>
                    {flow.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SegmentsPanel() {
  const groups: Array<{ key: string; label: string }> = [
    { key: "hot", label: "Hot Leads" },
    { key: "warm", label: "Warm Leads" },
    { key: "customer", label: "Customers" },
    { key: "interest", label: "Category Interest" },
    { key: "tier", label: "Price Tier" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-3 flex-wrap">
        {groups.map((g) => (
          <span key={g.key} className={`text-xs px-3 py-1.5 rounded-full font-medium ${SEGMENT_GROUP_COLORS[g.key]}`}>
            {g.label}: {ALL_SEGMENTS.filter((s) => s.group === g.key).length}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ALL_SEGMENTS.map((seg) => (
          <div key={seg.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{seg.name}</h3>
                <p className="font-mono text-[10px] text-gray-400 mt-0.5">{seg.id}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${SEGMENT_GROUP_COLORS[seg.group]}`}>
                {seg.group}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-2">{seg.description}</p>
            <div className="flex flex-wrap gap-1">
              {seg.criteria.map((c, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 bg-gray-50 text-gray-600 rounded border border-gray-100">
                  {c}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ListsPanel() {
  const types: Array<{ key: string; label: string }> = [
    { key: "master", label: "Master" },
    { key: "category", label: "Category" },
    { key: "quiz", label: "Quiz" },
    { key: "exclusion", label: "Exclusion" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-3 flex-wrap">
        {types.map((t) => (
          <span key={t.key} className={`text-xs px-3 py-1.5 rounded-full font-medium ${LIST_TYPE_COLORS[t.key]}`}>
            {t.label}: {ALL_LISTS.filter((l) => l.type === t.key).length}
          </span>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Entry Criteria</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ALL_LISTS.map((list) => (
              <tr key={list.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{list.id}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{list.name}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LIST_TYPE_COLORS[list.type]}`}>
                    {list.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{list.entryCriteria}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TagsPanel() {
  const namespaces = [
    { key: "cat", label: "Category", tags: CATEGORY_TAGS },
    { key: "tier", label: "Price Tier", tags: TIER_TAGS },
    { key: "source", label: "Source", tags: SOURCE_TAGS },
    { key: "quiz", label: "Quiz", tags: QUIZ_TAGS },
    { key: "engage", label: "Engagement", tags: ENGAGEMENT_TAGS },
    { key: "stage", label: "Lifecycle", tags: LIFECYCLE_TAGS },
    { key: "brand", label: "Brand", tags: BRAND_TAGS },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-3 flex-wrap">
        {namespaces.map((ns) => (
          <span key={ns.key} className={`text-xs px-3 py-1.5 rounded-full font-medium ${TAG_NS_COLORS[ns.key]}`}>
            {ns.label}: {ns.tags.length}
          </span>
        ))}
      </div>

      {namespaces.map((ns) => (
        <div key={ns.key}>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">{ns.label} Tags</h3>
          <div className="flex flex-wrap gap-2">
            {ns.tags.map((tag) => (
              <div
                key={tag.fullTag}
                className={`text-xs px-3 py-1.5 rounded-lg border ${TAG_NS_COLORS[ns.key]} border-opacity-30`}
                title={tag.description}
              >
                <span className="font-mono font-medium">{tag.fullTag}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TiersPanel() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {TIER_IDS.map((id) => {
        const tier = PRICE_TIERS[id];
        const barWidth = Math.round((tier.productCount / 600) * 100);
        return (
          <div key={id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900">{tier.name}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-mono font-medium">
                {tier.tag}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Price Range</span>
                <span className="font-medium text-gray-900">
                  ${tier.minPrice.toLocaleString()}
                  {tier.maxPrice ? ` â $${tier.maxPrice.toLocaleString()}` : "+"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Products</span>
                <span className="font-medium text-gray-900">{tier.productCount}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${barWidth}%` }} />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email Touches</span>
                <span className="font-medium text-gray-900">{tier.emailTouchCount}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2 italic">{tier.emailStrategy}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function NamingPanel() {
  const types = Object.values(ASSET_PREFIXES);
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Every Klaviyo asset follows a consistent naming pattern so you can instantly identify what something is and where it belongs.
      </p>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Prefix</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pattern</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Example</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {types.map((t) => (
              <tr key={t.type} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900 capitalize">{t.type}</td>
                <td className="px-4 py-3">
                  <span className="font-mono font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">{t.prefix}</span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{t.pattern}</td>
                <td className="px-4 py-3 font-mono text-xs text-blue-600">{t.example}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ContentMapPanel() {
  return (
    <div className="space-y-6">
      {/* 45-day timeline */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">45-Day Nurture Flow Timeline</h3>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Position</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Day</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Content Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {NURTURE_EMAIL_POSITIONS.map((pos) => (
                <tr key={pos.position} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">{pos.position}</span>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-gray-700">Day {pos.day}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                      {pos.contentType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{pos.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category content inventory */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Content Inventory by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CATEGORY_CONTENT.map((cat) => {
            const barWidth = Math.round((cat.articleCount / 80) * 100);
            return (
              <div key={cat.categoryCode} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                      {cat.categoryCode}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{cat.pillarContent}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-700">{cat.articleCount}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${barWidth}%` }} />
                </div>
                <div className="flex flex-wrap gap-1">
                  {cat.contentAreas.map((area, i) => (
                    <span key={i} className="text-[10px] text-gray-500">{area}{i < cat.contentAreas.length - 1 ? " Â· " : ""}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================
export default function FrameworkPage() {
  const [activeTab, setActiveTab] = useState<TabId>("categories");

  const renderPanel = () => {
    switch (activeTab) {
      case "categories": return <CategoriesPanel />;
      case "flows": return <FlowsPanel />;
      case "segments": return <SegmentsPanel />;
      case "lists": return <ListsPanel />;
      case "tags": return <TagsPanel />;
      case "tiers": return <TiersPanel />;
      case "naming": return <NamingPanel />;
      case "content": return <ContentMapPanel />;
    }
  };

  return (
    <div className="px-8 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Framework Knowledge Base</h1>
        <p className="text-sm text-gray-500 mt-1">
          Browse naming conventions, tags, categories, flows, segments, lists, price tiers, and the content map.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-1 -mb-px overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-green-600 text-green-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Panel */}
      {renderPanel()}
    </div>
  );
}
