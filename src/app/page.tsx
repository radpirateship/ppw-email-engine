// ============================================================================
// PPW Email Engine — Dashboard Home
// ============================================================================

import Link from "next/link";

const FEATURES = [
  {
    name: "Email Copy Generator",
    status: "active" as const,
    description: "Generate Klaviyo-ready email copy with dynamic tags and conditional blocks.",
    href: "/copy-generator",
  },
  {
    name: "Content-to-Email Pipeline",
    status: "active" as const,
    description: "Auto-classify content and map it to the 45-day nurture flow.",
    href: "/pipeline",
  },
  {
    name: "Flow Builder / Status Dashboard",
    status: "active" as const,
    description: "Track all flows by category, status, and email completion.",
    href: "/flow-builder",
  },
  {
    name: "Klaviyo Sync Layer",
    status: "active" as const,
    description: "Live Klaviyo state — flows, lists, segments, metrics, health score.",
    href: "/klaviyo",
  },
  {
    name: "Klaviyo Delta Dashboard",
    status: "active" as const,
    description: "Gap analysis — framework expectations vs live Klaviyo state, per-category readiness.",
    href: "/klaviyo/delta",
  },
  {
    name: "Framework Knowledge Base",
    status: "active" as const,
    description: "Naming conventions, tags, categories, and flow architecture.",
    href: "/framework",
  },
  {
    name: "Product Recommendation Engine",
    status: "active" as const,
    description: "Product-to-quiz mapping across categories and price tiers.",
    href: "/recommendations",
  },
  {
    name: "Template Manager",
    status: "active" as const,
    description: "Preview, validate, and push email templates to Klaviyo across all categories.",
    href: "/klaviyo/templates",
  },
  {
    name: "Campaign Calendar",
    status: "active" as const,
    description: "2026 campaign plan — newsletters, seasonal promos, flash sales, cross-sells, and winbacks.",
    href: "/campaigns",
  },
  {
    name: "Category Completion Tracker",
    status: "active" as const,
    description: "Bird's-eye view of email marketing readiness per category.",
    href: "/completion",
  },
];

const STATUS_STYLES = {
  planned: "bg-gray-100 text-gray-500",
  building: "bg-yellow-100 text-yellow-700",
  active: "bg-green-100 text-green-700",
  live: "bg-green-100 text-green-700",
};

export default function Home() {
  return (
    <div className="px-8 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Email marketing command center for Peak Primal Wellness
        </p>
        <div className="mt-3 flex gap-3 text-xs text-gray-400">
          <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-full">14 Categories</span>
          <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-full">1,405 Products</span>
          <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-full">48 Brands</span>
          <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-full">350+ Content Pieces</span>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {FEATURES.map((feature, i) => {
          const card = (
            <div
              className={`bg-white border border-gray-200 rounded-lg p-5 transition-all ${
                feature.status === "active"
                  ? "ring-2 ring-green-200 hover:shadow-md cursor-pointer"
                  : "hover:border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-900">
                  <span className="text-gray-400 mr-2 font-mono text-xs">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {feature.name}
                </h2>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[feature.status]}`}
                >
                  {feature.status}
                </span>
              </div>
              <p className="text-xs text-gray-500">{feature.description}</p>
            </div>
          );

          if ("href" in feature && feature.href) {
            return (
              <Link key={feature.name} href={feature.href}>
                {card}
              </Link>
            );
          }
          return <div key={feature.name}>{card}</div>;
        })}
      </div>

      {/* Footer */}
      <div className="mt-12 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
        PPW Email Engine v0.10.0 &middot; Phase 10: Campaign Calendar
      </div>
    </div>
  );
}
